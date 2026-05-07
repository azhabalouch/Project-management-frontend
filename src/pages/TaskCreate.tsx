import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { usePost } from '../hooks/usePost';
import { normalizeTask, useTaskContext } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { useTaskFormOptions } from '../hooks/useTaskFormOptions';
import { TASK_URLS } from '../apis';

import Layout from '../components/Layout';
import Dropdown from '../components/Dropdown';
import { CloseIcon } from '../components/Icons';
import { SELECT_BG_STYLE, getProgressColor, getProgressBg } from '../utils/taskHelpers';

import type { HandleSubmitEvent, Task, Subtask } from '../components/type/typesInterface';

/**
 * TaskCreate Component
 * 
 * Renders a form for users to create a new task. Includes inputs for general info,
 * classification (status, priority, project, tags), timeline, progress, and a subtask checklist.
 * 
 * @returns {JSX.Element} The task creation view.
 */
export default function TaskCreate() {
  const navigate = useNavigate();
  const { execute, loading, error } = usePost(TASK_URLS.create);
  const { addTask, refreshTasks } = useTaskContext();
  const { addToast } = useToast();
  
  // Custom hook to handle dropdown list generation
  const { projectOptions, existingTags } = useTaskFormOptions();

  // --- Form State ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [progress, setProgress] = useState(0);
  const [project, setProject] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const progressColor = getProgressColor(progress);
  const progressBg = getProgressBg(progress);

  // --- Subtask State ---
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // --- Handlers ---

  /**
   * Submits the form data to the API to create a new task.
   * Redirects to the dashboard on success.
   * 
   * @param {HandleSubmitEvent} e - The form submission event.
   */
  const handleSubmit = async (e: HandleSubmitEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: Partial<Task> = {
      title: title.trim(),
      description: description.trim(),
      status,
      isCompleted: false,
      dueDate: dueDate || undefined,
      progress,
    };

    if (priority) payload.priority = priority as 'high' | 'medium' | 'low' | 'skippable';
    if (project.trim()) payload.project = project.trim();
    if (tags.length > 0) payload.tags = tags;
    if (subtasks.length > 0) {
      payload.subtasks = subtasks.map(st => ({
        id: st.id,
        text: st.text, 
        completed: st.completed 
      }));
    }

    const createdTask = await execute(payload as Task);

    if (createdTask) {
      createdTask === true ? await refreshTasks() : addTask(normalizeTask(createdTask as Task));
      addToast('Task created successfully', 'success');
      navigate('/');
    }
  };

  /**
   * Adds a new subtask to the checklist if the input is not empty.
   */
  const handleAddSubtask = () => {
    if (newSubtaskText.trim()) {
      setSubtasks(prev => [...prev, { id: Date.now().toString(), text: newSubtaskText.trim(), completed: false }]);
      setNewSubtaskText('');
    }
  };

  /**
   * Toggles the completion status of a specific subtask.
   * 
   * @param {string} id - The ID of the subtask to toggle.
   */
  const handleToggleSubtask = (id: string) => {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  /**
   * Removes a subtask from the checklist.
   * 
   * @param {string} id - The ID of the subtask to remove.
   */
  const handleRemoveSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  return (
    <Layout>
      <section className='flex-1 px-4 py-6 md:px-16 md:py-8 overflow-y-auto flex flex-col gap-6'>
          
        {/* Breadcrumb Navigation */}
        <div className='flex items-center gap-2 mb-2 font-ui text-sm'>
          <button className='bg-none border-none text-brand-primary cursor-pointer hover:underline' onClick={() => navigate('/')}>Tasks</button>
          <span className='text-text-secondary'>/</span>
          <span className='text-text-secondary'>New Task</span>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 items-start'>
          {/* Main Form Section */}
          <div className='min-w-0'>
            <div className='bg-surface-nav border border-border rounded-lg p-4 md:p-8 shadow-card transition-shadow'>
              <div className='mb-7 pb-5 border-b border-border'>
                <h2 className='text-2xl font-semibold mb-1 text-text-primary'>Create New Task</h2>
                <p className='font-body text-sm text-text-secondary m-0'>Fill in the details to create a new task</p>
              </div>

              {error && <div className='bg-status-error-bg text-status-error-text px-4 py-3 rounded mb-4 font-ui text-sm' role='alert'>{error}</div>}

              <form onSubmit={handleSubmit} aria-label='Create task form' className='flex flex-col gap-0'>
                
                {/* General Block */}
                <div className='mb-7 pb-6 border-b border-border'>
                  <h4 className='font-ui text-xs font-bold uppercase tracking-wider text-text-secondary mb-4 opacity-80'>General</h4>

                  <div className='flex flex-col text-left mb-4'>
                    <label htmlFor='task-title' className='font-ui text-sm font-semibold text-text-primary mb-1.5 opacity-85'>Title <span className='text-accent-magenta'>*</span></label>
                    <input
                      name='task-title'
                      id='task-title'
                      type='text'
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder='Name your task'
                      required
                      className='bg-bg-input border border-border rounded px-3.5 py-2.5 font-body text-sm text-text-primary transition-all focus:outline-none focus:border-brand-primary focus:shadow-lg focus:shadow-brand-primary/20 focus:bg-bg-active'
                    />
                  </div>

                    <div className='flex flex-col text-left mb-0'>
                      <label htmlFor='task-description' className='font-ui text-sm font-semibold text-text-primary mb-1.5 opacity-85'>Description</label>
                      <textarea
                        name='task-description'
                        id='task-description'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder='Describe the task in detail'
                        rows={5}
                        className='bg-bg-input border border-border rounded px-3.5 py-2.5 font-body text-sm text-text-primary transition-all resize-vertical focus:outline-none focus:border-brand-primary focus:shadow-lg focus:shadow-brand-primary/20 focus:bg-bg-active'
                      />
                    </div>
                  </div>

                  {/* Classification Block */}
                  <div className='mb-7 pb-6 border-b border-border'>
                    <h4 className='font-ui text-xs font-bold uppercase tracking-wider text-text-secondary mb-4 opacity-80'>Classification</h4>

                    <div className='flex gap-4'>
                      <div className='flex-1 flex flex-col text-left mb-4'>
                        <label htmlFor='task-status' className='font-ui text-sm font-semibold text-text-primary mb-1.5 opacity-85'>Status</label>
                        <select 
                          id='task-status' 
                          value={status} 
                          onChange={(e) => setStatus(e.target.value)} 
                          className='bg-bg-input border border-border rounded px-3.5 py-2.5 font-body text-sm text-text-primary transition-all cursor-pointer appearance-none focus:outline-none focus:border-brand-primary focus:shadow-lg focus:shadow-brand-primary/20 focus:bg-bg-active' 
                          style={SELECT_BG_STYLE}
                        >
                          <option value='pending'>Pending</option>
                          <option value='in-progress'>In Progress</option>
                          <option value='bug'>Bug</option>
                          <option value='issue'>Issue</option>
                        </select>
                      </div>

                      <div className='flex-1 flex flex-col text-left mb-4'>
                        <label htmlFor='task-priority' className='font-ui text-sm font-semibold text-text-primary mb-1.5 opacity-85'>Priority</label>
                        <select 
                          id='task-priority' 
                          value={priority} 
                          onChange={(e) => setPriority(e.target.value)} 
                          className='bg-bg-input border border-border rounded px-3.5 py-2.5 font-body text-sm text-text-primary transition-all cursor-pointer appearance-none focus:outline-none focus:border-brand-primary focus:shadow-lg focus:shadow-brand-primary/20 focus:bg-bg-active' 
                          style={SELECT_BG_STYLE}
                        >
                          <option value=''>None</option>
                          <option value='high'>High</option>
                          <option value='medium'>Medium</option>
                          <option value='low'>Low</option>
                          <option value='skippable'>Skippable</option>
                        </select>
                      </div>
                    </div>

                    <div className='flex flex-col text-left mb-4'>
                      <label className='font-ui text-sm font-semibold text-text-primary mb-1.5 opacity-85'>Project</label>
                      <Dropdown
                        options={projectOptions}
                        value={project}
                        onChange={(v) => setProject(v as string)}
                        placeholder='Associate with a project'
                        id='task-project'
                        searchable
                      />
                    </div>

                    <div className='flex flex-col text-left mb-0'>
                      <label className='font-ui text-sm font-semibold text-text-primary mb-1.5 opacity-85'>Tags</label>
                      <Dropdown
                        options={existingTags}
                        value={tags}
                        onChange={(v) => setTags(v as string[])}
                        placeholder='Select or create tags'
                        multiple
                        searchable
                        creatable
                      />
                    </div>
                  </div>

                  {/* Timeline Block */}
                  <div className='mb-7 pb-6 border-b border-border'>
                    <h4 className='font-ui text-xs font-bold uppercase tracking-wider text-text-secondary mb-4 opacity-80'>Timeline</h4>
                    <div className='flex flex-col text-left mb-0'>
                      <label htmlFor='task-due-date' className='font-ui text-sm font-semibold text-text-primary mb-1.5 opacity-85'>Due Date</label>
                      <DatePicker
                        selected={dueDate}
                        onChange={(date: Date | null) => setDueDate(date)}
                        id='task-due-date'
                        name='task-due-date'
                        placeholderText='Select due date'
                        isClearable
                        className='w-full bg-bg-input border border-border rounded px-3.5 py-2.5 font-body text-sm text-text-primary box-border transition-all focus:outline-none focus:border-brand-primary focus:shadow-lg focus:shadow-brand-primary/20 focus:bg-bg-active'
                      />
                    </div>
                  </div>

                  {/* Progress Block */}
                  <div className='mb-7 pb-6 border-b border-border'>
                    <h4 className='font-ui text-xs font-bold uppercase tracking-wider text-text-secondary mb-4 opacity-80'>Progress</h4>
                    <div className='p-4 bg-bg-main-content border border-border rounded-lg'>
                      <div className='flex justify-between items-center mb-3'>
                        <span className='font-ui text-sm font-semibold text-text-secondary'>Completion</span>
                        <span className='font-heading text-xl font-bold' style={{ color: progressColor }}>{progress}%</span>
                      </div>
                      <input
                        type='range'
                        min='0'
                        max='100'
                        value={progress}
                        onChange={(e) => setProgress(Number(e.target.value))}
                        className='w-full cursor-pointer mb-3'
                        style={{ accentColor: 'var(--btn-primary-bg)' }}
                      />
                      <div className='w-full h-2 rounded overflow-hidden' style={{ backgroundColor: progressBg }}>
                        <div className='h-full rounded transition-all duration-300' style={{ width: `${progress}%`, backgroundColor: progressColor }} />
                      </div>
                    </div>
                  </div>

                  {/* Checklist Block */}
                  <div className='mb-7 pb-6 border-b border-border'>
                    <h4 className='font-ui text-xs font-bold uppercase tracking-wider text-text-secondary mb-4 opacity-80'>Checklist</h4>
                    
                    {subtasks.length > 0 && (
                      <ul className='list-none p-0 m-0 mb-3 flex flex-col gap-1.5'>
                        {subtasks.map(st => (
                          <li key={st.id} className={`flex items-center gap-2.5 px-3 py-2 rounded transition-colors ${st.completed ? 'bg-bg-active' : 'hover:bg-bg-active'}`}>
                            
                            <button
                              type='button'
                              className={`w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer transition-all flex-shrink-0 p-0 ${st.completed ? 'bg-brand-primary border-brand-primary' : 'border-border bg-surface-nav hover:border-brand-primary'}`}
                              onClick={() => handleToggleSubtask(st.id)}
                              aria-label={st.completed ? "Mark subtask incomplete" : "Mark subtask complete"}
                            >
                              {st.completed && (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                  <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </button>
                            
                            <span className={`flex-1 font-body text-sm ${st.completed ? 'line-through text-text-secondary opacity-70' : 'text-text-primary'}`}>
                              {st.text}
                            </span>
                            
                            <button 
                              type='button' 
                              className='w-6 h-6 border-none rounded flex items-center justify-center bg-transparent text-text-secondary cursor-pointer transition-all flex-shrink-0 p-0 opacity-0 hover:bg-status-error-bg hover:text-status-error-text group-hover:opacity-100' 
                              onClick={() => handleRemoveSubtask(st.id)}
                              aria-label="Remove subtask"
                            >
                              <CloseIcon size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    <div className='flex gap-2'>
                      <input
                        type='text'
                        value={newSubtaskText}
                        onChange={e => setNewSubtaskText(e.target.value)}
                        placeholder='Add a subtask...'
                        className='flex-1 bg-bg-input border border-border rounded px-3 py-2 font-body text-sm text-text-primary transition-all focus:outline-none focus:border-brand-primary focus:shadow-lg focus:shadow-brand-primary/20'
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubtask();
                          }
                        }}
                      />
                      <button
                        type='button'
                        className='btn-primary px-4 py-2 text-sm whitespace-nowrap'
                        disabled={!newSubtaskText.trim()}
                        onClick={handleAddSubtask}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className='flex gap-3 mt-6 pt-6 border-t border-border'>
                    <button type='submit' className='btn-primary min-w-[140px]' disabled={loading || !title.trim()}>
                      {loading ? 'Creating...' : 'Create Task'}
                    </button>
                    <button type='button' className='btn-secondary min-w-[100px]' onClick={() => navigate('/')}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Quick Tips Sidebar */}
            <div className='flex flex-col gap-4'>
              <div className='bg-surface-nav border border-border rounded-lg p-5 shadow-card'>
                <h4 className='text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4 pb-3 border-b border-border'>Quick Tips</h4>
                <ul className='list-none p-0 m-0 flex flex-col gap-2.5'>
                  <li className='font-body text-xs text-text-secondary pl-4 relative leading-relaxed before:content-[""] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-brand-primary before:opacity-60'>Use a clear, descriptive title</li>
                  <li className='font-body text-xs text-text-secondary pl-4 relative leading-relaxed before:content-[""] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-brand-primary before:opacity-60'>Set a realistic due date</li>
                  <li className='font-body text-xs text-text-secondary pl-4 relative leading-relaxed before:content-[""] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-brand-primary before:opacity-60'>Assign priority based on urgency</li>
                  <li className='font-body text-xs text-text-secondary pl-4 relative leading-relaxed before:content-[""] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-brand-primary before:opacity-60'>Use tags for easy filtering</li>
                  <li className='font-body text-xs text-text-secondary pl-4 relative leading-relaxed before:content-[""] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-brand-primary before:opacity-60'>Track progress with the slider</li>
                </ul>
              </div>
            </div>

          </div>
        </section>
    </Layout>
  );
}

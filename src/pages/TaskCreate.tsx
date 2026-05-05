import { useState, useMemo } from 'react'
import { usePost } from '../hooks/usePost'
import type { HandleSubmitEvent, Task, Subtask } from '../components/type/typesInterface';
import { DatePicker } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { normalizeTask, useTaskContext } from '../context/TaskContext';
import { useProjectContext } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { TASK_URLS } from '../apis';
import SideNavigation from '../components/SideNavigation';
import TopNavigation from '../components/TopNavigation';
import Dropdown from '../components/Dropdown';
import './style/TaskCreate.css';

export default function TaskCreate(){
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [progress, setProgress] = useState(0);
  const [project, setProject] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const isCompleted = false;
  const navigate = useNavigate();
  const { execute, loading, error } = usePost(TASK_URLS.create);
  const { tasks, addTask, refreshTasks } = useTaskContext();
  const { addToast } = useToast();

  const getProgressColor = (p: number): string => {
    if (p >= 90) return 'var(--pct-90-text)';
    if (p >= 75) return 'var(--pct-75-text)';
    if (p >= 50) return 'var(--pct-50-text)';
    if (p >= 35) return 'var(--pct-35-text)';
    if (p >= 10) return 'var(--pct-10-text)';
    return 'var(--pct-10-text)';
  };

  const getProgressBg = (p: number): string => {
    if (p >= 90) return 'var(--pct-90-bg)';
    if (p >= 75) return 'var(--pct-75-bg)';
    if (p >= 50) return 'var(--pct-50-bg)';
    if (p >= 35) return 'var(--pct-35-bg)';
    if (p >= 10) return 'var(--pct-10-bg)';
    return 'var(--pct-10-bg)';
  };

  const { projects } = useProjectContext();

  const projectOptions = useMemo(() => [
    { value: '', label: 'No project' },
    ...projects.map(p => ({ value: p.name, label: p.name })),
  ], [projects]);

  const existingTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach(t => t.tags?.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort().map(tag => ({ value: tag, label: tag }));
  }, [tasks]);

  const handleSubmit = async (e: HandleSubmitEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const payload: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim(),
      status,
      isCompleted,
      dueDate,
      progress,
    };

    if (priority) payload.priority = priority;
    if (project.trim()) payload.project = project.trim();
    if (tags.length > 0) payload.tags = tags;
    if (subtasks.length > 0) payload.subtasks = subtasks.map(st => ({ text: st.text, completed: st.completed }));

    const createdTask = await execute(payload as unknown as Task);

    if (createdTask) {
      if (createdTask === true) {
        await refreshTasks();
      } else if (typeof createdTask === 'object') {
        addTask(normalizeTask(createdTask));
      }
      addToast('Task created successfully', 'success');
      navigate('/');
    }
  }

  const progressColor = getProgressColor(progress);
  const progressBg = getProgressBg(progress);

  return(
    <div className='home-layout'>
      <SideNavigation />
      <main className='home-main'>
        <TopNavigation />
        <section className='home-content'>
          <div className='task-create-breadcrumb'>
            <button className='breadcrumb-link' onClick={() => navigate('/')}>Tasks</button>
            <span className='breadcrumb-separator'>/</span>
            <span className='breadcrumb-current'>New Task</span>
          </div>

          <div className='task-create-layout'>
            <div className='task-create-main'>
              <div className='task-create-card'>
                <div className='task-create-card-header'>
                  <h2>Create New Task</h2>
                  <p className='task-create-card-subtitle'>Fill in the details to create a new task</p>
                </div>

                {error && <div className='task-create-error'>{error}</div>}

                <form onSubmit={handleSubmit} aria-label='Create task form' className='task-create-form'>
                  <div className='task-create-section'>
                    <h4 className='task-create-section-title'>General</h4>

                    <div className='form-group'>
                      <label htmlFor='task-title'>Title <span className='form-required'>*</span></label>
                      <input
                        name='task-title'
                        id='task-title'
                        type='text'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder='Name your task'
                        required
                        className='task-create-input'
                      />
                    </div>

                    <div className='form-group'>
                      <label htmlFor='task-description'>Description</label>
                      <textarea
                        name='task-description'
                        id='task-description'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder='Describe the task in detail'
                        rows={5}
                        className='task-create-textarea'
                      />
                    </div>
                  </div>

                  <div className='task-create-section'>
                    <h4 className='task-create-section-title'>Classification</h4>

                    <div className='form-row'>
                      <div className='form-group'>
                        <label htmlFor='task-status'>Status</label>
                        <select id='task-status' value={status} onChange={(e) => setStatus(e.target.value)} className='task-create-select'>
                          <option value='pending'>Pending</option>
                          <option value='in-progress'>In Progress</option>
                          <option value='bug'>Bug</option>
                          <option value='issue'>Issue</option>
                        </select>
                      </div>

                      <div className='form-group'>
                        <label htmlFor='task-priority'>Priority</label>
                        <select id='task-priority' value={priority} onChange={(e) => setPriority(e.target.value)} className='task-create-select'>
                          <option value=''>None</option>
                          <option value='high'>High</option>
                          <option value='medium'>Medium</option>
                          <option value='low'>Low</option>
                          <option value='skippable'>Skippable</option>
                        </select>
                      </div>
                    </div>

                    <div className='form-group'>
                      <label>Project</label>
                      <Dropdown
                        options={projectOptions}
                        value={project}
                        onChange={(v) => setProject(v as string)}
                        placeholder='Associate with a project'
                        id='task-project'
                        searchable
                      />
                    </div>

                    <div className='form-group'>
                      <label>Tags</label>
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

                  <div className='task-create-section'>
                    <h4 className='task-create-section-title'>Timeline</h4>

                    <div className='form-group'>
                      <label htmlFor='task-due-date'>Due Date</label>
                      <DatePicker
                        selected={dueDate}
                        onChange={(date: Date | null) => setDueDate(date)}
                        id='task-due-date'
                        name='task-due-date'
                        placeholderText='Select due date'
                        isClearable
                        className='task-create-datepicker'
                      />
                    </div>
                  </div>

                  <div className='task-create-section'>
                    <h4 className='task-create-section-title'>Progress</h4>

                    <div className='task-create-progress-section'>
                      <div className='task-create-progress-header'>
                        <span className='task-create-progress-label'>Completion</span>
                        <span className='task-create-progress-value' style={{ color: progressColor }}>{progress}%</span>
                      </div>
                      <input
                        type='range'
                        min='0'
                        max='100'
                        value={progress}
                        onChange={(e) => setProgress(Number(e.target.value))}
                        className='task-create-progress-slider'
                      />
                      <div className='task-create-progress-bar-track' style={{ backgroundColor: progressBg }}>
                        <div className='task-create-progress-bar-fill' style={{ width: `${progress}%`, backgroundColor: progressColor }} />
                      </div>
                    </div>
                  </div>

                  <div className='task-create-section'>
                    <h4 className='task-create-section-title'>Checklist</h4>
                    {subtasks.length > 0 && (
                      <ul className='task-create-subtasks-list'>
                        {subtasks.map(st => (
                          <li key={st.id} className={`task-create-subtask-item ${st.completed ? 'task-create-subtask-item--completed' : ''}`}>
                            <button
                              type='button'
                              className={`task-create-subtask-checkbox ${st.completed ? 'task-create-subtask-checkbox--checked' : ''}`}
                              onClick={() => setSubtasks(prev => prev.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s))}
                            >
                              {st.completed && (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                  <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </button>
                            <span className='task-create-subtask-text'>{st.text}</span>
                            <button type='button' className='task-create-subtask-delete' onClick={() => setSubtasks(prev => prev.filter(s => s.id !== st.id))}>
                              <img src="/close.svg" alt="" width={14} height={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className='task-create-subtask-add'>
                      <input
                        type='text'
                        value={newSubtaskText}
                        onChange={e => setNewSubtaskText(e.target.value)}
                        placeholder='Add a subtask...'
                        className='task-create-subtask-input'
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newSubtaskText.trim()) {
                              setSubtasks(prev => [...prev, { id: Date.now().toString(), text: newSubtaskText.trim(), completed: false }]);
                              setNewSubtaskText('');
                            }
                          }
                        }}
                      />
                      <button
                        type='button'
                        className='btn-primary task-create-subtask-add-btn'
                        disabled={!newSubtaskText.trim()}
                        onClick={() => {
                          if (newSubtaskText.trim()) {
                            setSubtasks(prev => [...prev, { id: Date.now().toString(), text: newSubtaskText.trim(), completed: false }]);
                            setNewSubtaskText('');
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className='task-create-actions'>
                    <button type='submit' className='btn-primary' disabled={loading || !title.trim()}>
                      {loading ? 'Creating...' : 'Create Task'}
                    </button>
                    <button type='button' className='btn-secondary' onClick={() => navigate('/')}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className='task-create-sidebar'>
              <div className='task-create-sidebar-card'>
                <h4>Quick Tips</h4>
                <ul className='task-create-tips'>
                  <li>Use a clear, descriptive title</li>
                  <li>Set a realistic due date</li>
                  <li>Assign priority based on urgency</li>
                  <li>Use tags for easy filtering</li>
                  <li>Track progress with the slider</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
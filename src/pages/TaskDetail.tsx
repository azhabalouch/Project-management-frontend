import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DatePicker } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTaskContext } from '../context/TaskContext';
import { useProjectContext } from '../context/ProjectContext';
import { usePatch } from '../hooks/usePatch';
import { usePost } from '../hooks/usePost';
import { useDelete } from '../hooks/useDelete';
import { useToast } from '../context/ToastContext';
import { TASK_URLS } from '../apis';
import type { Task, Subtask } from '../components/type/typesInterface';
import SideNavigation from '../components/SideNavigation';
import TopNavigation from '../components/TopNavigation';
import Dropdown from '../components/Dropdown';
import { ClockIcon, EditIcon, MoreHorizontalIcon, CloseIcon } from '../components/Icons';

const getPriorityColor = (priority?: string): { bg: string; text: string } => {
  switch (priority) {
    case 'high': return { bg: 'var(--priority-high-bg)', text: 'var(--priority-high-text)' };
    case 'medium': return { bg: 'var(--priority-medium-bg)', text: 'var(--priority-medium-text)' };
    case 'low': return { bg: 'var(--priority-low-bg)', text: 'var(--priority-low-text)' };
    case 'skippable': return { bg: 'var(--priority-skippable-bg)', text: 'var(--priority-skippable-text)' };
    default: return { bg: 'var(--priority-low-bg)', text: 'var(--priority-low-text)' };
  }
};

const getStatusColor = (status: string): { bg: string; text: string } => {
  const s = status.toLowerCase();
  switch (s) {
    case 'pending': return { bg: 'var(--status-pending-bg)', text: 'var(--status-pending-text)' };
    case 'inprogress':
    case 'in-progress': return { bg: 'var(--status-inprogress-bg)', text: 'var(--status-inprogress-text)' };
    case 'notworking':
    case 'not-working': return { bg: 'var(--status-notworking-bg)', text: 'var(--status-notworking-text)' };
    case 'issue': return { bg: 'var(--status-issue-bg)', text: 'var(--status-issue-text)' };
    case 'bug': return { bg: 'var(--status-bug-bg)', text: 'var(--status-bug-text)' };
    case 'error': return { bg: 'var(--status-error-bg)', text: 'var(--status-error-text)' };
    case 'skipped': return { bg: 'var(--status-skipped-bg)', text: 'var(--status-skipped-text)' };
    default: return { bg: 'var(--status-pending-bg)', text: 'var(--status-pending-text)' };
  }
};

const getProgressColor = (progress: number): string => {
  if (progress >= 90) return 'var(--pct-90-text)';
  if (progress >= 75) return 'var(--pct-75-text)';
  if (progress >= 50) return 'var(--pct-50-text)';
  if (progress >= 35) return 'var(--pct-35-text)';
  if (progress >= 10) return 'var(--pct-10-text)';
  return 'var(--pct-10-text)';
};

const getProgressBg = (progress: number): string => {
  if (progress >= 90) return 'var(--pct-90-bg)';
  if (progress >= 75) return 'var(--pct-75-bg)';
  if (progress >= 50) return 'var(--pct-50-bg)';
  if (progress >= 35) return 'var(--pct-35-bg)';
  if (progress >= 10) return 'var(--pct-10-bg)';
  return 'var(--pct-10-bg)';
};

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, updateTask, removeTask } = useTaskContext();
  const { projects } = useProjectContext();
  const { addToast } = useToast();
  const task = tasks.find(t => t.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [progress, setProgress] = useState(0);
  const [project, setProject] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  const { execute: patchTask, loading: patching, error: patchError } = usePatch(TASK_URLS.patch);
  const { remove: deleteTask, loading: deleting, error: deleteError } = useDelete(TASK_URLS.delete);
  const { execute: addSubtaskReq } = usePost(TASK_URLS.subtaskAdd);
  const { execute: updateSubtaskReq } = usePatch(TASK_URLS.subtaskUpdate);
  const { remove: deleteSubtaskReq } = useDelete(TASK_URLS.subtaskDelete);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority ?? '');
      setIsCompleted(task.isCompleted);
      setDueDate(task.dueDate);
      setProgress(task.progress ?? 0);
      setProject(task.project ?? '');
      setTags(task.tags ?? []);
      setSubtasks(task.subtasks ?? []);
    }
  }, [task]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!actionMenuRef.current) return;
      if (event.target instanceof Node && !actionMenuRef.current.contains(event.target)) {
        setShowActionMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!task) {
    return (
      <div className='flex bg-surface-main w-full h-screen overflow-hidden'>
        <SideNavigation />
        <main className='flex-1 flex flex-col relative'>
          <TopNavigation />
          <section className='flex-1 px-4 py-6 md:px-16 md:py-8 overflow-y-auto flex flex-col gap-6'>
            <div className='flex flex-col items-center justify-center py-16 gap-4 text-center'>
              <h2 className='text-2xl font-semibold text-text-primary m-0'>Task not found</h2>
              <p className='font-body text-base text-text-secondary m-0'>The task you're looking for doesn't exist or has been deleted.</p>
              <button className='btn-primary' onClick={() => navigate('/')}>Back to Tasks</button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const priorityColors = getPriorityColor(task.priority);
  const statusColors = getStatusColor(task.status);
  const progressColor = getProgressColor(progress);
  const progressBg = getProgressBg(progress);

  const projectOptions = useMemo(() => [
    { value: '', label: 'No project' },
    ...projects.map(p => ({ value: p.name, label: p.name })),
  ], [projects]);

  const existingTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach(t => t.tags?.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort().map(tag => ({ value: tag, label: tag }));
  }, [tasks]);

  const handleSave = async () => {
    const payload: Record<string, unknown> = { taskId: task.id };

    if (title !== task.title) payload.title = title;
    if (description !== task.description) payload.description = description;
    if (status !== task.status) payload.status = status;
    if (isCompleted !== task.isCompleted) payload.isCompleted = isCompleted;
    if (priority !== (task.priority ?? '')) payload.priority = priority || null;
    if (progress !== (task.progress ?? 0)) payload.progress = progress;
    if (project !== (task.project ?? '')) payload.project = project || null;

    const currentTags = task.tags ?? [];
    const tagsChanged = tags.length !== currentTags.length || tags.some((t, i) => t !== currentTags[i]);
    if (tagsChanged) payload.tags = tags;

    const currentDueDateTime = task.dueDate ? new Date(task.dueDate).getTime() : null;
    const nextDueDateTime = dueDate ? dueDate.getTime() : null;
    if (currentDueDateTime !== nextDueDateTime) payload.dueDate = dueDate;

    if (Object.keys(payload).length === 1) {
      setIsEditing(false);
      return;
    }

    const result = await patchTask(payload);

    if (result) {
      updateTask(task.id, {
        ...task,
        title,
        description,
        status,
        isCompleted,
        dueDate,
        priority: (priority || undefined) as Task['priority'],
        progress,
        project: project || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      addToast('Task updated successfully', 'success');
      setIsEditing(false);
    }
  };

  const handleComplete = async () => {
    const result = await patchTask({ taskId: task.id, isCompleted: true });
    if (result) {
      updateTask(task.id, { ...task, isCompleted: true });
      addToast('Task marked as complete', 'success');
      navigate('/');
    }
  };

  const handleDelete = async () => {
    const deleted = await deleteTask({ id: task.id });
    if (deleted) {
      removeTask(task.id);
      addToast('Task deleted', 'info');
      navigate('/');
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskText.trim() || !task) return;
    const result = await addSubtaskReq({ taskId: task.id, subtask: { text: newSubtaskText.trim() } });
    if (result) {
      const newSubtask: Subtask = {
        id: Date.now().toString(),
        text: newSubtaskText.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setSubtasks(prev => [...prev, newSubtask]);
      updateTask(task.id, { ...task, subtasks: [...subtasks, newSubtask] });
      setNewSubtaskText('');
      addToast('Subtask added', 'success');
    }
  };

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    if (!task) return;
    const result = await updateSubtaskReq({ taskId: task.id, subtaskId, completed: !completed });
    if (result) {
      const updatedSubtasks = subtasks.map(st =>
        st.id === subtaskId ? { ...st, completed: !completed } : st
      );
      setSubtasks(updatedSubtasks);
      updateTask(task.id, { ...task, subtasks: updatedSubtasks });
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!task) return;
    const result = await deleteSubtaskReq({ taskId: task.id, subtaskId });
    if (result) {
      const updatedSubtasks = subtasks.filter(st => st.id !== subtaskId);
      setSubtasks(updatedSubtasks);
      updateTask(task.id, { ...task, subtasks: updatedSubtasks });
      addToast('Subtask removed', 'info');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'No due date';
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatCreatedDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getTimeRemaining = (dueDate: Date | null): string => {
    if (!dueDate) return 'No due date';
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day left';
    if (days < 7) return `${days} days left`;
    if (days < 14) return '1 week left';
    return `${Math.ceil(days / 7)} weeks left`;
  };

  return (
    <div className='flex bg-surface-main w-full h-screen overflow-hidden'>
      <SideNavigation />
      <main className='flex-1 flex flex-col relative'>
        <TopNavigation />
        <section className='flex-1 px-4 py-6 md:px-16 md:py-8 overflow-y-auto flex flex-col gap-6'>
          {/* Breadcrumb */}
          <div className='flex items-center gap-2 mb-2 font-ui text-sm'>
            <button className='bg-none border-none text-text-secondary cursor-pointer hover:text-brand-primary transition-colors p-0 font-ui text-sm' onClick={() => navigate('/')}>Tasks</button>
            <span className='text-text-secondary opacity-50'>/</span>
            <span className='text-text-primary font-medium overflow-hidden text-overflow-ellipsis whitespace-nowrap max-w-[400px]'>{task.title}</span>
          </div>

          {(patchError || deleteError) && (
            <div className='bg-status-error-bg text-status-error-text px-4 py-3 rounded mb-4 font-ui text-sm'>{patchError || deleteError}</div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 items-start'>
            {/* Main Content */}
            <div className='min-w-0'>
              <div className='bg-surface-nav border border-border rounded-lg p-4 md:p-8 shadow-card transition-shadow'>
                {/* Header */}
                <div className='flex justify-between items-start mb-6 gap-4'>
                  <div className='flex flex-col gap-3'>
                    {task.project && <span className='font-ui text-xs font-bold text-brand-primary uppercase tracking-wider'>{task.project}</span>}
                    <div className='flex gap-2 items-center flex-wrap'>
                      <span className='font-ui text-xs font-semibold px-3 py-1 rounded capitalize whitespace-nowrap' style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
                        {task.status}
                      </span>
                      <span className='font-ui text-xs font-semibold px-3 py-1 rounded capitalize whitespace-nowrap' style={{ backgroundColor: priorityColors.bg, color: priorityColors.text }}>
                        {task.priority || 'Low'}
                      </span>
                      <span className='flex items-center gap-1 font-ui text-xs font-medium text-text-secondary'>
                        <ClockIcon size={14} />
                        {getTimeRemaining(task.dueDate)}
                      </span>
                    </div>
                  </div>
                  <div className='flex gap-2 flex-shrink-0'>
                    {!isEditing ? (
                      <>
                        <button className='btn-primary flex items-center gap-2' onClick={() => setIsEditing(true)}>
                          <EditIcon size={16} />
                          Edit
                        </button>
                        {!task.isCompleted && (
                          <button className='btn-ghost' onClick={handleComplete} disabled={patching}>
                            Complete
                          </button>
                        )}
                        <div className='relative' ref={actionMenuRef}>
                          <button
                            className='w-9 h-9 border border-border rounded px-2 py-2 bg-surface-nav text-text-secondary flex items-center justify-center cursor-pointer transition-all hover:border-text-secondary'
                            type='button'
                            aria-label='More actions'
                            aria-haspopup='menu'
                            aria-expanded={showActionMenu}
                            onClick={() => setShowActionMenu((prev) => !prev)}
                          >
                            <MoreHorizontalIcon size={16} />
                          </button>
                          {showActionMenu && (
                            <div className='absolute top-10 right-0 bg-surface-nav border border-border rounded-lg shadow-card-hover z-50 py-2 min-w-max' role='menu'>
                              <button
                                type='button'
                                role='menuitem'
                                className='w-full px-4 py-2 text-left text-status-error-text hover:bg-bg-active transition-colors font-ui text-sm'
                                onClick={() => {
                                  setShowActionMenu(false);
                                  setShowDeleteModal(true);
                                }}
                              >
                                Delete Task
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <button className='btn-primary' onClick={handleSave} disabled={patching}>
                          {patching ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button className='btn-secondary' onClick={() => setIsEditing(false)}>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Title */}
                {isEditing ? (
                  <div className='flex flex-col text-left mb-6'>
                    <label className='font-ui text-sm font-semibold text-text-primary mb-1.5'>Title</label>
                    <input type='text' value={title} onChange={e => setTitle(e.target.value)} className='bg-bg-input border border-border rounded px-3.5 py-2.5 font-body text-sm text-text-primary transition-all focus:outline-none focus:border-brand-primary focus:shadow-lg focus:shadow-brand-primary/20 focus:bg-bg-active' />
                  </div>
                ) : (
                  <h1 className='text-3xl font-semibold text-text-primary mb-6'>{task.title}</h1>
                )}

                {/* Description */}
                {isEditing ? (
                  <div className='flex flex-col text-left mb-6'>
                    <label className='font-ui text-sm font-semibold text-text-primary mb-1.5'>Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} className='bg-bg-input border border-border rounded px-3.5 py-2.5 font-body text-sm text-text-primary transition-all resize-vertical focus:outline-none focus:border-brand-primary focus:shadow-lg focus:shadow-brand-primary/20 focus:bg-bg-active' />
                  </div>
                ) : (
                  <div className='mb-6 text-text-secondary'>
                    <p className='m-0 whitespace-pre-wrap'>{task.description || 'No description provided.'}</p>
                  </div>
                )}

                {/* Progress */}
                <div className='mb-6'>
                  <div className='flex justify-between items-center mb-3'>
                    <span className='font-ui text-sm font-semibold text-text-secondary'>Progress</span>
                    {isEditing ? (
                      <div className='flex items-center gap-2'>
                        <input
                          type='range'
                          min='0'
                          max='100'
                          value={progress}
                          onChange={e => setProgress(Number(e.target.value))}
                          className='w-24 cursor-pointer'
                          style={{accentColor: 'var(--btn-primary-bg)'}}
                        />
                        <span className='font-heading text-lg font-bold' style={{ color: progressColor }}>{progress}%</span>
                      </div>
                    ) : (
                      <span className='font-heading text-lg font-bold' style={{ color: progressColor }}>{progress}%</span>
                    )}
                  </div>
                  <div className='w-full h-2 rounded overflow-hidden' style={{ backgroundColor: progressBg }}>
                    <div
                      className='h-full rounded transition-all duration-300'
                      style={{ width: `${progress}%`, backgroundColor: progressColor }}
                    />
                  </div>
                </div>

                {/* Subtasks */}
                <div className='mb-6'>
                  <div className='flex items-center justify-between mb-3'>
                    <span className='font-ui text-sm font-semibold text-text-secondary'>
                      Checklist
                      {subtasks.length > 0 && (
                        <span className='ml-2 text-text-secondary'>
                          {subtasks.filter(st => st.completed).length}/{subtasks.length}
                        </span>
                      )}
                    </span>
                  </div>
                  {subtasks.length > 0 && (
                    <div className='mb-3'>
                      <div className='w-full h-1.5 rounded bg-bg-input overflow-hidden'>
                        <div
                          className='h-full bg-brand-primary transition-all duration-300'
                          style={{ width: `${subtasks.length > 0 ? (subtasks.filter(st => st.completed).length / subtasks.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <ul className='list-none p-0 m-0 mb-3 flex flex-col gap-1.5'>
                    {subtasks.map(st => (
                      <li key={st.id} className={`flex items-center gap-2.5 px-3 py-2 rounded transition-colors ${st.completed ? 'bg-bg-active' : 'hover:bg-bg-active'}`}>
                        <button
                          className={`w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer transition-all flex-shrink-0 p-0 ${st.completed ? 'bg-brand-primary border-brand-primary' : 'border-border bg-surface-nav hover:border-brand-primary'}`}
                          onClick={() => handleToggleSubtask(st.id, st.completed)}
                          aria-label={st.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {st.completed && (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                        <span className={`flex-1 font-body text-sm ${st.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{st.text}</span>
                        <button className='w-6 h-6 border-none rounded flex items-center justify-center bg-transparent text-text-secondary cursor-pointer transition-all flex-shrink-0 p-0 opacity-0 hover:bg-status-error-bg hover:text-status-error-text group-hover:opacity-100' onClick={() => handleDeleteSubtask(st.id)} aria-label='Delete subtask'>
                          <CloseIcon size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className='flex gap-2'>
                    <input
                      type='text'
                      value={newSubtaskText}
                      onChange={e => setNewSubtaskText(e.target.value)}
                      placeholder='Add a subtask...'
                      className='flex-1 bg-bg-input border border-border rounded px-3 py-2 font-body text-sm text-text-primary transition-all focus:outline-none focus:border-brand-primary focus:shadow-lg focus:shadow-brand-primary/20'
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                    />
                    <button
                      className='btn-primary px-4 py-2 text-sm whitespace-nowrap'
                      onClick={handleAddSubtask}
                      disabled={!newSubtaskText.trim()}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className='mb-6 flex flex-wrap gap-2'>
                    {task.tags.map((tag, i) => (
                      <span key={i} className='font-ui text-xs font-medium px-3 py-1 bg-bg-input border border-border rounded'>{tag}</span>
                    ))}
                  </div>
                )}

                {/* Edit Form Fields */}
                {isEditing && (
                  <div className='mb-6 pt-6 border-t border-border'>
                    <div className='flex gap-4 mb-4'>
                      <div className='flex-1 flex flex-col text-left'>
                        <label className='font-ui text-sm font-semibold text-text-primary mb-1.5'>Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} className='bg-bg-input border border-border rounded px-3.5 py-2.5 font-body text-sm text-text-primary transition-all cursor-pointer appearance-none focus:outline-none focus:border-brand-primary focus:shadow-lg focus:shadow-brand-primary/20 focus:bg-bg-active' style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%2375736E' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px'}}>
                          <option value='pending'>Pending</option>
                          <option value='in-progress'>In Progress</option>
                          <option value='skipped'>Skipped</option>
                          <option value='bug'>Bug</option>
                          <option value='not-working'>Not Working</option>
                          <option value='issue'>Issue</option>
                          <option value='error'>Error</option>
                        </select>
                      </div>
                      <div className='flex-1 flex flex-col text-left'>
                        <label className='font-ui text-sm font-semibold text-text-primary mb-1.5'>Priority</label>
                        <select value={priority} onChange={e => setPriority(e.target.value)} className='bg-bg-input border border-border rounded px-3.5 py-2.5 font-body text-sm text-text-primary transition-all cursor-pointer appearance-none focus:outline-none focus:border-brand-primary focus:shadow-lg focus:shadow-brand-primary/20 focus:bg-bg-active' style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%2375736E' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px'}}>
                          <option value=''>None</option>
                          <option value='high'>High</option>
                          <option value='medium'>Medium</option>
                          <option value='low'>Low</option>
                          <option value='skippable'>Skippable</option>
                        </select>
                      </div>
                    </div>
                    <div className='flex flex-col text-left mb-4'>
                      <label className='font-ui text-sm font-semibold text-text-primary mb-1.5'>Project</label>
                      <Dropdown
                        options={projectOptions}
                        value={project}
                        onChange={(v) => setProject(v as string)}
                        placeholder='Associate with a project'
                        searchable
                      />
                    </div>
                    <div className='flex flex-col text-left mb-4'>
                      <label className='font-ui text-sm font-semibold text-text-primary mb-1.5'>Tags</label>
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
                    <div className='flex flex-col text-left mb-4'>
                      <label className='font-ui text-sm font-semibold text-text-primary mb-1.5'>Due Date</label>
                      <DatePicker
                        selected={dueDate}
                        onChange={(date: Date | null) => setDueDate(date)}
                        placeholderText='Select due date'
                        isClearable
                        className='w-full bg-bg-input border border-border rounded px-3.5 py-2.5 font-body text-sm text-text-primary box-border transition-all focus:outline-none focus:border-brand-primary focus:shadow-lg focus:shadow-brand-primary/20 focus:bg-bg-active'
                      />
                    </div>
                    <div className='flex items-center gap-2'>
                      <label className='font-ui text-sm font-semibold text-text-primary'>Completed</label>
                      <input
                        type='checkbox'
                        checked={isCompleted}
                        onChange={e => setIsCompleted(e.target.checked)}
                        className='w-4 h-4 accent-brand-primary rounded cursor-pointer'
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className='flex flex-col gap-4'>
              <div className='bg-surface-nav border border-border rounded-lg p-5 shadow-card'>
                <h4 className='text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4 pb-3 border-b border-border'>Details</h4>
                <div className='flex flex-col gap-3'>
                  <div className='flex justify-between items-center'>
                    <span className='font-ui text-xs text-text-secondary'>Status</span>
                    <span className='font-ui text-xs font-semibold px-3 py-1 rounded capitalize' style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
                      {task.status}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-ui text-xs text-text-secondary'>Priority</span>
                    <span className='font-ui text-xs font-semibold px-3 py-1 rounded capitalize' style={{ backgroundColor: priorityColors.bg, color: priorityColors.text }}>
                      {task.priority || 'None'}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-ui text-xs text-text-secondary'>Due Date</span>
                    <span className='font-ui text-xs text-text-primary'>{formatDate(task.dueDate)}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-ui text-xs text-text-secondary'>Created</span>
                    <span className='font-ui text-xs text-text-primary'>{formatCreatedDate(task.createdAt)}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-ui text-xs text-text-secondary'>Progress</span>
                    <span className='font-ui text-xs font-semibold' style={{ color: progressColor }}>{progress}%</span>
                  </div>
                  {task.project && (
                    <div className='flex justify-between items-center'>
                      <span className='font-ui text-xs text-text-secondary'>Project</span>
                      <span className='font-ui text-xs text-text-primary'>{task.project}</span>
                    </div>
                  )}
                  {task.assignee && (
                    <div className='flex justify-between items-center'>
                      <span className='font-ui text-xs text-text-secondary'>Assignee</span>
                      <div className='flex items-center gap-2'>
                        {task.assignee.avatar ? (
                          <img src={task.assignee.avatar} alt={task.assignee.name} className='w-5 h-5 rounded-full' />
                        ) : (
                          <div className='w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-semibold'>{task.assignee.name.charAt(0).toUpperCase()}</div>
                        )}
                        <span className='font-ui text-xs text-text-primary'>{task.assignee.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showDeleteModal && (
        <div
          className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div className='bg-surface-main border border-border rounded-xl shadow-card-hover w-full max-w-lg mx-4' role='dialog' aria-modal='true' aria-labelledby='delete-task-heading'>
            <div className='flex justify-between items-center px-6 py-4 border-b border-border'>
              <h2 id='delete-task-heading' className='text-xl font-semibold text-text-primary m-0'>Delete Task</h2>
              <button
                className='text-2xl cursor-pointer bg-none border-none text-text-secondary hover:text-text-primary disabled:opacity-50'
                onClick={() => setShowDeleteModal(false)}
                aria-label='Close modal'
                disabled={deleting}
              >
                &times;
              </button>
            </div>
            {deleteError && <div className='bg-status-error-bg text-status-error-text px-4 py-3 m-4 rounded font-ui text-sm'>{deleteError}</div>}
            <div className='px-6 py-4'>
              <p className='font-body text-text-primary text-base leading-relaxed m-0 mb-3'>
                This will permanently delete <strong>{task.title}</strong>.
              </p>
              <p className='font-ui text-status-error-text text-sm m-0'>
                This action cannot be undone.
              </p>
            </div>
            <div className='flex gap-3 px-6 py-4 border-t border-border'>
              <button className='btn-danger' type='button' onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Task'}
              </button>
              <button className='btn-secondary' type='button' onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

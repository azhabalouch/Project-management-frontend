import { useState, useEffect, useMemo } from 'react';
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
import './style/TaskDetail.css';

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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);

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

  if (!task) {
    return (
      <div className='home-layout'>
        <SideNavigation />
        <main className='home-main'>
          <TopNavigation />
          <section className='home-content'>
            <div className='task-detail-not-found'>
              <h2>Task not found</h2>
              <p>The task you're looking for doesn't exist or has been deleted.</p>
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
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
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
    <div className='home-layout'>
      <SideNavigation />
      <main className='home-main'>
        <TopNavigation />
        <section className='home-content'>
          {/* Breadcrumb */}
          <div className='task-detail-breadcrumb'>
            <button className='breadcrumb-link' onClick={() => navigate('/')}>Tasks</button>
            <span className='breadcrumb-separator'>/</span>
            <span className='breadcrumb-current'>{task.title}</span>
          </div>

          {(patchError || deleteError) && (
            <div className='task-detail-error'>{patchError || deleteError}</div>
          )}

          <div className='task-detail-layout'>
            {/* Main Content */}
            <div className='task-detail-main'>
              <div className='task-detail-card'>
                {/* Header */}
                <div className='task-detail-header'>
                  <div className='task-detail-header-left'>
                    {task.project && <span className='task-detail-project'>{task.project}</span>}
                    <div className='task-detail-meta-row'>
                      <span className='task-detail-badge' style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
                        {task.status}
                      </span>
                      <span className='task-detail-badge' style={{ backgroundColor: priorityColors.bg, color: priorityColors.text }}>
                        {task.priority || 'Low'}
                      </span>
                      <span className='task-detail-date-badge'>
                        <img src="/clock.svg" alt="" width={14} height={14} />
                        {getTimeRemaining(task.dueDate)}
                      </span>
                    </div>
                  </div>
                  <div className='task-detail-header-actions'>
                    {!isEditing ? (
                      <>
                        <button className='btn-primary' onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img src="/edit.svg" alt="" width={16} height={16} style={{ filter: 'brightness(0) invert(1)' }} />
                          Edit
                        </button>
                        {!task.isCompleted && (
                          <button className='btn-ghost' onClick={handleComplete} disabled={patching}>
                            Complete
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button className='btn-primary' onClick={handleSave} disabled={patching}>
                          {patching ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button className='btn-secondary' onClick={() => { setIsEditing(false); setConfirmDelete(false); }}>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Title */}
                {isEditing ? (
                  <div className='task-detail-field'>
                    <label>Title</label>
                    <input type='text' value={title} onChange={e => setTitle(e.target.value)} className='task-detail-input' />
                  </div>
                ) : (
                  <h1 className='task-detail-title'>{task.title}</h1>
                )}

                {/* Description */}
                {isEditing ? (
                  <div className='task-detail-field'>
                    <label>Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} className='task-detail-textarea' />
                  </div>
                ) : (
                  <div className='task-detail-description'>
                    <p>{task.description || 'No description provided.'}</p>
                  </div>
                )}

                {/* Progress */}
                <div className='task-detail-progress-section'>
                  <div className='task-detail-progress-header'>
                    <span className='task-detail-progress-label'>Progress</span>
                    {isEditing ? (
                      <div className='task-detail-progress-edit'>
                        <input
                          type='range'
                          min='0'
                          max='100'
                          value={progress}
                          onChange={e => setProgress(Number(e.target.value))}
                          className='task-detail-progress-slider'
                        />
                        <span className='task-detail-progress-value' style={{ color: progressColor }}>{progress}%</span>
                      </div>
                    ) : (
                      <span className='task-detail-progress-value' style={{ color: progressColor }}>{progress}%</span>
                    )}
                  </div>
                  <div className='task-detail-progress-bar-track' style={{ backgroundColor: progressBg }}>
                    <div
                      className='task-detail-progress-bar-fill'
                      style={{ width: `${progress}%`, backgroundColor: progressColor }}
                    />
                  </div>
                </div>

                {/* Subtasks / Todo List */}
                <div className='task-detail-subtasks-section'>
                  <div className='task-detail-subtasks-header'>
                    <span className='task-detail-subtasks-label'>
                      Checklist
                      {subtasks.length > 0 && (
                        <span className='task-detail-subtasks-count'>
                          {subtasks.filter(st => st.completed).length}/{subtasks.length}
                        </span>
                      )}
                    </span>
                  </div>
                  {subtasks.length > 0 && (
                    <div className='task-detail-subtasks-progress'>
                      <div className='task-detail-subtasks-progress-track'>
                        <div
                          className='task-detail-subtasks-progress-bar'
                          style={{ width: `${subtasks.length > 0 ? (subtasks.filter(st => st.completed).length / subtasks.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <ul className='task-detail-subtasks-list'>
                    {subtasks.map(st => (
                      <li key={st.id} className={`task-detail-subtask-item ${st.completed ? 'task-detail-subtask-item--completed' : ''}`}>
                        <button
                          className={`task-detail-subtask-checkbox ${st.completed ? 'task-detail-subtask-checkbox--checked' : ''}`}
                          onClick={() => handleToggleSubtask(st.id, st.completed)}
                          aria-label={st.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {st.completed && (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                        <span className='task-detail-subtask-text'>{st.text}</span>
                        <button className='task-detail-subtask-delete' onClick={() => handleDeleteSubtask(st.id)} aria-label='Delete subtask'>
                          <img src="/close.svg" alt="" width={14} height={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className='task-detail-subtask-add'>
                    <input
                      type='text'
                      value={newSubtaskText}
                      onChange={e => setNewSubtaskText(e.target.value)}
                      placeholder='Add a subtask...'
                      className='task-detail-subtask-input'
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                    />
                    <button
                      className='btn-primary task-detail-subtask-add-btn'
                      onClick={handleAddSubtask}
                      disabled={!newSubtaskText.trim()}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className='task-detail-tags'>
                    {task.tags.map((tag, i) => (
                      <span key={i} className='task-detail-tag'>{tag}</span>
                    ))}
                  </div>
                )}

                {/* Edit Form Fields */}
                {isEditing && (
                  <div className='task-detail-edit-fields'>
                    <div className='task-detail-field-row'>
                      <div className='task-detail-field'>
                        <label>Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} className='task-detail-select'>
                          <option value='pending'>Pending</option>
                          <option value='in-progress'>In Progress</option>
                          <option value='skipped'>Skipped</option>
                          <option value='bug'>Bug</option>
                          <option value='not-working'>Not Working</option>
                          <option value='issue'>Issue</option>
                          <option value='error'>Error</option>
                        </select>
                      </div>
                      <div className='task-detail-field'>
                        <label>Priority</label>
                        <select value={priority} onChange={e => setPriority(e.target.value)} className='task-detail-select'>
                          <option value=''>None</option>
                          <option value='high'>High</option>
                          <option value='medium'>Medium</option>
                          <option value='low'>Low</option>
                          <option value='skippable'>Skippable</option>
                        </select>
                      </div>
                    </div>
                    <div className='task-detail-field'>
                      <label>Project</label>
                      <Dropdown
                        options={projectOptions}
                        value={project}
                        onChange={(v) => setProject(v as string)}
                        placeholder='Associate with a project'
                        searchable
                      />
                    </div>
                    <div className='task-detail-field'>
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
                    <div className='task-detail-field'>
                      <label>Due Date</label>
                      <DatePicker
                        selected={dueDate}
                        onChange={(date: Date | null) => setDueDate(date)}
                        placeholderText='Select due date'
                        isClearable
                        className='task-detail-datepicker'
                      />
                    </div>
                    <div className='task-detail-field'>
                      <label>Completed</label>
                      <input
                        type='checkbox'
                        checked={isCompleted}
                        onChange={e => setIsCompleted(e.target.checked)}
                        className='task-detail-checkbox'
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className='task-detail-sidebar'>
              <div className='task-detail-sidebar-card'>
                <h4>Details</h4>
                <div className='task-detail-sidebar-rows'>
                  <div className='task-detail-sidebar-row'>
                    <span className='task-detail-sidebar-label'>Status</span>
                    <span className='task-detail-badge' style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
                      {task.status}
                    </span>
                  </div>
                  <div className='task-detail-sidebar-row'>
                    <span className='task-detail-sidebar-label'>Priority</span>
                    <span className='task-detail-badge' style={{ backgroundColor: priorityColors.bg, color: priorityColors.text }}>
                      {task.priority || 'None'}
                    </span>
                  </div>
                  <div className='task-detail-sidebar-row'>
                    <span className='task-detail-sidebar-label'>Due Date</span>
                    <span className='task-detail-sidebar-value'>{formatDate(task.dueDate)}</span>
                  </div>
                  <div className='task-detail-sidebar-row'>
                    <span className='task-detail-sidebar-label'>Created</span>
                    <span className='task-detail-sidebar-value'>{formatCreatedDate(task.createdAt)}</span>
                  </div>
                  <div className='task-detail-sidebar-row'>
                    <span className='task-detail-sidebar-label'>Progress</span>
                    <span className='task-detail-sidebar-value' style={{ color: progressColor, fontWeight: 600 }}>{progress}%</span>
                  </div>
                  {task.project && (
                    <div className='task-detail-sidebar-row'>
                      <span className='task-detail-sidebar-label'>Project</span>
                      <span className='task-detail-sidebar-value'>{task.project}</span>
                    </div>
                  )}
                  {task.assignee && (
                    <div className='task-detail-sidebar-row'>
                      <span className='task-detail-sidebar-label'>Assignee</span>
                      <div className='task-detail-assignee'>
                        {task.assignee.avatar ? (
                          <img src={task.assignee.avatar} alt={task.assignee.name} className='task-detail-assignee-avatar' />
                        ) : (
                          <div className='task-detail-assignee-initials'>{task.assignee.name.charAt(0).toUpperCase()}</div>
                        )}
                        <span>{task.assignee.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div className='task-detail-sidebar-card task-detail-danger-zone'>
                <h4>Danger Zone</h4>
                <button
                  className={confirmDelete ? 'btn-danger' : 'task-detail-delete-btn'}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {confirmDelete ? 'Confirm Delete' : deleting ? 'Deleting...' : 'Delete Task'}
                </button>
                {confirmDelete && (
                  <p className='task-detail-delete-warning'>This action cannot be undone.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

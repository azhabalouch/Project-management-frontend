import type { Task } from './type/typesInterface';
import './style/TaskCard.css';

interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
  editMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}

const getTimeRemaining = (dueDate: Date | null): string => {
  if (!dueDate) return 'No due date';
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return '1d left';
  if (days < 7) return `${days}d left`;
  if (days < 14) return '1w left';
  return `${Math.ceil(days / 7)}w left`;
};

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
  const statusLower = status.toLowerCase();
  switch (statusLower) {
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

export default function TaskCard({ task, onEdit, editMode, selected, onToggleSelect }: TaskCardProps) {
  const priorityColors = getPriorityColor(task.priority);
  const statusColors = getStatusColor(task.status);
  const timeRemaining = getTimeRemaining(task.dueDate);
  const progress = task.progress ?? 0;
  const progressColor = getProgressColor(progress);
  const progressBg = getProgressBg(progress);

  const handleCardClick = () => {
    if (editMode) {
      onToggleSelect?.();
    } else {
      onEdit?.();
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect?.();
  };

  return (
    <div
      className={`task-card ${editMode ? 'task-card--edit-mode' : ''} ${selected ? 'task-card--selected' : ''}`}
      onClick={handleCardClick}
      role={onEdit || editMode ? 'button' : undefined}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
    >
      {/* Selection indicator for edit mode */}
      {editMode && (
        <div className='task-card-checkbox' onClick={handleCheckboxClick}>
          <div className={`task-card-checkbox-box ${selected ? 'task-card-checkbox-box--checked' : ''}`}>
            {selected && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Priority accent bar */}
      <div className='task-card-accent' style={{ backgroundColor: priorityColors.text }} />

      <div className='task-card-body'>
        {/* Header with project and tags */}
        <div className='task-card-header'>
          <div className='task-card-header-left'>
            {task.project && <span className='task-project'>{task.project}</span>}
            {task.tags && task.tags.length > 0 && (
              <div className='task-tags'>
                {task.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className='task-tag'>{tag}</span>
                ))}
                {task.tags.length > 3 && <span className='task-tag'>+{task.tags.length - 3}</span>}
              </div>
            )}
          </div>
          <div className='task-card-header-right'>
            <span className='task-badge task-badge--status' style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
              {task.status}
            </span>
          </div>
        </div>

        {/* Task title */}
        <h3 className='task-title'>{task.title}</h3>

        {/* Description */}
        {task.description && (
          <p className='task-description'>{task.description}</p>
        )}

        {/* Progress bar - always visible */}
        <div className='task-progress'>
          <div className='task-progress-info'>
            <span className='task-progress-label'>Progress</span>
            <span className='task-progress-percent' style={{ color: progressColor }}>{progress}%</span>
          </div>
          <div className='task-progress-track' style={{ backgroundColor: progressBg }}>
            <div className='task-progress-bar' style={{ width: `${progress}%`, backgroundColor: progressColor }} />
          </div>
        </div>

        {/* Footer */}
        <div className='task-footer'>
          <div className='task-badges'>
            <span className='task-badge task-badge--priority' style={{ backgroundColor: priorityColors.bg, color: priorityColors.text }}>
              {task.priority || 'Low'}
            </span>
            <span className='task-time'>
              <img src="/clock.svg" alt="Time" width={14} height={14} />
              {timeRemaining}
            </span>
            {task.subtasks && task.subtasks.length > 0 && (
              <span className='task-subtask-count'>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="3" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4 6H10M4 9H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M4 3V2C4 1.44772 4.44772 1 5 1H9C9.55228 1 10 1.44772 10 2V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
              </span>
            )}
          </div>
          {task.assignee && (
            <div className='task-assignee'>
              {task.assignee.avatar ? (
                <img src={task.assignee.avatar} alt={task.assignee.name} className='assignee-avatar' />
              ) : (
                <div className='assignee-avatar-placeholder'>
                  {task.assignee.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
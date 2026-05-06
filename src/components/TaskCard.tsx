import type { MouseEvent } from 'react';
import type { Task } from './type/typesInterface';
import { ClockIcon } from './Icons';

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

const getPriorityClasses = (priority?: string): { bg: string; text: string } => {
  switch (priority) {
    case 'high':
      return { bg: 'bg-priority-high-bg', text: 'text-priority-high-text' };
    case 'medium':
      return { bg: 'bg-priority-medium-bg', text: 'text-priority-medium-text' };
    case 'low':
      return { bg: 'bg-priority-low-bg', text: 'text-priority-low-text' };
    case 'skippable':
      return { bg: 'bg-priority-skippable-bg', text: 'text-priority-skippable-text' };
    default:
      return { bg: 'bg-priority-low-bg', text: 'text-priority-low-text' };
  }
};

const getStatusClasses = (status: string): { bg: string; text: string } => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'pending':
      return { bg: 'bg-status-pending-bg', text: 'text-status-pending-text' };
    case 'inprogress':
    case 'in-progress':
      return { bg: 'bg-status-inprogress-bg', text: 'text-status-inprogress-text' };
    case 'notworking':
    case 'not-working':
      return { bg: 'bg-status-notworking-bg', text: 'text-status-notworking-text' };
    case 'issue':
      return { bg: 'bg-status-issue-bg', text: 'text-status-issue-text' };
    case 'bug':
      return { bg: 'bg-status-bug-bg', text: 'text-status-bug-text' };
    case 'error':
      return { bg: 'bg-status-error-bg', text: 'text-status-error-text' };
    case 'skipped':
      return { bg: 'bg-status-skipped-bg', text: 'text-status-skipped-text' };
    default:
      return { bg: 'bg-status-pending-bg', text: 'text-status-pending-text' };
  }
};

const getProgressClasses = (progress: number): { bg: string; text: string } => {
  if (progress >= 90) return { bg: 'bg-pct-90-bg', text: 'text-pct-90-text' };
  if (progress >= 75) return { bg: 'bg-pct-75-bg', text: 'text-pct-75-text' };
  if (progress >= 50) return { bg: 'bg-pct-50-bg', text: 'text-pct-50-text' };
  if (progress >= 35) return { bg: 'bg-pct-35-bg', text: 'text-pct-35-text' };
  if (progress >= 10) return { bg: 'bg-pct-10-bg', text: 'text-pct-10-text' };
  return { bg: 'bg-pct-10-bg', text: 'text-pct-10-text' };
};

export default function TaskCard({ task, onEdit, editMode, selected, onToggleSelect }: TaskCardProps) {
  const priorityColors = getPriorityClasses(task.priority);
  const statusColors = getStatusClasses(task.status);
  const timeRemaining = getTimeRemaining(task.dueDate);
  const progress = task.progress ?? 0;
  const progressColors = getProgressClasses(progress);

  const handleCardClick = () => {
    if (editMode) {
      onToggleSelect?.();
    } else {
      onEdit?.();
    }
  };

  const handleCheckboxClick = (e: MouseEvent) => {
    e.stopPropagation();
    onToggleSelect?.();
  };

  return (
    <div
      className={`relative flex cursor-pointer overflow-hidden rounded-lg border border-border bg-surface-default shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${editMode ? 'ring-2 ring-brand-primary/20' : ''} ${selected ? 'ring-2 ring-brand-primary/30' : ''}`}
      onClick={handleCardClick}
      role={onEdit || editMode ? 'button' : undefined}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleCardClick();
      }}
    >
      {editMode && (
        <button className='absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-default' onClick={handleCheckboxClick} type='button' aria-label='Select task'>
          <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${selected ? 'border-brand-primary bg-brand-primary' : 'border-border bg-surface-default'}`}>
            {selected && (
              <svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
                <path d='M11.6666 3.5L5.24992 9.91667L2.33325 7' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            )}
          </div>
        </button>
      )}

      <div className={`w-1.5 flex-shrink-0 ${priorityColors.text.replace('text-', 'bg-')}`} />

      <div className='flex min-w-0 flex-1 flex-col gap-4 p-4 md:p-5'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-1 flex-wrap items-center gap-2'>
            {task.project && (
              <span className='rounded-full bg-bg-active px-3 py-1 text-xs font-semibold text-text-primary'>{task.project}</span>
            )}
            {task.tags && task.tags.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {task.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className='rounded-full border border-border bg-surface-default px-2.5 py-1 text-[11px] font-semibold text-text-secondary'>
                    {tag}
                  </span>
                ))}
                {task.tags.length > 3 && (
                  <span className='rounded-full border border-border bg-surface-default px-2.5 py-1 text-[11px] font-semibold text-text-secondary'>
                    +{task.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusColors.bg} ${statusColors.text}`}>
            {task.status}
          </span>
        </div>

        <div className='space-y-2'>
          <h3 className='text-[22px] font-medium tracking-[-0.2px] text-text-primary'>{task.title}</h3>
          {task.description && <p className='max-w-3xl text-[14px] leading-6 text-text-secondary'>{task.description}</p>}
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between text-[13px] font-medium'>
            <span className='text-text-secondary'>Progress</span>
            <span className={progressColors.text}>{progress}%</span>
          </div>
          <div className={`h-2 overflow-hidden rounded-full ${progressColors.bg}`}>
            <div className='h-full rounded-full' style={{ width: `${progress}%`, backgroundColor: `var(--pct-${progress >= 90 ? '90' : progress >= 75 ? '75' : progress >= 50 ? '50' : progress >= 35 ? '35' : '10'}-text)` }} />
          </div>
        </div>

        <div className='flex items-end justify-between gap-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityColors.bg} ${priorityColors.text}`}>
              {task.priority || 'Low'}
            </span>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-bg-active px-3 py-1 text-xs font-medium text-text-secondary'>
              <ClockIcon size={14} />
              {timeRemaining}
            </span>
            {task.subtasks && task.subtasks.length > 0 && (
              <span className='inline-flex items-center gap-1.5 rounded-full bg-bg-active px-3 py-1 text-xs font-medium text-text-secondary'>
                <svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
                  <rect x='1' y='3' width='12' height='9' rx='2' stroke='currentColor' strokeWidth='1.5' />
                  <path d='M4 6H10M4 9H8' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' />
                  <path d='M4 3V2C4 1.44772 4.44772 1 5 1H9C9.55228 1 10 1.44772 10 2V3' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
                </svg>
                {task.subtasks.filter((subtask) => subtask.completed).length}/{task.subtasks.length}
              </span>
            )}
          </div>
          {task.assignee && (
            <div className='flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border'>
              {task.assignee.avatar ? (
                <img src={task.assignee.avatar} alt={task.assignee.name} className='h-full w-full object-cover' />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-brand-primary text-sm font-bold text-white'>
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

import { useState, useEffect } from 'react';
import { DatePicker } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { usePatch } from '../hooks/usePatch';
import { useDelete } from '../hooks/useDelete';
import { normalizeTask, useTaskContext } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { TASK_URLS } from '../apis';
import type { Task, HandleSubmitEvent } from './type/typesInterface';

interface TaskEditModalProps {
  task: Task;
  onClose: () => void;
}

export default function TaskEditModal({ task, onClose }: TaskEditModalProps) {
  const { updateTask, removeTask } = useTaskContext();
  const { addToast } = useToast();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority ?? '');
  const [isCompleted, setIsCompleted] = useState(task.isCompleted);
  const [dueDate, setDueDate] = useState<Date | null>(task.dueDate);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { execute: patchTask, loading: patching, error: patchError } = usePatch(TASK_URLS.patch);
  const { remove: deleteTask, loading: deleting, error: deleteError } = useDelete(TASK_URLS.delete);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = async (e: HandleSubmitEvent) => {
    e.preventDefault();
    const payload: { taskId: string; [key: string]: unknown } = { taskId: task.id };

    if (title !== task.title) payload.title = title;
    if (description !== task.description) payload.description = description;
    if (status !== task.status) payload.status = status;
    if (isCompleted !== task.isCompleted) payload.isCompleted = isCompleted;
    if (priority !== (task.priority ?? '')) payload.priority = priority || null;

    const currentDueDateTime = task.dueDate ? new Date(task.dueDate).getTime() : null;
    const nextDueDateTime = dueDate ? dueDate.getTime() : null;
    if (currentDueDateTime !== nextDueDateTime) payload.dueDate = dueDate;

    if (Object.keys(payload).length === 1) {
      onClose();
      return;
    }

    const updatedTask = await patchTask(payload);

    if (updatedTask) {
      if (updatedTask === true) {
        updateTask(task.id, {
          ...task,
          title,
          description,
          status,
          isCompleted,
          dueDate,
          priority: (priority || undefined) as Task['priority'],
        });
      } else {
        updateTask(task.id, normalizeTask(updatedTask));
      }
      addToast('Task updated successfully', 'success');
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    const deletedTask = await deleteTask({ id: task.id });
    if (deletedTask) {
      removeTask(task.id);
      addToast('Task deleted', 'info');
      onClose();
    }
  };

  const handleComplete = async () => {
    const result = await patchTask({ taskId: task.id, isCompleted: true });
    if (result) {
      updateTask(task.id, { ...task, isCompleted: true });
      addToast('Task marked as complete', 'success');
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const fieldClassName = 'mt-1 rounded-md border border-transparent bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-secondary)] focus:border-[var(--btn-primary-bg)] focus:outline-none focus:ring-4 focus:ring-[color:var(--glow-primary)]';

  return (
    <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4 py-6' onClick={handleBackdropClick}>
      <div className='max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-premium md:p-8' role='dialog' aria-modal='true' aria-labelledby='edit-task-heading'>
        <div className='mb-6 flex items-center justify-between gap-4'>
          <h2 id='edit-task-heading' className='text-2xl font-semibold tracking-[-0.3px]'>Edit Task</h2>
          <button className='flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] text-xl text-[var(--text-primary)] transition-all hover:bg-[var(--bg-active)]' onClick={onClose} aria-label='Close modal' type='button'>
            &times;
          </button>
        </div>

        {(patchError || deleteError) && (
          <div className='mb-4 rounded-md border border-[var(--status-error-text)] bg-[var(--status-error-bg)] px-4 py-3 text-sm text-[var(--status-error-text)]'>
            {patchError || deleteError}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid gap-4'>
            <div className='flex flex-col'>
              <label htmlFor='edit-title' className='mb-1.5 text-sm font-medium text-[var(--text-secondary)]'>Title</label>
              <input id='edit-title' type='text' value={title} onChange={(e) => setTitle(e.target.value)} required className={fieldClassName} />
            </div>

            <div className='flex flex-col'>
              <label htmlFor='edit-description' className='mb-1.5 text-sm font-medium text-[var(--text-secondary)]'>Description</label>
              <textarea id='edit-description' value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${fieldClassName} min-h-24 resize-y`} />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='flex flex-col'>
                <label htmlFor='edit-status' className='mb-1.5 text-sm font-medium text-[var(--text-secondary)]'>Status</label>
                <select id='edit-status' value={status} onChange={(e) => setStatus(e.target.value)} className={`${fieldClassName} cursor-pointer appearance-auto`}>
                  <option value='pending'>Pending</option>
                  <option value='in-progress'>In Progress</option>
                  <option value='skipped'>Skipped</option>
                  <option value='bug'>Bug</option>
                  <option value='not-working'>Not Working</option>
                  <option value='issue'>Issue</option>
                  <option value='error'>Error</option>
                </select>
              </div>

              <div className='flex flex-col'>
                <label htmlFor='edit-priority' className='mb-1.5 text-sm font-medium text-[var(--text-secondary)]'>Priority</label>
                <select id='edit-priority' value={priority} onChange={(e) => setPriority(e.target.value)} className={`${fieldClassName} cursor-pointer appearance-auto`}>
                  <option value=''>None</option>
                  <option value='high'>High</option>
                  <option value='medium'>Medium</option>
                  <option value='low'>Low</option>
                  <option value='skippable'>Skippable</option>
                </select>
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='flex flex-col'>
                <label htmlFor='edit-due-date' className='mb-1.5 text-sm font-medium text-[var(--text-secondary)]'>Due Date</label>
                <DatePicker
                  id='edit-due-date'
                  selected={dueDate}
                  onChange={(date: Date | null) => setDueDate(date)}
                  placeholderText='Select due date'
                  isClearable
                  className={fieldClassName}
                />
              </div>

              <div className='flex flex-col'>
                <label htmlFor='edit-completed' className='mb-1.5 text-sm font-medium text-[var(--text-secondary)]'>Completed</label>
                <input
                  id='edit-completed'
                  type='checkbox'
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                  className='h-5 w-5 cursor-pointer accent-[var(--btn-primary-bg)]'
                />
              </div>
            </div>
          </div>

          <div className='mt-6 flex flex-wrap gap-3 border-t border-[var(--border-color)] pt-4'>
            {!task.isCompleted && (
              <button type='button' className='btn-ghost' onClick={handleComplete} disabled={patching}>
                Mark Complete
              </button>
            )}
            <button type='submit' className='btn-primary' disabled={patching}>
              {patching ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type='button'
              className={confirmDelete ? 'btn-danger' : 'btn-ghost'}
              onClick={handleDelete}
              disabled={deleting}
            >
              {confirmDelete ? 'Confirm Delete' : deleting ? 'Deleting...' : 'Delete'}
            </button>
            <button type='button' className='btn-secondary' onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { DatePicker } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { usePatch } from '../hooks/usePatch';
import { useDelete } from '../hooks/useDelete';
import { normalizeTask, useTaskContext } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { TASK_URLS } from '../apis';
import type { Task, HandleSubmitEvent } from './type/typesInterface';
import './style/TaskEditModal.css';

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

  return (
    <div className='modal-backdrop' onClick={handleBackdropClick}>
      <div className='modal-content' role='dialog' aria-modal='true' aria-labelledby='edit-task-heading'>
        <div className='modal-header'>
          <h2 id='edit-task-heading'>Edit Task</h2>
          <button className='modal-close-btn' onClick={onClose} aria-label='Close modal'>&times;</button>
        </div>

        {(patchError || deleteError) && (
          <div className='modal-error'>{patchError || deleteError}</div>
        )}

        <form onSubmit={handleSubmit} className='modal-form'>
          <div className='form-group'>
            <label htmlFor='edit-title'>Title</label>
            <input
              id='edit-title'
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='edit-description'>Description</label>
            <textarea
              id='edit-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className='form-row'>
            <div className='form-group'>
              <label htmlFor='edit-status'>Status</label>
              <select id='edit-status' value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value='pending'>Pending</option>
                <option value='in-progress'>In Progress</option>
                <option value='skipped'>Skipped</option>
                <option value='bug'>Bug</option>
                <option value='not-working'>Not Working</option>
                <option value='issue'>Issue</option>
                <option value='error'>Error</option>
              </select>
            </div>

            <div className='form-group'>
              <label htmlFor='edit-priority'>Priority</label>
              <select id='edit-priority' value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value=''>None</option>
                <option value='high'>High</option>
                <option value='medium'>Medium</option>
                <option value='low'>Low</option>
                <option value='skippable'>Skippable</option>
              </select>
            </div>
          </div>

          <div className='form-row'>
            <div className='form-group'>
              <label htmlFor='edit-due-date'>Due Date</label>
              <DatePicker
                id='edit-due-date'
                selected={dueDate}
                onChange={(date: Date | null) => setDueDate(date)}
                placeholderText='Select due date'
                isClearable
              />
            </div>

            <div className='form-group'>
              <label htmlFor='edit-completed'>Completed</label>
              <input
                id='edit-completed'
                type='checkbox'
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
              />
            </div>
          </div>

          <div className='modal-actions'>
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

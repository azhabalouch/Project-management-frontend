import { useState, useEffect } from 'react';
import { DatePicker } from 'react-datepicker';
import { usePatch } from '../../hooks/usePatch';
import { useDelete } from '../../hooks/useDelete';
import { normalizeTask, useTaskContext } from '../../context/TaskContext';
import { TASK_URLS } from '../../apis';
import type { Task, HandleSubmitEvent } from '../type/typesInterface';

interface TaskInputProps {
  task: Task;
  onDone: () => void;
}

export default function TaskEdit({ task, onDone }: TaskInputProps){
  const { updateTask, removeTask } = useTaskContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate ? task.dueDate : null);
    setStatus(task.status);
    setIsCompleted(task.isCompleted);
  }, [task])
  
  const { execute } = usePatch(TASK_URLS.patch);
  const { remove } = useDelete(TASK_URLS.delete);

  const handleSubmit = async (e: HandleSubmitEvent) => {
    e.preventDefault();
    const payload: { id: string; [key: string]: unknown } = { id: task.id };

    if (title !== task.title) payload.title = title;
    if (description !== task.description) payload.description = description;
    if (status !== task.status) payload.status = status;
    if (isCompleted !== task.isCompleted) payload.isCompleted = isCompleted;

    const currentDueDateTime = task.dueDate ? new Date(task.dueDate).getTime() : null;
    const nextDueDateTime = dueDate ? dueDate.getTime() : null;

    if (currentDueDateTime !== nextDueDateTime) {
      payload.dueDate = dueDate;
    }

    if (Object.keys(payload).length === 1) {
      onDone();
      return;
    }

    const updatedTask = await execute(payload);

    if (updatedTask) {
      if (updatedTask === true) {
        updateTask(task.id, {
          ...task,
          title,
          description,
          status,
          isCompleted,
          dueDate,
        });
      } else {
        updateTask(task.id, normalizeTask(updatedTask));
      }

      onDone();
    }

  }

  const handleDelete = async () => {
    const deletedTask = await remove({ id: task.id });

    if (deletedTask) {
      removeTask(task.id);
      onDone();
    }
  }

  return(
    <>
      <h1 id='create-task-heading'>Create task</h1>
      <form onSubmit={handleSubmit} aria-label='Create task form'>
        <label htmlFor='task-title'>Task title:
          <input
            name='task-title'
            id='task-title'
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={title}
          />
        </label>
        <label htmlFor='task-description'>Description:
          <input
            name='task-description'
            id='task-description'
            type='text'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={description}
          />
        </label>
        <label htmlFor='task-due-date' >Due Date:
          <DatePicker
            selected = {dueDate}
            onChange = {(date: Date | null)=> setDueDate(date)}
            id='task-due-date'
            name='task-due-date'
            placeholderText={dueDate?.toLocaleString()}
          />
        </label>
        <label htmlFor='task-status'>
          Status:
          <input
            id='task-status'
            type='text'
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </label>

        <label htmlFor='task-complete'>
          Completed:
          <input
            id='task-complete'
            type='checkbox'
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
          />
        </label>
        <input type='submit' value='submit' />
      </form>
      <button onClick={handleDelete}>Delete task</button>
    </>
  )
}
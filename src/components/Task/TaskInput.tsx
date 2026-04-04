import { useState, useEffect } from "react";
import { DatePicker } from 'react-datepicker';
import { usePatch } from "../../hooks/usePatch";
import type { HandleSubmitEvent } from "../Type/TypesInterface";

import { useContext } from "react";
import { TaskContext } from "../../context/TaskContext";

const TASK_PATCH_URL:string='http://localhost:3000/user/patch/task'

export default function TaskInput(){
  const currentTask = useContext(TaskContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);

  useEffect(() => {
    if(currentTask){
      setTitle(currentTask.title);
      setDescription(currentTask.description);
      setDueDate(currentTask.dueDate ? new Date(currentTask.dueDate) : null);
      setStatus(currentTask.status);
      setIsCompleted(currentTask.isCompleted);
    }
  }, [currentTask])
  
  const { execute } = usePatch(TASK_PATCH_URL);

  const handleSubmit = (e: HandleSubmitEvent) => {
    e.preventDefault();
    if (!currentTask) {
      return;
    }

    const payload: { id: string; [key: string]: unknown } = { id: currentTask.id };

    if (title !== currentTask.title) {
      payload.title = title;
    }

    if (description !== currentTask.description) {
      payload.description = description;
    }

    if (status !== currentTask.status) {
      payload.status = status;
    }

    if (isCompleted !== currentTask.isCompleted) {
      payload.isCompleted = isCompleted;
    }

    const currentDueDateTime = currentTask.dueDate ? new Date(currentTask.dueDate).getTime() : null;
    const nextDueDateTime = dueDate ? dueDate.getTime() : null;

    if (currentDueDateTime !== nextDueDateTime) {
      payload.dueDate = dueDate;
    }

    if (Object.keys(payload).length === 1) {
      return;
    }

    execute(payload);
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
        <input type='submit' value='submit' />
      </form>
    </>
  )
}
import { useState } from 'react'
import { usePost } from '../hooks/usePost'
import { useLogout } from '../hooks/Auth/useLogoutUser';
import type { HandleSubmitEvent, TaskData } from '../components/type/typesInterface';
import { DatePicker } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';

const TASK_URL:string='http://localhost:3000/user/create/task'

export default function TaskCreate(){
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const status = 'in-progress';
  const isCompleted = false;
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const { logout } = useLogout();
  const navigate = useNavigate();
  const { execute } = usePost(TASK_URL);

  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName');

  const handleSubmit = (e: HandleSubmitEvent) => {
    e.preventDefault();
    execute({ title, description, status, isCompleted, dueDate } as TaskData);
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  }

  return(
    <main>
      <section aria-labelledby='welcome-heading'>
        <h1 id='welcome-heading'>Welcome! {firstName} {lastName}</h1>
      </section>
      <section aria-labelledby='create-task-heading'>
        <h1 id='create-task-heading'>Create task</h1>
        <form onSubmit={handleSubmit} aria-label='Create task form'>
          <label htmlFor='task-title'>Task title:
            <input
              name='task-title'
              id='task-title'
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Name your task'
            />
          </label>
          <label htmlFor='task-description'>Description:
            <input
              name='task-description'
              id='task-description'
              type='text'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Enter task details.'
            />
          </label>
          <label htmlFor='task-due-date' >Due Date:
            <DatePicker
              selected = {dueDate}
              onChange = {(date: Date | null)=> setDueDate(date)}
              id='task-due-date'
              name='task-due-date'
              placeholderText='Select due date'
            />
          </label>
          <input type='submit' value='submit' />
        </form>
      </section>
      <section>
        <button title='Logout button' onClick={handleLogout}>Logout</button>
      </section>
    </main>
  )
}
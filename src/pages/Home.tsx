import { useState, useEffect } from 'react'
import { usePost } from '../hooks/usePost'
import { useLogout } from '../hooks/Auth/useLogoutUser';
import type { HandleSubmitEvent, TaskData } from '../components/type/submitInterface';
import { DatePicker } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';

const TASK_URL:string='http://localhost:3000/user/task'

export default function Home(){
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const status = 'in-progress';
  const isCompleted = false;
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const { logout } = useLogout();
  const navigate = useNavigate();
  const { execute, responseData, loading, error} = usePost(TASK_URL);

  const displayName = localStorage.getItem('displayName');

  const handleSubmit = (e: HandleSubmitEvent) => {
    e.preventDefault();
    execute({ title, description, status, isCompleted, dueDate } as TaskData);
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  }

  useEffect(() => {
    if (responseData){
      try {
        console.log(responseData, loading, error);
      } catch (error) {
        console.log(error);
      }
    }
  }, [responseData])

  return(
    <main>
      <section>
        <h1>Welcome! {displayName}</h1>
      </section>
      <section>
        <h1>Create task</h1>
        <form onSubmit={handleSubmit}>
          <label>Task title:</label>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Name your task'
          />
          <label>Description:</label>
          <input
            type='text'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Enter task details.'
          />
          <label>Due Date:</label>
          <DatePicker
            selected = {dueDate}
            onChange = {(date: Date | null)=> setDueDate(date)}
          />
          <input type='submit'/>
        </form>
      </section>
      <section>
        <button onClick={handleLogout}>Logout</button>
      </section>
    </main>
  )
}
import { useState, useEffect } from 'react'
import { usePost } from '../hooks/usePost'
import type { HandleSubmitEvent, TaskData } from '../components/type/submitInterface';
import { DatePicker } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const TASK_URL:string='http://localhost:3000/user/task'

export default function Home(){
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const status = 'in-progress';
  const isCompleted = false;
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const { execute, responseData, loading, error} = usePost(TASK_URL);

  const userId = localStorage.getItem('localId');

  const handleSubmit = (e: HandleSubmitEvent) => {
    e.preventDefault();
    execute({ title, description, status, isCompleted, dueDate, userId } as TaskData);
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
    </main>
  )
}
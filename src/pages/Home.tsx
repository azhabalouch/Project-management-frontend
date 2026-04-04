import { useState, useEffect } from 'react'
import { useGet } from '../hooks/useGet'
import { useLogout } from '../hooks/Auth/useLogoutUser';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';
import type { Task } from '../components/Type/TypesInterface';
import { TaskContext } from '../context/TaskContext';
import ShowTaskMode from '../components/Task/ShowTaskMode';

const TASK_URL:string='http://localhost:3000/user/get/tasks'

export default function Home(){
  const [tasks, setTasks] = useState<Task[]>([]);
  const { logout } = useLogout();
  const navigate = useNavigate();
  const { execute, responseData, loading, error} = useGet(TASK_URL);

  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  }

  useEffect(() => {
    const fetchData = async () => {
      await execute();
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (responseData) {
      setTasks(responseData);
    }
  }, [responseData]);

  return(
    <main>
      <section aria-labelledby='welcome-heading'>
        <h1 id='welcome-heading'>Welcome! {firstName} {lastName}</h1>
      </section>
      <section aria-labelledby='your-current-tasks-heading'>
        <h1 id='your-current-tasks-heading'>Your Current Tasks</h1>
        {tasks && tasks.length > 0 && !error && !loading ? (
          <ul className="task-list">
            {tasks.map(task => (
              <li key={task.id} className="task-item">
                <TaskContext.Provider value={task}>
      
                {/* MyButton is inside, so it can tune in! */}
                  <ShowTaskMode />
                  
                </TaskContext.Provider>
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading tasks.</p>
        )}
      </section>
      <section>
        <button title='Logout button' onClick={handleLogout}>Logout</button>
      </section>
    </main>
  )
}
import { useLogout } from '../hooks/Auth/useLogoutUser';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../components/Task_depricated/TaskCard';
import { useGet } from '../hooks/useGet';
import { useEffect } from 'react';
import { TASK_URLS } from '../apis';
import type { Task } from '../components/type/typesInterface';

interface HistoryResponse {
  tasks: Task[];
}

export default function History(){
  const { logout } = useLogout();
  const navigate = useNavigate();
  const { execute, responseData, loading, error } = useGet<HistoryResponse>(TASK_URLS.history);

  useEffect(() => {
    execute();
  }, [])

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  }

  return(
    <main>
      <section>
        <button onClick={() => {navigate('/', { replace: true })}}>Go back home</button>
      </section>
      <section aria-labelledby='welcome-heading'>
        <h1 id='welcome-heading'>History</h1>
      </section>
      <section aria-labelledby='your-current-tasks-heading'>
        <h1 id='your-current-tasks-heading'>Task History</h1>
        
        {loading ? (
          <p>Loading tasks...</p>
        ) : error ? (
          <p>Unable to load tasks: {error}</p>
        ) : responseData?.tasks && responseData.tasks.length > 0 ? (
          <ul className='task-list'>
            {responseData.tasks.map(task => (
              <li key={task.id} className='task-item'>
                <TaskCard task={task} />
              </li>
            ))}
          </ul>
        ) : (
          <p>No tasks found in history.</p>
        )}
      </section>
      <section>
        <button title='Logout button' onClick={handleLogout}>Logout</button>
      </section>
    </main>
  )
}
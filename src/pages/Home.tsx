import { useLogout } from '../hooks/Auth/useLogoutUser';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import ShowTaskMode from '../components/Task/ShowTaskMode';

export default function Home(){
  const { logout } = useLogout();
  const navigate = useNavigate();
  const { tasks, loading, error } = useTaskContext();

  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  }

  return(
    <main>
      <section aria-labelledby='welcome-heading'>
        <h1 id='welcome-heading'>Welcome! {firstName} {lastName}</h1>
      </section>
      <section aria-labelledby='your-current-tasks-heading'>
        <h1 id='your-current-tasks-heading'>Your Current Tasks</h1>
        {loading ? (
          <p>Loading tasks.</p>
        ) : error ? (
          <p>Unable to load tasks.</p>
        ) : tasks.length > 0 ? (
          <ul className='task-list'>
            {tasks.map(task => (
              <li key={task.id} className='task-item'>
                <ShowTaskMode task={task} />
              </li>
            ))}
          </ul>
        ) : (
          <p>No tasks found.</p>
        )}
      </section>
      <section>
        <button onClick={() => navigate('/task-create', { replace: true })}>Create task</button>
        <button onClick={() => navigate('/history', { replace: true })}>Check history</button>
      </section>
      <section>
        <button title='Logout button' onClick={handleLogout}>Logout</button>
      </section>
    </main>
  )
}
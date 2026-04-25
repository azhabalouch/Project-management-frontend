import { useLogout } from '../hooks/Auth/useLogoutUser';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import './style/SideNav.css';

const iconS = 24;

export default function SideNavigation(){
  const { tasks } = useTaskContext();
  
  const navigate = useNavigate();
  const { logout } = useLogout();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  }

  // Determine counts quickly for UI (approximate based on status)
  const tasksCount = tasks.length;

  return(
    <nav className='nav-side'>
      <div className='nav-side-header'>
        <h2>Manage</h2>
      </div>
      <div className='nav-side-links'>
        <div className='nav-links-group'>
          <div className='nav-link active'>
            <img src="/task.svg" alt="Tasks" width={iconS} height={iconS} />
            <span>Tasks</span>
            <span className='nav-link-badge'>{tasksCount}</span>
          </div>
          <div className='nav-link' onClick={() => navigate('/history', { replace: true })}>
            <img src="/history.svg" alt="History" width={iconS} height={iconS} />
            <span>History</span>
          </div>
        </div>
        <div className='nav-links-group'>
          <div className='nav-link' onClick={handleLogout}>
            <img src="/logout.svg" alt="Logout" width={iconS} height={iconS} />
            <span>Logout</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
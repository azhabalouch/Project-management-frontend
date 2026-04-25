import { useNavigate } from "react-router-dom";
import "./style/TopNav.css";

const iconS = 24;

export default function TopNavigation(){
  const navigate = useNavigate();

  return(
    <header className='nav-top'>
      <div className='search-bar'>
        <img src="/search.svg" alt="Search" width={iconS} height={iconS} />
        <input type='text' placeholder='Search tasks ...' />
      </div>
      <div className='nav-actions'>
        <button className='btn-secondary' style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/filter.svg" alt="Filter" width={iconS} height={iconS} />
          All Tasks
        </button>
        <button className='btn-primary' onClick={() => navigate('/task-create', { replace: true })} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/add.svg" alt="Add" width={iconS} height={iconS} />
          New Task
        </button>
        <img src="/icons.svg" alt="Notifications" width={iconS} height={iconS} style={{ cursor: 'pointer' }} />
        <div className='profile-btn'>
          <img src="/women.png" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
    </header>
  )
}
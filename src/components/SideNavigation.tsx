import { useLogout } from '../hooks/Auth/useLogoutUser';
import { useNavigate, NavLink } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { useUIContext } from '../context/UIContext';
import './style/SideNav.css';

const iconS = 24;

const navItems = [
  { path: '/', label: 'Tasks', icon: 'task.svg', showBadge: true },
  { path: '/todo', label: 'To-Do', icon: 'todo.svg', showBadge: false },
  { path: '/projects', label: 'Projects', icon: 'project.svg', showBadge: false },
  { path: '/calendar', label: 'Calendar', icon: 'calendar.svg', showBadge: false },
  { path: '/history', label: 'History', icon: 'history.svg', showBadge: false },
] as const;

export default function SideNavigation(){
  const { tasks } = useTaskContext();
  const navigate = useNavigate();
  const { logout } = useLogout();
  const { addToast } = useToast();
  const { mobileNavOpen, closeMobileNav } = useUIContext();

  const handleLogout = async () => {
    const ok = await logout();
    if (ok) {
      addToast('Logged out successfully', 'success');
    } else {
      addToast('Logged out locally; server logout failed.', 'error');
      console.warn('Logout request failed — proceeding with local logout');
    }
    // Ensure mobile nav is closed and navigate to login regardless
    closeMobileNav();
    navigate('/login', { replace: true });
  }

  return(
    <>
      {mobileNavOpen && <div className='nav-side-backdrop' onClick={() => closeMobileNav()} />}
      <nav className={`nav-side ${mobileNavOpen ? 'nav-side--mobile-open' : ''}`}>
        <div className='nav-side-header'>
          <h2>Manage</h2>
        </div>
        <div className='nav-side-links'>
          <div className='nav-links-group'>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end={item.path === '/'}
              >
                <img src={`/${item.icon}`} alt={item.label} width={iconS} height={iconS} />
                <span>{item.label}</span>
                {item.showBadge && <span className='nav-link-badge'>{tasks.length}</span>}
              </NavLink>
            ))}
          </div>
          <div className='nav-links-group'>
            <div className='nav-link' onClick={handleLogout} role='button' tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLogout(); }}>
              <img src="/logout.svg" alt="Logout" width={iconS} height={iconS} />
              <span>Logout</span>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
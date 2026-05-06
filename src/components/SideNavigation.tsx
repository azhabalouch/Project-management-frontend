import { useLogout } from '../hooks/Auth/useLogoutUser';
import { useNavigate, NavLink } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { useUIContext } from '../context/UIContext';
import { CalendarIcon, HistoryIcon, LogoutIcon, ProjectIcon, TaskIcon, TodoIcon } from './Icons';

const iconS = 24;

const navItems = [
  { path: '/', label: 'Tasks', icon: TaskIcon, showBadge: true },
  { path: '/todo', label: 'To-Do', icon: TodoIcon, showBadge: false },
  { path: '/projects', label: 'Projects', icon: ProjectIcon, showBadge: false },
  { path: '/calendar', label: 'Calendar', icon: CalendarIcon, showBadge: false },
  { path: '/history', label: 'History', icon: HistoryIcon, showBadge: false },
] as const;

export default function SideNavigation() {
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
      console.warn('Logout request failed - proceeding with local logout');
    }

    closeMobileNav();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {mobileNavOpen && <div className='fixed inset-0 z-[190] bg-black/40 md:hidden' onClick={() => closeMobileNav()} />}
      <nav
        className={`z-10 flex shrink-0 flex-col bg-[var(--bg-main-nav)] md:w-[216px] md:border-r md:border-[var(--border-color)] md:shadow-[2px_0_8px_rgba(0,0,0,0.03)] ${mobileNavOpen
          ? 'fixed left-0 top-0 z-[200] h-screen w-[260px] border-r border-[var(--border-color)] px-0 py-5 shadow-[2px_0_24px_rgba(0,0,0,0.2)] md:static md:px-0'
          : 'fixed inset-x-0 bottom-0 h-[68px] border-t border-[var(--border-color)] px-0 py-0 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] md:static md:h-screen md:border-t-0'
        }`}
      >
        <div className='hidden h-[72px] items-center justify-center border-b border-[var(--border-color)] md:flex'>
          <h2 className='text-[20px] font-semibold tracking-[-0.3px] text-[var(--text-primary)]'>Manage</h2>
        </div>
        <div className={`flex flex-1 ${mobileNavOpen ? 'flex-col px-2 py-3' : 'flex-row items-center justify-around px-2 py-0 md:flex-col md:justify-between md:px-0 md:py-8'}`}>
          <div className={`flex w-full ${mobileNavOpen ? 'flex-col gap-2' : 'flex-row items-center justify-around gap-0 md:flex-col md:gap-2'}`}>
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-active)] hover:text-[var(--text-primary)] ${mobileNavOpen
                      ? 'rounded-md px-4 py-2.5 md:border-l-0 md:border-b-0'
                      : 'min-h-11 flex-1 flex-col justify-center rounded-none px-1 py-2 text-center md:flex-row md:justify-start md:border-l-0 md:border-b-0 md:px-7 md:py-2.5 md:text-left'
                    } ${isActive ? 'bg-[var(--bg-active)] font-semibold text-[var(--text-primary)] md:border-l-0 md:border-b-0 md:before:content-[""]' : ''}`
                  }
                  end={item.path === '/'}
                >
                  <Icon size={iconS} className='shrink-0 opacity-70 transition-opacity group-hover:opacity-100' />
                  <span className='text-[10px] md:text-sm'>{item.label}</span>
                  {item.showBadge && (
                    <span className='ml-auto hidden min-w-[22px] rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] px-2 py-0.5 text-center text-[11px] font-semibold text-[var(--text-secondary)] md:block'>
                      {tasks.length}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
          <div className={`flex w-full ${mobileNavOpen ? 'mt-4 flex-col gap-2' : 'flex-row items-center justify-around md:mt-0 md:flex-col md:gap-2'}`}>
            <button
              className='flex min-h-11 items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-active)] hover:text-[var(--text-primary)] md:w-full md:justify-start md:px-7'
              onClick={handleLogout}
              type='button'
            >
              <LogoutIcon size={iconS} className='shrink-0' />
              <span className='text-[10px] md:text-sm'>Logout</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

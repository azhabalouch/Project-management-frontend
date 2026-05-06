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
        className={`z-10 flex shrink-0 flex-col bg-surface-nav w-[216px] border-r border-border shadow-[2px_0_8px_rgba(0,0,0,0.03)] ${mobileNavOpen
          ? 'fixed left-0 top-0 z-[200] h-screen w-[260px] border-r border-border px-0 py-5 shadow-[2px_0_24px_rgba(0,0,0,0.2)] md:static md:px-0'
          : 'hidden md:flex h-screen'
        }`}
      >
        <div className='flex h-[72px] items-center justify-center border-b border-border'>
          <h2 className='text-[20px] font-semibold tracking-[-0.3px] text-text-primary'>Manage</h2>
        </div>
        <div className={`flex flex-1 flex-col justify-between px-0 py-8 ${mobileNavOpen ? 'px-2 py-3' : ''}`}>
          <div className={`flex w-full flex-col gap-2 ${mobileNavOpen ? '' : ''}`}>
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex w-full items-center gap-3 px-7 py-2.5 text-sm font-medium text-text-secondary transition-all hover:bg-bg-active hover:text-text-primary ${isActive ? 'bg-bg-active font-semibold text-text-primary border-l-2 border-brand-primary' : ''}`
                  }
                  end={item.path === '/'}
                >
                  <Icon size={iconS} className='shrink-0 opacity-70 transition-opacity group-hover:opacity-100' />
                  <span className='text-[10px] md:text-sm'>{item.label}</span>
                  {item.showBadge && (
                    <span className='ml-auto hidden min-w-[22px] rounded-full border border-border bg-surface-default px-2 py-0.5 text-center text-[11px] font-semibold text-text-secondary md:block'>
                      {tasks.length}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
          <div className={`flex w-full flex-col gap-2 mt-0`}>
            <button
              className='flex w-full items-center gap-3 justify-start px-7 py-2.5 text-sm font-medium text-text-secondary transition-all hover:bg-bg-active hover:text-text-primary'
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

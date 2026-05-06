import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useUIContext } from '../context/UIContext';
import { MenuIcon, MoonIcon, PlusIcon, SearchIcon, SunIcon } from './Icons';

const iconS = 24;

interface TopNavigationProps {
  onSearch?: (query: string) => void;
}

export default function TopNavigation({ onSearch }: TopNavigationProps) {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [userName, setUserName] = useState({ firstName: '', lastName: '' });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toggleMobileNav } = useUIContext();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(initialDarkMode);
    document.documentElement.setAttribute('data-theme', initialDarkMode ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const syncName = () => {
      setUserName({
        firstName: localStorage.getItem('firstName') ?? '',
        lastName: localStorage.getItem('lastName') ?? '',
      });
    };

    syncName();
    window.addEventListener('storage', syncName);
    const interval = setInterval(syncName, 2000);
    return () => {
      window.removeEventListener('storage', syncName);
      clearInterval(interval);
    };
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch?.(value);
      }, 300);
    },
    [onSearch]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.setAttribute('data-theme', newDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  const initials = (userName.firstName.charAt(0) + userName.lastName.charAt(0)).toUpperCase() || 'U';

  return (
    <header className='flex h-14 shrink-0 items-center gap-2 border-b border-[var(--border-color)] bg-[var(--bg-main-nav)] px-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:h-16 md:gap-4 md:px-8'>
      <button
        className='flex h-10 w-10 items-center justify-center rounded-md border border-transparent bg-transparent text-[var(--text-secondary)] md:hidden'
        aria-label='Toggle navigation'
        onClick={() => toggleMobileNav()}
      >
        <MenuIcon size={20} />
      </button>
      <div className='flex min-w-0 flex-1 items-center rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 transition-[border-color,box-shadow] focus-within:border-[var(--btn-primary-bg)] focus-within:shadow-[0_0_0_3px_var(--glow-primary)] md:max-w-[400px] md:px-4'>
        <SearchIcon size={iconS} className='shrink-0 text-[var(--text-secondary)]' />
        <input
          type='text'
          placeholder='Search tasks ...'
          value={searchValue}
          onChange={handleSearchChange}
          aria-label='Search tasks'
          className='ml-2 w-full border-0 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]'
        />
      </div>
      <div className='ml-auto flex items-center gap-2 md:gap-4'>
        <button
          className='flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] transition-all hover:border-[var(--text-secondary)] hover:bg-[var(--bg-active)]'
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <SunIcon size={iconS} className='text-[var(--text-secondary)]' /> : <MoonIcon size={iconS} className='text-[var(--text-secondary)]' />}
        </button>
        <button className='btn-primary flex items-center gap-2' onClick={() => navigate('/task-create')}>
          <PlusIcon size={iconS} />
          <span className='hidden sm:inline'>New Task</span>
        </button>
        <div
          className='flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[var(--border-color)]'
          title={`${userName.firstName} ${userName.lastName}`.trim() || 'Profile'}
        >
          <div className='flex h-full w-full items-center justify-center bg-[var(--btn-primary-bg)] text-[13px] font-bold text-white'>
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}

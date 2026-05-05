import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import "./style/TopNav.css";
import { useUIContext } from '../context/UIContext';

const iconS = 24;

interface TopNavigationProps {
  onSearch?: (query: string) => void;
}

export default function TopNavigation({ onSearch }: TopNavigationProps){
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

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch?.(value);
    }, 300);
  }, [onSearch]);

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

  return(
    <header className='nav-top'>
      <button
        className='mobile-nav-toggle'
        aria-label={isDarkMode ? 'Toggle navigation' : 'Toggle navigation'}
        onClick={() => toggleMobileNav()}
      >
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="1" width="20" height="2" rx="1" fill="currentColor" />
          <rect y="6" width="20" height="2" rx="1" fill="currentColor" />
          <rect y="11" width="20" height="2" rx="1" fill="currentColor" />
        </svg>
      </button>
      <div className='search-bar'>
        <img src="/search.svg" alt="Search" width={iconS} height={iconS} />
        <input
          type='text'
          placeholder='Search tasks ...'
          value={searchValue}
          onChange={handleSearchChange}
          aria-label='Search tasks'
        />
      </div>
      <div className='nav-actions'>
        <button
          className='theme-toggle'
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <img src="/sun.svg" alt="Light mode" width={iconS} height={iconS} />
          ) : (
            <img src="/moon.svg" alt="Dark mode" width={iconS} height={iconS} />
          )}
        </button>
        <button className='btn-primary' onClick={() => navigate('/task-create')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/add.svg" alt="Add" width={iconS} height={iconS} />
          New Task
        </button>
        <div className='profile-btn' title={`${userName.firstName} ${userName.lastName}`.trim() || 'Profile'}>
          <div className='profile-avatar-initials'>{initials}</div>
        </div>
      </div>
    </header>
  )
}
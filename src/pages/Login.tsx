import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePost } from '../hooks/usePost';
import { useToast } from '../context/ToastContext';
import { AUTH_URLS } from '../apis';
import type { AuthResponse, HandleSubmitEvent, LoginFormData } from '../components/type/typesInterface';

/**
 * Login Component
 * 
 * Renders the authentication page. Handles user input, submits credentials
 * via a custom `usePost` hook, and redirects to the dashboard upon success
 * while saving user details to local storage.
 * 
 * @returns {JSX.Element} The rendered Login page component.
 */
export default function Login() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // API Integration
  const { execute, responseData, loading, error } = usePost<AuthResponse, LoginFormData>(AUTH_URLS.login);
  
  /**
   * Handles the login form submission.
   * Prevents default browser refresh and triggers the API call.
   * 
   * @param {HandleSubmitEvent} e - The form submission event.
   */
  const handleSubmit = (e: HandleSubmitEvent) => {
    e.preventDefault();
    // Note: rememberMe is tracked in state but omitted from the payload per LoginFormData requirements
    execute({ email, password } as LoginFormData);
  };
  
  // Watch for successful login responses to handle routing and local storage
  useEffect(() => {
    if (responseData) {
      localStorage.setItem('firstName', responseData.firstName);
      localStorage.setItem('lastName', responseData.lastName);
      
      addToast(`Welcome back, ${responseData.firstName}!`, 'success');
      navigate('/', { replace: true }); // replace: true prevents navigating back to login
    }
  }, [responseData, navigate, addToast]);

  return (
    <main className='flex min-h-screen w-full items-center justify-center flex-col-reverse md:flex-row'>
      {/* Left Section: Hero Image (Hidden on mobile) */}
      <section className='hidden md:flex h-auto flex-row justify-end overflow-hidden'>
        <img alt='Woman' src='/women.png' className='h-auto w-auto max-h-[80vh] translate-x-4 object-contain' />
      </section>

      {/* Right Section: Login Form */}
      <section className='flex flex-col justify-center max-w-[560px] z-10 px-4 py-4 md:px-0 md:py-0'>
        <h1 className='font-serif text-[2rem] md:text-[4rem] text-right mb-4 text-[var(--text-primary)]'>
          ... it's Personal
        </h1>

        <div className='flex flex-col bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-8 md:p-16 gap-4 max-w-[560px] shadow-premium'>
          <h1 id='login-heading' className='font-heading text-left font-normal text-[1.5rem] md:text-[2rem] text-[var(--text-primary)]'>
            Login
          </h1>

          {/* Error Message Display */}
          {!loading && error && (
            <p className='text-[var(--status-error-text)] mb-4 font-ui text-sm' role="alert">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} aria-labelledby='login-heading' className='flex flex-col gap-4'>
            
            {/* Email Input */}
            <div className='flex flex-col text-left'>
              <label htmlFor='user-email' className='font-ui text-base text-[var(--text-secondary)] mb-2'>
                Email
              </label>
              <input
                autoComplete='email'
                name='user-email'
                id='user-email'
                type='email'
                placeholder='Enter your email address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='bg-[var(--bg-input)] border border-transparent rounded-lg h-12 px-4 font-body text-base text-[var(--text-secondary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-50 focus:outline-none focus:bg-[var(--bg-active)] focus:text-[var(--text-primary)] focus:border-[var(--btn-primary-bg)]'
              />
            </div>

            {/* Password Input */}
            <div className='flex flex-col text-left'>
              <label htmlFor='user-pass' className='font-ui text-base text-[var(--text-secondary)] mb-2'>
                Password
              </label>
              <input
                autoComplete='current-password'
                name='user-pass'
                id='user-pass'
                type='password'
                placeholder='Enter your password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='bg-[var(--bg-input)] border border-transparent rounded-lg h-12 px-4 font-body text-base text-[var(--text-secondary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-50 focus:outline-none focus:bg-[var(--bg-active)] focus:text-[var(--text-primary)] focus:border-[var(--btn-primary-bg)]'
              />
            </div>

            {/* Form Actions: Remember Me & Submit */}
            <div className='flex flex-col-reverse md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-0 mt-4'>
              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='remember-me'
                  name='remember-me'
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className='w-4 h-4 accent-[var(--text-primary)] cursor-pointer'
                />
                <label htmlFor='remember-me' className='font-ui text-sm text-[var(--text-primary)] cursor-pointer'>
                  Remember me
                </label>
              </div>

              <button
                type='submit'
                className='btn-secondary min-w-[120px] w-full md:w-auto'
                aria-label={loading ? 'Logging in' : 'Submit login form'}
                disabled={loading}
              >
                {loading ? '...' : 'Login'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Disclaimer */}
        <p className='font-body font-normal italic text-sm text-[var(--text-primary)] text-justify leading-6 mt-4'>
          Access is restricted to accounts provisioned by the administrator. Please log in using your assigned credentials, or contact the administrator to request a password reset.
        </p>
      </section>
    </main>
  );
}
import { useEffect, useState } from 'react';
import { usePost } from '../hooks/usePost';
import type { AuthResponse, HandleSubmitEvent, LoginFormData } from '../components/type/typesInterface';
import { useNavigate } from 'react-router-dom';
import { AUTH_URLS } from '../apis';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { execute, responseData, loading, error } = usePost<AuthResponse, LoginFormData>(AUTH_URLS.login);
  
  const handleSubmit = (e: HandleSubmitEvent) => {
    e.preventDefault();
    execute({ email, password } as LoginFormData);
  }
  
  useEffect(() => {
    if (responseData) {
      localStorage.setItem('firstName', responseData.firstName);
      localStorage.setItem('lastName', responseData.lastName);
      addToast(`Welcome back, ${responseData.firstName}!`, 'success');
      navigate('/', { replace: true });
    }
  }, [responseData, navigate, addToast]);

  return (
    <main className='grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]'>
      <section className='hidden overflow-hidden bg-[var(--bg-main-nav)] lg:block'>
        <img alt='Woman' src='/women.png' className='h-full w-full object-cover' />
      </section>

      <section className='flex flex-col justify-center gap-8 px-6 py-10 sm:px-10 lg:px-16'>
        <h1 className='font-heading text-[clamp(2.25rem,5vw,4rem)] font-medium tracking-[-0.5px] text-[var(--text-primary)]'>
          ... it’s Personal
        </h1>

        <div className='w-full max-w-xl rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-premium sm:p-8'>
          <h1 id='login-heading' className='text-[28px] font-semibold tracking-[-0.3px]'>Login</h1>

          {!loading && error && (
            <p className='mt-4 rounded-md border border-[var(--status-error-text)] bg-[var(--status-error-bg)] px-4 py-3 text-sm text-[var(--status-error-text)]'>
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} aria-label='Login form' className='mt-6 space-y-5'>
            <div className='form-group'>
              <label htmlFor='user-email'>Email:</label>
              <input
                autoComplete='email'
                name='user-email'
                id='user-email'
                type='email'
                placeholder='Enter your email address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='user-pass'>Password:</label>
              <input
                autoComplete='current-password'
                name='user-pass'
                id='user-pass'
                type='password'
                placeholder='Enter your password.'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='remember-me'
                  name='remember-me'
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className='h-5 w-5 cursor-pointer accent-[var(--btn-primary-bg)]'
                />
                <label htmlFor='remember-me' className='text-sm text-[var(--text-primary)]'>Remember me</label>
              </div>

              <button
                type='submit'
                className='btn-secondary min-w-[120px]'
                aria-label='Submit button'
                disabled={loading}
              >
                {loading ? '...' : 'Login'}
              </button>
            </div>
          </form>
        </div>

        <p className='max-w-2xl text-sm leading-6 text-[var(--text-secondary)]'>
          Access is restricted to accounts provisioned by the administrator. Please log in using your assigned credentials, or contact the administrator to request a password reset.
        </p>
      </section>
    </main>
  );
}

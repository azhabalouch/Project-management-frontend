import { useEffect, useState } from 'react'
import { usePost } from '../hooks/usePost';
import type { AuthResponse, HandleSubmitEvent, RegisterFormData } from '../components/type/typesInterface';
import { useNavigate, Link } from 'react-router-dom';
import { AUTH_URLS } from '../apis';
import { useToast } from '../context/ToastContext';

export default function Register(){
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [validationError, setValidationError] = useState('');
  const { execute, responseData, loading, error} = usePost<AuthResponse, RegisterFormData>(AUTH_URLS.register);

  const handleSubmit = (e: HandleSubmitEvent) => {
    e.preventDefault();
    setValidationError('');

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    execute({ email, password, firstName, lastName } as RegisterFormData);
  }
  
  useEffect(() => {
    if (responseData){
      localStorage.setItem('firstName', responseData.firstName);
      localStorage.setItem('lastName', responseData.lastName);
      addToast(`Welcome, ${responseData.firstName}! Account created.`, 'success');
      navigate('/', { replace: true });
    }
  }, [responseData, navigate, addToast])

  return (
    <main className='flex min-h-screen items-center justify-center px-6 py-10 sm:px-10'>
      <section className='w-full max-w-2xl'>
        <h1 className='font-heading text-[clamp(2.25rem,5vw,4rem)] font-medium tracking-[-0.5px] text-[var(--text-primary)]'>
          ... it's Personal
        </h1>

        <div className='mt-8 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-premium sm:p-8'>
          <h1 id='register-heading' className='text-[28px] font-semibold tracking-[-0.3px]'>Register</h1>

          {(!loading && error) && (
            <p className='mt-4 rounded-md border border-[var(--status-error-text)] bg-[var(--status-error-bg)] px-4 py-3 text-sm text-[var(--status-error-text)]'>{error}</p>
          )}
          {validationError && (
            <p className='mt-4 rounded-md border border-[var(--status-error-text)] bg-[var(--status-error-bg)] px-4 py-3 text-sm text-[var(--status-error-text)]'>{validationError}</p>
          )}

          <form onSubmit={handleSubmit} aria-label='Registration form' className='mt-6 space-y-5'>
            <div className='form-group'>
              <label htmlFor='user-email'>Email</label>
              <input
                autoComplete='email'
                name='user-email'
                id='user-email'
                type='email'
                placeholder='Enter your email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='user-pass'>Password</label>
              <input
                autoComplete='new-password'
                name='user-pass'
                id='user-pass'
                type='password'
                placeholder='Enter your password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className='form-group'>
              <label htmlFor='user-confirm-pass'>Confirm Password</label>
              <input
                autoComplete='new-password'
                name='user-confirm-pass'
                id='user-confirm-pass'
                type='password'
                placeholder='Confirm your password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='form-group'>
                <label htmlFor='first-name'>First Name</label>
                <input
                  autoComplete='given-name'
                  name='first-name'
                  id='first-name'
                  type='text'
                  placeholder='First name'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className='form-group'>
                <label htmlFor='last-name'>Last Name</label>
                <input
                  autoComplete='family-name'
                  name='last-name'
                  id='last-name'
                  type='text'
                  placeholder='Last name'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className='pt-2'>
              <button type='submit' className='btn-primary w-full' disabled={loading}>
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </div>
          </form>

          <p className='mt-6 text-sm text-[var(--text-secondary)]'>
            Already have an account? <Link to='/login' className='font-semibold text-[var(--btn-primary-bg)] hover:underline'>Log in</Link>
          </p>
        </div>
      </section>
    </main>
  )
}

import { useEffect, useState } from 'react'
import { usePost } from '../hooks/usePost';
import type { AuthResponse, HandleSubmitEvent, RegisterFormData } from '../components/type/typesInterface';
import { useNavigate, Link } from 'react-router-dom';
import { AUTH_URLS } from '../apis';
import { useToast } from '../context/ToastContext';
import './style/Register.css';

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
    <main className="register-layout">
      <section className="register-content-section">
        <h1 className="register-personal-text">... it's Personal</h1>
        
        <div className="register-form-card">
          <h1 id="register-heading">Register</h1>
          
          {(!loading && error) && (
            <p className="register-error-message">{error}</p>
          )}
          {validationError && (
            <p className="register-error-message">{validationError}</p>
          )}

          <form onSubmit={handleSubmit} aria-label="Registration form" className="register-form">
            <div className="form-group">
              <label htmlFor="user-email">Email</label>
              <input
                autoComplete="email"
                name="user-email"
                id="user-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="user-pass">Password</label>
              <input
                autoComplete="new-password"
                name="user-pass"
                id="user-pass"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="user-confirm-pass">Confirm Password</label>
              <input
                autoComplete="new-password"
                name="user-confirm-pass"
                id="user-confirm-pass"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first-name">First Name</label>
                <input
                  autoComplete="given-name"
                  name="first-name"
                  id="first-name"
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="last-name">Last Name</label>
                <input
                  autoComplete="family-name"
                  name="last-name"
                  id="last-name"
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="register-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </div>
          </form>

          <p className="register-login-link">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </section>
    </main>
  )
}

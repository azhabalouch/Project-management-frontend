import { useEffect, useState } from 'react';
import { usePost } from '../hooks/usePost';
import type { AuthResponse, HandleSubmitEvent, LoginFormData } from '../components/type/typesInterface';
import { useNavigate } from 'react-router-dom';
import { AUTH_URLS } from '../apis';
import { useToast } from '../context/ToastContext';
import './style/Login.css';

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
    <main className="login-layout">
      <section className="login-image-section">
        <img alt="Woman" src="/women.png" className="login-image" />
      </section>

      <section className="login-content-section">
        <h1 className="login-personal-text">... it’s Personal</h1>
        
        <div className="login-form-card">
          <h1 id="login-heading">Login</h1>
          
          {!loading && error && (
            <p className="login-error-message">{error}</p>
          )}

          <form onSubmit={handleSubmit} aria-label="Login form" className="login-form">
            <div className="form-group">
              <label htmlFor="user-email">Email:</label>
              <input
                autoComplete="email"
                name="user-email"
                id="user-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="user-pass">Password:</label>
              <input
                autoComplete="current-password"
                name="user-pass"
                id="user-pass"
                type="password"
                placeholder="Enter your password."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <div className="checkbox-group">
                <input 
                  type="checkbox" 
                  id="remember-me" 
                  name="remember-me" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me">Remember me</label>
              </div>

              <button 
                type="submit" 
                className="btn-secondary" 
                aria-label="Submit button"
                disabled={loading}
              >
                {loading ? '...' : 'Login'}
              </button>
            </div>
          </form>
        </div>

        <p className="login-restricted-text">
          Access is restricted to accounts provisioned by the administrator. Please log in using your assigned credentials, or contact the administrator to request a password reset.
        </p>
      </section>
    </main>
  );
}

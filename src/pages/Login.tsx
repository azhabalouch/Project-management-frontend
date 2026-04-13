import { useEffect, useState } from 'react'
import { usePost } from '../hooks/usePost';
import type { AuthResponse, HandleSubmitEvent, LoginFormData } from '../components/type/typesInterface';
import { useNavigate } from 'react-router';
import { AUTH_URLS } from '../apis';


export default function Login(){
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { execute, responseData, loading, error} = usePost<AuthResponse, LoginFormData>(AUTH_URLS.login);
  
  const handleSubmit = (e: HandleSubmitEvent) => {
    e.preventDefault();
    execute({ email, password } as LoginFormData);
  }
  
  useEffect(() => {
    if (responseData){
      localStorage.setItem('firstName', responseData.firstName);
      localStorage.setItem('lastName', responseData.lastName);

      navigate('/', { replace: true });
    }
  }, [responseData])

  return (
    <main>
      <section aria-labelledby='login-heading'>
        <h2 id='login-heading'>Login</h2>
        {!loading && error ? (
          <p>{error}</p>
        ) : (
          <p>Enter email and password.</p>
        )}
        <form onSubmit={handleSubmit} aria-label='Login form'>
          <label htmlFor='user-email'>Email:
            <input
              autoComplete='email'
              name='user-email'
              id='user-email'
              type='email'
              placeholder='Enter your email'
              value={email}
              onChange={(e) => {setEmail(e.target.value)}}
            />
          </label>
          <label htmlFor='user-pass'>Password:
            <input
              autoComplete='current-password'
              name='user-pass'
              id='user-pass'
              type='password'
              placeholder='Enter your password'
              value={password}
              onChange={(e) => {setPassword(e.target.value)}}
            />
          </label>
          <input title='Submit button' type='submit' value='submit' aria-label='Submit button'/>
        </form>
      </section>
    </main>
  )
}

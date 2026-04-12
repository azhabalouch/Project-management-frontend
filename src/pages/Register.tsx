import { useEffect, useState } from 'react'
import { usePost } from '../hooks/usePost';
import type { AuthResponse, HandleSubmitEvent, RegisterFormData } from '../components/type/typesInterface';
import { useNavigate } from 'react-router-dom';

const REGISTER_URL:string = 'http://localhost:3000/auth/register';

export default function Register(){
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { execute, responseData, loading, error} = usePost<AuthResponse, RegisterFormData>(REGISTER_URL);

  const handleSubmit = (e: HandleSubmitEvent) => {
    e.preventDefault();
    execute({ email, password, firstName, lastName } as RegisterFormData);
  }
  
  useEffect(() => {
    if (responseData){
      localStorage.setItem("firstName", responseData.firstName);
      localStorage.setItem("lastName", responseData.lastName);

      navigate('/', { replace: true });
    }
  }, [responseData])

  return (
    <main>
      <section aria-labelledby='register-heading'>
        <h2 id='register-heading'>Register</h2>
        {!loading && error ? (
          <p>{error}</p>
        ) : (
          <p>Enter email and password.</p>
        )}
        <form onSubmit={handleSubmit} aria-label='Registeration form'>
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
              autoComplete='new-password'
              name='user-pass'
              id='user-pass'
              type='password'
              placeholder='Enter your password'
              value={password}
              onChange={(e) => {setPassword(e.target.value)}}
            />
          </label>
          <label htmlFor='first-name'>First Name:
            <input
              autoComplete='first-name'
              name='first-name'
              id='first-name'
              type='text'
              placeholder='Enter your first name'
              value={firstName}
              onChange={(e) => {setFirstName(e.target.value)}}
            />
          </label>
          <label htmlFor='last-name'>Last Name:
            <input
              autoComplete='family-name'
              name='last-name'
              id='last-name'
              type='text'
              placeholder='Enter your last name'
              value={lastName}
              onChange={(e) => {setLastName(e.target.value)}}
            />
          </label>
          <input type='submit' value='submit' aria-label='Submit button'/>
        </form>
      </section>
    </main>
  )
}

import { useEffect, useState } from 'react'
import { usePost } from '../hooks/usePost';
import type { HandleSubmitEvent, RegisterFormData } from '../components/type/submitInterface';

const REGISTER_URL:string = 'http://localhost:3000/auth/register';

export default function Register(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { execute, responseData, loading, error} = usePost(REGISTER_URL);

  const handleSubmit = (e: HandleSubmitEvent) => {
    e.preventDefault();
    execute({ email, password, firstName, lastName } as RegisterFormData);
  }
  
  useEffect(() => {
    if (responseData){
      try {
        localStorage.setItem("email", responseData.email);
        localStorage.setItem("displayName", responseData.displayName);
        localStorage.setItem("localId", responseData.localId);
      } catch (error) {
        console.log(error);
      }
    }
  }, [responseData])

  return (
    <main>
      <section>
        <h2>Register</h2>
        {!loading && error ? (
          <p>{error}</p>
        ) : (
          <p>Enter email and password.</p>
        )}
        <form onSubmit={handleSubmit}>
          <label>Email:</label>
          <input
            type='email'
            placeholder='Enter your email'
            value={email}
            onChange={(e) => {setEmail(e.target.value)}}
          />
          <label>Password:</label>
          <input
            type='password'
            placeholder='Enter your password'
            value={password}
            onChange={(e) => {setPassword(e.target.value)}}
          />
          <label>First Name:</label>
          <input
            type='text'
            placeholder='Enter your first name'
            value={firstName}
            onChange={(e) => {setFirstName(e.target.value)}}
          />
          <label>Last Name:</label>
          <input
            type='text'
            placeholder='Enter your last name'
            value={lastName}
            onChange={(e) => {setLastName(e.target.value)}}
          />
          <input type='submit'/>
        </form>
      </section>
    </main>
  )
}

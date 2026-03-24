import React, { useEffect, useState } from 'react'
import { usePost } from '../hooks/useLoginPost';

const LOGIN_URL:string = 'http://localhost:3000/login';

export default function App(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { execute, responseData, loading, error} = usePost(LOGIN_URL);

  interface LoginFormData {
    email: string;
    password: string;
  }

  interface HandleSubmitEvent extends React.SyntheticEvent<HTMLFormElement> {}

  const handleSubmit = (e: HandleSubmitEvent) => {
    e.preventDefault();
    execute({ email, password } as LoginFormData);
  }

  useEffect(() => {
    if (responseData){
      // Need to store in secure storage.
      console.log(responseData);
    }
  }, [responseData])

  return (
    <main>
      <section>
        <h2>Login</h2>
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
          <input type='submit'/>
        </form>
      </section>
    </main>
  )
}

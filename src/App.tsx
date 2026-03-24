import { useState } from 'react'
import { usePost } from '../hooks/usePost';

const URL = 'http://localhost:3000/login';

function App() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const { execute, response, loading, error} = usePost(URL, "");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    execute({ email, pass });
  }

  return (
    <main>
      <section>
        <h2>Login</h2>
        {response && !response.ok && !loading && error ? (
          <p>{error}</p>
        ) : (
          <p>Enter email and password.</p>
        )}
        <form onSubmit={handleSubmit}>
          <label>Email:</label>
          <input
            type='text'
            placeholder='Email'
            value={email}
            onChange={(e) => {setEmail(e.target.value)}}
          />
          <label>Password:</label>
          <input
            type='password'
            placeholder='Email'
            value={pass}
            onChange={(e) => {setPass(e.target.value)}}
          />
          <input type='submit'/>
        </form>
      </section>
    </main>
  )
}

export default App

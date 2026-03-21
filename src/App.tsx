import { useState } from 'react'

function App() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email: ' + email)
    console.log('Pass:' + pass)
  }

  return (
    <main>
      <section>
        <h2>Login</h2>
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

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PageNotFound(){
  const navigate = useNavigate();

  useEffect(() => {
    const timerId = setTimeout(() => {
      navigate('/', { replace: true });
    }, 3000);

    return () => clearTimeout(timerId);
  }, []);

  return (
    <main>
      <section aria-labelledby='page-heading'>
        <h1 id='page-heading'>Page not found</h1>
        <p>Redirecting you in 3 seconds...</p>
      </section>
    </main>
  )
}
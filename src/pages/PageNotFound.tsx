import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PageNotFound(){
  const navigate = useNavigate();

  useEffect(() => {
    const timerId = setTimeout(() => {
      navigate('/', { replace: true });
    }, 1500);

    return () => clearTimeout(timerId);
  }, [navigate]);

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: 'var(--bg-main)',
      gap: '8px',
    }}>
      <section aria-labelledby='page-heading' style={{ textAlign: 'center' }}>
        <h1 id='page-heading' style={{ fontFamily: 'var(--font-heading)', fontSize: '48px', color: 'var(--text-primary)' }}>404</h1>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>Page not found. Redirecting...</p>
      </section>
    </main>
  )
}
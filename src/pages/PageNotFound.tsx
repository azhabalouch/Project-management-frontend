import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PageNotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const timerId = setTimeout(() => {
      navigate('/', { replace: true });
    }, 1500);

    return () => clearTimeout(timerId);
  }, [navigate]);

  return (
    <main className='flex min-h-screen items-center justify-center bg-[var(--bg-main)] px-6'>
      <section aria-labelledby='page-heading' className='text-center'>
        <h1 id='page-heading' className='font-heading text-5xl font-medium text-[var(--text-primary)]'>404</h1>
        <p className='mt-2 text-[var(--text-secondary)]'>Page not found. Redirecting...</p>
      </section>
    </main>
  );
}
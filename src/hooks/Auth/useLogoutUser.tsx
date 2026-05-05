import { useState, useCallback } from 'react';
import { AUTH_URLS } from '../../apis';

export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const logout = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(AUTH_URLS.logout, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`Logout failed with status ${res.status}`);
      }

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      return false;
    } finally {
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
      setLoading(false);
    }
  }, []);

  return { logout, loading, error };
}
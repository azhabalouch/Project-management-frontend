import { useCallback } from 'react';
import { AUTH_URLS } from '../../apis';

export const useIsUserAuth = () => {
  const verifyUser = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(AUTH_URLS.verify, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) return false;

      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) return false;

      const data = await res.json();
      return data?.user === 'Verified';
    } catch {
      return false;
    }
  }, []);

  return { verifyUser };
}
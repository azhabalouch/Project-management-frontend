import { useGet } from '../useGet';
import { useCallback } from 'react';
import { AUTH_URLS } from '../../apis';

export const useIsUserAuth = () => {
  const { execute } = useGet(AUTH_URLS.verify);

  const verifyUser = useCallback(async () => {
    try {
      const response = await execute();
      if (response?.user === 'Verified') return true;
      return false;
    } catch {
      return false;
    }
  }, []);

  return { verifyUser };
}
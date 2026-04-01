import { useGet } from '../useGet';
import { useCallback } from 'react';

const VERIFY_URL:string  = 'http://localhost:3000/auth/verify';

export const useIsUserAuth = () => {
  const { execute } = useGet(VERIFY_URL);

  const verifyUser = useCallback(async () => {
    try {
      const response = await execute();
      if (response?.user === "Verified") return true;
      return false;
    } catch {
      return false;
    }
  }, []);

  return { verifyUser };
}
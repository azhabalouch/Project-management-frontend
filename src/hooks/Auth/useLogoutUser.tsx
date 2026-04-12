import { useGet } from '../useGet';

const LOGOUT_URL = 'http://localhost:3000/auth/logout';

export const useLogout = () => {
  const { execute, loading, error } = useGet(LOGOUT_URL);

  const logout = async () => {
    try {
      await execute();
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return { logout, loading, error };
}
import { useGet } from '../useGet';
import { AUTH_URLS } from '../../apis';


export const useLogout = () => {
  const { execute, loading, error } = useGet(AUTH_URLS.logout);

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
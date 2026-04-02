import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useIsUserAuth } from '../hooks/Auth/useIsUserAuth';
import { useNavigate } from 'react-router-dom';

export const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { verifyUser } = useIsUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccess = async () => {
      const authStatus = await verifyUser();
      setIsAuthenticated(authStatus);
    };

    verifyAccess();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      const timerId = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);

      return () => clearTimeout(timerId);
    }
  }, [isAuthenticated]);

  if (isAuthenticated === null) return <div>Loading...</div>;
  if (isAuthenticated === false) return <><h1>Not logged In</h1><p>Redirecting in 3 seconds...</p></>;

  return <Outlet />;
};
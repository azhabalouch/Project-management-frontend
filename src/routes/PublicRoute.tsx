import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useIsUserAuth } from '../hooks/Auth/useIsUserAuth';
import { useNavigate } from 'react-router-dom';

export const PublicRoute = () => {
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
    if (isAuthenticated === true) {
      const timerId = setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);

      return () => clearTimeout(timerId);
    }
  }, [isAuthenticated]);

  if (isAuthenticated === null) return <div>Loading...</div>;
  if (isAuthenticated === true) return <><h1>Already logged In</h1><p>Redirecting in 3 seconds...</p></>;

  return <Outlet />;
};
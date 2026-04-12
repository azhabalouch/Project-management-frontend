import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useIsUserAuth } from '../hooks/Auth/useIsUserAuth';

interface AuthGateProps {
  allowWhenAuthenticated: boolean;
  redirectTo: string;
  loadingLabel: string;
  blockedTitle: string;
  blockedMessage: string;
}

export const AuthGate = ({
  allowWhenAuthenticated,
  redirectTo,
  loadingLabel,
  blockedTitle,
  blockedMessage,
}: AuthGateProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { verifyUser } = useIsUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccess = async () => {
      const authStatus = await verifyUser();
      setIsAuthenticated(authStatus);
    };

    verifyAccess();
  }, [verifyUser]);

  useEffect(() => {
    const shouldRedirect =
      (allowWhenAuthenticated && isAuthenticated === false) ||
      (!allowWhenAuthenticated && isAuthenticated === true);

    if (!shouldRedirect) {
      return;
    }

    const timerId = setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, 3000);

    return () => clearTimeout(timerId);
  }, [allowWhenAuthenticated, isAuthenticated, navigate, redirectTo]);

  if (isAuthenticated === null) return <div>{loadingLabel}</div>;

  const isBlocked =
    (allowWhenAuthenticated && isAuthenticated === false) ||
    (!allowWhenAuthenticated && isAuthenticated === true);

  if (isBlocked) return <><h1>{blockedTitle}</h1><p>{blockedMessage}</p></>;

  return <Outlet />;
};
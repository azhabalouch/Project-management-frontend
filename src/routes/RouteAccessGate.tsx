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
    }, 1500);

    return () => clearTimeout(timerId);
  }, [allowWhenAuthenticated, isAuthenticated, navigate, redirectTo]);

  if (isAuthenticated === null) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'transparent',
        gap: '12px',
      }}>
        <div className='loading-spinner' style={{ width: '32px', height: '32px', border: '3px solid var(--bg-input)', borderTopColor: 'var(--btn-primary-bg)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>{loadingLabel}</span>
      </div>
    );
  }

  const isBlocked =
    (allowWhenAuthenticated && isAuthenticated === false) ||
    (!allowWhenAuthenticated && isAuthenticated === true);

  if (isBlocked) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'transparent',
        gap: '8px',
      }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)' }}>{blockedTitle}</h1>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>{blockedMessage}</p>
      </div>
    );
  }

  return <Outlet />;
};
import { AuthGate } from './RouteAccessGate.tsx';

export const PublicRoute = () => {
  return (
    <AuthGate
      allowWhenAuthenticated={false}
      redirectTo='/'
      loadingLabel='Loading...'
      blockedTitle='Already logged In'
      blockedMessage='Redirecting in 3 seconds...'
    />
  );
};
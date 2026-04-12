import { AuthGate } from './RouteAccessGate.tsx';

export const ProtectedRoute = () => {
  return (
    <AuthGate
      allowWhenAuthenticated={true}
      redirectTo='/login'
      loadingLabel='Loading...'
      blockedTitle='Not logged In'
      blockedMessage='Redirecting in 3 seconds...'
    />
  );
};
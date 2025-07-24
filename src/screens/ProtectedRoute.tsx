import { Navigate } from 'react-router-dom';
import { useAuth } from './PasswordProtect/PasswordProtect';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/password" replace />;
  }

  return children;
};
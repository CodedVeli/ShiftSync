import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'MANAGER' | 'STAFF';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
      return <Navigate to="/dashboard" replace />;
    }
    if (requiredRole === 'MANAGER' && user.role !== 'MANAGER' && user.role !== 'ADMIN') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

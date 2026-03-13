import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useMe } from '../../api/hooks/useAuth';
import { initSocket, closeSocket } from '../../lib/socket';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { token, user, setUser } = useAuthStore();
  const { data: meData } = useMe();

  useEffect(() => {
    if (meData && !user) {
      setUser(meData);
    }
  }, [meData, user, setUser]);

  useEffect(() => {
    if (token) {
      initSocket(token);
    }
    return () => {
      closeSocket();
    };
  }, [token]);

  return <>{children}</>;
}

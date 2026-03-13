import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../client';
import { useAuthStore } from '../../store/authStore';

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => authApi.register(userData),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
  });
};

export const useMe = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: !!token,
    retry: false,
  });
};

import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../client';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  });
};

export const useStaff = () => {
  return useQuery({
    queryKey: ['staff'],
    queryFn: () => usersApi.getStaff(),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => usersApi.getOne(id),
    enabled: !!id,
  });
};

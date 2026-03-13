import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { availabilityApi } from '../client';

export const useMyAvailability = () => {
  return useQuery({
    queryKey: ['availability', 'me'],
    queryFn: availabilityApi.getMine,
  });
};

export const useCreateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: availabilityApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
};

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      availabilityApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
};

export const useDeleteAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: availabilityApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
};

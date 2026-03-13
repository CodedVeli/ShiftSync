import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { swapRequestsApi } from '../client';

export const useSwapRequests = () => {
  return useQuery({
    queryKey: ['swap-requests'],
    queryFn: swapRequestsApi.getAll,
  });
};

export const useCreateSwapRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: swapRequestsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swap-requests'] });
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const useAcceptSwapRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: swapRequestsApi.accept,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swap-requests'] });
    },
  });
};

export const useApproveSwapRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: swapRequestsApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swap-requests'] });
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const useCancelSwapRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: swapRequestsApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swap-requests'] });
    },
  });
};

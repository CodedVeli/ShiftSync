import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftsApi } from '../client';
import { message } from 'antd';

export const useShifts = (params?: { locationId?: string; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['shifts', params],
    queryFn: () => shiftsApi.getAll(params),
  });
};

export const useShift = (id: string) => {
  return useQuery({
    queryKey: ['shifts', id],
    queryFn: () => shiftsApi.getOne(id),
    enabled: !!id,
  });
};

export const useCreateShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shiftsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const useAssignStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shiftId, staffId }: { shiftId: string; staffId: string }) =>
      shiftsApi.assign(shiftId, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const useUnassignStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shiftId, staffId }: { shiftId: string; staffId: string }) =>
      shiftsApi.unassign(shiftId, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const useUpdateShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{
      locationId: string;
      startTime: string;
      endTime: string;
      requiredSkillId: string;
      headcountNeeded: number;
    }> }) => shiftsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const useDeleteShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shiftsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const usePublishSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shiftIds: string[]) => shiftsApi.publishSchedule(shiftIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      message.success('Schedule published successfully');
    },
    onError: () => {
      message.error('Failed to publish schedule');
    },
  });
};

export const useOverrideAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shiftId, staffId, reason, constraintViolated }: {
      shiftId: string;
      staffId: string;
      reason: string;
      constraintViolated: string;
    }) => shiftsApi.override(shiftId, staffId, reason, constraintViolated),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      message.success('Staff assigned with manager override');
    },
  });
};

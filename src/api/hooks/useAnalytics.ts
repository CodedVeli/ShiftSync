import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../client';

export const useOvertimeAnalytics = (params?: { locationId?: string; weekStart?: string }) => {
  return useQuery({
    queryKey: ['analytics', 'overtime', params],
    queryFn: () => analyticsApi.getOvertime(params),
  });
};

export const useFairnessAnalytics = (params?: { locationId?: string; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['analytics', 'fairness', params],
    queryFn: () => analyticsApi.getFairness(params),
  });
};

export const useHoursDistribution = (params?: { locationId?: string; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['analytics', 'hours-distribution', params],
    queryFn: () => analyticsApi.getHoursDistribution(params),
  });
};

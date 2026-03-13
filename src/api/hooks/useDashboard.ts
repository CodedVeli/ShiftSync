import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../client';

export const useOnDuty = () => {
  return useQuery({
    queryKey: ['dashboard', 'on-duty'],
    queryFn: dashboardApi.getOnDuty,
    refetchInterval: 30000,
  });
};

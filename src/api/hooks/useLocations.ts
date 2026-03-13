import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '../client';

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: locationsApi.getAll,
  });
};

export const useLocation = (id: string) => {
  return useQuery({
    queryKey: ['locations', id],
    queryFn: () => locationsApi.getOne(id),
    enabled: !!id,
  });
};

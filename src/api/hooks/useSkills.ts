import { useQuery } from '@tanstack/react-query';
import { skillsApi } from '../client';

export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: () => skillsApi.getAll(),
  });
};

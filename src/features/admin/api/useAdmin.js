import { useQuery } from '@tanstack/react-query';
import { getAdminStatisticsApi } from './adminApi';

export const useAdminStatistics = ({ year } = {}, options = {}) => {
  return useQuery({
    queryKey: ['admin-statistics', year],
    queryFn: () => getAdminStatisticsApi({ year }),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

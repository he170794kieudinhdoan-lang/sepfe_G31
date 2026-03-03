import { useQuery } from '@tanstack/react-query';
import { getJobs } from './getJobs';
import { getJobDetail } from './jobApi';

export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useJobDetail = (jobId) => {
  return useQuery({
    queryKey: ['jobDetail', jobId],
    queryFn: () => getJobDetail(jobId),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

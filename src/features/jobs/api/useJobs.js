
import { useQuery } from '@tanstack/react-query';
import { getJobs } from './getJobs';

export const useJobs = () => {
    return useQuery({
        queryKey: ['jobs'],
        queryFn: getJobs,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
};

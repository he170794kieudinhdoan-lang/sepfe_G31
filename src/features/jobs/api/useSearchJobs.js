import { useQuery } from '@tanstack/react-query';
import { searchJobs } from './searchJobs';

/**
 * React Query hook for job search with filters
 * @param {Object} filters - Bộ lọc tìm kiếm
 * @param {Object} options - React Query options (optional)
 */
export const useSearchJobs = (filters = {}, options = {}) => {
    return useQuery({
        queryKey: ['job-search', filters],
        queryFn: () => searchJobs(filters),
        staleTime: 2 * 60 * 1000, // 2 phút
        retry: 1,
        keepPreviousData: true,
        ...options,
    });
};

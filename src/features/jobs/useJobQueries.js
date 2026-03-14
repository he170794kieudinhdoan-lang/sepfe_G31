import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';

/**
 * Hook to search jobs (e.g., for Employer Dashboard or Job Listing)
 */
export const useSearchJobs = (params) => {
    return useQuery({
        queryKey: ['job-search', params],
        queryFn: async () => {
            const res = await apiClient.get('/job/search', { params });
            return res; // Usually the apiClient will return the unboxed `data.data` or similar. Let's see how it behaves based on structure
        },
        keepPreviousData: true, // Keep the previous data while fetching the new one for a better UX
    });
};

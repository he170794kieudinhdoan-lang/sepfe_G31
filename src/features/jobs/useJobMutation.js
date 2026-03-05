import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createJobApi,
  updateJobApi,
  deleteJobApi,
} from '@/features/jobs/api/jobApi';

/**
 * Shared invalidate logic
 */
const invalidateJobQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['job-search'] });
  queryClient.invalidateQueries({ queryKey: ['job-detail'] });
  queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
};

/**
 * ================================
 * CREATE JOB
 * ================================
 */
export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      createJobApi({
        companyId: 1, // hard code tạm
        payload,
      }),
    onSuccess: (data) => {
      invalidateJobQueries(queryClient);
    },

  });
};

/**
 * ================================
 * UPDATE JOB
 * ================================
 */
export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateJobApi,
    onSuccess: () => {
      invalidateJobQueries(queryClient);
    },
  });
};

/**
 * ================================
 * DELETE JOB
 * ================================
 */
export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJobApi,

    onSuccess: () => {
      invalidateJobQueries(queryClient);
    },

    onError: (error) => {
      console.error(
        error?.response?.data?.message || 'Delete job failed'
      );
    },
  });
};

export const useJobDetail = (jobId) => {
  return useQuery({
    queryKey: ['job-detail', jobId],
    queryFn: async () => {
      const res = await apiClient.get(`/job/${jobId}`)
      return res.data.data
    },
    enabled: !!jobId,
  })
}
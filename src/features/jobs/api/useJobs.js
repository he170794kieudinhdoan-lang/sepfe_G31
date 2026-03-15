import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createJobApi,
  updateJobApi,
  deleteJobApi,
  getJobDetail,
  getRelatedJobs,
  searchJobs,
  getJobsForEmployer,
  getSectorsWithOccupations,
  getOccupationsBySector,
  getProvinces,
  getWards,
  getJobApplyApi,
  applyJobApi,
  getMyApplicationsApi,
  cancelApplyJobApi,
} from './jobApi';

// ===== JOB DETAIL =====

export const useJobDetail = (jobId) => {
  return useQuery({
    queryKey: ['job-detail', jobId],
    queryFn: () => getJobDetail(jobId),
    enabled: !!jobId,
  });
};

export const useRelatedJobs = (jobId) => {
  return useQuery({
    queryKey: ['related-jobs', jobId],
    queryFn: () => getRelatedJobs(jobId),
    enabled: !!jobId,
  });
};

// ===== JOB SEARCH =====

export const useSearchJobs = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['job-search', filters],
    queryFn: () => searchJobs(filters),
    staleTime: 2 * 60 * 1000,
    retry: 1,
    keepPreviousData: true,
    ...options,
  });
};

export const useJobsForEmployer = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['jobs-for-employer', filters],
    queryFn: () => getJobsForEmployer(filters),
    staleTime: 2 * 60 * 1000,
    retry: 1,
    keepPreviousData: true,
    ...options,
  });
};

// ===== JOB MUTATIONS =====

const invalidateJobQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['job-search'] });
  queryClient.invalidateQueries({ queryKey: ['jobs-for-employer'] });
  queryClient.invalidateQueries({ queryKey: ['job-detail'] });
  queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      createJobApi({
        payload,
      }),
    onSuccess: () => {
      invalidateJobQueries(queryClient);
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateJobApi,
    onSuccess: () => {
      invalidateJobQueries(queryClient);
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteJobApi,
    onSuccess: () => {
      invalidateJobQueries(queryClient);
    },
    onError: (error) => {
      console.error(error?.response?.data?.message || 'Delete job failed');
    },
  });
};

// ===== OCCUPATIONS =====

export const useGetSectorsWithOccupations = () => {
  return useQuery({
    queryKey: ['sectors-with-occupations'],
    queryFn: getSectorsWithOccupations,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useGetOccupationsBySector = (sectorId) => {
  return useQuery({
    queryKey: ['occupations-by-sector', sectorId],
    queryFn: () => getOccupationsBySector(sectorId),
    enabled: !!sectorId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// ===== PROVINCES =====

export const useGetProvinces = () => {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: getProvinces,
    staleTime: 2 * 60 * 1000,
    retry: 1,
    keepPreviousData: true,
  });
};

export const useGetWards = (wardsId) => {
  return useQuery({
    queryKey: ['wards', wardsId],
    queryFn: () => getWards(wardsId),
    enabled: !!wardsId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
    keepPreviousData: true,
  });
};
export const useJobApply = (jobId) => {
  return useQuery({
    queryKey: ['job-apply', jobId],
    queryFn: () => getJobApplyApi(jobId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!jobId,
  });
};

export const useApplyJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, payload }) => applyJobApi({ jobId, payload }),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['job-apply', jobId] });
      queryClient.invalidateQueries({ queryKey: ['job-detail', jobId] });
    },
  });
};

export const useMyApplications = () => {
  return useQuery({
    queryKey: ['my-applications'],
    queryFn: getMyApplicationsApi,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

export const useCancelApplyJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId) => cancelApplyJobApi(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });
};

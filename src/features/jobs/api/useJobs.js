import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  createJobApi,
  updateJobApi,
  deleteJobApi,
  getJobDetail,
  getRelatedJobs,
  searchJobs,
  getJobsForEmployer,
  getBoostedJobsApi,
  getBoostPackagesApi,
  createBoostCheckoutApi,
  createPostingCheckoutApi,
  confirmBoostPaymentApi,
  getSectorsWithOccupations,
  getOccupationsBySector,
  getProvinces,
  getWards,
  getJobApplyApi,
  applyJobApi,
  getMyApplicationsApi,
  cancelApplyJobApi,
  getEmployerApplications,
  updateApplicationStatus,
  getMatchedJobsApi,
  getMatchedWorkersApi,
  getConfigs,
  updateConfigs,
  getAllJobReportsApi,
  updateJobReportStatusApi,
  updateJobStatusApi,
} from './jobApi';
import { useToast } from '@/shared/contexts/ToastContext';

// ===== JOB DETAIL =====

export const useJobDetail = (jobId, options = {}) => {
  return useQuery({
    queryKey: ['job-detail', jobId],
    queryFn: () => getJobDetail(jobId),
    enabled: !!jobId,
    ...options,
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

export const useBoostedJobs = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['boosted-jobs', params],
    queryFn: () => getBoostedJobsApi(params),
    staleTime: 2 * 60 * 1000,
    retry: 1,
    keepPreviousData: true,
    ...options,
  });
};

export const useBoostPackages = (options = {}) => {
  return useQuery({
    queryKey: ['boost-packages'],
    queryFn: getBoostPackagesApi,
    staleTime: 60 * 1000,
    retry: 1,
    ...options,
  });
};

export const useEmployerApplications = (jobId) => {
  return useQuery({
    queryKey: ['employer-applications', jobId],
    queryFn: () => getEmployerApplications(jobId),
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

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateApplicationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
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

export const useCreateBoostCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBoostCheckoutApi,
    onSuccess: () => {
      invalidateJobQueries(queryClient);
    },
  });
};

export const useCreatePostingCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPostingCheckoutApi,
    onSuccess: () => {
      invalidateJobQueries(queryClient);
    },
  });
};

export const useConfirmBoostPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmBoostPaymentApi,
    onSuccess: () => {
      invalidateJobQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ['boosted-jobs'] });
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

export const useMyApplications = (options = {}) => {
  return useQuery({
    queryKey: ['my-applications'],
    queryFn: getMyApplicationsApi,
    staleTime: 2 * 60 * 1000,
    retry: 1,
    ...options,
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

//AI
export const useMatchedJobs = (options = {}) => {
  return useQuery({
    queryKey: ['matched-jobs'],
    queryFn: () => getMatchedJobsApi(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useMatchedWorkers = (jobId, limit = 10, options = {}) => {
  return useQuery({
    queryKey: ['matched-workers', jobId, limit],
    queryFn: () => getMatchedWorkersApi(jobId, limit),
    staleTime: 5 * 60 * 1000,
    enabled: !!jobId,
    ...options,
  });
};

export const useGetAiConfigs = () => {
  return useQuery({
    queryKey: ['ai-configs'],
    queryFn: getConfigs,
  });
};

export const useUpdateAiConfigs = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (configs) => updateConfigs(configs),
    onSuccess: () => {
      toast('Cập nhật cấu hình AI thành công', 'success');
      queryClient.invalidateQueries({ queryKey: ['ai-configs'] });
    },
    onError: (error) => {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        'Có lỗi xảy ra khi cập nhật cấu hình AI';
      toast(Array.isArray(message) ? message.join(', ') : message, 'error');
    },
  });
};

export const useGetAllJobReports = (status, page = 1, limit = 10, companyName, reporterName, fromDate, toDate) => {
  return useQuery({
    queryKey: ['job-reports', status, page, limit, companyName, reporterName, fromDate, toDate],
    queryFn: () => getAllJobReportsApi({ status, page, limit, companyName, reporterName, fromDate, toDate }),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};

export const useUpdateJobReportStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateJobReportStatusApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-reports'] });
    },
  });
};

export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateJobStatusApi,
    onSuccess: () => {
      invalidateJobQueries(queryClient);
    },
  });
};




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
  getNewestJobsApi,
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
  getSuitableApplicationsApi,
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

// Dữ liệu danh mục/tham chiếu ít thay đổi -> giữ "tươi" lâu để khỏi refetch.
const STATIC_STALE_TIME = 5 * 60 * 1000;

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
    retry: 1,
    keepPreviousData: true,
    ...options,
  });
};

export const useJobsForEmployer = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['jobs-for-employer', filters],
    queryFn: () => getJobsForEmployer(filters),
    retry: 1,
    keepPreviousData: true,
    ...options,
  });
};

export const useBoostedJobs = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['boosted-jobs', params],
    queryFn: () => getBoostedJobsApi(params),
    retry: 1,
    keepPreviousData: true,
    ...options,
  });
};

export const useNewestJobs = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['newest-jobs', params],
    queryFn: () => getNewestJobsApi(params),
    retry: 1,
    placeholderData: keepPreviousData,
    ...options,
  });
};

export const useBoostPackages = (options = {}) => {
  return useQuery({
    queryKey: ['boost-packages'],
    queryFn: getBoostPackagesApi,
    staleTime: STATIC_STALE_TIME,
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

export const useSuitableApplications = (jobId, page = 1, limit = 10, search = '', interviewStatus = 'ALL', slotId = 'ALL') => {
  return useQuery({
    queryKey: ['employer-suitable-applications', jobId, page, limit, search, interviewStatus, slotId],
    queryFn: () => getSuitableApplicationsApi(jobId, page, limit, search, interviewStatus, slotId),
    enabled: !!jobId,
    keepPreviousData: true,
  });
};

// ===== JOB MUTATIONS =====

const invalidateJobQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['job-search'] });
  queryClient.invalidateQueries({ queryKey: ['jobs-for-employer'] });
  queryClient.invalidateQueries({ queryKey: ['job-detail'] });
  queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
  queryClient.invalidateQueries({ queryKey: ['my-wallet'] });
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
    // Cập nhật lạc quan: đổi status của ứng viên ngay trong cache list employer.
    onMutate: async ({ applicationId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['employer-applications'] });
      const previous = queryClient.getQueriesData({
        queryKey: ['employer-applications'],
      });
      queryClient.setQueriesData(
        { queryKey: ['employer-applications'] },
        (old) => {
          if (!old || !Array.isArray(old.data)) return old;
          return {
            ...old,
            data: old.data.map((a) =>
              a?.id === applicationId ? { ...a, status } : a,
            ),
          };
        },
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteJobApi,
    // Cập nhật lạc quan: loại tin khỏi danh sách employer ngay lập tức.
    onMutate: async ({ jobId }) => {
      await queryClient.cancelQueries({ queryKey: ['jobs-for-employer'] });
      const previous = queryClient.getQueriesData({
        queryKey: ['jobs-for-employer'],
      });
      queryClient.setQueriesData({ queryKey: ['jobs-for-employer'] }, (old) => {
        if (!old || !Array.isArray(old.items)) return old;
        return {
          ...old,
          items: old.items.filter(
            (j) => j?.id !== jobId && String(j?.id) !== String(jobId),
          ),
        };
      });
      return { previous };
    },
    onError: (error, _vars, context) => {
      context?.previous?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      console.error(error?.response?.data?.message || 'Delete job failed');
    },
    onSettled: () => {
      invalidateJobQueries(queryClient);
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
    staleTime: STATIC_STALE_TIME,
    retry: 1,
  });
};

export const useGetOccupationsBySector = (sectorId) => {
  return useQuery({
    queryKey: ['occupations-by-sector', sectorId],
    queryFn: () => getOccupationsBySector(sectorId),
    enabled: !!sectorId,
    staleTime: STATIC_STALE_TIME,
    retry: 1,
  });
};

// ===== PROVINCES =====

export const useGetProvinces = () => {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: getProvinces,
    staleTime: STATIC_STALE_TIME,
    retry: 1,
    keepPreviousData: true,
  });
};

export const useGetWards = (wardsId) => {
  return useQuery({
    queryKey: ['wards', wardsId],
    queryFn: () => getWards(wardsId),
    enabled: !!wardsId,
    staleTime: STATIC_STALE_TIME,
    retry: 1,
    keepPreviousData: true,
  });
};
export const useJobApply = (jobId) => {
  return useQuery({
    queryKey: ['job-apply', jobId],
    queryFn: () => getJobApplyApi(jobId),
    retry: 1,
    enabled: !!jobId,
  });
};

export const useApplyJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, payload }) => applyJobApi({ jobId, payload }),
    // Cập nhật lạc quan: thêm ngay đơn APPLIED vào cache để nút "Ứng tuyển"
    // chuyển sang "Đã nộp đơn" mà không cần chờ refetch.
    onMutate: async ({ jobId }) => {
      await queryClient.cancelQueries({ queryKey: ['my-applications'] });
      const previous = queryClient.getQueryData(['my-applications']);
      queryClient.setQueryData(['my-applications'], (old) => {
        const list = Array.isArray(old) ? old : [];
        const exists = list.some((app) => {
          const appJobId = app?.jobId ?? app?.job?.id;
          return appJobId === jobId || String(appJobId) === String(jobId);
        });
        if (exists) return old;
        return [
          ...list,
          {
            jobId,
            job: { id: jobId },
            status: 'APPLIED',
            updatedAt: new Date().toISOString(),
          },
        ];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['my-applications'], context.previous);
      }
    },
    onSettled: (_data, _err, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['job-apply', jobId] });
      queryClient.invalidateQueries({ queryKey: ['job-detail', jobId] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });
};

export const useMyApplications = (options = {}) => {
  return useQuery({
    queryKey: ['my-applications'],
    queryFn: getMyApplicationsApi,
    retry: 1,
    ...options,
  });
};

export const useCancelApplyJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId) => cancelApplyJobApi(jobId),
    // Cập nhật lạc quan: đổi trạng thái đơn sang CANCELLED ngay trong cache.
    onMutate: async (jobId) => {
      await queryClient.cancelQueries({ queryKey: ['my-applications'] });
      const previous = queryClient.getQueryData(['my-applications']);
      queryClient.setQueryData(['my-applications'], (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((app) => {
          const appJobId = app?.job?.id ?? app?.jobId;
          const match =
            appJobId === jobId || String(appJobId) === String(jobId);
          return match ? { ...app, status: 'CANCELLED' } : app;
        });
      });
      return { previous };
    },
    onError: (_err, _jobId, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['my-applications'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });
};

//AI
export const useMatchedJobs = (options = {}) => {
  return useQuery({
    queryKey: ['matched-jobs'],
    queryFn: () => getMatchedJobsApi(),
    ...options,
  });
};

export const useMatchedWorkers = (jobId, limit = 10, options = {}) => {
  return useQuery({
    queryKey: ['matched-workers', jobId, limit],
    queryFn: () => getMatchedWorkersApi(jobId, limit),
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
    // Cập nhật lạc quan: đổi trạng thái tin ngay trong danh sách employer.
    onMutate: async ({ jobId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['jobs-for-employer'] });
      const previous = queryClient.getQueriesData({
        queryKey: ['jobs-for-employer'],
      });
      queryClient.setQueriesData({ queryKey: ['jobs-for-employer'] }, (old) => {
        if (!old || !Array.isArray(old.items)) return old;
        return {
          ...old,
          items: old.items.map((j) =>
            j?.id === jobId || String(j?.id) === String(jobId)
              ? { ...j, status }
              : j,
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      invalidateJobQueries(queryClient);
    },
  });
};




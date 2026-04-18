import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  getCompanies,
  getCompanyById,
  getCompaniesByStatus,
  reviewCompany,
  searchCompany,
  updateCompany,
  getMyCompany,
  createCompany,
  getCompanyReviews,
  createCompanyReview,
  updateCompanyReview,
  deleteCompanyReview,
  reportCompanyReview,
  getReviewReports,
  updateReviewReportStatusApi,
  hideCompanyReviewApi,
} from './getCompanies';

export const useGetCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => getCompanies(),
    staleTime: 0,
    retry: 1,
  });
};

export const useGetCompaniesById = (id) => {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () => getCompanyById(id),
    enabled: !!id,
    staleTime: 0,
    retry: 1,
  });
};

export const useGetCompaniesByStatus = (status) => {
  return useQuery({
    queryKey: ['companies', 'status', status],
    queryFn: () => getCompaniesByStatus(status),
    enabled: !!status,
    staleTime: 0,
    retry: 1,
  });
};

export const useReviewCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, rejectionReason }) =>
      reviewCompany(id, { status, rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useSearchCompanies = (params) => {
  return useQuery({
    queryKey: ['companies', 'search', params],
    queryFn: () => searchCompany(params),
  });
};

export const useGetMyCompany = () => {
  return useQuery({
    queryKey: ['my-company'],
    queryFn: async () => {
      try {
        const response = await getMyCompany();
        return response;
      } catch (error) {
        // 404 = chưa có công ty → trả null, không throw
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    retry: false, // không retry — 404 là trạng thái bình thường
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const response = await createCompany(formData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-company']);
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, formData }) => {
      const response = await updateCompany(companyId, formData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-company']);
    },
  });
};

// ===== COMPANY REVIEW HOOKS =====

// Lấy danh sách reviews
export const useGetCompanyReviews = (companyId) => {
  const key = String(companyId);
  return useQuery({
    queryKey: ['company-reviews', key],
    queryFn: () => getCompanyReviews(companyId),
    enabled: !!companyId,
    staleTime: 0,
  });
};

// Viết review mới
export const useCreateCompanyReview = (companyId) => {
  const queryClient = useQueryClient();
  const key = String(companyId);
  return useMutation({
    mutationFn: (payload) => createCompanyReview(companyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-reviews', key] });
    },
  });
};

// Sửa review
export const useUpdateCompanyReview = (companyId) => {
  const queryClient = useQueryClient();
  const key = String(companyId);
  return useMutation({
    mutationFn: ({ reviewId, payload }) => updateCompanyReview(reviewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-reviews', key] });
    },
  });
};

// Xóa review
export const useDeleteCompanyReview = (companyId) => {
  const queryClient = useQueryClient();
  const key = String(companyId);
  return useMutation({
    mutationFn: (reviewId) => deleteCompanyReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-reviews', key] });
    },
  });
};

// Báo cáo review (worker)
export const useReportCompanyReview = () => {
  return useMutation({
    mutationFn: ({ reviewId, payload }) => reportCompanyReview(reviewId, payload),
  });
};

// ===== MANAGER: REVIEW REPORTS =====

export const useGetReviewReports = (status, page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['review-reports', status, page, limit],
    queryFn: () => getReviewReports({ status, page, limit }),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};

export const useUpdateReviewReportStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateReviewReportStatusApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-reports'] });
    },
  });
};

export const useHideCompanyReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hideCompanyReviewApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-reports'] });
      queryClient.invalidateQueries({ queryKey: ['company-reviews'] });
    },
  });
};

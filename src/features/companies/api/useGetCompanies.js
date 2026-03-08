import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCompanies,
  getCompanyById,
  getCompaniesByStatus,
  reviewCompany,
  searchCompany,
  updateCompany,
  getMyCompany,
  createCompany,
} from './getCompanies';

export const useGetCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => getCompanies(),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

export const useGetCompaniesById = (id) => {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () => getCompanyById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

export const useGetCompaniesByStatus = (status) => {
  return useQuery({
    queryKey: ['companies', 'status', status],
    queryFn: () => getCompaniesByStatus(status),
    enabled: !!status,
    staleTime: 2 * 60 * 1000,
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

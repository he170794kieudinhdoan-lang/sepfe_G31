import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPaymentPackageApi,
  getAdminStatisticsApi,
  getPaymentPackagesApi,
  updatePaymentPackageApi,
} from './adminApi';

export const useAdminStatistics = ({ year } = {}, options = {}) => {
  return useQuery({
    queryKey: ['admin-statistics', year],
    queryFn: () => getAdminStatisticsApi({ year }),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const usePaymentPackages = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['admin-payment-packages', params],
    queryFn: () => getPaymentPackagesApi(params),
    staleTime: 60 * 1000,
    ...options,
  });
};

export const useCreatePaymentPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPaymentPackageApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payment-packages'] });
      queryClient.invalidateQueries({ queryKey: ['boost-packages'] });
    },
  });
};

export const useUpdatePaymentPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePaymentPackageApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payment-packages'] });
      queryClient.invalidateQueries({ queryKey: ['boost-packages'] });
    },
  });
};

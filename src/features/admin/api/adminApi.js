import { apiClient } from '@/shared/api/apiClient';

export const getAdminStatisticsApi = async ({ year } = {}) => {
  const response = await apiClient.get('/admin/statistics', { params: { year } });
  return response;
};

export const getPaymentPackagesApi = async (params = {}) => {
  return await apiClient.get('/admin/payment-packages', { params });
};

export const createPaymentPackageApi = async (payload) => {
  return await apiClient.post('/admin/payment-packages', payload);
};

export const updatePaymentPackageApi = async ({ id, payload }) => {
  return await apiClient.patch(`/admin/payment-packages/${id}`, payload);
};

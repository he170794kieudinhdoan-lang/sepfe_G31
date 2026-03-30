import { apiClient } from '@/shared/api/apiClient';

export const getAdminStatisticsApi = async ({ year } = {}) => {
  const response = await apiClient.get('/admin/statistics', { params: { year } });
  return response;
};

import { apiClient } from '@/shared/api/apiClient';

export const getTermsCondition = async () => {
  const response = await apiClient.get('/terms-conditions');
  return response;
};

export const updateTermsCondition = async (id, data) => {
  const response = await apiClient.patch(`/terms-conditions/${id}`, data);
  return response;
};

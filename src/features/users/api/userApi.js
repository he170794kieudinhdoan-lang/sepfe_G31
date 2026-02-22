import { apiClient } from '@/shared/api/apiClient';

export const getUsers = async () => {
  return apiClient.get('/user/user-info');
};

import { apiClient } from '@/shared/api/apiClient';

export const getUsers = async () => {
  return apiClient.get('/user/user-info');
};

export const updateUserInfo = async (formData) => {
  return apiClient.put('/user/user-info', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getWorkerProfile = async () => {
  return apiClient.get('/user/worker-profile');
};

export const createWorkerProfile = async (body) => {
  return apiClient.post('/user/worker-profile', body);
};

export const updateWorkerProfile = async (body) => {
  return apiClient.put('/user/worker-profile', body);
};

export const getOccupations = async () => {
  return apiClient.get('/occupations/grouped-by-sector');
};

export const getOccupationsBySector = async (sectorId) => {
  return apiClient.get(`/occupations/sector/${sectorId}`);
};

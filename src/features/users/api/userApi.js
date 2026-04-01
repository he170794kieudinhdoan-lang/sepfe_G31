import { apiClient } from '@/shared/api/apiClient';

export const getUsers = async () => {
  return apiClient.get('/user/user-info');
};

export const getAllUsersPaginated = async (params) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
  );
  return apiClient.get('/user/list', { params: cleanParams });
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

export const deleteAccount = async () => {
  return apiClient.put('/user/delete-account');
};

export const changePassword = async (data) => {
  return apiClient.put('/user/change-password', data);
};

export const getOccupations = async () => {
  return apiClient.get('/occupations/grouped-by-sector');
};

export const getOccupationsBySector = async (sectorId) => {
  return apiClient.get(`/occupations/sector/${sectorId}`);
};

export const updateUserStatus = async (userId, status) => {
  return apiClient.put(`/user/${userId}/status`, { status });
};

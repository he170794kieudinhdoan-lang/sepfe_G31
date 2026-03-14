import { apiClient } from '@/shared/api/apiClient';

export const getCompanies = async () => {
  const response = await apiClient.get('/company');
  return response;
};

export const getCompanyById = async (id) => {
  const response = await apiClient.get(`/company/${id}`);
  return response;
};

export const getCompaniesByStatus = async (status) => {
  const response = await apiClient.get(`/company/status/${status}`);
  return response;
};

export const reviewCompany = async (id, { status, rejectionReason }) => {
  const response = await apiClient.patch(`/company/review/${id}`, {
    status,
    rejectionReason,
  });
  return response;
};

export const searchCompany = async (params) => {
  const response = await apiClient.get('/company/search', { params });
  return response;
};

export const createCompany = async (formData) => {
  const response = await apiClient.post('/company/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response;
};

export const updateCompany = async (companyId, formData) => {
  const response = await apiClient.put(
    `/company/update/${companyId}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return response;
};

export const getMyCompany = async () => {
  const response = await apiClient.get('/company/owner');
  return response;
};

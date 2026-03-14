import { apiClient, apiClientCustom } from '@/shared/api/apiClient';

// ===== JOB CRUD =====

export const createJobApi = async ({ companyId, payload }) => {
  const res = await apiClient.post(`/job/${companyId}`, payload);
  return res.data;
};

export const updateJobApi = async ({ companyId, jobId, payload }) => {
  const res = await apiClient.put(`/job/${companyId}/jobs/${jobId}`, payload);
  return res.data;
};

export const deleteJobApi = async ({ companyId, jobId }) => {
  const res = await apiClient.delete(`/job/${companyId}/jobs/${jobId}`);
  return res.data;
};

export const getJobDetail = async (id) => {
  return await apiClient.get(`/job/${id}`);
};

export const getRelatedJobs = async (id) => {
  return await apiClient.get(`/job/${id}/related`);
};

// ===== SEARCH =====

export const searchJobs = async (params = {}) => {
  const cleanParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      cleanParams[key] = value;
    }
  });
  return await apiClient.get('/job/search', { params: cleanParams });
};

// ===== OCCUPATIONS =====

export const getSectorsWithOccupations = async () => {
  return await apiClient.get('/occupations/grouped-by-sector');
};

export const getOccupationsBySector = async (sectorId) => {
  return await apiClient.get(`/occupations/sector/${sectorId}`);
};

// ===== PROVINCES =====

export const getProvinces = async () => {
  const response = await apiClientCustom(
    'https://provinces.open-api.vn/api/p/',
  ).get();
  return { provinces: response };
};

export const getWards = async (wardsId) => {
  const response = await apiClientCustom(
    `https://provinces.open-api.vn/api/p/${wardsId}?depth=2`,
  ).get();
  return { communes: response.districts };
};

import { apiClient, apiClientCustom } from '@/shared/api/apiClient';

// ===== JOB CRUD =====

export const createJobApi = async ({ payload }) => {
  const res = await apiClient.post(`/job`, payload);
  return res.data;
};

export const updateJobApi = async ({ jobId, payload }) => {
  const res = await apiClient.put(`/job/${jobId}`, payload);
  return res.data;
};

export const deleteJobApi = async ({ jobId }) => {
  const res = await apiClient.delete(`/job/${jobId}`);
  return res.data;
};

export const getJobDetail = async (id) => {
  const res = await apiClient.get(`/job/${id}`);
  return res.data;
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

export const getJobsForEmployer = async (params = {}) => {
  const cleanParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      cleanParams[key] = value;
    }
  });
  return await apiClient.get('/job/get-for-employer', { params: cleanParams });
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

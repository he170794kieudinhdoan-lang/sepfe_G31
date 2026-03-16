import { apiClient, apiClientCustom } from '@/shared/api/apiClient';

// ===== JOB CRUD =====

export const createJobApi = async ({ payload }) => {
  return await apiClient.post(`/job`, payload);
};

export const updateJobApi = async ({ jobId, payload }) => {
  return await apiClient.put(`/job/${jobId}`, payload);
};

export const deleteJobApi = async ({ jobId }) => {
  return await apiClient.delete(`/job/${jobId}`);
};

// ===== JOB DETAIL =====

export const getJobDetail = async (id) => {
  return await apiClient.get(`/job/${id}`);
};

export const getJobDetailApi = async (jobId) => {
  const res = await apiClient.get(`/job/${jobId}`);
  console.log('RAW RESPONSE:', res.data);
  return res.data;
};

export const getRelatedJobs = async (id) => {
  return await apiClient.get(`/job/${id}/related`);
};

// ===== APPLY =====

export const getJobApplyApi = async (jobId) => {
  const res = await apiClient.get(`/job/${jobId}/apply-form`);
  console.log('Job apply form:', res);
  return res;
};

export const applyJobApi = async ({ jobId, payload }) => {
  const res = await apiClient.post(`/job/${jobId}/apply`, payload);
  return res.data;
};

export const getMyApplicationsApi = async () => {
  const res = await apiClient.get('/job/me/applications');
  return res.data;
};

export const cancelApplyJobApi = async (jobId) => {
  const res = await apiClient.patch(`/job/${jobId}/cancel-apply`);
  return res.data;
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

export const getEmployerApplications = async (jobId) => {
  const params = jobId ? { jobId } : {};
  return await apiClient.get('/job/employer/applications', { params });
};

export const updateApplicationStatus = async ({ applicationId, status }) => {
  return await apiClient.put(`/job/applications/${applicationId}/status`, { status });
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

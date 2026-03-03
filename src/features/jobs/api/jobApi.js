import { apiClient } from '@/shared/api/apiClient';

/**
 * CREATE JOB
 */
export const createJobApi = async ({ companyId, payload }) => {
  const res = await apiClient.post(`/job/${companyId}`, payload);
  return res.data;
};

/**
 * UPDATE JOB
 */
export const updateJobApi = async ({ companyId, jobId, payload }) => {
  const res = await apiClient.put(`/job/${companyId}/jobs/${jobId}`, payload);
  return res.data;
};

/**
 * DELETE JOB
 */
export const deleteJobApi = async ({ companyId, jobId }) => {
  const res = await apiClient.delete(`/job/${companyId}/jobs/${jobId}`);
  return res.data;
};

// GET JOB DETAIL
export const getJobDetailApi = async (jobId) => {
  const res = await apiClient.get(`/job/${jobId}`);
  console.log('RAW RESPONSE:', res.data);
  return res.data;
};

export const getJobDetail = async (id) => {
  const data = await apiClient.get(`/job/${id}`);
  return data;
};

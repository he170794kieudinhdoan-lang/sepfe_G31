import { apiClient } from '@/shared/api/apiClient';

export const getEmployerOverviewApi = async () => {
  return await apiClient.get('/statistics/employer/overview');
};

export const getJobEngagementStatisticApi = (params) => {
  return apiClient.get('/statistics/employer/job-engagement', { params });
};

export const getJobStatisticApi = (jobId) => {
  return apiClient.get(`/statistics/employer/jobs/${jobId}/statistic`);
};

export const getEmployerPaymentsApi = async (params) => {
  return await apiClient.get('/statistics/employer/payments', { params });
};

export const getJobStatusApi = async () => {
  return await apiClient.get('/statistics/employer/job-status');
};

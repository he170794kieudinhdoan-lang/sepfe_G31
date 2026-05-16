import { apiClient } from '@/shared/api/apiClient';

export const getEmployerOverviewApi = async () => {
  return await apiClient.get('/statistics/employer/overview');
};

export const getDashboardStatsApi = (params) => {
  return apiClient.get('/statistics/employer/dashboard-stats', { params });
};

export const getJobFunnelApi = (jobId) => {
  return apiClient.get(`/statistics/employer/jobs/${jobId}/funnel`);
};

export const getEmployerPaymentsApi = async (params) => {
  return await apiClient.get('/statistics/employer/payments', { params });
};

export const getJobStatusApi = async () => {
  return await apiClient.get('/statistics/employer/job-status');
};

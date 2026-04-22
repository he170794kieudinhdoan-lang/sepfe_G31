import { apiClient } from '@/shared/api/apiClient';

export const getEmployerOverviewApi = async () => {
  return await apiClient.get('/statistics/employer/overview');
};

export const getApplicationFunnelApi = async (jobId) => {
  const params = jobId ? { jobId } : {};
  return await apiClient.get('/statistics/employer/application-funnel', {
    params,
  });
};

export const getEmployerPaymentsApi = async (params) => {
  return await apiClient.get('/statistics/employer/payments', { params });
};

export const getJobStatusApi = async () => {
  return await apiClient.get('/statistics/employer/job-status');
};

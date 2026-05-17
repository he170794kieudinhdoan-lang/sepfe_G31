import { useQuery } from '@tanstack/react-query';
import {
  getEmployerOverviewApi,
  getDashboardStatsApi,
  getJobFunnelApi,
  getEmployerPaymentsApi,
  getJobStatusApi,
} from './statisticApi';

export const useEmployerOverview = () => {
  return useQuery({
    queryKey: ['employer-overview'],
    queryFn: getEmployerOverviewApi,
    staleTime: 0,
    retry: 1,
  });
};

export const useDashboardStats = (params) => {
  return useQuery({
    queryKey: ['dashboard-stats', params],
    queryFn: () => getDashboardStatsApi(params),
    staleTime: 0,
    retry: 1,
  });
};

export const useJobFunnel = (jobId) => {
  return useQuery({
    queryKey: ['job-funnel', jobId],
    queryFn: () => getJobFunnelApi(jobId),
    enabled: !!jobId,
    staleTime: 0,
    retry: 1,
  });
};

export const useEmployerPayments = (params) => {
  return useQuery({
    queryKey: ['employer-payments', params],
    queryFn: () => getEmployerPaymentsApi(params),
    staleTime: 0,
    retry: 1,
  });
};

export const useJobStatus = () => {
  return useQuery({
    queryKey: ['job-status'],
    queryFn: getJobStatusApi,
    staleTime: 0,
    retry: 1,
  });
};

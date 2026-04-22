import { useQuery } from '@tanstack/react-query';
import {
  getEmployerOverviewApi,
  getApplicationFunnelApi,
  getEmployerPaymentsApi,
  getJobStatusApi,
} from './statisticApi';

export const useEmployerOverview = () => {
  return useQuery({
    queryKey: ['employer-overview'],
    queryFn: getEmployerOverviewApi,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

export const useApplicationFunnel = (jobId) => {
  return useQuery({
    queryKey: ['application-funnel', jobId],
    queryFn: () => getApplicationFunnelApi(jobId),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

export const useEmployerPayments = (params) => {
  return useQuery({
    queryKey: ['employer-payments', params],
    queryFn: () => getEmployerPaymentsApi(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useJobStatus = () => {
  return useQuery({
    queryKey: ['job-status'],
    queryFn: getJobStatusApi,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

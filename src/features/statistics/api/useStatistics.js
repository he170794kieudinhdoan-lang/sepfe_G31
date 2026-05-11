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
    staleTime: 0,
    retry: 1,
  });
};

export const useApplicationFunnel = (jobId) => {
  return useQuery({
    queryKey: ['application-funnel', jobId],
    queryFn: () => getApplicationFunnelApi(jobId),
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

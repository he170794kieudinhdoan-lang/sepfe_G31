import { useQuery } from '@tanstack/react-query';
import {
  getEmployerOverviewApi,
  getJobEngagementStatisticApi,
  getJobStatisticApi,
  getEmployerPaymentsApi,
  getJobStatusApi,
} from './statisticApi';

export const useEmployerOverview = (options = {}) => {
  return useQuery({
    queryKey: ['employer-overview'],
    queryFn: getEmployerOverviewApi,
    staleTime: 0,
    retry: 1,
    ...options,
  });
};

export const useJobEngagementStatistic = (params) => {
  return useQuery({
    queryKey: ['job-engagement-statistic', params],
    queryFn: () => getJobEngagementStatisticApi(params),
    staleTime: 0,
    retry: 1,
  });
};

export const useJobStatistic = (jobId) => {
  return useQuery({
    queryKey: ['job-statistic', jobId],
    queryFn: () => getJobStatisticApi(jobId),
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

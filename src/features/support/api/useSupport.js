import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as supportApi from './supportApi';

export const SUPPORT_TICKET_QUERY_KEY = ['support-tickets'];

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supportApi.createSupportTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPORT_TICKET_QUERY_KEY });
    },
  });
};

export const useSupportTickets = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [...SUPPORT_TICKET_QUERY_KEY, params],
    queryFn: () => supportApi.getSupportTickets(params),
    staleTime: 30 * 1000,
    ...options,
  });
};

export const useUpdateSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }) => supportApi.updateSupportTicket(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPORT_TICKET_QUERY_KEY });
    },
  });
};
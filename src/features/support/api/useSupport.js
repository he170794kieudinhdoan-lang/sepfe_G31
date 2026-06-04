import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import * as supportApi from './supportApi';

export const SUPPORT_TICKET_QUERY_KEY = ['support-tickets'];

/** Giữ cache khi chuyển tab / quay lại trang — chỉ refetch khi hết hạn hoặc sau mutate */
const SUPPORT_TICKETS_STALE_MS = 5 * 60 * 1000;
const SUPPORT_TICKETS_GC_MS = 30 * 60 * 1000;

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
    staleTime: SUPPORT_TICKETS_STALE_MS,
    gcTime: SUPPORT_TICKETS_GC_MS,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
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
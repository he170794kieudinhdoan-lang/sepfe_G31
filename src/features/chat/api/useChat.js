import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as chatApi from './chatApi';
import { useToast } from '@/shared/contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

export const useGetOrCreateConversation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ participantId }) =>
      chatApi.getOrCreateConversation(participantId),
    onSuccess: (data) => {
      navigate(`/chat/${data.id}`);
      //toast('Thành công');
    },
    onError: (e) => {
      toast(e?.message || 'Có lỗi xảy ra', 'error');
    },
  });
};

export const useGetUserConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.getUserConversations,
    staleTime: 0,
    retry: 1,
  });
};

export const useSendMessage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }) => chatApi.sendMessage(id, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (e) => {
      toast(e.message || 'Gửi tin nhắn thất bại', 'error');
    },
  });
};

export const useGetMessages = (id, query) => {
  return useQuery({
    queryKey: ['messages', id, query],
    queryFn: () => chatApi.getMessages(id, query),
    enabled: !!id,
    staleTime: 0, // Messages should always be fresh
    retry: 1,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => chatApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (e) => {
      toast(e.message || 'Cập nhật trạng thái đọc thất bại', 'error');
    },
  });
};

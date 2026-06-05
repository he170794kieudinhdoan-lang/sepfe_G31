import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as chatApi from './chatApi';
import { useToast } from '@/shared/contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';

// Khớp mọi query messages của 1 conversation, bất kể kiểu (số/chuỗi) của id
// và bất kể tham số phân trang/limit ở phần tử thứ 3 của queryKey.
const isMessagesQueryFor = (id) => (query) =>
  query.queryKey[0] === 'messages' &&
  String(query.queryKey[1]) === String(id);

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
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, content }) => chatApi.sendMessage(id, content),
    // Optimistic: chèn tin của mình vào ngay để UI phản hồi tức thì,
    // không phải chờ POST -> invalidate -> refetch mới hiện.
    onMutate: async ({ id, content }) => {
      await queryClient.cancelQueries({ queryKey: ['messages'] });
      const previous = queryClient.getQueriesData({ queryKey: ['messages'] });

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content,
        senderId: user?.id,
        status: 'SENT',
        createdAt: new Date().toISOString(),
        _optimistic: true,
      };

      queryClient.setQueriesData(
        {
          predicate: (query) =>
            isMessagesQueryFor(id)(query) && !query.queryKey[2]?.search,
        },
        (old) => (Array.isArray(old) ? [optimisticMessage, ...old] : old),
      );

      return { previous };
    },
    onError: (e, _variables, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast(e.message || 'Gửi tin nhắn thất bại', 'error');
    },
    onSuccess: (_, variables) => {
      // Chỉ làm mới đúng cuộc trò chuyện vừa gửi, không động vào các thread khác.
      queryClient.invalidateQueries({ predicate: isMessagesQueryFor(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
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
  const { toast } = useToast();
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

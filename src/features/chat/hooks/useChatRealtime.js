import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  isSupabaseConfigured,
  supabaseClient,
  chatRealtimeConfig,
} from '@/shared/api/supabaseClient';

export const useChatRealtime = (conversationId, userId) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSupabaseConfigured || !supabaseClient || !userId) {
      console.warn('[REALTIME] Supabase or User not configured:', {
        isSupabaseConfigured,
        hasClient: !!supabaseClient,
        userId,
      });
      return undefined;
    }

    const { schema, messageTable, conversationTable } = chatRealtimeConfig;
    const currentUserId = Number(userId);

    // 1. Listen for new messages in the CURRENT conversation
    const messageChannel = supabaseClient
      .channel(`chat-messages-${conversationId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema,
          table: messageTable,
        },
        (payload) => {

          // Case-insensitive property extraction
          const getProp = (obj, key) => {
            const foundKey = Object.keys(obj).find(
              (k) => k.toLowerCase() === key.toLowerCase(),
            );
            return foundKey ? obj[foundKey] : undefined;
          };

          const payloadConvId = getProp(payload.new, 'conversationId');

          // Use a broader comparison and invalidate EVERYTHING starting with 'messages'
          // to be absolutely sure we catch the query key.
          if (
            !conversationId ||
            String(payloadConvId) === String(conversationId)
          ) {
            // Invalidate broad keys
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });

            // Force refetch active queries
            setTimeout(() => {
              queryClient.refetchQueries({
                queryKey: ['messages'],
                type: 'active',
              });
              queryClient.refetchQueries({
                queryKey: ['conversations'],
                type: 'active',
              });
            }, 100);
          }
        },
      )
      .subscribe();

    // 2. Listen for conversation updates (to update the list order/last message)
    const conversationChannel = supabaseClient
      .channel(`chat-conversations-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema,
          table: conversationTable,
        },
        (payload) => {

          const getProp = (obj, key) => {
            const foundKey = Object.keys(obj).find(
              (k) => k.toLowerCase() === key.toLowerCase(),
            );
            return foundKey ? obj[foundKey] : undefined;
          };

          const u1 = getProp(payload.new, 'user1Id');
          const u2 = getProp(payload.new, 'user2Id');

          if (Number(u1) === currentUserId || Number(u2) === currentUserId) {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.refetchQueries({
              queryKey: ['conversations'],
              type: 'active',
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(messageChannel);
      supabaseClient.removeChannel(conversationChannel);
    };
  }, [conversationId, userId, queryClient]);
};

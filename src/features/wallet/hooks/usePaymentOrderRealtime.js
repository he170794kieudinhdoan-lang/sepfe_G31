import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabaseClient } from '@/shared/api/supabaseClient';

export const usePaymentOrderRealtime = ({ orderId, enabled = true, onEvent } = {}) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('IDLE');
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured || !supabaseClient || !orderId) {
      setStatus('DISABLED');
      return undefined;
    }

    const schema = import.meta.env.VITE_PAYMENT_ORDER_REALTIME_SCHEMA || 'public';
    const table = import.meta.env.VITE_PAYMENT_ORDER_REALTIME_TABLE || 'PaymentOrder';
    const channelName = `payment-order-realtime-${orderId}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const channel = supabaseClient.channel(channelName);
    let isUnmounted = false;
    setStatus('CONNECTING');

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema,
          table,
        },
        (payload) => {
          const payloadOrderId =
            payload?.new?.id ??
            payload?.old?.id ??
            payload?.new?.paymentOrderId ??
            payload?.old?.paymentOrderId;

          const normalizedPayloadOrderId =
            payloadOrderId === null || payloadOrderId === undefined
              ? null
              : String(Number(payloadOrderId));
          const normalizedOrderId = String(Number(orderId));

          if (
            normalizedPayloadOrderId !== null
            && normalizedPayloadOrderId !== normalizedOrderId
          ) {
            return;
          }

          // Invalidate order status query so UI refetches and shows latest status.
          queryClient.invalidateQueries({ queryKey: ['topup-order-status', orderId] });
          queryClient.refetchQueries({ queryKey: ['topup-order-status', orderId], type: 'active' });

          if (typeof onEventRef.current === 'function') {
            onEventRef.current(payload);
          }
        },
      )
      .subscribe((s, err) => {
        if (isUnmounted && s === 'CLOSED') return;
        setStatus(s);
        if (s === 'SUBSCRIBED') {
          queryClient.refetchQueries({ queryKey: ['topup-order-status', orderId], type: 'active' });
        }
        if (err) console.error('[PAYMENT-ORDER-REALTIME] subscribe error:', err);
      });

    return () => {
      isUnmounted = true;
      setStatus('CLOSED');
      supabaseClient.removeChannel(channel);
    };
  }, [enabled, queryClient, orderId]);

  return { realtimeStatus: status, isRealtimeSubscribed: status === 'SUBSCRIBED' };
};

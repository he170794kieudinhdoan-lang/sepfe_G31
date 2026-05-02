import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabaseClient } from '@/shared/api/supabaseClient';

export const usePointPricingRealtime = ({ enabled = true, onEvent } = {}) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('IDLE');
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured || !supabaseClient) {
      setStatus('DISABLED');
      return undefined;
    }

    const schema = import.meta.env.VITE_POINT_PRICING_REALTIME_SCHEMA || 'public';
    const table = import.meta.env.VITE_POINT_PRICING_REALTIME_TABLE || 'point_pricing';
    const channelName = `point-pricing-realtime-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const channel = supabaseClient.channel(channelName);
    let isUnmounted = false;
    setStatus('CONNECTING');

    channel
      .on(
        'postgres_changes',
        { event: '*', schema, table },
        (payload) => {
          // Invalidate pricing queries so UI refetches
          queryClient.invalidateQueries({ queryKey: ['admin-point-pricing'] });
          queryClient.invalidateQueries({ queryKey: ['wallet-pricing'] });
          queryClient.refetchQueries({ queryKey: ['admin-point-pricing'], type: 'active' });
          queryClient.refetchQueries({ queryKey: ['wallet-pricing'], type: 'active' });
          if (typeof onEventRef.current === 'function') onEventRef.current(payload);
        },
      )
      .subscribe((s, err) => {
        if (isUnmounted && s === 'CLOSED') return;
        setStatus(s);
        if (err) console.error('[PRICING-REALTIME] subscribe error', err);
      });

    return () => {
      isUnmounted = true;
      setStatus('CLOSED');
      supabaseClient.removeChannel(channel);
    };
  }, [enabled, queryClient]);

  return { realtimeStatus: status, isRealtimeSubscribed: status === 'SUBSCRIBED' };
};

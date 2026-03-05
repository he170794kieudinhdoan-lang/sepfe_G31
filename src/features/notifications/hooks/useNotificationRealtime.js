import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    isSupabaseConfigured,
    notificationRealtimeConfig,
    supabaseClient,
} from '@/shared/api/supabaseClient';

export const useNotificationRealtime = ({ enabled = true, userId } = {}) => {
    const queryClient = useQueryClient();
    const [status, setStatus] = useState('IDLE');
    const channelInstanceIdRef = useRef(
        typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`
    );

    useEffect(() => {
        if (!enabled || !isSupabaseConfigured || !supabaseClient || !userId) {
            setStatus('DISABLED');
            return undefined;
        }

        const DEBUG = false;
        const { schema, table, userColumn } = notificationRealtimeConfig;
        const channelName = `notifications-realtime-${userId}-${channelInstanceIdRef.current}`;
        const channel = supabaseClient.channel(channelName);
        let isUnmounted = false;
        setStatus('CONNECTING');

        if (DEBUG) {
            console.log('[REALTIME] Subscribing with config:', {
                schema,
                table,
                userColumn,
                userId,
                filter: 'client-side',
                channelName,
            });
        }

        channel
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema,
                    table,
                },
                (payload) => {
                    const payloadUserId =
                        payload?.new?.[userColumn]
                        ?? payload?.old?.[userColumn]
                        ?? payload?.new?.userId
                        ?? payload?.old?.userId
                        ?? payload?.new?.user_id
                        ?? payload?.old?.user_id
                        ?? payload?.new?.userid
                        ?? payload?.old?.userid;
                    const eventType = payload?.eventType || 'UNKNOWN';
                    const normalizeId = (value) => {
                        if (value === null || value === undefined) return null;
                        if (typeof value === 'number') return String(value);
                        const raw = String(value).trim();
                        if (!raw) return null;
                        const numeric = Number(raw);
                        return Number.isNaN(numeric) ? raw.toLowerCase() : String(numeric);
                    };
                    const normalizedPayloadUserId = normalizeId(payloadUserId);
                    const normalizedCurrentUserId = normalizeId(userId);
                    const hasPayloadUserId = normalizedPayloadUserId !== null;
                    const matchesFilter =
                        !hasPayloadUserId || normalizedPayloadUserId === normalizedCurrentUserId;

                    if (!matchesFilter) {
                        if (DEBUG) {
                            console.log('[REALTIME] Ignored event (user mismatch):', {
                                eventType,
                                payloadUserId,
                                currentUserId: userId,
                                normalizedPayloadUserId,
                                normalizedCurrentUserId,
                                payload,
                            });
                        }
                        return;
                    }

                    if (DEBUG) {
                        console.log('[REALTIME] 🔔 Event received:', {
                            eventType,
                            payloadUserId,
                            currentUserId: userId,
                            matchesFilter,
                            payload,
                        });
                    }
                    queryClient.invalidateQueries({ queryKey: ['notifications'] });
                    queryClient.refetchQueries({ queryKey: ['notifications'], type: 'active' });
                }
            )
            .subscribe((status, err) => {
                if (isUnmounted && status === 'CLOSED') return;
                setStatus(status);
                if (DEBUG) console.log('[REALTIME] Subscribe status:', status);
                if (status === 'SUBSCRIBED') {
                    queryClient.refetchQueries({ queryKey: ['notifications'], type: 'active' });
                }
                if (err) {
                    console.error('[REALTIME] Subscribe error:', err);
                }
            });

        return () => {
            isUnmounted = true;
            setStatus('CLOSED');
            supabaseClient.removeChannel(channel);
        };
    }, [enabled, queryClient, userId]);

    const isRealtimeSubscribed = status === 'SUBSCRIBED';

    return {
        realtimeStatus: status,
        isRealtimeSubscribed,
    };
};
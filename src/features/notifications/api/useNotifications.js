import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as notificationApi from './notificationApi';

export const useNotifications = (options = {}) => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: notificationApi.getNotifications,
        staleTime: 60 * 1000,
        retry: 1,
        ...options,
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationApi.markNotificationRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

export const useMarkAllNotificationsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationApi.markAllNotificationsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationApi.deleteNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};
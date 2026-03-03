import { apiClient } from '@/shared/api/apiClient';

const LIST_ENDPOINTS = ['/notifications', '/notification'];
const MARK_READ_ENDPOINTS = (id) => [
    { method: 'patch', url: `/notifications/${id}/read` },
    { method: 'patch', url: `/notification/${id}/read` },
    { method: 'put', url: `/notifications/${id}/read` },
    { method: 'put', url: `/notification/${id}/read` },
];
const MARK_ALL_READ_ENDPOINTS = [
    { method: 'patch', url: '/notifications/read-all' },
    { method: 'patch', url: '/notification/read-all' },
    { method: 'put', url: '/notifications/read-all' },
    { method: 'put', url: '/notification/read-all' },
];
const DELETE_ENDPOINTS = (id) => [
    { method: 'delete', url: `/notifications/${id}` },
    { method: 'delete', url: `/notification/${id}` },
];

const canFallback = (error) => {
    const status = error?.response?.status;
    return status === 404 || status === 405;
};

const requestWithFallback = async (requesters) => {
    let lastError;

    for (const requester of requesters) {
        try {
            return await requester();
        } catch (error) {
            lastError = error;
            if (!canFallback(error)) {
                throw error;
            }
        }
    }

    throw lastError;
};

export const getNotifications = async () => {
    return requestWithFallback(LIST_ENDPOINTS.map((url) => () => apiClient.get(url)));
};

export const markNotificationRead = async (notificationId) => {
    return requestWithFallback(
        MARK_READ_ENDPOINTS(notificationId).map(({ method, url }) => () => apiClient[method](url))
    );
};

export const markAllNotificationsRead = async () => {
    return requestWithFallback(
        MARK_ALL_READ_ENDPOINTS.map(({ method, url }) => () => apiClient[method](url))
    );
};

export const deleteNotification = async (notificationId) => {
    return requestWithFallback(
        DELETE_ENDPOINTS(notificationId).map(({ method, url }) => () => apiClient[method](url))
    );
};
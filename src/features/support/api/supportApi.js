import { apiClient } from '@/shared/api/apiClient';

export const createSupportTicket = async (body) => {
  return apiClient.post('/support-tickets', body);
};

export const getSupportTickets = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined,
    ),
  );

  return apiClient.get('/support-tickets', { params: cleanParams });
};

export const updateSupportTicket = async (id, body) => {
  return apiClient.patch(`/support-tickets/${id}`, body);
};
import { apiClient } from '@/shared/api/apiClient';

export const getOrCreateConversation = async (participantId) => {
  return apiClient.post('/chat/conversations', { participantId });
};

export const getUserConversations = async () => {
  return apiClient.get('/chat/conversations');
};

export const sendMessage = async (id, content) => {
  return apiClient.post(`/chat/conversations/${id}/messages`, { content });
};

export const getMessages = async (id, query) => {
  return apiClient.get(`/chat/conversations/${id}/messages`, query);
};

export const markAsRead = async (id) => {
  return apiClient.patch(`/chat/conversations/${id}/read`);
};

import { apiClient } from '@/shared/api/apiClient';

export const getMyWalletApi = async () => {
  return await apiClient.get('/wallet/me');
};

export const getWalletTransactionsApi = async (params = {}) => {
  return await apiClient.get('/wallet/transactions', { params });
};

export const createTopupCheckoutApi = async (payload) => {
  return await apiClient.post('/wallet/topup/checkout', payload);
};

export const getWalletPricingApi = async () => {
  return await apiClient.get('/wallet/pricing');
};

export const getTopupOrderStatusApi = async (orderId) => {
  return await apiClient.get(`/wallet/topup/orders/${orderId}/status`);
};

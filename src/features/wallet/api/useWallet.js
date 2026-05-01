import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTopupCheckoutApi,
  getTopupOrderStatusApi,
  getMyWalletApi,
  getWalletPricingApi,
  getWalletTransactionsApi,
} from './walletApi';

export const useMyWallet = (options = {}) => {
  return useQuery({
    queryKey: ['my-wallet'],
    queryFn: getMyWalletApi,
    ...options,
  });
};

export const useWalletTransactions = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['wallet-transactions', params],
    queryFn: () => getWalletTransactionsApi(params),
    ...options,
  });
};

export const useWalletPricing = (options = {}) => {
  return useQuery({
    queryKey: ['wallet-pricing'],
    queryFn: getWalletPricingApi,
    staleTime: 60 * 1000,
    ...options,
  });
};

export const useTopupCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTopupCheckoutApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    },
  });
};

export const useTopupOrderStatus = (orderId, options = {}) => {
  return useQuery({
    queryKey: ['topup-order-status', orderId],
    queryFn: () => getTopupOrderStatusApi(orderId),
    enabled: !!orderId,
    ...options,
  });
};

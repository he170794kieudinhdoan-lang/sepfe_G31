import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as userApi from './userApi';

export const useGetUsers = (options = {}) => {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: userApi.getUsers,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    ...options,
  });
};

export const useGetAllUsersPaginated = (params) => {
  return useQuery({
    queryKey: ['users', 'paginated', params],
    queryFn: () => userApi.getAllUsersPaginated(params),
    keepPreviousData: true,
  });
};


export const useGetOccupations = () => {
  return useQuery({
    queryKey: ['occupations'],
    queryFn: userApi.getOccupations,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
};

export const useGetWorkerProfile = (options = {}) => {
  return useQuery({
    queryKey: ['worker-profile'],
    queryFn: userApi.getWorkerProfile,
    staleTime: 5 * 60 * 1000,
    retry: false,
    ...options,
  });
};

export const useCreateWorkerProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.createWorkerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-profile'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });
};

export const useUpdateWorkerProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.updateWorkerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-profile'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });
};

export const useUpdateUserInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.updateUserInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: userApi.changePassword,
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: userApi.deleteAccount,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }) => userApi.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'paginated'] });
    },
  });
};

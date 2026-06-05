import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as userApi from './userApi';

export const useGetUsers = (options = {}) => {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: userApi.getUsers,
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
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useGetWorkerProfile = (options = {}) => {
  return useQuery({
    queryKey: ['worker-profile'],
    queryFn: userApi.getWorkerProfile,
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
    // Cập nhật lạc quan các field text (fullName/phone/email) vào cache ['users','me'].
    // AuthContext suy ra `user` từ cache này nên UI đổi ngay. Avatar đã có preview riêng.
    onMutate: async (formData) => {
      const patch = {};
      if (formData && typeof formData.get === 'function') {
        ['fullName', 'phone', 'email'].forEach((key) => {
          const v = formData.get(key);
          if (v !== null) patch[key] = v;
        });
      }
      if (Object.keys(patch).length === 0) return { previous: undefined };
      await queryClient.cancelQueries({ queryKey: ['users', 'me'] });
      const previous = queryClient.getQueryData(['users', 'me']);
      queryClient.setQueryData(['users', 'me'], (old) =>
        old ? { ...old, ...patch } : old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['users', 'me'], context.previous);
      }
    },
    onSettled: () => {
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

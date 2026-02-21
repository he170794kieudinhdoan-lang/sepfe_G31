import { useQuery } from '@tanstack/react-query';
import * as userApi from './userApi';

export const useGetUsers = (options = {}) => {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: userApi.getUsers,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    retry: 1,
    ...options,
  });
};

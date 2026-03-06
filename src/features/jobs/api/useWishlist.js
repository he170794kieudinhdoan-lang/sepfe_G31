import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWishlistApi, saveJobApi, unsaveJobApi } from './wishlistApi';

export const useWishlist = (params, options = {}) => {
    return useQuery({
        queryKey: ['wishlist', params],
        queryFn: () => getWishlistApi(params),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};
export const useSaveJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (jobId) => saveJobApi(jobId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        },
    });
};
export const useUnsaveJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (jobId) => unsaveJobApi(jobId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        },
    });
};

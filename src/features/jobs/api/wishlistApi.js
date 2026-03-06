import { apiClient } from '@/shared/api/apiClient';

export const getWishlistApi = async (params) => {
    return apiClient.get('/job/wishlist', { params });
};

export const saveJobApi = async (jobId) => {
    return apiClient.post(`/job/save/${jobId}`);
};

export const unsaveJobApi = async (jobId) => {
    return apiClient.delete(`/job/unsave/${jobId}`);
};

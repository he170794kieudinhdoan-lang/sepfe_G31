import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWishlistApi, saveJobApi, unsaveJobApi } from './wishlistApi';

/** Lấy mảng item từ nhiều dạng response (array thuần hoặc { items }) */
function getWishlistItems(data) {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

function mergeWishlistItems(old, newItems) {
  if (old == null) {
    return { items: newItems };
  }
  if (Array.isArray(old)) {
    return newItems;
  }
  return { ...old, items: newItems };
}

function itemMatchesJobId(item, jobId) {
  const id = item?.jobId ?? item?.job?.id;
  return id === jobId || String(id) === String(jobId);
}

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
    retry: 1,
    onMutate: async (jobId) => {
      void queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previous = queryClient.getQueriesData({ queryKey: ['wishlist'] });
      queryClient.setQueriesData({ queryKey: ['wishlist'] }, (old) => {
        const items = getWishlistItems(old);
        if (items.some((i) => itemMatchesJobId(i, jobId))) {
          return old;
        }
        return mergeWishlistItems(old, [...items, { jobId }]);
      });
      return { previous };
    },
    onError: (_err, _jobId, context) => {
      context?.previous?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['wishlist'],
        refetchType: 'active',
      });
    },
  });
};

export const useUnsaveJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId) => unsaveJobApi(jobId),
    retry: 1,
    onMutate: async (jobId) => {
      void queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previous = queryClient.getQueriesData({ queryKey: ['wishlist'] });
      queryClient.setQueriesData({ queryKey: ['wishlist'] }, (old) => {
        const items = getWishlistItems(old);
        const filtered = items.filter((i) => !itemMatchesJobId(i, jobId));
        return mergeWishlistItems(old, filtered);
      });
      return { previous };
    },
    onError: (_err, _jobId, context) => {
      context?.previous?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['wishlist'],
        refetchType: 'active',
      });
    },
  });
};

/** Chỉ khóa đúng job đang gọi API (tránh cả list bị “đơ” khi một nút pending). */
export function isWishlistTogglePending(saveM, unsaveM, jobId) {
  if (jobId == null) return false;
  const match = (v) =>
    v != null && (v === jobId || String(v) === String(jobId));
  return (
    (saveM.isPending && match(saveM.variables)) ||
    (unsaveM.isPending && match(unsaveM.variables))
  );
}

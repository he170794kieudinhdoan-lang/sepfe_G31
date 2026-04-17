/** Người dùng có quyền thao tác ứng viên (wishlist, ứng tuyển trên list, …) */
export const isWorkerRole = (user) =>
  !!user && (user.role === 'WORKER' || user.roleType === 'WORKER');

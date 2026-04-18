/** Role hiệu lực (API thường trả `role`, JWT/local có thể có `roleType`) */
export const getUserRole = (user) =>
  user ? user.role ?? user.roleType ?? null : null;

/** Người dùng có quyền thao tác ứng viên (wishlist, ứng tuyển trên list, …) */
export const isWorkerRole = (user) =>
  !!user && (user.role === 'WORKER' || user.roleType === 'WORKER');

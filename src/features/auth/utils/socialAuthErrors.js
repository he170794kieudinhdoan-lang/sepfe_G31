/** Lưu JWT Google (credential) khi cần user chọn vai trò rồi gọi login lại */
export const WL_GOOGLE_PENDING_KEY = 'wl_google_pending_credential';

/** Lấy mã lỗi từ response Nest (HttpException có `code` ở root) */
export const getSocialLoginErrorCode = (error) => {
  const d = error.response?.data;
  if (!d) return null;
  if (d.code) return d.code;
  if (typeof d.message === 'object' && d.message?.code) return d.message.code;
  return null;
};

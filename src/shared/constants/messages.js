/** WorkLink message constants - dùng cho toast, empty state, confirm */
export const MSG = {
  // --- Auth ---
  MSG_LOGIN_SUCCESS: 'Đăng nhập thành công!',
  MSG_LOGIN_GOOGLE_SUCCESS: 'Đăng nhập Google thành công!',
  MSG_LOGIN_ERROR: 'Đăng nhập thất bại',
  MSG_SIGNUP_SUCCESS: 'Đăng ký thành công! Vui lòng đăng nhập.',
  MSG_SIGNUP_ERROR: 'Đăng ký thất bại',
  MSG_LOGOUT_ERROR: 'Không thể đăng xuất. Vui lòng thử lại.',
  MSG_WRONG_PASSWORD: 'Sai mật khẩu.',
  MSG_ACCOUNT_LOCKED: 'Tài khoản bị khóa.',
  MSG_EMAIL_TAKEN: 'Email này đã được sử dụng.',

  // --- Quên / đặt lại mật khẩu ---
  MSG_FORGOT_SUCCESS: 'Link đặt lại mật khẩu đã được gửi đến email của bạn.',
  MSG_FORGOT_ERROR: 'Gửi yêu cầu thất bại',
  MSG_RESET_TOKEN_INVALID: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
  MSG_RESET_SUCCESS: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.',
  MSG_RESET_ERROR: 'Đặt lại mật khẩu thất bại',

  // --- Hồ sơ người dùng ---
  MSG_PROFILE_NOT_FOUND: 'Không tìm thấy hồ sơ.',
  MSG_PROFILE_NO_PERMISSION: 'Bạn không có quyền xem hồ sơ này.',
  MSG_PROFILE_SAVE_SUCCESS: 'Lưu hồ sơ thành công!',
  MSG_PROFILE_REQUIRED: 'Vui lòng điền đầy đủ họ tên và email.',

  // --- Đổi mật khẩu ---
  MSG_CHANGE_PW_WRONG_CURRENT: 'Mật khẩu hiện tại không đúng.',
  MSG_CHANGE_PW_MIN: 'Mật khẩu mới phải ít nhất 8 ký tự.',
  MSG_CHANGE_PW_MISMATCH: 'Mật khẩu xác nhận không khớp.',
  MSG_CHANGE_PW_FAIL: 'Đổi mật khẩu thất bại. Vui lòng thử lại.',
  MSG_CHANGE_PW_SUCCESS: 'Đổi mật khẩu thành công!',
  MSG_CHANGE_PW_REQUIRED: 'Vui lòng nhập mật khẩu hiện tại.',

  // --- Xóa tài khoản ---
  MSG_DELETE_ACCOUNT_FAIL: 'Xóa tài khoản thất bại. Vui lòng thử lại.',
  MSG_DELETE_SUCCESS: 'Tài khoản đã bị xóa.',

  // --- Form chung ---
  MSG_REQUIRED_FIELDS: 'Vui lòng điền đầy đủ thông tin.',
  MSG_REQUIRED_APPLY_FIELDS: 'Vui lòng điền đầy đủ thông tin ứng tuyển.',

  // --- Tin tuyển dụng ---
  MSG_JOB_NOT_FOUND: 'Tin tuyển dụng không tồn tại.',
  MSG_JOB_SAVE_SUCCESS: 'Lưu tin tuyển dụng thành công.',
  MSG_JOB_UPDATE_FAIL: 'Cập nhật tin tuyển dụng thất bại.',
  MSG_JOB_DELETE_FAIL: 'Xóa tin tuyển dụng thất bại.',
  MSG_JOB_STATUS_UPDATE_SUCCESS: 'Cập nhật trạng thái job thành công.',
  MSG_JOB_FEATURED_EMPTY: 'Chưa có tin nổi bật. Vui lòng quay lại sau.',
  MSG_JOB_ALREADY_APPLIED: 'Bạn đã ứng tuyển tin này.',

  // --- Ứng tuyển ---
  MSG_APPLY_HISTORY_EMPTY: 'Bạn chưa ứng tuyển job nào.',
  MSG_CANDIDATE_UPDATE_FAIL: 'Cập nhật trạng thái ứng viên thất bại.',
  MSG_CANDIDATE_LOAD_FAIL: 'Không tải được thông tin ứng viên.',
  MSG_CANDIDATE_EMPTY: 'Chưa có ứng viên nào.',

  // --- Wishlist ---
  MSG_WISHLIST_DELETE_FAIL: 'Không thể xóa khỏi wishlist. Thử lại sau.',

  // --- Báo cáo ---
  MSG_REPORT_ALREADY_SENT: 'Bạn đã báo cáo tin này trước đó.',
  MSG_REPORT_SUCCESS: 'Gửi báo cáo thành công.',
  MSG_REPORT_EMPTY: 'Chưa có báo cáo nào.',

  // --- Công ty ---
  MSG_COMPANY_NOT_FOUND: 'Không tìm thấy công ty phù hợp.',
  MSG_COMPANY_REGISTER_EMPTY: 'Chưa có đơn đăng ký công ty nào.',
  MSG_COMPANY_STATUS_UPDATE_FAIL: 'Cập nhật trạng thái công ty thất bại.',
  MSG_COMPANY_APPROVE_SUCCESS: 'Duyệt công ty thành công.',
  MSG_REVIEW_EMPTY: 'Chưa có đánh giá nào.',

  // --- Ngành nghề ---
  MSG_INDUSTRY_IN_USE: 'Ngành nghề đang được sử dụng, không thể xóa.',

  // --- Thanh toán ---
  MSG_PAYMENT_CANCELLED: 'Bạn đã hủy thanh toán.',

  // --- Người dùng / Admin ---
  MSG_USER_LIST_EMPTY: 'Không có người dùng.',

  // --- Thông báo ---
  MSG_NOTIFICATION_EMPTY: 'Chưa có thông báo.',

  // --- Thống kê ---
  MSG_STATS_EMPTY: 'Không có dữ liệu thống kê.',

  // --- Chung ---
  MSG_ACTION_FAIL: 'Thao tác thất bại. Vui lòng thử lại.',
};

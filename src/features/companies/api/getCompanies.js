import { apiClient } from '@/shared/api/apiClient';

export const getCompanies = async () => {
  const response = await apiClient.get('/company');
  return response;
};

export const getCompanyById = async (id) => {
  const response = await apiClient.get(`/company/${id}`);
  return response;
};

export const getCompaniesByStatus = async (status) => {
  const response = await apiClient.get(`/company/status/${status}`);
  return response;
};

export const getPendingUpdateCompanies = async () => {
  const response = await apiClient.get('/company/pending-updates');
  return response;
};

export const getCompanyUpdateRequest = async (companyId) => {
  const response = await apiClient.get(`/company/${companyId}/update-request`);
  return response;
};

export const reviewCompany = async (id, { status, rejectionReason }) => {
  const payload = { status };
  if (status === 'REJECTED') {
    payload.rejectionReason =
      typeof rejectionReason === 'string' ? rejectionReason.trim() : '';
  }
  const response = await apiClient.patch(`/company/review/${id}`, payload);
  return response;
};

export const searchCompany = async (params) => {
  const response = await apiClient.get('/company/search', { params });
  return response;
};

export const createCompany = async (formData) => {
  const response = await apiClient.post('/company/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response;
};

export const updateCompany = async (companyId, formData) => {
  const response = await apiClient.put(
    `/company/update/${companyId}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return response;
};

export const getMyCompany = async () => {
  const response = await apiClient.get('/company/owner');
  return response;
};

// ===== COMPANY REVIEWS =====

// Lấy danh sách reviews của 1 công ty
export const getCompanyReviews = async (companyId) => {
  const response = await apiClient.get(`/company/${companyId}/reviews`);
  return response;
};

// Viết review mới
export const createCompanyReview = async (companyId, payload) => {
  const response = await apiClient.post(`/company/${companyId}/review`, payload);
  return response;
};

// Sửa review
export const updateCompanyReview = async (reviewId, payload) => {
  const response = await apiClient.put(`/company/reviews/${reviewId}`, payload);
  return response;
};

// Xóa review
export const deleteCompanyReview = async (reviewId) => {
  const response = await apiClient.delete(`/company/reviews/${reviewId}`);
  return response;
};

// Báo cáo review (worker)
export const reportCompanyReview = async (reviewId, payload) => {
  const response = await apiClient.post(`/company/reviews/${reviewId}/report`, payload);
  return response;
};

// ===== MANAGER: REVIEW REPORT MODERATION =====

// Lấy danh sách báo cáo review (manager)
export const getReviewReports = async ({
  status,
  page = 1,
  limit = 10,
  companyName,
  reporterName,
  fromDate,
  toDate,
} = {}) => {
  const params = { page, limit };
  if (status) params.status = status;
  if (companyName) params.companyName = companyName;
  if (reporterName) params.reporterName = reporterName;
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  const response = await apiClient.get('/company/reviews/reports/all', {
    params,
  });
  return response;
};

// Duyệt / từ chối báo cáo review (manager)
export const updateReviewReportStatusApi = async ({ id, status, managerNote }) => {
  const response = await apiClient.patch(
    `/company/reviews/reports/${id}/status`,
    { status, managerNote },
  );
  return response;
};

// Ẩn review (manager)
export const hideCompanyReviewApi = async ({ reviewId }) => {
  const response = await apiClient.patch(`/company/reviews/${reviewId}/hide`);
  return response;
};

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

export const reviewCompany = async (id, { status, rejectionReason }) => {
  const response = await apiClient.patch(`/company/review/${id}`, {
    status,
    rejectionReason,
  });
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

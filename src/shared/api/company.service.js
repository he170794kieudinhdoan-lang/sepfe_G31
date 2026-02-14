import { apiClient } from './apiClient';

export const CompanyService = {
    // Lấy company của user đang đăng nhập
    getMyCompany() {
        return apiClient.get('/companies/me');
    },

    // Tạo company mới
    createCompany(data) {
        return apiClient.post('/companies', data);
    },

    // Cập nhật company
    updateCompany(data) {
        return apiClient.put('/companies/me', data);
    },
};

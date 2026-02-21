import { apiClient } from './apiClient';

export const CompanyService = {
    createCompany: (formData) =>
        apiClient.post('/company/create', formData),

    updateCompany: (formData) =>
        apiClient.put('/company/update', formData),

    getMyCompany: () =>
        apiClient.get('/company/me'),
};
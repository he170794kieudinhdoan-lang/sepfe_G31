import { apiClient } from '@/shared/api/apiClient';

export const CompanyService = {
    createCompany: (formData) =>
        apiClient.post('/company/create', formData),

    updateCompany: (companyId, formData) =>
        apiClient.put(`/company/update/${companyId}`, formData),

    getMyCompany: () =>
        apiClient.get('/company/owner'),
};
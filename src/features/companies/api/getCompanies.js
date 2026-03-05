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
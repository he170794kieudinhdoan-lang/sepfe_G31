import { apiClient } from '@/shared/api/apiClient';
export const getCompanies = async () => {
    const response = await apiClient.get('/companies');
    return response;
}

export const getCompanyById = async (id) => {
    const response = await apiClient.get(`/companies/${id}`);
    return response;
}
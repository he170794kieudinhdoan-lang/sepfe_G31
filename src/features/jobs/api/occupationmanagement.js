import { apiClient } from '@/shared/api/apiClient';

export const OccupationManagementService = {

    createOccupation: (formData) =>
        apiClient.post('/occupations', formData),

    getAllActiveOccupations: () =>
        apiClient.get('/occupations'),

    getSectorWithActiveOccupations: () =>
        apiClient.get('/occupations/grouped-by-sector'),

    getActiveOccupationBySector: (sectorId) =>
        apiClient.get(`/occupations/sector/${sectorId}`),

    getOccupationDetail: (occupationId) =>
        apiClient.get(`/occupations/${occupationId}`),

    updateOccupation: (occupationId, data) =>
        apiClient.patch(`/occupations/${occupationId}`, data),

    deleteOccupation: (occupationId) =>
        apiClient.delete(`/occupations/${occupationId}`),
};
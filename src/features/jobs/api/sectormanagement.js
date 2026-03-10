import { apiClient } from '@/shared/api/apiClient';
export const SectorManagementService = {
    createSector: (formData) =>
        apiClient.post('/sectors', formData),
    updateSector: (sectorId, formData) =>
        apiClient.put(`/sectors/${sectorId}`, formData),
    getAllSectors: () =>
        apiClient.get('/sectors'),
    deleteSector: (sectorId) =>
        apiClient.delete(`/sectors/${sectorId}`),
    getSectorDetails: (sectorId) =>
        apiClient.get(`/sectors/${sectorId}`),
};
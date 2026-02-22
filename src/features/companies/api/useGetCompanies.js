import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCompanies, getCompanyById, getCompaniesByStatus, reviewCompany } from './getCompanies';

export const useGetCompanies = () => {
    return useQuery({
        queryKey: ['companies'],
        queryFn: () => getCompanies(),
        staleTime: 2 * 60 * 1000,
        retry: 1,
    });
};

export const useGetCompaniesById = (id) => {
    return useQuery({
        queryKey: ['companies', id],
        queryFn: () => getCompanyById(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
        retry: 1,
    });
};

export const useGetCompaniesByStatus = (status) => {
    return useQuery({
        queryKey: ['companies', 'status', status],
        queryFn: () => getCompaniesByStatus(status),
        enabled: !!status,
        staleTime: 2 * 60 * 1000,
        retry: 1,
    });
};

export const useReviewCompany = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status, rejectionReason }) =>
            reviewCompany(id, { status, rejectionReason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        },
    });
};

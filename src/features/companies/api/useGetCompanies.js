import { useQuery } from '@tanstack/react-query';
import { getCompanies, getCompanyById } from './getCompanies';


export const useGetCompanies = () => {
    return useQuery({
        queryKey: ['companies'],
        queryFn: () => getCompanies(),
        staleTime: 2 * 60 * 1000, // 2 phút
        retry: 1,
        keepPreviousData: true,
    });
};

export const useGetCompaniesById = (id) => {
    return useQuery({
        queryKey: ['companies', id],
        queryFn: () => getCompanyById(id),
        staleTime: 2 * 60 * 1000, // 2 phút
        retry: 1,
        keepPreviousData: true,
    });
};

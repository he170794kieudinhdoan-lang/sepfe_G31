import { useQuery } from '@tanstack/react-query';
import {
  getSectorsWithOccupations,
  getOccupationsBySector,
} from '../api/occupationApi';

/**
 * ================================
 * LOAD ALL SECTORS + OCCUPATIONS
 * ================================
 */
export const useGetSectorsWithOccupations = () => {
  return useQuery({
    queryKey: ['sectors-with-occupations'],
    queryFn: getSectorsWithOccupations,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

/**
 * ================================
 * LOAD OCCUPATIONS BY SECTOR
 * ================================
 */
export const useGetOccupationsBySector = (sectorId) => {
  return useQuery({
    queryKey: ['occupations-by-sector', sectorId],
    queryFn: () => getOccupationsBySector(sectorId),
    enabled: !!sectorId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
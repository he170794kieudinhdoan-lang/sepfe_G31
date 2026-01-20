
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';

/**
 * Fetch users from the backend API.
 * This function interacts directly with the API client.
 */
export const getUsers = async () => {
    // Calling the API endpoint defined in the backend (AuthController)
    // URL: /auth/users
    // The baseURL is already configured in apiClient (e.g., /api)
    // So the full path will be /api/auth/users
    return apiClient.get('/auth/users');
};

/**
 * Custom hook to fetch users.
 * Uses React Query for caching, loading, and error states.
 */
export const useUsers = () => {
    return useQuery({
        queryKey: ['users'], // Unique key for caching
        queryFn: getUsers, // The function to call
    });
};
;

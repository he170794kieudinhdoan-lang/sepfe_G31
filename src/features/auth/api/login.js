
// import { apiClient } from '@/shared/api/apiClient';

export const loginWithEmail = (_data) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                user: {
                    id: '1',
                    name: 'Demo User',
                    token: 'fake-jwt-token',
                },
            });
        }, 1000);
    });
};

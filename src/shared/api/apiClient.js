
import axios from 'axios';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            console.error('❌ NO accessToken in localStorage');
        } else {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(
            'API Request:',
            config.method?.toUpperCase(),
            config.baseURL + config.url,
            token ? '✅ TOKEN ATTACHED' : '❌ NO TOKEN'
        );

        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response.data?.data ?? response.data,
    (error) => Promise.reject(error)
);

import axios from 'axios';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    console.log('API Request:', config.method.toUpperCase(), config.baseURL, config.url);
    return config;
});

apiClient.interceptors.response.use(
    (response) => {
        // Unwraps the standard { statusCode, message, data } response structure
        // from the NestJS ResponseInterceptor
        return response.data?.data !== undefined ? response.data.data : response.data;
    },
    (error) => {
        return Promise.reject(error);
    }
);

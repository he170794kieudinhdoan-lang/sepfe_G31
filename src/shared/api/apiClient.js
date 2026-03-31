import axios from 'axios';
import { getAccessToken, refreshTokens, clearTokens } from './tokenService';
import { toast } from 'sonner';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const PUBLIC_ENDPOINTS = [
  '/user/login',
  '/user/sign-up',
  '/user/forgot-password',
  '/user/reset-password',
];

const isPublicEndpoint = (url) =>
  PUBLIC_ENDPOINTS.some((path) => url?.includes(path));

apiClient.interceptors.request.use((config) => {
  if (!isPublicEndpoint(config.url)) {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response.data?.data !== undefined
      ? response.data.data
      : response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes('/user/refresh') ||
        originalRequest.url?.includes('/user/login') ||
        originalRequest.url?.includes('/user/logout')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const data = await refreshTokens();
        const newToken = data.accessToken || getAccessToken();

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.dispatchEvent(new Event('auth:force-logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

let isLoggingOut = false;

// Handle DELETED user (403 Forbidden)
if (error.response?.status === 403 && !isLoggingOut) {
  isLoggingOut = true;

  toast.error(
    'Tài khoản của bạn đã bị khóa hoặc xóa. Vui lòng liên hệ quản trị viên.',
    {
      duration: 5000,
    },
  );

  clearTokens();
  window.dispatchEvent(new Event('auth:force-logout'));

  // Redirect to login/home AFTER a delay so user can read the message
  // Use dynamic import of router to avoid circular dependency
  setTimeout(async () => {
    try {
      const { router } = await import('@/app/router');
      router.navigate('/auth/login');
    } catch (err) {
      console.error('Failed to navigate to login:', err);
      window.location.href = '/auth/login'; // Fallback
    } finally {
      isLoggingOut = false;
    }
  }, 3000);

  return Promise.reject(error);
}

return Promise.reject(error);
  },
);

export const apiClientCustom = (baseURL) => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    console.log(
      'API Request:',
      config.method?.toUpperCase(),
      config.baseURL,
      config.url,
    );

    return config;
  });

  client.interceptors.response.use(
    (response) => {
      return response.data?.data !== undefined
        ? response.data.data
        : response.data;
    },
    (error) => Promise.reject(error),
  );

  return client;
};

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ========== Token Storage ==========

export const getAccessToken = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const getRoleType = () => localStorage.getItem('roleType');

export const setTokens = ({ accessToken, refreshToken, role }) => {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  if (role) localStorage.setItem('roleType', role);
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('roleType');
  localStorage.removeItem('userInfo');
};

// ========== Refresh Token ==========

export const refreshTokens = async () => {
  const refreshTokenValue = getRefreshToken();

  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  // Dùng axios trực tiếp (không qua apiClient) để tránh interceptor loop
  const res = await axios.post(
    `${BASE_URL}/user/refresh`,
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshTokenValue}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const data = res.data?.data !== undefined ? res.data.data : res.data;

  if (data.accessToken) {
    // Refresh endpoint chỉ trả về tokens mới, không trả role
    // → không truyền role để tránh ghi đè roleType đã lưu
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }

  return data;
};

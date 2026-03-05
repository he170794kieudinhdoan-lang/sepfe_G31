import { apiClient } from '@/shared/api/apiClient';
import { setTokens } from '@/shared/api/tokenService';

export const signUp = async (data) => {
  return apiClient.post('/user/sign-up', data);
};

export const loginWithCredentials = async (data) => {
  const response = await apiClient.post('/user/login/credential', data);

  if (response.tokens) {
    console.log(response.tokens);
    setTokens(response.tokens);
  }

  return response;
};

export const loginWithGoogle = async (googleToken, additionalData = {}) => {
  const response = await apiClient.post(
    '/user/login/social/google',
    additionalData,
    {
      headers: {
        Authorization: `Bearer ${googleToken}`,
      },
    },
  );

  if (response.tokens) {
    setTokens(response.tokens);
  }

  return response;
};

export const logoutUser = async () => {
  return apiClient.post('/user/logout');
};

export const forgotPassword = async (email) => {
  return apiClient.post('/user/forgot-password', { email });
};

export const resetPassword = async ({ token, newPassword }) => {
  return apiClient.put('/user/reset-password', { token, newPassword });
};

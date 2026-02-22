import { useAuth } from '@/shared/contexts/AuthContext';
import { useToast } from '@/shared/contexts/ToastContext';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MSG } from '@/shared/constants/messages';
import * as authApi from './authApi';
import { getUsers } from '@/features/users/api/userApi';

export const useSignUp = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.signUp,
    onSuccess: () => {
      toast(MSG.MSG_SIGNUP_SUCCESS);
      navigate('/auth/login');
    },
    onError: (error) => {
      const message = error.response?.data?.message || MSG.MSG_SIGNUP_ERROR;
      toast(message, 'error');
    },
  });
};

export const useLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

  return useMutation({
    mutationFn: authApi.loginWithCredentials,
    onSuccess: async (data) => {
      toast(MSG.MSG_LOGIN_SUCCESS);

      const roleType = data.tokens?.roleType || data.tokens?.role || '';

      try {
        const userData = await getUsers();
        loginSuccess(userData, roleType);
      } catch (err) {
        console.error('Failed to fetch user info after login:', err);
      }

      if (roleType === 'ADMIN') {
        navigate('/admin');
      } else if (roleType === 'EMPLOYER') {
        navigate('/employer');
      } else {
        navigate('/');
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || MSG.MSG_LOGIN_ERROR;
      toast(message, 'error');
    },
  });
};

export const useLoginGoogle = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

  return useMutation({
    mutationFn: ({ googleToken, additionalData }) =>
      authApi.loginWithGoogle(googleToken, additionalData),
    onSuccess: async (data) => {
      toast(MSG.MSG_LOGIN_GOOGLE_SUCCESS);

      const roleType = data.tokens?.role || '';

      try {
        const userData = await getUsers();
        loginSuccess(userData, roleType);
      } catch (err) {
        console.error('Failed to fetch user info after Google login:', err);
      }

      if (roleType === 'EMPLOYER') {
        navigate('/employer');
      } else {
        navigate('/');
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || MSG.MSG_LOGIN_ERROR;
      toast(message, 'error');
    },
  });
};

export const useForgotPassword = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast(MSG.MSG_FORGOT_SUCCESS);
    },
    onError: (error) => {
      const message = error.response?.data?.message || MSG.MSG_FORGOT_ERROR;
      toast(message, 'error');
    },
  });
};

export const useResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast(MSG.MSG_RESET_SUCCESS);
      navigate('/auth/login');
    },
    onError: (error) => {
      const message = error.response?.data?.message || MSG.MSG_RESET_ERROR;
      toast(message, 'error');
    },
  });
};

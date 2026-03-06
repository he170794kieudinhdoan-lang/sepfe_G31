import { useGetUsers } from '@/features/users/api/useUser';
import { logoutUser } from '@/features/auth/api/authApi';
import {
  getAccessToken,
  getRoleType,
  clearTokens,
} from '@/shared/api/tokenService';
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return ctx;
};

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(() => !!getAccessToken());

  // Bug 1 fix: hasToken là state, không phải biến tính toán từ localStorage
  const [hasToken, setHasToken] = useState(!!getAccessToken());

  const {
    data: userData,
    isLoading: isUsersLoading,
    error,
  } = useGetUsers({
    enabled: hasToken,
    // Bug 2 fix: Không để React Query retry khi 401 — interceptor đã handle retry rồi
    retry: false,
  });

  useEffect(() => {
    if (!hasToken) {
      setUser(null);
      localStorage.removeItem('userInfo');
      setIsLoading(false);
      return;
    }

    if (isUsersLoading) {
      return;
    }

    // Bug 4 fix: Chỉ xóa user khi lỗi 401 (unauthorized), không xóa khi 500/network error
    if (error) {
      const status = error.response?.status || error.status;
      if (status === 401) {
        console.error('Unauthorized — clearing user session:', error);
        setUser(null);
        localStorage.removeItem('userInfo');
      } else {
        console.error('Failed to fetch user info (non-auth error):', error);
        // Giữ nguyên user từ localStorage cache, không xóa
      }
      setIsLoading(false);
      return;
    }

    if (userData) {
      const roleType = getRoleType();
      const userWithRole = {
        ...userData,
        roleType,
      };
      setUser(userWithRole);
      localStorage.setItem('userInfo', JSON.stringify(userWithRole));
    }
    setIsLoading(false);
  }, [hasToken, isUsersLoading, userData, error]);

  // Bug 1 fix: loginSuccess cập nhật hasToken state
  const loginSuccess = useCallback((userData, roleType) => {
    const userWithRole = { ...userData, roleType };
    setUser(userWithRole);
    setHasToken(true);
    localStorage.setItem('userInfo', JSON.stringify(userWithRole));
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      setUser(null);
      setHasToken(false);
      clearTokens();
      queryClient.removeQueries({ queryKey: ['users', 'me'] });
    }
  }, [queryClient]);

  // Issue 4: Lắng nghe event force-logout từ interceptor khi refresh token fail
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      setHasToken(false);
      queryClient.removeQueries({ queryKey: ['users', 'me'] });
    };

    window.addEventListener('auth:force-logout', handleForceLogout);
    return () =>
      window.removeEventListener('auth:force-logout', handleForceLogout);
  }, [queryClient]);

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated: !!user,
    loginSuccess,
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

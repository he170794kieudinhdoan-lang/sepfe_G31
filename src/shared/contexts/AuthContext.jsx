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

  const hasToken = !!getAccessToken();

  const {
    data: userData,
    isLoading: isUsersLoading,
    error,
  } = useGetUsers({
    enabled: hasToken,
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

    if (error) {
      console.error('Failed to fetch user info:', error);
      setUser(null);
      localStorage.removeItem('userInfo');
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

  const loginSuccess = useCallback((userData, roleType) => {
    const userWithRole = { ...userData, roleType };
    setUser(userWithRole);
    localStorage.setItem('userInfo', JSON.stringify(userWithRole));
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      setUser(null);
      clearTokens();
      queryClient.removeQueries({ queryKey: ['users', 'me'] });
    }
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

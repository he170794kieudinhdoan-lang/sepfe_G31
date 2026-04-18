import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { getUserRole } from '@/shared/utils/userRole';

const Loading = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="h-8 w-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
  </div>
);

/**
 * Chỉ render children khi đã đăng nhập và role nằm trong danh sách cho phép.
 * Không đăng nhập → /auth/login. Sai role → / (có thể đổi redirectTo).
 */
export function RequireRoles({ children, roles, redirectTo = '/' }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const allowed = Array.isArray(roles) ? roles : [roles];

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth/login"
        state={{ from: `${location.pathname}${location.search}` }}
        replace
      />
    );
  }

  const role = getUserRole(user);
  if (!role || !allowed.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

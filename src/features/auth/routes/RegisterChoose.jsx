import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useLoginGoogle } from '../api/useAuth';
import { clearTokens } from '@/shared/api/tokenService';
import { WL_GOOGLE_PENDING_KEY } from '../utils/socialAuthErrors';

export const RegisterChoose = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: loginGoogle, isPending: isGoogleLoginPending } =
    useLoginGoogle();

  const [pendingGoogleJwt, setPendingGoogleJwt] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    try {
      setPendingGoogleJwt(sessionStorage.getItem(WL_GOOGLE_PENDING_KEY));
    } catch {
      setPendingGoogleJwt(null);
    }
  }, [location.key, location.pathname]);

  const isCompletingGoogle = Boolean(pendingGoogleJwt);

  const options = [
    {
      key: 'worker',
      title: 'Người tìm việc',
      description: 'Tìm kiếm công việc phù hợp và ứng tuyển nhanh chóng.',
      icon: User,
      path: '/auth/register/worker',
      role: 'WORKER',
    },
    {
      key: 'employer',
      title: 'Nhà tuyển dụng',
      description: 'Đăng tin tuyển dụng và kết nối với ứng viên tiềm năng.',
      icon: Building2,
      path: '/auth/register/employer',
      role: 'EMPLOYER',
    },
  ];

  const handleCancelGoogleFlow = () => {
    sessionStorage.removeItem(WL_GOOGLE_PENDING_KEY);
    setPendingGoogleJwt(null);
    navigate('/auth/login', { replace: true });
  };

  return (
    <AuthLayout title={isCompletingGoogle ? 'Hoàn tất với Google' : 'Đăng ký'}>
      <Card className="p-6 rounded-2xl shadow-sm border-0 space-y-5">
        {!isCompletingGoogle ? (
          <>
            <GoogleSignInButton
              disabled={isGoogleLoginPending}
              onCredential={(jwt) => {
                clearTokens();
                loginGoogle({ googleToken: jwt, additionalData: {} });
              }}
            />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">
                  hoặc đăng ký bằng form
                </span>
              </div>
            </div>
          </>
        ) : null}

        <div className="space-y-4">
          {options.map(
            ({ key, title, description, icon: Icon, path, role }) => {
              const isProcessing = isGoogleLoginPending && selectedRole === role;
              const isOtherProcessing =
                isGoogleLoginPending && selectedRole && selectedRole !== role;

              return (
                <button
                  key={key}
                  type="button"
                  disabled={isGoogleLoginPending}
                  onClick={() => {
                    if (isCompletingGoogle && pendingGoogleJwt) {
                      setSelectedRole(role);
                      clearTokens();
                      loginGoogle({
                        googleToken: pendingGoogleJwt,
                        additionalData: { role },
                      });
                      return;
                    }
                    navigate(path);
                  }}
                  className={cn(
                    'w-full text-left transition-all duration-200',
                    isOtherProcessing && 'opacity-50 grayscale-[0.5]',
                    isGoogleLoginPending && 'pointer-events-none',
                  )}
                >
                  <Card
                    className={cn(
                      'p-5 rounded-2xl shadow-sm border border-transparent transition-all group relative',
                      isProcessing
                        ? 'bg-primary/5 shadow-md'
                        : 'hover:shadow-md hover:bg-amber-50/50',
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200',
                          isProcessing
                            ? 'bg-primary text-white'
                            : 'bg-primary/15 text-primary group-hover:bg-primary/25',
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {isCompletingGoogle
                              ? `Tôi là ${title.toLowerCase()}`
                              : title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </button>
              );
            },
          )}
        </div>

        {isCompletingGoogle ? (
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl"
            disabled={isGoogleLoginPending}
            onClick={handleCancelGoogleFlow}
          >
            Hủy và quay lại đăng nhập
          </Button>
        ) : null}

        <p className="text-center text-sm text-muted-foreground pt-2">
          Đã có tài khoản?{' '}
          <Link
            to="/auth/login"
            className="font-medium text-primary hover:underline"
            onClick={() => {
              sessionStorage.removeItem(WL_GOOGLE_PENDING_KEY);
            }}
          >
            Đăng nhập
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
};

import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Building2 } from 'lucide-react';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useLoginGoogle } from '../api/useAuth';
import { clearTokens } from '@/shared/api/tokenService';
import { WL_GOOGLE_PENDING_KEY } from '../utils/socialAuthErrors';

export const RegisterChoose = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    mutate: loginGoogle,
    isPending: isGoogleLoginPending,
  } = useLoginGoogle();

  const [pendingGoogleJwt, setPendingGoogleJwt] = useState(null);

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
      description: isCompletingGoogle
        ? 'Tài khoản để xem và ứng tuyển việc làm'
        : 'Đăng ký bằng form hoặc Google (chọn vai trò nếu dùng Google lần đầu)',
      icon: User,
      path: '/auth/register/worker',
      role: 'WORKER',
    },
    {
      key: 'employer',
      title: 'Nhà tuyển dụng',
      description: isCompletingGoogle
        ? 'Đăng tin và tuyển ứng viên'
        : 'Đăng ký bằng email và mật khẩu hoặc Google',
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
    <AuthLayout
      title={isCompletingGoogle ? 'Hoàn tất với Google' : 'Đăng ký'}
      subtitle={
        isCompletingGoogle
          ? 'Chọn vai trò để tạo tài khoản. Lần sau đăng nhập Google sẽ vào thẳng.'
          : 'Chọn loại tài khoản hoặc bắt đầu bằng Google'
      }
    >
      <Card className="p-6 rounded-2xl shadow-sm border-0 space-y-5">
        {!isCompletingGoogle ? (
          <>
            <GoogleSignInButton
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
            ({
              key,
              title,
              description,
              icon: Icon,
              path,
              role,
            }) => (
              <button
                key={key}
                type="button"
                disabled={isGoogleLoginPending}
                onClick={() => {
                  if (isCompletingGoogle && pendingGoogleJwt) {
                    clearTokens();
                    loginGoogle({
                      googleToken: pendingGoogleJwt,
                      additionalData: { role },
                    });
                    return;
                  }
                  navigate(path);
                }}
                className="w-full text-left disabled:opacity-60 disabled:pointer-events-none"
              >
                <Card className="p-5 rounded-2xl shadow-sm border-0 hover:shadow-md transition-all hover:bg-amber-50/50 group">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">
                        {isCompletingGoogle
                          ? `Tôi là ${title.toLowerCase()}`
                          : title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {description}
                      </p>
                      {isGoogleLoginPending && isCompletingGoogle ? (
                        <p className="text-xs text-primary mt-2">Đang xử lý…</p>
                      ) : null}
                    </div>
                  </div>
                </Card>
              </button>
            ),
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

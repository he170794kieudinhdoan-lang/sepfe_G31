import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthLayout } from '../components/AuthLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '../components/PasswordInput';
import { Label } from '@/components/ui/label';
import { useLogin, useLoginGoogle } from '../api/useAuth';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { clearTokens } from '@/shared/api/tokenService';

const schema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên tài khoản'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const Login = () => {
  const { mutate: login, isPending } = useLogin();
  const { mutate: loginGoogle, isPending: isGooglePending } = useLoginGoogle();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = (data) => {
    const payload = data.username.includes('@')
      ? { email: data.username, password: data.password }
      : { userName: data.username, password: data.password };

    login(payload);
  };

  return (
    <AuthLayout title="Đăng nhập">
      <Card className="p-6 rounded-2xl shadow-sm border-0">
        <GoogleSignInButton
          disabled={isPending || isGooglePending}
          onCredential={(jwt) => {
            clearTokens();
            loginGoogle({ googleToken: jwt, additionalData: {} });
          }}
        />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">
              hoặc đăng nhập bằng mật khẩu
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username">Tên tài khoản hoặc Email</Label>
            <Input
              id="username"
              type="text"
              placeholder="Nhập tên tài khoản hoặc email"
              className="rounded-xl border shadow-sm bg-card focus:bg-white transition-colors"
              {...register('username')}
            />
            {errors.username && (
              <p className="text-xs text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <PasswordInput
              id="password"
              placeholder="Nhập mật khẩu"
              className="rounded-xl border shadow-sm bg-card focus:bg-white transition-colors"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end text-sm">
            <Link
              to="/auth/forgot-password"
              className="text-primary hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isPending || isGooglePending}
            className="w-full rounded-xl h-11 font-medium"
          >
            {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Chưa có tài khoản?{' '}
          <Link
            to="/auth/register"
            className="text-primary font-medium hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
};

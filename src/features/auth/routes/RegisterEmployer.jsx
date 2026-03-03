import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useLoginGoogle, useSignUp } from '../api/useAuth';
import { loadGoogleClient } from '@/shared/utils/loadGoogleClient';
import { clearTokens } from '@/shared/api/tokenService';

const schema = z
  .object({
    fullName: z.string().min(3, 'Họ tên ít nhất 3 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu ít nhất 8 ký tự'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((value) => value === true, {
      message: 'Bạn phải đồng ý với điều khoản sử dụng',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export const RegisterEmployer = () => {
  const { mutate: signUpMutate, isPending: isSigningUp } = useSignUp();
  const { mutate: loginGoogle } = useLoginGoogle();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const onSubmit = (data) => {
    signUpMutate({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: 'EMPLOYER',
    });
  };

  useEffect(() => {
    const initGoogle = async () => {
      try {
        await loadGoogleClient();
        const clientId = import.meta.env.VITE_AUTH_SOCIAL_GOOGLE_CLIENT_ID;
        if (!clientId) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            clearTokens();
            if (response?.credential) {
              loginGoogle({
                googleToken: response.credential,
                additionalData: { role: 'EMPLOYER' },
              });
            } else {
              window.alert('Đăng nhập Google thất bại');
            }
          },
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleBtn'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            locale: 'vi',
          },
        );
      } catch (error) {
        console.error('Lỗi khởi tạo Google:', error);
      }
    };
    initGoogle();
  }, [loginGoogle]);

  return (
    <AuthLayout
      title="Đăng ký · Nhà tuyển dụng"
      subtitle="Tạo tài khoản bằng form hoặc Google"
    >
      <Card className="p-6 rounded-2xl shadow-sm border-0">
        <Link
          to="/auth/register"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại chọn loại đăng ký
        </Link>

        <div className="w-full rounded-2xl">
          <div
            id="googleBtn"
            className="[&>div]:w-full [&>div>iframe]:w-full [&>div>iframe]:h-11 [&>div>iframe]:rounded-xl"
          />
        </div>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">hoặc</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Nhập họ và tên"
              className="rounded-xl border shadow-sm bg-card focus:bg-white transition-colors"
              {...formRegister('fullName')}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="text"
              placeholder="Nhập email"
              className="rounded-xl border shadow-sm bg-card focus:bg-white transition-colors"
              {...formRegister('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="Ít nhất 8 ký tự"
              className="rounded-xl border shadow-sm bg-card focus:bg-white transition-colors"
              {...formRegister('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu"
              className="rounded-xl border shadow-sm bg-card focus:bg-white transition-colors"
              {...formRegister('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Input
                type="checkbox"
                id="terms"
                className="mr-2 w-4 h-4"
                {...formRegister('terms')}
              />
              <Label
                htmlFor="terms"
                className="text-sm text-muted-foreground gap-0"
              >
                Tôi đã đọc và đồng ý với
                <a href="/terms" className="text-blue-600 hover:underline px-1">
                  điều khoản sử dụng
                </a>
                của Work Link.
              </Label>
            </div>
            {errors.terms && (
              <p className="text-xs text-destructive mt-1">
                {errors.terms.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSigningUp}
            className="w-full rounded-xl h-11 font-medium"
          >
            {isSigningUp ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Đã có tài khoản?{' '}
          <Link
            to="/auth/login"
            className="text-primary font-medium hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
};

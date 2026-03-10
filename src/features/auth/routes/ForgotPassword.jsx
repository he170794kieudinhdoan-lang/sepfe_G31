import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthLayout } from '../components/AuthLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useForgotPassword } from '../api/useAuth';
import { MSG } from '@/shared/constants/messages';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

export const ForgotPassword = () => {
  const { mutate: forgotPassword, isPending, isSuccess } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = (data) => {
    forgotPassword(data.email);
  };

  if (isSuccess) {
    return (
      <AuthLayout title="Kiểm tra email" subtitle={MSG.MSG_FORGOT_SUCCESS}>
        <Card className="p-6 rounded-2xl shadow-sm border-0">
          <p className="text-sm text-muted-foreground mb-6">
            Nếu không thấy email, hãy kiểm tra thư mục spam hoặc thử lại.
          </p>
          <Link to="/auth/login">
            <Button variant="outline" className="w-full rounded-xl">
              Quay lại đăng nhập
            </Button>
          </Link>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email để nhận link đặt lại mật khẩu"
    >
      <Card className="p-6 rounded-2xl shadow-sm border-0">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
        </Link>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              className="rounded-xl border-0 shadow-sm bg-gray-50 focus:bg-white"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl h-11 font-medium"
          >
            {isPending ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
};

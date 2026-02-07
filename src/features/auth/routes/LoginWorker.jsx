import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthLayout } from '../components/AuthLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

const schema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên tài khoản'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const LoginWorker = () => {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '', remember: false },
  });

  const onSubmit = (data) => {
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      navigate('/profile');
    }, 800);
  };

  return (
    <AuthLayout title="Đăng nhập · Người tìm việc" subtitle="Dùng tài khoản và mật khẩu của bạn">
      <Card className="p-6 rounded-2xl shadow-sm border-0">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại chọn loại đăng nhập
        </Link>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username">Tên tài khoản</Label>
            <Input
              id="username"
              type="text"
              placeholder="Nhập tên tài khoản"
              className="rounded-xl border-0 shadow-sm bg-gray-50 focus:bg-white"
              {...register('username')}
            />
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
              className="rounded-xl border-0 shadow-sm bg-gray-50 focus:bg-white"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('remember')} />
              <span className="text-muted-foreground">Nhớ đăng nhập</span>
            </label>
            <Link to="/auth/forgot-password" className="text-primary hover:underline">Quên mật khẩu?</Link>
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl h-11 font-medium"
          >
            {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
};

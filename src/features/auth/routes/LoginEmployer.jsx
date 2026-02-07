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
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
});

export const LoginEmployer = () => {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = (data) => {
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      navigate('/employer');
    }, 800);
  };

  return (
    <AuthLayout title="Đăng nhập · Nhà tuyển dụng" subtitle="Đăng nhập bằng email công ty">
      <Card className="p-6 rounded-2xl shadow-sm border-0">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại chọn loại đăng nhập
        </Link>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@congty.com"
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
            {isPending ? 'Đang đăng nhập...' : 'Đăng nhập bằng Email'}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
};

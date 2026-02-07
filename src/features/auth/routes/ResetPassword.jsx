import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthLayout } from '../components/AuthLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MSG } from '@/shared/constants/messages';
import { useToast } from '@/shared/contexts/ToastContext';

const schema = z.object({
  newPassword: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
  confirm: z.string(),
}).refine((d) => d.newPassword === d.confirm, { message: 'Mật khẩu xác nhận không khớp', path: ['confirm'] });

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [invalidToken] = useState(false); // mock: set true to test MSG04
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirm: '' },
  });

  const onSubmit = () => {
    toast(MSG.MSG05);
    setTimeout(() => navigate('/auth/login'), 1500);
  };

  if (invalidToken || !token) {
    return (
      <AuthLayout title="Link không hợp lệ" subtitle={MSG.MSG04}>
        <Card className="p-6 rounded-2xl shadow-sm border-0">
          <p className="text-sm text-destructive mb-6">{MSG.MSG04}</p>
          <Link to="/auth/forgot-password">
            <Button className="w-full rounded-xl">Gửi lại link</Button>
          </Link>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Đặt lại mật khẩu" subtitle="Nhập mật khẩu mới">
      <Card className="p-6 rounded-2xl shadow-sm border-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Ít nhất 6 ký tự"
              className="rounded-xl border-0 shadow-sm bg-gray-50 focus:bg-white"
              {...register('newPassword')}
            />
            {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Xác nhận mật khẩu</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Nhập lại mật khẩu"
              className="rounded-xl border-0 shadow-sm bg-gray-50 focus:bg-white"
              {...register('confirm')}
            />
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
          </div>
          <Button type="submit" className="w-full rounded-xl h-11 font-medium">Đặt lại mật khẩu</Button>
        </form>
      </Card>
    </AuthLayout>
  );
};

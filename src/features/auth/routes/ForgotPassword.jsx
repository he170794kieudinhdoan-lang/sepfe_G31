import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/shared/contexts/ToastContext';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      setSent(true);
      toast('Link đặt lại mật khẩu đã gửi đến email của bạn (mock).');
    }, 1000);
  };

  if (sent) {
    return (
      <AuthLayout title="Kiểm tra email" subtitle="Chúng tôi đã gửi link đặt lại mật khẩu.">
        <Card className="p-6 rounded-2xl shadow-sm border-0">
          <p className="text-sm text-muted-foreground mb-6">
            Nếu không thấy email, hãy kiểm tra thư mục spam hoặc thử lại.
          </p>
          <Link to="/auth/login">
            <Button variant="outline" className="w-full rounded-xl">Quay lại đăng nhập</Button>
          </Link>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Quên mật khẩu" subtitle="Nhập email hoặc tên đăng nhập để nhận link đặt lại">
      <Card className="p-6 rounded-2xl shadow-sm border-0">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
        </Link>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email hoặc tên đăng nhập</Label>
            <Input
              id="email"
              type="text"
              placeholder="email@example.com hoặc username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-0 shadow-sm bg-gray-50 focus:bg-white"
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full rounded-xl h-11 font-medium">
            {isPending ? 'Đang gửi...' : 'Gửi link'}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
};

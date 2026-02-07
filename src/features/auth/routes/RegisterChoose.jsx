import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Card } from '@/components/ui/card';
import { User, Building2 } from 'lucide-react';

export const RegisterChoose = () => {
  const navigate = useNavigate();

  const options = [
    {
      key: 'worker',
      title: 'Đăng ký làm người tìm việc',
      description: 'Tạo tài khoản bằng tên đăng nhập, mật khẩu hoặc Google',
      icon: User,
      path: '/auth/register/worker',
    },
    {
      key: 'employer',
      title: 'Đăng ký làm nhà tuyển dụng',
      description: 'Chỉ đăng ký bằng tài khoản Google',
      icon: Building2,
      path: '/auth/register/employer',
    },
  ];

  return (
    <AuthLayout title="Đăng ký" subtitle="Chọn loại tài khoản bạn muốn tạo">
      <div className="space-y-4">
        {options.map(({ key, title, description, icon: Icon, path }) => (
          <button
            key={key}
            type="button"
            onClick={() => navigate(path)}
            className="w-full text-left"
          >
            <Card className="p-5 rounded-2xl shadow-sm border-0 hover:shadow-md transition-all hover:bg-amber-50/50 group">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground mt-8">
        Đã có tài khoản?{' '}
        <Link to="/auth/login" className="font-medium text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </AuthLayout>
  );
};

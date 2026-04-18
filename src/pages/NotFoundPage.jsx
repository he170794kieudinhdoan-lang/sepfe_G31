import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search, HelpCircle } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Lỗi 404
      </p>
      <h1 className="mt-4 text-center text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
        Trang không tồn tại
      </h1>
      <p className="mt-4 max-w-md text-center text-muted-foreground leading-relaxed">
        Đường dẫn bạn mở không khớp với bất kỳ trang nào trên WorkLink. Có thể
        liên kết đã thay đổi hoặc địa chỉ nhập chưa đúng.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="gap-2">
          <Link to="/">
            <Home className="h-4 w-4" />
            Về trang chủ
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link to="/search">
            <Search className="h-4 w-4" />
            Tìm việc làm
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg" className="gap-2">
          <Link to="/support">
            <HelpCircle className="h-4 w-4" />
            Trung tâm hỗ trợ
          </Link>
        </Button>
      </div>
    </div>
  );
};

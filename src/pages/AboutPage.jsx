import { Link } from 'react-router-dom';
import { Container } from '@/shared/components/Container';
import { Button } from '@/components/ui/button';
import { Target, Users, Shield, Zap } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="bg-background min-h-full pb-16">
      <section className="border-b bg-gradient-to-b from-primary/5 to-background py-14 md:py-20">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Về WorkLink
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Kết nối lao động với cơ hội minh bạch
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            WorkLink là nền tảng tuyển dụng tập trung vào khu công nghiệp và việc
            làm phổ thông — giúp người lao động tìm việc rõ ràng, giúp nhà tuyển
            dụng tiếp cận đúng người, đúng thời điểm.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/search">Tìm việc làm</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/companies">Xem công ty</Link>
            </Button>
          </div>
        </Container>
      </section>

      <Container className="mt-12 space-y-12">
        <section className="grid gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <h2 className="text-xl font-bold text-foreground">Sứ mệnh</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Giảm khoảng cách thông tin giữa người tìm việc và doanh nghiệp: mô
              tả công việc, lương, ca làm và địa điểm được trình bày nhất quán,
              dễ so sánh — không chỉ là danh sách tin rời rạc.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Đối tượng phục vụ</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Công nhân, nhân viên vận hành, lao động phổ thông và các vị trí tại
              khu công nghiệp; đồng thời hỗ trợ doanh nghiệp đăng tin, quản lý ứng
              tuyển và thống kê cơ bản trên cùng một hệ thống.
            </p>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Target,
              title: 'Minh bạch',
              desc: 'Thông tin tin tuyển được cấu trúc: lương, ca, địa điểm, mô tả.',
            },
            {
              icon: Users,
              title: 'Hai phía',
              desc: 'Ứng viên và nhà tuyển dụng đều có không gian quản lý riêng.',
            },
            {
              icon: Shield,
              title: 'An toàn & điều khoản',
              desc: 'Điều khoản sử dụng và quyền riêng tư được công bố rõ ràng.',
            },
            {
              icon: Zap,
              title: 'Trải nghiệm',
              desc: 'Giao diện tối ưu tìm kiếm, lưu tin, chat và thông báo.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border bg-muted/30 px-6 py-8 md:px-10">
          <h2 className="text-xl font-bold text-foreground">Liên hệ dự án</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Đội phát triển G31 — môi trường học tập và sản phẩm demo. Mọi góp ý về
            tính năng hoặc lỗi có thể gửi qua email{' '}
            <a
              className="font-medium text-primary underline-offset-4 hover:underline"
              href="mailto:contact@worklink.com"
            >
              contact@worklink.com
            </a>
            .
          </p>
        </section>
      </Container>
    </div>
  );
};

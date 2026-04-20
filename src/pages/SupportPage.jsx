import { Link } from 'react-router-dom';
import { Container } from '@/shared/components/Container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import { SupportTicketForm } from '@/features/support/components/SupportTicketForm';

const FAQ = [
  {
    q: 'Làm sao để tạo tài khoản và hoàn thiện hồ sơ?',
    a: 'Chọn Đăng ký → Worker hoặc Employer, điền email và thông tin bắt buộc. Sau khi đăng nhập, vào Hồ sơ để bổ sung kinh nghiệm, kỹ năng hoặc thông tin công ty (tùy vai trò).',
  },
  {
    q: 'Tôi ứng tuyển như thế nào?',
    a: 'Mở chi tiết tin tuyển, chọn Ứng tuyển (có thể yêu cầu đăng nhập). Bạn có thể theo dõi trạng thái trong mục liên quan đến ứng tuyển / lời mời (nếu được bật trên hệ thống).',
  },
  {
    q: 'Nhà tuyển dụng đăng tin và duyệt ứng viên ra sao?',
    a: 'Đăng nhập vai trò Employer, hoàn tất hồ sơ doanh nghiệp nếu được yêu cầu. Tạo tin tuyển dụng, chờ duyệt (nếu có quy trình duyệt). Quản lý tin và ứng viên trong trung tâm nhà tuyển dụng.',
  },
  {
    q: 'Dữ liệu cá nhân được bảo vệ thế nào?',
    a: 'Tham khảo Chính sách bảo mật và Điều khoản dịch vụ. Chúng tôi mô tả mục đích thu thập, không bán dữ liệu và quyền của bạn.',
  },
];

export const SupportPage = () => {
  return (
    <div className="bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_46%,_#f8fafc_100%)] min-h-full pb-16">
      <Container className="max-w-6xl py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                Hỗ trợ
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground md:text-5xl">
                Trung tâm hỗ trợ cho người dùng và manager
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Gửi câu hỏi trực tiếp để đội ngũ quản lý tiếp nhận, phân công và phản hồi theo đúng kênh ưu tiên. Nếu bạn chỉ cần đọc nhanh, phần FAQ bên dưới sẽ giải thích các bước phổ biến.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-6 font-semibold shadow-sm">
                <a href="#support-form">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Đặt câu hỏi ngay
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-6 font-semibold">
                <a href="#faq">Xem FAQ</a>
              </Button>
            </div>

            <Card className="border-0 bg-white/90 p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Mail className="h-5 w-5 text-primary" />
                Liên hệ
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  +84 123 456 789
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <a
                    href="mailto:contact@worklink.com"
                    className="font-medium text-primary hover:underline"
                  >
                    contact@worklink.com
                  </a>
                </li>
              </ul>
            </Card>
          </div>

          <div id="support-form" className="scroll-mt-24">
            <SupportTicketForm />
          </div>
        </div>

        <section id="faq" className="mt-12 scroll-mt-24">
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <HelpCircle className="h-6 w-6 text-primary" />
            Câu hỏi thường gặp (FAQ)
          </h2>
          <div className="mt-6 space-y-4">
            {FAQ.map((item) => (
              <Card key={item.q} className="border-0 bg-white/90 p-5 shadow-sm">
                <h3 className="font-semibold text-foreground">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <p className="mt-10 text-sm text-muted-foreground">
          <Link to="/terms" className="font-medium text-primary hover:underline">
            Điều khoản dịch vụ
          </Link>
          {' · '}
          <Link to="/privacy" className="font-medium text-primary hover:underline">
            Chính sách bảo mật
          </Link>
          {' · '}
          <Link to="/about" className="font-medium text-primary hover:underline">
            Về chúng tôi
          </Link>
        </p>
      </Container>
    </div>
  );
};

import { Link } from 'react-router-dom';
import { Container } from '@/shared/components/Container';
import { Card } from '@/components/ui/card';
import { Mail, Phone, MapPin, HelpCircle } from 'lucide-react';

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
    <div className="bg-background min-h-full pb-16">
      <Container className="max-w-3xl py-10 md:py-14">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Hỗ trợ
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Trung tâm hỗ trợ
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Tổng hợp thông tin liên hệ và câu hỏi thường gặp khi sử dụng WorkLink.
        </p>

        <Card className="mt-10 border-0 p-6 shadow-sm">
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

        <section id="faq" className="mt-12 scroll-mt-24">
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <HelpCircle className="h-6 w-6 text-primary" />
            Câu hỏi thường gặp (FAQ)
          </h2>
          <div className="mt-6 space-y-4">
            {FAQ.map((item) => (
              <Card key={item.q} className="border-0 p-5 shadow-sm">
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

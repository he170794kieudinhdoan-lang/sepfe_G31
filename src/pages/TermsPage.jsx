import { Card } from '@/components/ui/card';

const SECTIONS = [
  { id: 'accept', title: '1. Chấp nhận điều khoản', content: 'Khi truy cập và sử dụng WorkLink, bạn đồng ý tuân thủ các điều khoản này.' },
  { id: 'service', title: '2. Dịch vụ', content: 'WorkLink cung cấp nền tảng kết nối người tìm việc với nhà tuyển dụng. Thông tin lương, ca làm, địa điểm được hiển thị rõ ràng.' },
  { id: 'responsibility', title: '3. Trách nhiệm người dùng', content: 'Bạn cam kết cung cấp thông tin chính xác và sử dụng dịch vụ đúng mục đích.' },
  { id: 'privacy', title: '4. Bảo mật & Dữ liệu', content: 'Chúng tôi bảo vệ dữ liệu cá nhân theo chính sách bảo mật. Dữ liệu chỉ dùng cho mục đích cung cấp dịch vụ.' },
  { id: 'contact', title: '5. Liên hệ', content: 'Mọi thắc mắc vui lòng liên hệ qua mục Hỗ trợ hoặc email support@worklink.vn.' },
];

const VERSION = '1.0';
const LAST_UPDATED = '01/02/2026';

export const TermsPage = () => {
  return (
    <div className="bg-gray-50 min-h-full py-12">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-2">Điều khoản & điều kiện</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Phiên bản {VERSION} · Cập nhật lần cuối: {LAST_UPDATED}
        </p>
        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <Card key={section.id} id={section.id} className="p-6 rounded-xl shadow-sm border-0 scroll-mt-24">
              <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

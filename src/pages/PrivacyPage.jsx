import { Link } from 'react-router-dom';
import { Container } from '@/shared/components/Container';
import { Card } from '@/components/ui/card';

const SECTIONS = [
  {
    title: '1. Phạm vi áp dụng',
    body: `Chính sách này mô tả cách WorkLink thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân khi bạn sử dụng website, ứng dụng và các dịch vụ liên quan. Bằng việc tiếp tục sử dụng dịch vụ, bạn xác nhận đã đọc và hiểu các nội dung dưới đây.`,
  },
  {
    title: '2. Thông tin chúng tôi có thể thu thập',
    body: `• Thông tin tài khoản: họ tên, email, số điện thoại, vai trò (ứng viên / nhà tuyển dụng).\n• Hồ sơ lao động hoặc hồ sơ doanh nghiệp do bạn cung cấp khi đăng ký hoặc cập nhật.\n• Dữ liệu sử dụng dịch vụ: tin đã xem, tin đã lưu, lịch sử ứng tuyển, tin nhắn trong nền tảng (nếu có).\n• Thông tin kỹ thuật: loại trình duyệt, thời gian truy cập gần nhất — nhằm vận hành và bảo mật hệ thống.`,
  },
  {
    title: '3. Mục đích sử dụng',
    body: `Thông tin được dùng để: xác thực tài khoản; hiển thị hồ sơ theo chức năng bạn chọn; kết nối ứng viên với nhà tuyển dụng; gửi thông báo liên quan đến tài khoản và tin tuyển; cải thiện trải nghiệm và xử lý sự cố; tuân thủ nghĩa vụ pháp lý khi có yêu cầu.`,
  },
  {
    title: '4. Chia sẻ thông tin',
    body: `Chúng tôi không bán dữ liệu cá nhân. Thông tin có thể được chia sẻ trong phạm vi cần thiết với nhà tuyển dụng / ứng viên theo luồng ứng tuyển bạn chủ động thực hiện; với nhà cung cấp hạ tầng (hosting, email) theo hợp đồng bảo mật; hoặc khi pháp luật yêu cầu.`,
  },
  {
    title: '5. Bảo mật & lưu trữ',
    body: `Áp dụng các biện pháp kỹ thuật và tổ chức hợp lý để bảo vệ dữ liệu. Thời gian lưu trữ phụ thuộc mục đích sử dụng và yêu cầu pháp lý; dữ liệu không còn cần thiết sẽ được xóa hoặc ẩn danh hóa theo quy trình nội bộ.`,
  },
  {
    title: '6. Quyền của bạn',
    body: `Bạn có thể yêu cầu truy cập, chỉnh sửa, xóa hoặc hạn chế xử lý dữ liệu cá nhân trong phạm vi luật hiện hành, bằng cách liên hệ qua email hỗ trợ được nêu trên trang Liên hệ / Hỗ trợ.`,
  },
  {
    title: '7. Cập nhật chính sách',
    body: `Chính sách có thể được cập nhật theo từng thời điểm. Phiên bản mới sẽ được đăng tại địa chỉ này kèm ngày hiệu lực. Nên xem lại định kỳ.`,
  },
];

export const PrivacyPage = () => {
  return (
    <div className="bg-background min-h-full pb-16">
      <Container className="max-w-3xl py-10 md:py-14">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Pháp lý
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Chính sách bảo mật
        </h1>
        <p className="mt-3 text-muted-foreground">
          Hiệu lực tham chiếu: tháng 4/2026. Áp dụng cho nền tảng WorkLink (phiên
          bản demo đội G31).
        </p>

        <div className="mt-10 space-y-6">
          {SECTIONS.map((s) => (
            <Card key={s.title} className="border-0 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">{s.title}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </Card>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          Xem thêm{' '}
          <Link to="/terms" className="font-medium text-primary hover:underline">
            Điều khoản dịch vụ
          </Link>{' '}
          và{' '}
          <Link to="/support" className="font-medium text-primary hover:underline">
            Trung tâm hỗ trợ
          </Link>
          .
        </p>
      </Container>
    </div>
  );
};

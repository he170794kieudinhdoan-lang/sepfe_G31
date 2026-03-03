import { Link } from 'react-router-dom';
import {
  Facebook,
  Linkedin,
  Github,
  Mail,
  Phone,
  MapPin,
  Heart,
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Cột 1: Thông tin công ty */}
          <div className="space-y-6">
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            >
              WorkLink
            </Link>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Kết nối nhân tài với những cơ hội nghề nghiệp tốt nhất. Nền tảng
              tuyển dụng tin cậy dành cho mọi người.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
              >
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Cột 2: Đường dẫn nhanh */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-6 uppercase tracking-wider text-xs">
              Khám phá
            </h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/"
                  className="hover:text-primary hover:translate-x-1 inline-block transition-all"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/jobs"
                  className="hover:text-primary hover:translate-x-1 inline-block transition-all"
                >
                  Tìm kiếm việc làm
                </Link>
              </li>
              <li>
                <Link
                  to="/companies"
                  className="hover:text-primary hover:translate-x-1 inline-block transition-all"
                >
                  Công ty tiêu biểu
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-primary hover:translate-x-1 inline-block transition-all"
                >
                  Về chúng tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ & Pháp lý */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-6 uppercase tracking-wider text-xs">
              Hỗ trợ
            </h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <a
                  href="/support"
                  className="hover:text-primary hover:translate-x-1 inline-block transition-all"
                >
                  Trung tâm hỗ trợ
                </a>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-primary hover:translate-x-1 inline-block transition-all"
                >
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-primary hover:translate-x-1 inline-block transition-all"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <a
                  href="/faq"
                  className="hover:text-primary hover:translate-x-1 inline-block transition-all"
                >
                  Câu hỏi thường gặp
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-6 uppercase tracking-wider text-xs">
              Liên hệ
            </h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                <span>Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-primary shrink-0" />
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-primary shrink-0" />
                <span>contact@worklink.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bản quyền và dưới cùng */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-muted-foreground">
          <p>© 2026 WorkLink. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center space-x-1">
            <span>Thiết kế với</span>
            <Heart
              size={12}
              className="text-red-500 fill-current animate-pulse"
            />
            <span>bởi đội ngũ G31</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

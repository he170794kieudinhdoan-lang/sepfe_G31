
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-gray-50 mt-auto pt-8 pb-6 shadow-[0_-1px_0_0_rgba(0,0,0,0.05)]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <Link to="/" className="text-lg font-bold text-primary">
            WorkLink
          </Link>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-primary transition-colors">
              Điều khoản & điều kiện
            </Link>
            <a href="/support" className="hover:text-primary transition-colors">
              Hỗ trợ
            </a>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">© 2026 WorkLink</p>
      </div>
    </footer>
  );
};

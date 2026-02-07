import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, MessageCircle, Search, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const TASKBAR_LINKS = [
  { to: '/jobs', label: 'Việc làm' },
  { to: '/companies', label: 'Công ty' },
  { to: '/terms', label: 'Điều khoản' },
];

export const Header = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [avatarOpen, setAvatarOpen] = useState(false);
  const isLoggedIn = false; // mock: chưa đăng nhập

  const handleSearch = () => {
    if (search.trim()) navigate(`/jobs?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          <Link
            to="/"
            className="text-2xl font-extrabold text-primary shrink-0 flex items-center gap-2"
          >
            <img src="/logo_01.png" alt="WorkLink" className="h-9 w-auto" />
            <span>WorkLink</span>
          </Link>

          <div className="flex-1 max-w-2xl flex items-center gap-2 rounded-xl bg-gray-100/80 shadow-sm px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Tìm theo tên việc/công ty/khu vực"
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
            />
            <Button size="sm" className="rounded-lg shrink-0" onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link to="/notifications"><Bell className="h-5 w-5" /></Link>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link to="/chat"><MessageCircle className="h-5 w-5" /></Link>
            </Button>

            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setAvatarOpen(!avatarOpen)}
                  className="flex items-center gap-2 rounded-full shadow-sm bg-gray-50 px-3 py-2 hover:bg-gray-100"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <ChevronDown className={cn('h-4 w-4 transition', avatarOpen && 'rotate-180')} />
                </button>
                {avatarOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAvatarOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white py-1 shadow-lg z-50">
                      <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setAvatarOpen(false)}>Hồ sơ</Link>
                      <Link to="/wishlist" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setAvatarOpen(false)}>Việc làm đã lưu</Link>
                      <Link to="/employer" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setAvatarOpen(false)}>Nhà tuyển dụng</Link>
                      <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600">
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="rounded-xl" asChild>
                  <Link to="/auth/login">Đăng nhập</Link>
                </Button>
                <Button className="rounded-xl" asChild>
                  <Link to="/auth/register">Đăng ký</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <nav className="flex items-center gap-1 border-t border-gray-100 py-2">
          {TASKBAR_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary/10 hover:text-foreground transition"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

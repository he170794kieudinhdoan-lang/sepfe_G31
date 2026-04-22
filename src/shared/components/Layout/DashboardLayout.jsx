import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, ChevronDown, Search, User, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useGetUserConversations } from '@/features/chat/api/useChat';
import { useChatRealtime } from '@/features/chat/hooks/useChatRealtime';

export const DashboardLayout = ({
  title,
  /** Dòng mô tả dưới tiêu đề (thay cho text cố định) */
  subtitle,
  menu,
  activeKey,
  onSelect,
  topbarBell,
  children,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const { data: conversations } = useGetUserConversations();

  useChatRealtime(null, user?.userId || user?.id);

  const unreadCount =
    conversations?.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0) || 0;

  const handleLogout = async () => {
    await logout();
    setAvatarOpen(false);
    navigate('/auth/login');
  };

  return (
    <div className=" bg-slate-50">
      <div className="flex">
        <aside className="w-64 bg-white border-r px-5 py-6 hidden lg:flex flex-col h-screen sticky top-0">
          <Link
            to="/"
            className="inline-flex shrink-0 items-center px-2 hover:opacity-90 transition-opacity"
          >
            <img src="/logo_02.png" alt="WorkLink" className="h-12 w-auto" />
          </Link>
          <div className="mt-8 space-y-1">
            {menu.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  if (item.path) {
                    navigate(item.path);
                    if (!item.externalNav) onSelect(item.key);
                  } else {
                    onSelect(item.key);
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-semibold transition',
                  activeKey === item.key
                    ? 'bg-primary-muted text-foreground'
                    : 'text-muted-foreground hover:bg-gray-100',
                )}
              >
                {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                <span>{item.label}</span>
                {item.key === 'chat' && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white  text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full animate-in zoom-in duration-300">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                {activeKey === item.key &&
                  !item.path &&
                  item.key !== 'chat' && (
                    <span className="ml-auto text-xs text-primary">●</span>
                  )}
              </button>
            ))}
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b px-6 py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-sm text-muted-foreground">
                  {subtitle ?? 'Theo dõi hoạt động tài khoản và thao tác nhanh'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full relative"
                  asChild
                >
                  {/* <Link to="/chat">
                    <MessageCircle className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white  text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white ring-1 ring-primary/20">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link> */}

                  <Link to="/chat">
                    <MessageCircle className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] leading-5 font-semibold text-center ring-2 ring-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </Button>

                {topbarBell || (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-primary-muted hover:text-primary transition"
                  >
                    <Bell className="h-5 w-5 text-gray-700" />
                  </Button>
                )}
                <div className="relative z-50">
                  <button
                    onClick={() => setAvatarOpen(!avatarOpen)}
                    className="flex items-center gap-2 rounded-full border bg-white shadow-sm px-3 py-1.5 hover:bg-gray-50 transition"
                  >
                    <div className="h-7 w-7 rounded-full bg-primary-muted flex items-center justify-center shrink-0">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Avatar"
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <span className="text-sm font-semibold max-w-[120px] truncate">
                      {user?.fullName || 'User'}
                    </span>
                    <ChevronDown
                      className={cn(
                        'ml-1 h-4 w-4 text-gray-500 transition-transform duration-200',
                        avatarOpen && 'rotate-180',
                      )}
                    />
                  </button>

                  {avatarOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setAvatarOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white py-2 shadow-xl border border-gray-100 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user?.fullName || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {user?.email || ''}
                          </p>
                          {user?.roleType && (
                            <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-primary-muted text-primary">
                              {user.roleType}
                            </span>
                          )}
                        </div>

                        <div className="py-1">
                          <Link
                            to="/"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition"
                            onClick={() => setAvatarOpen(false)}
                          >
                            Về trang người tìm việc (Trang chủ)
                          </Link>
                          {user?.roleType === 'EMPLOYER' && (
                            <Link
                              to="/employer"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition"
                              onClick={() => setAvatarOpen(false)}
                            >
                              Trang Nhà Tuyển Dụng
                            </Link>
                          )}
                          {user?.roleType === 'MANAGER' && (
                            <Link
                              to="/manager"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition"
                              onClick={() => setAvatarOpen(false)}
                            >
                              Trang Quản lý hệ thống
                            </Link>
                          )}
                          {user?.roleType === 'ADMIN' && (
                            <Link
                              to="/admin"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition"
                              onClick={() => setAvatarOpen(false)}
                            >
                              Trang Quản Trị Viên
                            </Link>
                          )}
                          {/* Profile or other link if needed */}
                        </div>

                        <div className="border-t border-gray-100 my-1" />

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 transition"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-1">
              {menu.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                      if (!item.externalNav) onSelect(item.key);
                    } else {
                      onSelect(item.key);
                    }
                  }}
                  className={cn(
                    'shrink-0 rounded-full border px-4 py-2 text-xs font-semibold',
                    activeKey === item.key
                      ? 'bg-primary-muted text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="px-3 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

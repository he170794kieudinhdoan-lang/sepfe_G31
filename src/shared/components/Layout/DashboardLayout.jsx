import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, ChevronDown, Search, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useGetUserConversations } from '@/features/chat/api/useChat';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useChatRealtime } from '@/features/chat/hooks/useChatRealtime';

export const DashboardLayout = ({
  title,
  menu,
  activeKey,
  onSelect,
  topbarBell,
  children,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: conversations } = useGetUserConversations();

  useChatRealtime(null, user?.userId || user?.id);

  const unreadCount =
    conversations?.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0) || 0;

  return (
    <div className=" bg-slate-50">
      <div className="flex">
        <aside className="w-64 bg-white border-r px-5 py-6 hidden lg:flex flex-col h-screen sticky top-0">
          <Link
            to="/"
            className="text-2xl font-extrabold text-primary hover:opacity-80 transition-opacity px-4"
          >
            WorkLink
          </Link>
          <div className="mt-8 space-y-1">
            {menu.map((item) => (
              <button
                key={item.key}
                onClick={() =>
                  item.path ? navigate(item.path) : onSelect(item.key)
                }
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
                  Bảng điều khiển WorkLink
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 rounded-full border bg-gray-50 px-3 py-2 mr-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-4 p-0"
                    placeholder="Tìm nhanh"
                  />
                </div>

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
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5" />
                  </Button>
                )}
                <Button variant="outline" className="rounded-full px-4 ml-2">
                  Admin <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-1">
              {menu.map((item) => (
                <button
                  key={item.key}
                  onClick={() => onSelect(item.key)}
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
          <div className="px-6 py-8">{children}</div>
        </div>
      </div>
    </div>
  );
};

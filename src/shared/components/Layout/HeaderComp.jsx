import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, MessageCircle, Search, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationRealtime,
  useNotifications,
} from '@/features/notifications';
import {
  getUnreadCount,
  normalizeNotifications,
} from '@/features/notifications/utils/normalizeNotifications';
import { useToast } from '@/shared/contexts/ToastContext';

const TASKBAR_LINKS = [
  { to: '/jobs', label: 'Việc làm' },
  { to: '/companies', label: 'Công ty' },
  { to: '/terms', label: 'Điều khoản' },
];

{
  /* <div className="flex-1 max-w-2xl flex items-center gap-2 rounded-xl bg-gray-100/80 shadow-sm px-3 py-2">
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
</div> */
}
export const Header = () => {
  const NOTIFICATION_POLLING_MS = 15000;

  const navigate = useNavigate();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { toast } = useToast();
  const currentUserId = user?.userId || user?.id || user?._id;

  const { isRealtimeSubscribed } = useNotificationRealtime({
    enabled: isAuthenticated,
    userId: currentUserId,
  });

  const { data: notificationData, isLoading: isNotificationLoading } = useNotifications({
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated && !isRealtimeSubscribed ? NOTIFICATION_POLLING_MS : false,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const notifications = normalizeNotifications(notificationData);
  const unreadCount = getUnreadCount(notifications);
  const previewItems = notifications.slice(0, 5);

  const handleLogout = async () => {
    await logout();
    setAvatarOpen(false);
    navigate('/auth/login');
  };

  const handleMarkRead = (notificationId) => {
    markReadMutation.mutate(notificationId, {
      onError: (error) => {
        const message = error.response?.data?.message || 'Không thể đánh dấu đã đọc.';
        toast(message, 'error');
      },
    });
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate(undefined, {
      onError: (error) => {
        const message = error.response?.data?.message || 'Không thể đánh dấu tất cả đã đọc.';
        toast(message, 'error');
      },
    });
  };

  return (
    <header className='sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between gap-4 h-16'>
          <Link
            to='/'
            className='text-2xl font-extrabold text-primary shrink-0 flex items-center gap-2'
          >
            <img src='/logo_01.png' alt='WorkLink' className='h-auto w-60' />
          </Link>
          {/* 
          <div className='flex-1 max-w-2xl flex items-center gap-2 rounded-xl bg-gray-100/80 shadow-sm px-3 py-2'>
            <Search className='h-4 w-4 text-muted-foreground shrink-0' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder='Tìm theo tên việc/công ty/khu vực'
              className='border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-9'
            />
            <Button size='sm' className='rounded-lg shrink-0' onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </div> */}

          <div className='flex items-center gap-2 shrink-0'>
            <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='relative rounded-full text-gray-700 hover:bg-primary/10 hover:text-foreground transition'
                >
                  <Bell className='h-5 w-5' />
                  {unreadCount > 0 && (
                    <span className='absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white' />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align='end' className='w-[360px] p-0 overflow-hidden rounded-xl'>
                <div className='px-4 py-3 border-b bg-white'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-sm font-semibold'>Thông báo</h3>
                    <span className='text-xs text-muted-foreground'>
                      {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Đã đọc hết'}
                    </span>
                  </div>
                </div>

                <div className='max-h-[360px] overflow-y-auto bg-white'>
                  {isNotificationLoading ? (
                    <div className='space-y-3 p-4'>
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className='flex gap-3'>
                          <Skeleton className='h-9 w-9 rounded-lg shrink-0' />
                          <div className='flex-1 space-y-2'>
                            <Skeleton className='h-3.5 w-11/12' />
                            <Skeleton className='h-3 w-1/2' />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : previewItems.length === 0 ? (
                    <div className='px-4 py-8 text-center text-sm text-muted-foreground'>
                      Chưa có thông báo nào.
                    </div>
                  ) : (
                    <div className='divide-y'>
                      {previewItems.map((item) => (
                        <button
                          key={item.id}
                          type='button'
                          className={cn(
                            'w-full text-left px-4 py-3 transition hover:bg-gray-50 cursor-pointer',
                            !item.read && 'bg-primary/5'
                          )}
                          onClick={() => {
                            if (!item.read) {
                              handleMarkRead(item.id);
                            }
                            setNotificationOpen(false);
                          }}
                        >
                          <div className='flex items-start gap-3'>
                            <div
                              className={cn(
                                'mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                                !item.read ? 'bg-primary/20' : 'bg-gray-100'
                              )}
                            >
                              <Bell className={cn('h-4 w-4', !item.read ? 'text-primary' : 'text-gray-500')} />
                            </div>
                            <div className='min-w-0 flex-1'>
                              <p className='text-sm leading-5 line-clamp-2'>{item.content}</p>
                              <p className='mt-1 text-xs text-muted-foreground'>{item.time}</p>
                            </div>
                            {!item.read && <span className='mt-1 h-2 w-2 rounded-full bg-primary shrink-0' />}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className='px-3 py-2 border-t bg-gray-50 flex items-center justify-between gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-xs'
                    disabled={unreadCount === 0 || markAllReadMutation.isPending}
                    onClick={handleMarkAllRead}
                  >
                    Đánh dấu tất cả đã đọc
                  </Button>

                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant='ghost'
              size='icon'
              className='rounded-full text-gray-700 hover:bg-primary/10 hover:text-foreground transition'
              asChild
            >
              <Link to='/chat'>
                <MessageCircle className='h-5 w-5' />
              </Link>
            </Button>
            <nav className='flex items-center gap-1 border-t border-gray-100 py-2'>
              {TASKBAR_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className='px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary/10 hover:text-foreground transition'
                >
                  {label}
                </Link>
              ))}
            </nav>

            {isLoading ? (
              <div className='flex items-center gap-2'>
                <Skeleton className='h-10 w-24 rounded-xl' />
                <Skeleton className='h-10 w-24 rounded-xl' />
              </div>
            ) : isAuthenticated ? (
              <div className='relative'>
                <button
                  onClick={() => setAvatarOpen(!avatarOpen)}
                  className='flex items-center gap-2 rounded-full shadow-sm bg-gray-50 px-3 py-2 hover:bg-gray-100 cursor-pointer transition'
                >
                  <div className='h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center'>
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user?.fullName || 'User'}
                        className='h-full w-full rounded-full object-cover'
                      />
                    ) : (
                      <User className='h-4 w-4 text-primary' />
                    )}
                  </div>
                  <span className='text-sm font-medium max-w-[100px] truncate'>
                    {user?.fullName || 'User'}
                  </span>
                  <ChevronDown className={cn('h-4 w-4 transition', avatarOpen && 'rotate-180')} />
                </button>
                {avatarOpen && (
                  <>
                    <div className='fixed inset-0 z-40' onClick={() => setAvatarOpen(false)} />
                    <div className='absolute right-0 top-full mt-2 w-56 rounded-xl bg-white py-2 shadow-lg border z-50'>
                      <div className='px-4 py-2 border-b'>
                        <p className='text-sm font-semibold'>{user?.fullName || 'User'}</p>
                        <p className='text-xs text-muted-foreground'>{user?.email || ''}</p>
                        {user?.roleType && (
                          <span className='inline-block mt-1 px-2 py-0.5 rounded text-xs bg-primary/10 text-primary font-medium'>
                            {user.roleType === 'EMPLOYER'
                              ? 'Nhà tuyển dụng'
                              : user.roleType === 'ADMIN'
                                ? 'Quản trị viên'
                                : 'Người tìm việc'}
                          </span>
                        )}
                      </div>

                      <Link
                        to='/profile'
                        className='block px-4 py-2 text-sm hover:bg-gray-50'
                        onClick={() => setAvatarOpen(false)}
                      >
                        Hồ sơ của tôi
                      </Link>
                      <Link
                        to='/wishlist'
                        className='block px-4 py-2 text-sm hover:bg-gray-50'
                        onClick={() => setAvatarOpen(false)}
                      >
                        Việc làm đã lưu
                      </Link>

                      {user?.roleType === 'EMPLOYER' && (
                        <Link
                          to='/employer'
                          className='block px-4 py-2 text-sm hover:bg-gray-50'
                          onClick={() => setAvatarOpen(false)}
                        >
                          Quản lý tuyển dụng
                        </Link>
                      )}

                      {user?.roleType === 'ADMIN' && (
                        <Link
                          to='/admin'
                          className='block px-4 py-2 text-sm hover:bg-gray-50'
                          onClick={() => setAvatarOpen(false)}
                        >
                          Quản trị hệ thống
                        </Link>
                      )}

                      <div className='border-t my-1' />

                      <button
                        onClick={handleLogout}
                        className='w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 cursor-pointer transition'
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <Button variant='ghost' className='rounded-xl' asChild>
                  <Link to='/auth/login'>Đăng nhập</Link>
                </Button>
                <Button className='rounded-xl' asChild>
                  <Link to='/auth/register'>Đăng ký</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import {
    useMarkAllNotificationsRead,
    useMarkNotificationRead,
    useNotificationRealtime,
    useNotifications,
} from '@/features/notifications';
import { getUnreadCount, normalizeNotifications } from '@/features/notifications/utils/normalizeNotifications';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useToast } from '@/shared/contexts/ToastContext';

const NOTIFICATION_POLLING_MS = 5000;

export const NotificationBellPopover = () => {
    const { toast } = useToast();
    const { isAuthenticated, user } = useAuth();
    const [open, setOpen] = useState(false);

    const userId = user?.userId || user?.id || user?._id;
    const { isRealtimeSubscribed } = useNotificationRealtime({
        enabled: isAuthenticated,
        userId,
    });

    const { data, isLoading } = useNotifications({
        enabled: isAuthenticated,
        refetchInterval: isAuthenticated && !isRealtimeSubscribed ? NOTIFICATION_POLLING_MS : false,
        refetchIntervalInBackground: true,
        refetchOnWindowFocus: true,
    });

    const markReadMutation = useMarkNotificationRead();
    const markAllReadMutation = useMarkAllNotificationsRead();

    const notifications = normalizeNotifications(data);
    const unreadCount = getUnreadCount(notifications);
    const previewItems = notifications.slice(0, 5);

    const handleRead = (notificationId) => {
        markReadMutation.mutate(notificationId, {
            onError: (error) => {
                const message = error.response?.data?.message || 'Không thể đánh dấu đã đọc.';
                toast(message, 'error');
            },
        });
    };

    const handleReadAll = () => {
        markAllReadMutation.mutate(undefined, {
            onError: (error) => {
                const message = error.response?.data?.message || 'Không thể đánh dấu tất cả đã đọc.';
                toast(message, 'error');
            },
        });
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant='ghost' size='icon' className='relative rounded-full'>
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
                    {isLoading ? (
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
                                    className={`w-full text-left px-4 py-3 transition hover:bg-gray-50 cursor-pointer ${!item.read ? 'bg-primary/5' : ''}`}
                                    onClick={() => {
                                        if (!item.read) {
                                            handleRead(item.id);
                                        }
                                        setOpen(false);
                                    }}
                                >
                                    <p className='text-sm leading-5 line-clamp-2'>{item.content}</p>
                                    <p className='mt-1 text-xs text-muted-foreground'>{item.time}</p>
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
                        onClick={handleReadAll}
                    >
                        Đánh dấu tất cả đã đọc
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
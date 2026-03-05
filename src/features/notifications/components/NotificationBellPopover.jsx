import { useState } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import {
    useDeleteNotification,
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
    const deleteMutation = useDeleteNotification();

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

    const handleDelete = (notificationId) => {
        deleteMutation.mutate(notificationId, {
            onError: (error) => {
                const message = error.response?.data?.message || 'Không thể xoá thông báo.';
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
                        <span className='absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] leading-5 font-semibold text-center ring-2 ring-white'>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align='end' className='w-95 p-0 overflow-hidden rounded-2xl border shadow-lg'>
                <div className='px-4 py-3 border-b bg-linear-to-r from-white to-gray-50'>
                    <div className='flex items-center justify-between'>
                        <h3 className='text-sm font-semibold'>Thông báo</h3>
                        <span className='text-xs text-muted-foreground'>
                            {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Đã đọc hết'}
                        </span>
                    </div>
                    <p className='text-[11px] text-muted-foreground mt-1'>Cập nhật mới nhất cho tài khoản của bạn</p>
                </div>

                <div className='max-h-90 overflow-y-auto bg-white'>
                    {isLoading ? (
                        <div className='space-y-3 p-4'>
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className='flex gap-3 p-2 rounded-xl border border-gray-100'>
                                    <Skeleton className='h-9 w-9 rounded-lg shrink-0' />
                                    <div className='flex-1 space-y-2'>
                                        <Skeleton className='h-3.5 w-11/12' />
                                        <Skeleton className='h-3 w-1/2' />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : previewItems.length === 0 ? (
                        <div className='px-4 py-10 text-center'>
                            <Bell className='h-8 w-8 mx-auto text-gray-300 mb-2' />
                            <p className='text-sm text-muted-foreground'>Chưa có thông báo nào.</p>
                        </div>
                    ) : (
                        <div className='p-2 space-y-2'>
                            {previewItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`group rounded-xl border border-transparent transition ${!item.read ? 'bg-primary/5 border-primary/15' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    <div className='flex items-start gap-2 p-3'>
                                        <button
                                            type='button'
                                            className='flex-1 text-left cursor-pointer'
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
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-50'
                                            title='Xoá thông báo'
                                            disabled={deleteMutation.isPending}
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className='h-4 w-4' />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className='px-3 py-2 border-t bg-gray-50 flex items-center justify-between gap-2'>
                    <span className='text-[11px] text-muted-foreground'>Bấm vào item để đánh dấu đã đọc</span>
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
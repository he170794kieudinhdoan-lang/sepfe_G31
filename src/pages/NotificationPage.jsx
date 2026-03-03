import { Bell, Check, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { MSG } from '@/shared/constants/messages';
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

export const NotificationPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const userId = user?.userId || user?.id || user?._id;
  const NOTIFICATION_POLLING_MS = 15000;

  const { isRealtimeSubscribed } = useNotificationRealtime({ enabled: isAuthenticated, userId });

  const { data, isLoading, isError, refetch } = useNotifications({
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated && !isRealtimeSubscribed ? NOTIFICATION_POLLING_MS : false,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();

  const items = normalizeNotifications(data);
  const unreadCount = getUnreadCount(items);

  const markRead = (id) => {
    markReadMutation.mutate(id, {
      onError: (error) => {
        const message = error.response?.data?.message || 'Không thể đánh dấu đã đọc.';
        toast(message, 'error');
      },
    });
  };

  const markAllRead = () => {
    markAllReadMutation.mutate(undefined, {
      onError: (error) => {
        const message = error.response?.data?.message || 'Không thể đánh dấu tất cả đã đọc.';
        toast(message, 'error');
      },
    });
  };

  const remove = (id) => {
    deleteMutation.mutate(id, {
      onError: (error) => {
        const message = error.response?.data?.message || 'Không thể xoá thông báo.';
        toast(message, 'error');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-full py-6">
        <div className="container mx-auto px-4 max-w-2xl space-y-3">
          <h1 className="text-2xl font-bold mb-2">Thông báo</h1>
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="p-4 rounded-xl shadow-sm border-0">
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-gray-50 min-h-full py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">Thông báo</h1>
          <Card className="p-6 text-center rounded-xl shadow-sm border-0">
            <p className="text-sm text-muted-foreground mb-3">Không thể tải thông báo.</p>
            <Button onClick={() => refetch()}>Thử lại</Button>
          </Card>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-full py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Thông báo</h1>
          <EmptyState title={MSG.MSG_NOTIFICATION_EMPTY} description="Chưa có thông báo nào." />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full py-6">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Thông báo</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Đã đọc hết'}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={markAllRead}
              disabled={unreadCount === 0 || markAllReadMutation.isPending}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {items.map((n) => (
            <Card key={n.id} className={`p-4 rounded-xl shadow-sm border-0 ${!n.read ? 'bg-primary/5' : ''}`}>
              <div className="flex gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${!n.read ? 'bg-primary/20' : 'bg-gray-100'}`}>
                  <Bell className={`h-5 w-5 ${!n.read ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{n.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl"
                      onClick={() => markRead(n.id)}
                      title="Đánh dấu đã đọc"
                      disabled={markReadMutation.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl text-muted-foreground"
                    onClick={() => remove(n.id)}
                    title="Xóa"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

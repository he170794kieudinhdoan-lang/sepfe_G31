import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getFullNotificationText } from '@/features/notifications/utils/normalizeNotifications';
import {
  navigateToNotification,
  notificationHasNavigableTarget,
} from '@/features/notifications/utils/navigateToNotification';

export function NotificationDetailDialog({ item, open, onOpenChange }) {
  const navigate = useNavigate();

  const bodyText = (() => {
    if (!item) return '';
    const r = item.raw ?? {};
    const t = typeof r.title === 'string' ? r.title.trim() : '';
    const m = typeof r.message === 'string' ? r.message.trim() : '';
    if (t && m) return m;
    return getFullNotificationText(item);
  })();
  const canGo = item ? notificationHasNavigableTarget(item) : false;

  const handleGo = () => {
    if (!item) return;
    navigateToNotification(navigate, item);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col gap-0">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold text-slate-900">
            {item?.raw?.title?.trim() || item?.headline || 'Thông báo'}
          </DialogTitle>
          {item?.time ? (
            <p className="text-xs text-muted-foreground font-normal pt-0.5">
              {item.time}
            </p>
          ) : null}
        </DialogHeader>
        <div className="text-sm text-slate-700 whitespace-pre-wrap break-words overflow-y-auto max-h-[min(55vh,420px)] pr-1 leading-relaxed">
          {bodyText || '—'}
        </div>
        {canGo ? (
          <div className="flex justify-end gap-2 pt-4 border-t mt-2">
            <Button type="button" variant="default" size="sm" onClick={handleGo}>
              Đi tới trang liên quan
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

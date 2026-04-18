import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle2, Heart, Send } from 'lucide-react';
import { useAuth } from '@/shared/contexts/AuthContext';
import {
  useWishlist,
  useSaveJob,
  useUnsaveJob,
  isWishlistTogglePending,
} from '@/features/jobs/api/useWishlist';
import { isWorkerRole } from '@/shared/utils/userRole';

export const JobAction = ({
  job,
  fullWidth = false,
  onApply,
  hasApplied = false,
  className,
}) => {
  const { isAuthenticated, user } = useAuth();
  const isWorker = isWorkerRole(user);
  const { data } = useWishlist({}, { enabled: isWorker });
  const saveJobMutation = useSaveJob();
  const unsaveJobMutation = useUnsaveJob();

  const wishlist = data?.items || data || [];
  const isSaved =
    Array.isArray(wishlist) &&
    wishlist.some(
      (item) =>
        item.jobId === job?.id ||
        item.job?.id === job?.id ||
        String(item.jobId) === String(job?.id),
    );
  const saveBusy = isWishlistTogglePending(
    saveJobMutation,
    unsaveJobMutation,
    job?.id,
  );

  // Chỉ hiện nút Ứng tuyển khi: chưa đăng nhập (để nhắc login) HOẶC là WORKER
  const canSeeApplyButton = !isAuthenticated || isWorker;

  const handleSaveToggle = () => {
    if (!job?.id) return;
    if (isSaved) {
      unsaveJobMutation.mutate(job.id);
    } else {
      saveJobMutation.mutate(job.id);
    }
  };

  return (
    <div className={cn('flex gap-3 ', className)}>
      {canSeeApplyButton && (
        <Button
          variant={hasApplied ? 'outline' : 'default'}
          onClick={hasApplied ? undefined : onApply}
          aria-disabled={hasApplied}
          tabIndex={hasApplied ? -1 : undefined}
          className={cn(
            'rounded-xl px-8 h-12 shadow-md',
            !hasApplied && 'shadow-primary/20',
            hasApplied &&
              'border-amber-500/40 bg-amber-50 text-amber-950 font-semibold shadow-sm hover:bg-amber-50 pointer-events-none cursor-default opacity-100',
            fullWidth && 'flex-1',
          )}
        >
          {hasApplied ? (
            <CheckCircle2 className="h-4 w-4 mr-2 shrink-0 text-amber-600" aria-hidden />
          ) : (
            <Send className="h-4 w-4 mr-2 shrink-0" aria-hidden />
          )}
          {hasApplied ? 'Đã ứng tuyển' : 'Ứng tuyển ngay'}
        </Button>
      )}

      {isAuthenticated && isWorker && (
        <Button
          variant="outline"
          onClick={handleSaveToggle}
          disabled={saveBusy}
          className="rounded-xl h-12 px-6 border-slate-200 hover:bg-slate-50 transition-colors duration-150"
        >
          <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          {isSaved ? 'Đã lưu' : 'Lưu tin'}
        </Button>
      )}
    </div>
  );
};

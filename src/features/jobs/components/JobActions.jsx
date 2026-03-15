import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Heart, Send } from 'lucide-react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useWishlist, useSaveJob, useUnsaveJob } from '@/features/jobs/api/useWishlist';

export const JobAction = ({
  job,
  fullWidth = false,
  onApply,
  className,
}) => {
  const { isAuthenticated, user } = useAuth();
  const { data } = useWishlist({}, { enabled: !!user });
  const saveJobMutation = useSaveJob();
  const unsaveJobMutation = useUnsaveJob();

  const wishlist = data?.items || data || [];
  const isSaved = Array.isArray(wishlist) && wishlist.some((item) => item.jobId === job?.id);
  const isPending = saveJobMutation.isPending || unsaveJobMutation.isPending;

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
      <Button
        variant="default"
        onClick={onApply}
        className={cn(
          'rounded-xl px-8 h-12 shadow-md shadow-primary/20',
          fullWidth && 'flex-1',
        )}
      >
        <Send className="h-4 w-4 mr-2" />
        Ứng tuyển ngay
      </Button>

      {isAuthenticated && (
        <Button
          variant="outline"
          onClick={handleSaveToggle}
          disabled={isPending}
          className="rounded-xl h-12 px-6 border-slate-200 hover:bg-slate-50"
        >
          <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          {isSaved ? 'Đã lưu' : 'Lưu tin'}
        </Button>
      )}
    </div>
  );
};

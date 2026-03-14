import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Heart, Send } from 'lucide-react';

export const JobAction = ({
  job,
  fullWidth = false,
  onApply,
  onSave,
  className,
}) => {
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

      <Button
        variant="outline"
        onClick={onSave}
        className="rounded-xl h-12 px-6 border-slate-200 hover:bg-slate-50"
      >
        <Heart className="h-4 w-4 mr-2" />
        Lưu tin
      </Button>
    </div>
  );
};

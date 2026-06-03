import { Link } from 'react-router-dom';
import { useState, useRef, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Sparkles, Heart, Wallet } from 'lucide-react';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';

const getScoreColor = (percentage) => {
  if (percentage >= 80)
    return {
      text: 'text-emerald-600',
      bg: 'bg-emerald-500',
      track: 'bg-emerald-100',
    };
  if (percentage >= 50)
    return {
      text: 'text-amber-600',
      bg: 'bg-amber-500',
      track: 'bg-amber-100',
    };
  return { text: 'text-rose-600', bg: 'bg-rose-500', track: 'bg-rose-100' };
};

const TinyScoreItem = ({ label, score }) => {
  const numScore = parseFloat(score || 0);
  const percentage = Math.round(numScore * 100);
  const colors = getScoreColor(percentage);

  return (
    <div className="space-y-1.5 flex flex-col justify-end">
      <div className="flex justify-between items-baseline text-[10px] leading-none">
        <span className="font-semibold tracking-[0.03em] text-slate-500">
          {label}
        </span>
        <div className="flex items-baseline gap-px">
          <span className={`font-extrabold text-[12px] ${colors.text}`}>
            {percentage}
          </span>
          <span className={`text-[9px] ${colors.text} opacity-70 font-bold`}>
            %
          </span>
        </div>
      </div>
      <div
        className={`h-1.5 w-full rounded-full overflow-hidden ${colors.track}`}
      >
        <div
          className={`h-full ${colors.bg} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/shared/contexts/AuthContext';
import { SHIFTS } from '@/shared/constants/enums';
import {
  useWishlist,
  useSaveJob,
  useUnsaveJob,
  isWishlistTogglePending,
} from '@/features/jobs/api/useWishlist';
import { toast } from 'sonner';
import { formatSalary } from '@/shared/utils/salaryUtils';
import { isWorkerRole } from '@/shared/utils/userRole';
import { cn } from '@/lib/utils';

export const JobCard = memo(({
  job,
  featured,
  compact,
  aiSuggest,
  matchPercentage,
  matchScores,
  popoverHover,
}) => {
  const { user } = useAuth();
  const isWorker = isWorkerRole(user);
  const { data } = useWishlist({}, { enabled: isWorker });
  const saveJobMutation = useSaveJob();
  const unsaveJobMutation = useUnsaveJob();

  const [openAiMatch, setOpenAiMatch] = useState(false);
  const aiTimeoutRef = useRef(null);

  const handleAiEnter = () => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    aiTimeoutRef.current = setTimeout(() => {
      setOpenAiMatch(true);
    }, 300);
  };

  const handleAiLeave = () => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    aiTimeoutRef.current = setTimeout(() => {
      setOpenAiMatch(false);
    }, 200);
  };

  const wishlist = data?.items || data || [];
  const isSaved =
    Array.isArray(wishlist) &&
    wishlist.some(
      (item) =>
        item.jobId === job.id ||
        item.job?.id === job.id ||
        String(item.jobId) === String(job.id),
    );
  const wishlistBusy = isWishlistTogglePending(
    saveJobMutation,
    unsaveJobMutation,
    job.id,
  );

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isWorker) return;

    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu việc làm');
      return;
    }

    if (isSaved) {
      unsaveJobMutation.mutate(job.id);
    } else {
      saveJobMutation.mutate(job.id);
    }
  };

  if (!job) return null;
  const boostExpiredAt = job.boostExpiredAt ? new Date(job.boostExpiredAt) : null;
  const isBoosted =
    job.isBoosted ||
    (!!boostExpiredAt &&
      !Number.isNaN(boostExpiredAt.getTime()) &&
      boostExpiredAt > new Date());

  const chipCls = cn(
    'inline-flex max-w-full items-center gap-1.5 rounded-[8px] border border-slate-100/60 bg-slate-50/80 px-2 py-0.5 text-[11px] font-medium leading-tight text-slate-600 transition-colors group-hover:bg-white group-hover:border-slate-200/60',
    compact && 'px-1.5 py-[2px] text-[10px] gap-1'
  );

  return (
    <Card
      className={cn(
        'group relative z-0 flex flex-col justify-between transition-all duration-400 hover:z-20 h-full',
        compact ? 'p-3.5 rounded-[16px]' : 'p-5 rounded-[20px]',
        isBoosted
          ? 'border-amber-200/50 bg-gradient-to-b from-amber-50/30 to-white shadow-[0_4px_16px_-4px_rgba(251,191,36,0.15)] hover:shadow-[0_20px_40px_-8px_rgba(251,191,36,0.3)] hover:-translate-y-1.5'
          : 'border-slate-200/60 bg-white shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 hover:border-slate-300/60',
      )}
      onMouseEnter={popoverHover?.onMouseEnter}
      onMouseLeave={popoverHover?.onMouseLeave}
    >
      <div className={cn('flex items-start', compact ? 'gap-3.5' : 'gap-4')}>
        {/* Logo Section */}
        <div
          className={cn(
            'relative shrink-0 overflow-hidden bg-white rounded-[14px] flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]',
            isBoosted ? 'shadow-[0_2px_8px_rgba(251,191,36,0.15)] ring-1 ring-amber-100' : 'shadow-[0_2px_8px_rgba(0,0,0,0.02)] ring-1 ring-slate-100/80',
            compact ? 'h-[48px] w-[48px] p-1.5' : 'h-[60px] w-[60px] p-2',
          )}
        >
          <ImageWithFallback
            src={job.logoUrl || job.company?.logoUrl}
            alt={job.companyName || job.company?.name || 'Company'}
            className="h-full w-full object-contain"
            fallbackClassName={cn(
              'h-full w-full flex items-center justify-center text-slate-300 font-medium',
              compact ? 'text-[9px]' : 'text-[10px]',
            )}
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3
                className={cn(
                  'font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors relative z-20',
                  compact ? 'text-[14px] leading-tight mb-0.5' : 'text-[16px] leading-tight mb-1.5',
                )}
                title={job.title}
              >
                <Link to={`/job/${job.id}`}>{job.title}</Link>
              </h3>
              <p 
                className={cn(
                  'line-clamp-1 font-medium text-slate-500 group-hover:text-slate-600 transition-colors',
                  compact ? 'text-[11px]' : 'text-[13px]'
                )}
                title={job.companyName || job.company?.name}
              >
                {job.companyName || job.company?.name || 'Công ty ẩn'}
              </p>
            </div>

            <div className="flex flex-col items-end shrink-0 z-20 gap-1.5 pt-0.5">
              {isBoosted && (
                <Badge
                  className={cn(
                    'border border-yellow-300 bg-yellow-100 font-bold tracking-wide text-yellow-700 shadow-sm whitespace-nowrap',
                    compact ? 'px-1.5 py-[1px] text-[9px]' : 'px-2 py-0.5 text-[10px]',
                  )}
                >
                  <Sparkles className="w-2.5 h-2.5 mr-1 inline-block text-yellow-500" />
                  NỔI BẬT
                </Badge>
              )}
              {user && isWorker && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'rounded-full active:scale-90 transition-all duration-300 relative',
                    compact ? 'h-7 w-7' : 'h-8 w-8',
                    isSaved
                      ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                      : 'bg-transparent text-slate-300 hover:bg-rose-50 hover:text-rose-400',
                  )}
                  title={isSaved ? 'Đã lưu' : 'Lưu công việc này'}
                  onClick={handleWishlistToggle}
                  disabled={wishlistBusy}
                >
                  <Heart
                    className={cn(
                      'transition-all duration-300',
                      compact ? 'h-3.5 w-3.5' : 'h-4 w-4',
                      isSaved ? 'fill-current scale-110' : 'scale-100'
                    )}
                  />
                </Button>
              )}
            </div>
          </div>

          <div
            className={cn(
              'flex gap-2 items-end justify-between',
              compact ? 'mt-2.5' : 'mt-4',
              popoverHover && 'relative z-30'
            )}
          >
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              {/* Tags/Chips */}
              <div className="flex flex-wrap gap-1.5">
                <span className={chipCls}>
                  <Wallet className={cn("shrink-0 text-emerald-500", compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
                  <span className="truncate font-semibold text-slate-700">
                    {formatSalary(job.salaryMin, job.salaryMax, compact ? 'compact' : 'vndCompact')}
                  </span>
                </span>
                <span className={chipCls}>
                  <MapPin className={cn("shrink-0 text-slate-400", compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
                  <span className="truncate">
                    {job.province || job.address || job.location || 'Toàn quốc'}
                  </span>
                </span>
                {job.workingShift && (
                  <span className={chipCls}>
                    <Clock className={cn("shrink-0 text-primary/70", compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
                    <span className="whitespace-nowrap">
                      {SHIFTS.find((s) => s.value === job.workingShift)?.label || job.workingShift}
                    </span>
                  </span>
                )}
              </div>

              {/* Skills/Tags */}
              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {job.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="font-medium bg-yellow-100/90 text-yellow-700 border border-yellow-200/80 rounded-md px-1.5 py-[1px] text-[10px] max-w-[8rem] truncate group-hover:bg-yellow-200 transition-colors"
                      title={tag}
                    >
                      {tag}
                    </span>
                  ))}
                  {job.tags.length > 2 && (
                    <span className="font-medium text-slate-400 text-[10px] px-1 py-[1px]">
                      +{job.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>

            {(featured || matchPercentage) && (
              <div className="flex flex-col items-end shrink-0 gap-1.5">
                {featured && !isBoosted && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-semibold text-primary/80 border-primary/20 bg-primary/5 shadow-sm',
                      compact ? 'px-1.5 py-[1px] text-[9px]' : 'px-2 py-0.5 text-[10px]',
                    )}
                  >
                    Mới
                  </Badge>
                )}
                {matchPercentage && (
                  <Popover open={openAiMatch}>
                    <PopoverAnchor asChild>
                      <div 
                        className="relative z-20"
                        onMouseEnter={handleAiEnter}
                        onMouseLeave={handleAiLeave}
                      >
                        <Badge
                          variant="secondary"
                          className={cn(
                            'font-bold tracking-wide cursor-help shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200/50 bg-white text-primary hover:bg-slate-50',
                            compact ? 'px-2 py-[2px] text-[10px]' : 'px-2.5 py-0.5',
                          )}
                        >
                          <Sparkles className="w-2.5 h-2.5 mr-1 inline-block" />
                          {matchPercentage}%
                        </Badge>
                      </div>
                    </PopoverAnchor>

                    {matchScores && (
                      <PopoverContent
                        side="top"
                        align="end"
                        sideOffset={8}
                        collisionPadding={10}
                        onMouseEnter={handleAiEnter}
                        onMouseLeave={handleAiLeave}
                        className="w-[340px] z-[9999] bg-white/95 backdrop-blur-xl border border-primary/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] rounded-[20px] p-5"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-[12px] font-bold text-slate-800 uppercase tracking-[0.05em]">
                            Phân tích độ phù hợp
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                          <TinyScoreItem
                            label="Kỹ năng"
                            score={matchScores.skillScore}
                          />
                          <TinyScoreItem
                            label="Lương"
                            score={matchScores.salaryScore}
                          />
                          <TinyScoreItem
                            label="Địa điểm"
                            score={matchScores.locationScore}
                          />
                          <TinyScoreItem
                            label="Ca làm"
                            score={matchScores.shiftScore}
                          />
                          <TinyScoreItem
                            label="Phúc lợi"
                            score={matchScores.benefitScore}
                          />
                          <TinyScoreItem
                            label="Giới tính"
                            score={matchScores.genderScore}
                          />
                          <TinyScoreItem
                            label="Độ tuổi"
                            score={matchScores.ageScore}
                          />
                        </div>
                      </PopoverContent>
                    )}
                  </Popover>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Link
        to={`/job/${job.id}`}
        className="absolute inset-0 z-10"
        aria-label={`Xem chi tiết ${job.title}`}
      />
    </Card>
  );
});

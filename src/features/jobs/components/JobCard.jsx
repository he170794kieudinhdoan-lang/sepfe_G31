import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
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

const CHIP =
  'inline-flex max-w-full items-center gap-0.5 rounded-md border border-slate-200/90 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium leading-tight text-slate-700';

export const JobCard = ({
  job,
  featured,
  compact,
  aiSuggest,
  matchPercentage,
  matchScores,
  /** Chỉ mở popover preview khi hover chip/tag — tránh mở khi lướt qua toàn thẻ */
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
    CHIP,
    compact && 'rounded border px-1.5 py-px text-[11px] leading-snug',
  );

  return (
    <Card
      className={cn(
        'group relative z-0 border hover:shadow-xl transition-all hover:z-20',
        compact ? 'p-4 rounded-xl duration-200' : 'p-4 rounded-2xl duration-300',
        isBoosted
          ? 'border-yellow-300 bg-linear-to-br from-yellow-50/90 via-white to-yellow-50/70 shadow-md ring-1 ring-yellow-200/80'
          : 'border-slate-100 bg-white shadow-sm',
      )}
    >
      <div className={cn('flex', compact ? 'gap-3' : 'gap-4')}>
        {/* Logo Section */}
        <div
          className={cn(
            'relative shrink-0 overflow-hidden border border-slate-100 bg-white shadow-sm',
            compact
              ? 'h-14 w-14 rounded-lg p-1'
              : 'h-16 w-16 rounded-xl p-1',
          )}
        >
          <ImageWithFallback
            src={job.logoUrl || job.company?.logoUrl}
            alt={job.companyName || job.company?.name || 'Company'}
            className="h-full w-full object-contain"
            fallbackClassName={cn(
              'h-full w-full flex items-center justify-center text-slate-400 text-center p-1',
              compact ? 'text-[11px]' : 'text-[10px]',
            )}
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3
                className={cn(
                  'font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors relative z-20',
                  compact ? 'text-sm leading-snug' : 'text-sm',
                )}
              >
                <Link to={`/job/${job.id}`}>{job.title}</Link>
              </h3>
              <p className="mt-0.5 line-clamp-1 text-xs font-medium text-slate-500">
                {job.companyName || job.company?.name || 'Công ty ẩn'}
              </p>
            </div>

            <div
              className={cn(
                'flex flex-col items-end shrink-0 z-20',
                compact ? 'gap-0.5' : 'gap-1',
              )}
            >
              {isBoosted && (
                <Badge
                  className={cn(
                    'border border-[#FDE047]/90 bg-[#FEF08A] font-extrabold tracking-wide text-slate-900 shadow-sm',
                    'hover:bg-[#FDE68A]',
                    'gap-0.5 leading-none whitespace-nowrap',
                    compact
                      ? 'px-2.5 py-0.5 text-[11px]'
                      : 'px-2 py-0.5 text-[11px]',
                  )}
                >
                  NỔI BẬT
                </Badge>
              )}
              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'rounded-full shadow-sm hover:shadow active:scale-[0.98] transition-colors duration-150',
                    'h-8 w-8',
                    isSaved
                      ? isBoosted
                        ? 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200/80'
                        : 'bg-amber-50 hover:bg-amber-100 border-amber-100'
                      : 'bg-white hover:bg-gray-50',
                  )}
                  title={isSaved ? 'Đã lưu' : 'Lưu công việc này'}
                  onClick={handleWishlistToggle}
                  disabled={wishlistBusy}
                  aria-busy={wishlistBusy}
                >
                  <Heart
                    className={cn(
                      isSaved
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-gray-400 hover:text-yellow-500',
                      'h-4 w-4',
                    )}
                  />
                </Button>
              )}
            </div>
          </div>

          <div
            className={cn(
              'flex gap-2 items-end justify-between',
              compact ? 'mt-2' : 'mt-2.5',
            )}
          >
            <div
              className={cn(
                'min-w-0 flex-1 space-y-2',
                popoverHover && 'relative z-30',
              )}
              onMouseEnter={popoverHover?.onMouseEnter}
              onMouseLeave={popoverHover?.onMouseLeave}
            >
              <div
                className={cn(
                  'flex flex-wrap',
                  compact ? 'gap-1.5' : 'gap-1.5',
                )}
              >
                <span
                  className={chipCls}
                  title={formatSalary(job.salaryMin, job.salaryMax, 'vndCompact')}
                >
                  <Wallet
                    className="h-2.5 w-2.5 shrink-0 text-slate-500"
                  />
                  <span className="truncate">
                    {formatSalary(job.salaryMin, job.salaryMax, 'vndCompact')}
                  </span>
                </span>
                {job.workingShift && (
                  <span className={chipCls}>
                    <Clock className="h-2.5 w-2.5 shrink-0 text-primary" />
                    <span className="whitespace-nowrap">
                      {SHIFTS.find((s) => s.value === job.workingShift)?.label ||
                        job.workingShift}
                    </span>
                  </span>
                )}
                <span
                  className={cn(chipCls, 'max-w-[min(100%,11rem)]')}
                  title={
                    job.province || job.address || job.location || 'Toàn quốc'
                  }
                >
                  <MapPin className="h-2.5 w-2.5 shrink-0 text-primary" />
                  <span className="truncate">
                    {job.province || job.address || job.location || 'Toàn quốc'}
                  </span>
                </span>
              </div>

              <div
                className={cn('flex flex-wrap', compact ? 'gap-1.5' : 'gap-1.5')}
              >
                {job.tags &&
                  job.tags.length > 0 &&
                  job.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        'font-semibold bg-primary-muted text-primary rounded-md border border-primary/10 leading-tight max-w-[8rem] truncate',
                        compact
                          ? 'text-[10px] px-1.5 py-0.5'
                          : 'text-[10px] px-1.5 py-0.5',
                      )}
                      title={tag}
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>

            {(featured || matchPercentage) && (
              <div
                className={cn(
                  'flex flex-col items-end shrink-0',
                  compact ? 'gap-1.5' : 'gap-1.5',
                )}
              >
                {featured && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'font-extrabold tracking-wide',
                      compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5',
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
                            'font-extrabold tracking-wide cursor-help shadow-sm',
                            compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5',
                          )}
                        >
                          {matchPercentage}% phù hợp
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
                        className="w-[340px] z-[9999] bg-white border border-primary/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] rounded-[20px] p-5"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-[12px] font-extrabold text-primary uppercase tracking-[0.05em]">
                            Phân tích độ phù hợp
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
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
};

import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Sparkles, Heart } from 'lucide-react';

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
} from '@/features/jobs/api/useWishlist';
import { toast } from 'sonner';
import { formatSalary } from '@/shared/utils/salaryUtils';

export const JobCard = ({
  job,
  featured,
  aiSuggest,
  matchPercentage,
  matchScores,
  onMouseEnterTitle,
  onMouseLeaveTitle,
}) => {
  const { user } = useAuth();
  const { data } = useWishlist({}, { enabled: !!user });
  const saveJobMutation = useSaveJob();
  const unsaveJobMutation = useUnsaveJob();

  const wishlist = data?.items || data || [];
  const isSaved =
    Array.isArray(wishlist) && wishlist.some((item) => item.jobId === job.id);
  const isPending = saveJobMutation.isPending || unsaveJobMutation.isPending;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

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
    !!boostExpiredAt &&
    !Number.isNaN(boostExpiredAt.getTime()) &&
    boostExpiredAt > new Date();

  return (
    <Card
      className={`group relative z-0 p-4 hover:shadow-xl transition-all duration-300 rounded-2xl border hover:z-20 ${
        isBoosted
          ? 'border-amber-300 bg-linear-to-br from-amber-50/80 via-white to-rose-50/60 shadow-md ring-1 ring-amber-200/60'
          : 'border-slate-100 bg-white shadow-sm'
      }`}
    >
      <div className="flex gap-4">
        {/* Logo Section */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
          <ImageWithFallback
            src={job.logoUrl || job.company?.logoUrl}
            alt={job.companyName || job.company?.name || 'Company'}
            className="h-full w-full object-contain"
            fallbackClassName="h-full w-full flex items-center justify-center text-[10px] text-slate-400 text-center p-1"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3
                className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors relative z-20"
                onMouseEnter={onMouseEnterTitle}
                onMouseLeave={onMouseLeaveTitle}
              >
                <Link to={`/job/${job.id}`}>{job.title}</Link>
              </h3>
              <p className="text-xs font-medium text-slate-500 line-clamp-1 mt-0.5">
                {job.companyName || job.company?.name || 'Công ty ẩn'}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0 z-20">
              {isBoosted && (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 px-2 py-0.5 text-[10px] font-extrabold tracking-wide gap-1">
                  <Sparkles className="w-3 h-3" /> NỔI BẬT
                </Badge>
              )}
              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-full shadow-sm hover:shadow active:scale-95 transition-all ${isSaved ? 'bg-amber-50 hover:bg-amber-100 border-amber-100' : 'bg-white hover:bg-gray-50'}`}
                  title={isSaved ? 'Đã lưu' : 'Lưu công việc này'}
                  onClick={handleWishlistToggle}
                  disabled={isPending}
                >
                  <Heart
                    className={`h-4 w-4 ${isSaved ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                  />
                </Button>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px]">
            <Badge
              variant="secondary"
              className="rounded-md text-[11px] font-bold px-2 py-0.5 pointer-events-none"
            >
              {formatSalary(job.salaryMin, job.salaryMax, 'compact')}
            </Badge>

            {job.workingShift && (
              <Badge
                variant="outline"
                className="border-slate-200 text-slate-500 rounded-md text-[11px] font-semibold px-2 py-0.5 whitespace-nowrap gap-1"
              >
                <Clock className="w-3 h-3" />
                <span>
                  {SHIFTS.find((s) => s.value === job.workingShift)?.label ||
                    job.workingShift}
                </span>
              </Badge>
            )}

            <div className="flex items-center gap-1 text-slate-500 font-medium">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[120px]">
                {job.province || job.address || job.location || 'Toàn quốc'}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-end mt-2">
            <div className="flex flex-wrap gap-1.5">
              {job.tags &&
                job.tags.length > 0 &&
                job.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-bold bg-primary-muted text-primary px-2.5 py-0.5 rounded-lg border border-primary/10"
                  >
                    {tag}
                  </span>
                ))}
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
              {featured && (
                <Badge
                  variant="secondary"
                  className="px-2.5 font-extrabold tracking-wide"
                >
                  Mới
                </Badge>
              )}
              {matchPercentage && (
                <div className="relative group/ai z-20">
                  <Badge
                    variant="secondary"
                    className="px-2.5 font-extrabold tracking-wide cursor-help shadow-sm"
                  >
                    {matchPercentage}% phù hợp
                  </Badge>

                  {/* AI Match Hover Popup */}
                  {matchScores && (
                    <div className="absolute z-50 right-0 bottom-[calc(100%+8px)] w-[340px] opacity-0 invisible group-hover/ai:opacity-100 group-hover/ai:visible transition-all duration-300 bg-white border border-primary/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] rounded-[20px] p-5 translate-y-2 group-hover/ai:translate-y-0 after:content-[''] after:absolute after:-bottom-2 after:right-8 after:border-8 after:border-transparent after:border-t-white">
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
                    </div>
                  )}
                </div>
              )}
            </div>
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

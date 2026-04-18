import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Check,
  Heart,
  Loader2,
  Info,
  Clock,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { useMatchedJobs } from '@/features/jobs/api/useJobs';
import { JobCard } from '@/features/jobs/components/JobCard';
import { Container } from '@/shared/components/Container';
import { useAuth } from '@/shared/contexts/AuthContext';
import { SHIFTS } from '@/shared/constants/enums';
import {
  useWishlist,
  useSaveJob,
  useUnsaveJob,
  isWishlistTogglePending,
} from '@/features/jobs/api/useWishlist';
import { formatSalary } from '@/shared/utils/salaryUtils';
import { isWorkerRole } from '@/shared/utils/userRole';

const POPOVER_CHIP =
  'inline-flex max-w-full items-center gap-0.5 rounded-md border border-slate-200/90 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium leading-tight text-slate-700';

function MatchScoreItem({ label, score }) {
  const percentage = Math.round(score * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-medium">
        <span className="text-slate-500">{label}</span>
        <span className={percentage > 70 ? 'text-green-600' : 'text-amber-600'}>
          {percentage}%
        </span>
      </div>
      <Progress value={percentage} className="h-1" />
    </div>
  );
}

function SaveButton({ job }) {
  const { user } = useAuth();
  const isWorker = isWorkerRole(user);
  const { data } = useWishlist({}, { enabled: isWorker });
  const saveJobMutation = useSaveJob();
  const unsaveJobMutation = useUnsaveJob();

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

  if (!user || !isWorker) return null;

  const handleToggle = (e) => {
    e.preventDefault();
    if (isSaved) unsaveJobMutation.mutate(job.id);
    else saveJobMutation.mutate(job.id);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-xl px-4 border-slate-200 transition-colors duration-150"
      onClick={handleToggle}
      disabled={wishlistBusy}
    >
      <Heart
        className={`h-4 w-4 mr-2 ${isSaved ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`}
      />
      {isSaved ? 'Bỏ lưu' : 'Lưu tin'}
    </Button>
  );
}

export const MatchedJobs = () => {
  const { isAuthenticated, user } = useAuth();
  const isWorker = isWorkerRole(user);
  const { data: matchedData, isLoading } = useMatchedJobs(6, {
    enabled: isAuthenticated && isWorker,
  });
  const [openId, setOpenId] = useState(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = (id) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenId(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenId(null);
    }, 150);
  };

  const matcheItems = Array.isArray(matchedData) ? matchedData : [];

  if (!isAuthenticated || (!isLoading && matcheItems.length === 0)) {
    return null;
  }

  return (
    <section className="bg-slate-50/50 py-6 border-y border-slate-100">
      <Container>
        <div className="flex flex-col mb-4">
          <h2 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">
            Việc làm phù hợp với bạn
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            AI gợi ý dựa trên hồ sơ và kĩ năng của bạn
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  className="animate-pulse rounded-xl border-0 p-4 shadow-sm"
                >
                  <div className="flex gap-3">
                    <div className="h-14 w-14 shrink-0 rounded-lg bg-slate-200" />
                    <div className="mt-0.5 min-w-0 flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-slate-200" />
                      <div className="h-3 w-1/2 rounded bg-slate-200" />
                    </div>
                  </div>
                </Card>
              ))
            : matcheItems.map((item) => {
                const { job, company, scores, occupationName } = item;
                const matchPercentage = Math.round(scores.finalScore * 100);

                return (
                  <Popover key={job.id} open={openId === job.id}>
                    <PopoverAnchor asChild>
                      <div className="relative">
                        <JobCard
                          job={{ ...job, company, occupationName }}
                          compact
                          aiSuggest
                          matchPercentage={matchPercentage}
                          matchScores={scores}
                          popoverHover={{
                            onMouseEnter: () => handleMouseEnter(job.id),
                            onMouseLeave: handleMouseLeave,
                          }}
                        />
                      </div>
                    </PopoverAnchor>
                    <PopoverContent
                      className="w-[450px] p-0 overflow-hidden rounded-[24px] border border-slate-100 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.15)] bg-white z-100"
                      side="left"
                      sideOffset={0}
                      onMouseEnter={() => handleMouseEnter(job.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="flex flex-col max-h-[580px]">
                        {/* --- HEADER --- */}
                        <div className="p-6 bg-white shrink-0">
                          <div className="flex items-start gap-4">
                            <div className="h-[60px] w-[60px] shrink-0 overflow-hidden rounded-[14px] border border-slate-100/60 bg-white p-2 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.06)] flex items-center justify-center">
                              <ImageWithFallback
                                src={company?.logoUrl}
                                alt={company?.name}
                                className="h-full w-full object-contain"
                                fallbackClassName="text-[10px] text-slate-400 font-medium text-center"
                              />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <h4
                                className="text-[16px] font-extrabold text-slate-900 leading-[1.3] truncate hover:whitespace-normal hover:overflow-visible transition-colors"
                                title={job?.title}
                              >
                                {job?.title}
                              </h4>
                              <div className="text-[13px] font-semibold text-slate-500 mt-1.5 truncate">
                                {company?.name || 'Công ty ẩn'}
                              </div>
                              <div className="mt-3.5 flex flex-wrap gap-1.5">
                                <span
                                  className={POPOVER_CHIP}
                                  title={formatSalary(
                                    job.salaryMin,
                                    job.salaryMax,
                                    'vndCompact',
                                  )}
                                >
                                  <Wallet className="h-2.5 w-2.5 shrink-0 text-slate-500" />
                                  <span className="truncate">
                                    {formatSalary(
                                      job.salaryMin,
                                      job.salaryMax,
                                      'vndCompact',
                                    )}
                                  </span>
                                </span>
                                <span className={POPOVER_CHIP}>
                                  SL: {job?.quantity || 1}
                                </span>
                                {job.workingShift && (
                                  <span
                                    className={`${POPOVER_CHIP} items-center`}
                                  >
                                    <Clock className="h-2.5 w-2.5 shrink-0 text-primary" />
                                    <span className="whitespace-nowrap">
                                      {SHIFTS.find(
                                        (s) => s.value === job.workingShift,
                                      )?.label || job.workingShift}
                                    </span>
                                  </span>
                                )}
                                <span
                                  className={`${POPOVER_CHIP} max-w-[min(100%,14rem)]`}
                                  title={
                                    job.district
                                      ? `${job.district}, ${job.province || ''}`
                                      : job.province
                                  }
                                >
                                  <MapPin className="h-2.5 w-2.5 shrink-0 text-primary" />
                                  <span className="truncate">
                                    {job.district
                                      ? `${job.district}, `
                                      : ''}
                                    {job.province || '—'}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="font-medium text-sm">
                                  {occupationName}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="h-px bg-slate-100 w-full shrink-0" />

                        {/* --- SCROLLABLE BODY --- */}
                        {/* Use native div with custom-scrollbar to guarantee scroll visibility */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-6 space-y-7 overscroll-contain">
                          {/* Description Section */}
                          <section>
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5">
                              Mô tả chi tiết
                            </h5>
                            <div className="text-[13px] text-slate-600 space-y-2 whitespace-pre-wrap leading-[1.7] px-1">
                              {job.description ||
                                'Chưa có thông tin mô tả chi tiết.'}
                            </div>
                          </section>
                        </div>

                        <div className="h-px bg-slate-100 w-full shrink-0 shadow-[0_-4px_15px_rgba(0,0,0,0.02)]" />

                        {/* --- FOOTER ACTIONS --- */}
                        <div className="p-5 bg-white flex gap-3 shrink-0 items-center justify-end">
                          <Button
                            className="flex-1 h-11 rounded-[14px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_6px_16px_rgba(0,0,0,0.08)] transition-all active:scale-[0.98]"
                            asChild
                          >
                            <Link to={`/job/${job.id}`}>
                              Xem chi tiết việc làm
                            </Link>
                          </Button>

                          <SaveButton job={job} />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              })}
        </div>
      </Container>
    </section>
  );
};

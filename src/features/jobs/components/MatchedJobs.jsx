import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Clock, Wallet, Badge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
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
import { cn } from '@/lib/utils';

const POPOVER_CHIP =
  'inline-flex max-w-full items-center gap-0.5 rounded-md border border-slate-200/90 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium leading-tight text-slate-700';

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
  const { data: matchedData, isLoading } = useMatchedJobs({
    enabled: isAuthenticated && isWorker,
  });
  const [openId, setOpenId] = useState(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = (id) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpenId(id);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpenId(null);
    }, 200);
  };

  const [api, setApi] = useState(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    const updateState = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap());
    };

    updateState();

    api.on('select', updateState);
    api.on('reInit', updateState);

    return () => {
      api.off('select', updateState);
      api.off('reInit', updateState);
    };
  }, [api]);

  // Native autoplay for Embla
  useEffect(() => {
    if (!api) return;
    const autoplay = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);
    return () => clearInterval(autoplay);
  }, [api]);

  const matcheItems = Array.isArray(matchedData) ? matchedData : [];

  const chunkedItems = [];
  for (let i = 0; i < matcheItems.length; i += 6) {
    chunkedItems.push(matcheItems.slice(i, i + 6));
  }

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

        <Carousel
          setApi={setApi}
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full relative group/carousel"
        >
          <CarouselContent className="-ml-4 py-4">
            {isLoading
              ? Array.from({ length: 1 }).map((_, i) => (
                <CarouselItem key={i} className="pl-4 w-full">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <Card
                        key={j}
                        className="animate-pulse rounded-xl border-0 p-4 shadow-sm h-full"
                      >
                        <div className="flex gap-3">
                          <div className="h-14 w-14 shrink-0 rounded-lg bg-slate-200" />
                          <div className="mt-0.5 min-w-0 flex-1 space-y-2">
                            <div className="h-4 w-3/4 rounded bg-slate-200" />
                            <div className="h-3 w-1/2 rounded bg-slate-200" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CarouselItem>
              ))
              : chunkedItems.map((pageItems, pageIndex) => (
                <CarouselItem key={pageIndex} className="pl-4 w-full">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pageItems.map((item) => {
                      const { job, company, scores, occupationName } = item;
                      const matchPercentage = Math.round(
                        scores.finalScore * 100,
                      );

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
                                  onMouseEnter: () =>
                                    handleMouseEnter(job.id),
                                  onMouseLeave: handleMouseLeave,
                                }}
                              />
                            </div>
                          </PopoverAnchor>
                          <PopoverContent
                            className="w-[450px] p-0 overflow-hidden rounded-[24px] border border-slate-100 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.15)] bg-white z-[100]"
                            side="left"
                            sideOffset={0}
                            collisionPadding={20}
                            onMouseEnter={() => handleMouseEnter(job.id)}
                            onMouseLeave={handleMouseLeave}
                          >
                            <div className="flex flex-col max-h-[580px]">
                              {/* --- HEADER --- */}
                              <div
                                className={cn(
                                  'p-6 shrink-0 relative',
                                  job.isBoosted
                                    ? 'bg-linear-to-br from-yellow-50/50 to-white border-b border-yellow-100'
                                    : 'bg-white',
                                )}
                              >
                                {job.isBoosted && (
                                  <div className="absolute top-0 right-6 -translate-y-1/2">
                                    <Badge className="bg-yellow-400 text-yellow-950 border-yellow-200 font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm">
                                      NỔI BẬT ⚡
                                    </Badge>
                                  </div>
                                )}
                                <div className="flex items-start gap-4">
                                  <div
                                    className={cn(
                                      'h-[60px] w-[60px] shrink-0 overflow-hidden rounded-[14px] border bg-white p-2 flex items-center justify-center shadow-sm',
                                      job.isBoosted
                                        ? 'border-yellow-200'
                                        : 'border-slate-100/60',
                                    )}
                                  >
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
                                              (s) =>
                                                s.value === job.workingShift,
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
                </CarouselItem>
              ))}
          </CarouselContent>
          <div className="hidden sm:block opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300">
            <CarouselPrevious className="-left-8.5 top-38.5" />
            <CarouselNext className="-right-8.5 top-38.5" />
          </div>

          {/* Dots Navigation */}
          {count > 1 && (
            <div className="flex justify-center gap-1.5 mt-6">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${current === index
                      ? 'w-6 bg-primary shadow-sm'
                      : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                    }`}
                  onClick={() => api?.scrollTo(index)}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </Carousel>
      </Container>
    </section>
  );
};

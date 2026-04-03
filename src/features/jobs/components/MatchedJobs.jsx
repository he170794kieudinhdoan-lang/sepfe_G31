import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  Check,
  Heart,
  Loader2,
  Info,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
} from '@/features/jobs/api/useWishlist';
import { formatSalary } from '@/shared/utils/salaryUtils';

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
  const { data } = useWishlist({}, { enabled: !!user });
  const saveJobMutation = useSaveJob();
  const unsaveJobMutation = useUnsaveJob();

  const wishlist = data?.items || data || [];
  const isSaved =
    Array.isArray(wishlist) && wishlist.some((item) => item.jobId === job.id);
  const isPending = saveJobMutation.isPending || unsaveJobMutation.isPending;

  if (!user) return null;

  const handleToggle = (e) => {
    e.preventDefault();
    if (isSaved) unsaveJobMutation.mutate(job.id);
    else saveJobMutation.mutate(job.id);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-xl px-4 border-slate-200"
      onClick={handleToggle}
      disabled={isPending}
    >
      <Heart
        className={`h-4 w-4 mr-2 ${isSaved ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`}
      />
      {isSaved ? 'Bỏ lưu' : 'Lưu tin'}
    </Button>
  );
}

export const MatchedJobs = () => {
  const { isAuthenticated } = useAuth();
  const { data: matchedData, isLoading } = useMatchedJobs(6, {
    enabled: isAuthenticated,
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
    <section className="bg-slate-50/50 py-12 border-y border-slate-100 mt-10">
      <Container>
        <div className="flex flex-col  mb-8">
          <h2 className="text-2xl font-bold text-slate-900 leading-none">
            Việc làm phù hợp với bạn
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            AI gợi ý dựa trên hồ sơ và kĩ năng của bạn
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  className="p-4 rounded-2xl border-0 shadow-sm animate-pulse"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-xl" />
                    <div className="flex-1 space-y-2 mt-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
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
                          aiSuggest
                          matchPercentage={matchPercentage}
                          matchScores={scores}
                          onMouseEnterTitle={() => handleMouseEnter(job.id)}
                          onMouseLeaveTitle={handleMouseLeave}
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
                              <div className="flex flex-wrap items-center gap-2 mt-3.5">
                                <Badge
                                  variant="secondary"
                                  className="rounded-md text-[11px] font-black px-2.5 py-0.5"
                                >
                                  {formatSalary(job.salaryMin)} -{' '}
                                  {formatSalary(job.salaryMax)}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="border-slate-200 text-slate-500 rounded-md text-[11px] font-semibold px-2.5 py-0.5 bg-slate-50"
                                >
                                  SL: {job?.quantity || 1}
                                </Badge>
                                {job.workingShift && (
                                  <Badge
                                    variant="outline"
                                    className="border-slate-200 text-slate-500 rounded-md text-[11px] font-semibold px-2.5 py-0.5 bg-slate-50 gap-1 flex items-center"
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>
                                      {SHIFTS.find(
                                        (s) => s.value === job.workingShift,
                                      )?.label || job.workingShift}
                                    </span>
                                  </Badge>
                                )}
                                {/* Location Section */}
                                <div className="flex gap-1 items-center ">
                                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                  <p className="text-[13px] text-slate-700 font-medium leading-[1.6]">
                                    {job.district ? `${job.district}, ` : ''}
                                    {job.province}
                                  </p>
                                </div>
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

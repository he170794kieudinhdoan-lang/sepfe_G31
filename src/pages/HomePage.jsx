import { useMemo, useRef, useState, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  X,
  Check,
  TrendingUp,
  Zap,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Heart,
  Clock,
  Wallet,
  ArrowRight,
  Star,
  UserCircle,
  MessageSquare,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { JobCard } from '@/features/jobs/components/JobCard';
import { MatchedJobs } from '@/features/jobs/components/MatchedJobs';
import {
  useGetProvinces,
  useGetWards,
  useBoostedJobs,
  useNewestJobs,
  useGetSectorsWithOccupations,
} from '@/features/jobs/api/useJobs';
import {
  OccupationSectorPickerPanel,
  findSectorOccupationLabels,
} from '@/features/jobs/components/OccupationSectorPickerPanel';
import { useSearchCompanies } from '@/features/companies/api/useGetCompanies';
import {
  useWishlist,
  useSaveJob,
  useUnsaveJob,
  isWishlistTogglePending,
} from '@/features/jobs/api/useWishlist';
import Typewriter from 'typewriter-effect';
import { Container } from '@/shared/components/Container';
import { useAuth } from '@/shared/contexts/AuthContext';
import { SHIFTS } from '@/shared/constants/enums';
import { formatSalary } from '@/shared/utils/salaryUtils';
import { isWorkerRole } from '@/shared/utils/userRole';
import { cn } from '@/lib/utils';
import { SupportTicketForm } from '@/features/support/components/SupportTicketForm';
import useEmblaCarousel from 'embla-carousel-react';

const POPOVER_CHIP =
  'inline-flex max-w-full items-center gap-0.5 rounded-md border border-slate-200/90 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium leading-tight text-slate-700';

function TopEmployers() {
  const { data, isLoading } = useSearchCompanies({ limit: 12 });
  const companies = data?.items || [];

  if (!isLoading && companies.length === 0) return null;

  return (
    <div className="py-10 border-t border-slate-100 bg-slate-50/50 overflow-hidden relative">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes custom-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-custom-marquee {
          animation: custom-marquee 30s linear infinite;
          width: max-content;
        }
        .marquee-container:hover .animate-custom-marquee {
          animation-play-state: paused;
        }
      `,
        }}
      />
      <Container>
        <div className="text-center mb-8">
          <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">
            ĐỐI TÁC CỦA CHÚNG TÔI
          </h3>
          <h2 className="text-2xl font-black text-slate-900">
            Doanh Nghiệp Hàng Đầu
          </h2>
        </div>
      </Container>

      <div className="relative flex overflow-hidden marquee-container max-w-full">
        {/* Gradient overlays for smooth entry/exit effect */}
        <div className="absolute left-0 top-0 w-16 md:w-32 h-full bg-gradient-to-r from-slate-50/50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 w-16 md:w-32 h-full bg-gradient-to-l from-slate-50/50 to-transparent z-10 pointer-events-none" />

        <div className="flex animate-custom-marquee">
          {isLoading ? (
            <div className="flex gap-12 px-6 items-center">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-lg shrink-0"
                />
              ))}
            </div>
          ) : (
            <div className="flex gap-12 px-6 items-center">
              {[...companies, ...companies].map((c, idx) => (
                <Link
                  to={`/company/${c.id}`}
                  key={`${c.id}-${idx}`}
                  className="block shrink-0"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 relative grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 hover:scale-105">
                    <ImageWithFallback
                      src={c.logoUrl}
                      alt={c.name}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <Card className="rounded-xl border border-slate-100 bg-background p-4">
      <div className="flex gap-3">
        <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2.5">
          <div className="flex justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex gap-1.5 pt-0.5">
            <Skeleton className="h-[18px] w-16 rounded-md" />
            <Skeleton className="h-[18px] w-16 rounded-md" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function SaveJobButton({ job }) {
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
        item.jobId === job.id ||
        item.job?.id === job.id ||
        String(item.jobId) === String(job.id),
    );
  const wishlistBusy = isWishlistTogglePending(
    saveJobMutation,
    unsaveJobMutation,
    job.id,
  );

  if (!isAuthenticated || !isWorker) return null;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaved) {
      unsaveJobMutation.mutate(job.id);
    } else {
      saveJobMutation.mutate(job.id);
    }
  };

  return (
    <Button
      variant="outline"
      className="rounded-xl px-6 border-slate-200 hover:bg-slate-50 transition-colors duration-150"
      onClick={handleWishlistToggle}
      disabled={wishlistBusy}
    >
      <Heart
        className={`h-4 w-4 mr-2 ${isSaved ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`}
      />
      {isSaved ? 'Bỏ lưu' : 'Lưu tin'}
    </Button>
  );
}

const JobCardHoverPreview = memo(function JobCardHoverPreview({
  job,
  isOpen,
  previewKey,
  handleMouseEnter,
  handleMouseLeave,
}) {
  return (
    <Popover modal={false} open={isOpen}>
      <PopoverAnchor asChild>
        <div className="relative">
          <JobCard
            job={job}
            featured
            compact
            popoverHover={{
              onMouseEnter: () => handleMouseEnter(previewKey),
              onMouseLeave: handleMouseLeave,
            }}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        className={cn(
          'w-[450px] p-0 overflow-hidden rounded-[24px] border border-slate-100 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.15)] bg-white z-[1000]',
          /* Ghi đè animate mặc định của Popover (zoom ~95 + fade) — cảm giác mở chậm / không mượt */
          'data-[state=open]:duration-100 data-[state=closed]:duration-75',
          'data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100',
          'data-[side=left]:slide-in-from-right-0',
        )}
        side="right"
        align="start"
        sideOffset={10}
        collisionPadding={20}
        onMouseEnter={() => handleMouseEnter(previewKey)}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col max-h-[580px]">
          <div className="p-6 bg-white shrink-0">
            <div className="flex items-start gap-4">
              <div className="h-[60px] w-[60px] shrink-0 overflow-hidden rounded-[14px] border border-slate-100/60 bg-white p-2 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.06)] flex items-center justify-center">
                <ImageWithFallback
                  src={job.company?.logoUrl}
                  alt={job.company?.name || 'Logo'}
                  className="h-full w-full object-contain"
                  fallbackClassName="text-[10px] text-slate-400 font-medium text-center"
                />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <h4
                  className="text-[16px] font-extrabold text-slate-900 leading-[1.3] truncate hover:whitespace-normal hover:overflow-visible transition-colors"
                  title={job.title}
                >
                  {job.title}
                </h4>
                <div className="text-[13px] font-semibold text-slate-500 mt-1.5 truncate">
                  {job.company?.name || job.companyName || 'Công ty ẩn'}
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
                      {formatSalary(job.salaryMin, job.salaryMax, 'vndCompact')}
                    </span>
                  </span>
                  <span className={POPOVER_CHIP}>SL: {job.quantity || 1}</span>
                  {job.workingShift && (
                    <span className={`${POPOVER_CHIP} items-center`}>
                      <Clock className="h-2.5 w-2.5 shrink-0 text-primary" />
                      <span className="whitespace-nowrap">
                        {SHIFTS.find((s) => s.value === job.workingShift)
                          ?.label || job.workingShift}
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
                      {job.district ? `${job.district}, ` : ''}
                      {job.province || '—'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-medium text-sm">
                    {job?.occupation?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full shrink-0" />

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-6 space-y-7 overscroll-contain">
            <section>
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5">
                Mô tả chi tiết
              </h5>
              <div className="text-[13px] text-slate-600 space-y-2 whitespace-pre-wrap leading-[1.7] px-1">
                {job.description || 'Chưa có thông tin mô tả chi tiết.'}
              </div>
            </section>
          </div>

          <div className="h-px bg-slate-100 w-full shrink-0 shadow-[0_-4px_15px_rgba(0,0,0,0.02)]" />

          <div className="p-5 bg-white flex gap-3 shrink-0 items-center justify-end">
            <Button
              className="flex-1 h-11 rounded-[14px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_6px_16px_rgba(0,0,0,0.08)] transition-all active:scale-[0.98]"
              asChild
            >
              <Link to={`/job/${job.id}`}>Xem chi tiết việc làm</Link>
            </Button>

            <SaveJobButton job={job} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

function SearchBarPopover({
  keyword,
  setKeyword,
  open,
  setOpen,
  searchMode,
  setSearchMode,
  jobs,
  province,
  setProvince,
  wards,
  setWards,
  setWardsName,
  wardsName,
  sectorId,
  setSectorId,
  occupationId,
  setOccupationId,
  sectorName,
  occupationName,
}) {
  function normalizeLocationName(name) {
    if (!name) return '';
    return name
      .replace(
        /^(Tỉnh|Thành phố|TP\.?|Tp\.?|tp\.?|Quận|Huyện|Thị xã|Phường|Xã|Thị trấn)\s*/i,
        '',
      )
      .trim();
  }
  const { data: provincess } = useGetProvinces();
  const { data: wardss } = useGetWards(wards);
  const { data: sectors = [] } = useGetSectorsWithOccupations();
  const nav = useNavigate();
  const handleSearch = (overrideKeyword) => {
    const finalKeyword =
      typeof overrideKeyword === 'string' ? overrideKeyword : keyword;
    const trimmedKeyword = finalKeyword.trim();
    if (
      trimmedKeyword === '' &&
      !province &&
      !wardsName &&
      !sectorId &&
      !occupationId
    ) {
      return;
    }

    const params = new URLSearchParams();
    if (trimmedKeyword) params.append('query', trimmedKeyword);
    if (province) params.append('province', normalizeLocationName(province));
    if (wardsName) params.append('district', normalizeLocationName(wardsName));
    if (sectorId) params.append('sectorId', sectorId);
    if (occupationId) params.append('occupationId', occupationId);

    nav(`/search?${params.toString()}`);
  };
  return (
    <div className="flex-1 w-full max-w-5xl flex items-center gap-2.5 rounded-[1.5rem] bg-white/90 backdrop-blur-xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] px-3 py-2 relative mx-auto border border-white ring-4 ring-primary/10 group hover:ring-primary/20 hover:bg-white transition-all duration-500">
      <Search className="h-5 w-5 text-slate-400 shrink-0 ml-1.5" />

      <div className="flex items-center gap-1.5">
        {province && (
          <Badge
            variant="secondary"
            className="h-7 pl-2 pr-1 rounded-lg bg-white/40 text-slate-700 font-medium hover:bg-white/60 border-0 flex items-center gap-1"
          >
            {normalizeLocationName(province)}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setProvince('');
                setWards('');
                setWardsName('');
              }}
              className="p-0.5 hover:bg-slate-200 rounded-md transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {wardsName && (
          <Badge
            variant="secondary"
            className="h-7 pl-2 pr-1 rounded-lg bg-white/40 text-slate-700 font-medium hover:bg-white/60 border-0 flex items-center gap-1"
          >
            {normalizeLocationName(wardsName)}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setWardsName('');
              }}
              className="p-0.5 hover:bg-slate-200 rounded-md transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {occupationName && (
          <Badge
            variant="secondary"
            className="h-7 pl-2 pr-1 rounded-lg bg-white/40 text-slate-700 font-medium hover:bg-white/60 border-0 flex items-center gap-1 max-w-[10rem]"
          >
            <span className="truncate">{occupationName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOccupationId('');
                setSectorId('');
              }}
              className="p-0.5 hover:bg-slate-200 rounded-md transition-colors shrink-0"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {!occupationName && sectorName && (
          <Badge
            variant="secondary"
            className="h-7 pl-2 pr-1 rounded-lg bg-white/40 text-slate-700 font-medium hover:bg-white/60 border-0 flex items-center gap-1 max-w-[10rem]"
          >
            <span className="truncate">{sectorName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSectorId('');
                setOccupationId('');
              }}
              className="p-0.5 hover:bg-slate-200 rounded-md transition-colors shrink-0"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>

      <div className="flex-1 min-w-0 ">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          placeholder="Tìm tin tuyển dụng, công ty, khu vực..."
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-base flex-1 min-w-0 font-medium placeholder:text-slate-400"
        />
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            title="Chọn ngành nghề / nghề nghiệp"
            size="lg"
            className="rounded-xl shrink-0 border h-12 w-12 p-0 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <Briefcase className="h-6 w-6 text-primary" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[520px] p-0 overflow-hidden rounded-2xl border-slate-200 shadow-2xl">
          <OccupationSectorPickerPanel
            sectors={sectors}
            sectorId={sectorId}
            onSectorChange={(id) => {
              if (String(sectorId) === String(id)) {
                setSectorId('');
                setOccupationId('');
              } else {
                setSectorId(String(id));
                setOccupationId('');
              }
            }}
            occupationId={occupationId}
            onOccupationChange={(id) => {
              setOccupationId(
                String(occupationId) === String(id) ? '' : String(id),
              );
            }}
          />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            title="Chọn địa điểm"
            size="lg"
            className="rounded-xl shrink-0 border h-12 w-12 p-0 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <MapPin className="h-6 w-6 text-primary" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[520px] p-0 overflow-hidden rounded-2xl border-slate-200 shadow-2xl">
          <div className="flex h-[400px]">
            {/* Tỉnh / Thành phố */}
            <div className="w-[55%] border-r border-slate-100 flex flex-col bg-white">
              <div className="px-4 py-3 border-b border-slate-50">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Tỉnh / Thành phố
                </h4>
              </div>
              <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
                <div className="space-y-0.5">
                  {provincess?.provinces?.map((k) => (
                    <button
                      key={k.code}
                      className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-all flex items-center justify-between group
                          ${province === k.name ? 'bg-primary-muted text-primary font-semibold' : 'hover:bg-slate-50 text-slate-600'}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setWards(k.code);
                        setProvince(k.name);
                      }}
                    >
                      <span className="truncate">{k.name}</span>
                      {province === k.name && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Phường / Xã */}
            <div className="w-[45%] flex flex-col bg-slate-50/30">
              <div className="px-4 py-3 border-b border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Phường / Xã
                </h4>
              </div>
              <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
                {province ? (
                  <div className="space-y-0.5">
                    {wardss?.communes?.map((k) => (
                      <button
                        key={k.code}
                        className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-all flex items-center justify-between
                            ${wardsName === k.name ? 'bg-primary-muted text-primary font-semibold' : 'hover:bg-slate-50 text-slate-600'}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setWardsName(k.name)}
                      >
                        <span className="truncate">{k.name}</span>
                        {wardsName === k.name && (
                          <Check className="h-3.5 w-3.5" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <MapPin className="h-5 w-5 text-slate-300" />
                    </div>
                    <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                      Chọn Tỉnh/Thành phố
                      <br />
                      để xem khu vực chi tiết
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        size="lg"
        className="rounded-[1rem] shrink-0 border h-12 px-6 text-sm font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => {
          setOpen(false);
          handleSearch();
        }}
      >
        Tìm tin
      </Button>
    </div>
  );
}

export function HomePage() {
  const [limit] = useState(6);
  const [openSuggest, setOpenSuggest] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [wards, setWards] = useState('');
  const [province, setProvince] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [occupationId, setOccupationId] = useState('');
  const [searchMode, setSearchMode] = useState('both');
  const [wardsName, setWardsName] = useState('');
  const { data: sectorsForSearch = [] } = useGetSectorsWithOccupations();
  const { sectorName, occupationName } = useMemo(
    () =>
      findSectorOccupationLabels(sectorsForSearch, {
        sectorId,
        occupationId,
      }),
    [sectorsForSearch, sectorId, occupationId],
  );
  const [activePreviewKey, setActivePreviewKey] = useState(null);
  const [isBoostedHovered, setIsBoostedHovered] = useState(false);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const timeoutRef = useRef(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

  // Autoplay for Embla
  useEffect(() => {
    if (!emblaApi || isHeroHovered) return;
    const autoplay = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 3000);
    return () => clearInterval(autoplay);
  }, [emblaApi, isHeroHovered]);

  const [boostedEmblaRef, boostedEmblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
  });

  // Autoplay for Boosted Embla
  useEffect(() => {
    if (!boostedEmblaApi || isBoostedHovered) return;
    const autoplay = setInterval(() => {
      if (boostedEmblaApi.canScrollNext()) {
        boostedEmblaApi.scrollNext();
      } else {
        boostedEmblaApi.scrollTo(0);
      }
    }, 3000);
    return () => clearInterval(autoplay);
  }, [boostedEmblaApi, isBoostedHovered]);

  const handlePreviewMouseEnter = useCallback((key) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActivePreviewKey(key);
    }, 300);
  }, []);

  const handlePreviewMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActivePreviewKey(null);
    }, 200);
  }, []);

  const { data: newestJobs, isLoading } = useNewestJobs({
    limit: 12,
    page: 1,
  });
  const { data: boostedJobs, isLoading: isBoostedLoading } = useBoostedJobs({
    page: 1,
    limit: 12,
  });
  const displayedBoostedJobs = useMemo(() => {
    return Array.isArray(boostedJobs?.items) ? boostedJobs.items : [];
  }, [boostedJobs?.items]);

  const columnBoostedJobs = useMemo(() => {
    const featured = [...displayedBoostedJobs];
    const newest = Array.isArray(newestJobs?.items) ? newestJobs.items : [];
    const existingIds = new Set(featured.map((job) => job.id));

    for (const job of newest) {
      if (featured.length >= 12) break;
      if (!existingIds.has(job.id)) {
        featured.push(job);
        existingIds.add(job.id);
      }
    }

    const columns = [];
    for (let i = 0; i < featured.length; i += 2) {
      columns.push(featured.slice(i, i + 2));
    }
    return columns;
  }, [displayedBoostedJobs, newestJobs?.items]);

  return (
    <div className="bg-background min-h-full font-sans">
      {/* 1. CREATIVE HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-slate-50 pt-32 pb-48 md:pt-40 md:pb-56">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 z-0">
          <img
            src="/banner_0.png"
            alt="hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/40" />
        </div>

        {/* Decorative Amber Blobs */}
        <div className="absolute top-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[60%] bg-amber-500/20 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[50%] bg-amber-400/20 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-[0.2em]">
                Worklink - Nền tảng tuyển dụng hàng đầu
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-white leading-[1.25] tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 drop-shadow-sm">
              Tìm tin{' '}
              <span className="text-amber-400 relative inline-block">
                dễ dàng
                <svg
                  className="absolute -bottom-1 left-0 w-full h-2 text-amber-400/40"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,10 Q50,20 100,10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                  />
                </svg>
              </span>
              , <br className="hidden md:block" />
              thông tin{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                rõ ràng
              </span>
              , <br className="hidden md:block" />
              cơ hội tốt hơn cùng <br />
              <span className="text-amber-400 inline-block mt-4 text-5xl md:text-6xl lg:text-[72px]">
                <Typewriter
                  onInit={(typewriter) => {
                    typewriter
                      .typeString('Worklink')
                      .pauseFor(3000)
                      .deleteAll()
                      .start();
                  }}
                  options={{ loop: true, autoStart: true }}
                />
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
              Hơn 10.000+ cơ hội việc làm đang chờ đón bạn. Khám phá ngay các vị
              trí tốt nhất từ những nhà tuyển dụng uy tín hàng đầu.
            </p>

            {/* Search Box */}
            <div className="w-full max-w-4xl mx-auto pt-8 animate-in fade-in zoom-in-95 duration-1000 delay-300">
              <SearchBarPopover
                keyword={keyword}
                setKeyword={setKeyword}
                open={openSuggest}
                setOpen={setOpenSuggest}
                searchMode={searchMode}
                setSearchMode={setSearchMode}
                jobs={newestJobs?.items}
                province={province}
                setProvince={setProvince}
                setWards={setWards}
                wards={wards}
                wardsName={wardsName}
                setWardsName={setWardsName}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* 3. BOOSTED JOBS SECTION */}
      {(isBoostedLoading || displayedBoostedJobs.length > 0) && (
        <section className="relative py-12 bg-amber-50/40 border-y border-amber-200/50 overflow-hidden homepage-job-sections">
          {/* Decorative Background Orbs & Pattern */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-300/20 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-400/20 blur-[120px] rounded-full pointer-events-none -translate-x-1/3 translate-y-1/3" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9Im5vbmUiPjwvcmVjdD48Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMSIgZmlsbD0iI2FtYmVyIiBvcGFjaXR5PSIwLjA1Ij48L2NpcmNsZT48L3N2Zz4=')] opacity-50 mix-blend-multiply pointer-events-none" />

          <Container className="max-w-7xl relative z-10">
            <div className="flex flex-col items-center text-center mb-8 relative">
              {/* Optional glow behind title */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/60 blur-[40px] -z-10 rounded-full" />

              <div className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-gradient-to-r from-amber-200 to-yellow-300 mb-6 border border-amber-300/80 shadow-md transform -rotate-1 hover:rotate-0 transition-transform cursor-default">
                <Star className="h-4 w-4 text-amber-800 fill-amber-700 mr-2 animate-bounce-slow" />
                <span className="text-amber-950 font-black tracking-widest uppercase text-xs drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                  Tin tiêu điểm
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900">
                Tin tuyển dụng{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-yellow-500 filter drop-shadow-sm">
                  nổi bật
                </span>
              </h2>
              <p className="text-slate-700 mt-5 font-semibold max-w-2xl text-lg leading-relaxed">
                Các vị trí được tuyển chọn từ những đối tác uy tín trên hệ
                thống.
              </p>
            </div>

            <div
              className="relative px-1"
              onMouseEnter={() => setIsBoostedHovered(true)}
              onMouseLeave={() => setIsBoostedHovered(false)}
            >
              <div
                className="overflow-hidden cursor-grab active:cursor-grabbing p-4 -m-4"
                ref={boostedEmblaRef}
              >
                <div className="flex -ml-4 items-stretch will-change-transform transform-gpu">
                  {isBoostedLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={`skel-slide-${i}`}
                          className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333333%] min-w-0 pl-4 py-2"
                        >
                          <div className="flex flex-col gap-6">
                            <JobCardSkeleton />
                            <JobCardSkeleton />
                          </div>
                        </div>
                      ))
                    : columnBoostedJobs.map((col, colIdx) => (
                        <div
                          key={`boosted-col-${colIdx}`}
                          className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333333%] min-w-0 pl-4 py-2"
                        >
                          <div className="flex flex-col gap-6 h-full">
                            {col.map((job) => (
                              <div
                                key={`boosted-${job.id}`}
                                className="flex-1"
                              >
                                <JobCardHoverPreview
                                  job={job}
                                  isOpen={
                                    activePreviewKey === `boosted-${job.id}`
                                  }
                                  previewKey={`boosted-${job.id}`}
                                  handleMouseEnter={handlePreviewMouseEnter}
                                  handleMouseLeave={handlePreviewMouseLeave}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                </div>
              </div>

              {/* Navigation buttons for Boosted Embla */}
              {columnBoostedJobs.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute -left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white shadow-md border-slate-200 hidden md:flex text-slate-600 hover:text-primary z-10 transition-transform active:scale-95"
                    onClick={() => boostedEmblaApi?.scrollPrev()}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute -right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white shadow-md border-slate-200 hidden md:flex text-slate-600 hover:text-primary z-10 transition-transform active:scale-95"
                    onClick={() => boostedEmblaApi?.scrollNext()}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* 4. MATCHED JOBS & NEWEST JOBS */}
      <div className="homepage-job-sections">
        <MatchedJobs />
      </div>

      <section
        id="jobs"
        className="py-12 bg-white relative overflow-hidden homepage-job-sections"
      >
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
        <Container className="max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                Tin mới đăng
              </h2>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: limit }).map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))
              : newestJobs?.items?.slice(0, 6).map((job) => (
                  <div
                    key={`newest-${job.id}`}
                  >
                    <JobCardHoverPreview
                      job={job}
                      isOpen={activePreviewKey === `newest-${job.id}`}
                      previewKey={`newest-${job.id}`}
                      handleMouseEnter={handlePreviewMouseEnter}
                      handleMouseLeave={handlePreviewMouseLeave}
                    />
                  </div>
                ))}
          </div>

          <div className="mt-14 text-center">
            <Button
              size="lg"
              className="rounded-full px-10 h-14 bg-amber-200 hover:bg-amber-300 text-amber-950 font-black transition-all shadow-xl shadow-amber-200/30 hover:shadow-amber-300/50 hover:-translate-y-1 group border border-amber-300"
              asChild
            >
              <Link to="/search" className="flex items-center gap-2">
                Xem toàn bộ tin đăng{' '}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* 5. TOP EMPLOYERS */}
      <TopEmployers />

      {/* 7. SUPPORT TICKET SECTION */}
      <section className="bg-amber-50 py-20 relative overflow-hidden text-slate-900 border-t border-amber-100">
        {/* Abstract shapes for light section */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-300/30 rounded-full blur-[120px] opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-400/20 rounded-full blur-[100px] opacity-60 pointer-events-none" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSI+PC9yZWN0Pgo8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0iI2FtYmVyIiBvcGFjaXR5PSIwLjEiPjwvY2lyY2xlPgo8L3N2Zz4=')] opacity-60 mix-blend-multiply" />

        <Container className="max-w-7xl relative z-10">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <Badge className="bg-amber-200 text-amber-900 border-amber-300 px-4 py-1.5 uppercase tracking-widest text-xs font-bold rounded-full shadow-sm">
                Hỗ trợ vận hành 24/7
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-slate-900">
                Gặp vướng mắc? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">
                  Liên hệ ngay
                </span>
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-slate-600">
                Nếu bạn gặp lỗi đăng nhập, vấn đề hồ sơ, ứng tuyển hoặc cần
                manager hỗ trợ xử lý, hãy gửi câu hỏi ở đây. Ticket sẽ được
                chuyển vào hàng chờ của bộ phận hỗ trợ.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
                <div className="bg-white/60 border border-amber-200/60 rounded-[1.5rem] p-6 backdrop-blur-md hover:bg-white/90 transition-colors shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4 border border-amber-200/50">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2 text-lg">
                    Xử lý ngay
                  </h4>
                  <p className="text-sm text-slate-600 font-medium">
                    Xử lý việc gấp trong 2 giờ làm việc.
                  </p>
                </div>
                <div className="bg-white/60 border border-amber-200/60 rounded-[1.5rem] p-6 backdrop-blur-md hover:bg-white/90 transition-colors shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4 border border-amber-200/50">
                    <Heart className="w-6 h-6 text-amber-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2 text-lg">
                    Chăm sóc riêng
                  </h4>
                  <p className="text-sm text-slate-600 font-medium">
                    Tư vấn nghiệp vụ riêng cho nhà tuyển dụng.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-200/40 p-2 rounded-[2.5rem] backdrop-blur-xl border border-amber-300/60 shadow-2xl">
              <div className="bg-white rounded-[2rem] p-6 md:p-8 text-slate-900 shadow-inner">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-slate-900">
                    Mở yêu cầu mới
                  </h3>
                  <p className="text-sm text-slate-500 font-semibold mt-1">
                    Mô tả nội dung cần xử lý.
                  </p>
                </div>
                <SupportTicketForm />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

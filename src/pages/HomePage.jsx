import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, X, Check } from 'lucide-react';
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
  useSearchJobs,
  useBoostedJobs,
} from '@/features/jobs/api/useJobs';
import {
  useWishlist,
  useSaveJob,
  useUnsaveJob,
  isWishlistTogglePending,
} from '@/features/jobs/api/useWishlist';
import Typewriter from 'typewriter-effect';
import { Container } from '@/shared/components/Container';
import { Heart, Clock, Wallet } from 'lucide-react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { SHIFTS } from '@/shared/constants/enums';
import { formatSalary } from '@/shared/utils/salaryUtils';
import { isWorkerRole } from '@/shared/utils/userRole';
import { cn } from '@/lib/utils';
import { SupportTicketForm } from '@/features/support/components/SupportTicketForm';

const POPOVER_CHIP =
  'inline-flex max-w-full items-center gap-0.5 rounded-md border border-slate-200/90 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium leading-tight text-slate-700';
const POPULAR_KEYWORDS = [
  'công nhân sản xuất',
  'công nhân may mặc',
  'công nhân lắp ráp điện tử',
  'lao động phổ thông',
  'nhân viên kho',
  'phụ kho - bốc xếp',
];

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

function JobCardHoverPreview({
  job,
  activePreviewKey,
  previewKey,
  handleMouseEnter,
  handleMouseLeave,
}) {
  return (
    <Popover modal={false} open={activePreviewKey === previewKey}>
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
}

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
  const nav = useNavigate();
  const handleSearch = (overrideKeyword) => {
    const finalKeyword =
      typeof overrideKeyword === 'string' ? overrideKeyword : keyword;
    const trimmedKeyword = finalKeyword.trim();
    if (trimmedKeyword === '' && !province && !wardsName) {
      return;
    }

    const params = new URLSearchParams();
    if (trimmedKeyword) params.append('query', trimmedKeyword);
    if (province) params.append('province', normalizeLocationName(province));
    if (wardsName) params.append('district', normalizeLocationName(wardsName));

    nav(`/search?${params.toString()}`);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex-1 max-w-5xl flex items-center gap-3 rounded-2xl bg-white shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] px-4 py-2 relative mx-auto border border-slate-100 ring-4 ring-primary/5 group hover:border-primary-hover/20 transition-all duration-300">
        <Search className="h-4 w-4 text-slate-400 shrink-0" />

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
        </div>

        <PopoverTrigger asChild>
          <div className="flex-1 min-w-0 ">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              // onFocus={() => setOpen(true)}
              // onClick={() => setOpen(true)}
              placeholder="Tìm theo tên việc/công ty/khu vực"
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-12 flex-1 min-w-0"
            />
          </div>
        </PopoverTrigger>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              title="Chọn địa điểm"
              size="sm"
              className="rounded-lg shrink-0 border"
            >
              <MapPin className="text-primary" />
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
                        {province === k.name && (
                          <Check className="h-3.5 w-3.5" />
                        )}
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
          size="sm"
          className="rounded-lg shrink-0 border"
          onClick={() => {
            setOpen(false);
            handleSearch();
          }}
        >
          <Search
            className="text-white h-4 w-4"
            title="tìm kiếm theo từ khoá"
          />
        </Button>
      </div>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={10}
        className="w-[980px] max-h-[650px] p-0 rounded-2xl shadow-xl border bg-white"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="px-5 py-4">
          <div className="flex items-center gap-4">
            {/* <div className="text-sm font-semibold">Tìm kiếm theo:</div> */}

            <RadioGroup
              value={searchMode}
              onValueChange={setSearchMode}
              className="flex gap-6"
            >
              {/* <div className="flex items-center gap-2">
                <RadioGroupItem value="job" id="sm-job" />
                <Label htmlFor="sm-job">Tên việc làm</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="company" id="sm-company" />
                <Label htmlFor="sm-company">Tên công ty</Label>
              </div> */}
              {/* 
              <div className="flex items-center gap-2">
                <RadioGroupItem value="both" id="sm-both" />
                <Label htmlFor="sm-both">Cả hai</Label>
              </div> */}
            </RadioGroup>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-[1fr_auto_1fr]">
          {/* LEFT */}
          <div className="p-5">
            <div className="font-semibold mb-3">Từ khóa phổ biến</div>

            <ScrollArea className="h-auto pr-3">
              <div className="space-y-1">
                {POPULAR_KEYWORDS.map((k) => (
                  <button
                    key={k}
                    className="w-full text-left rounded-xl px-3 py-2 hover:bg-muted text-sm  cursor-pointer"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setKeyword(k);
                      setOpen(false);
                      handleSearch(k);
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator orientation="vertical" />

          {/* RIGHT */}
          <div className="p-5">
            <div className="font-semibold mb-3">
              Việc làm có thể bạn quan tâm
            </div>

            <ScrollArea className="h-[340px] pr-3">
              <div className="space-y-2">
                {jobs?.slice(0, 6).map((job) => (
                  <Link
                    key={job.id}
                    to={`/job/${job.id}`}
                    className="block rounded-2xl p-3 hover:bg-muted"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setOpen(false)}
                  >
                    <div className="font-medium line-clamp-1">{job.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {job.company?.name || job.companyName || job.company} •{' '}
                      {job.salaryMax
                        ? `${job.salaryMax.toLocaleString()} VND`
                        : 'Thỏa thuận'}
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function HomePage() {
  const [limit] = useState(6);
  const [openSuggest, setOpenSuggest] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [wards, setWards] = useState('');
  const [province, setProvince] = useState('');
  const [searchMode, setSearchMode] = useState('both');
  const [wardsName, setWardsName] = useState('');
  /** Mỗi thẻ job preview cần key riêng — cùng jobId ở hai section sẽ không mở trùng 2 popover */
  const [activePreviewKey, setActivePreviewKey] = useState(null);
  const timeoutRef = useRef(null);

  const handlePreviewMouseEnter = (key) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActivePreviewKey(key);
    }, 300);
  };

  const handlePreviewMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActivePreviewKey(null);
    }, 200);
  };

  const { data: newestJobs, isLoading } = useSearchJobs({
    limit,
    page: 1,
    sortBy: 'newest',
  });
  const { data: boostedJobs, isLoading: isBoostedLoading } = useBoostedJobs({
    page: 1,
    limit,
  });
  const displayedBoostedJobs = useMemo(() => {
    return Array.isArray(boostedJobs?.items) ? boostedJobs.items : [];
  }, [boostedJobs?.items]);

  const spotlightJob = newestJobs?.items?.[0];

  return (
    <div className="bg-background min-h-full">
      {/* PROFESSIONAL YELLOW-THEMED HERO SECTION */}
      <section className="relative overflow-hidden bg-card pt-10 pb-20">
        {/* Subtle Decorative Background Elements */}
        <Container>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-muted/20 -skew-x-12 translate-x-1/4 pointer-events-none" />
          <div className="absolute top-20 right-40 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-20 mb-12">
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

          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Content */}
            <div className="space-y-6">
              <Badge className="bg-primary-muted text-primary border-primary/10 w-fit rounded-lg px-3 py-1 font-semibold uppercase tracking-wider text-[11px]">
                Worklink - Nền tảng kết nối việc làm
              </Badge>

              <h1 className="text-3xl lg:text-5xl font-extrabold leading-[1.2] text-slate-900">
                Tìm việc <span className="text-primary">dễ dàng</span>, <br />
                thông tin <span className="text-primary">rõ ràng</span>, <br />
                cơ hội tốt hơn cùng <br />
                <span className="text-primary inline-block relative">
                  <Typewriter
                    onInit={(typewriter) => {
                      typewriter.typeString('WorkLink').pauseFor(2000).start();
                    }}
                    options={{
                      cursor: '',
                      loop: false,
                      autoStart: true,
                    }}
                  />
                  <div className="absolute -bottom-1 left-0 w-full h-1.5 bg-primary/20 rounded-full" />
                </span>
              </h1>

              <div className="flex items-center gap-4 text-slate-600 font-medium text-lg">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Lương
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Ca làm
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Phụ cấp
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Địa điểm
                </span>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Button
                  size="lg"
                  className="rounded-2xl px-8 h-14 text-base font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                  asChild
                >
                  <Link
                    to="/search"
                    className="inline-flex items-center justify-center gap-2"
                  >
                    Xem việc làm ngay
                  </Link>
                </Button>
                <div className="flex -space-x-2">
                  {[
                    'https://media-public.canva.com/zntb4/MAF-Oczntb4/1/s.png',
                    'https://media-public.canva.com/dvcio/MAF-Oddvcio/1/s.png',
                    'https://media-public.canva.com/XgjrY/MAF-OIXgjrY/1/s.png',
                    'https://media-public.canva.com/NnpPI/MAF-OWNnpPI/1/s.png',
                  ].map((i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm"
                    >
                      <img
                        src={i}
                        alt="User"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-2 border-white bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shadow-sm">
                    99+
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Area */}
            <div className="relative pt-10">
              {/* Main Image Frame */}
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-white aspect-4/3">
                <img
                  src="/hero_industrial.png"
                  alt="Tìm việc làm khu công nghiệp - WorkLink"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Decorative Floating Cards (Non-data specific) */}
              <div className="absolute top-0 -right-4 z-20 bg-white p-4 rounded-2xl shadow-xl border border-primary-muted  hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      Tin cậy
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      Thông tin xác thực
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 z-20 hidden md:block max-w-[220px]">
                {isLoading ? (
                  <div className="bg-white p-5 rounded-4xl shadow-xl border border-primary-muted space-y-3">
                    <div className="h-2.5 w-24 bg-slate-100 rounded animate-pulse" />
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-slate-200 rounded-full animate-pulse" />
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                    <div className="h-5 w-20 bg-slate-100 rounded animate-pulse" />
                  </div>
                ) : spotlightJob ? (
                  <Link
                    to={`/job/${spotlightJob.id}`}
                    className="group block bg-white p-5 rounded-4xl shadow-xl border border-primary-muted transition-all hover:shadow-2xl hover:border-primary/25 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    aria-label={`Xem chi tiết: ${spotlightJob.title}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[10px] font-black text-primary uppercase">
                          Việc làm mới ⚡
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-primary rounded-full transition-all group-hover:w-4/5" />
                      </div>
                      <div className="text-xs font-bold text-slate-800 leading-tight line-clamp-3">
                        {spotlightJob.title}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="secondary"
                          className="bg-primary-muted text-primary text-[9px] border-0"
                        >
                          {formatSalary(
                            spotlightJob.salaryMin,
                            spotlightJob.salaryMax,
                            'compact',
                          )}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-white p-5 rounded-4xl shadow-xl border border-primary-muted text-[11px] text-slate-500 text-center leading-snug">
                    Đang cập nhật việc làm mới
                  </div>
                )}
              </div>

              {/* Background Blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-[100px] -z-10" />
            </div>
          </div>
        </Container>
      </section>

      {(isBoostedLoading || displayedBoostedJobs.length > 0) && (
        <section className="relative border-y border-[#FEF08A]/90 bg-gradient-to-b from-[#FFFBF0] via-[#FFFCED] to-background py-7 md:py-8">
          <div className="container mx-auto max-w-7xl px-6">
            <div
              className={cn(
                'rounded-2xl border border-[#FDE047]/70 bg-gradient-to-br from-white to-[#FFFDF0]',
                'shadow-sm shadow-slate-900/6 ring-1 ring-[#FEF9C3]/90',
                'p-5 md:p-6',
              )}
            >
              <div className="mb-5 flex min-w-0 gap-4">
                <div
                  className="w-1.5 shrink-0 self-stretch rounded-full bg-[#FACC15] md:min-h-[2.25rem]"
                  aria-hidden
                />
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-[1.65rem] md:leading-tight">
                    Việc làm nổi bật
                  </h2>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isBoostedLoading
                  ? Array.from({ length: limit }).map((_, i) => (
                      <JobCardSkeleton key={i} />
                    ))
                  : displayedBoostedJobs.map((job) => (
                      <JobCardHoverPreview
                        key={`boosted-${job.id}`}
                        job={job}
                        activePreviewKey={activePreviewKey}
                        previewKey={`boosted-${job.id}`}
                        handleMouseEnter={handlePreviewMouseEnter}
                        handleMouseLeave={handlePreviewMouseLeave}
                      />
                    ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <MatchedJobs />

      {/* FEATURED */}
      <section
        id="jobs"
        className="container mx-auto px-6 py-8 space-y-4 max-w-7xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">
            Những công việc mới nhất
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: limit }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))
            : newestJobs?.items?.map((job) => (
                <JobCardHoverPreview
                  key={`newest-${job.id}`}
                  job={job}
                  activePreviewKey={activePreviewKey}
                  previewKey={`newest-${job.id}`}
                  handleMouseEnter={handlePreviewMouseEnter}
                  handleMouseLeave={handlePreviewMouseLeave}
                />
              ))}
        </div>
        <div className="mt-6 text-center pt-4">
          <Button
            variant="outline"
            className="rounded-full px-8 bg-white hover:bg-primary/5 border-primary/30 text-primary font-semibold transition-all hover:scale-105 shadow-sm"
            asChild
          >
            <Link to="/search">
              Xem tất cả <span className="ml-2 font-bold">&rarr;</span>
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-gradient-to-b from-white to-slate-50 py-10">
        <Container className="max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                Hỗ trợ nhanh
              </p>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                Gửi ticket hỗ trợ ngay trên trang chủ
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-slate-600">
                Nếu bạn gặp lỗi đăng nhập, vấn đề hồ sơ, ứng tuyển hoặc cần
                manager hỗ trợ xử lý, hãy gửi câu hỏi ở đây. Ticket sẽ được
                chuyển vào hàng chờ của bộ phận hỗ trợ.
              </p>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">
                  Khi nào nên gửi ticket?
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>• Không nhận được email xác thực hoặc quên mật khẩu.</li>
                  <li>• Hồ sơ, ứng tuyển hoặc tin tuyển dụng bị lỗi.</li>
                  <li>• Cần hỗ trợ thao tác nhanh từ manager.</li>
                </ul>
              </div>
            </div>

            <SupportTicketForm />
          </div>
        </Container>
      </section>
    </div>
  );
}

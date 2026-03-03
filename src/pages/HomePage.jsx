import { useState } from 'react';
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
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { JobCard } from '@/features/jobs/components/JobCard';
import { SearchIcon } from 'lucide-react';
import {
  useGetProvinces,
  useGetWards,
  useSearchJobs,
} from '@/features/jobs/api/useSearchJobs';
import Typewriter from 'typewriter-effect';
import { Container } from '@/shared/components/Container';
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
    <Card className="p-4 rounded-2xl border border-slate-100 bg-background">
      <div className="flex gap-4">
        <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-5 w-10 rounded-lg" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}

import { Heart } from 'lucide-react';
import { useAuth } from '@/shared/contexts/AuthContext';
import {
  useWishlist,
  useSaveJob,
  useUnsaveJob,
} from '@/features/jobs/api/useWishlist';
import { toast } from 'sonner';

// function JobCard({ job, featured, aiSuggest }) {
//   const { user } = useAuth();
//   const { data } = useWishlist({}, { enabled: !!user });
//   const saveJobMutation = useSaveJob();
//   const unsaveJobMutation = useUnsaveJob();

//   const wishlist = data?.items || data || [];
//   const isSaved =
//     Array.isArray(wishlist) && wishlist.some((item) => item.jobId === job.id);
//   const isPending = saveJobMutation.isPending || unsaveJobMutation.isPending;

//   const handleWishlistToggle = (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!user) {
//       toast.error('Vui lòng đăng nhập để lưu việc làm');
//       return;
//     }

//     if (isSaved) {
//       unsaveJobMutation.mutate(job.id);
//     } else {
//       saveJobMutation.mutate(job.id);
//     }
//   };

//   const formattedSalary = job.salaryMax
//     ? new Intl.NumberFormat('vi-VN', {
//         style: 'currency',
//         currency: 'VND',
//         maximumFractionDigits: 0,
//       }).format(job.salaryMax)
//     : 'Thỏa thuận';

//   return (
//     <Card className="group relative p-4 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl border border-slate-100 bg-white">
//       <div className="flex gap-4">
//         {/* Logo Section */}
//         <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
//           <ImageWithFallback
//             src={job.company?.logoUrl}
//             alt={job.company?.name || 'Công ty'}
//             className="h-full w-full object-contain"
//             fallbackClassName="h-full w-full flex items-center justify-center text-[10px] text-slate-400 text-center p-1"
//           />
//         </div>

//         {/* Content Section */}
//         <div className="flex-1 min-w-0">
//           <div className="flex items-start justify-between gap-2">
//             <div className="min-w-0">
//               <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">
//                 {job.title}
//               </h3>
//               <p className="text-xs font-medium text-slate-500 line-clamp-1 mt-0.5">
//                 {job.company?.name || 'Công ty'}
//               </p>
//             </div>

//             <div className="flex flex-col items-end gap-1 shrink-0 z-20">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className={`h-8 w-8 rounded-full shadow-sm hover:shadow active:scale-95 transition-all ${isSaved ? 'bg-amber-50 hover:bg-amber-100 border-amber-100' : 'bg-white hover:bg-gray-50'}`}
//                 title={isSaved ? 'Đã lưu' : 'Lưu công việc này'}
//                 onClick={handleWishlistToggle}
//                 disabled={isPending}
//               >
//                 <Heart
//                   className={`h-4 w-4 ${isSaved ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
//                 />
//               </Button>
//             </div>
//           </div>

//           <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px]">
//             <div className="flex items-center gap-1 font-semibold">
//               <span className="text-slate-500">Lên tới</span>
//               <span className="text-primary font-bold">{formattedSalary}</span>
//             </div>
//             <div className="flex items-center gap-1 text-slate-400">
//               <MapPin className="h-3 w-3" />
//               <span className="truncate max-w-[120px]">
//                 {job.province || job.address}
//               </span>
//             </div>
//           </div>

//           {job.tags && job.tags.length > 0 && (
//             <>
//               <div className="mt-2 flex flex-wrap gap-1.5">
//                 {job.tags.slice(0, 2).map((tag) => (
//                   <span
//                     key={tag}
//                     className="text-[11px] font-bold bg-primary-muted text-primary px-2.5 py-0.5 rounded-lg border border-primary/10"
//                   >
//                     {tag}
//                   </span>
//                 ))}
//               </div>

//               <div className="flex flex-col items-end gap-1">
//                 {featured && (
//                   <Badge className="bg-primary-muted text-primary hover:bg-primary-hover/10 border-0 text-[10px] px-1.5 py-0 font-bold uppercase tracking-wider">
//                     Mới
//                   </Badge>
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//       <Link
//         to={`/job/${job.id}`}
//         className="absolute inset-0 z-10"
//         aria-label={`Xem chi tiết ${job.title}`}
//       />
//     </Card>
//   );
// }

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
  const handleSearch = () => {
    const trimmedKeyword = keyword.trim();
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
          <SearchIcon className="text-white" title="tìm kiếm theo từ khoá" />
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
                      setDistrict(k);
                      setOpen(false);
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
  const [openId, setOpenId] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const handleMouseEnter = (jobId) => {
    const timeout = setTimeout(() => {
      setOpenId(jobId);
    }, 1000); // 1 second delay
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setOpenId(null);
  };

  const { data: newestJobs, isLoading } = useSearchJobs({ limit });

  function formatMoney(number) {
    return number?.toLocaleString('vi-VN') + ' đ';
  }
  return (
    <div className="bg-background min-h-full">
      {/* PROFESSIONAL YELLOW-THEMED HERO SECTION */}
      <section className="relative overflow-hidden bg-card pt-10 pb-20">
        {/* Subtle Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-muted/20 -skew-x-12 translate-x-1/4 pointer-events-none" />
        <div className="absolute top-20 right-40 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <Container className="relative z-20 mb-12">
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
        </Container>

        <Container className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
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
                <Link to="#jobs" className="flex items-center gap-2">
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
            <div className="absolute top-0 -right-4 z-20 bg-white p-4 rounded-2xl shadow-xl border border-primary-muted animate-bounce duration-5000 hidden md:block">
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

            <div className="absolute -bottom-6 -left-6 z-20 bg-white p-5 rounded-4xl shadow-xl border border-primary-muted hidden md:block max-w-[220px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black text-primary uppercase">
                    Việc làm mới ⚡
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-primary rounded-full" />
                </div>
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  Nhân viên vận hành - Logistics
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-primary-muted text-primary text-[9px] border-0"
                  >
                    12-15 triệu
                  </Badge>
                </div>
              </div>
            </div>

            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-[100px] -z-10" />
          </div>
        </Container>
      </section>

      {/* FEATURED */}
      <section id="jobs" className="py-12 bg-background">
        <Container className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Những công việc mới nhất</h2>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: limit }).map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))
              : newestJobs?.items?.map((job) => (
                  <Popover key={job.id} open={openId == job.id}>
                    <PopoverTrigger asChild>
                      <div
                        onMouseEnter={() => handleMouseEnter(job.id)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <JobCard key={job.id} job={job} featured />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[40vw] h-auto"
                      onMouseEnter={() => handleMouseEnter(job.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div>
                        <PopoverTrigger className="flex items-center gap-2 pb-5">
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
                            <ImageWithFallback
                              src={job.company.logoUrl}
                              alt={job.company.name}
                              className="h-full w-full object-contain"
                              fallbackClassName="h-full w-full flex items-center justify-center text-[10px] text-slate-400 text-center p-1"
                            />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[40vw] h-auto"
                          onMouseEnter={() => setOpenId(job.id)}
                          onMouseLeave={() => setOpenId(null)}
                        >
                          <div>
                            <div className="flex items-center gap-2 pb-5">
                              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
                                <ImageWithFallback
                                  src={job.company.logoUrl}
                                  alt={job.company.name}
                                  className="h-full w-full object-contain"
                                  fallbackClassName="h-full w-full flex items-center justify-center text-[10px] text-slate-400 text-center p-1"
                                />
                              </div>
                              <div className="flex-7">
                                <div className="text-lg p-2 font-bold text-gray-600">
                                  {job.title}
                                </div>
                                <div className="text-sm ps-2">
                                  {job.company.name}
                                </div>
                              </div>
                            </div>
                            <div className="pb-5 flex gap-2">
                              <Badge className="bg-primary text-primary-foreground border-none w-fit rounded-xl px-4 py-1.5 font-bold text-[13px] shadow-sm">
                                Số lượng {job.quantity}
                              </Badge>
                              <Badge className="bg-primary text-primary-foreground border-none w-fit rounded-xl px-4 py-1.5 font-bold text-[13px] shadow-sm">
                                {formatMoney(job.salaryMin)} -{' '}
                                {formatMoney(job.salaryMax)} {job.salaryUnit}
                              </Badge>
                              {/* <Badge className="bg-white text-black border-primary/30 w-fit rounded-lg">
                      {job.gender}
                    </Badge> */}
                            </div>
                            <hr></hr>
                            <div>
                              <div className="pt-2">
                                <h4 className="text-sm font-bold text-gray-500">
                                  Mô tả công việc
                                </h4>
                              </div>
                              <div className="pt-2">
                                <p className="text-sm">{job.description}</p>
                              </div>
                              <div className="pt-2">
                                <h4 className="text-sm font-bold text-gray-500">
                                  Địa chỉ
                                </h4>
                              </div>
                              <div className="pt-2">
                                <p className="text-sm font-bold text-gray-600">
                                  {job.address} - {job.district} -{' '}
                                  {job.province}
                                </p>
                              </div>
                            </div>
                            <div className="pt-4">
                              <Button className="rounded-xl px-6" asChild>
                                <Link to={`/job/${job.id}`}>Xem chi tiết</Link>
                              </Button>
                            </div>
                          </div>
                          <div className="pt-2">
                            <p className="text-sm">{job.description}</p>
                          </div>
                          <div className="pt-2">
                            <h4 className="text-sm font-bold text-gray-500">
                              Địa chỉ
                            </h4>
                          </div>
                          <div className="pt-2">
                            <p className="text-sm font-bold text-gray-600">
                              {job.address} - {job.district} - {job.province}
                            </p>
                          </div>
                        </PopoverContent>
                        <div className="pt-4">
                          <Button className="rounded-xl px-6" asChild>
                            <Link to={`/job/${job.id}`}>Xem chi tiết</Link>
                          </Button>
                        </div>
                        <div className="pt-2">
                          <p className="text-sm font-bold text-gray-600">
                            {job.address} - {job.district} - {job.province}
                          </p>
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button className="rounded-xl px-6" asChild>
                          <Link to={`/job/${job.id}`}>Xem chi tiết</Link>
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
          </div>
          <div className="mt-8 text-center pt-8">
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
        </Container>
      </section>
    </div>
  );
}

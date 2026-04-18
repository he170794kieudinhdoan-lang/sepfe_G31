import { useState, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  useSearchJobs,
  useGetProvinces,
  useGetWards,
} from '@/features/jobs/api/useJobs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';
import {
  Search,
  MapPin,
  Wallet,
  Timer,
  Building2,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Users,
  Calendar,
  RotateCcw,
} from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Container } from '@/shared/components/Container';
import { isWorkerRole } from '@/shared/utils/userRole';

// ========================
// CONSTANTS
// ========================

const WORKING_SHIFTS = [
  { value: 'MORNING', label: 'Ca sáng' },
  { value: 'AFTERNOON', label: 'Ca chiều' },
  { value: 'NIGHT', label: 'Ca đêm' },
  { value: 'FULL_DAY', label: 'Cả ngày' },
  { value: 'FLEXIBLE', label: 'Linh hoạt' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' },
];

const SALARY_RANGES = [
  { value: '', label: 'Tất cả mức lương', min: null, max: null },
  { value: 'under7', label: 'Dưới 7 triệu', min: null, max: 7000000 },
  { value: '7to10', label: '7 – 10 triệu', min: 7000000, max: 10000000 },
  { value: '10to15', label: '10 – 15 triệu', min: 10000000, max: 15000000 },
  { value: 'over15', label: 'Trên 15 triệu', min: 15000000, max: null },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'salary_desc', label: 'Lương cao đến thấp' },
  { value: 'salary_asc', label: 'Lương thấp đến cao' },
  { value: 'view', label: 'Xem nhiều nhất' },
];

// ========================
// HELPER: Format lương
// ========================
const formatSalary = (min, max) => {
  const f = (v) => {
    if (v >= 1000000)
      return `${(v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1)} triệu`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
    return v.toLocaleString('vi-VN');
  };
  if (min && max) return `${f(min)} – ${f(max)}`;
  if (min) return `Từ ${f(min)}`;
  if (max) return `Đến ${f(max)}`;
  return 'Thỏa thuận';
};

const shiftLabel = (shift) =>
  WORKING_SHIFTS.find((s) => s.value === shift)?.label || shift;
const genderLabel = (g) => {
  if (g === 'MALE') return 'Nam';
  if (g === 'FEMALE') return 'Nữ';
  return '';
};

// ========================
// SUB-COMPONENTS
// ========================

/** Skeleton loading cho Job Search Card */
const JobCardSkeleton = () => (
  <Card className="p-0 rounded-2xl overflow-hidden border-0 shadow-sm">
    <Skeleton className="h-36 w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="h-9 w-full rounded-xl" />
    </div>
  </Card>
);

import { useAuth } from '@/shared/contexts/AuthContext';
import {
  useWishlist,
  useSaveJob,
  useUnsaveJob,
  isWishlistTogglePending,
} from '@/features/jobs/api/useWishlist';

/** Job Card cho Search Results */
const SearchJobCard = ({ job }) => {
  const [displayMoreButton, setDisplayMoreButton] = useState(false);
  const { user } = useAuth();
  const boostExpiredAt = job.boostExpiredAt ? new Date(job.boostExpiredAt) : null;
  const isBoosted =
    !!boostExpiredAt &&
    !Number.isNaN(boostExpiredAt.getTime()) &&
    boostExpiredAt > new Date();
  const isWorker = isWorkerRole(user);

  // Wishlist: chỉ worker mới dùng được
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

  return (
    <Card
      className={`group w-full rounded-2xl overflow-hidden hover:cursor-pointer transition-all duration-300 border ${
        isBoosted
          ? 'bg-linear-to-br from-yellow-50/90 via-white to-yellow-50/60 border-yellow-300 ring-1 ring-yellow-200/80 shadow-md hover:shadow-lg'
          : 'bg-white border-slate-100'
      }`}
      onMouseEnter={() => setDisplayMoreButton(true)}
      onMouseLeave={() => setDisplayMoreButton(false)}
    >
      <div className="flex">
        <div className="min-w-0 flex-1 p-5">
          {/* HEADER */}
          <div className="flex items-start gap-3 mb-4">
            <div
              className="h-12 w-32 rounded-xl 
                        flex items-center justify-center 
                        shrink-0 
                        transition-transform p-4"
            >
              {/* <Building2 className="h-5 w-5 text-yellow-600" /> */}
              <img src={job.company?.logoUrl} alt="" />
            </div>

            <div className="flex-1 min-w-0">
              {isBoosted && (
                <Badge className="mb-2 border border-[#FDE047]/90 bg-[#FEF08A] text-[10px] font-extrabold tracking-wide text-slate-900 shadow-sm hover:bg-[#FDE68A] px-2.5 py-1">
                  TIN NỔI BẬT
                </Badge>
              )}
              <h3
                className="font-semibold text-gray-800 
                           leading-snug line-clamp-2 
                           group-hover:text-primary 
                           transition-colors
                           cursor-pointer"
              >
                <Link to={`/job/${job.id}`}>{job.title}</Link>
              </h3>

              {job.company && (
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {job.company.name || 'Công ty'}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="flex flex-wrap gap-1.5">
              <span
                className="inline-flex items-center gap-0.5 max-w-full rounded-md border border-slate-200/90 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium leading-tight text-slate-700"
                title={formatSalary(job.salaryMin, job.salaryMax)}
              >
                <Wallet className="h-2.5 w-2.5 shrink-0 text-slate-500" />
                <span className="truncate">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
              </span>

              {job.province && (
                <span
                  className="inline-flex max-w-[min(100%,11rem)] items-center gap-0.5 rounded-md border border-slate-200/90 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium leading-tight text-slate-700"
                  title={job.province}
                >
                  <MapPin className="h-2.5 w-2.5 shrink-0 text-primary" />
                  <span className="truncate">{job.province}</span>
                </span>
              )}

              <span className="inline-flex items-center gap-0.5 rounded-md border border-slate-200/90 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium leading-tight text-slate-700">
                <Timer className="h-2.5 w-2.5 shrink-0 text-primary" />
                {shiftLabel(job.workingShift)}
              </span>
            </div>

            {((job.ageMin || job.ageMax) || job.quantity > 0) && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                {(job.ageMin || job.ageMax) && (
                  <span className="inline-flex items-center gap-0.5">
                    <Calendar className="h-2.5 w-2.5 shrink-0 text-primary" />
                    {job.ageMin && job.ageMax
                      ? `${job.ageMin}–${job.ageMax} tuổi`
                      : job.ageMin
                        ? `Từ ${job.ageMin} tuổi`
                        : `Đến ${job.ageMax} tuổi`}
                  </span>
                )}
                {job.quantity > 0 && (
                  <span className="inline-flex items-center gap-0.5">
                    <Briefcase className="h-2.5 w-2.5 shrink-0 text-primary" />
                    {job.quantity} vị trí
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {isWorker && (
          <div className="flex w-full shrink-0 flex-col items-end justify-end gap-2 pb-5 pr-4 sm:w-auto sm:pr-5">
            <div
              className={`transition-opacity duration-200 ${displayMoreButton || isSaved ? 'opacity-100' : 'opacity-0'}`}
            >
              <Button
                variant="outline"
                size="icon"
                className={`h-9 w-9 rounded-full shadow-sm hover:shadow active:scale-[0.98] transition-colors duration-150 ${isSaved ? 'bg-amber-50 hover:bg-amber-100 border-amber-100' : ''}`}
                title={isSaved ? 'Đã lưu' : 'Lưu công việc này'}
                onClick={handleWishlistToggle}
                disabled={wishlistBusy}
                aria-busy={wishlistBusy}
              >
                <Heart
                  className={`h-4 w-4 ${isSaved ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                />
              </Button>
            </div>
            <div>
              {displayMoreButton && (
                <Button
                  size="sm"
                  className="flex h-8 items-center gap-1 rounded-full px-3 text-xs animate-in"
                  title="Ứng tuyển"
                  asChild
                >
                  <Link to={`/job/${job.id}`}>Ứng tuyển</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

/** Active Filter Chip */
const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-muted text-primary rounded-full text-xs font-medium border border-primary/10 animate-in fade-in slide-in-from-left-1 duration-200">
    {label}
    <button
      onClick={onRemove}
      className="ml-0.5 p-0.5 rounded-full hover:bg-primary-hover/20 transition-colors"
    >
      <X className="h-3 w-3" />
    </button>
  </span>
);

// ========================
// MAIN PAGE
// ========================

export const JobSearchPage = () => {
  const normalizeLocationName = (name) => {
    if (!name) return '';
    return name
      .replace(
        /^(Tỉnh|Thành phố|TP\.?|Tp\.?|tp\.?|Quận|Huyện|Thị xã|Phường|Xã|Thị trấn)\s*/i,
        '',
      )
      .trim();
  };

  const [searchParams, setSearchParams] = useSearchParams();

  // Init state from URL params
  const [keyword, setKeyword] = useState(searchParams.get('query') || '');
  const [province, setProvince] = useState(searchParams.get('province') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [provinceCode, setProvinceCode] = useState('');
  const [workingShift, setWorkingShift] = useState(
    searchParams.get('workingShift') || '',
  );
  const [occupationId, setOccupationId] = useState(
    searchParams.get('occupationId') || '',
  );
  const [companyId, setCompanyId] = useState(
    searchParams.get('companyId') || '',
  );
  const [genderRequirement, setGenderRequirement] = useState(
    searchParams.get('genderRequirement') || '',
  );
  const [salaryRange, setSalaryRange] = useState(
    searchParams.get('salaryRange') || '',
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const limit = 12;

  const { data: provincesData } = useGetProvinces();
  const { data: communesData } = useGetWards(provinceCode);

  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 800);
    return () => clearTimeout(timer);
  }, [keyword]);

  const buildFilters = useCallback(() => {
    const filters = {
      page,
      limit,
      sortBy,
    };
    if (debouncedKeyword) filters.keyword = debouncedKeyword;
    if (province) filters.province = province;
    if (district) filters.district = district;
    if (workingShift) filters.workingShift = workingShift;
    if (occupationId) filters.occupationId = Number(occupationId);
    if (companyId) filters.companyId = Number(companyId);
    if (genderRequirement) filters.genderRequirement = genderRequirement;
    return filters;
  }, [
    debouncedKeyword,
    province,
    district,
    workingShift,
    occupationId,
    companyId,
    genderRequirement,
    sortBy,
    page,
  ]);

  const filters = buildFilters();
  const { data, isLoading, isError, isFetching } = useSearchJobs(filters);

  // Sync URL params
  useEffect(() => {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (province) params.province = province;
    if (workingShift) params.workingShift = workingShift;
    if (occupationId) params.occupationId = occupationId;
    if (companyId) params.companyId = companyId;
    if (genderRequirement) params.genderRequirement = genderRequirement;
    if (salaryRange) params.salaryRange = salaryRange;
    if (sortBy && sortBy !== 'newest') params.sortBy = sortBy;
    if (page > 1) params.page = page;
    setSearchParams(params, { replace: true });
  }, [
    keyword,
    province,
    workingShift,
    occupationId,
    companyId,
    genderRequirement,
    salaryRange,
    sortBy,
    page,
    setSearchParams,
  ]);

  // Client-side salary filtering
  const salaryFilter = SALARY_RANGES.find((r) => r.value === salaryRange);
  let jobs = data?.items || [];
  if (salaryFilter && salaryFilter.value) {
    jobs = jobs.filter((job) => {
      const jMin = job.salaryMin || 0;
      const jMax = job.salaryMax || Infinity;
      const fMin = salaryFilter.min || 0;
      const fMax = salaryFilter.max || Infinity;
      return jMin <= fMax && jMax >= fMin;
    });
  }

  const meta = data?.meta || {};
  const totalPages = meta.totalPage || 1;
  const total = meta.total || 0;

  useEffect(() => {
    setPage(1);
  }, [
    debouncedKeyword,
    province,
    district,
    workingShift,
    occupationId,
    companyId,
    genderRequirement,
    salaryRange,
    sortBy,
  ]);

  const activeFilters = [];
  if (workingShift)
    activeFilters.push({
      key: 'workingShift',
      label: `Ca: ${shiftLabel(workingShift)}`,
      clear: () => setWorkingShift(''),
    });
  if (genderRequirement)
    activeFilters.push({
      key: 'gender',
      label: `Giới tính: ${genderLabel(genderRequirement)}`,
      clear: () => setGenderRequirement(''),
    });
  if (occupationId)
    activeFilters.push({
      key: 'occupation',
      label: `Ngành nghề: #${occupationId}`,
      clear: () => setOccupationId(''),
    });
  if (companyId)
    activeFilters.push({
      key: 'company',
      label: `Công ty: #${companyId}`,
      clear: () => setCompanyId(''),
    });
  if (province)
    activeFilters.push({
      key: 'province',
      label: `Khu vực: ${province}`,
      clear: () => {
        setProvince('');
        setProvinceCode('');
        setDistrict('');
      },
    });
  if (district)
    activeFilters.push({
      key: 'district',
      label: `Phường/Xã: ${district}`,
      clear: () => setDistrict(''),
    });
  if (salaryRange)
    activeFilters.push({
      key: 'salary',
      label: `Lương: ${SALARY_RANGES.find((r) => r.value === salaryRange)?.label}`,
      clear: () => setSalaryRange(''),
    });

  const clearAllFilters = () => {
    setKeyword('');
    setProvince('');
    setDistrict('');
    setProvinceCode('');
    setWorkingShift('');
    setOccupationId('');
    setCompanyId('');
    setGenderRequirement('');
    setSalaryRange('');
    setSortBy('newest');
    setPage(1);
  };

  // ========================
  // FILTER PANEL
  // ========================
  const FilterPanel = ({ isMobile = false }) => (
    <div className="space-y-5">
      {/* Ca làm việc */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
          <Timer className="h-3.5 w-3.5" /> Ca làm việc
        </label>
        <div className="flex flex-wrap gap-2">
          {WORKING_SHIFTS.map((s) => (
            <button
              key={s.value}
              onClick={() =>
                setWorkingShift(workingShift === s.value ? '' : s.value)
              }
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                workingShift === s.value
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-hover hover:bg-primary-muted'
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mức lương */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
          <Wallet className="h-3.5 w-3.5" /> Mức lương
        </label>
        <div className="space-y-1.5">
          {SALARY_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() =>
                setSalaryRange(salaryRange === r.value ? '' : r.value)
              }
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                salaryRange === r.value
                  ? 'bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20'
                  : 'text-gray-600 hover:bg-primary-muted'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Giới tính */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
          <Users className="h-3.5 w-3.5" /> Giới tính yêu cầu
        </label>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((g) => (
            <button
              key={g.value}
              onClick={() =>
                setGenderRequirement(
                  genderRequirement === g.value ? '' : g.value,
                )
              }
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                genderRequirement === g.value
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-hover hover:bg-primary-muted'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ngành nghề (nhập ID) */}
      {/* <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <Briefcase className="h-3.5 w-3.5" /> Ngành nghề (ID)
                </label>
                <Input
                    type="number"
                    placeholder="VD: 1, 2, 3..."
                    min={1}
                    value={occupationId}
                    onChange={(e) => setOccupationId(e.target.value)}
                    className="rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-200"
                />
            </div> */}

      {/* Công ty (nhập ID) */}
      {/* <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <Building2 className="h-3.5 w-3.5" /> Công ty (ID)
                </label>
                <Input
                    type="number"
                    placeholder="VD: 1, 2, 3..."
                    min={1}
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-200"
                />
            </div> */}

      {/* Khu vực - Tỉnh/Thành phố */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
          <MapPin className="h-3.5 w-3.5" /> Tỉnh/Thành phố
        </label>
        <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white">
          {provincesData?.provinces?.map((p) => (
            <button
              key={p.code}
              onClick={() => {
                const normalized = normalizeLocationName(p.name);
                if (province === normalized) {
                  setProvince('');
                  setProvinceCode('');
                  setDistrict('');
                } else {
                  setProvince(normalized);
                  setProvinceCode(p.code);
                  setDistrict('');
                }
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-all duration-200 ${
                province === normalizeLocationName(p.name)
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-gray-600 hover:bg-primary-muted'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Khu vực - Phường/Xã */}
      {provinceCode && (
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
            <MapPin className="h-3.5 w-3.5" /> Phường/Xã
          </label>
          <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white">
            {communesData?.communes?.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  const normalized = normalizeLocationName(c.name);
                  setDistrict(district === normalized ? '' : normalized);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-all duration-200 ${
                  district === normalizeLocationName(c.name)
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-gray-600 hover:bg-primary-muted'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear All */}
      {activeFilters.length > 0 && (
        <Button
          variant="ghost"
          className="w-full rounded-xl text-sm text-muted-foreground hover:text-destructive"
          onClick={clearAllFilters}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Xóa tất cả bộ lọc
        </Button>
      )}
    </div>
  );

  // ========================
  // PAGINATION
  // ========================
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex items-center justify-center gap-1.5 mt-8">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {start > 1 && (
          <>
            <Button
              variant={page === 1 ? 'default' : 'outline'}
              size="sm"
              className="rounded-xl min-w-[36px]"
              onClick={() => setPage(1)}
            >
              1
            </Button>
            {start > 2 && <span className="px-1 text-muted-foreground">…</span>}
          </>
        )}
        {pages.map((p) => (
          <Button
            key={p}
            variant={page === p ? 'default' : 'outline'}
            size="sm"
            className={`rounded-xl min-w-[36px] ${page === p ? 'shadow-md shadow-primary/20' : ''}`}
            onClick={() => setPage(p)}
          >
            {p}
          </Button>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && (
              <span className="px-1 text-muted-foreground">…</span>
            )}
            <Button
              variant={page === totalPages ? 'default' : 'outline'}
              size="sm"
              className="rounded-xl min-w-[36px]"
              onClick={() => setPage(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // ========================
  // RENDER
  // ========================
  return (
    <div className="bg-linear-to-b from-amber-50/50 via-white to-gray-50 min-h-screen">
      {/* Hero Search Bar */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="pt-8 pb-6 relative z-10">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
              {/* <Sparkles className="h-6 w-6 text-yellow-500" /> */}
              Tìm kiếm việc làm
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Khám phá hàng ngàn cơ hội việc làm phù hợp với bạn
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg shadow-primary/5 border border-primary/10 p-2 flex items-center gap-2">
              <div className="flex-1 flex items-center px-3">
                <Search className="h-5 w-5 text-primary mr-2 shrink-0" />
                <Input
                  type="text"
                  placeholder="Tìm theo tên việc, mô tả..."
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                  }}
                  className="border-0 shadow-none focus-visible:ring-0 text-base bg-transparent"
                />
              </div>
              {/* <Button2
                                className="rounded-xl px-6 font-semibold shadow-lg shadow-amber-200/50"
                            >
                                <Search className="h-4 w-4 mr-2" /> Tìm kiếm
                            </Button2> */}
            </div>
          </div>
        </div>
      </div>
      {/* Active Filters + Sort */}
      <Container>
        <div className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap ">
              {activeFilters.length > 0 && (
                <>
                  <span className="text-sm text-muted-foreground mr-2">
                    Lọc theo:
                  </span>
                  {activeFilters.map((f) => (
                    <FilterChip
                      key={f.key}
                      label={f.label}
                      onRemove={f.clear}
                    />
                  ))}
                </>
              )}
            </div>

            {/* on mobile */}
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl lg:hidden"
                onClick={() => setDrawerOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-1" /> Bộ lọc
              </Button>
              {/* <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="rounded-xl bg-white shadow-sm border border-gray-200 px-3 py-2 text-sm focus:border-yellow-400 focus:ring-1 focus:ring-amber-200 outline-none cursor-pointer"
                        >
                            {SORT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select> */}
            </div>
            <div className="w-full max-w-6xl my-5 flex justify-end m-auto pr-10">
              <Select value={sortBy} onValueChange={(e) => setSortBy(e)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SORT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Container>

      {/* Main Layout */}
      <Container>
        <div className="pb-12 w-full">
          <div className="flex gap-6">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="mb-2">
                {!isLoading && (
                  <span className="text-xs text-muted-foreground">
                    <h4 className="text-lg font-bold">
                      {total > 0 ? `${total} kết quả` : ''}
                    </h4>
                  </span>
                )}
              </div>
              <div className="sticky top-24">
                <Card className="p-5 rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-gray-800">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    Bộ lọc tìm kiếm
                  </h3>
                  <FilterPanel />
                </Card>
              </div>
            </aside>

            {/* Results */}
            <main className="flex-1 min-w-0">
              {/* Loading indicator */}
              {isFetching && !isLoading && (
                <div className="flex items-center gap-2 mb-4 text-sm text-primary animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                  Đang tải...
                </div>
              )}

              {isLoading ? (
                <div className="grid  gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <JobCardSkeleton key={i} />
                  ))}
                </div>
              ) : isError ? (
                <Card className="p-8 rounded-2xl text-center border-0 shadow-sm">
                  <div className="text-destructive text-lg font-semibold mb-2">
                    Không thể tải dữ liệu
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Vui lòng kiểm tra kết nối và thử lại.
                  </p>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => window.location.reload()}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" /> Thử lại
                  </Button>
                </Card>
              ) : jobs.length === 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-center">
                    Không tìm thấy việc làm
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4">
                    {jobs.map((job) => (
                      <SearchJobCard key={job.id} job={job} />
                    ))}
                  </div>
                  <Pagination />
                </>
              )}
            </main>
          </div>
        </div>
      </Container>
      {/* Mobile Filter Drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur-md p-5 z-50 shadow-2xl lg:hidden overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-amber-500" />
                Bộ lọc tìm kiếm
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl"
                onClick={() => setDrawerOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <FilterPanel isMobile />
          </div>
        </>
      )}
    </div>
  );
};

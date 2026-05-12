import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  getTermsCondition,
  updateTermsCondition,
} from '@/features/terms/api/termsApi';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  Plus,
  Sparkles,
  Zap,
  LayoutDashboard,
  Users,
  Layers,
  FileText,
  Briefcase,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { Modal } from '@/shared/components/Modal';
import { DashboardLayout } from '@/shared/components/Layout/DashboardLayout';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';
import { SectorManagementService } from '@/features/jobs/api/sectormanagement';
import { OccupationManagementService } from '@/features/jobs/api/occupationmanagement';
import { useGetAiConfigs, useUpdateAiConfigs } from '@/features/jobs';
import {
  useGetAllUsersPaginated,
  useUpdateUserStatus,
} from '@/features/users/api/useUser';
import { AppPagination } from '@/shared/components/AppPagination';
import {
  useAdminStatistics,
  useCreatePaymentPackage,
  usePaymentPackages,
  usePointPricing,
  useUpdatePaymentPackage,
  useUpdatePointPricing,
} from '@/features/admin/api/useAdmin';

const formatCompactVND = (value) => {
  if (!value) return '0';
  if (value >= 1_000_000_000) {
    return (
      (value / 1_000_000_000).toLocaleString('vi-VN', {
        maximumFractionDigits: 1,
      }) + ' Tỷ'
    );
  }
  if (value >= 1_000_000) {
    return (
      (value / 1_000_000).toLocaleString('vi-VN', {
        maximumFractionDigits: 1,
      }) + ' Tr'
    );
  }
  if (value >= 1_000) {
    return (
      (value / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) +
      ' k'
    );
  }
  return value.toLocaleString('vi-VN');
};

const formatCommaNumber = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const parseCommaNumber = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return 0;
  return Number(digits);
};

const toCurrencyInput = (value, fallback = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return formatCommaNumber(fallback);
  return formatCommaNumber(Math.max(0, Math.floor(numeric)));
};

export const AdminDashboard = () => {
  const { toast } = useToast();
  const [active, setActive] = useState('overview');
  const sectorRowsPerPage = 10;
  const occupationRowsPerPage = 10;

  // Users state
  const initialUserFilters = {
    page: 1,
    limit: 10,
    role: '',
    status: '',
    fromDate: '',
    toDate: '',
  };

  const [userFilters, setUserFilters] = useState(initialUserFilters);
  const [userFiltersInput, setUserFiltersInput] = useState(initialUserFilters);

  const { data: usersData, isLoading: isLoadingUsers } =
    useGetAllUsersPaginated(userFilters);
  const usersList = usersData?.data || [];
  const totalPages = usersData?.totalPages || 1;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userStatusToUpdate, setUserStatusToUpdate] = useState(null);
  const updateUserStatusMutation = useUpdateUserStatus();
  const [sectorModal, setSectorModal] = useState(false);
  const [editSector, setEditSector] = useState(null);
  const [sectorToDelete, setSectorToDelete] = useState(null);
  const [termsEditMode, setTermsEditMode] = useState(false);
  const [termsSaved, setTermsSaved] = useState({
    id: null,
    title: '',
    content: '',
  });
  const [termsDraft, setTermsDraft] = useState({
    id: null,
    title: '',
    content: '',
  });
  const [isTermsLoading, setIsTermsLoading] = useState(false);
  const [sectorName, setSectorName] = useState('');
  const [sectors, setSectors] = useState([]);
  const [sectorsTableRows, setSectorsTableRows] = useState([]);
  const [sectorsTableTotalPages, setSectorsTableTotalPages] = useState(1);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [sectorPage, setSectorPage] = useState(1);

  // Occupations state
  const [occupations, setOccupations] = useState([]);
  const [loadingOccupations, setLoadingOccupations] = useState(false);
  const [occupationModal, setOccupationModal] = useState(false);
  const [editOccupation, setEditOccupation] = useState(null);
  const [occupationToDelete, setOccupationToDelete] = useState(null);
  const [occupationName, setOccupationName] = useState('');
  const [selectedSectorId, setSelectedSectorId] = useState('');
  const [filterSectorId, setFilterSectorId] = useState('');
  const [occupationPage, setOccupationPage] = useState(1);
  const [occupationSearch, setOccupationSearch] = useState('');
  const [occupationSearchDebounced, setOccupationSearchDebounced] =
    useState('');

  // AI Matching Weights State
  const { data: configsData, isLoading: loadingConfigs } = useGetAiConfigs();
  const updateConfigsMutation = useUpdateAiConfigs();
  const [aiConfigs, setAiConfigs] = useState({});

  const [aiLabels, setAiLabels] = useState({});

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { data: statsData, isLoading: loadingStats } = useAdminStatistics({
    year: selectedYear,
  });

  const { data: paymentPackagesRes } = usePaymentPackages({
    includeInactive: true,
  });
  const { data: pointPricingRes } = usePointPricing();
  const createPaymentPackageMutation = useCreatePaymentPackage();
  const updatePaymentPackageMutation = useUpdatePaymentPackage();
  const updatePointPricingMutation = useUpdatePointPricing();
  const [pointPricingForm, setPointPricingForm] = useState({
    JOB_POST_POINT_COST: '50,000',
    BOOST_JOB_POINT_COST: '50,000',
    BOOST_JOB_DURATION_DAYS: '7',
    AI_INVITE_POINT_COST_PER_WORKER: '1,000',
  });
  const paymentPackages =
    paymentPackagesRes?.items || paymentPackagesRes?.data || [];
  const boostPackages = paymentPackages
    .filter((pkg) => pkg.orderType === 'BOOST_JOB')
    .sort((a, b) => {
      const aDays = Number(a.durationDays || 0);
      const bDays = Number(b.durationDays || 0);
      if (aDays !== bDays) return aDays - bDays;
      return Number(a.price || 0) - Number(b.price || 0);
    });
  const activeBoostPackages = boostPackages.filter((pkg) => pkg.isActive);
  const [boostPackageForm, setBoostPackageForm] = useState({
    durationDays: '7',
    price: '50,000',
    isActive: true,
  });
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [boostModalData, setBoostModalData] = useState({
    id: null,
    durationDays: '7',
    price: '50,000',
    isActive: true,
  });

  const kpi = [
    {
      label: 'Tổng số người dùng trên hệ thống',
      value: statsData?.users?.total || 0,
    },
    {
      label: 'Tổng số doanh nghiệp trên hệ thống',
      value: statsData?.companies?.total || 0,
    },
    {
      label: 'Tổng doanh thu toàn thời gian(VNĐ)',
      value: new Intl.NumberFormat('vi-VN').format(
        statsData?.payments?.totalRevenue || 0,
      ),
    },
  ];

  const activePaymentPackages = paymentPackages.filter((pkg) => pkg.isActive);

  const renderUsersChart = () => {
    const labels = statsData?.charts?.labels?.length
      ? statsData.charts.labels
      : Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
    const newUsers = statsData?.charts?.newUsers || new Array(12).fill(0);
    const maxUsers = Math.max(...newUsers, 1);

    return (
      <div
        className={`flex h-full w-full items-end justify-between px-2 sm:px-4 pb-2 pt-6 gap-2 ${loadingStats ? 'animate-pulse opacity-50' : ''}`}
      >
        {labels.map((label, idx) => {
          const count = newUsers[idx] || 0;
          const height =
            count === 0 ? 0 : Math.max(8, (count / maxUsers) * 100);

          return (
            <div
              key={label}
              className="flex flex-col items-center justify-end w-full h-full relative group"
            >
              <div className="flex flex-col items-center justify-end w-full max-w-5 h-full border-b border-slate-100">
                <div
                  className={`relative w-full rounded-t-sm transition-all group-hover:opacity-80 ${count > 0 ? 'bg-blue-500' : 'bg-transparent'}`}
                  style={{ height: `${height}%` }}
                  title={`Người dùng mới: ${count}`}
                >
                  {count > 0 && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] sm:text-[11px] whitespace-nowrap text-blue-600 font-bold">
                      {count}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-3 whitespace-nowrap shrink-0">
                {label.replace('Tháng ', 'T')}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRevenueChart = () => {
    const labels = statsData?.charts?.labels?.length
      ? statsData.charts.labels
      : Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
    const revenue = statsData?.charts?.revenue || new Array(12).fill(0);
    const maxRev = Math.max(...revenue, 1);

    return (
      <div
        className={`flex h-full w-full items-end justify-between px-2 sm:px-4 pb-2 pt-6 gap-2 ${loadingStats ? 'animate-pulse opacity-50' : ''}`}
      >
        {labels.map((label, idx) => {
          const rev = revenue[idx] || 0;
          const height = rev === 0 ? 0 : Math.max(8, (rev / maxRev) * 100);

          return (
            <div
              key={label}
              className="flex flex-col items-center justify-end w-full h-full relative group"
            >
              <div className="flex flex-col items-center justify-end w-full max-w-5 h-full border-b border-slate-100">
                <div
                  className={`relative w-full rounded-t-sm transition-all group-hover:opacity-80 ${rev > 0 ? 'bg-emerald-500' : 'bg-transparent'}`}
                  style={{ height: `${height}%` }}
                  title={`Doanh thu: ${new Intl.NumberFormat('vi-VN').format(rev)}đ`}
                >
                  {rev > 0 && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] whitespace-nowrap text-emerald-600 font-bold">
                      {formatCompactVND(rev)}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-3 whitespace-nowrap shrink-0">
                {label.replace('Tháng ', 'T')}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    const pricing = pointPricingRes?.items || pointPricingRes?.data || [];
    if (!Array.isArray(pricing) || pricing.length === 0) return;
    const next = { ...pointPricingForm };
    pricing.forEach((item) => {
      if (item.key === 'BOOST_JOB_DURATION_DAYS') {
        next[item.key] = String(Math.max(1, Number(item.value || 0)));
      } else {
        next[item.key] = toCurrencyInput(item.value || 0);
      }
    });
    setPointPricingForm(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointPricingRes]);

  useEffect(() => {
    if (configsData && Array.isArray(configsData)) {
      const newConfigs = { ...aiConfigs };
      const newLabels = { ...aiLabels };
      configsData.forEach((item) => {
        newConfigs[item.key] = Math.round(item.value * 100);
        newLabels[item.key] = item.label;
      });
      setAiConfigs(newConfigs);
      setAiLabels(newLabels);
    }
  }, [configsData]);

  const totalAiWeight = Object.entries(aiConfigs).reduce((sum, [key, val]) => {
    if (key === 'MIN_SCORE_THRESHOLD') return sum;
    return sum + Number(val);
  }, 0);

  const renderOverviewLoading = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-8 w-3/4" />
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <div className="flex justify-between mb-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </Card>
    </div>
  );

  const renderUsersLoading = () => (
    <div className="space-y-6">
      <Card className="p-4 flex flex-wrap gap-3 items-center">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 flex-1 min-w-[200px]" />
        <Skeleton className="h-10 w-20" />
      </Card>
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      </Card>
    </div>
  );

  const renderPaymentLoading = () => (
    <div className="space-y-8">
      <Card className="p-6 space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-24" />
        </div>
      </Card>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );

  const renderTableLoading = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
      <Card className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </Card>
    </div>
  );

  const renderAiConfigsLoading = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
      <Card className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const isLoading = false;

  const menu = [
    { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    {
      key: 'payment_packages',
      label: 'Thiết lập thanh toán',
      icon: CreditCard,
    },
    { key: 'users', label: 'Quản lý người dùng', icon: Users },
    { key: 'sectors', label: 'Quản lý ngành nghề', icon: Layers },
    { key: 'occupations', label: 'Quản lý nghề nghiệp', icon: Briefcase },
    { key: 'terms', label: 'Điều khoản sử dụng', icon: FileText },
    { key: 'ai_configs', label: 'Thiết lập trọng số AI', icon: Sparkles },
  ];

  const headers = useMemo(
    () => ({
      overview: {
        title: 'Trang quản trị hệ thống',
        subtitle: 'Giám sát hoạt động và xử lý nghiệp vụ nhanh.',
      },
      payment_packages: {
        title: 'Quản lý Điểm & Gói Dịch vụ',
        subtitle: 'Cấu hình mức giá, gói đẩy tin và chi phí AI gợi ý ứng viên.',
      },
      users: {
        title: 'Quản lý Người dùng',
        subtitle: 'Danh sách và kiểm soát trạng thái hoạt động của tài khoản.',
      },
      sectors: {
        title: 'Quản lý Ngành nghề',
        subtitle: 'Thiết lập các nhóm ngành nghề chính trong hệ thống.',
      },
      occupations: {
        title: 'Quản lý Nghề nghiệp',
        subtitle: 'Chi tiết các công việc cụ thể theo từng ngành nghề.',
      },
      terms: {
        title: 'Điều khoản & Chính sách',
        subtitle: 'Cập nhật nội dung pháp lý và quy định của nền tảng.',
      },
      ai_configs: {
        title: 'Cấu hình Trọng số AI',
        subtitle: 'Điều chỉnh thuật toán gợi ý và chấm điểm ứng viên.',
      },
    }),
    [],
  );

  const fetchSectors = async () => {
    try {
      const data = await SectorManagementService.getAllSectors();
      setSectors(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSectorsTable = async (page) => {
    try {
      setLoadingSectors(true);
      const res = await SectorManagementService.getSectorsPaginated({
        page,
        limit: sectorRowsPerPage,
      });
      setSectorsTableRows(Array.isArray(res?.data) ? res.data : []);
      setSectorsTableTotalPages(res?.totalPages ?? 1);
    } catch (e) {
      console.error(e);
      toast('Lỗi khi tải danh sách ngành nghề', 'error');
    } finally {
      setLoadingSectors(false);
    }
  };

  const fetchTerms = async () => {
    setIsTermsLoading(true);
    try {
      const data = await getTermsCondition();
      // Lấy phần tử đầu tiên nếu data là một mảng
      const termsData = Array.isArray(data) ? data[0] : data;

      if (termsData) {
        setTermsSaved({
          id: termsData?.id,
          title: termsData?.title || '',
          content: termsData?.content || '',
        });
        setTermsDraft({
          id: termsData?.id,
          title: termsData?.title || '',
          content: termsData?.content || '',
        });
      }
    } catch (error) {
      toast('Không thể tải điều khoản', 'error');
    } finally {
      setIsTermsLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
    fetchOccupations();
    fetchTerms();
  }, []);

  useEffect(() => {
    if (active !== 'sectors') return;
    fetchSectorsTable(sectorPage);
  }, [active, sectorPage]);

  const filteredOccupations = useMemo(() => {
    const q = occupationSearchDebounced.trim().toLowerCase();
    if (!q) return occupations;
    return occupations.filter((occ) => {
      const name = String(occ.name || '').toLowerCase();
      if (name.includes(q)) return true;
      const sector = sectors.find(
        (s) => String(s.id) === String(occ.sectorId ?? occ.sector?.id),
      );
      return String(sector?.name || '')
        .toLowerCase()
        .includes(q);
    });
  }, [occupations, occupationSearchDebounced, sectors]);

  const occupationTotalPages = Math.max(
    1,
    Math.ceil(filteredOccupations.length / occupationRowsPerPage),
  );
  const paginatedOccupations = filteredOccupations.slice(
    (occupationPage - 1) * occupationRowsPerPage,
    occupationPage * occupationRowsPerPage,
  );

  useEffect(() => {
    setSectorPage(1);
  }, [active]);

  useEffect(() => {
    if (active === 'occupations') {
      setOccupationPage(1);
    }
  }, [active]);

  useEffect(() => {
    if (sectorPage > sectorsTableTotalPages) {
      setSectorPage(sectorsTableTotalPages);
    }
  }, [sectorPage, sectorsTableTotalPages]);

  useEffect(() => {
    if (occupationPage > occupationTotalPages) {
      setOccupationPage(occupationTotalPages);
    }
  }, [occupationPage, occupationTotalPages]);

  useEffect(() => {
    setOccupationPage(1);
  }, [filterSectorId, occupationSearchDebounced]);

  useEffect(() => {
    const ms = 320;
    const id = setTimeout(() => {
      setOccupationSearchDebounced(occupationSearch);
    }, ms);
    return () => clearTimeout(id);
  }, [occupationSearch]);

  const createSector = async () => {
    try {
      if (!sectorName.trim()) {
        toast('Tên ngành nghề không được để trống', 'error');
        return;
      }

      await SectorManagementService.createSector({
        name: sectorName,
      });

      // cập nhật list sector ngay lập tức
      await fetchSectors();
      if (active === 'sectors') await fetchSectorsTable(sectorPage);

      toast('Tạo ngành nghề thành công');

      setSectorModal(false);
      setSectorName('');
    } catch (e) {
      console.error(e);
      toast('Tạo ngành nghề thất bại', 'error');
    }
  };
  const updateSector = async () => {
    try {
      if (!sectorName.trim()) {
        toast('Tên ngành nghề không được để trống', 'error');
        return;
      }

      if (!editSector) return;

      await SectorManagementService.updateSector(editSector.id, {
        name: sectorName,
      });

      toast('Cập nhật ngành nghề thành công');

      setSectorModal(false);
      setEditSector(null);
      setSectorName('');

      await fetchSectors();
      if (active === 'sectors') await fetchSectorsTable(sectorPage);
    } catch (e) {
      console.error(e);
      toast('Cập nhật ngành nghề thất bại', 'error');
    }
  };
  const deleteSector = async () => {
    try {
      if (!sectorToDelete) return;

      await SectorManagementService.deleteSector(sectorToDelete.id);

      toast('Xóa ngành nghề thành công');

      setSectorToDelete(null);

      await fetchSectors();
      if (active === 'sectors') await fetchSectorsTable(sectorPage);
    } catch (e) {
      console.error(e);
      toast('Xóa ngành nghề thất bại', 'error');
    }
  };

  const fetchOccupations = async (sectorId = '') => {
    try {
      setLoadingOccupations(true);
      let data;
      if (sectorId) {
        data =
          await OccupationManagementService.getActiveOccupationBySector(
            sectorId,
          );
      } else {
        data = await OccupationManagementService.getAllActiveOccupations();
      }

      let arr = [];
      if (Array.isArray(data)) arr = data;
      else if (data?.data && Array.isArray(data.data)) arr = data.data;
      else if (data?.content && Array.isArray(data.content)) arr = data.content;
      else if (data?.data?.data && Array.isArray(data.data.data))
        arr = data.data.data;

      setOccupations(arr);
    } catch (e) {
      console.error(e);
      toast('Lỗi khi tải danh sách nghề nghiệp', 'error');
    } finally {
      setLoadingOccupations(false);
    }
  };

  useEffect(() => {
    fetchOccupations(filterSectorId);
  }, [filterSectorId]);

  const createOccupation = async () => {
    try {
      if (!occupationName.trim() || !selectedSectorId) {
        toast('Vui lòng nhập đầy đủ tên và chọn ngành nghề', 'error');
        return;
      }
      await OccupationManagementService.createOccupation({
        name: occupationName,
        sectorId: selectedSectorId,
      });
      await fetchOccupations(filterSectorId);
      toast('Tạo nghề nghiệp thành công');
      setOccupationModal(false);
      setOccupationName('');
      setSelectedSectorId('');
    } catch (e) {
      console.error(e);
      toast('Tạo nghề nghiệp thất bại', 'error');
    }
  };

  const updateOccupation = async () => {
    try {
      if (!occupationName.trim() || !selectedSectorId) {
        toast('Vui lòng nhập đầy đủ tên và chọn ngành nghề', 'error');
        return;
      }
      if (!editOccupation) return;
      await OccupationManagementService.updateOccupation(editOccupation.id, {
        name: occupationName,
        sectorId: selectedSectorId,
      });
      toast('Cập nhật nghề nghiệp thành công');
      setOccupationModal(false);
      setEditOccupation(null);
      setOccupationName('');
      setSelectedSectorId('');
      await fetchOccupations(filterSectorId);
    } catch (e) {
      console.error(e);
      toast('Cập nhật nghề nghiệp thất bại', 'error');
    }
  };

  const deleteOccupation = async () => {
    try {
      if (!occupationToDelete) return;
      await OccupationManagementService.deleteOccupation(occupationToDelete.id);
      toast('Xóa nghề nghiệp thành công');
      setOccupationToDelete(null);
      await fetchOccupations(filterSectorId);
    } catch (e) {
      console.error(e);
      toast('Xóa nghề nghiệp thất bại', 'error');
    }
  };

  const handleSaveTerms = async () => {
    if (!termsDraft.id) {
      toast('Không tìm thấy ID điều khoản để cập nhật', 'error');
      return;
    }

    setIsTermsLoading(true);
    try {
      await updateTermsCondition(termsDraft.id, {
        title: termsDraft.title,
        content: termsDraft.content,
      });
      setTermsSaved(termsDraft);
      setTermsEditMode(false);
      toast('Đã lưu điều khoản.');
    } catch (error) {
      toast('Lưu điều khoản thất bại', 'error');
    } finally {
      setIsTermsLoading(false);
    }
  };

  const handleSavePointPricing = async () => {
    const jobPostCost = parseCommaNumber(pointPricingForm.JOB_POST_POINT_COST);
    const boostCost = parseCommaNumber(pointPricingForm.BOOST_JOB_POINT_COST);
    const inviteCost = parseCommaNumber(
      pointPricingForm.AI_INVITE_POINT_COST_PER_WORKER,
    );
    const boostDays = Number(
      String(pointPricingForm.BOOST_JOB_DURATION_DAYS || '').replace(/\D/g, ''),
    );

    if (jobPostCost < 1000) {
      toast('Chi phí đăng tin phải từ 1.000 điểm trở lên', 'error');
      return;
    }
    if (boostCost < 1000) {
      toast('Chi phí đẩy tin phải từ 1.000 điểm trở lên', 'error');
      return;
    }
    if (!Number.isFinite(boostDays) || boostDays < 1) {
      toast('Thời gian đẩy tin phải từ 1 ngày trở lên', 'error');
      return;
    }
    if (inviteCost < 100) {
      toast('Chi phí AI gợi ý phải từ 100 điểm trở lên', 'error');
      return;
    }

    try {
      await updatePointPricingMutation.mutateAsync({
        JOB_POST_POINT_COST: jobPostCost,
        BOOST_JOB_POINT_COST: boostCost,
        BOOST_JOB_DURATION_DAYS: boostDays,
        AI_INVITE_POINT_COST_PER_WORKER: inviteCost,
      });
      toast('Đã cập nhật mức điểm thành công');
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể cập nhật mức điểm';
      toast(Array.isArray(message) ? message.join(', ') : message, 'error');
    }
  };

  const handleOpenBoostModal = (pkg = null) => {
    if (pkg) {
      setBoostModalData({
        id: pkg.id,
        durationDays: String(Number(pkg.durationDays || 7)),
        price: toCurrencyInput(pkg.price || 50000),
        isActive: Boolean(pkg.isActive),
      });
    } else {
      setBoostModalData({
        id: null,
        durationDays: '7',
        price: '50,000',
        isActive: true,
      });
    }
    setBoostModalOpen(true);
  };

  const handleConfirmBoostPackage = async () => {
    const durationDays = Number(
      String(boostModalData.durationDays || '').replace(/\D/g, ''),
    );
    const price = parseCommaNumber(boostModalData.price);
    const isEditing = !!boostModalData.id;

    if (!Number.isFinite(durationDays) || durationDays < 1) {
      toast('Số ngày của gói phải từ 1 ngày trở lên', 'error');
      return;
    }
    if (!Number.isFinite(price) || price < 1000) {
      toast('Giá gói đẩy tin phải từ 1.000 điểm trở lên', 'error');
      return;
    }

    if (isEditing) {
      const targetPackage = boostPackages.find(
        (pkg) => pkg.id === boostModalData.id,
      );
      const activeBoostCount = activeBoostPackages.length;
      if (
        targetPackage?.isActive &&
        !boostModalData.isActive &&
        activeBoostCount <= 1
      ) {
        toast('Hệ thống cần tối thiểu 1 gói boost đang mở', 'error');
        return;
      }
    } else {
      if (!boostModalData.isActive && activeBoostPackages.length === 0) {
        toast('Hệ thống cần tối thiểu 1 gói boost đang mở', 'error');
        return;
      }
    }

    try {
      if (isEditing) {
        await updatePaymentPackageMutation.mutateAsync({
          id: boostModalData.id,
          payload: {
            orderType: 'BOOST_JOB',
            name: `Gói đẩy tin ${durationDays} ngày`,
            durationDays,
            price,
            isActive: Boolean(boostModalData.isActive),
          },
        });
        toast('Cập nhật gói đẩy tin thành công', 'success');
      } else {
        await createPaymentPackageMutation.mutateAsync({
          orderType: 'BOOST_JOB',
          name: `Gói đẩy tin ${durationDays} ngày`,
          durationDays,
          price,
          isActive: Boolean(boostModalData.isActive),
        });
        toast('Tạo gói đẩy tin thành công', 'success');
      }
      setBoostModalOpen(false);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể lưu gói đẩy tin';
      toast(Array.isArray(message) ? message.join(', ') : message, 'error');
    }
  };

  const handleQuickToggleBoostPackage = async (
    pkg,
    payload,
    successMessage,
  ) => {
    const nextIsActive =
      typeof payload?.isActive === 'boolean'
        ? payload.isActive
        : Boolean(pkg?.isActive);
    if (pkg?.isActive && !nextIsActive && activeBoostPackages.length <= 1) {
      toast('Hệ thống cần tối thiểu 1 gói boost đang mở', 'error');
      return;
    }

    try {
      await updatePaymentPackageMutation.mutateAsync({
        id: pkg.id,
        payload,
      });
      toast(successMessage, 'success');
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể cập nhật gói đẩy tin';
      toast(Array.isArray(message) ? message.join(', ') : message, 'error');
    }
  };

  return (
    <DashboardLayout
      title={headers[active]?.title || 'Quản trị hệ thống'}
      subtitle={headers[active]?.subtitle}
      menu={menu}
      activeKey={active}
      onSelect={setActive}
      topbarBell={<NotificationBellPopover />}
    >
      {active === 'overview' && (loadingStats ? renderOverviewLoading() : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {kpi.map((item) => (
              <Card key={item.label} className="p-5">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold mt-2">{item.value}</p>
              </Card>
            ))}
          </div>
          <div className="grid lg:grid-cols-1 gap-6">
            <Card className="p-6 lg:col-span-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-semibold">
                  Phân tích tăng trưởng theo tháng
                </h3>
                <div className="flex items-center gap-2 text-sm font-medium">
                  Năm:
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) =>
                      setSelectedYear(
                        Number(e.target.value) || new Date().getFullYear(),
                      )
                    }
                    className="border border-slate-300 focus:outline-blue-500 rounded-md px-3 py-1.5 w-24 text-center font-bold"
                    placeholder="2026"
                    min="2000"
                    max="2100"
                  />
                </div>
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>{' '}
                    Biểu đồ người dùng mới
                  </div>
                  <div className="h-64 rounded-xl bg-slate-50 border border-slate-100 p-2 pt-6">
                    {renderUsersChart()}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>{' '}
                    Biểu đồ doanh thu (VNĐ)
                  </div>
                  <div className="h-64 rounded-xl bg-slate-50 border border-slate-100 p-2 pt-6">
                    {renderRevenueChart()}
                  </div>
                </div>
              </div>
            </Card>

            {/* <Card className="p-6 lg:col-span-1 border-primary/15 bg-gradient-to-br from-white to-slate-50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Gói thanh toán</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Quản lý mức giá gói đẩy tin và trạng thái áp dụng.
                  </p>
                </div>
                <Button onClick={() => setActive('payment_packages')} className="rounded-xl">
                  Mở quản lý gói
                </Button>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mt-5">
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-xs text-muted-foreground">Tổng gói</p>
                  <p className="text-2xl font-bold mt-1">{paymentPackages.length}</p>
                </div>
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-xs text-muted-foreground">Đang hoạt động</p>
                  <p className="text-2xl font-bold mt-1 text-emerald-600">
                    {activePaymentPackages.length}
                  </p>
                </div>
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-xs text-muted-foreground">Gói mặc định</p>
                  <p className="text-2xl font-bold mt-1 text-primary">
                    {paymentPackages.filter((pkg) => pkg.isDefault).length}
                  </p>
                </div>
              </div>
            </Card> */}

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="p-6 w-full lg:col-span-3">
                <h3 className="text-lg font-semibold mb-4">
                  Biến động hệ thống
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800">
                        Người dùng mới (7 ngày)
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Lượng tài khoản mới ghi nhận
                      </span>
                    </div>
                    <span className="font-bold text-2xl text-emerald-600">
                      +{statsData?.users?.newUsers7Days || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-orange-50 p-5 rounded-xl border border-orange-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-orange-800">
                        Công ty đang đợi xét duyệt
                      </span>
                      <span className="text-xs text-orange-600 mt-1">
                        Cần kiểm tra hồ sơ và mở tài khoản
                      </span>
                    </div>
                    <span className="font-bold text-2xl text-orange-600">
                      {statsData?.companies?.pending || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-rose-50 p-5 rounded-xl border border-rose-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-rose-800">
                        Báo cáo vi phạm việc làm
                      </span>
                      <span className="text-xs text-rose-600 mt-1">
                        Các tin tuyển dụng chờ xem xét vi phạm
                      </span>
                    </div>
                    <span className="font-bold text-2xl text-rose-600">
                      {statsData?.reports?.unresolved || 0}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ))}

      {active === 'payment_packages' &&
        (loadingStats || !paymentPackagesRes ? (
          renderPaymentLoading()
        ) : (
          <div className="space-y-6">
          {/* Section 1: Pricing Configuration */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <CreditCard className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Cấu hình giá dịch vụ
                </h3>
              </div>
            </div>

            <div className="grid md:grid-cols-1 gap-4">
              <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Đăng tin tuyển dụng
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Số điểm cho mỗi lần đăng tin.
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <Briefcase className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
                <div className="pt-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="50,000"
                    value={pointPricingForm.JOB_POST_POINT_COST}
                    onChange={(e) =>
                      setPointPricingForm((prev) => ({
                        ...prev,
                        JOB_POST_POINT_COST: formatCommaNumber(e.target.value),
                      }))
                    }
                    className="font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      AI Gợi ý Ứng viên
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Số điểm cho mỗi ứng viên được mời.
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div className="pt-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="1,000"
                    value={pointPricingForm.AI_INVITE_POINT_COST_PER_WORKER}
                    onChange={(e) =>
                      setPointPricingForm((prev) => ({
                        ...prev,
                        AI_INVITE_POINT_COST_PER_WORKER: formatCommaNumber(
                          e.target.value,
                        ),
                      }))
                    }
                    className="font-semibold text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSavePointPricing}
                disabled={updatePointPricingMutation.isPending}
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                {updatePointPricingMutation.isPending ? 'Đang lưu...' : 'Lưu '}
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-200" />

          {/* Section 3: Boost Packages */}
          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <Zap className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Gói đẩy tin tuyển dụng
                  </h3>
                </div>
              </div>
              <Button
                size="sm"
                className="rounded-xl gap-2 shadow-sm"
                onClick={() => handleOpenBoostModal()}
              >
                <Plus className="h-4 w-4" />
                Thêm gói mới
              </Button>
            </div>

            {/* Packages List */}
            {boostPackages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <Zap className="h-6 w-6 text-slate-400" />
                  </div>
                </div>
                <p className="font-semibold text-slate-600">Chưa có gói</p>
                <p className="text-sm text-slate-500 mt-1">
                  Hãy tạo gói mới để bắt đầu sử dụng dịch vụ này.
                </p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                {boostPackages.map((pkg) => {
                  const isOnlyActivePackage =
                    pkg.isActive && activeBoostPackages.length <= 1;
                  const pointPerDay =
                    Number(pkg.durationDays || 0) > 0
                      ? Math.round(
                          Number(pkg.price || 0) /
                            Number(pkg.durationDays || 1),
                        )
                      : 0;
                  return (
                    <div
                      key={pkg.id}
                      className="rounded-xl border border-slate-200 bg-white hover:border-amber-200 hover:shadow-md transition-all p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-slate-900">
                              {pkg.durationDays} Ngày
                            </span>
                            <Badge
                              variant={pkg.isActive ? 'default' : 'secondary'}
                              className={
                                pkg.isActive
                                  ? 'bg-emerald-500/10 text-emerald-600 border-0 hover:bg-emerald-500/10'
                                  : 'bg-slate-100 text-slate-500 border-0 hover:bg-slate-100'
                              }
                            >
                              {pkg.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                            </Badge>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-amber-600">
                              {Number(pkg.price || 0).toLocaleString('vi-VN')}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              điểm
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">
                            ~{pointPerDay.toLocaleString('vi-VN')} điểm/ngày
                          </p>
                        </div>
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-amber-50">
                          <Zap className="h-5 w-5 text-amber-600" />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenBoostModal(pkg)}
                          className="flex-1 rounded-lg"
                        >
                          Chỉnh sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleQuickToggleBoostPackage(
                              pkg,
                              { isActive: !pkg.isActive },
                              pkg.isActive
                                ? 'Đã tạm ngưng gói'
                                : 'Đã mở lại gói',
                            )
                          }
                          disabled={
                            updatePaymentPackageMutation.isPending ||
                            isOnlyActivePackage
                          }
                          title={
                            isOnlyActivePackage
                              ? 'Cần giữ tối thiểu 1 gói boost đang mở'
                              : undefined
                          }
                          className="flex-1 rounded-lg"
                        >
                          {pkg.isActive ? 'Tạm dừng' : 'Mở lại'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}

      {active === 'users' && (isLoadingUsers ? renderUsersLoading() : (
        <div className="space-y-6">
          <Card className="p-4 flex flex-wrap gap-3 items-center">
            <select
              className="rounded-full border px-4 py-2 text-sm bg-white outline-none"
              value={userFiltersInput.role}
              onChange={(e) =>
                setUserFiltersInput({
                  ...userFiltersInput,
                  role: e.target.value,
                })
              }
            >
              <option value="">Vai trò</option>
              <option value="WORKER">Người lao động</option>
              <option value="EMPLOYER">Nhà tuyển dụng</option>
              <option value="MANAGER">Quản lý</option>
            </select>
            <select
              className="rounded-full border px-4 py-2 text-sm bg-white outline-none"
              value={userFiltersInput.status}
              onChange={(e) =>
                setUserFiltersInput({
                  ...userFiltersInput,
                  status: e.target.value,
                })
              }
            >
              <option value="">Trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="DELETED">Đã vô hiệu</option>
            </select>
            <Input
              type="date"
              className="max-w-45 rounded-full"
              value={userFiltersInput.fromDate}
              onChange={(e) =>
                setUserFiltersInput({
                  ...userFiltersInput,
                  fromDate: e.target.value,
                })
              }
            />
            <Input
              type="date"
              className="max-w-45 rounded-full"
              value={userFiltersInput.toDate}
              onChange={(e) =>
                setUserFiltersInput({
                  ...userFiltersInput,
                  toDate: e.target.value,
                })
              }
            />
            <Button
              className="rounded-full px-6"
              onClick={() => {
                const newFilters = { ...userFiltersInput, page: 1 };
                setUserFilters(newFilters);
                setUserFiltersInput(newFilters);
              }}
            >
              Lọc
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-6"
              onClick={() => {
                setUserFiltersInput(initialUserFilters);
                setUserFilters(initialUserFilters);
              }}
            >
              Làm mới bộ lọc
            </Button>
          </Card>

          {usersList.length === 0 ? (
            <EmptyState
              title={MSG.MSG_USER_LIST_EMPTY || 'Danh sách trống'}
              description="Danh sách người dùng đang trống hoặc không có kết quả phù hợp."
            />
          ) : (
            <Card className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr className="border-b">
                      <th className="py-2 font-medium">Họ tên</th>
                      <th className="font-medium">Email</th>
                      <th className="font-medium">Vai trò</th>
                      <th className="font-medium">Trạng thái</th>
                      <th className="font-medium">Ngày tạo</th>
                      <th className="font-medium">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b last:border-b-0 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-3 font-semibold text-slate-800">
                          {user.name}
                        </td>
                        <td className="text-slate-600">{user.email}</td>
                        <td className="capitalize text-slate-600">
                          {user.role?.toLowerCase() || ''}
                        </td>
                        <td>
                          <Badge
                            variant={
                              user.status === 'ACTIVE' ? 'default' : 'secondary'
                            }
                            className={
                              user.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                            }
                          >
                            {user.status === 'ACTIVE'
                              ? 'Đang hoạt động'
                              : 'Đã vô hiệu hóa'}
                          </Badge>
                        </td>
                        <td className="text-slate-600">
                          {user.createdDate
                            ? new Date(user.createdDate).toLocaleDateString()
                            : ''}
                        </td>
                        <td>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full shadow-sm"
                            onClick={() => {
                              setUserStatusToUpdate({
                                id: user.id,
                                name: user.name,
                                status:
                                  user.status === 'ACTIVE'
                                    ? 'DELETED'
                                    : 'ACTIVE',
                              });
                              setConfirmOpen(true);
                            }}
                          >
                            {user.status === 'ACTIVE'
                              ? 'Vô hiệu hóa'
                              : 'Kích hoạt lại'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <AppPagination
                page={userFilters.page}
                totalPage={totalPages}
                onPageChange={(page) => {
                  setUserFilters({ ...userFilters, page });
                  setUserFiltersInput({ ...userFiltersInput, page });
                }}
              />
            </Card>
          )}
        </div>
      ))}

      {active === 'sectors' && (loadingSectors ? renderTableLoading() : (
        <div className="space-y-6">
          <div className="flex items-center justify-end">
            <Button
              className="rounded-xl"
              onClick={() => {
                setSectorModal(true);
                setEditSector(null);
                setSectorName('');
              }}
            >
              Tạo ngành nghề
            </Button>
          </div>
          <Card className="p-4">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Sector name</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sectorsTableRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-6 text-muted-foreground"
                    >
                      Không có ngành nghề
                    </td>
                  </tr>
                ) : (
                  sectorsTableRows.map((sector) => (
                    <tr key={sector.id} className="border-b last:border-b-0">
                      <td className="py-3 font-semibold">{sector.name}</td>
                      <td>{new Date(sector.createdAt).toLocaleDateString()}</td>
                      <td className="flex gap-2 py-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => {
                            setEditSector(sector);
                            setSectorName(sector.name);
                            setSectorModal(true);
                          }}
                        >
                          Sửa
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setSectorToDelete(sector)}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <AppPagination
              page={sectorPage}
              totalPage={sectorsTableTotalPages}
              onPageChange={setSectorPage}
            />
          </Card>
        </div>
      ))}

      {active === 'occupations' && (loadingOccupations ? renderTableLoading() : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Input
                type="search"
                placeholder="Tìm theo tên nghề hoặc ngành..."
                value={occupationSearch}
                onChange={(e) => setOccupationSearch(e.target.value)}
                className="rounded-xl shadow-sm bg-white sm:w-64"
              />
              <select
                className="rounded-xl border px-4 py-2 text-sm bg-white h-10"
                value={filterSectorId}
                onChange={(e) => setFilterSectorId(e.target.value)}
              >
                <option value="">Tất cả ngành nghề</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
              <Button
                className="rounded-xl"
                onClick={() => {
                  setOccupationModal(true);
                  setEditOccupation(null);
                  setOccupationName('');
                  setSelectedSectorId(filterSectorId || '');
                }}
              >
                Tạo nghề nghiệp
              </Button>
            </div>
          </div>
          <Card className="p-4">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Tên nghề nghiệp</th>
                  <th>Ngành nghề (Sector)</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredOccupations.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-6 text-muted-foreground"
                    >
                      {occupations.length === 0
                        ? 'Không có nghề nghiệp'
                        : 'Không tìm thấy nghề nghiệp phù hợp'}
                    </td>
                  </tr>
                ) : (
                  paginatedOccupations.map((occ) => {
                    const sector = sectors.find(
                      (s) => s.id == (occ.sectorId || occ.sector?.id),
                    ) || { name: 'Unknown' };
                    return (
                      <tr key={occ.id} className="border-b last:border-b-0">
                        <td className="py-3 font-semibold">{occ.name}</td>
                        <td>
                          <Badge variant="outline">{sector.name}</Badge>
                        </td>
                        <td className="flex gap-2 py-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => {
                              setEditOccupation(occ);
                              setOccupationName(occ.name);
                              setSelectedSectorId(
                                String(occ.sectorId || occ.sector?.id || ''),
                              );
                              setOccupationModal(true);
                            }}
                          >
                            Sửa
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-full"
                            onClick={() => setOccupationToDelete(occ)}
                          >
                            Xóa
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <AppPagination
              page={occupationPage}
              totalPage={occupationTotalPages}
              onPageChange={setOccupationPage}
            />
          </Card>
        </div>
      ))}

      {active === 'ai_configs' && (loadingConfigs ? renderAiConfigsLoading() : (
        <div className="space-y-6">
          <div className="flex items-center justify-end">
            <Button
              className="rounded-xl px-6"
              onClick={() => {
                if (totalAiWeight !== 100) {
                  toast('Tổng trọng số phải chuẩn bằng 100%', 'error');
                  return;
                }
                const payload = Object.entries(aiConfigs).map(([key, val]) => ({
                  key,
                  value: Number(val) / 100,
                }));
                updateConfigsMutation.mutate(payload);
              }}
              disabled={updateConfigsMutation.isPending}
            >
              {updateConfigsMutation.isPending ? 'Đang lưu...' : 'Lưu cấu hình'}
            </Button>
          </div>

          <Card className="p-8 shadow-sm rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
                {Object.keys(aiConfigs).map((key) => (
                  <div
                    key={key}
                    className={`space-y-3 ${key === 'MIN_SCORE_THRESHOLD' ? 'col-span-full border-t pt-6 mt-2' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700">
                        {aiLabels[key] || key}
                        {/* {key === 'MIN_SCORE_THRESHOLD' && (
                          <span className="block text-xs text-muted-foreground font-normal mt-1">
                            Độ phù hợp từ ngưỡng này trở lên mới được xem là phù
                            hợp.
                          </span>
                        )} */}
                      </span>
                      <span className="text-primary font-bold text-lg">
                        {aiConfigs[key]}%
                      </span>
                    </div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      className="w-full"
                      min="0"
                      max="100"
                      value={aiConfigs[key]}
                      onChange={(e) =>
                        setAiConfigs({
                          ...aiConfigs,
                          [key]:
                            e.target.value === '' ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              <div
                className={`mt-12 p-6 border rounded-xl flex items-center justify-between transition-colors ${totalAiWeight === 100 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}
              >
                <span className="font-semibold text-slate-800 text-lg">
                  Tổng trọng số:
                </span>
                <span
                  className={`text-3xl font-bold ${totalAiWeight === 100 ? 'text-emerald-600' : 'text-rose-600'}`}
                >
                  {totalAiWeight}%
                </span>
              </div>
              {totalAiWeight !== 100 && (
                <p className="text-rose-500 text-sm mt-3 animate-pulse">
                  * Tổng các trọng số hiện tại là {totalAiWeight}%. Vui lòng
                  điều chỉnh lại cho tròn 100% để bộ học hoạt động tốt.
                </p>
              )}
            </Card>
        </div>
      ))}

      {active === 'terms' && (isTermsLoading ? renderTableLoading() : (
        <div className="space-y-6">
          <Card className="p-6 rounded-xl shadow-sm">
            {termsEditMode ? (
              <div className="space-y-4">
                <Input
                  className="text-lg font-medium p-4 h-14 rounded-xl"
                  placeholder="Tiêu đề"
                  value={termsDraft.title}
                  onChange={(e) =>
                    setTermsDraft({ ...termsDraft, title: e.target.value })
                  }
                />
                <textarea
                  className="w-full min-h-125 rounded-xl border p-6 text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono shadow-sm bg-slate-50/50"
                  placeholder="Nội dung điều khoản..."
                  value={termsDraft.content}
                  onChange={(e) =>
                    setTermsDraft({ ...termsDraft, content: e.target.value })
                  }
                />
                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    className="rounded-xl px-6"
                    onClick={() => {
                      setTermsDraft(termsSaved);
                      setTermsEditMode(false);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button className="rounded-xl px-8" onClick={handleSaveTerms}>
                    Lưu thay đổi
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full space-y-4">
                <div className="flex-1 bg-slate-50/50 rounded-2xl border p-8 shadow-sm">
                  <h4 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-4">
                    {termsSaved.title || 'Chưa có tiêu đề'}
                  </h4>
                  <div className="min-h-100 text-base text-slate-700 whitespace-pre-wrap leading-loose">
                    {termsSaved.content || 'Chưa có nội dung'}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="lg"
                    className="rounded-xl px-8 mt-2 shadow-sm"
                    onClick={() => {
                      setTermsDraft(termsSaved);
                      setTermsEditMode(true);
                    }}
                  >
                    Chỉnh sửa điều khoản
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      ))}

      <Modal
        open={confirmOpen}
        title="Xác nhận thay đổi"
        description={`Bạn chắc chắn muốn ${userStatusToUpdate?.status === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản của ${userStatusToUpdate?.name || 'người dùng này'}?`}
        onClose={() => {
          setConfirmOpen(false);
          setUserStatusToUpdate(null);
        }}
        onConfirm={async () => {
          if (!userStatusToUpdate) return;
          try {
            await updateUserStatusMutation.mutateAsync({
              userId: userStatusToUpdate.id,
              status: userStatusToUpdate.status,
            });
            toast(
              `Đã ${userStatusToUpdate.status === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản thành công`,
            );
            setConfirmOpen(false);
            setUserStatusToUpdate(null);
          } catch (error) {
            toast('Lỗi khi cập nhật trạng thái', 'error');
          }
        }}
        confirmLabel={
          updateUserStatusMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'
        }
        confirmDisabled={updateUserStatusMutation.isPending}
      />

      <Modal
        open={sectorModal}
        title={editSector ? 'Cập nhật ngành nghề' : 'Tạo ngành nghề'}
        description="Nhập tên ngành nghề"
        onClose={() => {
          setSectorModal(false);
          setEditSector(null);
          setSectorName('');
        }}
        onConfirm={() => {
          if (editSector) {
            updateSector();
          } else {
            createSector();
          }
        }}
        confirmLabel="Lưu"
      >
        <Input
          placeholder="Tên ngành nghề"
          value={sectorName}
          onChange={(e) => setSectorName(e.target.value)}
          className="rounded-xl"
        />
      </Modal>

      <Modal
        open={!!sectorToDelete}
        title="Xóa ngành nghề"
        description="Bạn chắc chắn muốn xóa ngành nghề này?"
        onClose={() => setSectorToDelete(null)}
        onConfirm={deleteSector}
        confirmLabel="Xóa"
        tone="danger"
      />

      <Modal
        open={occupationModal}
        title={editOccupation ? 'Cập nhật nghề nghiệp' : 'Tạo nghề nghiệp'}
        description="Nhập tên nghề nghiệp và chọn ngành nghề tương ứng."
        onClose={() => {
          setOccupationModal(false);
          setEditOccupation(null);
          setOccupationName('');
          setSelectedSectorId('');
        }}
        onConfirm={() => {
          if (editOccupation) {
            updateOccupation();
          } else {
            createOccupation();
          }
        }}
        confirmLabel="Lưu"
      >
        <div className="space-y-4 pt-2">
          <select
            className="w-full rounded-xl border px-4 py-2 text-sm bg-white"
            value={selectedSectorId}
            onChange={(e) => setSelectedSectorId(e.target.value)}
          >
            <option value="">-- Chọn ngành nghề --</option>
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>
          <Input
            placeholder="Tên nghề nghiệp"
            value={occupationName}
            onChange={(e) => setOccupationName(e.target.value)}
            className="rounded-xl"
          />
        </div>
      </Modal>

      <Modal
        open={!!occupationToDelete}
        title="Xóa nghề nghiệp"
        description={`Bạn chắc chắn muốn xóa nghề nghiệp "${occupationToDelete?.name}"? Hành động này không thể hoàn tác.`}
        onClose={() => setOccupationToDelete(null)}
        onConfirm={deleteOccupation}
        confirmLabel="Xóa"
        tone="danger"
      />
      <Modal
        open={boostModalOpen}
        title={
          boostModalData.id ? 'Cập nhật gói đẩy tin' : 'Thêm gói đẩy tin mới'
        }
        description="Thiết lập thời gian và giá điểm cho gói đẩy tin tuyển dụng."
        onClose={() => setBoostModalOpen(false)}
        onConfirm={handleConfirmBoostPackage}
        confirmLabel={
          createPaymentPackageMutation.isPending ||
          updatePaymentPackageMutation.isPending
            ? 'Đang lưu...'
            : 'Xác nhận'
        }
        confirmDisabled={
          createPaymentPackageMutation.isPending ||
          updatePaymentPackageMutation.isPending
        }
      >
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Số ngày có hiệu lực
              </label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="VD: 7"
                value={boostModalData.durationDays}
                onChange={(e) =>
                  setBoostModalData((prev) => ({
                    ...prev,
                    durationDays: String(e.target.value || '').replace(
                      /\D/g,
                      '',
                    ),
                  }))
                }
                className="rounded-xl font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Giá (Điểm)
              </label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="VD: 50,000"
                value={boostModalData.price}
                onChange={(e) =>
                  setBoostModalData((prev) => ({
                    ...prev,
                    price: formatCommaNumber(e.target.value),
                  }))
                }
                className="rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Trạng thái áp dụng
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={boostModalData.isActive ? 'true' : 'false'}
              onChange={(e) =>
                setBoostModalData((prev) => ({
                  ...prev,
                  isActive: e.target.value === 'true',
                }))
              }
            >
              <option value="true">Hoạt động </option>
              <option value="false">Tạm ngưng</option>
            </select>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

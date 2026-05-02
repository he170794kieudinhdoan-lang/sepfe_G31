import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  getTermsCondition,
  updateTermsCondition,
} from '@/features/terms/api/termsApi';
import { Button } from '@/components/ui/button';
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
  const occupationRowsPerPage =10;

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

  const { data: paymentPackagesRes } = usePaymentPackages({ includeInactive: true });
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
  const [boostPackageForm, setBoostPackageForm] = useState({
    name: '',
    durationDays: '7',
    price: '50,000',
    description: '',
    isDefault: false,
    isActive: true,
  });
  const [editingBoostPackageId, setEditingBoostPackageId] = useState(null);
  const [editingBoostPackageForm, setEditingBoostPackageForm] = useState({
    name: '',
    durationDays: '7',
    price: '50,000',
    description: '',
    isDefault: false,
    isActive: true,
  });

  const kpi = [
    { label: 'Tổng số người dùng trên hệ thống', value: statsData?.users?.total || 0 },
    { label: 'Tổng số doanh nghiệp trên hệ thống', value: statsData?.companies?.total || 0 },
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

  const isLoading = false;

  const menu = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'payment_packages', label: 'Thiết lập thanh toán' },
    { key: 'users', label: 'Quản lý người dùng' },
    { key: 'sectors', label: 'Quản lý ngành nghề' },
    { key: 'occupations', label: 'Quản lý nghề nghiệp' },
    { key: 'terms', label: 'Điều khoản sử dụng' },
    { key: 'ai_configs', label: 'Thiết lập trọng số AI' },
  ];

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
      return String(sector?.name || '').toLowerCase().includes(q);
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

  const resetBoostPackageForm = () => {
    setBoostPackageForm({
      name: '',
      durationDays: '7',
      price: '50,000',
      description: '',
      isDefault: false,
      isActive: true,
    });
  };

  const handleCreateBoostPackage = async () => {
    const durationDays = Number(
      String(boostPackageForm.durationDays || '').replace(/\D/g, ''),
    );
    const price = parseCommaNumber(boostPackageForm.price);
    if (!Number.isFinite(durationDays) || durationDays < 1) {
      toast('Số ngày của gói phải từ 1 ngày trở lên', 'error');
      return;
    }
    if (!Number.isFinite(price) || price < 1000) {
      toast('Giá gói đẩy tin phải từ 1.000 điểm trở lên', 'error');
      return;
    }

    const normalizedName = (boostPackageForm.name || '').trim();

    try {
      await createPaymentPackageMutation.mutateAsync({
        orderType: 'BOOST_JOB',
        name: normalizedName || `Gói đẩy tin ${durationDays} ngày`,
        description: boostPackageForm.description?.trim() || undefined,
        durationDays,
        price,
        isDefault: Boolean(boostPackageForm.isDefault),
        isActive: Boolean(boostPackageForm.isActive),
      });
      toast('Tạo gói đẩy tin thành công', 'success');
      resetBoostPackageForm();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tạo gói đẩy tin';
      toast(Array.isArray(message) ? message.join(', ') : message, 'error');
    }
  };

  const handleStartEditBoostPackage = (pkg) => {
    setEditingBoostPackageId(pkg.id);
    setEditingBoostPackageForm({
      name: pkg.name || '',
      durationDays: String(Number(pkg.durationDays || 7)),
      price: toCurrencyInput(pkg.price || 50000),
      description: pkg.description || '',
      isDefault: Boolean(pkg.isDefault),
      isActive: Boolean(pkg.isActive),
    });
  };

  const handleSaveEditBoostPackage = async () => {
    if (!editingBoostPackageId) return;

    const durationDays = Number(
      String(editingBoostPackageForm.durationDays || '').replace(/\D/g, ''),
    );
    const price = parseCommaNumber(editingBoostPackageForm.price);
    if (!Number.isFinite(durationDays) || durationDays < 1) {
      toast('Số ngày của gói phải từ 1 ngày trở lên', 'error');
      return;
    }
    if (!Number.isFinite(price) || price < 1000) {
      toast('Giá gói đẩy tin phải từ 1.000 điểm trở lên', 'error');
      return;
    }

    try {
      await updatePaymentPackageMutation.mutateAsync({
        id: editingBoostPackageId,
        payload: {
          orderType: 'BOOST_JOB',
          name:
            editingBoostPackageForm.name?.trim() ||
            `Gói đẩy tin ${durationDays} ngày`,
          description: editingBoostPackageForm.description?.trim() || '',
          durationDays,
          price,
          isDefault: Boolean(editingBoostPackageForm.isDefault),
          isActive: Boolean(editingBoostPackageForm.isActive),
        },
      });
      toast('Cập nhật gói đẩy tin thành công', 'success');
      setEditingBoostPackageId(null);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể cập nhật gói đẩy tin';
      toast(Array.isArray(message) ? message.join(', ') : message, 'error');
    }
  };

  const handleQuickToggleBoostPackage = async (pkg, payload, successMessage) => {
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

  console.log(configsData);

  return (
    <DashboardLayout
      title="Trang quản trị hệ thống"
      menu={menu}
      activeKey={active}
      onSelect={setActive}
      topbarBell={<NotificationBellPopover />}
    >
      {active === 'overview' && (
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
                <h3 className="text-lg font-semibold">Phân tích tăng trưởng theo tháng</h3>
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
      )}

      {active === 'payment_packages' && (
        <div className="space-y-6">
          <Card className="p-6 border-primary/20 bg-linear-to-br from-amber-50/40 to-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Thiết lập mức điểm</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Cập nhật nhanh mức điểm phải trả cho các thao tác chính của nhà tuyển dụng.
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                1.000đ = 1.000 điểm
              </Badge>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
              <p className="text-sm font-semibold text-slate-800">Đăng tin tuyển dụng</p>
              <p className="text-xs text-slate-500">Số điểm trừ cho mỗi lần đăng tin.</p>
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
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
              <p className="text-sm font-semibold text-slate-800">Đẩy tin tuyển dụng</p>
              <p className="text-xs text-slate-500">Mức điểm mặc định khi chưa chọn gói đẩy tin.</p>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="50,000"
                value={pointPricingForm.BOOST_JOB_POINT_COST}
                onChange={(e) =>
                  setPointPricingForm((prev) => ({
                    ...prev,
                    BOOST_JOB_POINT_COST: formatCommaNumber(e.target.value),
                  }))
                }
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
              <p className="text-sm font-semibold text-slate-800">Thời gian đẩy tin</p>
              <p className="text-xs text-slate-500">Số ngày mặc định khi chưa có gói phù hợp.</p>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="7"
                value={pointPricingForm.BOOST_JOB_DURATION_DAYS}
                onChange={(e) =>
                  setPointPricingForm((prev) => ({
                    ...prev,
                    BOOST_JOB_DURATION_DAYS: String(e.target.value || '').replace(/\D/g, ''),
                  }))
                }
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
              <p className="text-sm font-semibold text-slate-800">AI gợi ý ứng viên</p>
              <p className="text-xs text-slate-500">Số điểm trừ cho mỗi ứng viên được mời.</p>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="1,000"
                value={pointPricingForm.AI_INVITE_POINT_COST_PER_WORKER}
                onChange={(e) =>
                  setPointPricingForm((prev) => ({
                    ...prev,
                    AI_INVITE_POINT_COST_PER_WORKER: formatCommaNumber(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSavePointPricing}
              disabled={updatePointPricingMutation.isPending}
            >
              {updatePointPricingMutation.isPending
                ? 'Đang lưu...'
                : 'Lưu thiết lập điểm'}
            </Button>
          </div>

          <Card className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Gói đẩy tin tuyển dụng</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tạo nhiều gói theo số ngày và mức điểm để nhà tuyển dụng dễ chọn.
                </p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {boostPackages.length} gói
              </Badge>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-800">Tạo gói đẩy tin mới</p>
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
                <Input
                  placeholder="Tên gói (ví dụ: Đẩy tin 7 ngày)"
                  value={boostPackageForm.name}
                  onChange={(e) =>
                    setBoostPackageForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Số ngày"
                  value={boostPackageForm.durationDays}
                  onChange={(e) =>
                    setBoostPackageForm((prev) => ({
                      ...prev,
                      durationDays: String(e.target.value || '').replace(/\D/g, ''),
                    }))
                  }
                />
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Giá điểm"
                  value={boostPackageForm.price}
                  onChange={(e) =>
                    setBoostPackageForm((prev) => ({
                      ...prev,
                      price: formatCommaNumber(e.target.value),
                    }))
                  }
                />
                <Input
                  placeholder="Mô tả ngắn"
                  value={boostPackageForm.description}
                  onChange={(e) =>
                    setBoostPackageForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-end">
                <Button
                  type="button"
                  variant={boostPackageForm.isDefault ? 'default' : 'outline'}
                  onClick={() =>
                    setBoostPackageForm((prev) => ({
                      ...prev,
                      isDefault: !prev.isDefault,
                    }))
                  }
                >
                  {boostPackageForm.isDefault ? 'Mặc định: Bật' : 'Đặt mặc định'}
                </Button>
                <Button
                  type="button"
                  variant={boostPackageForm.isActive ? 'default' : 'outline'}
                  onClick={() =>
                    setBoostPackageForm((prev) => ({
                      ...prev,
                      isActive: !prev.isActive,
                    }))
                  }
                >
                  {boostPackageForm.isActive
                    ? 'Trạng thái: Đang áp dụng'
                    : 'Trạng thái: Tạm ngưng'}
                </Button>
                <Button
                  onClick={handleCreateBoostPackage}
                  disabled={createPaymentPackageMutation.isPending}
                >
                  {createPaymentPackageMutation.isPending ? 'Đang tạo...' : 'Tạo gói mới'}
                </Button>
              </div>
            </div>

            {boostPackages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 text-center">
                Chưa có gói đẩy tin. Hãy tạo gói mới để bắt đầu sử dụng.
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4">
                {boostPackages.map((pkg) => {
                  const isEditing = editingBoostPackageId === pkg.id;
                  return (
                    <div key={pkg.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-slate-900">{pkg.name}</p>
                          <p className="text-sm text-slate-500 mt-1">
                            {Number(pkg.durationDays || 0)} ngày •{' '}
                            {Number(pkg.price || 0).toLocaleString('vi-VN')} điểm
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {pkg.isDefault && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">Mặc định</Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={pkg.isActive ? 'text-emerald-700 border-emerald-200 bg-emerald-50' : 'text-slate-600'}
                          >
                            {pkg.isActive ? 'Đang áp dụng' : 'Tạm ngưng'}
                          </Badge>
                        </div>
                      </div>

                      {pkg.description && (
                        <p className="text-xs text-slate-500">{pkg.description}</p>
                      )}

                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editingBoostPackageForm.name}
                            onChange={(e) =>
                              setEditingBoostPackageForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={editingBoostPackageForm.durationDays}
                              onChange={(e) =>
                                setEditingBoostPackageForm((prev) => ({
                                  ...prev,
                                  durationDays: String(e.target.value || '').replace(/\D/g, ''),
                                }))
                              }
                            />
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={editingBoostPackageForm.price}
                              onChange={(e) =>
                                setEditingBoostPackageForm((prev) => ({
                                  ...prev,
                                  price: formatCommaNumber(e.target.value),
                                }))
                              }
                            />
                          </div>
                          <Input
                            value={editingBoostPackageForm.description}
                            onChange={(e) =>
                              setEditingBoostPackageForm((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            placeholder="Mô tả"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant={editingBoostPackageForm.isDefault ? 'default' : 'outline'}
                              onClick={() =>
                                setEditingBoostPackageForm((prev) => ({
                                  ...prev,
                                  isDefault: !prev.isDefault,
                                }))
                              }
                            >
                              {editingBoostPackageForm.isDefault ? 'Mặc định: Bật' : 'Đặt mặc định'}
                            </Button>
                            <Button
                              size="sm"
                              variant={editingBoostPackageForm.isActive ? 'default' : 'outline'}
                              onClick={() =>
                                setEditingBoostPackageForm((prev) => ({
                                  ...prev,
                                  isActive: !prev.isActive,
                                }))
                              }
                            >
                              {editingBoostPackageForm.isActive ? 'Đang áp dụng' : 'Tạm ngưng'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingBoostPackageId(null)}
                            >
                              Hủy
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveEditBoostPackage}
                              disabled={updatePaymentPackageMutation.isPending}
                            >
                              Lưu
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => handleStartEditBoostPackage(pkg)}>
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
                            disabled={updatePaymentPackageMutation.isPending}
                          >
                            {pkg.isActive ? 'Tạm dừng' : 'Mở lại'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleQuickToggleBoostPackage(
                                pkg,
                                { isDefault: true },
                                'Đã cập nhật gói mặc định',
                              )
                            }
                            disabled={updatePaymentPackageMutation.isPending || pkg.isDefault}
                          >
                            Đặt mặc định
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>


        </div>
      )}

      {active === 'users' && (
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

          {isLoadingUsers ? (
            <Skeleton className="h-100 w-full rounded-2xl" />
          ) : usersList.length === 0 ? (
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
                                : ''
                            }
                          >
                            {user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã vô hiệu'}
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
                            {user.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt lại'}
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
      )}

      {active === 'sectors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Quản lý ngành nghề</h2>
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
                {loadingSectors ? (
                  <tr>
                    <td colSpan="3" className="text-center py-6">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ) : sectorsTableRows.length === 0 ? (
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
      )}

      {active === 'occupations' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold">Quản lý nghề nghiệp</h2>
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
                {loadingOccupations ? (
                  <tr>
                    <td colSpan="3" className="text-center py-6">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ) : filteredOccupations.length === 0 ? (
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
      )}

      {active === 'ai_configs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div></div>
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

          {loadingConfigs ? (
            <Skeleton className="h-100 w-full rounded-2xl" />
          ) : (
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
                      type="number"
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
          )}
        </div>
      )}

      {active === 'terms' && (
        <div className="space-y-6">
          <Card className="p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              Điều khoản & điều kiện
            </h3>
            {isTermsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-96 w-full" />
              </div>
            ) : termsEditMode ? (
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
      )}

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

    </DashboardLayout>
  );
};

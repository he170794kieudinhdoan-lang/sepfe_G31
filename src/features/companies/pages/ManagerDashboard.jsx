import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AppPagination } from '@/shared/components/AppPagination';
import { DashboardLayout } from '@/shared/components/Layout/DashboardLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/shared/components/Modal';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';
import parse from 'html-react-parser';
import {
  Building2,
  FileText,
  MapPin,
  Globe,
  Mail,
  Calendar,
  ExternalLink,
  Eye,
  CheckCircle,
  XCircle,
  Phone,
  User,
  Search,
  MessageSquare,
} from 'lucide-react';
import {
  useGetCompanies,
  useGetCompaniesById,
  useGetCompanyUpdateRequest,
  useGetPendingUpdateCompanies,
  useReviewCompany,
  useGetReviewReports,
  useUpdateReviewReportStatus,
  useHideCompanyReview,
} from '../api/useGetCompanies';
import {
  useGetAllJobReports,
  useUpdateJobReportStatus,
  useUpdateJobStatus,
} from '@/features/jobs/api/useJobs';
import { SupportTicketBoard } from '@/features/support/components/SupportTicketBoard';

// 1. Management Menu and Status Colors configuration
const MANAGEMENT_MENU = [
  { key: 'companies', label: 'Doanh nghiệp đăng ký' },
  { key: 'company_updates', label: 'Yêu cầu đổi thông tin' },
  { key: 'job_reports', label: 'Báo cáo việc làm' },
  { key: 'review_reports', label: 'Báo cáo đánh giá' },
  { key: 'support', label: 'Hỗ trợ khách hàng' },
];

const TAB_HEADERS = {
  companies: {
    title: 'Danh sách doanh nghiệp mới',
    subtitle: 'Giám sát hoạt động và xử lý hồ sơ đăng ký doanh nghiệp mới.',
  },
  company_updates: {
    title: 'Yêu cầu cập nhật thông tin',
    subtitle: 'Xem xét và phê duyệt các thay đổi thông tin từ doanh nghiệp.',
  },
  job_reports: {
    title: 'Báo cáo tin tuyển dụng',
    subtitle: 'Xử lý các báo cáo vi phạm liên quan đến tin đăng tuyển dụng.',
  },
  review_reports: {
    title: 'Báo cáo đánh giá',
    subtitle: 'Quản lý các phản hồi và báo cáo vi phạm trong phần đánh giá.',
  },
  support: {
    title: 'Xử lý yêu cầu trợ giúp',
    subtitle: 'Giải đáp thắc mắc và hỗ trợ người dùng hệ thống.',
  },
};

const STATUS_COLORS = {
  APPROVED: {
    label: 'Hợp lệ',
    color: 'bg-green-50 text-green-700 border-green-100',
  },
  PENDING: {
    label: 'Chờ xử lý',
    color: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  REJECTED: {
    label: 'Từ chối',
    color: 'bg-red-50 text-red-700 border-red-100',
  },
  UPDATING: {
    label: 'Chờ duyệt hồ sơ mới',
    color: 'bg-orange-50 text-orange-700 border-orange-100',
  },
};

const REPORT_REASON_LABELS = {
  FRAUD: 'Lừa đảo, chiếm đoạt tài sản',
  INAPPROPRIATE_CONTENT: 'Nội dung phản cảm, không phù hợp',
  SCAM: 'Có dấu hiệu đa cấp, trục lợi',
  DUPLICATE: 'Tin tuyển dụng bị trùng lặp',
  MISLEADING_INFO: 'Thông tin công việc sai lệch, gây hiểu lầm',
  OTHER: 'Lý do khác',
};

const REPORT_STATUS_LABELS = {
  PENDING: 'Chờ xử lý',
  RESOLVED: 'Đã giải quyết',
  REJECTED: 'Đã từ chối',
};

const REPORT_STATUS_COLORS = {
  PENDING: 'bg-blue-50 text-blue-700 border-blue-100',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-100',
};

function formatManagerDateTime(value) {
  if (value == null || value === '') return '—';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function ReporterCell({ user }) {
  if (!user) return <span className="text-slate-400">—</span>;
  const name = user.fullName?.trim();
  if (name) {
    return (
      <div>
        <p className="font-medium text-slate-800 text-sm">{name}</p>
        {user.email ? (
          <p className="text-xs text-slate-400">{user.email}</p>
        ) : null}
      </div>
    );
  }
  return <span className="text-sm">{user.email || '—'}</span>;
}

export const ManagerDashboard = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const COMPANY_PAGE_SIZE = 10;

  // --- STATE MANAGEMENT ---
  const [currentTab, setCurrentTab] = useState('companies');
  const [viewingCompanyId, setViewingCompanyId] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [companyStatusFilter, setCompanyStatusFilter] = useState('ALL');
  const [companyFromDate, setCompanyFromDate] = useState('');
  const [companyToDate, setCompanyToDate] = useState('');
  const [companyPage, setCompanyPage] = useState(1);
  const [updatePage, setUpdatePage] = useState(1);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionReasonError, setRejectionReasonError] = useState('');

  const [reportStatus, setReportStatus] = useState('ALL');
  const [viewingReportId, setViewingReportId] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isApproveReportModalOpen, setIsApproveReportModalOpen] =
    useState(false);

  const [reportCompanyName, setReportCompanyName] = useState('');
  const [reportReporterName, setReportReporterName] = useState('');
  const [reportFromDate, setReportFromDate] = useState('');
  const [reportToDate, setReportToDate] = useState('');

  // Review reports (UC 2.14.6 / 2.14.7)
  const [reviewReportStatus, setReviewReportStatus] = useState('ALL');
  const [viewingReviewReportId, setViewingReviewReportId] = useState(null);
  const [isReviewReportModalOpen, setIsReviewReportModalOpen] = useState(false);
  const [isApproveReviewReportModalOpen, setIsApproveReviewReportModalOpen] =
    useState(false);

  const [reviewReportCompanyName, setReviewReportCompanyName] = useState('');
  const [reviewReportReporterName, setReviewReportReporterName] = useState('');
  const [reviewReportFromDate, setReviewReportFromDate] = useState('');
  const [reviewReportToDate, setReviewReportToDate] = useState('');

  // --- DATA FETCHING FROM API ---
  const { data: allCompanies = [], isLoading: isLoadingAll } =
    useGetCompanies();
  const { data: pendingUpdateCompanies = [] } = useGetPendingUpdateCompanies();
  const { data: companyDetails, isLoading: isLoadingDetails } =
    useGetCompaniesById(viewingCompanyId);
  const { data: companyUpdateRequest } =
    useGetCompanyUpdateRequest(viewingCompanyId);
  const reviewCompanyMutation = useReviewCompany();

  const { data: listReportsData = [], isLoading: loadingReports } =
    useGetAllJobReports(
      reportStatus,
      1,
      50,
      reportCompanyName,
      reportReporterName,
      reportFromDate,
      reportToDate,
    );
  const updateReportMutation = useUpdateJobReportStatus();
  const updateJobStatusMutation = useUpdateJobStatus();

  const { data: listReviewReportsData, isLoading: loadingReviewReports } =
    useGetReviewReports(
      reviewReportStatus === 'ALL' ? undefined : reviewReportStatus,
      1,
      50,
    );
  const updateReviewReportMutation = useUpdateReviewReportStatus();
  const hideReviewMutation = useHideCompanyReview();

  const companyIdFromUrl = searchParams.get('companyId');
  useEffect(() => {
    if (!companyIdFromUrl) return;
    const id = Number(companyIdFromUrl);
    if (Number.isNaN(id)) return;
    setViewingCompanyId(id);
    setCurrentTab('companies');
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('companyId');
        return next;
      },
      { replace: true },
    );
  }, [companyIdFromUrl, setSearchParams]);

  const tabFromUrl = searchParams.get('tab');
  useEffect(() => {
    if (!tabFromUrl) return;
    const allowed = new Set([
      'companies',
      'company_updates',
      'job_reports',
      'review_reports',
      'support',
    ]);
    if (!allowed.has(tabFromUrl)) return;
    setCurrentTab(tabFromUrl);
    setViewingCompanyId(null);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('tab');
        return next;
      },
      { replace: true },
    );
  }, [tabFromUrl, setSearchParams]);

  // Find the viewing report in the list
  const viewingReport = listReportsData?.data?.find(
    (r) => r.id === viewingReportId,
  );
  const viewingReviewReport = listReviewReportsData?.data?.find(
    (r) => r.id === viewingReviewReportId,
  );

  // Logic to select which list to display
  const isLoadingData = isLoadingAll;
  const sourceList = allCompanies;

  // Filter logic based on status + search keyword
  const filteredCompanies = sourceList
    .filter((item) => item.status !== 'UPDATING')
    .filter((item) =>
      companyStatusFilter === 'ALL'
        ? true
        : item.status === companyStatusFilter,
    )
    .filter((item) => {
      if (!companyFromDate && !companyToDate) return true;
      const createdAt = new Date(item.createdAt);
      if (Number.isNaN(createdAt.getTime())) return false;

      if (companyFromDate) {
        const from = new Date(`${companyFromDate}T00:00:00`);
        if (createdAt < from) return false;
      }
      if (companyToDate) {
        const to = new Date(`${companyToDate}T23:59:59`);
        if (createdAt > to) return false;
      }
      return true;
    })
    .filter((item) =>
      item.name.toLowerCase().includes(searchKeyword.toLowerCase()),
    );
  const companyTotalPages = Math.max(
    1,
    Math.ceil(filteredCompanies.length / COMPANY_PAGE_SIZE),
  );
  const displayList = filteredCompanies.slice(
    (companyPage - 1) * COMPANY_PAGE_SIZE,
    companyPage * COMPANY_PAGE_SIZE,
  );
  const updateQueue = pendingUpdateCompanies.filter(
    (item) => item.status === 'UPDATING',
  );
  const filteredUpdateQueue = updateQueue
    .filter((item) =>
      item.name.toLowerCase().includes(searchKeyword.toLowerCase()),
    )
    .filter((item) => {
      if (!companyFromDate && !companyToDate) return true;
      const createdAt = new Date(item.updatedAt || item.createdAt);
      if (Number.isNaN(createdAt.getTime())) return false;
      if (companyFromDate) {
        const from = new Date(`${companyFromDate}T00:00:00`);
        if (createdAt < from) return false;
      }
      if (companyToDate) {
        const to = new Date(`${companyToDate}T23:59:59`);
        if (createdAt > to) return false;
      }
      return true;
    });
  const updateTotalPages = Math.max(
    1,
    Math.ceil(filteredUpdateQueue.length / COMPANY_PAGE_SIZE),
  );
  const displayUpdateList = filteredUpdateQueue.slice(
    (updatePage - 1) * COMPANY_PAGE_SIZE,
    updatePage * COMPANY_PAGE_SIZE,
  );

  const comparisonFields = [
    { key: 'name', label: 'Tên công ty' },
    { key: 'taxCode', label: 'Mã số thuế' },
    { key: 'address', label: 'Địa chỉ' },
    { key: 'website', label: 'Website' },
    { key: 'logoUrl', label: 'Logo' },
    { key: 'businessLicenseUrl', label: 'Giấy phép kinh doanh' },
    { key: 'description', label: 'Giới thiệu công ty' },
  ];

  useEffect(() => {
    if (companyPage > companyTotalPages) {
      setCompanyPage(companyTotalPages);
    }
  }, [companyPage, companyTotalPages]);

  useEffect(() => {
    if (updatePage > updateTotalPages) {
      setUpdatePage(updateTotalPages);
    }
  }, [updatePage, updateTotalPages]);

  useEffect(() => {
    setCompanyPage(1);
    setUpdatePage(1);
  }, [searchKeyword, companyStatusFilter, companyFromDate, companyToDate]);

  // --- HANDLERS ---
  const handleReviewCompany = async (newStatus) => {
    if (newStatus === 'REJECTED' && !rejectionReason.trim()) {
      setRejectionReasonError('Vui lòng nhập lý do từ chối.');
      return;
    }
    setRejectionReasonError('');
    try {
      await reviewCompanyMutation.mutateAsync({
        id: viewingCompanyId,
        status: newStatus,
        rejectionReason: newStatus === 'REJECTED' ? rejectionReason.trim() : null,
      });

      if (companyDetails?.status === 'UPDATING') {
        toast(
          newStatus === 'APPROVED'
            ? 'Đã duyệt hồ sơ cập nhật'
            : 'Đã từ chối hồ sơ cập nhật',
        );
      } else {
        toast(
          newStatus === 'APPROVED'
            ? 'Đã duyệt hồ sơ doanh nghiệp'
            : 'Đã từ chối hồ sơ doanh nghiệp',
        );
      }

      // Reset state after completion
      setIsApproveModalOpen(false);
      setIsRejectModalOpen(false);
      setRejectionReason('');
      setRejectionReasonError('');
      setViewingCompanyId(null);
    } catch (error) {
      toast(MSG.MSG54, 'error');
    }
  };

  const handleReviewReport = async (status) => {
    try {
      await updateReportMutation.mutateAsync({
        id: viewingReportId,
        status: status,
      });

      toast('Đã cập nhật trạng thái báo cáo');
      setIsReportModalOpen(false);
      setViewingReportId(null);
    } catch (error) {
      toast('Có lỗi xảy ra khi cập nhật', 'error');
    }
  };

  const handleApproveReport = async () => {
    if (!viewingReport) return;
    try {
      if (viewingReport.job?.id) {
        await updateJobStatusMutation.mutateAsync({
          jobId: viewingReport.job.id,
          status: 'DELETED',
        });
      }
      await updateReportMutation.mutateAsync({
        id: viewingReportId,
        status: 'RESOLVED',
      });

      toast('Đã duyệt báo cáo và ẩn việc làm');
      setIsApproveReportModalOpen(false);
      setIsReportModalOpen(false);
      setViewingReportId(null);
    } catch (error) {
      toast('Có lỗi xảy ra khi duyệt báo cáo', 'error');
    }
  };

  // --- REVIEW REPORT HANDLERS (UC 2.14.6 / 2.14.7) ---
  const handleReviewReportReject = async () => {
    if (!viewingReviewReportId) return;
    try {
      await updateReviewReportMutation.mutateAsync({
        id: viewingReviewReportId,
        status: 'REJECTED',
      });
      toast('Đã từ chối báo cáo đánh giá');
      setIsReviewReportModalOpen(false);
      setViewingReviewReportId(null);
    } catch (error) {
      toast('Có lỗi xảy ra khi cập nhật báo cáo', 'error');
    }
  };

  const handleApproveReviewReport = async () => {
    if (!viewingReviewReport) return;
    try {
      if (viewingReviewReport.review?.id) {
        await hideReviewMutation.mutateAsync({
          reviewId: viewingReviewReport.review.id,
        });
      }
      await updateReviewReportMutation.mutateAsync({
        id: viewingReviewReportId,
        status: 'RESOLVED',
      });

      toast('Đã duyệt báo cáo và ẩn đánh giá');
      setIsApproveReviewReportModalOpen(false);
      setIsReviewReportModalOpen(false);
      setViewingReviewReportId(null);
    } catch (error) {
      toast('Có lỗi xảy ra khi duyệt báo cáo', 'error');
    }
  };

  // --- SKELETON LOADERS ---
  const renderTableSkeleton = () => (
    <div className="space-y-4">
      <Card className="p-3 flex flex-wrap gap-3 items-center border border-slate-200">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
        <div className="ml-auto">
          <Skeleton className="h-6 w-24" />
        </div>
      </Card>
      <Card className="rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </Card>
    </div>
  );

  const renderDetailsSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="h-10 w-24" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 rounded-xl border border-slate-200 shadow-sm bg-white">
            <div className="flex gap-6 items-start pb-6 border-b">
              <Skeleton className="h-20 w-20 rounded-lg" />
              <div className="flex-1 pt-1 space-y-3">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
              ))}
            </div>
            <Skeleton className="h-32 w-full mt-8 rounded-xl" />
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-6 rounded-xl border border-slate-200 shadow-sm bg-white">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  // ==========================================================
  // VIEW 1: COMPANY DETAILS (WHEN VIEWING)
  // ==========================================================
  const renderDetails = () => {
    if (isLoadingDetails) return renderDetailsSkeleton();

    if (!companyDetails) return null;

    const proposed = companyUpdateRequest?.proposed || null;
    const current = companyUpdateRequest?.current || companyDetails;
    const isUpdatingProfile =
      companyDetails.status === 'UPDATING' && !!proposed;

    const renderCompareValue = (value, key) => {
      if (!value) return <span className="text-slate-400">—</span>;
      if (key === 'logoUrl') {
        return (
          <a href={String(value)} target="_blank" rel="noreferrer">
            <img
              src={String(value)}
              alt="Logo"
              className="h-20 w-20 object-contain rounded-lg border border-slate-200 bg-slate-50 hover:opacity-80 transition-opacity"
            />
          </a>
        );
      }
      if (key === 'businessLicenseUrl') {
        return (
          <a href={String(value)} target="_blank" rel="noreferrer" className="block">
            <img
              src={String(value)}
              alt="Giấy phép kinh doanh"
              className="max-h-48 max-w-full object-contain rounded-lg border border-slate-200 bg-slate-50 hover:opacity-80 transition-opacity"
            />
            <span className="mt-1 text-xs text-blue-500 hover:underline block">Xem ảnh gốc</span>
          </a>
        );
      }
      if (key === 'website') {
        return (
          <a
            href={String(value)}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {String(value)}
          </a>
        );
      }
      if (key === 'description') {
        return (
          <div className="text-sm leading-relaxed">{parse(String(value))}</div>
        );
      }
      return <span>{String(value)}</span>;
    };

    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => setViewingCompanyId(null)}
          className="text-slate-600 hover:bg-primary-muted hover:text-primary-muted-foreground"
        >
          ← Trở về
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: GENERAL INFO */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 rounded-xl border border-slate-200 shadow-sm bg-white">
              <div className="flex gap-6 items-start pb-6 border-b border-slate-100">
                <div className="h-20 w-20 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0">
                  {companyDetails.logoUrl ? (
                    <img
                      src={companyDetails.logoUrl}
                      className="h-full w-full object-cover rounded-lg"
                      alt={companyDetails.name}
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-slate-800">
                      {companyDetails.name}
                    </h2>
                    <Badge
                      className={
                        STATUS_COLORS[companyDetails.status]?.color +
                        ' rounded-md'
                      }
                    >
                      {STATUS_COLORS[companyDetails.status]?.label}
                    </Badge>
                  </div>
                  <p className="text-slate-500 flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-slate-400" />{' '}
                    {companyDetails.address}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <InfoItem
                  icon={FileText}
                  label="Mã số thuế"
                  value={companyDetails.taxCode}
                />
                <InfoItem
                  icon={Globe}
                  label="Website"
                  value={companyDetails.website || 'Chưa cập nhật'}
                  link={companyDetails.website}
                />
                <InfoItem
                  icon={Calendar}
                  label="Ngày đăng ký"
                  value={new Date(companyDetails.createdAt).toLocaleDateString(
                    'vi-VN',
                  )}
                />
                <InfoItem
                  icon={FileText}
                  label="Giấy phép kinh doanh"
                  value={
                    companyDetails.businessLicenseUrl
                      ? 'Xem bản gốc'
                      : 'Chưa tải lên'
                  }
                  link={companyDetails.businessLicenseUrl}
                />
              </div>

              <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-semibold text-slate-800 mb-2">
                  Giới thiệu công ty
                </h4>
                <div className="text-slate-600 leading-relaxed text-sm">
                  {companyDetails.description
                    ? parse(companyDetails.description)
                    : 'Chưa có mô tả chi tiết.'}
                </div>
              </div>

              {companyDetails.status === 'REJECTED' &&
                companyDetails.rejectionReason && (
                  <div className="mt-4 p-5 bg-red-50 rounded-xl border border-red-100">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4" /> Lý do từ chối
                    </h4>
                    <p className="text-red-700 leading-relaxed text-sm font-medium">
                      {companyDetails.rejectionReason}
                    </p>
                  </div>
                )}

              {isUpdatingProfile && (
                <div className="mt-8">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    So sánh thay đổi hồ sơ
                  </h4>
                  <div className="grid lg:grid-cols-2 gap-4">
                    <Card className="p-4 border border-slate-200 bg-slate-50">
                      <p className="text-sm font-semibold text-slate-700 mb-3">
                        Thông tin hiện tại
                      </p>
                      <div className="space-y-3 text-sm text-slate-700">
                        {comparisonFields.map((field) => {
                          const oldValue = current?.[field.key];
                          const newValue = proposed?.[field.key];
                          const changed =
                            String(oldValue ?? '') !== String(newValue ?? '');
                          return (
                            <div
                              key={`old-${field.key}`}
                              className={
                                changed
                                  ? 'rounded-md bg-white p-2 border border-orange-200'
                                  : ''
                              }
                            >
                              <p className="text-[11px] uppercase text-slate-500 mb-1">
                                {field.label}
                              </p>
                              {renderCompareValue(oldValue, field.key)}
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                    <Card className="p-4 border border-orange-200 bg-orange-50/50">
                      <p className="text-sm font-semibold text-orange-700 mb-3">
                        Nội dung thay đổi
                      </p>
                      <div className="space-y-3 text-sm text-slate-800">
                        {comparisonFields.map((field) => {
                          const oldValue = current?.[field.key];
                          const newValue = proposed?.[field.key];
                          const changed =
                            String(oldValue ?? '') !== String(newValue ?? '');
                          return (
                            <div
                              key={`new-${field.key}`}
                              className={
                                changed
                                  ? 'rounded-md bg-white p-2 border border-orange-300'
                                  : ''
                              }
                            >
                              <p className="text-[11px] uppercase text-slate-500 mb-1">
                                {field.label}
                              </p>
                              {renderCompareValue(newValue, field.key)}
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT COLUMN: CONTACT & REVIEW */}
          <div className="space-y-6">
            <Card className="p-6 rounded-xl border border-slate-200 shadow-sm bg-white">
              <h3 className="text-base font-bold mb-4 text-slate-800">
                Người đại diện
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                    {companyDetails.owner?.fullName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {companyDetails.owner?.fullName}
                    </p>
                    <p className="text-slate-400 text-xs">
                      ID: {companyDetails.ownerId}
                    </p>
                  </div>
                </div>
                <div className="pt-4 space-y-2 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />{' '}
                    {companyDetails.owner?.email}
                  </div>
                  {/* <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />{' '}
                    {companyDetails.owner?.phone}
                  </div> */}
                </div>
              </div>
            </Card>

            {(companyDetails.status === 'PENDING' ||
              companyDetails.status === 'UPDATING') && (
              <div className="space-y-3">
                <Button
                  className="w-full h-11 rounded-lg"
                  onClick={() => setIsApproveModalOpen(true)}
                >
                  {companyDetails.status === 'UPDATING'
                    ? 'Duyệt hồ sơ cập nhật'
                    : 'Duyệt hồ sơ'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-lg border-red-100 text-red-600 hover:bg-red-50 font-semibold"
                  onClick={() => setIsRejectModalOpen(true)}
                >
                  {companyDetails.status === 'UPDATING'
                    ? 'Từ chối hồ sơ cập nhật'
                    : 'Từ chối hồ sơ'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================
  // VIEW 2: JOB REPORTS LIST
  // ==========================================================
  const renderJobReports = () => {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <select
              className="h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-blue-500 outline-none min-w-40"
              value={reportStatus}
              onChange={(e) => setReportStatus(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="RESOLVED">Đã giải quyết</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
            <div className="relative flex-1 min-w-48 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm công ty..."
                className="pl-9 rounded-xl h-10 border-slate-200 focus:border-blue-500 bg-slate-50/50"
                value={reportCompanyName}
                onChange={(e) => setReportCompanyName(e.target.value)}
              />
            </div>
            <div className="relative flex-1 min-w-48 max-w-xs">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Người báo cáo..."
                className="pl-9 rounded-xl h-10 border-slate-200 focus:border-blue-500 bg-slate-50/50"
                value={reportReporterName}
                onChange={(e) => setReportReporterName(e.target.value)}
              />
            </div>
            <Input
              type="date"
              className="h-10 w-40 rounded-xl border-slate-200 bg-slate-50/50 text-sm"
              value={reportFromDate}
              onChange={(e) => setReportFromDate(e.target.value)}
            />
            <Input
              type="date"
              className="h-10 w-40 rounded-xl border-slate-200 bg-slate-50/50 text-sm"
              value={reportToDate}
              onChange={(e) => setReportToDate(e.target.value)}
            />
            <Button
              variant="outline"
              className="h-10 rounded-xl border-slate-200 hover:bg-slate-50"
              onClick={() => {
                setReportStatus('ALL');
                setReportCompanyName('');
                setReportReporterName('');
                setReportFromDate('');
                setReportToDate('');
              }}
            >
              Đặt lại
            </Button>
          </div>
          <p className="text-sm text-slate-500 px-2 font-medium shrink-0">
            Tổng cộng:{' '}
            <span className="text-blue-600 font-bold">
              {listReportsData?.data?.length || 0}
            </span>{' '}
            báo cáo
          </p>
        </div>

        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-left text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="px-6 py-4">Nội dung báo cáo</th>
                  <th className="px-6 py-4">Người báo cáo</th>
                  <th className="px-6 py-4 whitespace-nowrap">Thời gian</th>
                  <th className="px-6 py-4">Lý do</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {!listReportsData?.data?.length ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-10 text-center text-slate-400 font-medium"
                    >
                      Không có báo cáo nào
                    </td>
                  </tr>
                ) : (
                  listReportsData.data.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="min-w-[200px]">
                          <p className="font-semibold text-slate-800 line-clamp-1">
                            {r.job?.title || '—'}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {r.job?.company?.name || '—'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ReporterCell user={r.reporter} />
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {formatManagerDateTime(r.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-red-600 font-medium">
                        {REPORT_REASON_LABELS[r.reason] || r.reason}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          variant="outline"
                          className={REPORT_STATUS_COLORS[r.status] || ''}
                        >
                          {REPORT_STATUS_LABELS[r.status] || r.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => {
                            setViewingReportId(r.id);
                            setIsReportModalOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  // ==========================================================
  // VIEW 3: REVIEW REPORTS LIST (UC 2.14.6 / 2.14.7)
  // ==========================================================
  const renderReviewReports = () => {
    let list = listReviewReportsData?.data || [];

    // Client-side filtering
    if (reviewReportCompanyName) {
      list = list.filter((r) =>
        r.review?.company?.name
          ?.toLowerCase()
          .includes(reviewReportCompanyName.toLowerCase()),
      );
    }
    if (reviewReportReporterName) {
      list = list.filter((r) =>
        r.reporter?.fullName
          ?.toLowerCase()
          .includes(reviewReportReporterName.toLowerCase()),
      );
    }
    if (reviewReportFromDate) {
      const from = new Date(`${reviewReportFromDate}T00:00:00`);
      list = list.filter((r) => new Date(r.createdAt) >= from);
    }
    if (reviewReportToDate) {
      const to = new Date(`${reviewReportToDate}T23:59:59`);
      list = list.filter((r) => new Date(r.createdAt) <= to);
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <select
              className="h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-blue-500 outline-none min-w-40"
              value={reviewReportStatus}
              onChange={(e) => setReviewReportStatus(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="RESOLVED">Đã giải quyết</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
            <div className="relative flex-1 min-w-48 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm công ty..."
                className="pl-9 rounded-xl h-10 border-slate-200 focus:border-blue-500 bg-slate-50/50"
                value={reviewReportCompanyName}
                onChange={(e) => setReviewReportCompanyName(e.target.value)}
              />
            </div>
            <div className="relative flex-1 min-w-48 max-w-xs">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Người báo cáo..."
                className="pl-9 rounded-xl h-10 border-slate-200 focus:border-blue-500 bg-slate-50/50"
                value={reviewReportReporterName}
                onChange={(e) => setReviewReportReporterName(e.target.value)}
              />
            </div>
            <Input
              type="date"
              className="h-10 w-40 rounded-xl border-slate-200 bg-slate-50/50 text-sm"
              value={reviewReportFromDate}
              onChange={(e) => setReviewReportFromDate(e.target.value)}
            />
            <Input
              type="date"
              className="h-10 w-40 rounded-xl border-slate-200 bg-slate-50/50 text-sm"
              value={reviewReportToDate}
              onChange={(e) => setReviewReportToDate(e.target.value)}
            />
            <Button
              variant="outline"
              className="h-10 rounded-xl border-slate-200 hover:bg-slate-50"
              onClick={() => {
                setReviewReportStatus('ALL');
                setReviewReportCompanyName('');
                setReviewReportReporterName('');
                setReviewReportFromDate('');
                setReviewReportToDate('');
              }}
            >
              Đặt lại
            </Button>
          </div>
          <p className="text-sm text-slate-500 px-2 font-medium shrink-0">
            Tổng cộng:{' '}
            <span className="text-blue-600 font-bold">{list.length}</span> báo
            cáo
          </p>
        </div>

        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-left text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="px-6 py-4">Doanh nghiệp</th>
                  <th className="px-6 py-4">Nội dung đánh giá</th>
                  <th className="px-6 py-4">Người báo cáo</th>
                  <th className="px-6 py-4 whitespace-nowrap">Thời gian</th>
                  <th className="px-6 py-4">Lý do</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {!list.length ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-10 text-center text-slate-400 font-medium"
                    >
                      Không có báo cáo nào
                    </td>
                  </tr>
                ) : (
                  list.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {r.review?.company?.name || '—'}
                      </td>
                      <td className="px-6 py-4 max-w-[250px]">
                        <div className="flex items-center gap-1 mb-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={
                                star <= (r.review?.rating || 0)
                                  ? 'text-amber-500'
                                  : 'text-slate-200'
                              }
                            >
                              ★
                            </span>
                          ))}
                          <span className="text-slate-400 text-[10px] ml-1">
                            ({r.review?.rating || 0}/5)
                          </span>
                        </div>
                        <p
                          className="text-slate-600 line-clamp-1 text-xs"
                          title={r.review?.title || r.review?.content}
                        >
                          {r.review?.title || r.review?.content || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <ReporterCell user={r.reporter} />
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {formatManagerDateTime(r.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-red-600 font-medium">
                        {REPORT_REASON_LABELS[r.reason] || r.reason}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          variant="outline"
                          className={REPORT_STATUS_COLORS[r.status] || ''}
                        >
                          {REPORT_STATUS_LABELS[r.status] || r.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => {
                            setViewingReviewReportId(r.id);
                            setIsReviewReportModalOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  // ==========================================================
  // VIEW 4: COMPANY LIST
  // ==========================================================
  const renderCompanyList = () => {
    return (
      <div className="space-y-4">
        {/* Toolbar: Search + Status Filter */}
        <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-64 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm tên công ty, email..."
                className="pl-9 rounded-xl h-10 border-slate-200 focus:border-blue-500 bg-slate-50/50"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-blue-500 outline-none"
              value={companyStatusFilter}
              onChange={(e) => setCompanyStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="REJECTED">Đã từ chối</option>
              <option value="APPROVED">Đã duyệt</option>
            </select>
            <Input
              type="date"
              value={companyFromDate}
              onChange={(e) => setCompanyFromDate(e.target.value)}
              className="h-10 w-40 rounded-xl border-slate-200 bg-slate-50/50 text-sm"
            />
            <Input
              type="date"
              value={companyToDate}
              onChange={(e) => setCompanyToDate(e.target.value)}
              className="h-10 w-40 rounded-xl border-slate-200 bg-slate-50/50 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-slate-200 hover:bg-slate-50"
              onClick={() => {
                setSearchKeyword('');
                setCompanyStatusFilter('ALL');
                setCompanyFromDate('');
                setCompanyToDate('');
              }}
            >
              Đặt lại
            </Button>
          </div>
          <p className="text-sm text-slate-500 px-2 font-medium shrink-0">
            Tổng cộng:{' '}
            <span className="text-blue-600 font-bold">
              {filteredCompanies.length}
            </span>{' '}
            hồ sơ
          </p>
        </div>

        {/* Data Table */}
        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-left text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="px-6 py-4">Doanh nghiệp</th>
                  <th className="px-6 py-4">Địa chỉ</th>
                  <th className="px-6 py-4 whitespace-nowrap">Ngày đăng ký</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {displayList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-20 text-center text-slate-400"
                    >
                      Không tìm thấy hồ sơ phù hợp.
                    </td>
                  </tr>
                ) : (
                  displayList.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                            {c.logoUrl ? (
                              <img
                                src={c.logoUrl}
                                className="h-full w-full object-cover"
                                alt={c.name}
                              />
                            ) : (
                              <Building2 className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 line-clamp-1">
                              {c.name}
                            </p>
                            <p className="text-xs text-slate-500 font-normal truncate max-w-[200px]">
                              {c.owner?.fullName ||
                                c.owner?.email ||
                                'Chưa có thông tin'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <p
                          className="line-clamp-1 max-w-[250px]"
                          title={c.address}
                        >
                          {c.address || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {formatManagerDateTime(c.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          variant="outline"
                          className={
                            STATUS_COLORS[c.status]?.color ||
                            'bg-slate-50 text-slate-700 border-slate-100'
                          }
                        >
                          {STATUS_COLORS[c.status]?.label || c.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => setViewingCompanyId(c.id)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
        {!isLoadingData && filteredCompanies.length > 0 && (
          <Card className="p-3 border border-slate-200 shadow-sm bg-white">
            <AppPagination
              page={companyPage}
              totalPage={companyTotalPages}
              onPageChange={setCompanyPage}
            />
          </Card>
        )}
      </div>
    );
  };

  const renderCompanyUpdates = () => {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-64 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm hồ sơ cập nhật..."
                className="pl-9 rounded-xl h-10 border-slate-200 focus:border-blue-500 bg-slate-50/50"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <Input
              type="date"
              value={companyFromDate}
              onChange={(e) => setCompanyFromDate(e.target.value)}
              className="h-10 w-40 rounded-xl border-slate-200 bg-slate-50/50 text-sm"
            />
            <Input
              type="date"
              value={companyToDate}
              onChange={(e) => setCompanyToDate(e.target.value)}
              className="h-10 w-40 rounded-xl border-slate-200 bg-slate-50/50 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-slate-200 hover:bg-slate-50"
              onClick={() => {
                setSearchKeyword('');
                setCompanyFromDate('');
                setCompanyToDate('');
              }}
            >
              Đặt lại
            </Button>
          </div>
          <p className="text-sm text-slate-500 px-2 font-medium shrink-0">
            Tổng cộng:{' '}
            <span className="text-blue-600 font-bold">
              {filteredUpdateQueue.length}
            </span>{' '}
            hồ sơ
          </p>
        </div>

        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-left text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="px-6 py-4">Doanh nghiệp</th>
                  <th className="px-6 py-4">Địa chỉ</th>
                  <th className="px-6 py-4 whitespace-nowrap">Ngày cập nhật</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {displayUpdateList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-20 text-center text-slate-400"
                    >
                      Chưa có hồ sơ cập nhật nào đang chờ duyệt.
                    </td>
                  </tr>
                ) : (
                  displayUpdateList.map((item) => (
                    <tr
                      key={`updating-${item.id}`}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                            {item.logoUrl ? (
                              <img
                                src={item.logoUrl}
                                className="h-full w-full object-cover"
                                alt={item.name}
                              />
                            ) : (
                              <Building2 className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500 font-normal truncate max-w-[200px]">
                              {item.owner?.fullName ||
                                item.owner?.email ||
                                'Chưa có thông tin'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p
                          className="text-slate-600 line-clamp-1 max-w-[250px]"
                          title={item.address}
                        >
                          {item.address || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {formatManagerDateTime(
                          item.updatedAt || item.createdAt,
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          variant="outline"
                          className={
                            STATUS_COLORS[item.status]?.color ||
                            'bg-slate-50 text-slate-700 border-slate-100'
                          }
                        >
                          {STATUS_COLORS[item.status]?.label || item.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => setViewingCompanyId(item.id)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
        {!isLoadingData && filteredUpdateQueue.length > 0 && (
          <Card className="p-3 border border-slate-200 shadow-sm bg-white">
            <AppPagination
              page={updatePage}
              totalPage={updateTotalPages}
              onPageChange={setUpdatePage}
            />
          </Card>
        )}
      </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <DashboardLayout
      title={TAB_HEADERS[currentTab]?.title || 'Quản lý hệ thống'}
      subtitle={TAB_HEADERS[currentTab]?.subtitle}
      menu={MANAGEMENT_MENU}
      activeKey={currentTab}
      onSelect={(key) => {
        setCurrentTab(key);
        setViewingCompanyId(null);
      }}
      topbarBell={<NotificationBellPopover />}
    >
      <div className="space-y-6">
        {viewingCompanyId ? (
          renderDetails()
        ) : (
          <>
            {currentTab === 'companies' &&
              (isLoadingData ? renderTableSkeleton() : renderCompanyList())}
            {currentTab === 'company_updates' &&
              (isLoadingData ? renderTableSkeleton() : renderCompanyUpdates())}
            {currentTab === 'job_reports' &&
              (loadingReports ? renderTableSkeleton() : renderJobReports())}
            {currentTab === 'review_reports' &&
              (loadingReviewReports
                ? renderTableSkeleton()
                : renderReviewReports())}
            {currentTab === 'support' && (
              <div className="h-[calc(100vh-250px)]">
                <SupportTicketBoard role="MANAGER" />
              </div>
            )}
          </>
        )}
      </div>

      {/* --- CONFIRMATION MODALS --- */}
      <Modal
        open={isApproveModalOpen}
        title={
          companyDetails?.status === 'UPDATING'
            ? 'Duyệt hồ sơ cập nhật?'
            : 'Duyệt hồ sơ doanh nghiệp?'
        }
        description={
          companyDetails?.status === 'UPDATING'
            ? 'Sau khi duyệt, hệ thống sẽ hiển thị thông tin doanh nghiệp mới cho người lao động.'
            : 'Sau khi duyệt, doanh nghiệp có thể bắt đầu đăng tin tuyển dụng.'
        }
        confirmLabel={
          companyDetails?.status === 'UPDATING'
            ? 'Duyệt hồ sơ cập nhật'
            : 'Duyệt hồ sơ'
        }
        onConfirm={() => handleReviewCompany('APPROVED')}
        onClose={() => setIsApproveModalOpen(false)}
      />

      <Modal
        open={isRejectModalOpen}
        title={
          companyDetails?.status === 'UPDATING'
            ? 'Lý do từ chối hồ sơ cập nhật'
            : 'Lý do từ chối hồ sơ'
        }
        confirmLabel="Gửi thông báo"
        tone="danger"
        onConfirm={() => handleReviewCompany('REJECTED')}
        onClose={() => {
          setIsRejectModalOpen(false);
          setRejectionReason('');
          setRejectionReasonError('');
        }}
      >
        <div className="space-y-1.5">
          <textarea
            className={`w-full min-h-25 p-3 rounded-lg border outline-none text-sm bg-white transition-colors ${
              rejectionReasonError
                ? 'border-red-400 focus:border-red-500 bg-red-50/30'
                : 'border-slate-200 focus:border-red-400'
            }`}
            placeholder="Nhập lý do từ chối (ví dụ: Thiếu giấy phép kinh doanh...)"
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              if (e.target.value.trim()) setRejectionReasonError('');
            }}
          />
          {rejectionReasonError && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <span>⚠</span> {rejectionReasonError}
            </p>
          )}
        </div>
      </Modal>

      {/* --- MODAL CHI TIẾT BÁO CÁO --- */}
      <Modal
        open={isReportModalOpen}
        title="Chi tiết báo cáo việc làm"
        onClose={() => {
          setIsReportModalOpen(false);
          setViewingReportId(null);
        }}
        showFooter={false}
      >
        {viewingReport && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="h-3 w-3" /> Công việc
                </p>
                <Link
                  to={`/job/${viewingReport.job?.id}`}
                  target="_blank"
                  className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  {viewingReport.job?.title}{' '}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <InfoItem
                icon={User}
                label="Người báo cáo"
                value={viewingReport.reporter?.fullName}
              />
              <InfoItem
                icon={Mail}
                label="Email người báo cáo"
                value={viewingReport.reporter?.email}
              />
              <InfoItem
                icon={Calendar}
                label="Ngày báo cáo"
                value={new Date(viewingReport.createdAt).toLocaleDateString(
                  'vi-VN',
                )}
              />
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="text-xs font-bold text-red-800 uppercase mb-1">
                Lý do báo cáo
              </p>
              <p className="text-sm font-semibold text-red-700">
                {REPORT_REASON_LABELS[viewingReport.reason] ||
                  viewingReport.reason}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                Mô tả chi tiết
              </p>
              <p className="text-sm text-slate-700">
                {viewingReport.description || 'Không có mô tả chi tiết'}
              </p>
            </div>

            {viewingReport.status === 'PENDING' && (
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button
                  className="flex-1"
                  onClick={() => setIsApproveReportModalOpen(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Duyệt
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 border-red-100 hover:bg-red-50"
                  onClick={() => handleReviewReport('REJECTED')}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Từ chối báo cáo
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* --- MODAL XÁC NHẬN DUYỆT BÁO CÁO (ẨN VIỆC LÀM) --- */}
      <Modal
        open={isApproveReportModalOpen}
        title="Xác nhận duyệt báo cáo"
        description="Việc làm này sẽ bị ẩn khỏi hệ thống sau khi duyệt. Bạn có chắc chắn muốn tiếp tục?"
        confirmLabel={
          updateJobStatusMutation.isPending || updateReportMutation.isPending
            ? 'Đang xử lý...'
            : 'Xác nhận duyệt'
        }
        confirmDisabled={
          updateJobStatusMutation.isPending || updateReportMutation.isPending
        }
        tone="danger"
        onConfirm={handleApproveReport}
        onClose={() => setIsApproveReportModalOpen(false)}
      />

      {/* --- MODAL CHI TIẾT BÁO CÁO ĐÁNH GIÁ (UC 2.14.6 / 2.14.7) --- */}
      <Modal
        open={isReviewReportModalOpen}
        title="Chi tiết báo cáo đánh giá"
        onClose={() => {
          setIsReviewReportModalOpen(false);
          setViewingReviewReportId(null);
        }}
        showFooter={false}
      >
        {viewingReviewReport && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem
                icon={Building2}
                label="Công ty"
                value={viewingReviewReport.review?.company?.name}
              />
              <InfoItem
                icon={User}
                label="Người viết đánh giá"
                value={viewingReviewReport.review?.user?.fullName}
              />
              <InfoItem
                icon={User}
                label="Người báo cáo"
                value={viewingReviewReport.reporter?.fullName}
              />
              <InfoItem
                icon={Mail}
                label="Email người báo cáo"
                value={viewingReviewReport.reporter?.email}
              />
              <InfoItem
                icon={Calendar}
                label="Ngày báo cáo"
                value={new Date(
                  viewingReviewReport.createdAt,
                ).toLocaleDateString('vi-VN')}
              />
            </div>

            {/* Nội dung đánh giá bị báo cáo */}
            <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3" /> Nội dung đánh giá
                </p>
                <div className="flex items-center gap-1 text-amber-500 text-sm">
                  {'★'.repeat(viewingReviewReport.review?.rating || 0)}
                  <span className="text-slate-500 text-xs ml-1">
                    ({viewingReviewReport.review?.rating || 0}/5)
                  </span>
                </div>
              </div>
              {viewingReviewReport.review?.title && (
                <p className="text-sm font-semibold text-slate-800 mb-1">
                  {viewingReviewReport.review.title}
                </p>
              )}
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {viewingReviewReport.review?.content || 'Không có nội dung'}
              </p>
              {viewingReviewReport.review?.status === 'DELETED' && (
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded px-2 py-0.5">
                  <XCircle className="h-3 w-3" /> Đánh giá đã bị ẩn
                </div>
              )}
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="text-xs font-bold text-red-800 uppercase mb-1">
                Lý do báo cáo
              </p>
              <p className="text-sm font-semibold text-red-700">
                {REPORT_REASON_LABELS[viewingReviewReport.reason] ||
                  viewingReviewReport.reason}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                Mô tả chi tiết
              </p>
              <p className="text-sm text-slate-700">
                {viewingReviewReport.description || 'Không có mô tả chi tiết'}
              </p>
            </div>

            {viewingReviewReport.status === 'PENDING' && (
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button
                  className="flex-1"
                  onClick={() => setIsApproveReviewReportModalOpen(true)}
                  disabled={viewingReviewReport.review?.status === 'DELETED'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Duyệt
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 border-red-100 hover:bg-red-50"
                  onClick={handleReviewReportReject}
                  disabled={updateReviewReportMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Từ chối báo cáo
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* --- MODAL XÁC NHẬN DUYỆT BÁO CÁO ĐÁNH GIÁ (ẨN ĐÁNH GIÁ) --- */}
      <Modal
        open={isApproveReviewReportModalOpen}
        title="Xác nhận duyệt báo cáo đánh giá"
        description="Đánh giá này sẽ bị ẩn khỏi trang công ty sau khi duyệt. Bạn có chắc chắn muốn tiếp tục?"
        confirmLabel={
          hideReviewMutation.isPending || updateReviewReportMutation.isPending
            ? 'Đang xử lý...'
            : 'Xác nhận duyệt'
        }
        confirmDisabled={
          hideReviewMutation.isPending || updateReviewReportMutation.isPending
        }
        tone="danger"
        onConfirm={handleApproveReviewReport}
        onClose={() => setIsApproveReviewReportModalOpen(false)}
      />
    </DashboardLayout>
  );
};

// Sub-component for displaying each info line
const InfoItem = ({ icon: Icon, label, value, link }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
      <Icon className="h-3 w-3" /> {label}
    </p>
    {link ? (
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
      >
        {value} <ExternalLink className="h-3 w-3" />
      </a>
    ) : (
      <p className="text-sm font-semibold text-slate-700">{value || '—'}</p>
    )}
  </div>
);

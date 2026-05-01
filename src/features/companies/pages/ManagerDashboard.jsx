import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AppPagination } from '@/shared/components/AppPagination';
import { DashboardLayout } from '@/shared/components/Layout/DashboardLayout';
import { Modal } from '@/shared/components/Modal';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';
import parse from "html-react-parser";
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
import { useGetAllJobReports, useUpdateJobReportStatus, useUpdateJobStatus } from '@/features/jobs/api/useJobs';
import { SupportTicketBoard } from '@/features/support/components/SupportTicketBoard';

// 1. Management Menu and Status Colors configuration
const MANAGEMENT_MENU = [
  { key: 'companies', label: 'Hồ sơ doanh nghiệp mới' },
  { key: 'company_updates', label: 'Hồ sơ cập nhật' },
  { key: 'job_reports', label: 'Báo cáo việc làm' },
  { key: 'review_reports', label: 'Báo cáo đánh giá' },
  { key: 'support', label: 'Hỗ trợ khách hàng' },
];

const STATUS_COLORS = {
  APPROVED: {
    label: 'Đã duyệt',
    color: 'bg-green-50 text-green-700 border-green-100',
  },
  PENDING: {
    label: 'Đang chờ',
    color: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  REJECTED: {
    label: 'Đã từ chối',
    color: 'bg-red-50 text-red-700 border-red-100',
  },
  UPDATING: {
    label: 'Chờ duyệt cập nhật',
    color: 'bg-orange-50 text-orange-700 border-orange-100',
  },
};

const REPORT_REASON_LABELS = {
  FRAUD: 'Lừa đảo',
  INAPPROPRIATE_CONTENT: 'Nội dung không phù hợp',
  SCAM: 'Lừa đảo/Đa cấp',
  DUPLICATE: 'Tin tuyển dụng trùng lặp',
  MISLEADING_INFO: 'Thông tin không đúng sự thật',
  OTHER: 'Khác',
};

const REPORT_STATUS_LABELS = {
  PENDING: 'Chờ xử lý',
  RESOLVED: 'Đã giải quyết',
  REJECTED: 'Đã từ chối',
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

  const [reportStatus, setReportStatus] = useState('PENDING');
  const [viewingReportId, setViewingReportId] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isApproveReportModalOpen, setIsApproveReportModalOpen] = useState(false);

  // Review reports (UC 2.14.6 / 2.14.7)
  const [reviewReportStatus, setReviewReportStatus] = useState('PENDING');
  const [viewingReviewReportId, setViewingReviewReportId] = useState(null);
  const [isReviewReportModalOpen, setIsReviewReportModalOpen] = useState(false);
  const [isApproveReviewReportModalOpen, setIsApproveReviewReportModalOpen] = useState(false);

  // --- DATA FETCHING FROM API ---
  const { data: allCompanies = [], isLoading: isLoadingAll } = useGetCompanies();
  const { data: pendingUpdateCompanies = [] } = useGetPendingUpdateCompanies();
  const { data: companyDetails, isLoading: isLoadingDetails } =
    useGetCompaniesById(viewingCompanyId);
  const { data: companyUpdateRequest } = useGetCompanyUpdateRequest(viewingCompanyId);
  const reviewCompanyMutation = useReviewCompany();

  const { data: listReportsData = [], isLoading: loadingReports } = useGetAllJobReports(reportStatus, 1, 50);
  const updateReportMutation = useUpdateJobReportStatus();
  const updateJobStatusMutation = useUpdateJobStatus();

  const { data: listReviewReportsData, isLoading: loadingReviewReports } =
    useGetReviewReports(reviewReportStatus, 1, 50);
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
  const viewingReport = listReportsData?.data?.find(r => r.id === viewingReportId);
  const viewingReviewReport = listReviewReportsData?.data?.find(r => r.id === viewingReviewReportId);

  // Logic to select which list to display
  const isLoadingData = isLoadingAll;
  const sourceList = allCompanies;

  // Filter logic based on status + search keyword
  const filteredCompanies = sourceList
    .filter((item) => item.status !== 'UPDATING')
    .filter((item) =>
      companyStatusFilter === 'ALL' ? true : item.status === companyStatusFilter,
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
    try {
      await reviewCompanyMutation.mutateAsync({
        id: viewingCompanyId,
        status: newStatus,
        rejectionReason: newStatus === 'REJECTED' ? rejectionReason : null,
      });

      if (companyDetails?.status === 'UPDATING') {
        toast(newStatus === 'APPROVED' ? 'Đã duyệt hồ sơ cập nhật' : 'Đã từ chối hồ sơ cập nhật');
      } else {
        toast(newStatus === 'APPROVED' ? 'Đã duyệt hồ sơ doanh nghiệp' : 'Đã từ chối hồ sơ doanh nghiệp');
      }

      // Reset state after completion
      setIsApproveModalOpen(false);
      setIsRejectModalOpen(false);
      setRejectionReason('');
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

  // ==========================================================
  // VIEW 1: COMPANY DETAILS (WHEN VIEWING)
  // ==========================================================
  const renderDetails = () => {
    if (isLoadingDetails)
      return (
        <div className="flex flex-col items-center justify-center min-h-100 text-slate-600">
          <div className="h-10 w-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p>Đang lấy thông tin chi tiết...</p>
        </div>
      );

    if (!companyDetails) return null;

    const proposed = companyUpdateRequest?.proposed || null;
    const current = companyUpdateRequest?.current || companyDetails;
    const isUpdatingProfile = companyDetails.status === 'UPDATING' && !!proposed;

    const renderCompareValue = (value, key) => {
      if (!value) return <span className="text-slate-400">—</span>;
      if (key === 'website' || key === 'logoUrl' || key === 'businessLicenseUrl') {
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
        return <div className="text-sm leading-relaxed">{parse(String(value))}</div>;
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
          ← Quay lại danh sách
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
                  {companyDetails.description ? parse(companyDetails.description) : 'Chưa có mô tả chi tiết.'}
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
                    So sánh thông tin trước / sau cập nhật
                  </h4>
                  <div className="grid lg:grid-cols-2 gap-4">
                    <Card className="p-4 border border-slate-200 bg-slate-50">
                      <p className="text-sm font-semibold text-slate-700 mb-3">
                        Bản đang hiển thị
                      </p>
                      <div className="space-y-3 text-sm text-slate-700">
                        {comparisonFields.map((field) => {
                          const oldValue = current?.[field.key];
                          const newValue = proposed?.[field.key];
                          const changed = String(oldValue ?? '') !== String(newValue ?? '');
                          return (
                            <div key={`old-${field.key}`} className={changed ? 'rounded-md bg-white p-2 border border-orange-200' : ''}>
                              <p className="text-[11px] uppercase text-slate-500 mb-1">{field.label}</p>
                              {renderCompareValue(oldValue, field.key)}
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                    <Card className="p-4 border border-orange-200 bg-orange-50/50">
                      <p className="text-sm font-semibold text-orange-700 mb-3">
                        Bản đề xuất cập nhật
                      </p>
                      <div className="space-y-3 text-sm text-slate-800">
                        {comparisonFields.map((field) => {
                          const oldValue = current?.[field.key];
                          const newValue = proposed?.[field.key];
                          const changed = String(oldValue ?? '') !== String(newValue ?? '');
                          return (
                            <div key={`new-${field.key}`} className={changed ? 'rounded-md bg-white p-2 border border-orange-300' : ''}>
                              <p className="text-[11px] uppercase text-slate-500 mb-1">{field.label}</p>
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
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />{' '}
                    {companyDetails.owner?.phone}
                  </div>
                </div>
              </div>
            </Card>

            {(companyDetails.status === 'PENDING' || companyDetails.status === 'UPDATING') && (
              <div className="space-y-3">
                <Button
                  className="w-full h-11 rounded-lg"
                  onClick={() => setIsApproveModalOpen(true)}
                >
                  {companyDetails.status === 'UPDATING' ? 'Duyệt hồ sơ cập nhật' : 'Duyệt hồ sơ'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-lg border-red-100 text-red-600 hover:bg-red-50 font-semibold"
                  onClick={() => setIsRejectModalOpen(true)}
                >
                  {companyDetails.status === 'UPDATING' ? 'Từ chối hồ sơ cập nhật' : 'Từ chối hồ sơ'}
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
          <select
            className="border p-2 rounded-lg text-sm bg-slate-50"
            value={reportStatus}
            onChange={e => setReportStatus(e.target.value)}
          >
            <option value="PENDING">Chờ xử lý</option>
            <option value="RESOLVED">Đã giải quyết</option>
            <option value="REJECTED">Đã từ chối</option>
          </select>
          <p className="text-sm text-slate-500 px-2 font-medium">
            Hiển thị <span className="text-blue-600 font-bold">{listReportsData?.data?.length || 0}</span> báo cáo
          </p>
        </div>

        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Công việc</th>
                  <th className="px-6 py-4 font-semibold">Người báo cáo</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Thời gian</th>
                  <th className="px-6 py-4 font-semibold">Lý do</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingReports ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-slate-400 font-medium">Đang tải...</td>
                  </tr>
                ) : !listReportsData?.data?.length ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-slate-400 font-medium">Không có báo cáo nào</td>
                  </tr>
                ) : (
                  listReportsData.data.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-sm font-semibold">{r.job?.title || '—'}</td>
                      <td className="px-6 py-4 text-sm"><ReporterCell user={r.reporter} /></td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{formatManagerDateTime(r.createdAt)}</td>
                      <td className="px-6 py-4 text-sm text-red-600 font-medium">{REPORT_REASON_LABELS[r.reason] || r.reason}</td>
                      <td className="px-6 py-4 text-sm"><Badge variant="outline">{REPORT_STATUS_LABELS[r.status] || r.status}</Badge></td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => {
                            setViewingReportId(r.id);
                            setIsReportModalOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
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
    const list = listReviewReportsData?.data || [];
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <select
            className="border p-2 rounded-lg text-sm bg-slate-50"
            value={reviewReportStatus}
            onChange={e => setReviewReportStatus(e.target.value)}
          >
            <option value="PENDING">Chờ xử lý</option>
            <option value="RESOLVED">Đã giải quyết</option>
            <option value="REJECTED">Đã từ chối</option>
          </select>
          <p className="text-sm text-slate-500 px-2 font-medium">
            Hiển thị <span className="text-blue-600 font-bold">{list.length}</span> báo cáo
          </p>
        </div>

        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Công ty</th>
                  <th className="px-6 py-4 font-semibold">Đánh giá</th>
                  <th className="px-6 py-4 font-semibold">Người báo cáo</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Thời gian</th>
                  <th className="px-6 py-4 font-semibold">Lý do</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingReviewReports ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-400 font-medium">Đang tải...</td>
                  </tr>
                ) : !list.length ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-400 font-medium">Không có báo cáo nào</td>
                  </tr>
                ) : (
                  list.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-sm font-semibold">{r.review?.company?.name || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 max-w-70">
                        <div className="flex items-center gap-1 mb-1 text-amber-500">
                          {'★'.repeat(r.review?.rating || 0)}
                          <span className="text-slate-500 text-xs ml-1">({r.review?.rating || 0}/5)</span>
                        </div>
                        <p className="truncate" title={r.review?.title || r.review?.content}>
                          {r.review?.title || r.review?.content || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm"><ReporterCell user={r.reporter} /></td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{formatManagerDateTime(r.createdAt)}</td>
                      <td className="px-6 py-4 text-sm text-red-600 font-medium">
                        {REPORT_REASON_LABELS[r.reason] || r.reason}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant="outline">{REPORT_STATUS_LABELS[r.status] || r.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => {
                            setViewingReviewReportId(r.id);
                            setIsReviewReportModalOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
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
                placeholder="Tìm kiếm công ty..."
                className="pl-9 rounded-lg h-10 border-slate-200 focus:border-blue-500 bg-slate-50/50"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm"
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
              className="h-10 w-40 rounded-xl border-slate-200 bg-slate-50/50"
            />
            <Input
              type="date"
              value={companyToDate}
              onChange={(e) => setCompanyToDate(e.target.value)}
              className="h-10 w-40 rounded-xl border-slate-200 bg-slate-50/50"
            />
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-slate-200"
              onClick={() => {
                setSearchKeyword('');
                setCompanyStatusFilter('ALL');
                setCompanyFromDate('');
                setCompanyToDate('');
              }}
            >
              Đặt lại lọc
            </Button>
          </div>
          <p className="text-sm text-slate-500 px-2 font-medium">
            Hiển thị{' '}
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
                <tr className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Công ty</th>
                  <th className="px-6 py-4 font-semibold">Địa chỉ</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Đăng ký</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingData ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-20 text-center text-slate-400 font-medium"
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : displayList.length === 0 ? (
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
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                            {c.logoUrl ? (
                              <img
                                src={c.logoUrl}
                                className="h-full w-full object-cover rounded-lg"
                                alt={c.name}
                              />
                            ) : (
                              <Building2 className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {c.name}
                            </p>
                            {c.owner?.fullName?.trim() ? (
                              <p className="text-xs text-slate-600 font-medium">
                                {c.owner.fullName.trim()}
                              </p>
                            ) : null}
                            <p className="text-xs text-slate-400 font-normal">
                              {c.owner?.email || 'Chưa có email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {c.address || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {formatManagerDateTime(c.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={
                            (STATUS_COLORS[c.status]?.color || 'bg-slate-50 text-slate-700 border-slate-100') +
                            ' border font-normal px-2 py-0.5 rounded-md text-[10px]'
                          }
                        >
                          {STATUS_COLORS[c.status]?.label || c.status}
                        </Badge>
                        {c.status === 'REJECTED' && c.rejectionReason && (
                          <p
                            className="text-[10px] text-red-500 mt-1 max-w-37.5 truncate italic"
                            title={c.rejectionReason}
                          >
                            Lý do: {c.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => setViewingCompanyId(c.id)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl bg-primary-muted border-primary/20 text-primary-muted-foreground hover:bg-primary/10 hover:border-primary/30 transition-colors shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> Xem
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
                className="pl-9 rounded-lg h-10 border-slate-200 focus:border-blue-500 bg-slate-50/50"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <Input
              type="date"
              value={companyFromDate}
              onChange={(e) => setCompanyFromDate(e.target.value)}
              className="h-10 w-40 rounded-xl border-slate-200 bg-slate-50/50"
            />
            <Input
              type="date"
              value={companyToDate}
              onChange={(e) => setCompanyToDate(e.target.value)}
              className="h-10 w-40 rounded-xl border-slate-200 bg-slate-50/50"
            />
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-slate-200"
              onClick={() => {
                setSearchKeyword('');
                setCompanyFromDate('');
                setCompanyToDate('');
              }}
            >
              Đặt lại lọc
            </Button>
          </div>
          <p className="text-sm text-slate-500 px-2 font-medium">
            Hiển thị{' '}
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
                <tr className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Công ty</th>
                  <th className="px-6 py-4 font-semibold">Địa chỉ</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Cập nhật lúc</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingData ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center text-slate-400 font-medium">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : displayUpdateList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center text-slate-400">
                      Chưa có hồ sơ cập nhật nào đang chờ duyệt.
                    </td>
                  </tr>
                ) : (
                  displayUpdateList.map((item) => (
                    <tr key={`updating-${item.id}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                            {item.logoUrl ? (
                              <img src={item.logoUrl} className="h-full w-full object-cover rounded-lg" alt={item.name} />
                            ) : (
                              <Building2 className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                            <p className="text-xs text-slate-400 font-normal">{item.owner?.email || 'Chưa có email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{item.address || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {formatManagerDateTime(item.updatedAt || item.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={
                            (STATUS_COLORS[item.status]?.color || 'bg-slate-50 text-slate-700 border-slate-100') +
                            ' border font-normal px-2 py-0.5 rounded-md text-[10px]'
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
                          className="rounded-xl bg-primary-muted border-primary/20 text-primary-muted-foreground hover:bg-primary/10 hover:border-primary/30 transition-colors shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> Xem
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
      title={
        MANAGEMENT_MENU.find((m) => m.key === currentTab)?.label ||
        'Quản lý hệ thống'
      }
      menu={MANAGEMENT_MENU}
      activeKey={currentTab}
      onSelect={(key) => {
        setCurrentTab(key);
        setViewingCompanyId(null);
      }}
      topbarBell={<NotificationBellPopover />}
    >
      <div className="min-h-screen bg-slate-50/50 p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <h2 className="text-xl font-bold text-slate-800">
            {currentTab === 'companies'
              ? 'Danh sách hồ sơ doanh nghiệp mới'
              : currentTab === 'company_updates'
                ? 'Danh sách hồ sơ cập nhật doanh nghiệp'
              : MANAGEMENT_MENU.find((m) => m.key === currentTab)?.label}
          </h2>
          {currentTab === 'job_reports'
            ? renderJobReports()
            : currentTab === 'review_reports'
              ? renderReviewReports()
              : currentTab === 'company_updates'
                ? viewingCompanyId ? renderDetails() : renderCompanyUpdates()
              : currentTab === 'support'
                ? <SupportTicketBoard />
                : viewingCompanyId ? renderDetails() : renderCompanyList()}
        </div>
      </div>

      {/* --- CONFIRMATION MODALS --- */}
      <Modal
        open={isApproveModalOpen}
        title={companyDetails?.status === 'UPDATING' ? 'Duyệt hồ sơ cập nhật?' : 'Duyệt hồ sơ doanh nghiệp?'}
        description={
          companyDetails?.status === 'UPDATING'
            ? 'Sau khi duyệt, hệ thống sẽ hiển thị thông tin doanh nghiệp mới cho người lao động.'
            : 'Sau khi duyệt, doanh nghiệp có thể bắt đầu đăng tin tuyển dụng.'
        }
        confirmLabel={companyDetails?.status === 'UPDATING' ? 'Duyệt hồ sơ cập nhật' : 'Duyệt hồ sơ'}
        onConfirm={() => handleReviewCompany('APPROVED')}
        onClose={() => setIsApproveModalOpen(false)}
      />

      <Modal
        open={isRejectModalOpen}
        title={companyDetails?.status === 'UPDATING' ? 'Lý do từ chối hồ sơ cập nhật' : 'Lý do từ chối hồ sơ'}
        confirmLabel="Gửi thông báo"
        tone="danger"
        onConfirm={() => handleReviewCompany('REJECTED')}
        onClose={() => setIsRejectModalOpen(false)}
      >
        <textarea
          className="w-full min-h-25 p-3 rounded-lg border border-slate-200 focus:border-red-400 outline-none text-sm bg-white"
          placeholder="Nhập lý do từ chối (ví dụ: Thiếu giấy phép kinh doanh...)"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        />
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
                  {viewingReport.job?.title} <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <InfoItem icon={User} label="Người báo cáo" value={viewingReport.reporter?.fullName} />
              <InfoItem icon={Mail} label="Email người báo cáo" value={viewingReport.reporter?.email} />
              <InfoItem icon={Calendar} label="Ngày báo cáo" value={new Date(viewingReport.createdAt).toLocaleDateString('vi-VN')} />
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="text-xs font-bold text-red-800 uppercase mb-1">Lý do báo cáo</p>
              <p className="text-sm font-semibold text-red-700">{REPORT_REASON_LABELS[viewingReport.reason] || viewingReport.reason}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Mô tả chi tiết</p>
              <p className="text-sm text-slate-700">{viewingReport.description || 'Không có mô tả chi tiết'}</p>
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
        confirmDisabled={updateJobStatusMutation.isPending || updateReportMutation.isPending}
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
                value={new Date(viewingReviewReport.createdAt).toLocaleDateString('vi-VN')}
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
              <p className="text-xs font-bold text-red-800 uppercase mb-1">Lý do báo cáo</p>
              <p className="text-sm font-semibold text-red-700">
                {REPORT_REASON_LABELS[viewingReviewReport.reason] || viewingReviewReport.reason}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Mô tả chi tiết</p>
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
        confirmDisabled={hideReviewMutation.isPending || updateReviewReportMutation.isPending}
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

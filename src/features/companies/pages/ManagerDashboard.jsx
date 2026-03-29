import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';
import {
  useGetCompanies,
  useGetCompaniesById,
  useGetCompaniesByStatus,
  useReviewCompany,
} from '../api/useGetCompanies';
import { useGetAllJobReports, useUpdateJobReportStatus, useGetWarningJobs, useUpdateJobStatus } from '@/features/jobs/api/useJobs';

// 1. Management Menu and Status Colors configuration
const MANAGEMENT_MENU = [
  { key: 'all', label: 'Tất cả đơn' },
  { key: 'approvals', label: 'Đang xếp hàng duyệt' },
  { key: 'rejected', label: 'Đã từ chối' },
  { key: 'job_warning', label: 'Công việc nghi vấn' },
  { key: 'job_reports', label: 'Báo cáo việc làm' },
];

const STATUS_COLORS = {
  APPROVED: {
    label: 'Đã thông qua',
    color: 'bg-green-50 text-green-700 border-green-100',
  },
  PENDING: {
    label: 'Đang chờ',
    color: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  REJECTED: {
    label: 'Từ chối',
    color: 'bg-red-50 text-red-700 border-red-100',
  },
};

export const ManagerDashboard = () => {
  const { toast } = useToast();

  // --- STATE MANAGEMENT ---
  const [currentTab, setCurrentTab] = useState('all');
  const [viewingCompanyId, setViewingCompanyId] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [reportStatus, setReportStatus] = useState('PENDING');
  const [viewingReportId, setViewingReportId] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // --- DATA FETCHING FROM API ---
  const { data: allCompanies = [], isLoading: isLoadingAll } = useGetCompanies();
  const { data: pendingCompanies = [], isLoading: isLoadingPending } =
    useGetCompaniesByStatus('PENDING');
  const { data: rejectedCompanies = [], isLoading: isLoadingRejected } =
    useGetCompaniesByStatus('REJECTED');
  const { data: companyDetails, isLoading: isLoadingDetails } =
    useGetCompaniesById(viewingCompanyId);
  const reviewCompanyMutation = useReviewCompany();

  const { data: listReportsData = [], isLoading: loadingReports } = useGetAllJobReports(reportStatus, 1, 50);
  const updateReportMutation = useUpdateJobReportStatus();

  const { data: warningJobsData, isLoading: loadingWarningJobs } = useGetWarningJobs({ page: 1, limit: 100 });
  const updateJobStatusMutation = useUpdateJobStatus();

  // Find the viewing report in the list
  const viewingReport = listReportsData?.data?.find(r => r.id === viewingReportId);

  // Logic to select which list to display
  const dataMap = {
    all: { data: allCompanies, loading: isLoadingAll },
    approvals: { data: pendingCompanies, loading: isLoadingPending },
    rejected: { data: rejectedCompanies, loading: isLoadingRejected },
  };

  const isLoadingData = dataMap[currentTab]?.loading;
  const sourceList = dataMap[currentTab]?.data || [];

  // Filter logic based on search keyword
  const displayList = sourceList.filter((item) =>
    item.name.toLowerCase().includes(searchKeyword.toLowerCase()),
  );

  // --- HANDLERS ---
  const handleReviewCompany = async (newStatus) => {
    try {
      await reviewCompanyMutation.mutateAsync({
        id: viewingCompanyId,
        status: newStatus,
        rejectionReason: newStatus === 'REJECTED' ? rejectionReason : null,
      });

      toast(newStatus === 'APPROVED' ? MSG.MSG55 : 'Đã gửi từ chối');

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

  const handleUpdateJobStatus = async (jobId, status) => {
    try {
      await updateJobStatusMutation.mutateAsync({ id: jobId, status });
      toast('Cập nhật trạng thái thành công');
    } catch (e) {
      console.error(e);
      toast('Cập nhật thất bại', 'error');
    }
  };

  // ==========================================================
  // VIEW 1: COMPANY DETAILS (WHEN VIEWING)
  // ==========================================================
  const renderDetails = () => {
    if (isLoadingDetails)
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-600">
          <div className="h-10 w-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p>Đang lấy thông tin chi tiết...</p>
        </div>
      );

    if (!companyDetails) return null;

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

            {companyDetails.status === 'PENDING' && (
              <div className="space-y-3">
                <Button
                  className="w-full h-11 rounded-lg"
                  onClick={() => setIsApproveModalOpen(true)}
                >
                  Chấp thuận đơn
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-lg border-red-100 text-red-600 hover:bg-red-50 font-semibold"
                  onClick={() => setIsRejectModalOpen(true)}
                >
                  Từ chối đơn
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================
  // VIEW: WARNING JOBS MODERATION
  // ==========================================================
  const renderWarningJobs = () => {
    const jobs = warningJobsData?.items || [];
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 px-2 font-medium">
            Phát hiện{' '}
            <span className="text-amber-600 font-bold">{jobs.length}</span> công
            việc có dấu hiệu vi phạm
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
            className="rounded-lg h-9"
          >
            Tất cả (Warning)
          </Button>
        </div>

        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Công việc</th>
                  <th className="px-6 py-4 font-semibold">Công ty</th>
                  <th className="px-6 py-4 font-semibold">Nghề nghiệp</th>
                  <th className="px-6 py-4 font-semibold">Ngày đăng</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingWarningJobs ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-10 text-center text-slate-400 font-medium"
                    >
                      Đang tải danh sách...
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-10 text-center text-slate-400 font-medium"
                    >
                      Không có công việc nghi vấn
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <Link
                          to={`/job/${job.id}`}
                          target="_blank"
                          className="text-sm font-semibold text-blue-600 hover:underline"
                        >
                          {job.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {job.address}
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-700 text-[10px] font-bold border-amber-200"
                          >
                            Dấu hiệu vi phạm (AI)
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {job.company?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant="outline" className="font-normal">
                          {job.occupation?.name || '—'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-lg px-4 font-semibold"
                            onClick={() =>
                              handleUpdateJobStatus(job.id, 'PUBLISHED')
                            }
                          >
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-lg px-4"
                            onClick={() =>
                              handleUpdateJobStatus(job.id, 'DELETED')
                            }
                          >
                            Xóa
                          </Button>
                        </div>
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
                  <th className="px-6 py-4 font-semibold">Lý do</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingReports ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400 font-medium">Đang tải...</td>
                  </tr>
                ) : !listReportsData?.data?.length ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400 font-medium">Không có báo cáo nào</td>
                  </tr>
                ) : (
                  listReportsData.data.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-sm font-semibold">{r.job?.title || '—'}</td>
                      <td className="px-6 py-4 text-sm">{r.reporter?.email || '—'}</td>
                      <td className="px-6 py-4 text-sm text-red-600 font-medium">{r.reason}</td>
                      <td className="px-6 py-4 text-sm"><Badge variant="outline">{r.status}</Badge></td>
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
  // VIEW 3: COMPANY LIST
  // ==========================================================
  const renderCompanyList = () => {
    return (
      <div className="space-y-4">
        {/* Toolbar: Search */}
        <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm công ty..."
              className="pl-9 rounded-lg h-10 border-slate-200 focus:border-blue-500 bg-slate-50/50"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
          <p className="text-sm text-slate-500 px-2 font-medium">
            Hiển thị{' '}
            <span className="text-blue-600 font-bold">
              {displayList.length}
            </span>{' '}
            đơn
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
                      colSpan="4"
                      className="py-20 text-center text-slate-400 font-medium"
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : displayList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-20 text-center text-slate-400"
                    >
                      Không tìm thấy dữ liệu nào phù hợp.
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
                            <p className="text-xs text-slate-400 font-normal">
                              {c.owner?.email || 'Chưa có email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {c.address || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={
                            STATUS_COLORS[c.status]?.color +
                            ' border font-normal px-2 py-0.5 rounded-md text-[10px]'
                          }
                        >
                          {STATUS_COLORS[c.status]?.label}
                        </Badge>
                        {c.status === 'REJECTED' && c.rejectionReason && (
                          <p
                            className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate italic"
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
                          className="rounded-lg bg-primary-muted border-primary/20 text-primary-muted-foreground hover:bg-primary/10 hover:border-primary/30 transition-colors"
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
            {MANAGEMENT_MENU.find((m) => m.key === currentTab)?.label}
          </h2>
          {currentTab === 'job_reports'
            ? renderJobReports()
            : currentTab === 'job_warning'
            ? renderWarningJobs()
            : viewingCompanyId ? renderDetails() : renderCompanyList()}
        </div>
      </div>

      {/* --- CONFIRMATION MODALS --- */}
      <Modal
        open={isApproveModalOpen}
        title="Đồng ý duyệt đơn?"
        description="Sau khi duyệt, công ty có thể bắt đầu đăng tin tuyển dụng."
        confirmLabel="Đồng ý duyệt"
        onConfirm={() => handleReviewCompany('APPROVED')}
        onClose={() => setIsApproveModalOpen(false)}
      />

      <Modal
        open={isRejectModalOpen}
        title="Lý do từ chối đơn"
        confirmLabel="Gửi thông báo"
        tone="danger"
        onConfirm={() => handleReviewCompany('REJECTED')}
        onClose={() => setIsRejectModalOpen(false)}
      >
        <textarea
          className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 focus:border-red-400 outline-none text-sm bg-white"
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
              <p className="text-sm font-semibold text-red-700">{viewingReport.reason}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Mô tả chi tiết</p>
              <p className="text-sm text-slate-700">{viewingReport.description || 'Không có mô tả chi tiết'}</p>
            </div>

            {viewingReport.status === 'PENDING' && (
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button 
                  className="flex-1" 
                  onClick={() => handleReviewReport('RESOLVED')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Đã giải quyết
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

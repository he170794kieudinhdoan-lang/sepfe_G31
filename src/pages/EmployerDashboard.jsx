import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/shared/components/EmptyState';
import { Modal } from '@/shared/components/Modal';
import { Outlet, NavLink, Link } from "react-router-dom"
import { DashboardLayout } from '@/shared/components/Layout/DashboardLayout';
import { useToast } from '@/shared/contexts/ToastContext';
import { CompanyRegisterPage } from '@/pages/CompanyRegisterPage';
import { CreateJobPage } from '@/pages/CreateJobPage';
import { EditJobPage } from '@/pages/EditJobPage';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Briefcase,
  Users,
  Eye,
  Plus,
  Search,
  Filter,
  Download,
  Building,
  TrendingUp,
  Clock,
  MapPin,
  DollarSign,
  CalendarCheck,
  Mail,
  Phone,
  BarChart3,
  Building2,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Globe,
  Home,
  LayoutDashboard,
  MessageCircle,
} from 'lucide-react';
import { useGetMyCompany } from '@/features/companies/api/useGetCompanies';
import { useJobsForEmployer } from '@/features/jobs/api/useJobs';
import { useDeleteJob } from '@/features/jobs/useJobMutation';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';

const EMPLOYER_MENU = [
  { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { key: 'jobs', label: 'Tin tuyển dụng', icon: Briefcase },
  { key: 'applicants', label: 'Ứng viên', icon: Users },
  { key: 'stats', label: 'Thống kê', icon: BarChart3 },
  { key: 'chat', label: 'Tin nhắn', icon: MessageCircle, path: '/chat' },
  { key: 'home', label: 'Trang chủ', icon: Home, path: '/' },
];

const MOCK_KPI = [
  {
    label: 'Tin đã đăng',
    value: '24',
    icon: Briefcase,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    trend: '+12%',
  },
  {
    label: 'Tin hoạt động',
    value: '18',
    icon: TrendingUp,
    color: 'text-green-600',
    bg: 'bg-green-100',
    trend: '+5%',
  },
  {
    label: 'Ứng viên mới',
    value: '156',
    icon: Users,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    trend: '+24%',
  },
  {
    label: 'Lượt xem tin',
    value: '1,240',
    icon: Eye,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    trend: '+18%',
  },
];

const MOCK_APPLICANTS = [
  {
    id: 1,
    workerName: 'Nguyễn Văn Anh',
    avatar:
      'https://ui-avatars.com/api/?name=Nguyễn+Văn+Anh&background=e0e7ff&color=4338ca',
    appliedDate: '2025-02-05',
    status: 'Pending',
    jobTitle: 'Nhân viên kho vận ca đêm',
    email: 'nva@example.com',
    phone: '0901 234 567',
  },
  {
    id: 2,
    workerName: 'Trần Thị Bình',
    avatar:
      'https://ui-avatars.com/api/?name=Trần+Thị+Bình&background=dcfce7&color=15803d',
    appliedDate: '2025-02-04',
    status: 'Reviewed',
    jobTitle: 'Nhân viên kho vận ca đêm',
    email: 'ttb@example.com',
    phone: '0902 345 678',
  },
  {
    id: 3,
    workerName: 'Lê Văn Cường',
    avatar:
      'https://ui-avatars.com/api/?name=Lê+Văn+Cường&background=fef3c7&color=b45309',
    appliedDate: '2025-02-01',
    status: 'Contacting',
    jobTitle: 'Phục vụ nhà hàng part-time',
    email: 'lvc@example.com',
    phone: '0903 456 789',
  },
  {
    id: 4,
    workerName: 'Phạm Thị Duyên',
    avatar:
      'https://ui-avatars.com/api/?name=Phạm+Thị+Duyên&background=fee2e2&color=b91c1c',
    appliedDate: '2025-01-30',
    status: 'Rejected',
    jobTitle: 'Giám sát bán hàng (Supervisor)',
    email: 'ptd@example.com',
    phone: '0904 567 890',
  },
];

// Reusable Helper Components
const StatusBadge = ({ status }) => {
  const statusConfig = {
    PUBLISHED: {
      color: 'bg-green-100 text-green-800 border-green-200',
      label: 'Đang hiển thị',
    },
    PENDING: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'Chờ duyệt',
    },
    EXPIRED: {
      color: 'bg-red-100 text-red-800 border-red-200',
      label: 'Hết hạn',
    },
    REJECTED: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      label: 'Bị từ chối',
    },
    WARNING: {
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      label: 'Cảnh báo',
    },
  };

  const config = statusConfig[status] || {
    color: 'bg-gray-100 text-gray-800',
    label: status,
  };

  return (
    <Badge variant="outline" className={`font-medium ${config.color}`}>
      {config.label}
    </Badge>
  );
};

const ApplicantStatusBadge = ({ status }) => {
  const statusConfig = {
    Pending: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'Chờ xử lý',
    },
    Reviewed: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      label: 'Đã xem',
    },
    Contacting: {
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      label: 'Đang liên hệ',
    },
    Rejected: {
      color: 'bg-red-100 text-red-800 border-red-200',
      label: 'Từ chối',
    },
  };

  const config = statusConfig[status] || {
    color: 'bg-gray-100 text-gray-800',
    label: status,
  };

  return (
    <Badge variant="outline" className={`font-medium ${config.color}`}>
      {config.label}
    </Badge>
  );
};

export const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [active, setActive] = useState('overview');
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [createJobModalOpen, setCreateJobModalOpen] = useState(false);
  const [editJobId, setEditJobId] = useState(null);

  // Applicant details
  const [applicantDetail, setApplicantDetail] = useState(null);
  const [applicantStatus, setApplicantStatus] = useState('');

  // Filtering states
  const [jobSearchText, setJobSearchText] = useState('');
  const [selectedJobIdFilter, setSelectedJobIdFilter] = useState('');

  // Real API integration
  const [jobPage, setJobPage] = useState(1);
  const { data: company, isLoading: loadingCompany } = useGetMyCompany();
  const { data: searchResult, isLoading: loadingJobs } = useJobsForEmployer({
    allStatus: true,
    page: jobPage,
    limit: 10,
  });
  const { mutate: deleteJob } = useDeleteJob();

  const jobs = searchResult?.items || [];
  const totalPages = searchResult?.meta?.totalPage || 1;

  useEffect(() => {
    if (loadingCompany) return;
    if (!company?.id) {
      setCompanyModalOpen(true);
    }
  }, [company, loadingCompany]);

  const handleDeleteJob = () => {
    if (!deleteConfirm || !company?.id) return;
    deleteJob(
      { companyId: company.id, jobId: deleteConfirm.id },
      {
        onSuccess: () => {
          toast('Xóa tin tuyển dụng thành công', 'success');
          setDeleteConfirm(null);
        },
        onError: (error) => {
          const message = error?.response?.data?.message || 'Xóa tin thất bại';
          toast(Array.isArray(message) ? message.join(', ') : message, 'error');
        },
      },
    );
  };

  const handleBoostCheckout = () => {
    setBoostModalOpen(false);
    toast('Thanh toán thành công. Tính năng đã được mở khóa.', 'success');
  };

  const handleExportApplicants = () => {
    toast('Đã xuất thông tin ứng viên ra file CSV.', 'success');
  };

  const handleSaveApplicantStatus = () => {
    if (!applicantStatus) return;
    // Mock save for now as there is no specific applicant status API yet
    toast('Cập nhật trạng thái ứng viên thành công!', 'success');
    setApplicantDetail((prev) => ({ ...prev, status: applicantStatus }));
  };

  const hasNoCompany = !company?.id;
  const isRejected = company?.id && company?.status === 'REJECTED';
  const isPending = company?.id && company?.status === 'PENDING';
  const isApproved =
    company?.id &&
    company?.status !== 'PENDING' &&
    company?.status !== 'REJECTED';

  // ===== LOADING STATE =====
  if (loadingCompany) {
    return (
      <DashboardLayout
        title="Employer Dashboard"
        menu={EMPLOYER_MENU}
        activeKey={active}
        onSelect={setActive}
      >
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Đang tải dữ liệu doanh nghiệp...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Employer Dashboard"
      menu={EMPLOYER_MENU}
      activeKey={active}
      onSelect={setActive}
      topbarBell={<NotificationBellPopover />}
    >
      {/* ===== NO COMPANY GATE ===== */}
      {hasNoCompany && !companyModalOpen && (
        <div className="flex flex-col items-center justify-center py-24 px-4 overflow-y-auto">
          <div className="max-w-md w-full text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Building2 size={36} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Bạn chưa có hồ sơ doanh nghiệp
            </h2>
            <p className="text-slate-500 text-sm mb-8">
              Để bắt đầu đăng tin tuyển dụng và quản lý ứng viên, bạn cần đăng
              ký thông tin công ty trước. Chỉ mất vài phút!
            </p>
            <Button
              className="rounded-xl gap-2 px-8 h-12 text-base shadow-sm"
              onClick={() => setCompanyModalOpen(true)}
            >
              Đăng ký doanh nghiệp ngay
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      )}

      {/* ===== DASHBOARD CONTENT (chỉ hiện khi đã có công ty) ===== */}
      {!hasNoCompany && (
        <>
          {/* OVERVIEW TAB */}
          {active === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500 overflow-y-auto pb-6">
              {/* Welcome Banner */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    {company?.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt="logo"
                        className="w-[72px] h-[72px] rounded-[18px] border border-slate-100 object-cover shadow-sm bg-white"
                      />
                    ) : (
                      <div className="w-[72px] h-[72px] rounded-[18px] bg-primary/5 flex items-center justify-center border border-primary/10 shadow-sm">
                        <Building className="w-8 h-8 text-primary/60" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-[22px] md:text-2xl font-bold text-slate-800 tracking-tight">
                        Chào mừng trở lại, {company?.name || 'Doanh nghiệp'} 👋
                      </h2>
                      {isRejected ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 border border-red-200/60 shadow-sm">
                          <AlertCircle size={14} /> Bị từ chối
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 border border-amber-200/60 shadow-sm">
                          <Clock size={14} /> Chờ duyệt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600 border border-green-200/60 shadow-sm">
                          <CheckCircle2 size={14} /> Đã xác thực
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {company?.taxCode && (
                        <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 transition-colors">
                          <Building2 size={14} className="text-slate-400" />
                          <span>MST: {company.taxCode}</span>
                        </div>
                      )}
                      {company?.website && (
                        <a
                          href={
                            company.website.startsWith('http')
                              ? company.website
                              : `https://${company.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[13px] font-medium hover:underline hover:text-primary-hover underline-offset-4  bg-slate-50 px-3 py-1.5 rounded-lg border  transition-all"
                        >
                          <Globe size={18} />
                          {company.website}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <Button
                    variant="outline"
                    className="w-full md:w-auto h-11 px-5 rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm text-[14px] font-semibold text-slate-700"
                    onClick={() => setCompanyModalOpen(true)}
                  >
                    {isRejected ? 'Chỉnh sửa hồ sơ' : 'Cập nhật thông tin'}
                  </Button>
                  {isApproved && (
                    <Button
                      onClick={() => setCreateJobModalOpen(true)}
                      className="w-full md:w-auto h-11 px-5 rounded-xl gap-2 shadow-sm text-[14px] font-semibold"
                    >
                      <Plus size={16} /> Đăng tin mới
                    </Button>
                  )}
                </div>
              </div>

              {/* Status Alert */}
              {isRejected && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-200">
                    <AlertCircle size={16} className="text-red-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-800">
                      Hồ sơ đã bị từ chối
                    </p>
                    <p className="text-sm text-red-700 mt-0.5">
                      Quản trị viên đã từ chối hồ sơ doanh nghiệp của bạn. Vui
                      lòng chỉnh sửa thông tin và gửi lại để được xét duyệt.
                    </p>
                  </div>
                </div>
              )}
              {isPending && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-200">
                    <Clock size={16} className="text-amber-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800">
                      Hồ sơ đang chờ xét duyệt
                    </p>
                    <p className="text-sm text-amber-700 mt-0.5">
                      Quản trị viên đang xem xét hồ sơ doanh nghiệp của bạn. Bạn
                      có thể chỉnh sửa thông tin trong thời gian chờ, nhưng chưa
                      thể đăng tin tuyển dụng.
                    </p>
                  </div>
                </div>
              )}

              {/* KPI Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {MOCK_KPI.map((item, idx) => (
                  <Card
                    key={idx}
                    className="p-6 rounded-2xl shadow-sm border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-xl ${item.bg}`}>
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 font-medium"
                      >
                        {item.trend}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <p className="text-4xl font-bold text-slate-800">
                        {item.value}
                      </p>
                      <p className="text-sm font-medium text-slate-500 mt-1">
                        {item.label}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Quick Actions & Recent Applicants Preview */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column: Recent Jobs */}
                <Card className="md:col-span-2 p-6 rounded-2xl shadow-sm border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-slate-800">
                      Tin tuyển dụng gần đây
                    </h3>
                    <Button
                      variant="link"
                      onClick={() => setActive('jobs')}
                      className="text-primary pr-0 font-semibold"
                    >
                      Xem tất cả
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {loadingJobs ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-primary" />
                      </div>
                    ) : jobs.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">
                        Chưa có tin tuyển dụng nào.
                      </p>
                    ) : (
                      jobs.slice(0, 3).map((job) => (
                        <div
                          key={job.id}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors gap-4"
                        >
                          <div>
                            <p className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                              {job.title}
                            </p>
                            <div className="flex gap-4 mt-2 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />{' '}
                                {job.province || 'Toàn quốc'}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign size={14} />{' '}
                                {job.salaryMax
                                  ? `${(job.salaryMax / 1000000).toFixed(0)}Tr`
                                  : 'Thỏa thuận'}
                              </span>
                            </div>
                          </div>
                          <StatusBadge status={job.status} />
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {/* Right Column: Mini Applicants */}
                <Card className="p-6 rounded-2xl shadow-sm border-slate-100">
                  <h3 className="font-bold text-lg text-slate-800 mb-6">
                    Ứng viên mới nhất
                  </h3>
                  <div className="space-y-4">
                    {MOCK_APPLICANTS.slice(0, 4).map((app) => (
                      <div key={app.id} className="flex items-center gap-3">
                        <img
                          src={app.avatar}
                          alt="avatar"
                          className="w-10 h-10 rounded-full border border-slate-200"
                        />
                        <div className="flex-1 overflow-hidden">
                          <p className="font-medium text-sm text-slate-800 truncate">
                            {app.workerName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {app.jobTitle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-6 rounded-xl font-semibold border-slate-200"
                    onClick={() => setActive('applicants')}
                  >
                    Quản lý ứng viên
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {/* JOBS TAB */}
          {active === 'jobs' && (
            <div className="space-y-6 animate-in fade-in py-2 overflow-y-auto pb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Quản lý tin tuyển dụng
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Tạo và theo dõi các vị trí đang tuyển của công ty.
                  </p>
                </div>
                {isApproved && (
                  <Button
                    className="rounded-xl gap-2 shadow-sm w-full sm:w-auto font-semibold px-6"
                    onClick={() => setCreateJobModalOpen(true)}
                  >
                    <Plus size={18} /> Tạo tin mới
                  </Button>
                )}
              </div>

              <Card className="p-4 rounded-2xl shadow-sm border-slate-100">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm công việc..."
                      className="pl-9 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                      value={jobSearchText}
                      onChange={(e) => setJobSearchText(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl gap-2 bg-white border-slate-200 font-medium"
                  >
                    <Filter size={16} /> Lọc trạng thái
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                      <tr>
                        <th className="py-4 px-4 rounded-tl-xl whitespace-nowrap">
                          Vị trí tuyển dụng
                        </th>
                        <th className="px-4 whitespace-nowrap text-center">
                          Trạng thái
                        </th>
                        <th className="px-4 whitespace-nowrap text-center">
                          Số lượng
                        </th>
                        <th className="px-4 whitespace-nowrap text-center">
                          Ngày đăng
                        </th>
                        <th className="px-4 whitespace-nowrap text-center">
                          Tính năng
                        </th>
                        <th className="px-4 rounded-tr-xl whitespace-nowrap text-center">
                          Tùy chọn
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingJobs ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="py-12 text-center text-slate-500"
                          >
                            <Loader2 className="animate-spin mx-auto text-primary" />
                          </td>
                        </tr>
                      ) : jobs.filter((j) =>
                          j.title
                            .toLowerCase()
                            .includes(jobSearchText.toLowerCase()),
                        ).length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="py-12 text-center text-slate-500"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Search className="w-8 h-8 text-slate-300" />
                              <p>Không tìm thấy tin tuyển dụng nào.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        jobs
                          .filter((j) =>
                            j.title
                              .toLowerCase()
                              .includes(jobSearchText.toLowerCase()),
                          )
                          .map((job) => (
                            <tr
                              key={job.id}
                              className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="py-4 px-4">
                                <p className="font-semibold text-slate-800">
                                  {job.title}
                                </p>
                                <div className="flex gap-3 mt-1 text-slate-500 text-xs">
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} />{' '}
                                    {job.province || 'Toàn quốc'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign size={12} />{' '}
                                    {job.salaryMin
                                      ? `${(job.salaryMin / 1000000).toFixed(0)}M`
                                      : '?'}{' '}
                                    -{' '}
                                    {job.salaryMax
                                      ? `${(job.salaryMax / 1000000).toFixed(0)}M`
                                      : '?'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 text-center">
                                <StatusBadge status={job.status} />
                              </td>
                              <td className="px-4 font-medium text-slate-700 text-center">
                                {job.quantity}
                              </td>
                              <td className="px-4 text-center">
                                <span className="flex items-center justify-center gap-2 text-slate-600">
                                  <CalendarCheck
                                    size={14}
                                    className="text-slate-400"
                                  />
                                  {new Date(job.createdAt).toLocaleDateString(
                                    'vi-VN',
                                  )}
                                </span>
                              </td>
                              <td className="px-4 text-center">
                                {job.boosted ? (
                                  <Badge
                                    variant="secondary"
                                    className="bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer"
                                  >
                                    Đang Boost 🚀
                                  </Badge>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-lg"
                                    onClick={() => setBoostModalOpen(true)}
                                  >
                                    Nâng cấp
                                  </Button>
                                )}
                              </td>
                              <td className="px-4 text-center">
                                <div className="flex justify-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg text-slate-600 hover:text-primary transition-all border-slate-200"
                                    onClick={() => setEditJobId(job.id)}
                                  >
                                    Sửa
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all border-slate-200"
                                    onClick={() => setDeleteConfirm(job)}
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-2">
                    <span className="text-sm text-slate-500">
                      Trang {jobPage} / {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setJobPage((p) => Math.max(1, p - 1))}
                        disabled={jobPage === 1 || loadingJobs}
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() =>
                          setJobPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={jobPage === totalPages || loadingJobs}
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* APPLICANTS TAB */}
          {active === 'applicants' && (
            <div className="space-y-6 animate-in fade-in py-2 overflow-y-auto pb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Danh sách ứng viên
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    {' '}
                    Xem và quản lý các hồ sơ đã nộp vào công ty bạn.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl gap-2 shadow-sm border-slate-200 font-medium"
                  onClick={handleExportApplicants}
                >
                  <Download size={16} /> Xuất dữ liệu
                </Button>
              </div>

              <div className="flex flex-col xl:flex-row gap-6">
                {/* Left/Top: Filters + List */}
                <div
                  className={`space-y-4 transition-all ${applicantDetail ? 'xl:w-1/2' : 'w-full'}`}
                >
                  <Card className="p-4 rounded-2xl shadow-sm border-slate-100 flex flex-wrap gap-3">
                    <select
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm bg-slate-50 flex-1 min-w-[200px] outline-none focus:border-primary transition-all"
                      value={selectedJobIdFilter}
                      onChange={(e) => setSelectedJobIdFilter(e.target.value)}
                    >
                      <option value="">-- Lọc theo công việc --</option>
                      {jobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title}
                        </option>
                      ))}
                    </select>
                    <select className="rounded-xl border border-slate-200 px-4 py-2 text-sm bg-slate-50 flex-1 min-w-[150px] outline-none">
                      <option value="">Trạng thái</option>
                      <option value="Pending">Chờ xử lý</option>
                      <option value="Reviewed">Đã xem</option>
                      <option value="Rejected">Từ chối</option>
                    </select>
                  </Card>

                  {MOCK_APPLICANTS.length === 0 ? (
                    <EmptyState
                      title="Chưa có ứng viên nào."
                      description="Khi có ứng viên nộp hồ sơ, dữ liệu sẽ hiển thị ở đây."
                    />
                  ) : (
                    <div className="space-y-3">
                      {MOCK_APPLICANTS.map((a) => (
                        <Card
                          key={a.id}
                          className={`p-4 rounded-2xl shadow-sm border transition-all cursor-pointer hover:border-primary hover:shadow-md ${applicantDetail?.id === a.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-slate-100'}`}
                          onClick={() => {
                            setApplicantDetail(a);
                            setApplicantStatus(a.status);
                          }}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={a.avatar}
                                alt="avatar"
                                className="w-12 h-12 rounded-full shadow-sm object-cover border border-slate-100"
                              />
                              <div className="overflow-hidden">
                                <h4 className="font-semibold text-slate-800 truncate">
                                  {a.workerName}
                                </h4>
                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                  <Briefcase size={12} /> {a.jobTitle}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <ApplicantStatusBadge status={a.status} />
                              <p className="text-xs text-slate-400 mt-2 flex items-center justify-end gap-1">
                                <Clock size={12} /> {a.appliedDate}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Side: Detail Viewer */}
                {applicantDetail && (
                  <div className="xl:w-1/2 animate-in slide-in-from-right-8 duration-300">
                    <Card className="p-6 rounded-2xl shadow-lg border-primary/20 bg-white sticky top-4">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <Users className="text-primary" /> Chi tiết hồ sơ
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8 hover:bg-slate-100"
                          onClick={() => setApplicantDetail(null)}
                        >
                          <X size={18} />
                        </Button>
                      </div>

                      <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
                        <img
                          src={applicantDetail.avatar}
                          className="w-20 h-20 rounded-2xl shadow-sm object-cover"
                          alt="avatar"
                        />
                        <div>
                          <h2 className="text-xl font-bold text-slate-800">
                            {applicantDetail.workerName}
                          </h2>
                          <div className="text-sm text-slate-500 mt-2 space-y-1">
                            <p className="flex items-center gap-2">
                              <Mail size={14} /> {applicantDetail.email}
                            </p>
                            <p className="flex items-center gap-2">
                              <Phone size={14} /> {applicantDetail.phone}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-6 space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-500">
                            Vị trí ứng tuyển
                          </p>
                          <p className="font-semibold text-slate-800 mt-1">
                            {applicantDetail.jobTitle}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">
                            Câu trả lời khảo sát
                          </p>
                          <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 mt-2 border border-slate-100 leading-relaxed">
                            <p>
                              <strong>1. Kinh nghiệm của bạn:</strong> Tôi có 2
                              năm làm việc tại vị trí tương đương...
                            </p>
                            <br />
                            <p>
                              <strong>2. Lý do chọn chúng tôi:</strong> Công ty
                              có môi trường làm việc năng động và chế độ tốt...
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100 bg-slate-300/10 -mx-6 -mb-6 p-6 rounded-b-2xl">
                        <p className="text-sm font-medium text-slate-700 mb-3">
                          Cập nhật trạng thái ứng viên
                        </p>
                        <div className="flex items-center gap-3">
                          <select
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm bg-white flex-1 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                            value={applicantStatus}
                            onChange={(e) => setApplicantStatus(e.target.value)}
                          >
                            <option value="Pending">Chờ xử lý</option>
                            <option value="Reviewed">Đã xem hồ sơ</option>
                            <option value="Contacting">
                              Đang liên hệ / Phỏng vấn
                            </option>
                            <option value="Rejected">Từ chối</option>
                          </select>
                          <Button
                            className="rounded-xl px-6 font-semibold"
                            onClick={handleSaveApplicantStatus}
                          >
                            Lưu lại
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STATS TAB */}
          {active === 'stats' && (
            <div className="space-y-6 animate-in fade-in py-2 overflow-y-auto pb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Báo cáo & Thống kê
              </h2>

              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {MOCK_KPI.map((item, idx) => (
                  <Card
                    key={idx}
                    className="p-6 rounded-2xl shadow-sm border-slate-100 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-xl ${item.bg}`}>
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-4xl font-bold text-slate-800">
                        {item.value}
                      </p>
                      <p className="text-sm font-medium text-slate-500 mt-1">
                        {item.label}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-6 rounded-2xl shadow-sm border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <BarChart3 className="text-primary" /> Hiệu suất tuyển dụng
                  tháng này
                </h3>

                {/* Fake Chart Area */}
                <div className="h-64 rounded-xl bg-linear-to-br from-indigo-50 to-blue-50 border border-dashed border-blue-200 flex flex-col items-center justify-center text-blue-400">
                  <BarChart3 size={48} className="mb-2 opacity-50" />
                  <p className="font-medium text-sm">
                    Biểu đồ đang được cập nhật
                  </p>
                </div>

                <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-sm text-slate-500">
                      Tỉ lệ chuyển đổi (View/Apply)
                    </p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      12.5%
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-sm text-slate-500">
                      Chi phí trung bình / CV
                    </p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      15,000đ
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-sm text-slate-500">
                      Tỉ lệ phỏng vấn thành công
                    </p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      45%
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
          {/* end !hasNoCompany */}
        </>
      )}

      {/* --- MODALS --- */}
      {createJobModalOpen && (
        <CreateJobPage
          onBack={() => setCreateJobModalOpen(false)}
          onSuccess={() => {
            setCreateJobModalOpen(false);
            // Re-fetch jobs would be ideal, but rely on useChatRealtime/invalidate if implemented
          }}
        />
      )}
      {editJobId && (
        <EditJobPage
          jobIdProp={editJobId}
          onBack={() => setEditJobId(null)}
          onSuccess={() => setEditJobId(null)}
        />
      )}
      <Modal
        open={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        variant="custom"
      >
        <CompanyRegisterPage
          isModal
          onSuccess={() => {
            setCompanyModalOpen(false);
          }}
          onBack={() => setCompanyModalOpen(false)}
        />
      </Modal>

      <Modal
        open={!!deleteConfirm}
        title="Xóa tin tuyển dụng"
        description="Bạn có chắc chắn muốn xóa tin này không? Dữ liệu không thể khôi phục."
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteJob}
        confirmLabel="Vâng, Xóa ngay"
        cancelLabel="Hủy"
        tone="danger"
      />

      <Modal
        open={boostModalOpen}
        title="Nâng cấp tin đăng"
        description="Tin tuyển dụng của bạn sẽ được hiển thị ở vị trí hàng đầu để thu hút nhiều ứng viên hơn."
        onClose={() => setBoostModalOpen(false)}
        onConfirm={handleBoostCheckout}
        confirmLabel="Thanh toán"
        cancelLabel="Hủy"
      >
        <div className="space-y-4 mt-4">
          <label className="flex items-start gap-4 p-4 rounded-xl border border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
            <input
              type="radio"
              name="pkg"
              defaultChecked
              className="mt-1 w-4 h-4 text-primary"
            />
            <div>
              <p className="font-bold text-primary">Gói Đẩy Top 7 ngày 🔥</p>
              <p className="text-sm text-slate-600 mt-1">
                Hiển thị nổi bật trên trang chủ và đầu kết quả tìm kiếm.
              </p>
              <p className="font-bold text-slate-800 mt-2">100.000đ</p>
            </div>
          </label>
          <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
            <input type="radio" name="pkg" className="mt-1 w-4 h-4" />
            <div>
              <p className="font-bold text-slate-700">Gói Đẩy Top 30 ngày ⭐</p>
              <p className="text-sm text-slate-600 mt-1">
                Tiết kiệm hơn 30% so với gói tuần.
              </p>
              <p className="font-bold text-slate-800 mt-2">300.000đ</p>
            </div>
          </label>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

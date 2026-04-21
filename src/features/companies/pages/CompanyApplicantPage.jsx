import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/shared/components/EmptyState';
import { DashboardLayout } from '@/shared/components/Layout/DashboardLayout';
import { useToast } from '@/shared/contexts/ToastContext';
import {
  Users,
  Briefcase,
  Calendar,
  ArrowLeft,
  Eye,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Mail,
  Phone,
  MapPin,
  Download,
  Search,
} from 'lucide-react';

// ========================
// CONSTANTS
// ========================
const APPLICANT_STATUS = {
  APPLIED: {
    label: 'Đã nộp đơn ứng tuyển',
    className: 'bg-blue-100 text-blue-700 border-0',
  },
  REVIEWING: {
    label: 'Đang xem xét',
    className: 'bg-amber-100 text-amber-700 border-0',
  },
  ACCEPTED: {
    label: 'Đã chấp nhận',
    className: 'bg-emerald-100 text-emerald-700 border-0',
  },
  REJECTED: {
    label: 'Đã từ chối',
    className: 'bg-red-100 text-red-700 border-0',
  },
};

const MENU = [
  { key: 'list', label: 'Danh sách ứng viên' },
  { key: 'stats', label: 'Thống kê' },
];

// ========================
// MOCK DATA
// ========================
const MOCK_COMPANIES = [
  { id: 1, name: 'Công ty TNHH ABC Tech' },
  { id: 2, name: 'LogiFast Việt Nam' },
  { id: 3, name: 'Nhà máy May Đại Phong' },
  { id: 4, name: 'Chuỗi nhà hàng Phở Việt' },
];

const MOCK_JOBS = [
  { id: 1, companyId: 1, title: 'Frontend Developer (ReactJS)' },
  { id: 2, companyId: 1, title: 'Backend Engineer (NestJS)' },
  { id: 3, companyId: 3, title: 'Công nhân may - Ca sáng' },
  { id: 4, companyId: 4, title: 'Phục vụ nhà hàng' },
  { id: 5, companyId: 2, title: 'Nhân viên kho vận ca đêm' },
];

const MOCK_APPLICANTS = [
  {
    id: 1,
    jobId: 1,
    userId: 10,
    status: 'APPLIED',
    workerName: 'Nguyễn Văn An',
    phone: '0901234567',
    email: 'an.nguyen@mail.com',
    age: 25,
    gender: 'MALE',
    province: 'Hà Nội',
    appliedDate: '2025-02-10',
    updatedAt: '2025-02-10',
    answers: [
      {
        field: 'Kinh nghiệm làm việc',
        value: '2 năm kinh nghiệm ReactJS, TypeScript',
      },
      { field: 'Trình độ học vấn', value: 'Đại học - CNTT' },
    ],
  },
  {
    id: 2,
    jobId: 1,
    userId: 11,
    status: 'REVIEWING',
    workerName: 'Trần Thị Bình',
    phone: '0912345678',
    email: 'binh.tran@mail.com',
    age: 28,
    gender: 'FEMALE',
    province: 'TP.HCM',
    appliedDate: '2025-02-09',
    updatedAt: '2025-02-11',
    answers: [
      { field: 'Kinh nghiệm làm việc', value: '3 năm Frontend, VueJS & React' },
      { field: 'Trình độ học vấn', value: 'Thạc sĩ - Kỹ thuật phần mềm' },
    ],
  },
  {
    id: 3,
    jobId: 3,
    userId: 12,
    status: 'ACCEPTED',
    workerName: 'Lê Hoàng Cường',
    phone: '0923456789',
    email: 'cuong.le@mail.com',
    age: 32,
    gender: 'MALE',
    province: 'Bình Dương',
    appliedDate: '2025-02-08',
    updatedAt: '2025-02-12',
    answers: [{ field: 'Kinh nghiệm', value: '5 năm may công nghiệp' }],
  },
  {
    id: 4,
    jobId: 4,
    userId: 13,
    status: 'REJECTED',
    workerName: 'Phạm Minh Đức',
    phone: '0934567890',
    email: 'duc.pham@mail.com',
    age: 20,
    gender: 'MALE',
    province: 'Đà Nẵng',
    appliedDate: '2025-02-07',
    updatedAt: '2025-02-09',
    answers: [{ field: 'Kinh nghiệm', value: 'Chưa có kinh nghiệm' }],
  },
  {
    id: 5,
    jobId: 5,
    userId: 14,
    status: 'APPLIED',
    workerName: 'Võ Thị Hoa',
    phone: '0945678901',
    email: 'hoa.vo@mail.com',
    age: 27,
    gender: 'FEMALE',
    province: 'TP.HCM',
    appliedDate: '2025-02-12',
    updatedAt: '2025-02-12',
    answers: [
      { field: 'Kinh nghiệm kho vận', value: '1 năm' },
      { field: 'Sức khỏe', value: 'Tốt, có thể làm ca đêm' },
    ],
  },
  {
    id: 6,
    jobId: 2,
    userId: 15,
    status: 'REVIEWING',
    workerName: 'Đặng Quốc Gia',
    phone: '0956789012',
    email: 'gia.dang@mail.com',
    age: 30,
    gender: 'MALE',
    province: 'Hà Nội',
    appliedDate: '2025-02-11',
    updatedAt: '2025-02-13',
    answers: [
      {
        field: 'Kinh nghiệm Backend',
        value: '4 năm NodeJS, NestJS, PostgreSQL',
      },
      { field: 'Trình độ', value: 'Đại học - CNTT' },
    ],
  },
];

const getStatusBadge = (status) => {
  const cfg = APPLICANT_STATUS[status] || APPLICANT_STATUS.APPLIED;
  return (
    <Badge className={`rounded-lg text-xs ${cfg.className}`}>{cfg.label}</Badge>
  );
};

// ========================
// APPLICANT DETAIL
// ========================
const ApplicantDetail = ({ applicant, job, onBack, onChangeStatus }) => {
  const [newStatus, setNewStatus] = useState(applicant.status);

  return (
    <div className="space-y-6">
      <Button variant="outline" className="rounded-xl" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại danh sách
      </Button>

      {/* Worker Info */}
      <Card className="p-6 rounded-2xl shadow-sm border-0 bg-white">
        <div className="flex items-start gap-5 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shrink-0">
            <Users className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{applicant.workerName}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  User ID: {applicant.userId} • {applicant.age} tuổi •{' '}
                  {applicant.gender === 'MALE' ? 'Nam' : 'Nữ'}
                </p>
              </div>
              {getStatusBadge(applicant.status)}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span>{applicant.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{applicant.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{applicant.province}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>Ứng tuyển: {applicant.appliedDate}</span>
          </div>
        </div>
      </Card>

      {/* Job Info */}
      <Card className="p-5 rounded-2xl shadow-sm border-0 bg-white">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
          <Briefcase className="h-4 w-4 text-blue-500" /> Vị trí ứng tuyển
        </h3>
        <div className="p-4 rounded-xl bg-gray-50">
          <p className="font-medium">{job?.title || 'N/A'}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Job ID: {applicant.jobId}
          </p>
        </div>
      </Card>

      {/* Form Answers */}
      <Card className="p-5 rounded-2xl shadow-sm border-0 bg-white">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-blue-500" /> Câu trả lời form ứng
          tuyển
        </h3>
        {applicant.answers && applicant.answers.length > 0 ? (
          <div className="divide-y">
            {applicant.answers.map((a, i) => (
              <div key={i} className="py-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {a.field}
                </p>
                <p className="text-sm mt-1">{a.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Không có câu trả lời.</p>
        )}
      </Card>

      {/* Change Status */}
      <Card className="p-5 rounded-2xl shadow-sm border-0 bg-white">
        <h3 className="font-semibold mb-3 text-sm">Đổi trạng thái</h3>
        <div className="flex items-center gap-3">
          <select
            className="rounded-xl border px-4 py-2 text-sm bg-white"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="APPLIED">Đã nộp đơn ứng tuyển</option>
            <option value="REVIEWING">Đang xem xét</option>
            <option value="ACCEPTED">Đã chấp nhận</option>
            <option value="REJECTED">Đã từ chối</option>
          </select>
          <Button
            className="rounded-xl"
            size="sm"
            onClick={() => onChangeStatus(applicant.id, newStatus)}
            disabled={newStatus === applicant.status}
          >
            Lưu trạng thái
          </Button>
        </div>
      </Card>

      {/* Application Data Table */}
      <Card className="p-5 rounded-2xl shadow-sm border-0 bg-white">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-blue-500" /> Data Fields
          (JobApplication schema)
        </h3>
        <div className="divide-y text-sm">
          {[
            { label: 'id', value: applicant.id },
            { label: 'jobId', value: applicant.jobId },
            { label: 'userId', value: applicant.userId },
            { label: 'status', value: applicant.status, isStatus: true },
            { label: 'updatedAt', value: applicant.updatedAt },
          ].map((f, i) => (
            <div key={i} className="flex items-center py-2.5 gap-3">
              <span className="w-32 text-xs font-mono text-muted-foreground">
                {f.label}
              </span>
              <span className="font-medium">
                {f.isStatus ? getStatusBadge(f.value) : f.value}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ========================
// MAIN COMPONENT
// ========================
export const CompanyApplicantPage = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialCompanyId = searchParams.get('companyId') || '';

  const [active, setActive] = useState('list');
  const [selectedApplicantId, setSelectedApplicantId] = useState(null);

  // Filters
  const [companyFilter, setCompanyFilter] = useState(initialCompanyId);
  const [jobFilter, setJobFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filter jobs by company
  const availableJobs = useMemo(() => {
    if (!companyFilter) return MOCK_JOBS;
    return MOCK_JOBS.filter((j) => j.companyId === Number(companyFilter));
  }, [companyFilter]);

  // Filter applicants
  const filteredApplicants = useMemo(() => {
    return MOCK_APPLICANTS.filter((a) => {
      const job = MOCK_JOBS.find((j) => j.id === a.jobId);
      if (!job) return false;

      if (companyFilter && job.companyId !== Number(companyFilter))
        return false;
      if (jobFilter && a.jobId !== Number(jobFilter)) return false;
      if (statusFilter && a.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !a.workerName.toLowerCase().includes(q) &&
          !a.email.toLowerCase().includes(q)
        )
          return false;
      }
      if (dateFrom && a.appliedDate < dateFrom) return false;
      if (dateTo && a.appliedDate > dateTo) return false;

      return true;
    });
  }, [companyFilter, jobFilter, statusFilter, searchQuery, dateFrom, dateTo]);

  const selectedApplicant = MOCK_APPLICANTS.find(
    (a) => a.id === selectedApplicantId,
  );
  const selectedJob = selectedApplicant
    ? MOCK_JOBS.find((j) => j.id === selectedApplicant.jobId)
    : null;

  const handleChangeStatus = (id, newStatus) => {
    toast(
      `Đã cập nhật trạng thái ứng viên #${id} → ${APPLICANT_STATUS[newStatus]?.label || newStatus}`,
    );
    setSelectedApplicantId(null);
  };

  const handleExport = () => {
    toast('Đã xuất CSV (mock).');
  };

  const resetFilters = () => {
    setCompanyFilter('');
    setJobFilter('');
    setStatusFilter('');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
  };

  // Stats
  const stats = useMemo(() => {
    const all = MOCK_APPLICANTS;
    return {
      total: all.length,
      applied: all.filter((a) => a.status === 'APPLIED').length,
      reviewing: all.filter((a) => a.status === 'REVIEWING').length,
      accepted: all.filter((a) => a.status === 'ACCEPTED').length,
      rejected: all.filter((a) => a.status === 'REJECTED').length,
    };
  }, []);

  return (
    <DashboardLayout
      title="Quản lý ứng viên"
      menu={MENU}
      activeKey={active}
      onSelect={setActive}
    >
      {/* ==================== LIST ==================== */}
      {active === 'list' && (
        <div className="space-y-6">
          {selectedApplicant ? (
            <ApplicantDetail
              applicant={selectedApplicant}
              job={selectedJob}
              onBack={() => setSelectedApplicantId(null)}
              onChangeStatus={handleChangeStatus}
            />
          ) : (
            <>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Link to="/manager">
                    <Button variant="outline" className="rounded-xl" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-1" /> Manager
                    </Button>
                  </Link>
                  <h2 className="text-xl font-semibold">Danh sách ứng viên</h2>
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  size="sm"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4 mr-1" /> Xuất CSV
                </Button>
              </div>

              {/* KPI */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Tổng', value: stats.total, className: 'bg-white' },
                  {
                    label: 'Đã nộp đơn ứng tuyển',
                    value: stats.applied,
                    className: 'bg-blue-50',
                  },
                  {
                    label: 'Đang xem xét',
                    value: stats.reviewing,
                    className: 'bg-amber-50',
                  },
                  {
                    label: 'Đã chấp nhận',
                    value: stats.accepted,
                    className: 'bg-emerald-50',
                  },
                  {
                    label: 'Đã từ chối',
                    value: stats.rejected,
                    className: 'bg-red-50',
                  },
                ].map((s) => (
                  <Card
                    key={s.label}
                    className={`p-3 rounded-xl shadow-sm border-0 ${s.className}`}
                  >
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-bold mt-1">{s.value}</p>
                  </Card>
                ))}
              </div>

              {/* Filters */}
              <Card className="p-4 rounded-xl shadow-sm border-0">
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2 rounded-xl border px-3 py-1.5 bg-white">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm tên / email..."
                      className="border-0 bg-transparent focus-visible:ring-0 h-8 w-[180px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <select
                    className="rounded-xl border px-3 py-2 text-sm bg-white"
                    value={companyFilter}
                    onChange={(e) => {
                      setCompanyFilter(e.target.value);
                      setJobFilter('');
                    }}
                  >
                    <option value="">Tất cả công ty</option>
                    {MOCK_COMPANIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="rounded-xl border px-3 py-2 text-sm bg-white"
                    value={jobFilter}
                    onChange={(e) => setJobFilter(e.target.value)}
                  >
                    <option value="">Tất cả job</option>
                    {availableJobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>

                  <select
                    className="rounded-xl border px-3 py-2 text-sm bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="APPLIED">Đã nộp đơn ứng tuyển</option>
                    <option value="REVIEWING">Đang xem xét</option>
                    <option value="ACCEPTED">Đã chấp nhận</option>
                    <option value="REJECTED">Đã từ chối</option>
                  </select>

                  <Input
                    type="date"
                    className="max-w-[150px] rounded-xl"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                  <Input
                    type="date"
                    className="max-w-[150px] rounded-xl"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />

                  <Button
                    variant="outline"
                    className="rounded-xl"
                    size="sm"
                    onClick={resetFilters}
                  >
                    Reset
                  </Button>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {filteredApplicants.length} ứng viên
                  </span>
                </div>
              </Card>

              {/* Table */}
              {filteredApplicants.length === 0 ? (
                <EmptyState
                  title="Không có ứng viên"
                  description="Thử thay đổi bộ lọc để xem kết quả."
                />
              ) : (
                <Card className="p-4 rounded-xl shadow-sm border-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground border-b">
                      <tr>
                        <th className="py-2">ID</th>
                        <th>Ứng viên</th>
                        <th>Vị trí</th>
                        <th>Công ty</th>
                        <th>Trạng thái</th>
                        <th>Ngày ứng tuyển</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplicants.map((a) => {
                        const job = MOCK_JOBS.find((j) => j.id === a.jobId);
                        const company = job
                          ? MOCK_COMPANIES.find((c) => c.id === job.companyId)
                          : null;
                        return (
                          <tr
                            key={a.id}
                            className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 text-muted-foreground">
                              {a.id}
                            </td>
                            <td className="py-3">
                              <div>
                                <p className="font-medium">{a.workerName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {a.email}
                                </p>
                              </div>
                            </td>
                            <td>
                              <p className="text-sm">{job?.title || '—'}</p>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-sm">
                                  {company?.name || '—'}
                                </span>
                              </div>
                            </td>
                            <td>{getStatusBadge(a.status)}</td>
                            <td className="text-muted-foreground">
                              {a.appliedDate}
                            </td>
                            <td>
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl"
                                  onClick={() => setSelectedApplicantId(a.id)}
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" /> Xem
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* ==================== STATS ==================== */}
      {active === 'stats' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                label: 'Tổng ứng viên',
                value: stats.total,
                icon: Users,
                color: 'text-blue-600 bg-blue-50',
              },
              {
                label: 'Đang xem xét',
                value: stats.reviewing,
                icon: Clock,
                color: 'text-amber-600 bg-amber-50',
              },
              {
                label: 'Đã chấp nhận',
                value: stats.accepted,
                icon: CheckCircle,
                color: 'text-emerald-600 bg-emerald-50',
              },
              {
                label: 'Đã từ chối',
                value: stats.rejected,
                icon: XCircle,
                color: 'text-red-600 bg-red-50',
              },
            ].map((item) => (
              <Card
                key={item.label}
                className="p-5 rounded-xl shadow-sm border-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-2xl font-bold mt-2">{item.value}</p>
                  </div>
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.color}`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6 rounded-xl shadow-sm border-0">
            <h3 className="text-lg font-semibold mb-4">
              Thống kê theo công ty
            </h3>
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b">
                <tr>
                  <th className="py-2">Công ty</th>
                  <th>Tổng ứng viên</th>
                  <th>Applied</th>
                  <th>Reviewing</th>
                  <th>Accepted</th>
                  <th>Rejected</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_COMPANIES.map((c) => {
                  const companyJobs = MOCK_JOBS.filter(
                    (j) => j.companyId === c.id,
                  );
                  const companyJobIds = companyJobs.map((j) => j.id);
                  const companyApps = MOCK_APPLICANTS.filter((a) =>
                    companyJobIds.includes(a.jobId),
                  );
                  return (
                    <tr key={c.id} className="border-b last:border-b-0">
                      <td className="py-3 font-medium">{c.name}</td>
                      <td>{companyApps.length}</td>
                      <td>
                        {
                          companyApps.filter((a) => a.status === 'APPLIED')
                            .length
                        }
                      </td>
                      <td>
                        {
                          companyApps.filter((a) => a.status === 'REVIEWING')
                            .length
                        }
                      </td>
                      <td>
                        {
                          companyApps.filter((a) => a.status === 'ACCEPTED')
                            .length
                        }
                      </td>
                      <td>
                        {
                          companyApps.filter((a) => a.status === 'REJECTED')
                            .length
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <Card className="p-6 rounded-xl shadow-sm border-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Biểu đồ ứng tuyển</h3>
              <Badge variant="outline">Placeholder</Badge>
            </div>
            <div className="h-52 rounded-xl bg-gray-100 border border-dashed flex items-center justify-center text-muted-foreground">
              Chart placeholder
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/shared/components/EmptyState';
import { Modal } from '@/shared/components/Modal';
import { Outlet, NavLink } from 'react-router-dom';
import { DashboardLayout } from '@/shared/components/Layout/DashboardLayout';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';
import { CompanyRegisterPage } from '@/pages/CompanyRegisterPage';
import { CompanyService } from '@/features/companies/api/company.service';
import { useSearchJobs } from '@/features/jobs/useJobQueries';
import { useDeleteJob } from '@/features/jobs/useJobMutation';
import { Loader2, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

const EMPLOYER_MENU = [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'jobs', label: 'Tin tuyển dụng' },
  { key: 'applicants', label: 'Ứng viên' },
  { key: 'stats', label: 'Thống kê' },
];

const MOCK_KPI = [
  { label: 'Tin đã đăng', value: '24' },
  { label: 'Tin đang hoạt động', value: '18' },
  { label: 'Tổng đơn ứng tuyển', value: '156' },
  { label: 'Pending / Reviewed', value: '42 / 114' },
];

const MOCK_JOBS = [
  {
    id: 1,
    title: 'Nhân viên kho vận ca đêm',
    status: 'Active',
    created: '2025-02-01',
    boosted: true,
    boostEnd: '2025-03-01',
  },
  {
    id: 2,
    title: 'Phục vụ nhà hàng',
    status: 'Active',
    created: '2025-01-28',
    boosted: false,
  },
];

const MOCK_APPLICANTS = [
  {
    id: 1,
    workerName: 'Nguyễn Văn A',
    appliedDate: '2025-02-05',
    status: 'Pending',
  },
  {
    id: 2,
    workerName: 'Trần Thị B',
    appliedDate: '2025-02-04',
    status: 'Reviewed',
  },
];

export const EmployerDashboard = () => {
  const { toast } = useToast();
  const [active, setActive] = useState('overview');
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(MOCK_JOBS[0]?.id);
  const [applicantDetail, setApplicantDetail] = useState(null);
  const [applicantStatus, setApplicantStatus] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    salary: '',
    shifts: '',
    location: '',
    vacancies: '',
    sector: '',
  });

  const applicants = MOCK_APPLICANTS;

  // Real API integration
  const companyId = 1; // Hardcode tạm
  const [jobPage, setJobPage] = useState(1);
  const { data: searchResult, isLoading: loadingJobs } = useSearchJobs({
    companyId,
    allStatus: true,
    page: jobPage,
    limit: 10,
  });
  const { mutate: deleteJob } = useDeleteJob();
  const jobs = searchResult?.items || [];
  const totalPages = searchResult?.meta?.totalPage || 1;

  const openCreateJob = () => {
    setEditingJob(null);
    setForm({
      title: '',
      description: '',
      salary: '',
      shifts: '',
      location: '',
      vacancies: '',
      sector: '',
    });
    setJobModalOpen(true);
  };

  const openEditJob = (job) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      description: 'Mô tả...',
      salary: '10-12 triệu',
      shifts: 'Ca đêm',
      location: 'TP.HCM',
      vacancies: '5',
      sector: 'Kho vận',
    });
    setJobModalOpen(true);
  };

  const handleSaveJob = () => {
    if (!form.title?.trim()) {
      toast(MSG.MSG_REQUIRED_FIELDS, 'error');
      return;
    }
    setJobModalOpen(false);
    toast(editingJob ? MSG.MSG_JOB_SAVE_SUCCESS : 'Đã tạo tin.');
  };

  const handleDeleteJob = () => {
    deleteJob(
      { companyId, jobId: deleteConfirm.id },
      {
        onSuccess: () => {
          toast('Xóa tin tuyển dụng thành công', 'success');
          setDeleteConfirm(null);
        },
      },
    );
  };

  const handleBoostCheckout = () => {
    setBoostModalOpen(false);
    toast('Thanh toán thành công. Tính năng đã được mở khóa.');
  };

  const handleBoostCancel = () => {
    setBoostModalOpen(false);
    toast(MSG.MSG_PAYMENT_CANCELLED);
  };

  const handleExportApplicants = () => {
    toast('Đã xuất CSV (mock).');
  };

  const handleSaveApplicantStatus = () => {
    if (!applicantStatus) return;
    toast(MSG.MSG_CANDIDATE_UPDATE_FAIL, 'error');
  };

  const [company, setCompany] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  const fetchCompany = async () => {
    try {
      const companyData = await CompanyService.getMyCompany();
      setCompany(companyData);
    } catch {
      setCompany(null);
    } finally {
      setLoadingCompany(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const isLocked = company?.status !== 'APPROVED';

  useEffect(() => {
    if (isLocked && active !== 'overview') {
      setActive('overview');
    }
  }, [isLocked]);

  const filteredMenu = isLocked
    ? EMPLOYER_MENU.filter((item) => item.key === 'overview')
    : EMPLOYER_MENU;

  if (loadingCompany) {
    return null;
  }
  return (
    <DashboardLayout
      title="Employer Dashboard"
      menu={filteredMenu}
      activeKey={active}
      onSelect={(key) => {
        if (isLocked && key !== 'overview') return;
        setActive(key);
      }}
      topbarBell={<NotificationBellPopover />}
    >
      {active === 'overview' && (
        <div className="space-y-6">
          {isLocked && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              {company === null && 'Bạn chưa đăng ký công ty.'}
              {company?.status === 'PENDING' && 'Công ty đang chờ duyệt.'}
              {company?.status === 'REJECT' &&
                'Công ty bị từ chối. Vui lòng cập nhật lại.'}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button
              className="rounded-xl"
              onClick={() => setCompanyModalOpen(true)}
            >
              Đăng ký / Chỉnh sửa công ty
            </Button>
          </div>
          {!isLocked && (
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl font-semibold">Tổng quan</h2>
            </div>
          )}
          {!isLocked && (
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
              {MOCK_KPI.map((item) => (
                <Card key={item.label} className="p-5 rounded-xl shadow-sm">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold mt-2">{item.value}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {active === 'jobs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tin tuyển dụng</h2>
            <Button className="rounded-xl" onClick={openCreateJob}>
              Tạo tin tuyển dụng
            </Button>
          </div>
          <Card className="p-4 rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b">
                <tr>
                  <th className="py-2">Tiêu đề công việc</th>
                  <th>Trạng thái</th>
                  <th>Số lượng</th>
                  <th>Mức lương</th>
                  <th>Ngày tạo</th>
                  <th>Thời gian hết hạn bài viết</th>
                  <th>Boost</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loadingJobs ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-8 text-center text-muted-foreground"
                    >
                      <Loader2
                        className="animate-spin mx-auto mb-2 text-primary"
                        size={24}
                      />
                      Đang tải danh sách tin...
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-8 text-center text-muted-foreground"
                    >
                      Bạn chưa có tin tuyển dụng nào.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 font-medium">{job.title}</td>
                      <td>
                        <Badge
                          className={`rounded-lg ${
                            job.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : job.status === 'WARNING'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : job.status === 'EXPIRED'
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                  : job.status === 'REJECTED'
                                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                    : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {job.status}
                        </Badge>
                      </td>
                      <td>{job.quantity}</td>
                      <td>
                        {job.salaryMin && job.salaryMax
                          ? `${(job.salaryMin / 1000000).toFixed(1)} - ${(job.salaryMax / 1000000).toFixed(1)} Tr`
                          : job.salaryMin
                            ? `Từ ${(job.salaryMin / 1000000).toFixed(1)} Tr`
                            : job.salaryMax
                              ? `Tối đa ${(job.salaryMax / 1000000).toFixed(1)} Tr`
                              : 'Thoả thuận'}
                      </td>
                      <td>
                        {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td>
                        {job.expiredAt
                          ? new Date(job.expiredAt).toLocaleDateString('vi-VN')
                          : '-'}
                      </td>
                      <td>
                        {job.boosted ? (
                          <Check className="text-green-600 w-5 h-5" />
                        ) : (
                          <X className="text-red-500 w-5 h-5" />
                        )}
                      </td>
                      <td className="py-2 flex flex-wrap gap-2 items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                          asChild
                        >
                          <Link to={`/employer/jobs/${job.id}/edit`}>Sửa</Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                          onClick={() => setDeleteConfirm(job)}
                        >
                          Xóa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors hidden sm:inline-flex"
                        >
                          Xem ứng viên
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setJobPage((p) => Math.max(1, p - 1))}
                  disabled={jobPage === 1 || loadingJobs}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Trước
                </Button>
                <span className="text-sm font-medium">
                  Trang {jobPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setJobPage((p) => Math.min(totalPages, p + 1))}
                  disabled={jobPage === totalPages || loadingJobs}
                >
                  Sau
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {active === 'applicants' && (
        <div className="space-y-6">
          <Card className="p-4 rounded-xl shadow-sm flex flex-wrap gap-3 items-center">
            <select
              className="rounded-xl border px-4 py-2 text-sm bg-white"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(Number(e.target.value))}
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
            <select className="rounded-xl border px-4 py-2 text-sm bg-white">
              <option>Status</option>
              <option>Pending</option>
              <option>Reviewed</option>
            </select>
            <Input type="date" className="max-w-[160px] rounded-xl" />
            <Input type="date" className="max-w-[160px] rounded-xl" />
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={handleExportApplicants}
            >
              Xuất CSV/Excel
            </Button>
          </Card>

          {applicantDetail ? (
            <Card className="p-6 rounded-xl shadow-sm max-w-xl">
              <h3 className="font-semibold mb-4">Chi tiết ứng viên</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Họ tên</dt>
                  <dd className="font-medium">{applicantDetail.workerName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Ngày ứng tuyển</dt>
                  <dd>{applicantDetail.appliedDate}</dd>
                </div>
              </dl>
              <p className="text-sm text-muted-foreground mt-4">
                Câu trả lời form (mock)...
              </p>
              <div className="mt-4 flex items-center gap-2">
                <select
                  className="rounded-xl border px-3 py-2 text-sm"
                  value={applicantStatus || applicantDetail.status}
                  onChange={(e) => setApplicantStatus(e.target.value)}
                >
                  <option>Pending</option>
                  <option>Reviewed</option>
                  <option>Contacting</option>
                  <option>Rejected</option>
                </select>
                <Button
                  size="sm"
                  className="rounded-xl"
                  onClick={handleSaveApplicantStatus}
                >
                  Lưu trạng thái
                </Button>
              </div>
              <Button
                variant="outline"
                className="mt-4 rounded-xl"
                onClick={() => setApplicantDetail(null)}
              >
                Quay lại
              </Button>
            </Card>
          ) : applicants.length === 0 ? (
            <EmptyState
              title={MSG.MSG_CANDIDATE_EMPTY}
              description="Chưa có ứng viên nào."
            />
          ) : (
            <Card className="p-4 rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b">
                  <tr>
                    <th className="py-2">Worker name</th>
                    <th>Applied date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((a) => (
                    <tr key={a.id} className="border-b last:border-b-0">
                      <td className="py-3 font-medium">{a.workerName}</td>
                      <td>{a.appliedDate}</td>
                      <td>
                        <Badge className="rounded-lg">{a.status}</Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => setApplicantDetail(a)}
                        >
                          Xem chi tiết
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl ml-1"
                        >
                          Đổi trạng thái
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}

      {active === 'stats' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {MOCK_KPI.map((item) => (
              <Card key={item.label} className="p-5 rounded-xl shadow-sm">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold mt-2">{item.value}</p>
              </Card>
            ))}
          </div>
          <Card className="p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              Thống kê đơn ứng tuyển
            </h3>
            <div className="h-52 rounded-xl bg-gray-100 border border-dashed flex items-center justify-center text-muted-foreground">
              Chart placeholder
            </div>
            <table className="w-full text-sm mt-4">
              <thead className="text-left text-muted-foreground border-b">
                <tr>
                  <th className="py-2">Chỉ số</th>
                  <th>Giá trị</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Total jobs posted</td>
                  <td>24</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Total views</td>
                  <td>1,240</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Total applications</td>
                  <td>156</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
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
            fetchCompany();
          }}
          onBack={() => setCompanyModalOpen(false)}
        />
      </Modal>

      <Modal
        open={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        variant="custom"
      >
        <CompanyRegisterPage
          isModal
          onSuccess={() => {
            setCompanyModalOpen(false);
            fetchCompany();
          }}
          onBack={() => setCompanyModalOpen(false)}
        />
      </Modal>

      {/* <Modal open={jobModalOpen} title={editingJob ? 'Chỉnh sửa tin' : 'Tạo tin tuyển dụng'} onClose={() => setJobModalOpen(false)} onConfirm={handleSaveJob} confirmLabel="Lưu">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tiêu đề *</label>
            <Input
              className="mt-1 rounded-xl"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Tiêu đề tin"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Mô tả</label>
            <Input
              className="mt-1 rounded-xl"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Lương</label>
            <Input
              className="mt-1 rounded-xl"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Ca làm</label>
            <Input
              className="mt-1 rounded-xl"
              value={form.shifts}
              onChange={(e) => setForm({ ...form, shifts: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Địa điểm</label>
            <Input
              className="mt-1 rounded-xl"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Số lượng</label>
            <Input
              className="mt-1 rounded-xl"
              value={form.vacancies}
              onChange={(e) => setForm({ ...form, vacancies: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Ngành nghề</label>
            <Input
              className="mt-1 rounded-xl"
              value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
            />
          </div>
        </div>
      </Modal> */}

      <Modal
        open={!!deleteConfirm}
        title="Xóa tin"
        description="Bạn chắc chắn muốn xóa tin tuyển dụng này?"
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteJob}
        confirmLabel="Xóa"
        tone="danger"
      />

      <Modal
        open={boostModalOpen}
        title="Thanh toán"
        description="Chọn gói dịch vụ. Sau khi thanh toán tính năng sẽ được mở khóa."
        onClose={handleBoostCancel}
        onConfirm={handleBoostCheckout}
        confirmLabel="Thanh toán"
        cancelLabel="Hủy"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="font-medium">Boost job</p>
            <p className="text-sm text-muted-foreground">
              Tin hiển thị nổi bật trong danh sách tìm kiếm.
            </p>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="pkg" defaultChecked /> Gói 7 ngày -
                100.000đ
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="pkg" /> Gói 30 ngày - 300.000đ
              </label>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="font-medium">Xem số ứng viên</p>
            <p className="text-sm text-muted-foreground">
              Mở khóa thống kê ứng viên theo tin.
            </p>
            <p className="text-sm font-medium mt-1">50.000đ / tháng</p>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

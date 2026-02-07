import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/shared/components/EmptyState';
import { Modal } from '@/shared/components/Modal';
import { DashboardLayout } from '@/shared/components/Layout/DashboardLayout';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';

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
  { id: 1, title: 'Nhân viên kho vận ca đêm', status: 'Active', created: '2025-02-01', boosted: true, boostEnd: '2025-03-01' },
  { id: 2, title: 'Phục vụ nhà hàng', status: 'Active', created: '2025-01-28', boosted: false },
];

const MOCK_APPLICANTS = [
  { id: 1, workerName: 'Nguyễn Văn A', appliedDate: '2025-02-05', status: 'Pending' },
  { id: 2, workerName: 'Trần Thị B', appliedDate: '2025-02-04', status: 'Reviewed' },
];

export const EmployerDashboard = () => {
  const { toast } = useToast();
  const [active, setActive] = useState('overview');
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(MOCK_JOBS[0]?.id);
  const [applicantDetail, setApplicantDetail] = useState(null);
  const [applicantStatus, setApplicantStatus] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', salary: '', shifts: '', location: '', vacancies: '', sector: '',
  });

  const applicants = MOCK_APPLICANTS;
  const jobs = MOCK_JOBS;

  const openCreateJob = () => {
    setEditingJob(null);
    setForm({ title: '', description: '', salary: '', shifts: '', location: '', vacancies: '', sector: '' });
    setJobModalOpen(true);
  };

  const openEditJob = (job) => {
    setEditingJob(job);
    setForm({ title: job.title, description: 'Mô tả...', salary: '10-12 triệu', shifts: 'Ca đêm', location: 'TP.HCM', vacancies: '5', sector: 'Kho vận' });
    setJobModalOpen(true);
  };

  const handleSaveJob = () => {
    if (!form.title?.trim()) {
      toast(MSG.MSG23, 'error');
      return;
    }
    setJobModalOpen(false);
    toast(editingJob ? MSG.MSG25 : 'Đã tạo tin.');
  };

  const handleDeleteJob = () => {
    setDeleteConfirm(null);
    toast(MSG.MSG26, 'error');
  };

  const handleBoostCheckout = () => {
    setBoostModalOpen(false);
    toast('Thanh toán thành công. Tính năng đã được mở khóa.');
  };

  const handleBoostCancel = () => {
    setBoostModalOpen(false);
    toast(MSG.MSG46);
  };

  const handleExportApplicants = () => {
    toast('Đã xuất CSV (mock).');
  };

  const handleSaveApplicantStatus = () => {
    if (!applicantStatus) return;
    toast(MSG.MSG45, 'error');
  };

  return (
    <DashboardLayout title="Employer Dashboard" menu={EMPLOYER_MENU} activeKey={active} onSelect={setActive}>
      {active === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-semibold">Tổng quan</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl" asChild>
                <Link to="/company/register">Đăng ký / Chỉnh sửa công ty</Link>
              </Button>
              <Button className="rounded-xl" onClick={() => { setActive('jobs'); openCreateJob(); }}>
                Tạo tin tuyển dụng
              </Button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {MOCK_KPI.map((item) => (
              <Card key={item.label} className="p-5 rounded-xl shadow-sm">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold mt-2">{item.value}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {active === 'jobs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tin tuyển dụng</h2>
            <Button className="rounded-xl" onClick={openCreateJob}>Tạo tin</Button>
          </div>
          <Card className="p-4 rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b">
                <tr>
                  <th className="py-2">Job title</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Boost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b last:border-b-0">
                    <td className="py-3 font-medium">{job.title}</td>
                    <td><Badge className="rounded-lg">{job.status}</Badge></td>
                    <td>{job.created}</td>
                    <td>{job.boosted ? <Badge variant="secondary" className="rounded-lg">Nổi bật đến {job.boostEnd}</Badge> : '-'}</td>
                    <td className="py-2 flex flex-wrap gap-1">
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEditJob(job)}>Sửa</Button>
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setDeleteConfirm(job)}>Xóa</Button>
                      {!job.boosted && <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setBoostModalOpen(true)}>Nổi bật</Button>}
                      <Button variant="outline" size="sm" className="rounded-xl">Xem ứng viên</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
            <select className="rounded-xl border px-4 py-2 text-sm bg-white">
              <option>Status</option>
              <option>Pending</option>
              <option>Reviewed</option>
            </select>
            <Input type="date" className="max-w-[160px] rounded-xl" />
            <Input type="date" className="max-w-[160px] rounded-xl" />
            <Button variant="outline" className="rounded-xl" onClick={handleExportApplicants}>Xuất CSV/Excel</Button>
          </Card>

          {applicantDetail ? (
            <Card className="p-6 rounded-xl shadow-sm max-w-xl">
              <h3 className="font-semibold mb-4">Chi tiết ứng viên</h3>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-muted-foreground">Họ tên</dt><dd className="font-medium">{applicantDetail.workerName}</dd></div>
                <div><dt className="text-muted-foreground">Ngày ứng tuyển</dt><dd>{applicantDetail.appliedDate}</dd></div>
              </dl>
              <p className="text-sm text-muted-foreground mt-4">Câu trả lời form (mock)...</p>
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
                <Button size="sm" className="rounded-xl" onClick={handleSaveApplicantStatus}>Lưu trạng thái</Button>
              </div>
              <Button variant="outline" className="mt-4 rounded-xl" onClick={() => setApplicantDetail(null)}>Quay lại</Button>
            </Card>
          ) : applicants.length === 0 ? (
            <EmptyState title={MSG.MSG44} description="Chưa có ứng viên nào." />
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
                      <td><Badge className="rounded-lg">{a.status}</Badge></td>
                      <td>
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setApplicantDetail(a)}>Xem chi tiết</Button>
                        <Button variant="ghost" size="sm" className="rounded-xl ml-1">Đổi trạng thái</Button>
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
            <h3 className="text-lg font-semibold mb-4">Thống kê đơn ứng tuyển</h3>
            <div className="h-52 rounded-xl bg-gray-100 border border-dashed flex items-center justify-center text-muted-foreground">
              Chart placeholder
            </div>
            <table className="w-full text-sm mt-4">
              <thead className="text-left text-muted-foreground border-b">
                <tr><th className="py-2">Chỉ số</th><th>Giá trị</th></tr>
              </thead>
              <tbody>
                <tr className="border-b"><td className="py-2">Total jobs posted</td><td>24</td></tr>
                <tr className="border-b"><td className="py-2">Total views</td><td>1,240</td></tr>
                <tr className="border-b"><td className="py-2">Total applications</td><td>156</td></tr>
              </tbody>
            </table>
          </Card>
        </div>
      )}

      <Modal open={jobModalOpen} title={editingJob ? 'Chỉnh sửa tin' : 'Tạo tin tuyển dụng'} onClose={() => setJobModalOpen(false)} onConfirm={handleSaveJob} confirmLabel="Lưu">
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Tiêu đề *</label><Input className="mt-1 rounded-xl" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Tiêu đề tin" /></div>
          <div><label className="text-sm font-medium">Mô tả</label><Input className="mt-1 rounded-xl" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Lương</label><Input className="mt-1 rounded-xl" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Ca làm</label><Input className="mt-1 rounded-xl" value={form.shifts} onChange={(e) => setForm({ ...form, shifts: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Địa điểm</label><Input className="mt-1 rounded-xl" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Số lượng</label><Input className="mt-1 rounded-xl" value={form.vacancies} onChange={(e) => setForm({ ...form, vacancies: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Ngành nghề</label><Input className="mt-1 rounded-xl" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} /></div>
        </div>
      </Modal>

      <Modal open={!!deleteConfirm} title="Xóa tin" description="Bạn chắc chắn muốn xóa tin tuyển dụng này?" onClose={() => setDeleteConfirm(null)} onConfirm={handleDeleteJob} confirmLabel="Xóa" tone="danger" />

      <Modal open={boostModalOpen} title="Thanh toán" description="Chọn gói dịch vụ. Sau khi thanh toán tính năng sẽ được mở khóa." onClose={handleBoostCancel} onConfirm={handleBoostCheckout} confirmLabel="Thanh toán" cancelLabel="Hủy">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="font-medium">Boost job</p>
            <p className="text-sm text-muted-foreground">Tin hiển thị nổi bật trong danh sách tìm kiếm.</p>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="pkg" defaultChecked /> Gói 7 ngày - 100.000đ</label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="pkg" /> Gói 30 ngày - 300.000đ</label>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="font-medium">Xem số ứng viên</p>
            <p className="text-sm text-muted-foreground">Mở khóa thống kê ứng viên theo tin.</p>
            <p className="text-sm font-medium mt-1">50.000đ / tháng</p>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/shared/components/EmptyState';
import { Modal } from '@/shared/components/Modal';
import { DashboardLayout } from '@/shared/components/Layout/DashboardLayout';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';

const MANAGER_MENU = [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'reports', label: 'Báo cáo việc làm' },
  { key: 'reviewReports', label: 'Báo cáo đánh giá' },
  { key: 'companies', label: 'Duyệt công ty' },
];

const MOCK_REVIEW_REPORTS = [
  { id: 1, reviewId: 1, companyName: 'LogiFast', reporter: 'User X', reason: 'Nội dung xúc phạm', content: 'Review vi phạm...', createdAt: '2025-02-06', status: 'New' },
];

const MOCK_KPI = [
  { label: 'Report mới', value: '8' },
  { label: 'Report đang xử lý', value: '3' },
  { label: 'Job đã vô hiệu hóa', value: '5' },
  { label: 'Công ty pending', value: '12' },
];

const MOCK_REPORTS = [
  { id: 1, jobTitle: 'Nhân viên kho vận ca đêm', reportingWorker: 'Nguyễn A', reason: 'Thông tin lương không đúng', created: '2025-02-06 10:00', status: 'New' },
  { id: 2, jobTitle: 'Phục vụ nhà hàng', reportingWorker: 'Trần B', reason: 'Nội dung không phù hợp', created: '2025-02-05 14:30', status: 'In progress' },
];

const MOCK_COMPANIES = [
  { id: 1, companyName: 'Công ty TNHH ABC', owner: 'employer@mail.com', submittedDate: '2025-02-01', status: 'Pending' },
];

export const ManagerDashboard = () => {
  const { toast } = useToast();
  const [active, setActive] = useState('overview');
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [disableJobConfirm, setDisableJobConfirm] = useState(false);
  const [enableJobConfirm, setEnableJobConfirm] = useState(false);
  const [approveNote, setApproveNote] = useState('');
  const [rejectNote, setRejectNote] = useState('');

  const reports = MOCK_REPORTS;
  const reviewReports = MOCK_REVIEW_REPORTS;
  const companies = MOCK_COMPANIES;
  const [selectedReviewReport, setSelectedReviewReport] = useState(null);
  const jobSnapshot = selectedReport
    ? {
        title: selectedReport.jobTitle,
        company: 'LogiFast',
        salary: '10-12 triệu',
        shifts: 'Ca đêm',
        location: 'TP.HCM',
        description: 'Mô tả ngắn...',
        status: 'Active',
      }
    : null;

  const handleDisableJob = () => {
    setDisableJobConfirm(false);
    setSelectedReport(null);
    toast(MSG.MSG37);
  };

  const handleEnableJob = () => {
    setEnableJobConfirm(false);
    toast(MSG.MSG37);
  };

  const handleResolve = () => {
    setSelectedReport(null);
    toast(MSG.MSG37);
  };

  const handleApproveCompany = () => {
    setSelectedCompany(null);
    setApproveNote('');
    toast(MSG.MSG55);
  };

  const handleRejectCompany = () => {
    setSelectedCompany(null);
    setRejectNote('');
    toast(MSG.MSG54, 'error');
  };

  return (
    <DashboardLayout title="Manager Dashboard" menu={MANAGER_MENU} activeKey={active} onSelect={setActive}>
      {active === 'overview' && (
        <div className="space-y-6">
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

      {active === 'reports' && (
        <div className="space-y-6">
          <Card className="p-4 rounded-xl shadow-sm flex flex-wrap gap-3 items-center">
            <select className="rounded-xl border px-4 py-2 text-sm bg-white">
              <option>Status</option>
              <option>New</option>
              <option>In progress</option>
              <option>Resolved</option>
            </select>
            <Input type="date" className="max-w-[160px] rounded-xl" />
            <Input type="date" className="max-w-[160px] rounded-xl" />
            <select className="rounded-xl border px-4 py-2 text-sm bg-white">
              <option>Lý do</option>
            </select>
            <Button className="rounded-xl">Lọc</Button>
          </Card>

          {reports.length === 0 ? (
            <EmptyState title={MSG.MSG33} description="Chưa có báo cáo nào." />
          ) : selectedReport ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold mb-4">Thông tin job</h3>
                <dl className="space-y-2 text-sm">
                  <div><dt className="text-muted-foreground">Tin tuyển dụng</dt><dd className="font-medium">{jobSnapshot?.title}</dd></div>
                  <div><dt className="text-muted-foreground">Công ty</dt><dd>{jobSnapshot?.company}</dd></div>
                  <div><dt className="text-muted-foreground">Lương</dt><dd>{jobSnapshot?.salary}</dd></div>
                  <div><dt className="text-muted-foreground">Ca làm</dt><dd>{jobSnapshot?.shifts}</dd></div>
                  <div><dt className="text-muted-foreground">Địa điểm</dt><dd>{jobSnapshot?.location}</dd></div>
                  <div><dt className="text-muted-foreground">Trạng thái</dt><dd><Badge className="rounded-lg">{jobSnapshot?.status}</Badge></dd></div>
                </dl>
              </Card>
              <Card className="p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold mb-4">Chi tiết báo cáo</h3>
                <dl className="space-y-2 text-sm">
                  <div><dt className="text-muted-foreground">Người báo cáo</dt><dd>{selectedReport.reportingWorker}</dd></div>
                  <div><dt className="text-muted-foreground">Lý do</dt><dd>{selectedReport.reason}</dd></div>
                  <div><dt className="text-muted-foreground">Thời gian</dt><dd>{selectedReport.created}</dd></div>
                </dl>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button variant="destructive" className="rounded-xl" onClick={() => setDisableJobConfirm(true)}>Vô hiệu hóa job</Button>
                  <Button variant="outline" className="rounded-xl" onClick={() => setEnableJobConfirm(true)}>Bật lại job</Button>
                  <Button className="rounded-xl" onClick={handleResolve}>Đánh dấu đã xử lý</Button>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-4 rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b">
                  <tr>
                    <th className="py-2">Job title</th>
                    <th>Reporting worker</th>
                    <th>Reason</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="border-b last:border-b-0">
                      <td className="py-3 font-medium">{r.jobTitle}</td>
                      <td>{r.reportingWorker}</td>
                      <td>{r.reason}</td>
                      <td>{r.created}</td>
                      <td><Badge className="rounded-lg">{r.status}</Badge></td>
                      <td>
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setSelectedReport(r)}>Xem</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}

      {active === 'reviewReports' && (
        <div className="space-y-6">
          <Card className="p-4 rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b">
                <tr>
                  <th className="py-2">Công ty</th>
                  <th>Người báo cáo</th>
                  <th>Lý do</th>
                  <th>Ngày</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reviewReports.map((r) => (
                  <tr key={r.id} className="border-b last:border-b-0">
                    <td className="py-3 font-medium">{r.companyName}</td>
                    <td>{r.reporter}</td>
                    <td>{r.reason}</td>
                    <td>{r.createdAt}</td>
                    <td><Badge className="rounded-lg">{r.status}</Badge></td>
                    <td>
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setSelectedReviewReport(r)}>Xem</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          {selectedReviewReport && (
            <Card className="p-6 rounded-xl shadow-sm max-w-2xl">
              <h3 className="font-semibold mb-4">Chi tiết báo cáo đánh giá</h3>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-muted-foreground">Nội dung bị báo cáo</dt><dd>{selectedReviewReport.content}</dd></div>
                <div><dt className="text-muted-foreground">Lý do</dt><dd>{selectedReviewReport.reason}</dd></div>
              </dl>
              <div className="mt-4 flex gap-2">
                <Button variant="destructive" size="sm" className="rounded-xl">Xóa đánh giá</Button>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setSelectedReviewReport(null)}>Đóng</Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {active === 'companies' && (
        <div className="space-y-6">
          {companies.length === 0 ? (
            <EmptyState title={MSG.MSG53} description="Chưa có đơn đăng ký công ty." />
          ) : selectedCompany ? (
            <Card className="p-6 rounded-xl shadow-sm max-w-2xl">
              <h3 className="font-semibold mb-4">Thông tin công ty</h3>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-muted-foreground">Tên công ty</dt><dd className="font-medium">{selectedCompany.companyName}</dd></div>
                <div><dt className="text-muted-foreground">Chủ sở hữu</dt><dd>{selectedCompany.owner}</dd></div>
                <div><dt className="text-muted-foreground">Ngày nộp</dt><dd>{selectedCompany.submittedDate}</dd></div>
              </dl>
              <div className="mt-4 h-24 rounded-xl border bg-gray-50 flex items-center justify-center text-muted-foreground text-sm">
                Khu vực xem tài liệu (preview placeholder)
              </div>
              <div className="mt-6 flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Ghi chú (Duyệt)</label>
                  <Input className="mt-1 rounded-xl" placeholder="Ghi chú..." value={approveNote} onChange={(e) => setApproveNote(e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium">Ghi chú (Từ chối)</label>
                  <Input className="mt-1 rounded-xl" placeholder="Ghi chú..." value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="rounded-xl" onClick={handleApproveCompany}>Approve</Button>
                <Button variant="destructive" className="rounded-xl" onClick={handleRejectCompany}>Reject</Button>
                <Button variant="outline" className="rounded-xl" onClick={() => setSelectedCompany(null)}>Quay lại</Button>
              </div>
            </Card>
          ) : (
            <Card className="p-4 rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b">
                  <tr>
                    <th className="py-2">Company name</th>
                    <th>Owner</th>
                    <th>Submitted date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c.id} className="border-b last:border-b-0">
                      <td className="py-3 font-medium">{c.companyName}</td>
                      <td>{c.owner}</td>
                      <td>{c.submittedDate}</td>
                      <td><Badge className="rounded-lg">{c.status}</Badge></td>
                      <td>
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setSelectedCompany(c)}>Xem</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}

      <Modal open={disableJobConfirm} title="Vô hiệu hóa job" description="Bạn chắc chắn muốn vô hiệu hóa tin tuyển dụng này?" onClose={() => setDisableJobConfirm(false)} onConfirm={handleDisableJob} confirmLabel="Vô hiệu hóa" tone="danger" />
      <Modal open={enableJobConfirm} title="Bật lại job" description="Bạn chắc chắn muốn bật lại tin này?" onClose={() => setEnableJobConfirm(false)} onConfirm={handleEnableJob} confirmLabel="Bật lại" />
    </DashboardLayout>
  );
}

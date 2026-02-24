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
import {
  Building2,
  Users,
  FileText,
  BarChart3,
  Globe,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Shield,
  ExternalLink,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Briefcase,
} from 'lucide-react';
import { useGetCompanies, useGetCompaniesById } from '../api/useGetCompanies';
import { useEffect } from 'react';

// ========================
// MENU
// ========================
const MANAGER_MENU = [
  // { key: 'overview', label: 'Tổng quan' },
  { key: 'companies', label: 'Quản lý công ty' },
  // { key: 'reports', label: 'Báo cáo việc làm' },
  // { key: 'reviewReports', label: 'Báo cáo đánh giá' },
  { key: 'approvals', label: 'Duyệt công ty' },
];

// ========================
// MOCK DATA
// ========================
// const MOCK_KPI = [
//   { label: 'Tổng công ty', value: '86', icon: Building2, color: 'text-blue-600 bg-blue-50' },
//   { label: 'Đang chờ duyệt', value: '12', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
//   { label: 'Báo cáo mới', value: '8', icon: FileText, color: 'text-red-600 bg-red-50' },
//   { label: 'Job đã vô hiệu hóa', value: '5', icon: Shield, color: 'text-purple-600 bg-purple-50' },
// ];

const MOCK_COMPANIES = [
  {
    id: 1,
    name: 'Công ty TNHH ABC Tech',
    taxCode: '0101234567',
    address: 'Tầng 5, Toà nhà Keangnam, Hà Nội',
    description:
      'Công ty chuyên phát triển nền tảng tuyển dụng và HR Tech. Hoạt động trong lĩnh vực công nghệ thông tin.',
    website: 'https://abctech.vn',
    logoUrl: 'https://via.placeholder.com/80/3b82f6/ffffff?text=ABC',
    businessLicenseUrl: 'https://example.com/license.pdf',
    status: 'APPROVED',
    rejectionReason: null,
    ownerId: 5,
    ownerName: 'Nguyễn Văn Employer',
    ownerEmail: 'employer@abctech.vn',
    createdAt: '2025-01-15',
    updatedAt: '2025-02-01',
    totalJobs: 12,
    totalApplications: 45,
  },
  {
    id: 2,
    name: 'LogiFast Việt Nam',
    taxCode: '0309876543',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    description: 'Dịch vụ logistics và vận chuyển hàng hóa toàn quốc.',
    website: 'https://logifast.vn',
    logoUrl: 'https://via.placeholder.com/80/f59e0b/ffffff?text=LF',
    businessLicenseUrl: null,
    status: 'PENDING',
    rejectionReason: null,
    ownerId: 8,
    ownerName: 'Trần Thị Loan',
    ownerEmail: 'loan@logifast.vn',
    createdAt: '2025-02-10',
    updatedAt: '2025-02-10',
    totalJobs: 0,
    totalApplications: 0,
  },
  {
    id: 3,
    name: 'Nhà máy May Đại Phong',
    taxCode: '0201112233',
    address: 'KCN Bình Dương, Bình Dương',
    description: 'Sản xuất và gia công hàng may mặc xuất khẩu.',
    website: null,
    logoUrl: 'https://via.placeholder.com/80/10b981/ffffff?text=DP',
    businessLicenseUrl: 'https://example.com/license2.pdf',
    status: 'REJECTED',
    rejectionReason: 'Giấy phép kinh doanh không hợp lệ. Vui lòng cung cấp bản scan rõ ràng.',
    ownerId: 12,
    ownerName: 'Lê Hoàng Minh',
    ownerEmail: 'minh@daiphong.vn',
    createdAt: '2025-01-20',
    updatedAt: '2025-02-05',
    totalJobs: 3,
    totalApplications: 18,
  },
  {
    id: 4,
    name: 'Chuỗi nhà hàng Phở Việt',
    taxCode: '0415556677',
    address: '45 Trần Hưng Đạo, Đà Nẵng',
    description: 'Chuỗi nhà hàng phở truyền thống, 15 chi nhánh toàn quốc.',
    website: 'https://phoviet.com',
    logoUrl: 'https://via.placeholder.com/80/ef4444/ffffff?text=PV',
    businessLicenseUrl: 'https://example.com/license3.pdf',
    status: 'APPROVED',
    rejectionReason: null,
    ownerId: 15,
    ownerName: 'Phạm Quốc Tuấn',
    ownerEmail: 'tuan@phoviet.com',
    createdAt: '2024-11-05',
    updatedAt: '2025-01-12',
    totalJobs: 8,
    totalApplications: 92,
  },
];

const MOCK_REPORTS = [
  {
    id: 1,
    jobTitle: 'Nhân viên kho vận ca đêm',
    reportingWorker: 'Nguyễn A',
    reason: 'Thông tin lương không đúng',
    created: '2025-02-06 10:00',
    status: 'New',
  },
  {
    id: 2,
    jobTitle: 'Phục vụ nhà hàng',
    reportingWorker: 'Trần B',
    reason: 'Nội dung không phù hợp',
    created: '2025-02-05 14:30',
    status: 'In progress',
  },
];

const MOCK_REVIEW_REPORTS = [
  {
    id: 1,
    reviewId: 1,
    companyName: 'LogiFast',
    reporter: 'User X',
    reason: 'Nội dung xúc phạm',
    content: 'Review vi phạm...',
    createdAt: '2025-02-06',
    status: 'New',
  },
];

const MOCK_PENDING_COMPANIES = [
  {
    id: 2,
    companyName: 'LogiFast Việt Nam',
    owner: 'loan@logifast.vn',
    submittedDate: '2025-02-10',
    status: 'Pending',
  },
];

// ========================
// STATUS HELPERS
// ========================
const statusConfig = {
  APPROVED: {
    label: 'Đã duyệt',
    variant: 'default',
    className: 'bg-emerald-100 text-emerald-700 border-0',
  },
  PENDING: {
    label: 'Chờ duyệt',
    variant: 'secondary',
    className: 'bg-amber-100 text-amber-700 border-0',
  },
  REJECTED: {
    label: 'Từ chối',
    variant: 'destructive',
    className: 'bg-red-100 text-red-700 border-0',
  },
  DELETED: {
    label: 'Đã xoá',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-500 border-0',
  },
};

const getStatusBadge = (status) => {
  const cfg = statusConfig[status] || statusConfig.PENDING;
  return <Badge className={`rounded-lg text-xs ${cfg.className}`}>{cfg.label}</Badge>;
};

// ========================
// COMPANY DETAIL PANEL
// ========================
const CompanyDetail = ({ company, onBack }) => {
  if (!company) return null;

  const fields = [
    { label: 'ID', value: company.id, icon: null },
    { label: 'Tên công ty', value: company.name, icon: Building2 },
    { label: 'Mã số thuế', value: company.taxCode || '—', icon: FileText },
    { label: 'Địa chỉ', value: company.address || '—', icon: MapPin },
    { label: 'Website', value: company.website, icon: Globe, isLink: true },
    { label: 'Trạng thái', value: company.status, icon: Shield, isStatus: true },
    { label: 'Chủ sở hữu', value: `${company.ownerName} (ID: ${company.ownerId})`, icon: Users },
    { label: 'Email chủ sở hữu', value: company.ownerEmail, icon: Mail },
    {
      label: 'Ngày tạo',
      value: new Date(company.createdAt).toLocaleString('vi-VN'),
      icon: Calendar,
    },
    {
      label: 'Cập nhật',
      value: new Date(company.updatedAt).toLocaleString('vi-VN'),
      icon: Calendar,
    },
  ];

  return (
    <div className='space-y-6'>
      <Button variant='outline' className='rounded-xl' onClick={onBack}>
        ←
      </Button>

      {/* Company Header */}
      <Card className='p-6 rounded-2xl shadow-sm border-0 bg-white'>
        <div className='flex items-start gap-5'>
          <div className='h-20 w-20 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border'>
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className='h-full w-full object-cover'
              />
            ) : (
              <Building2 className='h-8 w-8 text-gray-400' />
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between'>
              <div>
                <h2 className='text-xl font-bold'>{company.name}</h2>
                <p className='text-sm text-muted-foreground mt-1'>
                  {company.address || 'Chưa có địa chỉ'}
                </p>
              </div>
              {getStatusBadge(company.status)}
            </div>
            {company.description && (
              <p className='text-sm text-gray-600 mt-3 leading-relaxed'>{company.description}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {/* <Card className="p-4 rounded-xl shadow-sm border-0">
          <p className="text-xs text-muted-foreground">Tổng tin tuyển dụng</p>
          <p className="text-2xl font-bold mt-1">{company.totalJobs}</p>
        </Card>
        <Card className="p-4 rounded-xl shadow-sm border-0">
          <p className="text-xs text-muted-foreground">Tổng đơn ứng tuyển</p>
          <p className="text-2xl font-bold mt-1">{company.totalApplications}</p>
        </Card> */}
        <Card className='p-4 rounded-xl shadow-sm border-0'>
          <p className='text-xs text-muted-foreground'>Giấy phép KD</p>
          <p className='text-sm font-medium mt-1'>
            {company.businessLicenseUrl ? (
              <a
                href={company.businessLicenseUrl}
                target='_blank'
                rel='noreferrer'
                className='text-blue-600 hover:underline flex items-center gap-1'
              >
                Xem file <ExternalLink className='h-3 w-3' />
              </a>
            ) : (
              <span className='text-gray-400'>Chưa upload</span>
            )}
          </p>
        </Card>
        <Card className='p-4 rounded-xl shadow-sm border-0'>
          <p className='text-xs text-muted-foreground'>Logo</p>
          <p className='text-sm font-medium mt-1'>
            {company.logoUrl ? (
              <a
                href={company.logoUrl}
                target='_blank'
                rel='noreferrer'
                className='text-blue-600 hover:underline flex items-center gap-1'
              >
                Xem ảnh <ExternalLink className='h-3 w-3' />
              </a>
            ) : (
              <span className='text-gray-400'>Chưa upload</span>
            )}
          </p>
        </Card>
      </div>

      {/* Data Fields Table */}
      <Card className='p-6 rounded-2xl shadow-sm border-0 bg-white'>
        <h3 className='font-semibold mb-4 flex items-center gap-2'>
          <FileText className='h-4 w-4 text-blue-500' />
          Chi tiết thông tin công ty
        </h3>
        <div className='divide-y min-h-[800px]'>
          {fields.map((f, i) => (
            <div key={i} className='flex items-start py-3 gap-3'>
              <div className='w-44 shrink-0'>
                <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5'>
                  {f.icon && <f.icon className='h-3.5 w-3.5' />}
                  {f.label}
                </span>
              </div>
              <div className='flex-1 text-sm'>
                {f.isStatus ? (
                  getStatusBadge(f.value)
                ) : f.isLink && f.value ? (
                  <a
                    href={f.value}
                    target='_blank'
                    rel='noreferrer'
                    className='text-blue-600 hover:underline flex items-center gap-1'
                  >
                    {f.value} <ExternalLink className='h-3 w-3' />
                  </a>
                ) : (
                  <span className='font-medium'>{f.value || '—'}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Rejection Reason */}
        {company.rejectionReason && (
          <div className='mt-4 p-4 rounded-xl bg-red-50 border border-red-100'>
            <p className='text-xs font-semibold text-red-700 uppercase tracking-wide mb-1 flex items-center gap-1'>
              <XCircle className='h-3.5 w-3.5' /> Lý do từ chối
            </p>
            <p className='text-sm text-red-600'>{company.rejectionReason}</p>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className='p-5 rounded-2xl shadow-sm border-0 bg-white'>
        <h3 className='font-semibold mb-3 text-sm'>Hành động nhanh</h3>
        <div className='flex flex-wrap gap-2'>
          <Link to={`/manager/applicants?companyId=${company.id}`}>
            <Button variant='outline' className='rounded-xl text-sm' size='sm'>
              <Briefcase className='h-4 w-4 mr-1' /> Xem ứng viên
            </Button>
          </Link>
          {company.status === 'PENDING' && (
            <>
              <Button className='rounded-xl text-sm' size='sm'>
                <CheckCircle className='h-4 w-4 mr-1' /> Duyệt
              </Button>
              <Button variant='destructive' className='rounded-xl text-sm' size='sm'>
                <XCircle className='h-4 w-4 mr-1' /> Từ chối
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

// ========================
// MAIN COMPONENT
// ========================
export const ManagerDashboard = () => {
  const { toast } = useToast();
  const [active, setActive] = useState('overview');

  // Reports state
  const [selectedReport, setSelectedReport] = useState(null);
  const [disableJobConfirm, setDisableJobConfirm] = useState(false);
  const [enableJobConfirm, setEnableJobConfirm] = useState(false);

  // Company management state
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [companyFilter, setCompanyFilter] = useState('');
  const [companyStatusFilter, setCompanyStatusFilter] = useState('');

  // Approval state
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [approveNote, setApproveNote] = useState('');
  const [rejectNote, setRejectNote] = useState('');

  // Review reports
  const [selectedReviewReport, setSelectedReviewReport] = useState(null);
  const reports = MOCK_REPORTS;
  const reviewReports = MOCK_REVIEW_REPORTS;
  const pendingCompanies = MOCK_PENDING_COMPANIES;

  const { data: companyDetail, isLoading: companyDetailIsLoading } =
    useGetCompaniesById(selectedCompanyId);
  const { data, isLoading } = useGetCompanies();
  console.log(data);
  // Company filtering
  const filteredCompanies = data;

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
    setSelectedApproval(null);
    setApproveNote('');
    toast(MSG.MSG55);
  };
  const handleRejectCompany = () => {
    setSelectedApproval(null);
    setRejectNote('');
    toast(MSG.MSG54, 'error');
  };

  return (
    <div className='min-h-[800px] border border-red-500'>
      <DashboardLayout
        title='Manager Dashboard'
        menu={MANAGER_MENU}
        activeKey={active}
        onSelect={setActive}
      >
        {/* ==================== OVERVIEW ==================== */}
        {active === 'overview' && (
          <div className='space-y-6 '>
            {/* <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {MOCK_KPI.map((item) => (
              <Card key={item.label} className="p-5 rounded-xl shadow-sm border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-bold mt-2">{item.value}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            ))}
          </div> */}

            <div className='grid lg:grid-cols-3 gap-6'>
              <Card className='p-6 lg:col-span-2 rounded-xl shadow-sm border-0'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold'>Thống kê hệ thống</h3>
                  <Badge variant='outline'>7 ngày</Badge>
                </div>
                <div className='h-60 rounded-xl  border border-dashed flex items-center justify-center text-muted-foreground'>
                  <BarChart3 className='h-8 w-8 mr-2 text-gray-300' /> Chart placeholder
                </div>
              </Card>

              <Card className='p-6 rounded-xl shadow-sm border-0'>
                <h3 className='text-lg font-semibold mb-4'>Tóm tắt</h3>
                <div className='space-y-3 text-sm text-muted-foreground'>
                  <div className='flex items-center justify-between'>
                    <span>Công ty mới (7 ngày)</span>
                    <span className='font-semibold text-foreground'>+6</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>Công ty chờ duyệt</span>
                    <span className='font-semibold text-foreground'>12</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>Reports chưa xử lý</span>
                    <span className='font-semibold text-foreground'>8</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>Đánh giá bị báo cáo</span>
                    <span className='font-semibold text-foreground'>3</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Links */}
            <div className='flex flex-wrap gap-3'>
              <Button
                variant='outline'
                className='rounded-xl'
                onClick={() => setActive('companies')}
              >
                <Building2 className='h-4 w-4 mr-2' /> Quản lý công ty
              </Button>
              <Link to='/manager/applicants'>
                <Button variant='outline' className='rounded-xl'>
                  <Users className='h-4 w-4 mr-2' /> Quản lý ứng viên
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ==================== COMPANIES ==================== */}
        {active === 'companies' && (
          <div className='space-y-6'>
            {companyDetail ? (
              <CompanyDetail company={companyDetail} onBack={() => setSelectedCompanyId(null)} />
            ) : (
              <>
                <div className='flex items-center justify-between flex-wrap gap-3'>
                  <h2 className='text-xl font-semibold'>Quản lý công ty</h2>
                  <Link to='/manager/applicants'>
                    <Button variant='outline' className='rounded-xl' size='sm'>
                      <Users className='h-4 w-4 mr-1' /> Xem ứng viên
                    </Button>
                  </Link>
                </div>

                {/* Filters */}
                <Card className='p-4 rounded-xl shadow-sm border-0 flex flex-wrap gap-3 items-center'>
                  <Input
                    placeholder='Tìm tên công ty...'
                    className='max-w-[250px] rounded-xl'
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                  />
                  <select
                    className='rounded-xl border px-4 py-2 text-sm bg-white'
                    value={companyStatusFilter}
                    onChange={(e) => setCompanyStatusFilter(e.target.value)}
                  >
                    <option value=''>Tất cả trạng thái</option>
                    <option value='PENDING'>Chờ duyệt</option>
                    <option value='APPROVED'>Đã duyệt</option>
                    <option value='REJECTED'>Từ chối</option>
                  </select>
                  <Button
                    variant='outline'
                    className='rounded-xl'
                    onClick={() => {
                      setCompanyFilter('');
                      setCompanyStatusFilter('');
                    }}
                  >
                    Reset
                  </Button>
                  <span className='text-xs text-muted-foreground ml-auto'>
                    {filteredCompanies.length} công ty
                  </span>
                </Card>

                {/* Company Table */}
                <Card className='p-4 rounded-xl shadow-sm border-0 overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead className='text-left text-muted-foreground border-b'>
                      <tr>
                        <th className='py-2'>ID</th>
                        <th>Công ty</th>
                        <th>Mã số thuế</th>
                        <th>Chủ sở hữu</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.map((c) => (
                        <tr
                          key={c.id}
                          className='border-b last:border-b-0 hover:bg-gray-50 transition-colors'
                        >
                          <td className='py-3 text-muted-foreground'>{c.id}</td>
                          <td className='py-3'>
                            <div className='flex items-center gap-3'>
                              <div className='h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0'>
                                {c.logoUrl ? (
                                  <img
                                    src={c.logoUrl}
                                    alt=''
                                    className='h-full w-full object-cover'
                                  />
                                ) : (
                                  <Building2 className='h-4 w-4 text-gray-400' />
                                )}
                              </div>
                              <div>
                                <p className='font-medium'>{c.name}</p>
                                <p className='text-xs text-muted-foreground'>
                                  {c.address?.split(',').slice(-1)[0]?.trim() || '—'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className='text-muted-foreground'>{c.taxCode || '—'}</td>
                          <td>
                            <p className='text-sm'>{c.ownerName}</p>
                            <p className='text-xs text-muted-foreground'>{c.ownerEmail}</p>
                          </td>
                          <td>{getStatusBadge(c.status)}</td>
                          <td className='text-muted-foreground'>
                            {new Date(c.createdAt).toLocaleString('vi-VN')}
                          </td>
                          <td>
                            <Button
                              variant='outline'
                              size='sm'
                              className='rounded-xl'
                              onClick={() => setSelectedCompanyId(c.id)}
                            >
                              <Eye className='h-3.5 w-3.5 mr-1' /> Xem
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </>
            )}
          </div>
        )}

        {/* ==================== REPORTS ==================== */}
        {active === 'reports' && (
          <div className='space-y-6'>
            <Card className='p-4 rounded-xl shadow-sm border-0 flex flex-wrap gap-3 items-center'>
              <select className='rounded-xl border px-4 py-2 text-sm bg-white'>
                <option>Status</option>
                <option>New</option>
                <option>In progress</option>
                <option>Resolved</option>
              </select>
              <Input type='date' className='max-w-[160px] rounded-xl' />
              <Input type='date' className='max-w-[160px] rounded-xl' />
              <select className='rounded-xl border px-4 py-2 text-sm bg-white'>
                <option>Lý do</option>
              </select>
              <Button className='rounded-xl'>Lọc</Button>
            </Card>

            {reports.length === 0 ? (
              <EmptyState title={MSG.MSG33} description='Chưa có báo cáo nào.' />
            ) : selectedReport ? (
              <div className='grid lg:grid-cols-2 gap-6'>
                <Card className='p-6 rounded-xl shadow-sm border-0'>
                  <h3 className='font-semibold mb-4'>Thông tin job</h3>
                  <dl className='space-y-2 text-sm'>
                    <div>
                      <dt className='text-muted-foreground'>Tin tuyển dụng</dt>
                      <dd className='font-medium'>{jobSnapshot?.title}</dd>
                    </div>
                    <div>
                      <dt className='text-muted-foreground'>Công ty</dt>
                      <dd>{jobSnapshot?.company}</dd>
                    </div>
                    <div>
                      <dt className='text-muted-foreground'>Lương</dt>
                      <dd>{jobSnapshot?.salary}</dd>
                    </div>
                    <div>
                      <dt className='text-muted-foreground'>Ca làm</dt>
                      <dd>{jobSnapshot?.shifts}</dd>
                    </div>
                    <div>
                      <dt className='text-muted-foreground'>Địa điểm</dt>
                      <dd>{jobSnapshot?.location}</dd>
                    </div>
                    <div>
                      <dt className='text-muted-foreground'>Trạng thái</dt>
                      <dd>
                        <Badge className='rounded-lg'>{jobSnapshot?.status}</Badge>
                      </dd>
                    </div>
                  </dl>
                </Card>
                <Card className='p-6 rounded-xl shadow-sm border-0'>
                  <h3 className='font-semibold mb-4'>Chi tiết báo cáo</h3>
                  <dl className='space-y-2 text-sm'>
                    <div>
                      <dt className='text-muted-foreground'>Người báo cáo</dt>
                      <dd>{selectedReport.reportingWorker}</dd>
                    </div>
                    <div>
                      <dt className='text-muted-foreground'>Lý do</dt>
                      <dd>{selectedReport.reason}</dd>
                    </div>
                    <div>
                      <dt className='text-muted-foreground'>Thời gian</dt>
                      <dd>{selectedReport.created}</dd>
                    </div>
                  </dl>
                  <div className='mt-6 flex flex-wrap gap-2'>
                    <Button
                      variant='destructive'
                      className='rounded-xl'
                      onClick={() => setDisableJobConfirm(true)}
                    >
                      Vô hiệu hóa job
                    </Button>
                    <Button
                      variant='outline'
                      className='rounded-xl'
                      onClick={() => setEnableJobConfirm(true)}
                    >
                      Bật lại job
                    </Button>
                    <Button className='rounded-xl' onClick={handleResolve}>
                      Đánh dấu đã xử lý
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className='p-4 rounded-xl shadow-sm border-0 overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead className='text-left text-muted-foreground border-b'>
                    <tr>
                      <th className='py-2'>Job title</th>
                      <th>Reporting worker</th>
                      <th>Reason</th>
                      <th>Created</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} className='border-b last:border-b-0'>
                        <td className='py-3 font-medium'>{r.jobTitle}</td>
                        <td>{r.reportingWorker}</td>
                        <td>{r.reason}</td>
                        <td>{r.created}</td>
                        <td>
                          <Badge className='rounded-lg'>{r.status}</Badge>
                        </td>
                        <td>
                          <Button
                            variant='outline'
                            size='sm'
                            className='rounded-xl'
                            onClick={() => setSelectedReport(r)}
                          >
                            Xem
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

        {/* ==================== REVIEW REPORTS ==================== */}
        {active === 'reviewReports' && (
          <div className='space-y-6'>
            <Card className='p-4 rounded-xl shadow-sm border-0 overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='text-left text-muted-foreground border-b'>
                  <tr>
                    <th className='py-2'>Công ty</th>
                    <th>Người báo cáo</th>
                    <th>Lý do</th>
                    <th>Ngày</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewReports.map((r) => (
                    <tr key={r.id} className='border-b last:border-b-0'>
                      <td className='py-3 font-medium'>{r.companyName}</td>
                      <td>{r.reporter}</td>
                      <td>{r.reason}</td>
                      <td>{r.createdAt}</td>
                      <td>
                        <Badge className='rounded-lg'>{r.status}</Badge>
                      </td>
                      <td>
                        <Button
                          variant='outline'
                          size='sm'
                          className='rounded-xl'
                          onClick={() => setSelectedReviewReport(r)}
                        >
                          Xem
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            {selectedReviewReport && (
              <Card className='p-6 rounded-xl shadow-sm border-0 max-w-2xl'>
                <h3 className='font-semibold mb-4'>Chi tiết báo cáo đánh giá</h3>
                <dl className='space-y-2 text-sm'>
                  <div>
                    <dt className='text-muted-foreground'>Nội dung bị báo cáo</dt>
                    <dd>{selectedReviewReport.content}</dd>
                  </div>
                  <div>
                    <dt className='text-muted-foreground'>Lý do</dt>
                    <dd>{selectedReviewReport.reason}</dd>
                  </div>
                </dl>
                <div className='mt-4 flex gap-2'>
                  <Button variant='destructive' size='sm' className='rounded-xl'>
                    Xóa đánh giá
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='rounded-xl'
                    onClick={() => setSelectedReviewReport(null)}
                  >
                    Đóng
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ==================== APPROVALS ==================== */}
        {active === 'approvals' && (
          <div className='space-y-6'>
            {pendingCompanies.length === 0 ? (
              <EmptyState title={MSG.MSG53} description='Chưa có đơn đăng ký công ty.' />
            ) : selectedApproval ? (
              <Card className='p-6 rounded-xl shadow-sm border-0 max-w-2xl'>
                <h3 className='font-semibold mb-4'>Thông tin công ty</h3>
                <dl className='space-y-2 text-sm'>
                  <div>
                    <dt className='text-muted-foreground'>Tên công ty</dt>
                    <dd className='font-medium'>{selectedApproval.companyName}</dd>
                  </div>
                  <div>
                    <dt className='text-muted-foreground'>Chủ sở hữu</dt>
                    <dd>{selectedApproval.owner}</dd>
                  </div>
                  <div>
                    <dt className='text-muted-foreground'>Ngày nộp</dt>
                    <dd>{new Date(selectedApproval.submittedDate).toLocaleString('vi-VN')}</dd>
                  </div>
                </dl>
                <div className='mt-4 h-24 rounded-xl border bg-gray-50 flex items-center justify-center text-muted-foreground text-sm'>
                  Khu vực xem tài liệu (preview placeholder)
                </div>
                <div className='mt-6 flex gap-4'>
                  <div className='flex-1'>
                    <label className='text-sm font-medium'>Ghi chú (Duyệt)</label>
                    <Input
                      className='mt-1 rounded-xl'
                      placeholder='Ghi chú...'
                      value={approveNote}
                      onChange={(e) => setApproveNote(e.target.value)}
                    />
                  </div>
                  <div className='flex-1'>
                    <label className='text-sm font-medium'>Ghi chú (Từ chối)</label>
                    <Input
                      className='mt-1 rounded-xl'
                      placeholder='Ghi chú...'
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                    />
                  </div>
                </div>
                <div className='mt-4 flex gap-2'>
                  <Button className='rounded-xl' onClick={handleApproveCompany}>
                    Approve
                  </Button>
                  <Button
                    variant='destructive'
                    className='rounded-xl'
                    onClick={handleRejectCompany}
                  >
                    Reject
                  </Button>
                  <Button
                    variant='outline'
                    className='rounded-xl'
                    onClick={() => setSelectedApproval(null)}
                  >
                    Quay lại
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className='p-4 rounded-xl shadow-sm border-0 overflow-x-auto min-h-[500px]'>
                <table className='w-full text-sm'>
                  <thead className='text-left text-muted-foreground border-b'>
                    <tr>
                      <th className='py-2'>Tên công ty</th>
                      <th>Người đăng ký</th>
                      <th>Ngày nộp</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCompanies.map((c) => (
                      <tr key={c.id} className='border-b last:border-b-0'>
                        <td className='py-3 font-medium'>{c.companyName}</td>
                        <td>{c.owner}</td>
                        <td>{c.submittedDate}</td>
                        <td>
                          <Badge className='rounded-lg'>{c.status}</Badge>
                        </td>
                        <td>
                          <Button
                            variant='outline'
                            size='sm'
                            className='rounded-xl'
                            onClick={() => setSelectedApproval(c)}
                          >
                            Xem
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

        <Modal
          open={disableJobConfirm}
          title='Vô hiệu hóa job'
          description='Bạn chắc chắn muốn vô hiệu hóa tin tuyển dụng này?'
          onClose={() => setDisableJobConfirm(false)}
          onConfirm={handleDisableJob}
          confirmLabel='Vô hiệu hóa'
          tone='danger'
        />
        <Modal
          open={enableJobConfirm}
          title='Bật lại job'
          description='Bạn chắc chắn muốn bật lại tin này?'
          onClose={() => setEnableJobConfirm(false)}
          onConfirm={handleEnableJob}
          confirmLabel='Bật lại'
        />
      </DashboardLayout>
    </div>
  );
};

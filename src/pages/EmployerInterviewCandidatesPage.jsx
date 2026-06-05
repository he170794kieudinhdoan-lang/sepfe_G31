import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Loader2, Calendar, ArrowLeft, User, Briefcase, MapPin, Clock, Mail, Phone, Download } from 'lucide-react';
import { useSuitableApplications } from '@/features/jobs/api/useJobs';
import { getSuitableApplicationsApi } from '@/features/jobs/api/jobApi';
import * as XLSX from 'xlsx';
import { DashboardLayout } from '@/shared/components/Layout/DashboardLayout';
import { EMPLOYER_MENU } from '@/pages/EmployerDashboard';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';

export const EmployerInterviewCandidatesPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { jobTitle, slots = [] } = location.state || {};

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [interviewStatus, setInterviewStatus] = useState('ALL');
  const [slotId, setSlotId] = useState('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const limit = 10;

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useSuitableApplications(
    jobId ? Number(jobId) : null,
    page,
    limit,
    debouncedSearch,
    interviewStatus,
    slotId
  );

  const renderStatusBadge = (invitation) => {
    if (!invitation) return null;
    if (invitation.selectedSlot) {
      const slotText = `${new Date(invitation.selectedSlot.startAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}`;
      return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20"><Calendar className="h-3 w-3" />{slotText}</span>;
    }
    if (invitation.status === 'REJECTED') {
      return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20"><span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>Không tham gia</span>;
    }
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20"><span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>Chưa chọn ca</span>;
  };

  const applications = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const GENDER_MAP = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };
  const SHIFT_MAP = { MORNING: 'Ca sáng', AFTERNOON: 'Ca chiều', EVENING: 'Ca tối', FULL_DAY: 'Cả ngày', FLEXIBLE: 'Linh hoạt' };
  const INTERVIEW_STATUS_MAP = { PENDING: 'Chưa phản hồi', ACCEPTED: 'Đã chọn ca', REJECTED: 'Không tham gia' };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Lấy toàn bộ ứng viên (không phân trang) theo bộ lọc hiện tại
      const res = await getSuitableApplicationsApi(
        jobId ? Number(jobId) : null,
        1,
        9999,
        debouncedSearch,
        interviewStatus,
        slotId,
      );
      const allApps = res?.data || [];

      const rows = allApps.map((app) => {
        const user = app.user || {};
        const profile = user.workerProfile || {};
        const invitation = user.interviewInvitations?.[0];
        const location = [profile.ward, profile.province].filter(Boolean).join(', ');
        const salaryStr = profile.expectedSalary
          ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(profile.expectedSalary)
          : 'Chưa cập nhật';

        let interviewStatusStr = 'Chưa mời';
        let selectedSlotStr = '';
        if (invitation) {
          interviewStatusStr = INTERVIEW_STATUS_MAP[invitation.status] || invitation.status;
          if (invitation.selectedSlot) {
            selectedSlotStr = new Date(invitation.selectedSlot.startAt).toLocaleString('vi-VN', {
              hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
            });
          }
        }

        return {
          'Họ và tên': user.fullName || '',
          'Email': user.email || '',
          'Số điện thoại': user.phone || '',
          'Giới tính': GENDER_MAP[profile.gender] || '',
          'Năm sinh': profile.birthYear || '',
          'Khu vực': location || '',
          'Nghề nghiệp': profile.occupation?.name || '',
          'Kinh nghiệm (năm)': profile.experienceYear ?? '',
          'Lương mong muốn': salaryStr,
          'Ca làm mong muốn': SHIFT_MAP[profile.shift] || profile.shift || '',
          'Giới thiệu bản thân': profile.bio || '',
          'Mong muốn công việc': profile.desiredJobText || '',
          'Trạng thái phỏng vấn': interviewStatusStr,
          'Ca phỏng vấn đã chọn': selectedSlotStr,
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows);

      // Tự động điều chỉnh độ rộng cột
      const colWidths = Object.keys(rows[0] || {}).map((key) => ({
        wch: Math.max(key.length, ...rows.map((r) => String(r[key] || '').length), 12),
      }));
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Ứng viên phỏng vấn');

      const safeTitle = (jobTitle || 'ung-vien').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
      XLSX.writeFile(wb, `${safeTitle}_ung_vien_phong_van.xlsx`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout
      title="Quản lý ứng viên phỏng vấn"
      subtitle={`Theo dõi các ứng viên phù hợp cho "${jobTitle || 'Tin tuyển dụng'}"`}
      menu={EMPLOYER_MENU}
      activeKey="interviews"
      onSelect={() => {}}
      topbarBell={<NotificationBellPopover />}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/employer/interviews')}
            className="text-slate-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || total === 0}
            className="gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? 'Đang xuất...' : `Xuất Excel${total > 0 ? ` (${total})` : ''}`}
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm font-semibold text-slate-800">
                Tổng cộng: <span className="text-primary text-xl">{total}</span> ứng viên
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  value={interviewStatus}
                  onValueChange={(val) => {
                    setInterviewStatus(val);
                    if (val !== 'ACCEPTED') setSlotId('ALL');
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[160px] h-10">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                    <SelectItem value="ACCEPTED">Đã chọn ca</SelectItem>
                    <SelectItem value="NO_SLOT">Chưa chọn ca</SelectItem>
                    <SelectItem value="REJECTED">Không tham gia</SelectItem>
                  </SelectContent>
                </Select>

                {interviewStatus === 'ACCEPTED' && (
                  <Select value={slotId} onValueChange={(val) => { setSlotId(val); setPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[180px] h-10">
                      <SelectValue placeholder="Ca phỏng vấn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tất cả các ca</SelectItem>
                      {slots.map(slot => (
                        <SelectItem key={slot.id} value={slot.id.toString()}>
                          {new Date(slot.startAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="relative w-full sm:w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Tìm theo tên, email hoặc số điện thoại..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-10 w-full bg-slate-50 border-slate-200"
                  />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 text-center">
                Đã có lỗi xảy ra khi tải dữ liệu ứng viên.
              </div>
            ) : applications.length === 0 ? (
              <div className="rounded-xl border border-slate-200 border-dashed bg-slate-50 py-20 flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">Không tìm thấy ứng viên phù hợp nào.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {applications.map((app) => {
                    const invitation = app.user?.interviewInvitations?.[0];
                    return (
                      <div
                        key={app.id}
                        className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
                        onClick={() => setSelectedCandidate(app)}
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                          {app.user?.avatar ? (
                            <img
                              src={app.user.avatar}
                              alt={app.user.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-400">
                              {(app.user?.fullName || 'W').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1.5">
                            <h4 className="truncate text-base font-semibold text-slate-900">
                              {app.user?.fullName}
                            </h4>
                            {renderStatusBadge(invitation)}
                          </div>
                          <div className="mt-0.5 space-y-0.5">
                            {app.user?.email && (
                              <p className="truncate text-sm text-slate-500 flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                {app.user.email}
                              </p>
                            )}
                            {app.user?.phone && (
                              <p className="truncate text-sm text-slate-500 flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                {app.user.phone}
                              </p>
                            )}
                            {!app.user?.email && !app.user?.phone && (
                              <p className="text-sm text-slate-400">Chưa có thông tin liên hệ</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center pb-4 border-t border-slate-100 pt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setPage((p) => Math.max(1, p - 1));
                            }}
                            className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>

                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i + 1}>
                            <PaginationLink
                              href="#"
                              isActive={page === i + 1}
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(i + 1);
                              }}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setPage((p) => Math.min(totalPages, p + 1));
                            }}
                            className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Profile Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Thông tin ứng viên</DialogTitle>
          </DialogHeader>
          {selectedCandidate?.user && (() => {
            const user = selectedCandidate.user;
            const profile = user.workerProfile;
            const invitation = user.interviewInvitations?.[0];
            const genderMap = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };
            const shiftMap = { MORNING: 'Ca sáng', AFTERNOON: 'Ca chiều', EVENING: 'Ca tối', FULL_DAY: 'Cả ngày', FLEXIBLE: 'Linh hoạt' };
            const location = [profile?.ward, profile?.province].filter(Boolean).join(', ');
            return (
              <div className="space-y-4">
                {/* Avatar + Name */}
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-400">
                        {(user.fullName || 'W').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-slate-900">{user.fullName}</h3>
                    {profile?.occupation?.name && (
                      <p className="text-sm text-primary font-medium mt-0.5">{profile.occupation.name}</p>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Liên hệ</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">{user.email || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{user.phone || 'Chưa có SĐT'}</span>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Thông tin cá nhân</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-xs text-slate-400">Giới tính</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">{genderMap[profile?.gender] || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Năm sinh</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">{profile?.birthYear || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Khu vực</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        {location || 'Chưa cập nhật'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Kinh nghiệm</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">{profile?.experienceYear != null ? `${profile.experienceYear} năm` : 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Lương mong muốn</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">{profile?.expectedSalary != null ? `${Number(profile.expectedSalary).toLocaleString('vi-VN')}đ` : 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Ca làm mong muốn</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">{shiftMap[profile?.shift] || profile?.shift || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>

                {/* Bio & Desired job */}
                {(profile?.bio || profile?.desiredJobText) && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mô tả bản thân</p>
                    {profile?.bio && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Giới thiệu</p>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
                      </div>
                    )}
                    {profile?.desiredJobText && (
                      <div className={profile?.bio ? 'pt-3 border-t border-slate-200' : ''}>
                        <p className="text-xs text-slate-400 mb-1">Mong muốn công việc</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{profile.desiredJobText}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Interview Status */}
                {invitation && (
                  <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/10 px-4 py-3">
                    <span className="text-sm text-slate-600">Trạng thái phỏng vấn</span>
                    {renderStatusBadge(invitation)}
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

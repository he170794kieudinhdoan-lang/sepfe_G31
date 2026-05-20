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
import { Search, Loader2, Calendar, ArrowLeft, User, Briefcase, MapPin, Clock, Mail, Phone } from 'lucide-react';
import { useSuitableApplications } from '@/features/jobs/api/useJobs';
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
                    placeholder="Tìm theo tên, email..."
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
                          <p className="truncate text-sm text-slate-500">
                            {app.user?.email} • {app.user?.phone || 'Chưa có SĐT'}
                          </p>
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
            const shiftMap = { DAY: 'Ca ngày', NIGHT: 'Ca đêm', FLEXIBLE: 'Linh hoạt' };
            return (
              <div className="space-y-5">
                {/* Avatar + Name */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-400">
                        {(user.fullName || 'W').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{user.fullName}</h3>
                    {profile?.occupation?.name && (
                      <p className="text-sm text-primary font-medium">{profile.occupation.name}</p>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="rounded-lg bg-slate-50 p-4 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="text-slate-700">{user.email || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="text-slate-700">{user.phone || 'Chưa có SĐT'}</span>
                  </div>
                  {profile?.province && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="text-slate-700">{profile.province}</span>
                    </div>
                  )}
                </div>

                {/* Profile Details */}
                {profile && (
                  <div className="grid grid-cols-2 gap-3">
                    {profile.gender && (
                      <div className="rounded-lg border border-slate-200 p-3">
                        <p className="text-xs text-slate-400 mb-0.5">Giới tính</p>
                        <p className="text-sm font-medium text-slate-800">{genderMap[profile.gender] || profile.gender}</p>
                      </div>
                    )}
                    {profile.birthYear && (
                      <div className="rounded-lg border border-slate-200 p-3">
                        <p className="text-xs text-slate-400 mb-0.5">Năm sinh</p>
                        <p className="text-sm font-medium text-slate-800">{profile.birthYear}</p>
                      </div>
                    )}
                    {profile.experienceYear != null && (
                      <div className="rounded-lg border border-slate-200 p-3">
                        <p className="text-xs text-slate-400 mb-0.5">Kinh nghiệm</p>
                        <p className="text-sm font-medium text-slate-800">{profile.experienceYear} năm</p>
                      </div>
                    )}
                    {profile.expectedSalary != null && (
                      <div className="rounded-lg border border-slate-200 p-3">
                        <p className="text-xs text-slate-400 mb-0.5">Lương mong muốn</p>
                        <p className="text-sm font-medium text-slate-800">{Number(profile.expectedSalary).toLocaleString('vi-VN')}đ</p>
                      </div>
                    )}
                    {profile.shift && (
                      <div className="rounded-lg border border-slate-200 p-3 col-span-2">
                        <p className="text-xs text-slate-400 mb-0.5">Ca làm việc</p>
                        <p className="text-sm font-medium text-slate-800">{shiftMap[profile.shift] || profile.shift}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Bio */}
                {profile?.bio && (
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs text-slate-400 mb-1">Giới thiệu bản thân</p>
                    <p className="text-sm text-slate-700 whitespace-pre-line">{profile.bio}</p>
                  </div>
                )}

                {/* Interview Status */}
                {invitation && (
                  <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/10 p-3">
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

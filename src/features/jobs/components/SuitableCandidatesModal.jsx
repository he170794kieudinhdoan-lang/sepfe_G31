import React, { useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, Loader2, Calendar, Phone, Mail, MapPin, Briefcase, User } from 'lucide-react';
import { useSuitableApplications } from '../api/useJobs';

const SHIFT_LABELS = {
  MORNING: 'Ca sáng',
  AFTERNOON: 'Ca chiều',
  EVENING: 'Ca tối',
  FULL_DAY: 'Cả ngày',
  FLEXIBLE: 'Linh hoạt',
};

const GENDER_LABELS = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
};

const formatSalaryVN = (val) => {
  if (!val) return 'Chưa cập nhật';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);
};

const renderInvitationBadge = (invitation) => {
  if (!invitation) return null;
  switch (invitation.status) {
    case 'PENDING':
      return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Chưa phản hồi PV</span>;
    case 'ACCEPTED': {
      const slotText = invitation.selectedSlot
        ? new Date(invitation.selectedSlot.startAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
        : 'Đã chọn';
      return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20"><Calendar className="h-3 w-3" />{slotText}</span>;
    }
    case 'REJECTED':
      return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" />Không tham gia</span>;
    default:
      return null;
  }
};

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-400">{label}</p>
    <p className="font-medium text-slate-800 mt-0.5 text-sm">{value || 'Chưa cập nhật'}</p>
  </div>
);

const CandidateDetailModal = ({ app, onClose }) => {
  if (!app) return null;
  const profile = app.user?.workerProfile;
  const invitation = app.user?.interviewInvitations?.[0];

  const location = [profile?.ward, profile?.province].filter(Boolean).join(', ') || null;

  return (
    <Modal
      open={!!app}
      onClose={onClose}
      title="Thông tin ứng viên"
      variant="custom"
      contentClassName="max-w-xl"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            {app.user?.avatar ? (
              <img src={app.user.avatar} alt={app.user.fullName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-400">
                {(app.user?.fullName || 'W').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-slate-900">{app.user?.fullName || 'Chưa cập nhật'}</h3>
            {profile?.occupation?.name && (
              <p className="text-sm text-primary font-medium mt-0.5">{profile.occupation.name}</p>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Liên hệ</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">{app.user?.email || 'Chưa cập nhật'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{app.user?.phone || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Thông tin cá nhân</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <InfoRow label="Giới tính" value={GENDER_LABELS[profile?.gender]} />
            <InfoRow label="Năm sinh" value={profile?.birthYear} />
            <InfoRow
              label="Khu vực"
              value={location ? <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400 shrink-0" />{location}</span> : null}
            />
            <InfoRow
              label="Kinh nghiệm"
              value={profile?.experienceYear != null ? `${profile.experienceYear} năm` : null}
            />
            <InfoRow
              label="Lương mong muốn"
              value={profile?.expectedSalary ? formatSalaryVN(profile.expectedSalary) : null}
            />
            <InfoRow
              label="Ca làm mong muốn"
              value={SHIFT_LABELS[profile?.shift] || profile?.shift}
            />
          </div>
        </div>

        {/* Bio & Desired job */}
        {(profile?.bio || profile?.desiredJobText) && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mô tả bản thân</p>
            {profile?.bio && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Giới thiệu</p>
                <p className="text-sm text-slate-700 leading-relaxed">{profile.bio}</p>
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
      </div>
    </Modal>
  );
};

export const SuitableCandidatesModal = ({ isOpen, onClose, jobId, jobTitle }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const limit = 10;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useSuitableApplications(
    isOpen ? jobId : null,
    page,
    limit,
    debouncedSearch,
  );

  const handleClose = () => {
    onClose();
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
    setSelectedApp(null);
  };

  const applications = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Modal
        open={isOpen}
        onClose={handleClose}
        title={`Ứng viên phù hợp — "${jobTitle || 'Tin tuyển dụng'}"`}
        variant="custom"
        contentClassName="max-w-2xl"
      >
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500 shrink-0">
              <span className="font-semibold text-slate-800 text-base">{total}</span> ứng viên
            </p>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Tìm theo tên, email hoặc số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 w-full"
              />
            </div>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              Đã có lỗi xảy ra khi tải dữ liệu.
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-xl border border-slate-200 border-dashed bg-slate-50 py-12 text-center">
              <p className="text-slate-500">Không tìm thấy ứng viên nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedApp(app)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedApp(app); } }}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-colors min-w-0"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                    {app.user?.avatar ? (
                      <img src={app.user.avatar} alt={app.user.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
                        {(app.user?.fullName || 'W').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900 text-sm">{app.user?.fullName}</p>
                    {app.user?.phone || app.user?.email ? (
                      <div className="mt-0.5 space-y-0.5">
                        {app.user?.phone && (
                          <p className="truncate text-xs text-slate-500 flex items-center gap-1">
                            <Phone className="h-3 w-3 shrink-0" />
                            {app.user.phone}
                          </p>
                        )}
                        {app.user?.email && (
                          <p className="truncate text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="h-3 w-3 shrink-0" />
                            {app.user.email}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-0.5">Chưa có thông tin</p>
                    )}
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="pt-2 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                          className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            href="#"
                            isActive={page === i + 1}
                            onClick={(e) => { e.preventDefault(); setPage(i + 1); }}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
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
      </Modal>

      <CandidateDetailModal app={selectedApp} onClose={() => setSelectedApp(null)} />
    </>
  );
};

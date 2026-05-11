import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import viLocale from '@fullcalendar/core/locales/vi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/shared/components/Layout/DashboardLayout';
import { Modal } from '@/shared/components/Modal';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useToast } from '@/shared/contexts/ToastContext';
import { useGetMyCompany } from '@/features/companies/api/useGetCompanies';
import {
  useEmployerApplications,
  useJobsForEmployer,
} from '@/features/jobs/api/useJobs';
import {
  cancelCampaign,
  createCampaign,
  getCampaignDetail,
  getCampaigns,
} from '@/features/interview-invitations/api/interviewInvitationApi';
import {
  AlertCircle,
  BarChart3,
  Briefcase,
  Building2,
  CalendarCheck,
  Clock3,
  Home,
  LayoutDashboard,
  Loader2,
  MapPin,
  MessageCircle,
  Plus,
  Users,
  Wallet,
} from 'lucide-react';

const EMPLOYER_MENU = [
  { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard, path: '/employer' },
  { key: 'jobs', label: 'Tin tuyển dụng', icon: Briefcase, path: '/employer/jobs' },
  {
    key: 'interviews',
    label: 'Lịch phỏng vấn',
    icon: CalendarCheck,
    path: '/employer/interviews',
  },
  { key: 'stats', label: 'Thống kê', icon: BarChart3, path: '/employer/stats' },
  { key: 'wallet', label: 'Tài khoản điểm', icon: Wallet, path: '/employer/wallet' },
  { key: 'chat', label: 'Tin nhắn', icon: MessageCircle, path: '/employer/chat' },
  { key: 'home', label: 'Trang chủ', icon: Home, path: '/', externalNav: true },
];

const DEFAULT_DURATION_HOURS = 1;
const CAMPAIGN_PAGE_LIMIT = 100;

const createDefaultSlot = () => {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + DEFAULT_DURATION_HOURS * 60 * 60 * 1000);

  return {
    localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    capacity: 5,
    location: '',
    note: '',
  };
};

function toDateTimeLocalValue(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDateTime(dateLike) {
  if (!dateLike) return '--';
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return '--';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function normalizeApiMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(', ') : message;
}

function getCampaignStatusMeta(status) {
  const map = {
    DRAFT: {
      label: 'Nháp',
      className: 'border-slate-300 text-slate-700 bg-slate-50',
    },
    SCHEDULED: {
      label: 'Đã lên lịch gửi',
      className: 'border-amber-300 text-amber-700 bg-amber-50',
    },
    IN_PROGRESS: {
      label: 'Đang gửi',
      className: 'border-sky-300 text-sky-700 bg-sky-50',
    },
    COMPLETED: {
      label: 'Đã gửi',
      className: 'border-emerald-300 text-emerald-700 bg-emerald-50',
    },
    CANCELLED: {
      label: 'Đã hủy',
      className: 'border-rose-300 text-rose-700 bg-rose-50',
    },
  };

  return (
    map[status] || {
      label: status || 'Không xác định',
      className: 'border-slate-300 text-slate-700 bg-slate-50',
    }
  );
}

export const EmployerInterviewSchedulePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [detailSelectedSlotId, setDetailSelectedSlotId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedUpcomingJobKey, setSelectedUpcomingJobKey] = useState(null);
  const slotApplicantPanelRef = useRef(null);
  const jobIdFromUrl = searchParams.get('jobId');

  const [form, setForm] = useState({
    jobId: '',
    expiresAt: '',
    workerIds: [],
    slots: [createDefaultSlot()],
  });

  const { data: company, isLoading: loadingCompany } = useGetMyCompany();
  const { data: allJobsResult } = useJobsForEmployer(
    { allStatus: true, fetchAll: true },
    { staleTime: 60 * 1000 },
  );

  const {
    data: campaignResult,
    isLoading: loadingCampaigns,
    refetch: refetchCampaigns,
  } = useQuery({
    queryKey: ['employer-interview-campaigns'],
    queryFn: () => getCampaigns(1, CAMPAIGN_PAGE_LIMIT),
  });

  const selectedJobId = form.jobId ? Number(form.jobId) : undefined;
  const { data: applicationsResult } = useEmployerApplications(selectedJobId);

  const allJobs = Array.isArray(allJobsResult)
    ? allJobsResult
    : allJobsResult?.items || allJobsResult?.data || [];
  const campaigns = campaignResult?.data || [];
  const availableJobs = useMemo(() => {
    const now = Date.now();
    const scheduledJobIds = new Set(
      (campaigns || [])
        .filter(
          (campaign) =>
            campaign?.jobId &&
            campaign?.status !== 'CANCELLED' &&
            Array.isArray(campaign?.slots) &&
            campaign.slots.length > 0,
        )
        .map((campaign) => Number(campaign.jobId)),
    );

    return allJobs.filter((job) => {
      const expiredAt = job?.expiredAt ? new Date(job.expiredAt).getTime() : null;
      const isNotExpired =
        expiredAt === null || (!Number.isNaN(expiredAt) && expiredAt >= now);
      const hasExistingSchedule = scheduledJobIds.has(Number(job?.id));
      return isNotExpired && !hasExistingSchedule;
    });
  }, [allJobs, campaigns]);
  const applicants = applicationsResult?.data || [];

  const selectableApplicants = useMemo(() => {
    const map = new Map();
    applicants.forEach((application) => {
      const userId = application?.user?.id;
      if (!userId) return;
      if (['CANCELLED', 'UNSUITABLE'].includes(application.status)) return;
      if (!map.has(userId)) {
        map.set(userId, application);
      }
    });
    return Array.from(map.values());
  }, [applicants]);

  const upcomingSlots = useMemo(() => {
    const now = Date.now();
    return campaigns
      .filter((campaign) => campaign?.status !== 'CANCELLED')
      .flatMap((campaign) =>
        (campaign?.slots || []).map((slot) => ({
          ...slot,
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          campaignStatus: campaign.status,
          acceptedCount: campaign.acceptedCount || 0,
          pendingCount: campaign.pendingCount || 0,
          totalCount: campaign.totalCount || 0,
        })),
      )
      .filter((slot) => {
        const startAt = new Date(slot.startAt).getTime();
        return !Number.isNaN(startAt) && startAt >= now;
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [campaigns]);

  const upcomingCampaignCount = useMemo(
    () => new Set(upcomingSlots.map((slot) => slot.campaignId)).size,
    [upcomingSlots],
  );
  const upcomingJobs = useMemo(() => {
    const now = Date.now();
    const grouped = new Map();
    campaigns
      .filter((campaign) => campaign?.status !== 'CANCELLED')
      .forEach((campaign) => {
        const futureSlots = (campaign?.slots || []).filter((slot) => {
          const startAt = new Date(slot.startAt).getTime();
          return !Number.isNaN(startAt) && startAt >= now;
        });
        if (!futureSlots.length) return;
        const jobId = campaign?.jobId ?? `campaign-${campaign.id}`;
        const key = String(jobId);
        const matchedJob = allJobs.find((job) => Number(job.id) === Number(campaign?.jobId));
        const jobTitle =
          matchedJob?.title ||
          campaign?.title ||
          `Job #${campaign?.jobId || campaign.id}`;
        const current = grouped.get(key) || {
          key,
          jobId: campaign?.jobId || null,
          jobTitle,
          campaigns: [],
          slots: [],
        };
        current.campaigns.push(campaign);
        current.slots.push(
          ...futureSlots.map((slot) => ({
            ...slot,
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            campaignStatus: campaign.status,
            acceptedCount: campaign.acceptedCount || 0,
            pendingCount: campaign.pendingCount || 0,
            totalCount: campaign.totalCount || 0,
          })),
        );
        grouped.set(key, current);
      });

    return Array.from(grouped.values())
      .map((group) => ({
        ...group,
        slots: group.slots.sort(
          (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
        ),
      }))
      .sort((a, b) => {
        const aStart = new Date(a.slots[0]?.startAt || 0).getTime();
        const bStart = new Date(b.slots[0]?.startAt || 0).getTime();
        return aStart - bStart;
      });
  }, [campaigns, allJobs]);
  const selectedUpcomingJob = useMemo(() => {
    if (!upcomingJobs.length) return null;
    if (!selectedUpcomingJobKey) return upcomingJobs[0];
    return upcomingJobs.find((job) => job.key === selectedUpcomingJobKey) || upcomingJobs[0];
  }, [upcomingJobs, selectedUpcomingJobKey]);

  useEffect(() => {
    if (!jobIdFromUrl || !upcomingJobs.length) return;

    const matchedJob = upcomingJobs.find(
      (job) => String(job.jobId || '') === String(jobIdFromUrl),
    );

    if (matchedJob) {
      setSelectedUpcomingJobKey(matchedJob.key);
    }
  }, [jobIdFromUrl, upcomingJobs]);

  useEffect(() => {
    if (!form.jobId) return;
    const stillAvailable = availableJobs.some(
      (job) => String(job.id) === String(form.jobId),
    );
    if (stillAvailable) return;
    setForm((prev) => ({
      ...prev,
      jobId: '',
      workerIds: [],
    }));
  }, [availableJobs, form.jobId]);

  const resetForm = () => {
    const defaultSlot = createDefaultSlot();
    setForm({
      jobId: '',
      expiresAt: '',
      workerIds: [],
      slots: [defaultSlot],
    });
    setSelectedSlotId(defaultSlot.localId);
  };

  const invalidateInterviewData = async () => {
    await Promise.all([
      refetchCampaigns(),
      queryClient.invalidateQueries({ queryKey: ['employer-interview-campaigns'] }),
    ]);
  };

  useEffect(() => {
    if (!upcomingJobs.length) {
      setSelectedUpcomingJobKey(null);
      return;
    }
    if (!selectedUpcomingJobKey) {
      setSelectedUpcomingJobKey(upcomingJobs[0].key);
      return;
    }
    const stillExists = upcomingJobs.some((job) => job.key === selectedUpcomingJobKey);
    if (!stillExists) {
      setSelectedUpcomingJobKey(upcomingJobs[0].key);
    }
  }, [upcomingJobs, selectedUpcomingJobKey]);

  const openDetail = async (campaignId, preferredSlotId = null) => {
    setDetailLoading(true);
    setDetailError('');
    setDetailSelectedSlotId(preferredSlotId);
    try {
      const detail = await getCampaignDetail(campaignId);
      setDetailData(detail);
    } catch (error) {
      setDetailData(null);
      setDetailError(
        normalizeApiMessage(error, 'Không tải được chi tiết lịch phỏng vấn.'),
      );
    } finally {
      setDetailLoading(false);
      requestAnimationFrame(() => {
        slotApplicantPanelRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    }
  };
  useEffect(() => {
    if (!detailData) {
      setDetailSelectedSlotId(null);
      return;
    }
    const slots = detailData.slots || [];
    if (!slots.length) {
      setDetailSelectedSlotId(null);
      return;
    }
    if (!detailSelectedSlotId || !slots.some((slot) => slot.id === detailSelectedSlotId)) {
      setDetailSelectedSlotId(slots[0].id);
    }
  }, [detailData, detailSelectedSlotId]);

  const handleSlotChange = (localId, field, value) => {
    setForm((prev) => ({
      ...prev,
      slots: prev.slots.map((slot) =>
        slot.localId === localId ? { ...slot, [field]: value } : slot,
      ),
    }));
  };

  const hasSlotOverlap = (slots, candidate, ignoreId = null) => {
    const candidateStart = new Date(candidate.startAt).getTime();
    const candidateEnd = new Date(candidate.endAt).getTime();
    return slots.some((slot) => {
      if (slot.localId === ignoreId) return false;
      const slotStart = new Date(slot.startAt).getTime();
      const slotEnd = new Date(slot.endAt).getTime();
      return candidateStart < slotEnd && slotStart < candidateEnd;
    });
  };

  const handleCalendarSelect = (selectionInfo) => {
    const startAt = selectionInfo.start?.toISOString();
    const endAt = selectionInfo.end?.toISOString();
    if (!startAt || !endAt) return;

    const newSlot = {
      localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      startAt,
      endAt,
      capacity: 5,
      location: '',
      note: '',
    };

    if (hasSlotOverlap(form.slots, newSlot)) {
      toast('Ca mới bị trùng với ca phỏng vấn hiện có.', 'error');
      return;
    }

    setForm((prev) => ({
      ...prev,
      slots: [...prev.slots, newSlot],
    }));
    setSelectedSlotId(newSlot.localId);
  };

  const handleCalendarSlotDropOrResize = (changeInfo) => {
    const { event } = changeInfo;
    if (!event.start || !event.end) return;
    const updated = {
      localId: event.id,
      startAt: event.start.toISOString(),
      endAt: event.end.toISOString(),
    };
    const startMs = new Date(updated.startAt).getTime();
    const endMs = new Date(updated.endAt).getTime();
    if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
      changeInfo.revert();
      toast('Thời gian ca phỏng vấn không hợp lệ.', 'error');
      return;
    }
    if (startMs < Date.now()) {
      changeInfo.revert();
      toast('Không thể dời ca về thời điểm quá khứ.', 'error');
      return;
    }
    if (hasSlotOverlap(form.slots, updated, event.id)) {
      changeInfo.revert();
      toast('Ca phỏng vấn bị trùng với ca khác.', 'error');
      return;
    }
    setForm((prev) => ({
      ...prev,
      slots: prev.slots.map((slot) =>
        slot.localId === event.id
          ? { ...slot, startAt: updated.startAt, endAt: updated.endAt }
          : slot,
      ),
    }));
    setSelectedSlotId(event.id);
  };

  const removeSlot = (localId) => {
    setForm((prev) => ({
      ...prev,
      slots:
        prev.slots.length === 1
          ? prev.slots
          : prev.slots.filter((slot) => slot.localId !== localId),
    }));
    setSelectedSlotId((prev) =>
      prev === localId ? form.slots.find((slot) => slot.localId !== localId)?.localId || null : prev,
    );
  };

  const calendarEvents = useMemo(
    () =>
      form.slots.map((slot) => ({
        id: slot.localId,
        title: `Ca (${slot.capacity})`,
        start: slot.startAt,
        end: slot.endAt,
      })),
    [form.slots],
  );

  const selectedSlot =
    form.slots.find((slot) => slot.localId === selectedSlotId) || null;

  const sortedSlots = useMemo(
    () =>
      [...form.slots].sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      ),
    [form.slots],
  );

  const earliestSlotStartMs = useMemo(() => {
    if (!form.slots.length) return null;
    const startTimes = form.slots
      .map((slot) => new Date(slot.startAt).getTime())
      .filter((value) => !Number.isNaN(value));
    if (!startTimes.length) return null;
    return Math.min(...startTimes);
  }, [form.slots]);
  const earliestSlotStartDate = useMemo(
    () => (earliestSlotStartMs === null ? null : new Date(earliestSlotStartMs)),
    [earliestSlotStartMs],
  );
  const minDeadlineLocalValue = useMemo(() => toDateTimeLocalValue(new Date()), []);
  const maxDeadlineLocalValue = useMemo(() => {
    if (earliestSlotStartMs === null) return '';
    return toDateTimeLocalValue(new Date(earliestSlotStartMs - 60 * 1000));
  }, [earliestSlotStartMs]);

  const deadlineValidationMessage = useMemo(() => {
    if (!form.expiresAt) return '';
    const deadlineMs = new Date(form.expiresAt).getTime();
    if (Number.isNaN(deadlineMs)) {
      return 'Hạn đổi lịch không hợp lệ.';
    }
    if (earliestSlotStartMs !== null && deadlineMs >= earliestSlotStartMs) {
      return 'Hạn đổi lịch phải trước ca phỏng vấn sớm nhất.';
    }
    return '';
  }, [form.expiresAt, earliestSlotStartMs]);
  const selectedDetailSlot = useMemo(
    () => (detailData?.slots || []).find((slot) => slot.id === detailSelectedSlotId) || null,
    [detailData, detailSelectedSlotId],
  );
  const selectedDetailSlotInvitations = useMemo(() => {
    if (!selectedDetailSlot) return [];
    return (detailData?.invitations || []).filter(
      (invitation) => invitation?.selectedSlotId === selectedDetailSlot.id,
    );
  }, [detailData, selectedDetailSlot]);

  const handleCreateCampaign = async () => {
    if (!form.jobId) {
      toast('Vui lòng chọn tin tuyển dụng.', 'error');
      return;
    }
    const selectedWorkerIds = selectableApplicants
      .map((item) => item?.user?.id)
      .filter(Boolean);

    if (!selectedWorkerIds.length) {
      toast('Không có ứng viên phù hợp để tạo lịch phỏng vấn cho job này.', 'error');
      return;
    }
    if (!form.slots.length) {
      toast('Vui lòng tạo ít nhất 1 ca phỏng vấn.', 'error');
      return;
    }
    if (deadlineValidationMessage) {
      toast(deadlineValidationMessage, 'error');
      return;
    }

    const normalizedSlots = form.slots.map((slot) => ({
      startAt: slot.startAt ? new Date(slot.startAt).toISOString() : '',
      endAt: slot.endAt ? new Date(slot.endAt).toISOString() : '',
      capacity: Number(slot.capacity || 0),
      location: slot.location?.trim() || '',
      note: slot.note?.trim() || '',
    }));

    const invalidSlot = normalizedSlots.find((slot) => {
      const start = new Date(slot.startAt).getTime();
      const end = new Date(slot.endAt).getTime();
      return (
        !slot.startAt ||
        !slot.endAt ||
        Number.isNaN(start) ||
        Number.isNaN(end) ||
        end <= start ||
        slot.capacity <= 0
      );
    });

    if (invalidSlot) {
      toast('Vui lòng kiểm tra lại ngày giờ và sức chứa của các ca phỏng vấn.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCampaign({
        jobId: Number(form.jobId),
        workerIds: selectedWorkerIds,
        slots: normalizedSlots,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      });
      toast('Đã tạo lịch phỏng vấn.', 'success');
      setIsCreateOpen(false);
      resetForm();
      await invalidateInterviewData();
    } catch (error) {
      toast(normalizeApiMessage(error, 'Không thể tạo lịch phỏng vấn.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelCampaign = async (campaignId) => {
    setCancellingId(campaignId);
    try {
      await cancelCampaign(campaignId);
      toast('Đã hủy lịch phỏng vấn.', 'success');
      await invalidateInterviewData();
    } catch (error) {
      toast(normalizeApiMessage(error, 'Không thể hủy lịch phỏng vấn.'), 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const hasCompany = !!company?.id;
  const companyStatus = company?.status;
  const canCreate = hasCompany && companyStatus === 'APPROVED';

  if (loadingCompany) {
    return (
      <DashboardLayout
        title="Lịch phỏng vấn"
        subtitle="Theo dõi các lịch phỏng vấn sắp tới của doanh nghiệp."
        menu={EMPLOYER_MENU}
        activeKey="interviews"
        onSelect={() => {}}
      >
        <div className="py-10 flex justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Lịch phỏng vấn"
      subtitle="Tạo lịch phỏng vấn và theo dõi các ca sắp diễn ra của doanh nghiệp."
      menu={EMPLOYER_MENU}
      activeKey="interviews"
      onSelect={() => {}}
      topbarBell={<NotificationBellPopover />}
    >
      {!hasCompany ? (
        <Card className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Bạn chưa có hồ sơ doanh nghiệp
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Hãy hoàn tất hồ sơ công ty trước khi tạo lịch phỏng vấn cho ứng viên.
          </p>
          <Button className="mt-5" onClick={() => navigate('/employer')}>
            Về trang tuyển dụng
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Ca phỏng vấn sắp tới</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{upcomingSlots.length}</p>
            </Card>
            <Card className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Chiến dịch đang có lịch</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{upcomingCampaignCount}</p>
            </Card>
            <Card className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Ứng viên đã xác nhận</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {campaigns.reduce((sum, item) => sum + Number(item?.acceptedCount || 0), 0)}
              </p>
            </Card>
          </div>

          {companyStatus !== 'APPROVED' && (
            <Card className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3 text-amber-800">
                <AlertCircle className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-semibold">Doanh nghiệp chưa ở trạng thái được duyệt</p>
                  <p className="mt-1 text-sm">
                    Bạn vẫn có thể xem lịch đã tạo, nhưng chỉ nên tạo lịch mới sau khi hồ sơ doanh nghiệp được phê duyệt.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Card className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Lịch phỏng vấn sắp tới</h2>
                <p className="text-sm text-slate-500">
                  Danh sách các ca phỏng vấn chưa diễn ra của employer.
                </p>
              </div>
              <Button
                className="gap-2"
                onClick={() => {
                  setIsCreateOpen(true);
                  setTimeout(() => {
                    setSelectedSlotId((prev) => prev || form.slots[0]?.localId || null);
                  }, 0);
                }}
                disabled={!canCreate}
              >
                <Plus className="h-4 w-4" />
                Tạo lịch phỏng vấn
              </Button>
            </div>

            <div className="mt-5">
              {(detailLoading || detailError || detailData) ? (
                <div
                  ref={slotApplicantPanelRef}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
                >
                  <div className="mb-4">
                    <Button
                      variant="ghost"
                      className="rounded-xl px-2 text-slate-700 hover:bg-white"
                      onClick={() => {
                        setDetailData(null);
                        setDetailError('');
                        setDetailSelectedSlotId(null);
                      }}
                    >
                      ← Quay lại
                    </Button>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Ứng viên theo từng ca phỏng vấn
                    </h3>
                    <p className="text-sm text-slate-500">
                      Chọn từng ca để xem danh sách ứng viên đã xác nhận lịch.
                    </p>

                    <div className="mt-4">
                      {detailLoading ? (
                        <div className="py-8 flex justify-center">
                          <Loader2 className="h-7 w-7 animate-spin text-primary" />
                        </div>
                      ) : detailError ? (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                          {detailError}
                        </div>
                      ) : !detailData ? null : (
                        <div className="space-y-4">
                          <div className="grid gap-3 sm:grid-cols-4">
                            <Card className="p-4">
                              <p className="text-xs text-slate-500">Tổng lời mời</p>
                              <p className="mt-1 text-2xl font-bold text-slate-900">
                                {detailData.totalCount || 0}
                              </p>
                            </Card>
                            <Card className="p-4">
                              <p className="text-xs text-slate-500">Đã nhận</p>
                              <p className="mt-1 text-2xl font-bold text-emerald-700">
                                {detailData.acceptedCount || 0}
                              </p>
                            </Card>
                            <Card className="p-4">
                              <p className="text-xs text-slate-500">Từ chối</p>
                              <p className="mt-1 text-2xl font-bold text-rose-700">
                                {detailData.rejectedCount || 0}
                              </p>
                            </Card>
                            <Card className="p-4">
                              <p className="text-xs text-slate-500">Đang chờ</p>
                              <p className="mt-1 text-2xl font-bold text-amber-700">
                                {detailData.pendingCount || 0}
                              </p>
                            </Card>
                          </div>

                          {(detailData.slots || []).length === 0 ? (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                              Chiến dịch chưa có ca phỏng vấn.
                            </div>
                          ) : (
                            <Card className="rounded-2xl border border-slate-200 p-4">
                              {!selectedDetailSlot ? (
                                <p className="text-sm text-slate-500">Không tìm thấy thông tin ca đã chọn.</p>
                              ) : (
                                <div className="space-y-3">
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <p className="font-semibold text-slate-900">Thông tin ca phỏng vấn</p>
                                      <p className="mt-1 text-sm text-slate-500">
                                        {formatDateTime(selectedDetailSlot.startAt)} - {formatDateTime(selectedDetailSlot.endAt)}
                                      </p>
                                    </div>
                                    <Badge variant="outline" className="border-slate-300 text-slate-700">
                                      {selectedDetailSlot.bookedCount || 0}/{selectedDetailSlot.capacity || 0} ứng viên
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-slate-600">
                                    Địa điểm: {selectedDetailSlot.location?.trim() || 'Chưa cập nhật'}
                                  </p>
                                  {selectedDetailSlot.note ? (
                                    <p className="text-sm text-slate-500">
                                      Ghi chú: {selectedDetailSlot.note}
                                    </p>
                                  ) : null}

                                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-sm font-semibold text-slate-800">
                                      Danh sách ứng viên của ca
                                    </p>
                                    {selectedDetailSlotInvitations.length === 0 ? (
                                      <p className="mt-2 text-sm text-slate-500">
                                        Chưa có ứng viên chọn ca này.
                                      </p>
                                    ) : (
                                      <div className="mt-2 space-y-2">
                                        {selectedDetailSlotInvitations.map((invitation) => (
                                          <div
                                            key={invitation.id}
                                            className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                                          >
                                            <p className="text-sm font-medium text-slate-900">
                                              {invitation?.worker?.fullName || `Worker #${invitation?.workerId}`}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                              {invitation?.worker?.phone || invitation?.worker?.email || 'Chưa có liên hệ'}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Card>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
                  <div className="space-y-2">
                    {upcomingJobs.map((jobGroup) => {
                      const isActive = selectedUpcomingJob?.key === jobGroup.key;
                      return (
                        <button
                          key={jobGroup.key}
                          type="button"
                          onClick={() => setSelectedUpcomingJobKey(jobGroup.key)}
                          className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                            isActive
                              ? 'border-primary bg-primary/10'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                          }`}
                        >
                          <p className="text-sm font-semibold text-slate-900">{jobGroup.jobTitle}</p>
                          <p className="mt-1 text-xs text-slate-500">{jobGroup.slots.length} ca sắp tới</p>
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-4">
                    {!selectedUpcomingJob ? null : selectedUpcomingJob.slots.map((slot, index) => {
                      const statusMeta = getCampaignStatusMeta(slot.campaignStatus);
                      return (
                        <Card
                          key={`${slot.campaignId}-${slot.id}`}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Ca #{index + 1}
                              </p>
                              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                                {slot.campaignTitle}
                              </h3>
                            </div>
                            <Badge variant="outline" className={statusMeta.className}>
                              {statusMeta.label}
                            </Badge>
                          </div>

                          <div className="mt-4 space-y-2 text-sm text-slate-600">
                            <p className="flex items-center gap-2">
                              <Clock3 className="h-4 w-4 text-slate-400" />
                              {formatDateTime(slot.startAt)} - {formatDateTime(slot.endAt)}
                            </p>
                            <p className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              {slot.location?.trim() || 'Chưa cập nhật địa điểm'}
                            </p>
                            <p className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-slate-400" />
                              {slot.bookedCount || 0}/{slot.capacity || 0} ứng viên đã chọn ca
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              className="rounded-xl"
                              onClick={() => openDetail(slot.campaignId, slot.id)}
                            >
                              Xem ứng viên của ca
                            </Button>
                            {!['CANCELLED'].includes(slot.campaignStatus) && (
                              <Button
                                variant="ghost"
                                className="rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                onClick={() => handleCancelCampaign(slot.campaignId)}
                                disabled={cancellingId === slot.campaignId}
                              >
                                {cancellingId === slot.campaignId ? 'Đang hủy...' : 'Hủy lịch'}
                              </Button>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      <Modal
        open={isCreateOpen}
        onClose={() => {
          if (isSubmitting) return;
          setIsCreateOpen(false);
          resetForm();
        }}
        title="Tạo lịch phỏng vấn"
        description="Chọn job, ứng viên và các ca phỏng vấn muốn tạo."
        variant="custom"
        contentClassName="max-w-6xl"
        bodyClassName="space-y-5"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Tin tuyển dụng</p>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={form.jobId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    jobId: e.target.value,
                    workerIds: [],
                  }))
                }
              >
                <option value="">Chọn tin tuyển dụng</option>
                {availableJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Các ca phỏng vấn
                  </p>
                  <p className="text-xs text-slate-500">
                    Kéo chọn để tạo ca, kéo thả để đổi giờ, click ca để chỉnh chi tiết.
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {form.slots.length} ca
                </span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 [&_.fc-toolbar-title]:text-base [&_.fc-toolbar-title]:font-semibold [&_.fc-col-header-cell-cushion]:py-2 [&_.fc-timegrid-slot-label-cushion]:text-xs [&_.fc-button]:bg-slate-900! [&_.fc-button]:border-slate-900! [&_.fc-button]:text-white! [&_.fc-button:hover]:bg-slate-700! [&_.fc-button-active]:bg-primary! [&_.fc-event]:border-0! [&_.fc-event]:rounded-lg! [&_.fc-event]:bg-primary! [&_.fc-event-title]:font-medium!">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  locale={viLocale}
                  initialView="timeGridWeek"
                  initialDate={new Date()}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'timeGridDay,timeGridWeek',
                  }}
                  buttonText={{ today: 'Hôm nay', day: 'Ngày', week: 'Tuần' }}
                  height={560}
                  nowIndicator
                  selectable
                  editable
                  selectMirror
                  dayMaxEvents
                  eventOverlap={false}
                  selectOverlap={false}
                  validRange={{ start: new Date() }}
                  dayCellClassNames={(arg) => {
                    const dayStart = new Date(arg.date);
                    dayStart.setHours(0, 0, 0, 0);
                    return dayStart < startOfToday() ? ['opacity-35', 'bg-slate-100'] : [];
                  }}
                  slotLaneClassNames={(arg) => {
                    const isPastLane = arg.date.getTime() < Date.now();
                    return isPastLane ? ['bg-slate-100/70'] : [];
                  }}
                  slotMinTime="06:00:00"
                  slotMaxTime="22:00:00"
                  slotDuration="00:30:00"
                  allDaySlot={false}
                  events={calendarEvents}
                  select={handleCalendarSelect}
                  eventDrop={handleCalendarSlotDropOrResize}
                  eventResize={handleCalendarSlotDropOrResize}
                  eventClick={(info) => setSelectedSlotId(info.event.id)}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Hạn đổi lịch</p>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] text-slate-500">Ca sớm nhất</p>
                  <p className="text-xs font-semibold text-slate-800">
                    {earliestSlotStartDate ? formatDateTime(earliestSlotStartDate) : '--'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] text-slate-500">Ứng viên sẽ được đổi lịch đến</p>
                  <p className="text-xs font-semibold text-slate-800">
                    {form.expiresAt ? formatDateTime(form.expiresAt) : 'Tự động theo hệ thống'}
                  </p>
                </div>
              </div>
              <Input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                }
                className={deadlineValidationMessage ? 'border-rose-400 focus-visible:ring-rose-200' : ''}
                min={minDeadlineLocalValue}
                max={maxDeadlineLocalValue || undefined}
              />
              {deadlineValidationMessage ? (
                <p className="mt-1 text-xs text-rose-600">{deadlineValidationMessage}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  Để trống nếu muốn hệ thống tự đặt hạn trước ca sớm nhất 1 ngày.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {selectedSlot ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    Chỉnh sửa ca đã chọn
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-700"
                    onClick={() => removeSlot(selectedSlot.localId)}
                    disabled={form.slots.length === 1}
                  >
                    Xóa
                  </Button>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 space-y-1">
                  <p>
                    Bắt đầu:{' '}
                    <span className="font-medium text-slate-800">
                      {formatDateTime(selectedSlot.startAt)}
                    </span>
                  </p>
                  <p>
                    Kết thúc:{' '}
                    <span className="font-medium text-slate-800">
                      {formatDateTime(selectedSlot.endAt)}
                    </span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Số lượng phỏng vấn</p>
                  <Input
                    type="number"
                    min={1}
                    value={selectedSlot.capacity}
                    onChange={(e) =>
                      handleSlotChange(selectedSlot.localId, 'capacity', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Địa điểm</p>
                  <Input
                    placeholder="VD: Phòng HR tầng 2"
                    value={selectedSlot.location}
                    onChange={(e) =>
                      handleSlotChange(selectedSlot.localId, 'location', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Ghi chú ca (tuỳ chọn)</p>
                  <Input
                    placeholder="VD: Mang theo CCCD bản gốc"
                    value={selectedSlot.note}
                    onChange={(e) =>
                      handleSlotChange(selectedSlot.localId, 'note', e.target.value)
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-4 text-sm text-slate-500">
                Chọn một ca trên lịch để chỉnh sửa thông tin.
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <p className="mb-2 text-sm font-semibold text-slate-800">Danh sách ca</p>
              <div className="max-h-75 overflow-y-auto space-y-2 pr-1">
                {sortedSlots.map((slot, index) => {
                  const active = slot.localId === selectedSlotId;
                  return (
                    <button
                      key={slot.localId}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.localId)}
                      className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <p className="text-xs font-semibold">Ca #{index + 1}</p>
                      <p className="mt-1 text-xs">
                        {formatDateTime(slot.startAt)} - {formatDateTime(slot.endAt)}
                      </p>
                      <p className="mt-1 text-xs">Sức chứa: {slot.capacity}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (isSubmitting) return;
              setIsCreateOpen(false);
              resetForm();
            }}
          >
            Hủy
          </Button>
          <Button onClick={handleCreateCampaign} disabled={isSubmitting}>
            {isSubmitting ? 'Đang tạo...' : 'Tạo lịch phỏng vấn'}
          </Button>
        </div>
      </Modal>

    </DashboardLayout>
  );
};

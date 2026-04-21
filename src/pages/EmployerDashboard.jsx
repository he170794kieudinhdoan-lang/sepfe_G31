import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/shared/components/EmptyState';
import { AppLoadingScene } from '@/shared/components/AppLoadingScene';
import { Modal } from '@/shared/components/Modal';
import { DashboardLayout } from '@/shared/components/Layout/DashboardLayout';
import { useToast } from '@/shared/contexts/ToastContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { CompanyRegisterPage } from '@/pages/CompanyRegisterPage';
import {
  ChevronLeft,
  ChevronRight,
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
  Sparkles,
  Info,
  MoreHorizontal,
  Edit,
  Trash2,
  Send,
  Copy,
} from 'lucide-react';
import { useGetMyCompany } from '@/features/companies/api/useGetCompanies';
import {
  useJobsForEmployer,
  useEmployerApplications,
  useUpdateApplicationStatus,
  useDeleteJob,
  useCreateBoostCheckout,
  useMatchedWorkers,
  useJobDetail,
} from '@/features/jobs/api/useJobs';
import {
  useGetOrCreateConversation,
  useSendMessage,
} from '@/features/chat/api/useChat';
import * as chatApi from '@/features/chat/api/chatApi';
import {
  createCampaign,
  getCampaignDetail,
  getJobInviteConstraints,
  sendCampaign,
} from '@/features/interview-invitations/api/interviewInvitationApi';
import { SHIFTS, GENDERS } from '@/shared/constants/enums';
import { formatSalary } from '@/shared/utils/salaryUtils';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useEmployerOverview } from '@/features/statistics/api/useStatistics';
import { ApplicationFunnelWidget } from '@/features/statistics/components/ApplicationFunnelWidget';
import { EmployerPaymentsWidget } from '@/features/statistics/components/EmployerPaymentsWidget';
import { X } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import viLocale from '@fullcalendar/core/locales/vi';

const EMPLOYER_MENU = [
  {
    key: 'overview',
    label: 'Tổng quan',
    icon: LayoutDashboard,
    path: '/employer',
  },
  {
    key: 'jobs',
    label: 'Tin tuyển dụng',
    icon: Briefcase,
    path: '/employer/jobs',
  },
  {
    key: 'stats',
    label: 'Thống kê',
    icon: BarChart3,
    path: '/employer/stats',
  },
  {
    key: 'chat',
    label: 'Tin nhắn',
    icon: MessageCircle,
    path: '/chat',
    externalNav: true,
  },
  { key: 'home', label: 'Trang chủ', icon: Home, path: '/', externalNav: true },
];

const DASHBOARD_SUBTITLE =
  'Quản lý tin đăng, ứng viên và thông tin công ty của bạn';

const APPLICANTS_TAB_PAGE_SIZE = 10;

const BOOST_SUBSCRIPTION_PLANS = [
  {
    days: 7,
    name: 'Gói nổi bật 7 ngày',
    description: 'Phù hợp test nhanh nhu cầu tuyển gấp trong tuần.',
    price: 10000,
    accent: 'border-slate-200 bg-white',
  },
  {
    days: 30,
    name: 'Gói nổi bật 30 ngày',
    description: 'Được chọn nhiều nhất. Hiển thị dài hạn và tiết kiệm hơn.',
    price: 20000,
    badge: 'Mua nhiều - tiết kiệm hơn',
    accent: 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20',
  },
];

/** KPI dùng chung (Tổng quan + Thống kê): nền slate, icon vàng brand — đồng bộ, không dùng nhiều màu lạ */
const buildKpiItems = (overview) => [
  {
    label: 'Tổng lượt xem',
    value: overview?.totalViews?.value ?? 0,
    change: overview?.totalViews?.changePercent ?? 0,
    icon: Eye,
  },
  {
    label: 'Tổng lượt ứng tuyển',
    value: overview?.totalApplications?.value ?? 0,
    change: overview?.totalApplications?.changePercent ?? 0,
    icon: Users,
  },
  {
    label: 'Tỉ lệ chuyển đổi',
    value: overview?.conversionRate?.value ?? 0,
    change: overview?.conversionRate?.changePercent ?? 0,
    isPercentage: true,
    icon: BarChart3,
  },
  {
    label: 'Tin đang hoạt động',
    value: overview?.activeJobs?.value ?? 0,
    change: overview?.newJobsThisWeek ?? 0,
    isCountTrend: true,
    icon: Briefcase,
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
      label: 'Hiển thị',
      title: 'Tin tuyển dụng đang được công khai',
    },
    PENDING: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'Chờ duyệt',
      title: 'Tin tuyển dụng đang chờ quản trị viên phê duyệt',
    },
    EXPIRED: {
      color: 'bg-red-100 text-red-800 border-red-200',
      label: 'Hết hạn',
      title: 'Tin tuyển dụng đã vượt quá ngày hết hạn',
    },
    REJECTED: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      label: 'Bị từ chối',
      title: 'Tin bị hệ thống từ chối do phát hiện Spam hoặc vi phạm',
    },
    WARNING: {
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      label: 'Cảnh báo',
      title:
        'Tin tuyển dụng đáng ngờ (Scam), đang treo để quản trị viên kiểm tra thủ công',
    },
  };

  const config = statusConfig[status] || {
    color: 'bg-gray-100 text-gray-800',
    label: status,
    title: '',
  };

  return (
    <Badge
      variant="outline"
      className={`font-medium cursor-help ${config.color}`}
      title={config.title}
    >
      {config.label}
    </Badge>
  );
};

const ApplicantStatusBadge = ({ status }) => {
  const statusConfig = {
    APPLIED: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'Chờ xử lý',
    },
    VIEWED: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      label: 'Đã xem',
    },
    SUITABLE: {
      color: 'bg-green-100 text-green-800 border-green-200',
      label: 'Phù hợp',
    },
    UNSUITABLE: {
      color: 'bg-red-100 text-red-800 border-red-200',
      label: 'Không phù hợp',
    },
    CANCELLED: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      label: 'Đã hủy',
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

const MatchScoreItem = ({ label, score }) => {
  const percentage = Math.round(score * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-medium">
        <span className="text-slate-500">{label}</span>
        <span className={percentage > 70 ? 'text-green-600' : 'text-amber-600'}>
          {percentage}%
        </span>
      </div>
      <Progress value={percentage} className="h-1 shadow-none bg-slate-100" />
    </div>
  );
};

const WorkerCard = ({
  item,
  getShiftLabel,
  getGenderLabel,
  formatSalary,
  isSelected,
  onSelect,
  onContact,
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isContacting, setIsContacting] = useState(false);

  const handleContact = async () => {
    setIsContacting(true);
    await onContact(item.worker?.userId);
    setIsContacting(false);
  };

  return (
    <Card className="p-4 rounded-2xl border-slate-100 hover:border-primary/30 hover:shadow-md transition-all group relative">
      <div className="absolute top-4 left-4 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(item.worker?.userId)}
          className="w-5 h-5 rounded-md border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all shadow-sm"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-5 pl-8">
        <div className="relative shrink-0 self-center sm:self-start">
          <img
            src={item.worker?.avatar || `https://github.com/shadcn.png`}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm"
            alt="avatar"
          />
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div>
              <h4 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">
                {item.worker?.fullName}
              </h4>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-xs bg-slate-50 text-slate-600 border-slate-200"
                >
                  {item.worker?.occupationName || 'Lao động tự do'}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs bg-slate-50 text-slate-600 border-slate-200"
                >
                  {item.worker?.experienceYear === 0
                    ? 'Chưa có kinh nghiệm'
                    : item.worker?.experienceYear > 5
                      ? 'Trên 5 năm KN'
                      : `${item.worker?.experienceYear} năm KN`}
                </Badge>
                {item.worker?.province && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-600 border-blue-200"
                  >
                    <MapPin size={10} className="mr-1" />
                    {item.worker?.ward ? `${item.worker.ward}, ` : ''}
                    {item.worker?.province}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                <span>
                  Lương kỳ vọng:{' '}
                  <strong className="text-slate-700">
                    {formatSalary(
                      item.worker?.expectedSalary,
                      null,
                      'vndCompact',
                    )}
                  </strong>
                </span>
                <span>
                  Ca:{' '}
                  <strong className="text-slate-700">
                    {getShiftLabel(item.worker?.shift)}
                  </strong>
                </span>
                <span>
                  Giới tính:{' '}
                  <strong className="text-slate-700">
                    {getGenderLabel(item.worker?.gender)}
                  </strong>
                </span>
                {item.worker?.birthYear && (
                  <span>
                    Năm sinh:{' '}
                    <strong className="text-slate-700">
                      {item.worker.birthYear}
                    </strong>
                  </span>
                )}
              </div>
            </div>

            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <div
                  onMouseEnter={() => setPopoverOpen(true)}
                  onMouseLeave={() => setPopoverOpen(false)}
                  className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl border border-purple-100 flex items-center gap-1.5 text-sm font-bold shadow-sm shrink-0 cursor-help hover:bg-purple-100 transition-colors"
                >
                  <Sparkles size={14} />
                  Độ phù hợp {Math.round((item.scores?.finalScore || 0) * 100)}%
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-4 rounded-2xl shadow-2xl border-slate-100"
                align="end"
                onMouseEnter={() => setPopoverOpen(true)}
                onMouseLeave={() => setPopoverOpen(false)}
              >
                <h5 className="font-bold text-slate-800 mb-3 flex items-center gap-2 border-b pb-2">
                  <BarChart3 size={16} className="text-purple-500" />
                  Phân tích độ phù hợp
                </h5>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <MatchScoreItem
                    label="Kỹ năng"
                    score={item.scores?.skillScore || 0}
                  />
                  <MatchScoreItem
                    label="Phúc lợi"
                    score={item.scores?.benefitScore || 0}
                  />
                  <MatchScoreItem
                    label="Lương"
                    score={item.scores?.salaryScore || 0}
                  />
                  <MatchScoreItem
                    label="Vị trí"
                    score={item.scores?.locationScore || 0}
                  />
                  <MatchScoreItem
                    label="Ca làm"
                    score={item.scores?.shiftScore || 0}
                  />
                  <MatchScoreItem
                    label="Giới tính"
                    score={item.scores?.genderScore || 0}
                  />
                  <MatchScoreItem
                    label="Độ tuổi"
                    score={item.scores?.ageScore || 0}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="mt-3 space-y-2">
            {item.worker?.bio && (
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                  Giới thiệu
                </p>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {item.worker.bio}
                </p>
              </div>
            )}

            {item.worker?.desiredJobText && (
              <div className="bg-blue-50/30 p-2.5 rounded-lg border border-blue-100/50">
                <p className="text-[11px] font-bold text-blue-400 uppercase tracking-tight mb-1">
                  Mong muốn của ứng viên
                </p>
                <p className="text-xs text-blue-700/80 line-clamp-3 leading-relaxed">
                  {item.worker.desiredJobText}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end gap-3">
            <Button
              size="sm"
              variant="default"
              disabled={isContacting}
              className="rounded-xl px-5 py-2 h-auto text-sm font-bold shadow-sm hover:secondary transition-all flex items-center gap-2 group/btn"
              onClick={handleContact}
            >
              {isContacting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <MessageCircle
                  size={14}
                  className="group-hover/btn:scale-110 transition-transform"
                />
              )}
              Liên hệ ngay
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const MatchedWorkersModal = ({ jobId, onClose }) => {
  const { data: matchedWorkersRes, isLoading } = useMatchedWorkers(jobId);
  const workers = matchedWorkersRes || [];
  const { data: jobDetail } = useJobDetail(jobId);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: createConversation } = useGetOrCreateConversation();
  const { mutateAsync: sendMessage } = useSendMessage();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const getShiftLabel = (value) => {
    return SHIFTS.find((s) => s.value === value)?.label || value || 'Chưa rõ';
  };

  const getGenderLabel = (value) => {
    return GENDERS.find((g) => g.value === value)?.label || value || 'Chưa rõ';
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === workers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(workers.map((w) => w.worker?.userId)));
    }
  };

  const jobUrl = `${window.location.origin}/job/${jobId}`;
  const companyName = jobDetail?.company?.name || 'chúng tôi';

  // Split into Intro and Job Info to ensure link is always preserved
  const defaultIntro = jobDetail
    ? `Chào bạn, tôi là nhà tuyển dụng từ **${companyName}**. Tôi thấy hồ sơ của bạn rất phù hợp với vị trí này, mời bạn xem qua và ứng tuyển nhé!`
    : `Chào bạn, tôi thấy hồ sơ của bạn rất phù hợp với vị trí tuyển dụng của chúng tôi. Mời bạn xem qua và ứng tuyển nhé!`;

  const jobInfoSuffix = jobDetail
    ? `\n\n---\n💼 **Công việc:** [${jobDetail.title}](${jobUrl})\n📍 **Lĩnh vực:** ${jobDetail.occupation?.name || 'Chưa cập nhật'}`
    : `\n\n---\n🔗 **Link ứng tuyển:** [Nhấn vào đây để xem chi tiết](${jobUrl})`;

  const [customIntro, setCustomIntro] = useState('');
  const effectiveMessage = (customIntro || defaultIntro) + jobInfoSuffix;

  const handleBulkSend = async () => {
    setIsSending(true);
    let successCount = 0;

    try {
      for (const userId of selectedIds) {
        // Sequentially create conversation and send message
        const conv = await createConversation({ participantId: userId });
        if (conv?.id) {
          await sendMessage({ id: conv.id, content: effectiveMessage });
          successCount++;
        }
      }
      //toast(`Đã gửi lời mời tới ${successCount} ứng viên thành công!`, 'success');
      setIsBulkModalOpen(false);
      setSelectedIds(new Set());
    } catch (error) {
      //toast('Có lỗi xảy ra khi gửi lời mời. Vui lòng thử lại.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleSingleContact = async (userId) => {
    try {
      const conv = await createConversation({ participantId: userId });
      if (conv?.id) {
        await sendMessage({ id: conv.id, content: effectiveMessage });
        navigate(`/chat/${conv.id}`);
        onClose(); // Close modal on success
      }
    } catch (error) {
      // Bỏ qua lỗi vì `onError` trong hooks đã gọi toast để báo cáo lỗi
    }
  };

  return (
    <>
      <Modal
        open={!!jobId}
        onClose={onClose}
        title="Ứng viên được gợi ý phù hợp"
        variant="custom"
      >
        <div className="p-6 relative">
          {isLoading ? (
            <div className="py-4">
              <AppLoadingScene
                compact
                title="Đang tải ứng viên gợi ý"
                subtitle="AI matching đang chuẩn bị danh sách phù hợp"
              />
            </div>
          ) : workers.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="Không có công việc gợi ý nào"
                description="Thử cập nhật mô tả công việc để nhận thêm gợi ý công việc phù hợp hơn."
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All Bar */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 mb-2">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={
                      selectedIds.size === workers.length && workers.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                    className="w-5 h-5 rounded-md"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Chọn tất cả ({workers.length})
                  </span>
                </div>
                {selectedIds.size > 0 && (
                  <Button
                    size="sm"
                    className="rounded-xl px-4 py-1.5 h-auto bg-primary shadow-sm hover:secondary transition-all flex items-center gap-2"
                    onClick={() => setIsBulkModalOpen(true)}
                  >
                    <Send size={14} />
                    Gửi lời mời đồng loạt ({selectedIds.size})
                  </Button>
                )}
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {workers.map((item) => (
                  <WorkerCard
                    key={item.worker?.userId}
                    item={item}
                    getShiftLabel={getShiftLabel}
                    getGenderLabel={getGenderLabel}
                    formatSalary={formatSalary}
                    navigate={navigate}
                    isSelected={selectedIds.has(item.worker?.userId)}
                    onSelect={toggleSelect}
                    onContact={handleSingleContact}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Bulk Message Confirmation Modal */}
      <Modal
        open={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Xác nhận gửi lời mời"
        description={`Bạn đang chuẩn bị gửi lời mời tới ${selectedIds.size} ứng viên đã chọn.`}
        onConfirm={handleBulkSend}
        confirmLabel={isSending ? 'Đang gửi...' : 'Xác nhận gửi'}
        confirmDisabled={isSending}
      >
        <div className="space-y-4 py-2">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <MessageCircle size={14} className="text-primary" />
              Lời nhắn riêng của bạn
            </label>
            <Textarea
              className="min-h-[100px] rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 bg-white italic text-sm text-slate-600 resize-none transition-all shadow-sm"
              placeholder={defaultIntro}
              value={customIntro}
              onChange={(e) => setCustomIntro(e.target.value)}
            />
          </div>

          <p className="text-[11px] text-slate-400 italic px-1">
            * Ứng viên sẽ nhận được lời nhắn của bạn kèm theo một thẻ công việc
            có thể nhấn vào để xem chi tiết.
          </p>
        </div>
      </Modal>
    </>
  );
};

const JobApplicantsModal = ({
  jobId,
  onClose,
  onOpenDetail,
  onOpenCampaignDetail,
}) => {
  const { data: applicationsResult, isLoading } = useEmployerApplications(
    jobId || undefined,
  );
  const { data: jobDetail } = useJobDetail(jobId || undefined);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedApplicantIds, setSelectedApplicantIds] = useState(new Set());
  const [bulkInviteOpen, setBulkInviteOpen] = useState(false);
  const [bulkInviteSending, setBulkInviteSending] = useState(false);
  const [bulkInviteMessage, setBulkInviteMessage] = useState('');
  const [bulkInviteSlots, setBulkInviteSlots] = useState([]);
  const [selectedInviteSlotId, setSelectedInviteSlotId] = useState(null);
  const [inviteAllSuitable, setInviteAllSuitable] = useState(false);
  const [inviteConstraints, setInviteConstraints] = useState(null);
  const [latestCampaignSlots, setLatestCampaignSlots] = useState([]);
  const [loadingInviteConstraints, setLoadingInviteConstraints] =
    useState(false);
  const limit = 5;

  const applicantsList = applicationsResult?.data || [];

  const filteredApplicants = applicantsList.filter((a) => {
    if (a.status === 'CANCELLED') return false;
    if (statusFilter && a.status !== statusFilter) return false;
    if (
      searchText &&
      !(a.user?.fullName || '').toLowerCase().includes(searchText.toLowerCase())
    )
      return false;
    return true;
  });

  const totalPages = Math.ceil(filteredApplicants.length / limit) || 1;
  const paginatedApplicants = filteredApplicants.slice(
    (page - 1) * limit,
    page * limit,
  );

  const { toast } = useToast();

  const isApplicantInvitable = (applicant) => applicant?.status === 'SUITABLE';

  const getApplicantUserId = (applicant) => {
    const rawId =
      applicant?.user?.userId ?? applicant?.user?.id ?? applicant?.user?._id;
    if (rawId === null || rawId === undefined) return null;
    return String(rawId);
  };

  const invitedWorkerIdSet = useMemo(
    () =>
      new Set(
        (inviteConstraints?.invitedWorkerIds || []).map((id) => String(id)),
      ),
    [inviteConstraints],
  );

  const isApplicantAlreadyInvited = (applicant) => {
    const userId = getApplicantUserId(applicant);
    if (!userId) return false;
    return invitedWorkerIdSet.has(String(userId));
  };

  const isApplicantSelectable = (applicant) =>
    isApplicantInvitable(applicant) && !isApplicantAlreadyInvited(applicant);

  const availableApplicantUserIds = filteredApplicants
    .filter(isApplicantSelectable)
    .map(getApplicantUserId)
    .filter(Boolean);

  const alreadyInvitedCount = filteredApplicants.filter(
    isApplicantAlreadyInvited,
  ).length;

  const selectedCount = selectedApplicantIds.size;
  const canSelectAll = availableApplicantUserIds.length > 0;
  const isAllSelected =
    canSelectAll &&
    availableApplicantUserIds.every((id) => selectedApplicantIds.has(id));

  const getSlotById = (slotId) =>
    bulkInviteSlots.find((slot) => slot.id === slotId);
  const isLockedSlot = (slotId) => {
    const slot = getSlotById(slotId);
    return Boolean(slot?.isLocked);
  };

  const hasBulkSlotOverlap = (slots, candidate, ignoreSlotId = null) => {
    const candidateStart = new Date(candidate.startAt).getTime();
    const candidateEnd = new Date(candidate.endAt).getTime();

    return slots.some((slot) => {
      if (slot.id === ignoreSlotId) {
        return false;
      }

      const slotStart = new Date(slot.startAt).getTime();
      const slotEnd = new Date(slot.endAt).getTime();
      return candidateStart < slotEnd && slotStart < candidateEnd;
    });
  };

  const isSlotStartInPast = (startAt) => {
    const startAtMs = new Date(startAt).getTime();
    if (Number.isNaN(startAtMs)) {
      return true;
    }
    return startAtMs < Date.now();
  };

  const bulkInviteCalendarEvents = useMemo(
    () =>
      bulkInviteSlots.map((slot) => ({
        id: slot.id,
        title: slot.isLocked
          ? `Ca (${slot.capacity}) • Đã có người chọn`
          : `Ca (${slot.capacity})`,
        start: slot.startAt,
        end: slot.endAt,
        backgroundColor: slot.isLocked ? '#e2e8f0' : undefined,
        borderColor: slot.isLocked ? '#94a3b8' : undefined,
      })),
    [bulkInviteSlots],
  );

  useEffect(() => {
    setSelectedApplicantIds((previous) => {
      if (!previous.size) return previous;

      const next = new Set(
        Array.from(previous).filter((id) =>
          availableApplicantUserIds.includes(id),
        ),
      );

      return next.size === previous.size ? previous : next;
    });
  }, [jobId, availableApplicantUserIds]);

  useEffect(() => {
    let cancelled = false;

    if (!jobId) {
      setInviteConstraints(null);
      setLatestCampaignSlots([]);
      return () => {
        cancelled = true;
      };
    }

    const fetchConstraints = async () => {
      setLoadingInviteConstraints(true);
      try {
        const result = await getJobInviteConstraints(jobId);
        let fetchedLatestSlots = [];

        if (result?.latestCampaignId) {
          try {
            const latestCampaign = await getCampaignDetail(
              result.latestCampaignId,
            );
            fetchedLatestSlots = latestCampaign?.slots || [];
          } catch {
            fetchedLatestSlots = [];
          }
        }

        if (!cancelled) {
          setInviteConstraints(result || null);
          setLatestCampaignSlots(fetchedLatestSlots);
        }
      } catch (error) {
        if (!cancelled) {
          setInviteConstraints(null);
          setLatestCampaignSlots([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingInviteConstraints(false);
        }
      }
    };

    fetchConstraints();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  useEffect(() => {
    setBulkInviteSlots([]);
    setSelectedInviteSlotId(null);
    setInviteAllSuitable(false);
  }, [jobId]);

  useEffect(() => {
    if (!jobDetail?.title) return;
    setBulkInviteMessage((prev) => {
      if (prev.trim()) return prev;
      return `Chào bạn, bạn đã phù hợp với vị trí ${jobDetail.title}. Vui lòng chọn 1 ca phỏng vấn phù hợp trong các ca bên dưới để xác nhận lịch.`;
    });
  }, [jobDetail?.title]);

  useEffect(() => {
    if (!bulkInviteOpen) return;
    if (bulkInviteSlots.length > 0) return;

    const fixedSlots = latestCampaignSlots.map((slot, index) => ({
      id: `fixed-slot-${slot.id}-${index}`,
      sourceSlotId: Number(slot.id),
      startAt: new Date(slot.startAt).toISOString(),
      endAt: new Date(slot.endAt).toISOString(),
      capacity: Math.max(1, Number(slot.capacity) || 1),
      bookedCount: Math.max(0, Number(slot.bookedCount) || 0),
      isLocked: Math.max(0, Number(slot.bookedCount) || 0) > 0,
      location: slot.location || '',
      note: slot.note || '',
    }));

    if (fixedSlots.length > 0) {
      setBulkInviteSlots(fixedSlots);
      setSelectedInviteSlotId(fixedSlots[0].id);
      return;
    }

    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(9, 0, 0, 0);

    const end = new Date(start);
    end.setHours(end.getHours() + 2);

    const defaultSlotId = `slot-${Date.now()}`;

    setBulkInviteSlots([
      {
        id: defaultSlotId,
        sourceSlotId: null,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        capacity: Math.max(1, selectedCount || 1),
        bookedCount: 0,
        isLocked: false,
        location: '',
        note: '',
      },
    ]);
    setSelectedInviteSlotId(defaultSlotId);
  }, [bulkInviteOpen, bulkInviteSlots.length, latestCampaignSlots]);

  useEffect(() => {
    if (!bulkInviteOpen) return;
    setBulkInviteSlots((previous) =>
      previous.map((slot) => ({
        ...slot,
        capacity: Math.max(1, slot.capacity || selectedCount || 1),
      })),
    );
  }, [selectedCount, bulkInviteOpen]);

  const updateInterviewSlot = (slotId, field, value) => {
    if (isLockedSlot(slotId)) {
      toast('Ca này đã có ứng viên chọn, không thể chỉnh sửa.', 'warning');
      return;
    }

    setBulkInviteSlots((previous) =>
      previous.map((slot) => {
        if (slot.id !== slotId) return slot;
        return {
          ...slot,
          [field]: field === 'capacity' ? Number(value) : value,
        };
      }),
    );
  };

  const handleBulkInviteCalendarSelect = (selectionInfo) => {
    const startAt = selectionInfo.start?.toISOString();
    const endAt = selectionInfo.end?.toISOString();

    if (!startAt || !endAt) {
      return;
    }

    if (isSlotStartInPast(startAt)) {
      toast('Không thể tạo ca phỏng vấn ở thời điểm quá khứ.', 'error');
      return;
    }

    const id = `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newSlot = {
      id,
      sourceSlotId: null,
      startAt,
      endAt,
      capacity: Math.max(1, selectedCount || 1),
      bookedCount: 0,
      isLocked: false,
      location: '',
      note: '',
    };

    if (hasBulkSlotOverlap(bulkInviteSlots, newSlot)) {
      toast('Ca mới bị trùng với lịch đã có.', 'error');
      return;
    }

    setBulkInviteSlots((previous) => [...previous, newSlot]);
    setSelectedInviteSlotId(id);
  };

  const handleBulkInviteSlotDropOrResize = (changeInfo) => {
    const { event } = changeInfo;

    if (isLockedSlot(event.id)) {
      changeInfo.revert();
      toast('Ca này đã có ứng viên chọn, không thể đổi giờ.', 'warning');
      return;
    }

    if (!event.start || !event.end) {
      return;
    }

    const updatedSlot = {
      id: event.id,
      startAt: event.start.toISOString(),
      endAt: event.end.toISOString(),
    };

    const startAtMs = new Date(updatedSlot.startAt).getTime();
    const endAtMs = new Date(updatedSlot.endAt).getTime();

    if (
      Number.isNaN(startAtMs) ||
      Number.isNaN(endAtMs) ||
      endAtMs <= startAtMs
    ) {
      changeInfo.revert();
      toast('Không thể cập nhật ca: thời gian không hợp lệ.', 'error');
      return;
    }

    if (startAtMs < Date.now()) {
      changeInfo.revert();
      toast('Không thể cập nhật ca về thời điểm quá khứ.', 'error');
      return;
    }

    if (hasBulkSlotOverlap(bulkInviteSlots, updatedSlot, event.id)) {
      changeInfo.revert();
      toast('Không thể cập nhật ca: bị trùng với ca khác.', 'error');
      return;
    }

    setBulkInviteSlots((previous) =>
      previous.map((slot) =>
        slot.id === event.id
          ? { ...slot, startAt: updatedSlot.startAt, endAt: updatedSlot.endAt }
          : slot,
      ),
    );
    setSelectedInviteSlotId(event.id);
  };

  const removeInterviewSlot = (slotIdToRemove) => {
    if (isLockedSlot(slotIdToRemove)) {
      toast('Ca này đã có ứng viên chọn, không thể xóa.', 'warning');
      return;
    }

    setBulkInviteSlots((previous) => {
      const next = previous.filter((slot) => slot.id !== slotIdToRemove);
      if (selectedInviteSlotId === slotIdToRemove) {
        setSelectedInviteSlotId(next[0]?.id || null);
      }
      return next;
    });
  };

  const toggleApplicantSelection = (applicantUserId) => {
    if (!applicantUserId) return;

    setSelectedApplicantIds((previous) => {
      const next = new Set(previous);
      if (next.has(applicantUserId)) {
        next.delete(applicantUserId);
      } else {
        next.add(applicantUserId);
      }
      return next;
    });
  };

  const toggleAllApplicants = () => {
    if (!canSelectAll) return;

    setSelectedApplicantIds((previous) => {
      if (isAllSelected) {
        const next = new Set(previous);
        availableApplicantUserIds.forEach((id) => next.delete(id));
        return next;
      }

      const next = new Set(previous);
      availableApplicantUserIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleSendBulkInterviewInvite = async () => {
    const sourceApplicantIds = inviteAllSuitable
      ? availableApplicantUserIds
      : Array.from(selectedApplicantIds);

    if (!sourceApplicantIds.length) {
      toast(
        inviteAllSuitable
          ? 'Không có ứng viên Phù hợp để mời phỏng vấn.'
          : 'Vui lòng chọn ít nhất 1 ứng viên hoặc bật mời tất cả.',
        'error',
      );
      return;
    }

    // Validate that selected applicants are not already invited
    const alreadySelectedInvitedIds = Array.from(selectedApplicantIds).filter(
      (id) => invitedWorkerIdSet.has(String(id)),
    );

    if (alreadySelectedInvitedIds.length > 0 && !inviteAllSuitable) {
      toast(
        `${alreadySelectedInvitedIds.length} ứng viên đã được mời phỏng vấn cho vị trí này rồi. Vui lòng bỏ chọn họ.`,
        'warning',
      );
      // Remove already-invited applicants from selection
      setSelectedApplicantIds((prev) => {
        const next = new Set(prev);
        alreadySelectedInvitedIds.forEach((id) => next.delete(id));
        return next;
      });
      return;
    }

    const trimmedMessage = bulkInviteMessage.trim();
    if (!trimmedMessage) {
      toast('Vui lòng nhập nội dung lời mời phỏng vấn.', 'error');
      return;
    }

    setBulkInviteSending(true);
    let successCount = 0;
    let failCount = 0;

    try {
      const invitableApplicantIds = new Set(availableApplicantUserIds);
      const selectedInvitableIds = Array.from(selectedApplicantIds).filter(
        (id) => invitableApplicantIds.has(id),
      );

      if (!selectedInvitableIds.length) {
        toast('Vui lòng chọn ứng viên Phù hợp để mời phỏng vấn.', 'error');
        return;
      }

      if (!bulkInviteSlots.length) {
        toast('Vui lòng tạo ít nhất 1 ca phỏng vấn.', 'error');
        return;
      }

      const normalizedSlots = [];
      for (const slot of bulkInviteSlots) {
        if (!slot.startAt || !slot.endAt) {
          toast(
            'Vui lòng nhập đầy đủ ngày giờ cho tất cả ca phỏng vấn.',
            'error',
          );
          return;
        }

        const startAt = new Date(slot.startAt);
        const endAt = new Date(slot.endAt);
        const conversation =
          await chatApi.getOrCreateConversation(participantId);
        if (!conversation?.id) {
          failCount += 1;
          continue;
        }

        if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
          toast('Ngày giờ ca phỏng vấn không hợp lệ.', 'error');
          return;
        }

        if (endAt <= startAt) {
          toast(
            'Giờ kết thúc phải sau giờ bắt đầu ở mỗi ca phỏng vấn.',
            'error',
          );
          return;
        }

        if (startAt.getTime() < Date.now()) {
          toast('Không được chọn ca phỏng vấn ở ngày/giờ đã qua.', 'error');
          return;
        }

        if (!slot.capacity || Number(slot.capacity) < 1) {
          toast('Số lượng phỏng vấn mỗi ca phải lớn hơn 0.', 'error');
          return;
        }

        normalizedSlots.push({
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          capacity: Number(slot.capacity),
          location: slot.location?.trim() || undefined,
          note: slot.note?.trim() || undefined,
        });
      }

      const sortedSlots = [...normalizedSlots].sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );

      for (let i = 1; i < sortedSlots.length; i += 1) {
        const prevEnd = new Date(sortedSlots[i - 1].endAt).getTime();
        const currentStart = new Date(sortedSlots[i].startAt).getTime();
        if (currentStart < prevEnd) {
          toast('Các ca phỏng vấn đang bị trùng thời gian.', 'error');
          return;
        }
      }

      const lockedSlotViolations = bulkInviteSlots
        .filter((slot) => slot.isLocked && slot.sourceSlotId)
        .map((slot) => {
          const source = latestCampaignSlots.find(
            (item) => Number(item.id) === Number(slot.sourceSlotId),
          );
          if (!source) {
            return null;
          }

          const sourceStart = new Date(source.startAt).toISOString();
          const sourceEnd = new Date(source.endAt).toISOString();
          const sourceCapacity = Math.max(1, Number(source.capacity) || 1);
          const sourceLocation = (source.location || '').trim();
          const sourceNote = (source.note || '').trim();

          const currentStart = new Date(slot.startAt).toISOString();
          const currentEnd = new Date(slot.endAt).toISOString();
          const currentCapacity = Math.max(1, Number(slot.capacity) || 1);
          const currentLocation = (slot.location || '').trim();
          const currentNote = (slot.note || '').trim();

          const changed =
            sourceStart !== currentStart ||
            sourceEnd !== currentEnd ||
            sourceCapacity !== currentCapacity ||
            sourceLocation !== currentLocation ||
            sourceNote !== currentNote;

          if (!changed) {
            return null;
          }

          return slot;
        })
        .filter(Boolean);

      if (lockedSlotViolations.length > 0) {
        toast(
          'Có ca đã có ứng viên chọn bị thay đổi. Vui lòng giữ nguyên các ca đã có người.',
          'error',
        );
        return;
      }

      const workerIds = selectedInvitableIds
        .map((id) => Number(id))
        .filter(
          (id) => !Number.isNaN(id) && !invitedWorkerIdSet.has(String(id)),
        );

      // Check if any selected workers were filtered out due to already being invited
      const filteredOutCount = selectedInvitableIds.length - workerIds.length;
      if (filteredOutCount > 0) {
        toast(
          `${filteredOutCount} ứng viên đã được mời rồi, sẽ không được gửi lại.`,
          'info',
        );
      }

      if (!workerIds.length) {
        toast(
          filteredOutCount > 0
            ? 'Tất cả ứng viên được chọn đã được mời phỏng vấn rồi.'
            : 'Không tìm thấy worker hợp lệ để gửi lời mời.',
          'error',
        );
        return;
      }

      const campaign = await createCampaign({
        title: `Mời phỏng vấn - ${jobDetail?.title || 'Vị trí tuyển dụng'}`,
        description: `Chiến dịch mời phỏng vấn cho công việc #${jobId}`,
        message: trimmedMessage,
        jobId: Number(jobId),
        workerIds,
        slots: normalizedSlots,
      });

      if (!campaign?.id) {
        throw new Error(
          'Không nhận được mã chiến dịch sau khi tạo lịch phỏng vấn.',
        );
      }

      await sendCampaign(campaign.id);

      successCount = workerIds.length;

      setLatestCampaignSlots(
        campaign?.slots?.length ? campaign.slots : normalizedSlots,
      );
      setInviteConstraints((previous) => ({
        ...(previous || {}),
        latestCampaignId: campaign.id,
        hasExistingSchedule: true,
        invitedWorkerIds: Array.from(
          new Set([...(previous?.invitedWorkerIds || []), ...workerIds]),
        ),
      }));

      if (successCount > 0) {
        toast(
          failCount > 0
            ? `Đã gửi lời mời cho ${successCount} ứng viên, ${failCount} ứng viên gửi thất bại.`
            : `Đã gửi lời mời phỏng vấn cho ${successCount} ứng viên.`,
          failCount > 0 ? 'error' : 'success',
        );

        onOpenCampaignDetail?.(campaign.id);
        setBulkInviteOpen(false);
        setSelectedApplicantIds(new Set());
        setBulkInviteSlots([]);
        setSelectedInviteSlotId(null);
        setInviteAllSuitable(false);
      } else {
        toast('Không gửi được lời mời nào. Vui lòng thử lại.', 'error');
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Tạo lịch và gửi lời mời thất bại.';
      toast(Array.isArray(message) ? message.join(', ') : message, 'error');
    } finally {
      setBulkInviteSending(false);
    }
  };

  const selectedInviteSlot = bulkInviteSlots.find(
    (slot) => slot.id === selectedInviteSlotId,
  );
  const isSelectedInviteSlotLocked = Boolean(selectedInviteSlot?.isLocked);
  const sortedInviteSlots = useMemo(
    () =>
      [...bulkInviteSlots].sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      ),
    [bulkInviteSlots],
  );

  const formatSlotDateTime = (value) => {
    if (!value) return 'Chưa có thời gian';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Thời gian không hợp lệ';

    return date.toLocaleString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExport = () => {
    if (!filteredApplicants || filteredApplicants.length === 0) {
      toast('Không có dữ liệu ứng viên để xuất', 'error');
      return;
    }

    const headers = [
      'Tên ứng viên',
      'Vị trí ứng tuyển',
      'Trạng thái',
      'Email',
      'Số điện thoại',
      'Giới tính',
      'Năm sinh',
      'Khu vực',
      'Công việc đã làm',
      'Năm kinh nghiệm',
      'Lương mong muốn',
      'Ca làm',
      'Giới thiệu bản thân (Bio)',
    ];

    const statusMap = {
      APPLIED: 'Chờ xử lý',
      VIEWED: 'Đã xem',
      SUITABLE: 'Phù hợp',
      UNSUITABLE: 'Không phù hợp',
    };

    const shiftMap = {
      MORNING: 'Ca sáng',
      AFTERNOON: 'Ca chiều',
      EVENING: 'Ca tối',
      FULL_DAY: 'Cả ngày',
      FLEXIBLE: 'Linh hoạt',
    };

    const csvRows = [];
    csvRows.push(headers.join(','));

    filteredApplicants.forEach((app) => {
      const escapeCsv = (str) => {
        if (!str && str !== 0) return '""';
        return `"${String(str).replace(/"/g, '""')}"`;
      };

      const wp = app.user?.workerProfile || {};

      const genderText =
        wp.gender === 'MALE'
          ? 'Nam'
          : wp.gender === 'FEMALE'
            ? 'Nữ'
            : 'Chưa cập nhật';
      const expectedSalaryText = wp.expectedSalary
        ? `${(wp.expectedSalary / 1000000).toFixed(0)}Tr`
        : 'Thỏa thuận';
      const shiftText = shiftMap[wp.shift] || wp.shift || 'Chưa cập nhật';

      const row = [
        escapeCsv(app.user?.fullName),
        escapeCsv(app.job?.title),
        escapeCsv(statusMap[app.status] || app.status),
        escapeCsv(app.user?.email),
        escapeCsv(app.user?.phone || 'Chưa cập nhật'),
        escapeCsv(genderText),
        escapeCsv(wp.birthYear || 'Chưa cập nhật'),
        escapeCsv(wp.province || 'Chưa cập nhật'),
        escapeCsv(wp.occupation?.name || 'Chưa cập nhật'),
        escapeCsv(wp.experienceYear ? `${wp.experienceYear} năm` : 'Chưa có'),
        escapeCsv(expectedSalaryText),
        escapeCsv(shiftText),
        escapeCsv(wp.bio || 'Chưa cập nhật'),
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Danh_sach_ung_vien.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast('Đã tải xuống file Danh_sach_ung_vien.csv', 'success');
  };

  return (
    <Modal
      open={!!jobId}
      onClose={onClose}
      title="Danh sách ứng viên của công việc"
      variant="custom"
    >
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm theo tên..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(1);
              }}
              className="pl-9 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>
          <select
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm bg-slate-50 outline-none"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="APPLIED">Chờ xử lý</option>
            <option value="SUITABLE">Phù hợp</option>
            <option value="UNSUITABLE">Không phù hợp</option>
          </select>
          <Button
            variant="outline"
            className="rounded-xl gap-2 bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
            onClick={handleExport}
            disabled={filteredApplicants.length === 0}
          >
            <Download size={16} /> Xuất file CSV
          </Button>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium">
            Tổng ứng viên của job: {applicantsList.length}
          </span>
          {statusFilter || searchText ? (
            <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 font-medium text-primary">
              Kết quả theo bộ lọc: {filteredApplicants.length}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={toggleAllApplicants}
              className="w-5 h-5 rounded-md"
            />
            <span className="text-sm font-medium text-slate-700">
              Chọn tất cả ứng viên Phù hợp ({availableApplicantUserIds.length})
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl gap-2"
              onClick={() => {
                const campaignId = inviteConstraints?.latestCampaignId;
                if (campaignId) {
                  onOpenCampaignDetail?.(campaignId);
                }
              }}
              disabled={!inviteConstraints?.latestCampaignId}
            >
              <Users size={14} /> Xem DS theo ca
            </Button>
            <Button
              size="sm"
              className="rounded-xl gap-2"
              onClick={() => setBulkInviteOpen(true)}
              disabled={
                availableApplicantUserIds.length === 0 ||
                loadingInviteConstraints
              }
            >
              <Send size={14} /> Mời phỏng vấn
            </Button>
          </div>
        </div>
        <p className="mb-3 text-xs text-slate-500 italic">
          Chỉ ứng viên có trạng thái Phù hợp và chưa được mời cho job này mới có
          thể được chọn.
        </p>

        {isLoading ? (
          <div className="py-4">
            <AppLoadingScene
              compact
              title="Đang tải danh sách ứng viên"
              subtitle="Vui lòng chờ một chút..."
            />
          </div>
        ) : paginatedApplicants.length === 0 ? (
          <EmptyState
            title="Không tìm thấy ứng viên nào"
            description="Bạn vui lòng thử đổi bộ lọc khác."
          />
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {paginatedApplicants.map((a) => (
              <Card
                key={a.id}
                className="p-4 rounded-2xl shadow-sm border border-slate-100 transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="pt-1">
                    <Checkbox
                      checked={selectedApplicantIds.has(getApplicantUserId(a))}
                      onCheckedChange={() =>
                        toggleApplicantSelection(getApplicantUserId(a))
                      }
                      disabled={!isApplicantSelectable(a)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 rounded-md"
                    />
                  </div>
                  <div className="flex-1 flex justify-between items-start gap-4">
                    <button
                      type="button"
                      onClick={() => onOpenDetail(a)}
                      className="flex items-center gap-4 text-left min-w-0 group"
                    >
                      <img
                        src={
                          a.user?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(a.user?.fullName || 'User')}&background=e0e7ff&color=4338ca`
                        }
                        alt="avatar"
                        className="w-12 h-12 rounded-full shadow-sm object-cover border border-slate-100 transition-transform group-hover:scale-[1.03]"
                      />
                      <div className="overflow-hidden">
                        <h4 className="font-semibold text-slate-800 truncate group-hover:text-primary transition-colors">
                          {a.user?.fullName}
                        </h4>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <Briefcase size={12} /> {a.job?.title}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-slate-400 group-hover:text-primary transition-colors">
                          Bấm vào worker để xem hồ sơ
                        </p>
                      </div>
                    </button>
                    <div className="text-right shrink-0">
                      <ApplicantStatusBadge status={a.status} />
                      {isApplicantAlreadyInvited(a) && (
                        <p className="mt-1 text-[11px] font-medium text-amber-700">
                          Đã mời trước đó
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-2 flex items-center justify-end gap-1">
                        <Clock size={12} />{' '}
                        {new Date(
                          a.updatedAt || a.createdAt || new Date(),
                        ).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-slate-500">
              Trang {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={bulkInviteOpen}
        title="Tạo lịch phỏng vấn và gửi lời mời"
        description={`Bạn đã chọn ${selectedApplicantIds.size} ứng viên. Có thể bật mời tất cả ứng viên phù hợp để gửi nhanh theo lịch gần nhất.`}
        contentClassName="max-w-6xl min-h-[82vh]"
        bodyClassName="space-y-5"
        onClose={() => {
          if (!bulkInviteSending) {
            setBulkInviteOpen(false);
            setBulkInviteSlots([]);
            setSelectedInviteSlotId(null);
            setInviteAllSuitable(false);
          }
        }}
        onConfirm={handleSendBulkInterviewInvite}
        confirmLabel={
          bulkInviteSending ? 'Đang gửi...' : 'Tạo lịch và gửi lời mời'
        }
        cancelLabel="Hủy"
        confirmDisabled={bulkInviteSending || !bulkInviteMessage.trim()}
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-slate-100 p-4 sm:p-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nội dung tin nhắn
                </p>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                  {bulkInviteMessage.trim().length} ký tự
                </span>
              </div>
              <Textarea
                value={bulkInviteMessage}
                onChange={(e) => setBulkInviteMessage(e.target.value)}
                rows={4}
                placeholder="Nhập nội dung mời phỏng vấn"
                className="mt-2 rounded-xl border-slate-200 bg-white"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Lịch phỏng vấn
                  </p>
                  <p className="text-xs text-slate-500">
                    Kéo chọn để tạo ca, kéo thả để đổi giờ, click ca để chỉnh
                    chi tiết.
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {bulkInviteSlots.length} ca
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 [&_.fc-toolbar-title]:text-base [&_.fc-toolbar-title]:font-semibold [&_.fc-col-header-cell-cushion]:py-2 [&_.fc-timegrid-slot-label-cushion]:text-xs [&_.fc-button]:bg-slate-900! [&_.fc-button]:border-slate-900! [&_.fc-button]:text-white! [&_.fc-button:hover]:bg-slate-700! [&_.fc-button-active]:bg-primary! [&_.fc-event]:border-0! [&_.fc-event]:rounded-lg! [&_.fc-event]:bg-primary! [&_.fc-event-title]:font-medium!">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  locale={viLocale}
                  initialView="timeGridWeek"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'timeGridDay,timeGridWeek',
                  }}
                  buttonText={{
                    today: 'Hôm nay',
                    day: 'Ngày',
                    week: 'Tuần',
                  }}
                  height={560}
                  nowIndicator
                  selectable
                  editable
                  selectMirror
                  dayMaxEvents
                  eventOverlap={false}
                  selectOverlap={false}
                  validRange={{
                    start: new Date(),
                  }}
                  slotMinTime="06:00:00"
                  slotMaxTime="22:00:00"
                  slotDuration="00:30:00"
                  allDaySlot={false}
                  events={bulkInviteCalendarEvents}
                  select={handleBulkInviteCalendarSelect}
                  eventDrop={handleBulkInviteSlotDropOrResize}
                  eventResize={handleBulkInviteSlotDropOrResize}
                  eventClick={(info) => setSelectedInviteSlotId(info.event.id)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tổng quan
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[11px] text-slate-500">Ứng viên</p>
                  <p className="text-base font-semibold text-slate-800">
                    {inviteAllSuitable
                      ? availableApplicantUserIds.length
                      : selectedApplicantIds.size}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[11px] text-slate-500">Số ca</p>
                  <p className="text-base font-semibold text-slate-800">
                    {bulkInviteSlots.length}
                  </p>
                </div>
              </div>
            </div>

            {selectedInviteSlot ? (
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
                    onClick={() => removeInterviewSlot(selectedInviteSlot.id)}
                    disabled={
                      bulkInviteSlots.length === 1 || isSelectedInviteSlotLocked
                    }
                  >
                    Xóa
                  </Button>
                </div>

                {isSelectedInviteSlotLocked ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Ca này đã có ứng viên chọn, bạn không thể chỉnh sửa hoặc
                    xóa.
                  </div>
                ) : null}

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 space-y-1">
                  <p>
                    Bắt đầu:{' '}
                    <span className="font-medium text-slate-800">
                      {formatSlotDateTime(selectedInviteSlot.startAt)}
                    </span>
                  </p>
                  <p>
                    Kết thúc:{' '}
                    <span className="font-medium text-slate-800">
                      {formatSlotDateTime(selectedInviteSlot.endAt)}
                    </span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Số lượng phỏng vấn</p>
                  <Input
                    type="number"
                    min={1}
                    value={selectedInviteSlot.capacity}
                    disabled={isSelectedInviteSlotLocked}
                    onChange={(e) =>
                      updateInterviewSlot(
                        selectedInviteSlot.id,
                        'capacity',
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Địa điểm</p>
                  <Input
                    placeholder="VD: Phòng HR tầng 2"
                    value={selectedInviteSlot.location}
                    disabled={isSelectedInviteSlotLocked}
                    onChange={(e) =>
                      updateInterviewSlot(
                        selectedInviteSlot.id,
                        'location',
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500">
                    Ghi chú ca (tuỳ chọn)
                  </p>
                  <Input
                    placeholder="VD: Mang theo CCCD bản gốc"
                    value={selectedInviteSlot.note}
                    disabled={isSelectedInviteSlotLocked}
                    onChange={(e) =>
                      updateInterviewSlot(
                        selectedInviteSlot.id,
                        'note',
                        e.target.value,
                      )
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
              <p className="mb-2 text-sm font-semibold text-slate-800">
                Danh sách ca
              </p>
              <div className="max-h-75 overflow-y-auto space-y-2 pr-1">
                {sortedInviteSlots.map((slot, index) => {
                  const active = slot.id === selectedInviteSlotId;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedInviteSlotId(slot.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <p className="text-xs font-semibold">Ca #{index + 1}</p>
                      <p className="mt-1 text-xs">
                        {formatSlotDateTime(slot.startAt)} -{' '}
                        {formatSlotDateTime(slot.endAt)}
                      </p>
                      <p className="mt-1 text-xs">Sức chứa: {slot.capacity}</p>
                      {slot.isLocked ? (
                        <p className="mt-1 text-[11px] font-semibold text-amber-700">
                          Đã có ứng viên chọn - khóa chỉnh sửa
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Modal>
  );
};

export const EmployerDashboard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [active, setActive] = useState('overview');
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [boostPaymentModalOpen, setBoostPaymentModalOpen] = useState(false);
  const [selectedBoostJob, setSelectedBoostJob] = useState(null);
  const [selectedBoostPackageDays, setSelectedBoostPackageDays] = useState(7);
  const [boostCheckoutData, setBoostCheckoutData] = useState(null);
  const [matchedJobId, setMatchedJobId] = useState(null);
  const [applicantsModalJobId, setApplicantsModalJobId] = useState(null);
  const [jobOptionsPopoverOpenId, setJobOptionsPopoverOpenId] = useState(null);
  const [campaignDetailOpen, setCampaignDetailOpen] = useState(false);
  const [campaignDetailLoading, setCampaignDetailLoading] = useState(false);
  const [campaignDetailData, setCampaignDetailData] = useState(null);
  const [campaignDetailError, setCampaignDetailError] = useState('');
  const [selectedCampaignSlotId, setSelectedCampaignSlotId] = useState(null);
  const [slotApplicantsModalOpen, setSlotApplicantsModalOpen] = useState(false);
  const [slotApplicantsTab, setSlotApplicantsTab] = useState('ACCEPTED');

  // Applicant details
  const [applicantDetail, setApplicantDetail] = useState(null);
  const [applicantStatus, setApplicantStatus] = useState('');

  // Filtering states
  const [jobSearchText, setJobSearchText] = useState('');
  const [selectedJobIdFilter, setSelectedJobIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [applicantsTabPage, setApplicantsTabPage] = useState(1);

  // Real API integration
  const [jobPage, setJobPage] = useState(1);
  const { data: company, isLoading: loadingCompany } = useGetMyCompany();
  const { data: overview, isLoading: loadingOverview } = useEmployerOverview();
  const { data: searchResult, isLoading: loadingJobs } = useJobsForEmployer({
    allStatus: true,
    page: jobPage,
    limit: 10,
  });

  // Query tất cả công việc (không phân trang) để hiển thị đầy đủ trong các Select box Dropdown
  const { data: allJobsResult } = useJobsForEmployer({
    allStatus: true,
    fetchAll: true,
  });

  // Real applicants data
  const { data: applicationsResult, isLoading: loadingApplications } =
    useEmployerApplications(selectedJobIdFilter || undefined);

  const { mutate: deleteJob } = useDeleteJob();
  const { mutate: updateApplicantStatus } = useUpdateApplicationStatus();
  const openApplicantDetail = useCallback(
    (a) => {
      if (!a) return;
      setApplicantDetail(a);
      setApplicantStatus(a.status);
      if (a.status === 'APPLIED') {
        updateApplicantStatus(
          { applicationId: a.id, status: 'VIEWED' },
          {
            onSuccess: () => {
              setApplicantDetail((prev) =>
                prev?.id === a.id ? { ...prev, status: 'VIEWED' } : prev,
              );
              setApplicantStatus('VIEWED');
            },
          },
        );
      }
    },
    [updateApplicantStatus],
  );
  const createBoostCheckoutMutation = useCreateBoostCheckout();
  const boostWebhookHandledRef = useRef(false);
  const { data: boostJobDetail } = useJobDetail(selectedBoostJob?.id, {
    enabled: !!selectedBoostJob?.id && boostPaymentModalOpen,
    refetchInterval: boostPaymentModalOpen ? 3000 : false,
    refetchIntervalInBackground: true,
  });

  const resolvedBoostJobDetail = boostJobDetail?.data || boostJobDetail;
  const boostPaymentConfirmed = (() => {
    if (
      !resolvedBoostJobDetail?.boostExpiredAt ||
      !resolvedBoostJobDetail?.isBoosted
    )
      return false;
    const expiredAt = new Date(resolvedBoostJobDetail.boostExpiredAt);
    return !Number.isNaN(expiredAt.getTime()) && expiredAt > new Date();
  })();

  const applicantsList = applicationsResult?.data || [];
  const filteredApplicants = applicantsList.filter((a) => {
    if (a.status === 'CANCELLED') return false;
    return statusFilter ? a.status === statusFilter : true;
  });

  const applicantsTabTotalPages = Math.max(
    1,
    Math.ceil(filteredApplicants.length / APPLICANTS_TAB_PAGE_SIZE),
  );
  const applicantsTabRows = filteredApplicants.slice(
    (applicantsTabPage - 1) * APPLICANTS_TAB_PAGE_SIZE,
    applicantsTabPage * APPLICANTS_TAB_PAGE_SIZE,
  );

  const jobs = searchResult?.items || [];
  // Nếu fetchAll=true trả về mảng trực tiếp hoặc trả về object chứa items/data
  const allJobs = Array.isArray(allJobsResult)
    ? allJobsResult
    : allJobsResult?.items || allJobsResult?.data || [];
  const totalPages = searchResult?.meta?.totalPage || 1;

  const openCampaignDetail = async (campaignId) => {
    const parsedId = Number(campaignId);
    if (Number.isNaN(parsedId) || parsedId <= 0) {
      toast('Mã chiến dịch không hợp lệ.', 'error');
      return;
    }

    setCampaignDetailOpen(true);
    setCampaignDetailLoading(true);
    setCampaignDetailError('');
    try {
      const detail = await getCampaignDetail(parsedId);
      setCampaignDetailData(detail);
      setSelectedCampaignSlotId(detail?.slots?.[0]?.id ?? null);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không tải được chi tiết chiến dịch.';
      const normalized = Array.isArray(message) ? message.join(', ') : message;
      setCampaignDetailError(normalized);
      setCampaignDetailData(null);
    } finally {
      setCampaignDetailLoading(false);
    }
  };

  const closeCampaignDetail = () => {
    setCampaignDetailOpen(false);
    setCampaignDetailData(null);
    setCampaignDetailError('');
    setSelectedCampaignSlotId(null);
    setSlotApplicantsModalOpen(false);
  };

  const openSlotApplicantsModal = (slotId) => {
    setSelectedCampaignSlotId(slotId);
    setSlotApplicantsTab('ACCEPTED');
    setSlotApplicantsModalOpen(true);
  };

  const campaignSlots = useMemo(() => {
    const slots = campaignDetailData?.slots || [];
    return [...slots].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );
  }, [campaignDetailData]);

  const campaignInvitations = useMemo(
    () => campaignDetailData?.invitations || [],
    [campaignDetailData],
  );

  const selectedCampaignSlot = useMemo(
    () =>
      campaignSlots.find((slot) => slot.id === selectedCampaignSlotId) ||
      campaignSlots[0] ||
      null,
    [campaignSlots, selectedCampaignSlotId],
  );

  const acceptedInvitations = useMemo(
    () => campaignInvitations.filter((item) => item.status === 'ACCEPTED'),
    [campaignInvitations],
  );

  const rejectedInvitations = useMemo(
    () => campaignInvitations.filter((item) => item.status === 'REJECTED'),
    [campaignInvitations],
  );

  const pendingInvitations = useMemo(
    () => campaignInvitations.filter((item) => item.status === 'PENDING'),
    [campaignInvitations],
  );

  const attendeesBySlotId = useMemo(() => {
    const map = new Map();
    acceptedInvitations.forEach((invitation) => {
      const selectedSlotId = invitation?.selectedSlotId;
      if (!selectedSlotId) return;
      if (!map.has(selectedSlotId)) {
        map.set(selectedSlotId, []);
      }
      map.get(selectedSlotId).push(invitation);
    });
    return map;
  }, [acceptedInvitations]);

  const selectedSlotAttendees = useMemo(() => {
    if (!selectedCampaignSlot) return [];
    return attendeesBySlotId.get(selectedCampaignSlot.id) || [];
  }, [attendeesBySlotId, selectedCampaignSlot]);

  const slotApplicantsTabOptions = useMemo(
    () => [
      {
        key: 'ACCEPTED',
        label: 'Có thể đi',
        count: selectedSlotAttendees.length,
        tone: 'emerald',
      },
      {
        key: 'PENDING',
        label: 'Chưa phản hồi',
        count: pendingInvitations.length,
        tone: 'amber',
      },
      {
        key: 'REJECTED',
        label: 'Đã từ chối',
        count: rejectedInvitations.length,
        tone: 'rose',
      },
    ],
    [
      pendingInvitations.length,
      rejectedInvitations.length,
      selectedSlotAttendees.length,
    ],
  );

  const activeSlotApplicantList = useMemo(() => {
    if (slotApplicantsTab === 'ACCEPTED') return selectedSlotAttendees;
    if (slotApplicantsTab === 'PENDING') return pendingInvitations;
    return rejectedInvitations;
  }, [
    pendingInvitations,
    rejectedInvitations,
    selectedSlotAttendees,
    slotApplicantsTab,
  ]);

  useEffect(() => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ['my-company'] });
      queryClient.invalidateQueries({ queryKey: ['jobs-for-employer'] });
      queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
    }
  }, [user?.id, queryClient]);

  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '') || '/';
    if (path === '/employer') setActive('overview');
    else if (path === '/employer/jobs') setActive('jobs');
    else if (path === '/employer/applicants') setActive('jobs');
    else if (path === '/employer/stats') setActive('stats');
  }, [location.pathname]);

  const campaignIdFromUrl = searchParams.get('campaignId');
  useEffect(() => {
    if (!campaignIdFromUrl) return;
    openCampaignDetail(campaignIdFromUrl);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('campaignId');
        return next;
      },
      { replace: true },
    );
  }, [campaignIdFromUrl, setSearchParams]);

  const applicantsJobIdFromUrl = searchParams.get('applicantsJobId');
  useEffect(() => {
    if (!applicantsJobIdFromUrl) return;
    const id = Number(applicantsJobIdFromUrl);
    if (Number.isNaN(id)) return;
    setActive('jobs');
    setSelectedJobIdFilter(String(id));
    setApplicantsModalJobId(id);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('applicantsJobId');
        return next;
      },
      { replace: true },
    );
  }, [applicantsJobIdFromUrl, setSearchParams]);

  useEffect(() => {
    setApplicantsTabPage(1);
  }, [selectedJobIdFilter, statusFilter]);

  useEffect(() => {
    if (loadingCompany) return;
    if (!company?.id) {
      setCompanyModalOpen(true);
    }
  }, [company, loadingCompany]);

  useEffect(() => {
    if (!boostPaymentModalOpen) {
      boostWebhookHandledRef.current = false;
      return;
    }

    if (!boostPaymentConfirmed || boostWebhookHandledRef.current) {
      return;
    }

    boostWebhookHandledRef.current = true;
    toast('Thanh toán thành công. Tin đã được kích hoạt nổi bật.', 'success');
    setBoostPaymentModalOpen(false);
    setBoostCheckoutData(null);
    setSelectedBoostJob(null);
    queryClient.invalidateQueries({ queryKey: ['jobs-for-employer'] });
    queryClient.invalidateQueries({ queryKey: ['boosted-jobs'] });
  }, [boostPaymentModalOpen, boostPaymentConfirmed, queryClient, toast]);

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

  const handleBoostCheckout = async () => {
    if (!selectedBoostJob?.id) {
      toast('Không xác định được job cần boost', 'error');
      return;
    }

    try {
      const checkoutRes = await createBoostCheckoutMutation.mutateAsync({
        jobId: selectedBoostJob.id,
        payload: {
          packageDays: selectedBoostPackageDays,
        },
      });

      const checkout = checkoutRes?.data || checkoutRes;
      const paymentOrderId = checkout?.paymentOrderId;
      if (!paymentOrderId) {
        throw new Error('Không lấy được mã đơn thanh toán');
      }

      setBoostCheckoutData(checkout);
      setBoostModalOpen(false);
      setBoostPaymentModalOpen(true);

      const paymentCode = checkout?.paymentCode;
      toast(
        paymentCode
          ? `Đã tạo thanh toán. Chuyển khoản đúng nội dung: ${paymentCode}. Hệ thống sẽ tự boost sau khi SePay gửi webhook.`
          : 'Đã tạo thanh toán boost. Hệ thống sẽ tự cập nhật sau khi SePay xác nhận.',
        'success',
      );
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Thanh toán boost thất bại';
      toast(Array.isArray(message) ? message.join(', ') : message, 'error');
    }
  };

  const handleCopyPaymentCode = async () => {
    const paymentCode = boostCheckoutData?.paymentCode;
    if (!paymentCode) return;

    try {
      await navigator.clipboard.writeText(paymentCode);
      toast('Đã sao chép nội dung chuyển khoản', 'success');
    } catch {
      toast('Không thể sao chép. Vui lòng sao chép thủ công.', 'error');
    }
  };

  const handleSaveApplicantStatus = () => {
    if (!applicantDetail) return;

    if (
      !applicantDetail?.id ||
      applicantDetail?.source === 'INTERVIEW_INVITATION'
    ) {
      toast(
        'Hồ sơ mở từ danh sách phỏng vấn chỉ xem thông tin, không cập nhật trạng thái tại đây.',
        'error',
      );
      return;
    }

    if (!['SUITABLE', 'UNSUITABLE'].includes(applicantStatus)) {
      toast(
        'Chỉ được cập nhật trạng thái Phù hợp hoặc Không phù hợp.',
        'error',
      );
      return;
    }

    updateApplicantStatus(
      { applicationId: applicantDetail.id, status: applicantStatus },
      {
        onSuccess: () => {
          toast('Cập nhật trạng thái thành công', 'success');
          setApplicantDetail(null);
        },
        onError: (error) => {
          const message = error?.response?.data?.message || 'Cập nhật thất bại';
          toast(Array.isArray(message) ? message.join(', ') : message, 'error');
        },
      },
    );
  };

  const getEditableApplicantStatus = (status) =>
    ['SUITABLE', 'UNSUITABLE'].includes(status) ? status : '';

  const handleOpenApplicantProfileFromInvitation = (invitation) => {
    if (!invitation?.worker) {
      toast('Không lấy được hồ sơ worker.', 'error');
      return;
    }

    setApplicantDetail({
      source: 'INTERVIEW_INVITATION',
      id: null,
      status: invitation?.status || '',
      user: invitation.worker,
      job: {
        title: campaignDetailData?.title || 'Chiến dịch phỏng vấn',
      },
    });
    setApplicantStatus('');
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
        title="Bảng điều khiển nhà tuyển dụng"
        subtitle={DASHBOARD_SUBTITLE}
        menu={EMPLOYER_MENU}
        activeKey={active}
        onSelect={setActive}
      >
        <div className="py-6">
          <AppLoadingScene
            title="Đang tải dữ liệu doanh nghiệp"
            subtitle="Hệ thống đang chuẩn bị dashboard tuyển dụng"
            className="mx-auto max-w-5xl"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Bảng điều khiển nhà tuyển dụng"
      subtitle={DASHBOARD_SUBTITLE}
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
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm gap-6 ring-1 ring-primary/5">
                <div className="flex items-center gap-5 min-w-0">
                  <div className="relative shrink-0">
                    {company?.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt="logo"
                        className="w-[72px] h-[72px] rounded-xl border border-slate-200 object-cover shadow-sm bg-white"
                      />
                    ) : (
                      <div className="w-[72px] h-[72px] rounded-xl bg-primary-muted flex items-center justify-center border border-primary/15 shadow-sm">
                        <Building className="w-9 h-9 text-primary" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                        Chào mừng trở lại, {company?.name || 'Doanh nghiệp'}
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
                        <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 bg-slate-50/90 px-3 py-1.5 rounded-lg border border-slate-200">
                          <Building2 size={14} className="text-slate-500" />
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
                          className="flex items-center gap-1.5 text-[13px] font-medium text-slate-700 hover:text-primary hover:bg-primary-muted/50 bg-slate-50/90 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                        >
                          <Globe size={16} className="text-primary shrink-0" />
                          <span className="truncate max-w-[200px] sm:max-w-xs">
                            {company.website}
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto shrink-0">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto h-11 px-5 rounded-xl border-primary/25 bg-white hover:bg-primary-muted/60 text-slate-800 font-semibold"
                    onClick={() => setCompanyModalOpen(true)}
                  >
                    {isRejected ? 'Chỉnh sửa hồ sơ' : 'Cập nhật thông tin'}
                  </Button>
                  {isApproved && (
                    <Button
                      onClick={() => navigate('/employer/jobs/create')}
                      className="w-full sm:w-auto h-11 px-5 rounded-xl gap-2 font-semibold shadow-sm"
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
                {loadingOverview
                  ? Array.from({ length: 4 }).map((_, idx) => (
                      <Card
                        key={idx}
                        className="p-5 rounded-xl border border-slate-200 shadow-sm bg-white animate-pulse"
                      >
                        <div className="flex justify-between items-start">
                          <div className="w-11 h-11 rounded-lg bg-slate-100" />
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="h-8 w-16 bg-slate-100 rounded-lg" />
                          <div className="h-4 w-24 bg-slate-100 rounded" />
                        </div>
                      </Card>
                    ))
                  : buildKpiItems(overview).map((item, idx) => {
                      const isPositive = item.change > 0;
                      const isNegative = item.change < 0;
                      const trendColor = isPositive
                        ? 'text-emerald-600'
                        : isNegative
                          ? 'text-rose-600'
                          : 'text-slate-500';

                      return (
                        <Card
                          key={idx}
                          className="p-5 rounded-2xl border border-slate-200/60 shadow-sm bg-white flex flex-col justify-between hover:border-primary/25 transition-all hover:shadow-md group"
                        >
                          <div>
                            <p className="text-[13px] font-medium text-slate-500 mb-2">
                              {item.label}
                            </p>
                            <div className="text-3xl font-bold tabular-nums text-slate-900 tracking-tight flex  gap-4 ">
                              {item.isPercentage
                                ? `${(item.value || 0).toLocaleString('vi-VN')}%`
                                : (item.value || 0).toLocaleString('vi-VN')}

                              <div
                                className={`mt-4 flex items-center gap-1.5 text-[13px] font-bold ${trendColor}`}
                              >
                                {isPositive ? (
                                  <span className="flex items-center gap-0.5">
                                    ▲{' '}
                                    {item.isCountTrend
                                      ? `${item.change} tin mới tuần này`
                                      : `${Math.abs(item.change)}% so với tháng trước`}
                                  </span>
                                ) : isNegative ? (
                                  <span className="flex items-center gap-0.5">
                                    ▼ {Math.abs(item.change)}% so với tháng
                                    trước
                                  </span>
                                ) : (
                                  <span className="text-slate-400">
                                    Không có thay đổi
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
              </div>

              {/* Quick Actions & Recent Applicants Preview */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column: Recent Jobs */}
                <Card className="md:col-span-2 p-0 rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                  <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-primary-muted/30">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/20">
                        <Briefcase className="h-4 w-4 text-primary" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 text-base">
                          Tin tuyển dụng gần đây
                        </h3>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/employer/jobs')}
                      className="text-primary hover:text-primary hover:bg-primary/10 font-semibold shrink-0"
                    >
                      Xem tất cả
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="p-5 space-y-3">
                    {loadingJobs ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin h-7 w-7 text-primary" />
                      </div>
                    ) : jobs.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-8">
                        Chưa có tin tuyển dụng nào.
                      </p>
                    ) : (
                      jobs.slice(0, 3).map((job) => (
                        <div
                          key={job.id}
                          role="button"
                          tabIndex={0}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-primary-muted/25 hover:border-primary/20 transition-colors gap-4 cursor-pointer text-left w-full"
                          onClick={() => setApplicantsModalJobId(job.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setApplicantsModalJobId(job.id);
                            }
                          }}
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-[min(100%,20rem)]">
                              {job.title}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2 text-xs">
                              <span className="inline-flex items-center gap-1 text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                <MapPin size={12} className="text-slate-400" />
                                {job.province || 'Toàn quốc'}
                              </span>
                              <span className="inline-flex items-center text-primary bg-primary/10 border border-primary/15 px-2 py-0.5 rounded-md font-medium">
                                {formatSalary(
                                  job.salaryMin,
                                  job.salaryMax,
                                  'vndCompact',
                                )}
                              </span>
                            </div>
                          </div>
                          <div
                            className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {job.status === 'PUBLISHED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg text-primary border-primary/25 bg-white hover:bg-primary/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMatchedJobId(job.id);
                                }}
                              >
                                <Sparkles size={14} className="mr-1.5" /> Đề
                                xuất
                              </Button>
                            )}
                            <StatusBadge status={job.status} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {/* Right Column: Mini Applicants */}
                <Card className="p-0 rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-slate-100 bg-primary-muted/30">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/20">
                        <Users className="h-4 w-4 text-primary" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-base">
                          Ứng viên mới nhất
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Theo thời gian nộp đơn
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="space-y-3 flex-1">
                      {applicantsList.slice(0, 4).map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2"
                        >
                          <img
                            src={
                              app.user?.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(app.user?.fullName || 'User')}&background=fef9e6&color=92400e`
                            }
                            alt="avatar"
                            className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0"
                          />
                          <div className="flex-1 overflow-hidden min-w-0">
                            <p className="font-medium text-sm text-slate-900 truncate">
                              {app.user?.fullName || 'Ứng viên'}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {app.job?.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-5 rounded-xl font-semibold border-primary/25 hover:bg-primary-muted/50 text-slate-800"
                      onClick={() => navigate('/employer/jobs')}
                    >
                      Quản lý tin tuyển dụng
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* JOBS TAB */}
          {active === 'jobs' && (
            <div className="space-y-6 animate-in fade-in py-2 overflow-y-auto pb-6">
              <Card className="p-0 rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-slate-100 bg-primary-muted/30">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/20">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Tin tuyển dụng
                      </h2>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Tìm kiếm, chỉnh sửa và theo dõi trạng thái tin đăng
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  {/* Toolbar */}
                  <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Tìm theo tiêu đề tin..."
                        className="pl-9 rounded-lg border-slate-200 bg-white focus-visible:ring-primary/25"
                        value={jobSearchText}
                        onChange={(e) => setJobSearchText(e.target.value)}
                      />
                    </div>
                    {isApproved && (
                      <Button
                        className="rounded-lg gap-2 shadow-sm w-full sm:w-auto font-semibold px-5"
                        onClick={() => navigate('/employer/jobs/create')}
                      >
                        <Plus size={18} /> Tạo tin mới
                      </Button>
                    )}
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50/90 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-4 rounded-tl-lg whitespace-nowrap">
                            Tiêu đề công việc
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
                          <th className="px-4 rounded-tr-lg whitespace-nowrap text-center">
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
                            .map((job) => {
                              const boostExpiredAt = job.boostExpiredAt
                                ? new Date(job.boostExpiredAt)
                                : null;
                              const isBoostedActive =
                                !!boostExpiredAt &&
                                !Number.isNaN(boostExpiredAt.getTime()) &&
                                boostExpiredAt > new Date();

                              return (
                                <tr
                                  key={job.id}
                                  className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors cursor-pointer"
                                  onClick={() =>
                                    setApplicantsModalJobId(job.id)
                                  }
                                >
                                  <td className="py-4 px-4">
                                    <p className="font-semibold text-slate-800">
                                      {job.title}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                                      <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                                        <MapPin
                                          size={12}
                                          className="text-slate-400"
                                        />
                                        {job.province || 'Toàn quốc'}
                                      </span>
                                      <span className="inline-flex items-center text-primary bg-primary/10 border border-primary/15 px-2 py-0.5 rounded-md font-medium">
                                        {formatSalary(
                                          job.salaryMin,
                                          job.salaryMax,
                                          'vndCompact',
                                        )}
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
                                      {new Date(
                                        job.createdAt,
                                      ).toLocaleDateString('vi-VN')}
                                    </span>
                                  </td>
                                  <td
                                    className="px-4 text-center"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {isBoostedActive ? (
                                      <Badge
                                        variant="secondary"
                                        className="bg-primary/15 text-primary border border-primary/25 hover:bg-primary/20 cursor-default font-medium"
                                      >
                                        Đang nổi bật đến{' '}
                                        {job.boostExpiredAt
                                          ? new Date(
                                              job.boostExpiredAt,
                                            ).toLocaleDateString('vi-VN')
                                          : 'không thời hạn'}
                                      </Badge>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-lg"
                                        onClick={() => {
                                          setSelectedBoostJob(job);
                                          setSelectedBoostPackageDays(7);
                                          setBoostCheckoutData(null);
                                          setBoostPaymentModalOpen(false);
                                          setBoostModalOpen(true);
                                        }}
                                        disabled={job.status !== 'PUBLISHED'}
                                      >
                                        Đăng tin nổi bật
                                      </Button>
                                    )}
                                  </td>
                                  <td
                                    className="px-4 text-center"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex justify-center w-full">
                                      <Popover
                                        open={
                                          jobOptionsPopoverOpenId === job.id
                                        }
                                        onOpenChange={(open) =>
                                          setJobOptionsPopoverOpenId(
                                            open ? job.id : null,
                                          )
                                        }
                                      >
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 rounded-full hover:bg-slate-100"
                                            onClick={() =>
                                              setJobOptionsPopoverOpenId(job.id)
                                            }
                                          >
                                            <MoreHorizontal
                                              size={18}
                                              className="text-slate-600"
                                            />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                          className="w-48 p-1.5 rounded-xl shadow-xl border-slate-100"
                                          align="end"
                                        >
                                          <div className="flex flex-col gap-0.5">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="justify-start gap-2 hover:bg-primary/5 hover:text-primary rounded-lg font-medium text-slate-700 h-9"
                                              onClick={() => {
                                                setJobOptionsPopoverOpenId(
                                                  null,
                                                );
                                                setApplicantsModalJobId(job.id);
                                              }}
                                            >
                                              <Users size={14} /> Xem ứng viên
                                            </Button>

                                            {job.status === 'PUBLISHED' && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="justify-start gap-2 hover:bg-primary/10 hover:text-primary rounded-lg font-medium text-slate-700 h-9"
                                                onClick={() => {
                                                  setJobOptionsPopoverOpenId(
                                                    null,
                                                  );
                                                  setMatchedJobId(job.id);
                                                }}
                                              >
                                                <Sparkles size={14} /> Đề xuất
                                                ứng viên
                                              </Button>
                                            )}

                                            {job.status !== 'EXPIRED' && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="justify-start gap-2 hover:bg-slate-100 rounded-lg font-medium text-slate-700 h-9"
                                                onClick={() => {
                                                  setJobOptionsPopoverOpenId(
                                                    null,
                                                  );
                                                  navigate(
                                                    `/employer/jobs/${job.id}/edit`,
                                                  );
                                                }}
                                              >
                                                <Edit size={14} /> Chỉnh sửa
                                              </Button>
                                            )}

                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="justify-start gap-2 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium h-9 text-slate-700"
                                              onClick={() => {
                                                setJobOptionsPopoverOpenId(
                                                  null,
                                                );
                                                setDeleteConfirm(job);
                                              }}
                                            >
                                              <Trash2 size={14} /> Xóa tin
                                            </Button>
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-100">
                      <span className="text-sm text-slate-600">
                        Trang {jobPage} / {totalPages}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg border-slate-200"
                          onClick={() => setJobPage((p) => Math.max(1, p - 1))}
                          disabled={jobPage === 1 || loadingJobs}
                        >
                          <ChevronLeft size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg border-slate-200"
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
                </div>
              </Card>
            </div>
          )}

          {/* APPLICANTS TAB */}
          {active === 'applicants' && (
            <div className="space-y-6 animate-in fade-in py-2 overflow-y-auto pb-6">
              <Card className="p-0 rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-slate-100 bg-primary-muted/30">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/20">
                      <Users className="h-5 w-5 text-primary" />
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Quản lý ứng viên
                      </h2>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Theo dõi hồ sơ đã nộp theo từng tin tuyển dụng
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                        Lọc theo tin đăng
                      </label>
                      <select
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={selectedJobIdFilter}
                        onChange={(e) => setSelectedJobIdFilter(e.target.value)}
                      >
                        <option value="">Tất cả tin tuyển dụng</option>
                        {allJobs.map((j) => (
                          <option key={j.id} value={String(j.id)}>
                            {j.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full sm:w-56 shrink-0">
                      <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                        Trạng thái
                      </label>
                      <select
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="">Tất cả trạng thái</option>
                        <option value="APPLIED">Chờ xử lý</option>
                        <option value="VIEWED">Đã xem</option>
                        <option value="SUITABLE">Phù hợp</option>
                        <option value="UNSUITABLE">Không phù hợp</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50/90 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4 whitespace-nowrap">
                            Ứng viên
                          </th>
                          <th className="py-3 px-4 whitespace-nowrap min-w-[10rem]">
                            Vị trí ứng tuyển
                          </th>
                          <th className="py-3 px-4 whitespace-nowrap text-center">
                            Trạng thái
                          </th>
                          <th className="py-3 px-4 whitespace-nowrap text-center">
                            Cập nhật
                          </th>
                          <th className="py-3 px-4 whitespace-nowrap text-right rounded-tr-lg">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingApplications ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="py-12 text-center text-slate-500"
                            >
                              <Loader2 className="animate-spin mx-auto text-primary" />
                            </td>
                          </tr>
                        ) : applicantsTabRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="py-12 text-center text-slate-500"
                            >
                              Chưa có hồ sơ ứng tuyển phù hợp bộ lọc.
                            </td>
                          </tr>
                        ) : (
                          applicantsTabRows.map((a) => (
                            <tr
                              key={a.id}
                              className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={
                                      a.user?.avatar ||
                                      `https://ui-avatars.com/api/?name=${encodeURIComponent(a.user?.fullName || 'User')}&background=fef9e6&color=92400e`
                                    }
                                    alt=""
                                    className="w-9 h-9 rounded-full border border-slate-200 object-cover shrink-0"
                                  />
                                  <span className="font-medium text-slate-800 truncate">
                                    {a.user?.fullName || 'Ứng viên'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-slate-700">
                                {a.job?.title || '—'}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <ApplicantStatusBadge status={a.status} />
                              </td>
                              <td className="py-3 px-4 text-center text-slate-600 whitespace-nowrap">
                                {new Date(
                                  a.updatedAt || a.createdAt || Date.now(),
                                ).toLocaleString('vi-VN')}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg border-primary/25 text-primary hover:bg-primary/10 font-semibold"
                                  onClick={() => {
                                    setApplicantDetail(a);
                                    setApplicantStatus(
                                      getEditableApplicantStatus(a.status),
                                    );
                                  }}
                                >
                                  Chi tiết
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {applicantsTabTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-sm text-slate-600">
                        Trang {applicantsTabPage} / {applicantsTabTotalPages}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg border-slate-200"
                          onClick={() =>
                            setApplicantsTabPage((p) => Math.max(1, p - 1))
                          }
                          disabled={
                            applicantsTabPage === 1 || loadingApplications
                          }
                        >
                          <ChevronLeft size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg border-slate-200"
                          onClick={() =>
                            setApplicantsTabPage((p) =>
                              Math.min(applicantsTabTotalPages, p + 1),
                            )
                          }
                          disabled={
                            applicantsTabPage === applicantsTabTotalPages ||
                            loadingApplications
                          }
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* STATS TAB */}
          {active === 'stats' && (
            <div className="space-y-6 animate-in fade-in py-2 overflow-y-auto pb-6">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-primary/5 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/20">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Báo cáo &amp; thống kê
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <ApplicationFunnelWidget jobs={allJobs} />
                {/* <EmployerPaymentsWidget /> */}
              </div>
            </div>
          )}
          {/* end !hasNoCompany */}
        </>
      )}

      {/* --- MODALS --- */}
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
        title="Đăng tin nổi bật"
        description={
          selectedBoostJob
            ? `Chọn gói để tăng hiển thị cho tin: ${selectedBoostJob.title}`
            : 'Chọn gói nổi bật cho tin tuyển dụng'
        }
        onClose={() => {
          setBoostModalOpen(false);
          setSelectedBoostJob(null);
        }}
        onConfirm={handleBoostCheckout}
        confirmLabel={
          createBoostCheckoutMutation.isPending
            ? 'Đang xử lý...'
            : 'Tạo mã thanh toán'
        }
        cancelLabel="Hủy"
        confirmDisabled={createBoostCheckoutMutation.isPending}
      >
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BOOST_SUBSCRIPTION_PLANS.map((plan) => {
              const isActive = selectedBoostPackageDays === plan.days;

              return (
                <label
                  key={plan.days}
                  className={`relative flex flex-col gap-2 p-4 rounded-2xl border cursor-pointer transition-all ${
                    isActive
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/10'
                      : plan.accent
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-2 right-3 rounded-full bg-primary text-white text-[10px] px-2 py-1 font-semibold tracking-wide">
                      {plan.badge}
                    </span>
                  )}

                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="pkg"
                      checked={isActive}
                      onChange={() => setSelectedBoostPackageDays(plan.days)}
                      className="mt-1 w-4 h-4 text-primary"
                    />
                    <div>
                      <p className="font-bold text-slate-800">{plan.name}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  <p className="text-2xl font-extrabold text-slate-900">
                    {plan.price.toLocaleString('vi-VN')}đ
                  </p>
                </label>
              );
            })}
          </div>

          <p className="text-xs text-slate-500">
            Luu y: Neu ban da quet QR ma chua thay cap nhat ngay, he thong se
            dong bo sau khi SePay gui webhook.
          </p>
        </div>
      </Modal>

      <Modal
        open={boostPaymentModalOpen && !!boostCheckoutData}
        title="Thanh toán tin nổi bật bằng QR"
        description={
          selectedBoostJob
            ? `Quét QR để thanh toán cho job: ${selectedBoostJob.title}`
            : 'Quét QR để hoàn tất thanh toán gói nổi bật'
        }
        onClose={() => {
          setBoostPaymentModalOpen(false);
          setBoostCheckoutData(null);
          setSelectedBoostJob(null);
        }}
        variant="custom"
        className="z-60 bg-black/60 backdrop-blur-md pt-12 px-4"
      >
        {boostCheckoutData && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">
                    Mã thanh toán đã tạo thành công
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Chuyển khoản đúng nội dung để hệ thống tự kích hoạt tin nổi
                    bật.
                  </p>
                </div>
                <span className="text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 px-2 py-1">
                  SePay
                </span>
              </div>

              <div className="rounded-xl bg-white border border-emerald-100 p-3">
                <p className="text-xs text-slate-500">Nội dung chuyển khoản</p>
                <p className="font-bold text-slate-800 tracking-wide mt-1">
                  {boostCheckoutData.paymentCode}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Gói đã chọn</p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {selectedBoostPackageDays} ngày
                  </p>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Số tiền</p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {(boostCheckoutData.amount || 0).toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            </div>

            {boostCheckoutData.paymentUrl && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  Quét QR để thanh toán
                </p>
                <div className="mx-auto w-64 h-64 rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-center shadow-sm">
                  <img
                    src={boostCheckoutData.paymentUrl}
                    alt="SePay QR"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg border-emerald-200"
                onClick={handleCopyPaymentCode}
              >
                <Copy size={14} className="mr-1" /> Sao chép nội dung
              </Button>
            </div>

            <p className="text-xs text-slate-500">
              Sau khi thanh toán, hệ thống sẽ chờ SePay callback để tự cập nhật
              DB và kích hoạt tin nổi bật.
            </p>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center gap-2">
              <Loader2
                className={`h-4 w-4 ${boostPaymentConfirmed ? '' : 'animate-spin'} text-primary`}
              />
              <p className="text-xs text-slate-600">
                {boostPaymentConfirmed
                  ? 'Đã xác nhận thanh toán từ SePay. Đang cập nhật giao diện...'
                  : 'Đang chờ SePay xác nhận thanh toán...'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* <Modal
        open={bulkInviteOpen}
        title="Gửi lời mời phỏng vấn"
        description={`Bạn đang chọn ${selectedApplicantIds.size} ứng viên. Nội dung dưới đây sẽ được gửi qua chat.`}
        onClose={() => {
          if (!bulkInviteSending) {
            setBulkInviteOpen(false);
          }
        }}
        onConfirm={handleSendBulkInterviewInvite}
        confirmLabel={bulkInviteSending ? 'Đang gửi...' : 'Gửi lời mời'}
        cancelLabel="Hủy"
        confirmDisabled={bulkInviteSending || !bulkInviteMessage.trim()}
      >
        <div className="space-y-2 mt-4">
          <p className="text-sm font-medium text-slate-700">Nội dung tin nhắn</p>
          <Textarea
            value={bulkInviteMessage}
            onChange={(e) => setBulkInviteMessage(e.target.value)}
            rows={6}
            placeholder="Nhập nội dung mời phỏng vấn"
            className="rounded-xl border-slate-200"
          />
        </div>
      </Modal> */}

      <MatchedWorkersModal
        jobId={matchedJobId}
        onClose={() => setMatchedJobId(null)}
      />

      <JobApplicantsModal
        jobId={applicantsModalJobId}
        onClose={() => setApplicantsModalJobId(null)}
        onOpenDetail={(a) => {
          setApplicantsModalJobId(null);
          setApplicantDetail(a);
          setApplicantStatus(getEditableApplicantStatus(a.status));
        }}
        onOpenCampaignDetail={openCampaignDetail}
      />

      <Modal
        open={campaignDetailOpen}
        onClose={closeCampaignDetail}
        title={campaignDetailData?.title || 'Chi tiết chiến dịch phỏng vấn'}
        description="Theo dõi worker đã chọn ca nào và địa điểm phỏng vấn của từng ca."
        variant="custom"
        contentClassName="max-w-5xl"
        bodyClassName="space-y-4"
      >
        {campaignDetailLoading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Đang tải chi tiết chiến dịch...
          </div>
        ) : campaignDetailError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {campaignDetailError}
          </div>
        ) : campaignDetailData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Tổng lời mời</p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {campaignDetailData.totalCount || 0}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs text-emerald-700">Đã chấp nhận</p>
                <p className="mt-1 text-xl font-bold text-emerald-800">
                  {acceptedInvitations.length}
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-700">Đang chờ</p>
                <p className="mt-1 text-xl font-bold text-amber-800">
                  {pendingInvitations.length}
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                <p className="text-xs text-rose-700">Đã từ chối</p>
                <p className="mt-1 text-xl font-bold text-rose-800">
                  {rejectedInvitations.length}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {campaignSlots.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 md:col-span-2">
                  Chiến dịch chưa có ca phỏng vấn.
                </div>
              ) : (
                campaignSlots.map((slot, index) => {
                  const slotAttendees = attendeesBySlotId.get(slot.id) || [];

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => openSlotApplicantsModal(slot.id)}
                      className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-primary/40"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Ca #{index + 1}
                          </p>
                          <p className="text-xs text-slate-600">
                            {new Date(slot.startAt).toLocaleString('vi-VN')} -{' '}
                            {new Date(slot.endAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-slate-300 text-slate-700"
                        >
                          {slotAttendees.length}/{slot.capacity} người đã chọn
                        </Badge>
                      </div>

                      <div className="mt-3 space-y-1 text-sm text-slate-700">
                        <p>
                          Địa điểm:{' '}
                          <span className="font-medium">
                            {slot.location?.trim() || 'Chưa cập nhật'}
                          </span>
                        </p>
                        {slot.note ? (
                          <p className="text-xs text-slate-500">
                            Ghi chú: {slot.note}
                          </p>
                        ) : null}
                      </div>

                      <p className="mt-3 text-xs font-semibold text-primary">
                        Bấm để xem danh sách ứng viên của ca này
                      </p>
                    </button>
                  );
                })
              )}
            </div>
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              Chọn một ca để mở modal danh sách ứng viên theo ca.
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Không có dữ liệu chiến dịch.
          </div>
        )}
      </Modal>

      <Modal
        open={slotApplicantsModalOpen && !!selectedCampaignSlot}
        onClose={() => setSlotApplicantsModalOpen(false)}
        title={
          selectedCampaignSlot
            ? `Danh sách ứng viên theo ca #${campaignSlots.findIndex((slot) => slot.id === selectedCampaignSlot.id) + 1}`
            : 'Danh sách ứng viên theo ca'
        }
        description={
          selectedCampaignSlot
            ? `${new Date(selectedCampaignSlot.startAt).toLocaleString('vi-VN')} - ${new Date(selectedCampaignSlot.endAt).toLocaleString('vi-VN')}`
            : ''
        }
        variant="custom"
        contentClassName="max-w-5xl"
        bodyClassName="space-y-4"
      >
        {selectedCampaignSlot ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 text-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                    Thông tin ca
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {new Date(selectedCampaignSlot.startAt).toLocaleString(
                      'vi-VN',
                    )}{' '}
                    -{' '}
                    {new Date(selectedCampaignSlot.endAt).toLocaleString(
                      'vi-VN',
                    )}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-slate-500 text-slate-100"
                >
                  Sức chứa {selectedCampaignSlot.capacity}
                </Badge>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-200 md:grid-cols-2">
                <p>
                  Địa điểm:{' '}
                  <span className="font-medium text-white">
                    {selectedCampaignSlot.location?.trim() || 'Chưa cập nhật'}
                  </span>
                </p>
                <p>
                  Ghi chú:{' '}
                  <span className="font-medium text-white">
                    {selectedCampaignSlot.note?.trim() || 'Không có ghi chú'}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Tổng lời mời
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {campaignInvitations.length}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-emerald-700">
                  Có thể đi ca này
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-800">
                  {selectedSlotAttendees.length}
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-amber-700">
                  Chưa phản hồi
                </p>
                <p className="mt-1 text-2xl font-black text-amber-800">
                  {pendingInvitations.length}
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-rose-700">
                  Đã từ chối
                </p>
                <p className="mt-1 text-2xl font-black text-rose-800">
                  {rejectedInvitations.length}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="grid gap-2 sm:grid-cols-3">
                {slotApplicantsTabOptions.map((tab) => {
                  const isActive = slotApplicantsTab === tab.key;
                  const activeClass =
                    tab.tone === 'emerald'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : tab.tone === 'amber'
                        ? 'border-amber-300 bg-amber-50 text-amber-800'
                        : 'border-rose-300 bg-rose-50 text-rose-800';

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSlotApplicantsTab(tab.key)}
                      className={`rounded-xl border px-3 py-2 text-left transition-all ${
                        isActive
                          ? activeClass
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-wide">
                        {tab.label}
                      </p>
                      <p className="mt-1 text-xl font-black">{tab.count}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                {activeSlotApplicantList.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    {slotApplicantsTab === 'ACCEPTED'
                      ? 'Chưa có worker nào chọn ca này.'
                      : slotApplicantsTab === 'PENDING'
                        ? 'Không có worker nào đang chờ phản hồi.'
                        : 'Chưa có worker nào từ chối.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activeSlotApplicantList.map((invitation) => (
                      <button
                        key={invitation.id}
                        type="button"
                        onClick={() =>
                          handleOpenApplicantProfileFromInvitation(invitation)
                        }
                        className="w-full rounded-lg border border-white bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-slate-900">
                            {invitation.worker?.fullName ||
                              `Worker #${invitation.workerId}`}
                          </p>
                          <Badge
                            variant="outline"
                            className={
                              slotApplicantsTab === 'ACCEPTED'
                                ? 'border-emerald-200 text-emerald-700'
                                : slotApplicantsTab === 'PENDING'
                                  ? 'border-amber-200 text-amber-700'
                                  : 'border-rose-200 text-rose-700'
                            }
                          >
                            {slotApplicantsTab === 'ACCEPTED'
                              ? 'Có thể đi'
                              : slotApplicantsTab === 'PENDING'
                                ? 'Chờ phản hồi'
                                : 'Từ chối'}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {slotApplicantsTab === 'REJECTED'
                            ? invitation.responseMessage ||
                              'Không có lý do từ chối'
                            : invitation.worker?.phone ||
                              invitation.worker?.email ||
                              'Chưa có thông tin liên hệ'}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-primary">
                          Bấm để xem profile đầy đủ
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Không tìm thấy thông tin ca đã chọn.
          </div>
        )}
      </Modal>

      <Modal
        open={!!applicantDetail}
        onClose={() => setApplicantDetail(null)}
        title="Chi tiết hồ sơ ứng viên"
        variant="custom"
        className="z-60"
      >
        {applicantDetail && (
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Users className="text-primary" /> Thông tin ứng viên
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
                src={
                  applicantDetail.user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(applicantDetail.user?.fullName || 'User')}&background=e0e7ff&color=4338ca`
                }
                className="w-20 h-20 rounded-2xl shadow-sm object-cover"
                alt="avatar"
              />
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {applicantDetail.user?.fullName}
                </h2>
                <div className="text-sm text-slate-500 mt-2 space-y-1">
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="text-primary" />
                    <span className="font-medium text-slate-700">
                      {applicantDetail.user?.phone || 'Chưa cập nhật SĐT'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="py-6 space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Vị trí ứng tuyển
                </p>
                <p className="font-semibold text-slate-800 mt-1">
                  {applicantDetail.job?.title}
                </p>
              </div>

              {/* Worker Profile Info */}
              <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 mt-4 border border-slate-100">
                <h4 className="font-semibold mb-3">Thông tin hồ sơ cá nhân</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-xs">Giới tính</p>
                    <p className="font-medium mt-1">
                      {applicantDetail.user?.workerProfile?.gender === 'MALE'
                        ? 'Nam'
                        : applicantDetail.user?.workerProfile?.gender ===
                            'FEMALE'
                          ? 'Nữ'
                          : 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Năm sinh</p>
                    <p className="font-medium mt-1">
                      {applicantDetail.user?.workerProfile?.birthYear ||
                        'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Ca làm mong muốn</p>
                    <p className="font-medium mt-1">
                      {{
                        MORNING: 'Ca sáng',
                        AFTERNOON: 'Ca chiều',
                        EVENING: 'Ca tối',
                        FULL_DAY: 'Cả ngày',
                        FLEXIBLE: 'Linh hoạt',
                      }[applicantDetail.user?.workerProfile?.shift] ||
                        applicantDetail.user?.workerProfile?.shift ||
                        'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Khu vực</p>
                    <p className="font-medium mt-1">
                      {applicantDetail.user?.workerProfile?.province ||
                        'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">
                      Công việc đã từng làm
                    </p>
                    <p className="font-medium mt-1">
                      {applicantDetail.user?.workerProfile?.occupation?.name ||
                        'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Năm kinh nghiệm</p>
                    <p className="font-medium mt-1">
                      {applicantDetail.user?.workerProfile?.experienceYear
                        ? `${applicantDetail.user?.workerProfile?.experienceYear} năm`
                        : 'Chưa có'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">
                      Mức lương mong muốn
                    </p>
                    <p className="font-medium mt-1">
                      {applicantDetail.user?.workerProfile?.expectedSalary
                        ? formatSalary(
                            applicantDetail.user.workerProfile.expectedSalary,
                            null,
                            'vndCompact',
                          )
                        : 'Thỏa thuận'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-slate-500 text-xs mb-1">
                    Giới thiệu bản thân (Bio)
                  </p>
                  <p className="font-medium whitespace-pre-wrap text-slate-700">
                    {applicantDetail.user?.workerProfile?.bio ? (
                      applicantDetail.user.workerProfile.bio
                    ) : (
                      <span className="italic text-slate-400">
                        Chưa cập nhật
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-2xl">
              {applicantDetail?.source === 'INTERVIEW_INVITATION' ? (
                <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
                  Hồ sơ này mở từ danh sách phỏng vấn theo ca. Nếu cần cập nhật
                  trạng thái hồ sơ ứng tuyển, hãy vào mục danh sách ứng viên của
                  job.
                </div>
              ) : null}
              {(() => {
                if (applicantDetail?.source === 'INTERVIEW_INVITATION') {
                  return null;
                }

                const isFinalized = ['SUITABLE', 'UNSUITABLE'].includes(
                  applicantDetail.status,
                );

                if (isFinalized) {
                  return (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-800">
                        Kết quả đánh giá ứng viên
                      </p>
                      <div className="inline-flex">
                        <ApplicantStatusBadge status={applicantDetail.status} />
                      </div>
                      <p className="text-xs text-slate-500 italic">
                        Ứng viên đã được chốt kết quả, không thể cập nhật lại
                        trạng thái.
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <p className="text-sm font-semibold text-slate-800">
                        Cập nhật trạng thái ứng viên
                      </p>
                      <Button
                        className="rounded-xl px-6 font-semibold shadow-sm"
                        onClick={handleSaveApplicantStatus}
                      >
                        Lưu lại
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          value: 'SUITABLE',
                          label: 'Phù hợp',
                          activeClass:
                            'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500',
                        },
                        {
                          value: 'UNSUITABLE',
                          label: 'Không phù hợp',
                          activeClass:
                            'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500',
                        },
                      ].map((status) => (
                        <button
                          key={status.value}
                          onClick={() => setApplicantStatus(status.value)}
                          className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-center text-center ${
                            applicantStatus === status.value
                              ? status.activeClass
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

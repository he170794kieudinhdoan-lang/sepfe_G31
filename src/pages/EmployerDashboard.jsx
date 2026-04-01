import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/shared/components/EmptyState';
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
import { CreateJobPage } from '@/pages/CreateJobPage';
import { EditJobPage } from '@/pages/EditJobPage';
import {
  ChevronLeft,
  ChevronRight,
  X,
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
  DollarSign,
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
import { SHIFTS, GENDERS } from '@/shared/constants/enums';
import { formatSalary } from '@/shared/utils/salaryUtils';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useEmployerOverview } from '@/features/statistics/api/useStatistics';
import { ApplicationFunnelWidget } from '@/features/statistics/components/ApplicationFunnelWidget';
import { EmployerPaymentsWidget } from '@/features/statistics/components/EmployerPaymentsWidget';

const EMPLOYER_MENU = [
  { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { key: 'jobs', label: 'Tin tuyển dụng', icon: Briefcase },
  { key: 'applicants', label: 'Ứng viên', icon: Users },
  { key: 'stats', label: 'Thống kê', icon: BarChart3 },
  { key: 'chat', label: 'Tin nhắn', icon: MessageCircle, path: '/chat' },
  { key: 'home', label: 'Trang chủ', icon: Home, path: '/' },
];

const buildKpiItems = (overview) => [
  {
    label: 'Tổng số tin tuyển dụng',
    value: overview?.totalJobs ?? '—',
    icon: Briefcase,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    trend: '+12%',
  },
  {
    label: 'Tin đang hoạt động',
    value: overview?.publishedJobs ?? '—',
    icon: TrendingUp,
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  {
    label: 'Tổng ứng viên đã nộp',
    value: overview?.totalApplications ?? '—',
    icon: Users,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    trend: '+24%',
  },
  {
    label: 'Vị trí đã được tuyển',
    value: overview ? `${overview.filledRate}%` : '—',
    icon: CalendarCheck,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
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
      title: 'Tin tuyển dụng đáng ngờ (Scam), đang treo để quản trị viên kiểm tra thủ công',
    },
  };

  const config = statusConfig[status] || {
    color: 'bg-gray-100 text-gray-800',
    label: status,
    title: '',
  };

  return (
    <Badge variant="outline" className={`font-medium cursor-help ${config.color}`} title={config.title}>
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
  navigate,
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
                    {formatSalary(item.worker?.expectedSalary, null, 'compact')}
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
                  {Math.round((item.scores?.finalScore || 0) * 100)}% Phù hợp
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
  const finalMessage = jobDetail
    ? `Chào bạn, tôi là nhà tuyển dụng của công ty ${companyName}. Tôi thấy hồ sơ của bạn rất phù hợp với vị trí [${jobDetail.title} (${jobDetail.occupation?.name})](${jobUrl}). Mời bạn xem qua thông tin và ứng tuyển nhé!`
    : `Chào bạn, tôi thấy hồ sơ của bạn rất phù hợp với vị trí tuyển dụng của chúng tôi. Mời bạn xem qua và [ứng tuyển tại đây](${jobUrl}) nhé!`;

  const handleBulkSend = async () => {
    setIsSending(true);
    let successCount = 0;

    try {
      for (const userId of selectedIds) {
        // Sequentially create conversation and send message
        const conv = await createConversation({ participantId: userId });
        if (conv?.id) {
          await sendMessage({ id: conv.id, content: finalMessage });
          successCount++;
        }
      }
      //toast(`Đã gửi lời mời tới ${successCount} ứng viên thành công!`, 'success');
      setIsBulkModalOpen(false);
      setSelectedIds(new Set());
    } catch (error) {
      toast('Có lỗi xảy ra khi gửi lời mời. Vui lòng thử lại.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleSingleContact = async (userId) => {
    try {
      const conv = await createConversation({ participantId: userId });
      if (conv?.id) {
        await sendMessage({ id: conv.id, content: finalMessage });
        navigate(`/chat/${conv.id}`);
        onClose(); // Close modal on success
      }
    } catch (error) {
      toast('Có lỗi xảy ra khi gửi lời mời. Vui lòng thử lại.', 'error');
    }
  };

  return (
    <>
      <Modal
        open={!!jobId}
        onClose={onClose}
        title="Ứng viên gợi ý từ AI"
        variant="custom"
      >
        <div className="p-6 relative">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : workers.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="Không có gợi ý nào"
                description="Thử cập nhật mô tả công việc để AI gợi ý chính xác hơn."
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
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-sm text-slate-600 line-clamp-4">
            "{finalMessage}"
          </div>
          <p className="text-xs text-slate-500">
            * Lời mời này bao gồm thông tin công ty, vị trí tuyển dụng và đường
            dẫn để ứng viên xem chi tiết công việc.
          </p>
        </div>
      </Modal>
    </>
  );
};

export const EmployerDashboard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [active, setActive] = useState('overview');
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [selectedBoostJob, setSelectedBoostJob] = useState(null);
  const [selectedBoostPackageDays, setSelectedBoostPackageDays] = useState(7);
  const [createJobModalOpen, setCreateJobModalOpen] = useState(false);
  const [editJobId, setEditJobId] = useState(null);
  const [matchedJobId, setMatchedJobId] = useState(null);

  // Applicant details
  const [applicantDetail, setApplicantDetail] = useState(null);
  const [applicantStatus, setApplicantStatus] = useState('');

  // Filtering states
  const [jobSearchText, setJobSearchText] = useState('');
  const [selectedJobIdFilter, setSelectedJobIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
  const createBoostCheckoutMutation = useCreateBoostCheckout();

  const applicantsList = applicationsResult?.data || [];
  const filteredApplicants = applicantsList.filter((a) => {
    if (a.status === 'CANCELLED') return false;
    return statusFilter ? a.status === statusFilter : true;
  });

  const jobs = searchResult?.items || [];
  // Nếu fetchAll=true trả về mảng trực tiếp hoặc trả về object chứa items/data
  const allJobs = Array.isArray(allJobsResult)
    ? allJobsResult
    : allJobsResult?.items || allJobsResult?.data || [];
  const totalPages = searchResult?.meta?.totalPage || 1;

  useEffect(() => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ['my-company'] });
      queryClient.invalidateQueries({ queryKey: ['jobs-for-employer'] });
      queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
    }
  }, [user?.id, queryClient]);

  useEffect(() => {
    if (loadingCompany) return;
    if (!company?.id) {
      setCompanyModalOpen(true);
    }
  }, [company, loadingCompany]);

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

      const checkoutUrl = checkout?.paymentUrl;
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      }

      setBoostModalOpen(false);
      setSelectedBoostJob(null);

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

  const handleExportApplicants = () => {
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

  const handleSaveApplicantStatus = () => {
    if (!applicantStatus || !applicantDetail) return;

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

  const renderApplicantManagement = (isModal = false) => (
    <div className="flex flex-col gap-6">
      {/* Filters + List */}
      <div className={`space-y-4 transition-all w-full`}>
        {!isModal && (
          <Card className="p-4 rounded-2xl shadow-sm border-slate-100 flex flex-wrap gap-3">
            <select
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm bg-slate-50 flex-1 min-w-[200px] outline-none focus:border-primary transition-all"
              value={selectedJobIdFilter}
              onChange={(e) => setSelectedJobIdFilter(e.target.value)}
            >
              <option value="">-- Lọc theo công việc --</option>
              {allJobs
                .filter((j) => j.status !== 'DELETED')
                .map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
            </select>
            <select
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm bg-slate-50 flex-1 min-w-[150px] outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Trạng thái</option>
              <option value="APPLIED">Chờ xử lý</option>
              <option value="VIEWED">Đã xem</option>
              <option value="SUITABLE">Phù hợp</option>
              <option value="UNSUITABLE">Không phù hợp</option>
            </select>
          </Card>
        )}

        {loadingApplications ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : applicantsList.length === 0 ? (
          <EmptyState
            title="Chưa có ứng viên nào."
            description="Khi có ứng viên nộp hồ sơ, dữ liệu sẽ hiển thị ở đây."
          />
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {filteredApplicants.map((a) => (
              <Card
                key={a.id}
                className={`p-4 rounded-2xl shadow-sm border transition-all cursor-pointer hover:border-primary hover:shadow-md ${applicantDetail?.id === a.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-slate-100'}`}
                onClick={() => {
                  setApplicantDetail(a);
                  setApplicantStatus(a.status);
                }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        a.user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(a.user?.fullName || 'User')}&background=e0e7ff&color=4338ca`
                      }
                      alt="avatar"
                      className="w-12 h-12 rounded-full shadow-sm object-cover border border-slate-100"
                    />
                    <div className="overflow-hidden">
                      <h4 className="font-semibold text-slate-800 truncate">
                        {a.user?.fullName}
                      </h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                        <Briefcase size={12} /> {a.job?.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <ApplicantStatusBadge status={a.status} />
                    <p className="text-xs text-slate-400 mt-2 flex items-center justify-end gap-1">
                      <Clock size={12} />{' '}
                      {new Date(
                        a.updatedAt || a.createdAt || new Date(),
                      ).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Right Side: Detail Viewer Modal */}
      <Modal
        open={!!applicantDetail}
        onClose={() => setApplicantDetail(null)}
        title="Chi tiết hồ sơ ứng viên"
        variant="custom"
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
                        ? `${(applicantDetail.user.workerProfile.expectedSalary / 1000000).toFixed(0)}Tr`
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {
                    value: 'APPLIED',
                    label: 'Chờ xử lý',
                    activeClass:
                      'border-yellow-500 bg-yellow-50 text-yellow-700 ring-1 ring-yellow-500',
                  },
                  {
                    value: 'VIEWED',
                    label: 'Đã xem hồ sơ',
                    activeClass:
                      'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500',
                  },
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
                    className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-center text-center ${applicantStatus === status.value
                        ? status.activeClass
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

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
        title="Employer Dashboard"
        menu={EMPLOYER_MENU}
        activeKey={active}
        onSelect={setActive}
      >
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Đang tải dữ liệu doanh nghiệp...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Employer Dashboard"
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
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    {company?.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt="logo"
                        className="w-[72px] h-[72px] rounded-[18px] border border-slate-100 object-cover shadow-sm bg-white"
                      />
                    ) : (
                      <div className="w-[72px] h-[72px] rounded-[18px] bg-primary/5 flex items-center justify-center border border-primary/10 shadow-sm">
                        <Building className="w-8 h-8 text-primary/60" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-[22px] md:text-2xl font-bold text-slate-800 tracking-tight">
                        Chào mừng trở lại, {company?.name || 'Doanh nghiệp'} 👋
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
                        <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 transition-colors">
                          <Building2 size={14} className="text-slate-400" />
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
                          className="flex items-center gap-1.5 text-[13px] font-medium hover:underline hover:text-primary-hover underline-offset-4  bg-slate-50 px-3 py-1.5 rounded-lg border  transition-all"
                        >
                          <Globe size={18} />
                          {company.website}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <Button
                    variant="outline"
                    className="w-full md:w-auto h-11 px-5 rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm text-[14px] font-semibold text-slate-700"
                    onClick={() => setCompanyModalOpen(true)}
                  >
                    {isRejected ? 'Chỉnh sửa hồ sơ' : 'Cập nhật thông tin'}
                  </Button>
                  {isApproved && (
                    <Button
                      onClick={() => setCreateJobModalOpen(true)}
                      className="w-full md:w-auto h-11 px-5 rounded-xl gap-2 shadow-sm text-[14px] font-semibold"
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
                      className="p-6 rounded-2xl shadow-sm border-slate-100 animate-pulse"
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-xl bg-slate-100" />
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="h-8 w-16 bg-slate-100 rounded-lg" />
                        <div className="h-4 w-24 bg-slate-100 rounded" />
                      </div>
                    </Card>
                  ))
                  : buildKpiItems(overview).map((item, idx) => (
                    <Card
                      key={idx}
                      className="p-6 rounded-2xl shadow-sm border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-xl ${item.bg}`}>
                          <item.icon className={`w-6 h-6 ${item.color}`} />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-4xl font-bold text-slate-800">
                          {item.value}
                        </p>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                          {item.label}
                        </p>
                      </div>
                    </Card>
                  ))}
              </div>

              {/* Quick Actions & Recent Applicants Preview */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column: Recent Jobs */}
                <Card className="md:col-span-2 p-6 rounded-2xl shadow-sm border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-slate-800">
                      Tin tuyển dụng gần đây
                    </h3>
                    <Button
                      variant="link"
                      onClick={() => setActive('jobs')}
                      className="text-primary pr-0 font-semibold"
                    >
                      Xem tất cả
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {loadingJobs ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-primary" />
                      </div>
                    ) : jobs.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">
                        Chưa có tin tuyển dụng nào.
                      </p>
                    ) : (
                      jobs.slice(0, 3).map((job) => (
                        <div
                          key={job.id}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors gap-4"
                        >
                          <div>
                            <p className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                              {job.title}
                            </p>
                            <div className="flex gap-2 mt-2 text-xs font-medium">
                              <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                <MapPin size={12} />{' '}
                                {job.province || 'Toàn quốc'}
                              </span>
                              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                <DollarSign size={12} />{' '}
                                {job.salaryMin > 0 || job.salaryMax > 0
                                  ? `${job.salaryMin > 0 ? (job.salaryMin / 1000000).toFixed(0) : '0'}M - ${job.salaryMax > 0 ? (job.salaryMax / 1000000).toFixed(0) : '0'}M`
                                  : 'Thỏa thuận'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-lg text-purple-600 hover:bg-purple-50 transition-all border-slate-200 flex items-center gap-1.5 shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMatchedJobId(job.id);
                              }}
                            >
                              <Sparkles size={14} /> Gợi ý AI
                            </Button>
                            <StatusBadge status={job.status} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {/* Right Column: Mini Applicants */}
                <Card className="p-6 rounded-2xl shadow-sm border-slate-100">
                  <h3 className="font-bold text-lg text-slate-800 mb-6">
                    Ứng viên mới nhất
                  </h3>
                  <div className="space-y-4">
                    {applicantsList.slice(0, 4).map((app) => (
                      <div key={app.id} className="flex items-center gap-3">
                        <img
                          src={
                            app.user?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(app.user?.fullName || 'User')}&background=e0e7ff&color=4338ca`
                          }
                          alt="avatar"
                          className="w-10 h-10 rounded-full border border-slate-200"
                        />
                        <div className="flex-1 overflow-hidden">
                          <p className="font-medium text-sm text-slate-800 truncate">
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
                    className="w-full mt-6 rounded-xl font-semibold border-slate-200"
                    onClick={() => setActive('applicants')}
                  >
                    Quản lý ứng viên
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {/* JOBS TAB */}
          {active === 'jobs' && (
            <div className="space-y-6 animate-in fade-in py-2 overflow-y-auto pb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Quản lý tin tuyển dụng
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Tạo và theo dõi các vị trí đang tuyển của công ty.
                  </p>
                </div>
                {isApproved && (
                  <Button
                    className="rounded-xl gap-2 shadow-sm w-full sm:w-auto font-semibold px-6"
                    onClick={() => setCreateJobModalOpen(true)}
                  >
                    <Plus size={18} /> Tạo tin mới
                  </Button>
                )}
              </div>

              <Card className="p-4 rounded-2xl shadow-sm border-slate-100">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm công việc..."
                      className="pl-9 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                      value={jobSearchText}
                      onChange={(e) => setJobSearchText(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl gap-2 bg-white border-slate-200 font-medium"
                  >
                    <Filter size={16} /> Lọc trạng thái
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                      <tr>
                        <th className="py-4 px-4 rounded-tl-xl whitespace-nowrap">
                          Vị trí tuyển dụng
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
                        <th className="px-4 rounded-tr-xl whitespace-nowrap text-center">
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
                          .map((job) => (
                            <tr
                              key={job.id}
                              className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="py-4 px-4">
                                <p className="font-semibold text-slate-800">
                                  {job.title}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2 text-xs font-medium">
                                  <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                    <MapPin size={12} />{' '}
                                    {job.province || 'Toàn quốc'}
                                  </span>
                                  <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                    <DollarSign size={12} />{' '}
                                    {job.salaryMin > 0 || job.salaryMax > 0
                                      ? `${job.salaryMin ? (job.salaryMin / 1000000).toFixed(0) : '0'}M - ${job.salaryMax ? (job.salaryMax / 1000000).toFixed(0) : '0'}M`
                                      : 'Thỏa thuận'}
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
                                  {new Date(job.createdAt).toLocaleDateString(
                                    'vi-VN',
                                  )}
                                </span>
                              </td>
                              <td className="px-4 text-center">
                                {job.isBoosted ? (
                                  <Badge
                                    variant="secondary"
                                    className="bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer"
                                  >
                                    Đang Boost đến{' '}
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
                                      setBoostModalOpen(true);
                                    }}
                                    disabled={job.status !== 'PUBLISHED'}
                                  >
                                    Nâng cấp
                                  </Button>
                                )}
                              </td>
                              <td className="px-4 text-center">
                                <div className="flex justify-start gap-2 w-[310px] mx-auto">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-lg text-primary hover:bg-primary/5 transition-all border-slate-200 font-medium"
                                    onClick={() => {
                                      setActive('applicants');
                                      setSelectedJobIdFilter(String(job.id));
                                    }}
                                  >
                                    Xem ứng viên
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-lg text-purple-600 hover:bg-purple-50 transition-all border-slate-200 flex items-center gap-1.5 shadow-sm font-medium"
                                    onClick={() => setMatchedJobId(job.id)}
                                  >
                                    <Sparkles size={14} /> Gợi ý AI
                                  </Button>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded-full hover:bg-slate-100"
                                      >
                                        <MoreHorizontal
                                          size={18}
                                          className="text-slate-600"
                                        />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-44 p-1.5 rounded-xl shadow-xl border-slate-100"
                                      align="end"
                                    >
                                      <div className="flex flex-col gap-0.5">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="justify-start gap-2 hover:bg-slate-100 rounded-lg font-medium text-slate-700 h-9"
                                          onClick={() => setEditJobId(job.id)}
                                        >
                                          <Edit size={14} className="" /> Chỉnh
                                          sửa
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="justify-start gap-2 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium h-9"
                                          onClick={() => setDeleteConfirm(job)}
                                        >
                                          <Trash2 size={14} /> Xóa tin
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-2">
                    <span className="text-sm text-slate-500">
                      Trang {jobPage} / {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setJobPage((p) => Math.max(1, p - 1))}
                        disabled={jobPage === 1 || loadingJobs}
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
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
              </Card>
            </div>
          )}

          {/* APPLICANTS TAB */}
          {active === 'applicants' && (
            <div className="space-y-6 animate-in fade-in py-2 overflow-y-auto pb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Danh sách ứng viên
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    {' '}
                    Xem và quản lý các hồ sơ đã nộp vào công ty bạn.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl gap-2 shadow-sm border-slate-200 font-medium"
                  onClick={handleExportApplicants}
                >
                  <Download size={16} /> Xuất dữ liệu
                </Button>
              </div>

              {renderApplicantManagement(false)}
            </div>
          )}

          {/* STATS TAB */}
          {active === 'stats' && (
            <div className="space-y-6 animate-in fade-in py-2 overflow-y-auto pb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Báo cáo & Thống kê
              </h2>

              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {loadingOverview
                  ? Array.from({ length: 4 }).map((_, idx) => (
                    <Card
                      key={idx}
                      className="p-6 rounded-2xl shadow-sm border-slate-100 animate-pulse"
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-xl bg-slate-100" />
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="h-8 w-16 bg-slate-100 rounded-lg" />
                        <div className="h-4 w-24 bg-slate-100 rounded" />
                      </div>
                    </Card>
                  ))
                  : buildKpiItems(overview).map((item, idx) => (
                    <Card
                      key={idx}
                      className="p-6 rounded-2xl shadow-sm border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-xl ${item.bg}`}>
                          <item.icon className={`w-6 h-6 ${item.color}`} />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-4xl font-bold text-slate-800">
                          {item.value}
                        </p>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                          {item.label}
                        </p>
                      </div>
                    </Card>
                  ))}
              </div>

              <div className="mb-6">
                <ApplicationFunnelWidget jobs={allJobs} />
              </div>

              <div className="mb-6">
                <EmployerPaymentsWidget />
              </div>

              <Card className="p-6 rounded-2xl shadow-sm border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <BarChart3 className="text-primary" /> Tổng quan hiệu suất
                  tuyển dụng
                </h3>

                {/* Fake Chart Area */}
                <div className="h-64 rounded-xl bg-linear-to-br from-indigo-50 to-blue-50 border border-dashed border-blue-200 flex flex-col items-center justify-center text-blue-400">
                  <BarChart3 size={48} className="mb-2 opacity-50" />
                  <p className="font-medium text-sm">
                    Biểu đồ đang được cập nhật
                  </p>
                </div>

                <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-sm text-slate-500">
                      Tỉ lệ chuyển đổi (View/Apply)
                    </p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      12.5%
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-sm text-slate-500">
                      Chi phí trung bình / CV
                    </p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      15,000đ
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-sm text-slate-500">
                      Tỉ lệ phỏng vấn thành công
                    </p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      45%
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
          {/* end !hasNoCompany */}
        </>
      )}

      {/* --- MODALS --- */}
      {createJobModalOpen && (
        <CreateJobPage
          onBack={() => setCreateJobModalOpen(false)}
          onSuccess={() => {
            setCreateJobModalOpen(false);
            // Re-fetch jobs would be ideal, but rely on useChatRealtime/invalidate if implemented
          }}
        />
      )}
      {editJobId && (
        <EditJobPage
          jobIdProp={editJobId}
          onBack={() => setEditJobId(null)}
          onSuccess={() => setEditJobId(null)}
        />
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
        title="Thanh toán boost tin tuyển dụng"
        description={
          selectedBoostJob
            ? `Thanh toán để đẩy top cho job: ${selectedBoostJob.title}`
            : 'Chọn gói boost cho tin tuyển dụng'
        }
        onClose={() => {
          setBoostModalOpen(false);
          setSelectedBoostJob(null);
        }}
        onConfirm={handleBoostCheckout}
        confirmLabel={
          createBoostCheckoutMutation.isPending ? 'Đang xử lý...' : 'Thanh toán'
        }
        cancelLabel="Hủy"
        confirmDisabled={createBoostCheckoutMutation.isPending}
      >
        <div className="space-y-4 mt-4">
          <label className="flex items-start gap-4 p-4 rounded-xl border border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
            <input
              type="radio"
              name="pkg"
              checked={selectedBoostPackageDays === 7}
              onChange={() => setSelectedBoostPackageDays(7)}
              className="mt-1 w-4 h-4 text-primary"
            />
            <div>
              <p className="font-bold text-primary">Gói Đẩy Top 7 ngày 🔥</p>
              <p className="text-sm text-slate-600 mt-1">
                Hiển thị nổi bật trên trang chủ và đầu kết quả tìm kiếm.
              </p>
              <p className="font-bold text-slate-800 mt-2">100.000đ</p>
            </div>
          </label>
          <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="radio"
              name="pkg"
              checked={selectedBoostPackageDays === 30}
              onChange={() => setSelectedBoostPackageDays(30)}
              className="mt-1 w-4 h-4"
            />
            <div>
              <p className="font-bold text-slate-700">Gói Đẩy Top 30 ngày ⭐</p>
              <p className="text-sm text-slate-600 mt-1">
                Tiết kiệm hơn 30% so với gói tuần.
              </p>
              <p className="font-bold text-slate-800 mt-2">300.000đ</p>
            </div>
          </label>
        </div>
      </Modal>

      <MatchedWorkersModal
        jobId={matchedJobId}
        onClose={() => setMatchedJobId(null)}
      />
    </DashboardLayout>
  );
};

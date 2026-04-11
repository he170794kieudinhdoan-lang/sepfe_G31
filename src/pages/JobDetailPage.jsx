import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MSG } from '@/shared/constants/messages';
import { useJobDetail, useRelatedJobs, useMyApplications } from '@/features/jobs/api/useJobs';
import { JobDetailHeader } from '@/features/jobs/components/JobDetailHeader';
import { RelatedJobList } from '@/features/jobs/components/RelatedJobList';
import { ApplyJobModal } from '@/features/jobs/components/ApplyJobModal';
import { ReportJobModal } from '@/features/jobs/components/ReportJobModal';
import { CompanyInfo } from '@/features/jobs/components/CompanyInfo';
import { JobDetailContent } from '@/features/jobs/components/JobDetailContent';
import { Card } from '@/components/ui/card';
import { JobDetailSkeleton } from '@/features/jobs/components/JobDetailSkeleton';
import { JobCardHorizontalSkeleton } from '@/features/jobs/components/JobCardHorizontalSkeleton';
import { SearchX, ArrowLeft, ClipboardList } from 'lucide-react';
import { useGetOrCreateConversation } from '@/features/chat/api/useChat';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useGetWorkerProfile } from '@/features/users/api/useUser';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// Các trường bắt buộc để coi profile là "đầy đủ"
const isWorkerProfileComplete = (profile) => {
  if (!profile) return false;
  return !!(
    profile.occupationId &&
    profile.shift &&
    profile.province &&
    profile.ward &&
    profile.gender
  );
};

export const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: job, isLoading, isError } = useJobDetail(id);
  const applicantCount =
    Number(job?._count?.applications ?? job?.applications?.length ?? 0) || 0;

  const hasReported = false;

  const { data: relatedJobs, isLoading: isRelatedLoading } = useRelatedJobs(id);
  const { mutate: createConversation } = useGetOrCreateConversation();
  const { isAuthenticated, user } = useAuth();

  const isWorker = user?.role === 'WORKER';

  // Chỉ fetch worker profile khi user đã đăng nhập và là WORKER
  const { data: workerProfile } = useGetWorkerProfile({
    enabled: isAuthenticated && isWorker,
  });

  const { data: myApplications } = useMyApplications({ enabled: isAuthenticated && isWorker });
  const hasApplied =
    isWorker &&
    Array.isArray(myApplications) &&
    myApplications.some((app) => String(app.jobId) === String(id));

  const profileComplete = isWorkerProfileComplete(workerProfile);

  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [incompleteProfileOpen, setIncompleteProfileOpen] = useState(false);

  const handleCreateConversation = (companyOwnerId) => {
    createConversation({ participantId: companyOwnerId });
  };

  const handleApplyClick = () => {
    // Chưa đăng nhập → nhắc đăng nhập
    if (!isAuthenticated) {
      setLoginPromptOpen(true);
      return;
    }
    // Đã đăng nhập nhưng không phải WORKER → không làm gì (nút đã bị ẩn ở JobActions)
    if (!isWorker) return;
    // Là WORKER nhưng profile chưa đầy đủ → nhắc hoàn thiện profile
    if (!profileComplete) {
      setIncompleteProfileOpen(true);
      return;
    }
    // Đủ điều kiện → mở modal ứng tuyển
    setApplyOpen(true);
  };

  if (isLoading) {
    return <JobDetailSkeleton />;
  }

  if (isError || !job) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <SearchX className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
          {MSG.MSG_JOB_NOT_FOUND}
        </h1>
        <p className="text-slate-500 max-w-md mb-8 leading-relaxed font-medium">
          Rất tiếc, công việc bạn đang tìm kiếm không tồn tại hoặc đã hết hạn
          tuyển dụng. Vui lòng quay lại trang danh sách để tìm các cơ hội khác.
        </p>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="rounded-xl px-6 h-12 font-semibold transition-all hover:bg-slate-50"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <Button
            className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/25"
            asChild
          >
            <Link to="/">Về trang chủ</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <JobDetailHeader job={job} onApply={handleApplyClick} hasApplied={hasApplied} />
        </div>

        <div className="lg:col-span-1 lg:row-span-2">
          <CompanyInfo
            job={job}
            company={job.company}
            handleCreateConversation={handleCreateConversation}
          />
        </div>

        <div className="lg:col-span-2">
          <Card className="flex flex-col gap-6 border-0 p-8 shadow-sm rounded-xl">
            <div className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {applicantCount} người đã ứng tuyển
            </div>

            <JobDetailContent
              job={job}
              onApply={handleApplyClick}
              onReport={() => setReportOpen(true)}
              hasApplied={hasApplied}
            />

            <h2 className="text-lg font-semibold ">Việc làm liên quan</h2>
            {isRelatedLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <JobCardHorizontalSkeleton key={i} />
                ))}
              </div>
            ) : (
              <RelatedJobList jobs={relatedJobs || []} />
            )}
          </Card>
        </div>
      </div>

      <ApplyJobModal open={applyOpen} onClose={() => setApplyOpen(false)} jobId={id} jobTitle={job?.title} />

      <ReportJobModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        hasReported={hasReported}
        jobId={id}
      />

      {/* Popup: chưa đăng nhập */}
      <Dialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yêu cầu đăng nhập</DialogTitle>
            <DialogDescription>
              Vui lòng đăng nhập để ứng tuyển công việc này và mở khóa các tính năng khác trên hệ thống.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setLoginPromptOpen(false)}>Hủy</Button>
            <Button asChild>
              <Link to="/auth/login" state={{ from: `/job/${id}` }}>Đến trang đăng nhập</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup: profile chưa đầy đủ */}
      <Dialog open={incompleteProfileOpen} onOpenChange={setIncompleteProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
                <ClipboardList className="h-5 w-5 text-orange-500" />
              </div>
              <DialogTitle>Hồ sơ chưa đầy đủ</DialogTitle>
            </div>
            <DialogDescription className="pt-1">
              Bạn cần hoàn thiện hồ sơ cá nhân trước khi ứng tuyển. Vui lòng điền đầy đủ các thông tin:{' '}
              <span className="font-medium text-foreground">
                nghề nghiệp, ca làm việc, tỉnh/thành, phường/xã và giới tính
              </span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setIncompleteProfileOpen(false)}>
              Để sau
            </Button>
            <Button
              onClick={() => {
                setIncompleteProfileOpen(false);
                navigate(workerProfile ? '/profile' : '/worker/setup-profile');
              }}
            >
              Hoàn thiện hồ sơ ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

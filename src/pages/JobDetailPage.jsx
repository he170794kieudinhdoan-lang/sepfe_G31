import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MSG } from '@/shared/constants/messages';
import { useJobDetail, useRelatedJobs } from '@/features/jobs/api/useJobs';
import { JobDetailHeader } from '@/features/jobs/components/JobDetailHeader';
import { RelatedJobList } from '@/features/jobs/components/RelatedJobList';
import { ApplyJobModal } from '@/features/jobs/components/ApplyJobModal';
import { ReportJobModal } from '@/features/jobs/components/ReportJobModal';
import { CompanyInfo } from '@/features/jobs/components/CompanyInfo';
import { JobDetailContent } from '@/features/jobs/components/JobDetailContent';
import { Card } from '@/components/ui/card';

import { JobDetailSkeleton } from '@/features/jobs/components/JobDetailSkeleton';
import { JobCardHorizontalSkeleton } from '@/features/jobs/components/JobCardHorizontalSkeleton';
import { SearchX, ArrowLeft, User, Users, CircleUser } from 'lucide-react';
import { useGetOrCreateConversation } from '@/features/chat/api/useChat';
import { useAuth } from '@/shared/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: job, isLoading, isError } = useJobDetail(id);

  // TODO: Khi integrate auth, thay bằng const { user } = useAuth();
  const hasApplied = false;
  const hasReported = false;

  const { data: relatedJobs, isLoading: isRelatedLoading } = useRelatedJobs(id);
  const { mutate: createConversation } = useGetOrCreateConversation();
  const { isAuthenticated } = useAuth();

  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  const handleCreateConversation = (companyOwnerId) => {
    createConversation({ participantId: companyOwnerId });
  };

  const handleApplyClick = () => {
    if (isAuthenticated) {
      setApplyOpen(true);
    } else {
      setLoginPromptOpen(true);
    }
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
          <JobDetailHeader job={job} onApply={handleApplyClick} />
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
            <JobDetailContent
              job={job}
              onApply={handleApplyClick}
              onReport={() => setReportOpen(true)}
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

      <ApplyJobModal open={applyOpen} onClose={() => setApplyOpen(false)} jobId={id} />

      <ReportJobModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        hasReported={hasReported}
        jobId={id}
      />

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
    </>
  );
};

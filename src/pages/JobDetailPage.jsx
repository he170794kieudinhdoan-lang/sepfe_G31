import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MSG } from '@/shared/constants/messages';
import { useJobDetail } from '@/features/jobs/api/useJobs';
import { getRelatedJobs } from '@/shared/data/mockJobs';
import { JobDetailHeader } from '@/features/jobs/components/JobDetailHeader';
import { RelatedJobList } from '@/features/jobs/components/RelatedJobList';
import { ApplyJobModal } from '@/features/jobs/components/ApplyJobModal';
import { ReportJobModal } from '@/features/jobs/components/ReportJobModal';
import { CompanyInfo } from '@/features/jobs/components/CompanyInfo';
import { JobDetailContent } from '@/features/jobs/components/JobDetailContent';
import { Card } from '@/components/ui/card';
import { Container } from '@/shared/components/Container';

export const JobDetailPage = () => {
  const { id } = useParams();
  const { data: job, isLoading, isError } = useJobDetail(id);

  // TODO: Khi integrate auth, thay bằng const { user } = useAuth();
  const isGuest = false;
  const isWorker = true;
  const hasApplied = false;
  const hasReported = false;

  // TODO: Khi có API related jobs, thay bằng useRelatedJobs(id)
  const relatedJobs = getRelatedJobs(id);

  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  if (isLoading) {
    return (
      <Container className="py-16 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </Container>
    );
  }

  if (isError || !job) {
    return (
      <Container className="py-16 text-center">
        <h1 className="text-2xl font-bold text-destructive">
          {MSG.MSG_JOB_NOT_FOUND}
        </h1>
        <Button className="mt-4 rounded-xl" asChild>
          <Link to="/">Về trang chủ</Link>
        </Button>
      </Container>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <JobDetailHeader job={job} onApply={() => setApplyOpen(true)} />
          </div>

          <div className="lg:col-span-1 lg:row-span-2">
            <CompanyInfo company={job.company} />
          </div>

          <div className="lg:col-span-2">
            <Card className="flex flex-col gap-6 border-0 p-8 shadow-sm rounded-xl">
              <JobDetailContent
                job={job}
                onApply={() => setApplyOpen(true)}
                onReport={() => setReportOpen(true)}
              />

              <h2 className="text-lg font-semibold ">Việc làm liên quan</h2>
              <RelatedJobList jobs={relatedJobs} />
            </Card>
          </div>
        </div>
      </Container>

      <ApplyJobModal open={applyOpen} onClose={() => setApplyOpen(false)} />

      <ReportJobModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        hasReported={hasReported}
      />
    </div>
  );
};

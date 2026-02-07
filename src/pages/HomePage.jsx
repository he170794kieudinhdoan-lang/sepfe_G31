import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorToast } from '@/shared/components/ErrorToast';
import { MapPin, Timer, Wallet, Sparkles } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { MOCK_JOBS, getFeaturedJobs, getRegularJobs, HERO_IMAGE } from '@/shared/data/mockJobs';
import { MSG } from '@/shared/constants/messages';

const JobCard = ({ job, featured, aiSuggest }) => (
  <Card className="p-0 shadow-sm hover:shadow-md transition rounded-xl overflow-hidden border-0">
    {job.imageUrl ? (
      <ImageWithFallback
        src={job.imageUrl}
        alt=""
        className="w-full h-36 object-cover"
        fallbackClassName="h-36 w-full bg-gradient-to-br from-amber-100 to-amber-50"
      />
    ) : null}
    <div className="p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold">{job.title}</h3>
        <p className="text-sm text-muted-foreground">{job.company}</p>
      </div>
      <div className="flex gap-1 flex-wrap justify-end">
        {featured ? <Badge className="bg-primary/20 text-primary rounded-lg border-0">Nổi bật</Badge> : null}
        {aiSuggest ? <Badge className="bg-violet-100 text-violet-700 rounded-lg border-0">AI Suggest</Badge> : null}
      </div>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 shrink-0" /> {job.location}
      </div>
      <div className="flex items-center gap-2">
        <Wallet className="h-4 w-4 shrink-0" /> {job.salary}
      </div>
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4 shrink-0" /> {job.shift}
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-lg bg-amber-100/80 px-2 py-0.5 text-xs font-medium text-amber-800">
          {job.status || 'Đang tuyển'}
        </span>
      </div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      {(job.tags || []).map((tag) => (
        <span key={tag} className="text-xs rounded-full bg-gray-100 px-3 py-1">
          {tag}
        </span>
      ))}
    </div>
    <div className="mt-5 flex items-center justify-between">
      <Button variant="outline" className="rounded-xl" asChild>
        <Link to={`/job/${job.id}`}>Xem chi tiết</Link>
      </Button>
      <span className="text-xs text-muted-foreground">{job.updated}</span>
    </div>
    </div>
  </Card>
);

export const HomePage = () => {
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const isLoading = false;
  const isError = false;
  const isWorker = true;
  const isProfileComplete = false;

  const featuredJobs = useMemo(() => getFeaturedJobs(), []);
  const regularJobs = useMemo(() => {
    const list = getRegularJobs();
    return sort === 'salary' ? [...list].sort((a, b) => (b.salary > a.salary ? 1 : -1)) : list;
  }, [sort]);
  const recommendedJobs = useMemo(
    () => (isProfileComplete ? MOCK_JOBS.filter((j) => j.id !== 1).slice(0, 2) : []),
    [isProfileComplete]
  );

  const perPage = 4;
  const totalPages = Math.ceil(regularJobs.length / perPage) || 1;
  const paginatedJobs = regularJobs.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bg-gray-50 min-h-full">
      {isError && <ErrorToast message={MSG.MSG21} />}

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-amber-50/30 to-white">
        <div className="container mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <Badge className="bg-primary/20 text-primary border-primary/30 w-fit rounded-lg">
              WorkLink tuyển dụng nhanh
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
              Tìm việc nhanh – thông tin rõ ràng
            </h1>
            <p className="text-lg text-muted-foreground">
              Lương, ca làm, phụ cấp, địa điểm.
            </p>
            <Button className="rounded-xl px-6" asChild>
              <Link to="#jobs">Xem việc làm</Link>
            </Button>
          </div>
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-md aspect-video bg-gray-100">
              <ImageWithFallback
                src={HERO_IMAGE}
                alt="Tìm việc làm - WorkLink"
                className="w-full h-full object-cover"
                fallbackClassName="w-full h-full bg-gradient-to-br from-amber-100 to-amber-50"
              />
            </div>
            <Card className="p-6 shadow-sm rounded-xl border-0">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Tin tuyển dụng nổi bật</h3>
                <p className="text-sm text-muted-foreground">Cập nhật mỗi ngày</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {isLoading
                ? Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                  ))
                : featuredJobs.slice(0, 2).map((job) => (
                    <Link
                      key={job.id}
                      to={`/job/${job.id}`}
                      className="flex items-center justify-between rounded-xl p-4 shadow-sm bg-white/80 hover:bg-white hover:shadow-md transition"
                    >
                      <div>
                        <p className="font-semibold">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                      <Badge className="bg-primary/20 text-primary rounded-lg border-0">
                        Nổi bật
                      </Badge>
                    </Link>
                  ))}
            </div>
            </Card>
          </div>
        </div>
      </section>

      <section id="jobs" className="container mx-auto px-6 py-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Job nổi bật</h2>
        </div>
        {featuredJobs.length === 0 ? (
          <EmptyState
            title="Chưa có job nổi bật"
            description={MSG.MSG21}
            actionLabel="Xem việc làm"
          />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} featured />
            ))}
          </div>
        )}
      </section>

      <section className="container mx-auto px-6 pb-16 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-2xl font-bold">Danh sách job thường</h2>
          <div className="flex flex-wrap gap-2 items-center">
            {['Khu vực', 'Mức lương', 'Ca làm', 'Ngành nghề'].map((chip) => (
              <Button key={chip} variant="outline" className="rounded-xl text-sm">
                {chip}
              </Button>
            ))}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl px-4 py-2 text-sm bg-white shadow-sm"
            >
              <option value="newest">Mới nhất</option>
              <option value="salary">Lương cao</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {paginatedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={page === p ? 'default' : 'outline'}
              className="rounded-xl h-9 w-9 p-0"
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
        </div>

        {isWorker &&
          (isProfileComplete ? (
            <Card className="p-6 bg-primary/5 rounded-xl border-0 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Gợi ý phù hợp cho bạn (AI)</h3>
                  <p className="text-sm text-muted-foreground">
                    Dựa trên hồ sơ và khu vực bạn quan tâm.
                  </p>
                </div>
                <Button variant="outline" className="rounded-xl">
                  Lọc thêm
                </Button>
              </div>
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                {recommendedJobs.map((job) => (
                  <JobCard key={job.id} job={job} aiSuggest />
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-6 rounded-xl border-0 shadow-sm bg-white/90">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Hoàn thiện hồ sơ để nhận gợi ý</h3>
                  <p className="text-sm text-muted-foreground">
                    Cập nhật kỹ năng và kinh nghiệm để AI gợi ý chính xác hơn.
                  </p>
                </div>
                <Button className="rounded-xl" asChild>
                  <Link to="/profile">Cập nhật hồ sơ</Link>
                </Button>
              </div>
            </Card>
          ))}
      </section>
    </div>
  );
};

import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/shared/components/EmptyState';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useToast } from '@/shared/contexts/ToastContext';
import {
  MapPin,
  Trash2,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useWishlist, useUnsaveJob } from '@/features/jobs/api/useWishlist';
import { isWorkerRole } from '@/shared/utils/userRole';

export const WishlistPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const canUseWishlist = isAuthenticated && isWorkerRole(user);

  const { data: qsData, isLoading: isWishlistLoading } = useWishlist(
    { page, limit: 10 },
    { enabled: canUseWishlist },
  );

  const unsaveJobMutation = useUnsaveJob();

  const remove = (jobId) => {
    unsaveJobMutation.mutate(jobId, {
      onSuccess: () => {
        toast('Đã bỏ lưu công việc.');
        if (list.length === 1 && page > 1) {
          setPage((p) => p - 1);
        }
      },
      onError: (error) => {
        toast('Xóa thất bại. Vui lòng thử lại.');
        console.error(error);
      },
    });
  };

  if (authLoading || (canUseWishlist && isWishlistLoading)) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated && user && !isWorkerRole(user)) {
    return <Navigate to="/" replace />;
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 min-h-full py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Việc làm đã lưu</h1>
          <EmptyState
            title="Bạn chưa đăng nhập"
            description="Đăng nhập để xem danh sách công việc đã lưu."
            actionLabel="Đăng nhập ngay"
            actionLink="/auth/login"
          />
        </div>
      </div>
    );
  }

  const list = qsData?.items || [];
  const totalPages = qsData?.meta?.totalPage || 1;

  if (list.length === 0) {
    return (
      <div className="bg-[#fbfa\f9] min-h-full py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Việc làm đã lưu
            </h1>
          </div>
          <EmptyState
            title="Chưa có việc làm nào được lưu"
            description="Không tìm thấy việc làm trong danh sách đã lưu của bạn."
            actionLabel="Xem việc làm bổ sung"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfaf9] min-h-[calc(100vh-64px)] py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Việc làm đã lưu</h1>
        </div>

        <div className="space-y-4">
          {list.map((item) => {
            const job = item.job || {};
            const company = job.company || {};
            const locationStr = job.province
              ? `${job.district ? job.district + ', ' : ''}${job.province}`
              : 'Toàn quốc';

            const formatMoney = (number) =>
              number ? number.toLocaleString('vi-VN') + ' đ' : null;
            const salaryStr =
              job.salaryMin && job.salaryMax
                ? `${formatMoney(job.salaryMin)} - ${formatMoney(job.salaryMax)}`
                : job.salaryMax
                  ? formatMoney(job.salaryMax)
                  : 'Thỏa thuận';

            return (
              <Card
                key={item.id}
                className="group p-4 rounded-2xl shadow-sm border border-gray-100 bg-white flex flex-col sm:flex-row gap-4 hover:shadow-md hover:border-primary/40 transition-all duration-300"
              >
                {company.logoUrl ? (
                  <div className="w-full sm:w-20 h-24 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-gray-100 p-1.5 shadow-sm bg-white group-hover:border-primary/20 transition-colors">
                    <ImageWithFallback
                      src={company.logoUrl}
                      alt={company.name}
                      className="w-full h-full object-contain"
                      fallbackClassName="w-full h-full bg-primary/5"
                    />
                  </div>
                ) : (
                  <div className="w-full sm:w-20 h-24 sm:h-20 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                    <span className="text-primary font-bold text-xl">
                      {company.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="font-bold text-base text-gray-900 line-clamp-1 group-hover:text-primary transition-colors cursor-pointer block">
                    <Link to={`/job/${job.id}`}>{job.title}</Link>
                  </h3>
                  <p className="text-sm font-medium text-gray-600 line-clamp-1 mt-0.5">
                    {company.name}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                      <MapPin className="h-3.5 w-3.5 text-primary" />{' '}
                      {locationStr}
                    </span>
                    <span className="flex items-center gap-1.5 bg-primary/5 text-primary px-2 py-1 rounded-md font-medium">
                      <Wallet className="h-3.5 w-3.5" /> {salaryStr}
                    </span>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-center gap-2 shrink-0 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full flex-1 sm:flex-none h-8 px-4 text-xs font-medium hover:border-primary hover:text-primary transition-colors"
                      asChild
                    >
                      <Link to={`/job/${job.id}`}>Chi tiết</Link>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="rounded-full flex-1 sm:flex-none h-8 px-4 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-sm transition-transform active:scale-95"
                      asChild
                    >
                      <Link to={`/job/${job.id}`}>Ứng tuyển</Link>
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full h-8 px-3 w-full sm:w-auto text-gray-400 hover:bg-amber-50 hover:text-amber-500 transition-colors"
                    onClick={() => remove(job.id)}
                    disabled={
                      unsaveJobMutation.isPending &&
                      unsaveJobMutation.variables != null &&
                      (unsaveJobMutation.variables === job.id ||
                        String(unsaveJobMutation.variables) ===
                          String(job.id))
                    }
                    title="Bỏ lưu"
                  >
                    {unsaveJobMutation.isPending &&
                    unsaveJobMutation.variables != null &&
                    (unsaveJobMutation.variables === job.id ||
                      String(unsaveJobMutation.variables) ===
                        String(job.id)) ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs">
                        <Trash2 className="h-3.5 w-3.5" />{' '}
                        <span className="sm:hidden">Xóa khỏi danh sách</span>
                      </span>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-200 hover:border-primary hover:text-primary transition-colors"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center px-4 h-10 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium">
              <span className="text-primary mr-1">{page}</span> /{' '}
              <span className="text-gray-500 ml-1">{totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-200 hover:border-primary hover:text-primary transition-colors"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

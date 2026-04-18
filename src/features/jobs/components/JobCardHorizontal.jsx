import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Badge } from '@/components/ui/badge';
import { formatSalary } from '@/shared/utils/salaryUtils';
import { formatRelativeTime } from '@/shared/utils/dateUtils';

export const JobCardHorizontal = ({ job }) => {
  return (
    <Link to={`/job/${job.id}`} className="group">
      <Card className="p-4 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border-0 flex gap-4">
        {job.company?.logoUrl && (
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg">
            <ImageWithFallback
              src={job.company?.logoUrl}
              alt={job.title}
              className="h-full w-full object-cover"
              fallbackClassName="h-full w-full bg-gradient-to-br from-primary/10 to-primary/5"
            />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div
            className={`flex items-start gap-2 ${job.isBoosted ? 'justify-between' : 'justify-end'}`}
          >
            {job.isBoosted && (
              <Badge
                variant="default"
                className="shrink-0 rounded-lg border border-[#FDE047]/90 bg-[#FEF08A] px-3 py-1 text-[11px] font-bold text-slate-900 shadow-sm hover:bg-[#FDE68A]"
              >
                NỔI BẬT
              </Badge>
            )}
            <div className="text-sm font-bold text-primary ">
              {formatSalary(job.salaryMin, job.salaryMax, 'compact')}
            </div>
          </div>

          {/* Core content */}
          <div className="space-y-1">
            <p className="w-[90%] font-medium text-lg line-clamp-2 leading-snug">
              {job.title}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {job.company?.name || 'Công ty ẩn'}
            </p>
          </div>

          {/* Bottom meta row */}
          <div className="flex justify-between items-center text-xs">
            <Badge variant="outline" className="font-normal text-[10px]">
              {job.province || 'Toàn quốc'}
            </Badge>
            <div className="text-muted-foreground capitalize">
              Cập nhật {formatRelativeTime(job.updatedAt)}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

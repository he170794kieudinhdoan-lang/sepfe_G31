import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { formatSalary } from '@/shared/utils/salaryUtils';

export const JobCardHorizontal = ({ job }) => {
  return (
    <Link to={`/job/${job.id}`} className="group">
      <Card className="p-4 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border-0 flex gap-4">
        {job.company?.logoUrl && (
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-100 p-1">
            <ImageWithFallback
              src={job.company.logoUrl}
              alt={job.title}
              className="h-full w-full object-contain"
              fallbackClassName="h-full w-full bg-slate-50 flex items-center justify-center text-[10px] text-slate-400"
            />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div className="flex justify-between items-start gap-2">
            <div>
              {job.isFeatured && (
                <Badge
                  variant="default"
                  className="bg-rose-600 hover:bg-rose-700 text-white border-0 gap-1.5 px-3 py-1 text-[11px] font-bold rounded-lg shrink-0 shadow-sm shadow-rose-200"
                >
                  <Sparkles className="h-3.5 w-3.5 fill-white/20 animate-pulse text-rose-100" />
                  NỔI BẬT
                </Badge>
              )}
            </div>
            <div className="text-sm font-bold text-primary">
              {formatSalary(job.salaryMin, job.salaryMax, 'compact')}
            </div>
          </div>

          {/* Core content */}
          <div className="space-y-1">
            <h3 className="font-semibold text-lg line-clamp-2 leading-snug group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {job.company?.name || job.companyName}
            </p>
          </div>

          {/* Bottom meta row */}
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-normal text-[10px]">
                {job.province || job.location}
              </Badge>
              {job.workingShift && (
                <span className="text-muted-foreground">
                  • {job.workingShift}
                </span>
              )}
            </div>
            <div className="text-muted-foreground">
              {job.updatedAt ? `Cập nhật ${job.updatedAt}` : ''}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

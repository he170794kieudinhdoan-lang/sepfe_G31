import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatSalary } from '@/shared/utils/salaryUtils';

export const JobCard = ({ job, featured, aiSuggest }) => {
  if (!job) return null;

  return (
    <Card className="group relative p-4 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl border border-slate-100 bg-white">
      <div className="flex gap-4">
        {/* Logo Section */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
          <ImageWithFallback
            src={job.logoUrl || job.company?.logoUrl}
            alt={job.companyName || job.company?.name || 'Company'}
            className="h-full w-full object-contain"
            fallbackClassName="h-full w-full flex items-center justify-center text-[10px] text-slate-400 text-center p-1"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              <p className="text-xs font-medium text-slate-500 line-clamp-1 mt-0.5">
                {job.companyName || job.company?.name || 'Công ty ẩn'}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              {featured && (
                <Badge className="bg-primary-muted text-primary hover:bg-primary-hover/10 border-0 text-[10px] px-1.5 py-0 font-bold uppercase tracking-wider">
                  Mới
                </Badge>
              )}
              {aiSuggest && (
                <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-0 text-[9px] px-1.5 py-0 font-bold uppercase tracking-wider">
                  AI
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px]">
            <div className="flex items-center gap-1 font-semibold">
              <span className="text-slate-500">Lên tới</span>
              <span className="text-primary font-bold">
                {formatSalary(job.salaryMin, job.salaryMax, 'full')}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[120px]">
                {job.province || job.address || job.location || 'Toàn quốc'}
              </span>
            </div>
          </div>

          {job.tags && job.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {job.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-bold bg-primary-muted text-primary px-2.5 py-0.5 rounded-lg border border-primary/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <Link
        to={`/job/${job.id}`}
        className="absolute inset-0 z-10"
        aria-label={`Xem chi tiết ${job.title}`}
      />
    </Card>
  );
};

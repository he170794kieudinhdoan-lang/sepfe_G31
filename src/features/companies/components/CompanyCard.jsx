import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Star, MapPin, Briefcase } from 'lucide-react';

export const CompanyCard = ({ company }) => {
  const jobCount = company?._count?.jobs || company?.jobCount || 0;

  return (
    <Link
      to={`/company/${company.id}`}
      className="block h-full outline-none"
    >
      <Card className="group h-full relative p-5 rounded-[20px] overflow-hidden border border-slate-200/60 bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 flex flex-col">
        
        <div className="flex items-start gap-4 mb-4">
          <div className="h-[56px] w-[56px] shrink-0 overflow-hidden rounded-[14px] border border-slate-100 bg-white shadow-sm flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform duration-300">
            <ImageWithFallback
              src={company.logoUrl}
              alt={company.name}
              className="h-full w-full object-contain"
              fallbackClassName="h-full w-full bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 rounded-lg"
            />
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col items-start">
            <h3 className="font-bold text-[16px] text-slate-800 line-clamp-2 group-hover:text-primary transition-colors leading-snug text-left" title={company.name}>
              {company.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-[12px] font-medium">
              {company.reviewCount > 0 ? (
                <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100/50">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
                  {company.reviewAvg}
                </span>
              ) : (
                <span className="text-slate-400">Chưa đánh giá</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-[12px] text-slate-500 font-medium mb-4">
          {company.province && (
            <span className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate" title={company.province}>{company.province}</span>
            </span>
          )}
        </div>

        <div className="w-full mt-auto pt-4 border-t border-slate-100/60 flex items-center justify-between">
          {jobCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[12px] font-bold group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <Briefcase className="h-3.5 w-3.5" />
              {jobCount} việc làm
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-[12px] font-medium border border-slate-100">
              Chưa có việc làm
            </span>
          )}
          <span className="text-[12px] font-bold text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            Chi tiết →
          </span>
        </div>
      </Card>
    </Link>
  );
};

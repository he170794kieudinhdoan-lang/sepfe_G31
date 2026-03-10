import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { MapPin, Star } from 'lucide-react';

export const CompanyCard = ({ company }) => {
  return (
    <Link
      to={`/company/${company.id}`}
      className="block min-h-72 h-full group "
    >
      <Card className="p-4 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border-0 flex flex-col h-full bg-white ">
        <div className="flex gap-4 items-center xl:items-start mb-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-white">
            <ImageWithFallback
              src={company.logoUrl}
              alt={company.name}
              className="h-full w-full object-contain p-1"
              fallbackClassName="h-full w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-xs font-bold text-primary"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base line-clamp-2 text-slate-800 leading-snug group-hover:text-primary transition-colors">
              {company.name}
            </h3>
          </div>
        </div>

        {/* Description / Additional Info */}
        <div className="h-full line-clamp-9">
          <p className="text-sm text-muted-foreground ">
            {company.description ||
              'Công ty chưa cập nhật mô tả chi tiết. Vui lòng xem thêm thông tin tuyển dụng bên trong.'}
          </p>
        </div>

        {/* <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-50">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-700 text-sm">
              {company.rating}
            </span>
          </div>
        </div> */}
      </Card>
    </Link>
  );
};

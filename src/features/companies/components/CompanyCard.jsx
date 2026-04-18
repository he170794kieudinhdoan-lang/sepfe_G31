import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Star } from 'lucide-react';
import { truncateByWords } from '@/shared/utils/textTruncate';

/** Xem trước danh sách: tối đa ~200 từ (có thể chỉnh) + line-clamp để không vỡ layout */
const DESCRIPTION_PREVIEW_MAX_WORDS = 200;

export const CompanyCard = ({ company }) => {
  const fallbackDescription =
    'Công ty chưa cập nhật mô tả chi tiết. Vui lòng xem thêm thông tin tuyển dụng bên trong.';
  const descriptionPreview = company.description
    ? truncateByWords(company.description, DESCRIPTION_PREVIEW_MAX_WORDS)
    : fallbackDescription;

  return (
    <Link
      to={`/company/${company.id}`}
      className="block h-full group"
    >
      <Card className="p-4 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border-0 flex flex-col h-full bg-white">
        <div className="flex gap-3 items-start mb-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-white">
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
            {company.reviewCount > 0 ? (
              <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-600">
                <span className="inline-flex items-center gap-0.5 font-semibold text-amber-600">
                  <Star
                    className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
                    aria-hidden
                  />
                  {company.reviewAvg != null ? company.reviewAvg : '—'}
                </span>
                <span className="text-slate-400">
                  ({company.reviewCount} đánh giá)
                </span>
              </div>
            ) : (
              <p className="mt-1 text-xs text-slate-400">Chưa có đánh giá</p>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-6 leading-relaxed">
          {descriptionPreview}
        </p>

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

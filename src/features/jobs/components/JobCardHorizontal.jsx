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
        {job.imageUrl && (
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg">
            <ImageWithFallback
              src={job.imageUrl}
              alt={job.title}
              className="h-full w-full object-cover"
              fallbackClassName="h-full w-full bg-gradient-to-br from-primary/10 to-primary/5"
            />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div className="flex justify-between items-start gap-2">
            <Badge
              variant="default"
              className="bg-rose-600 hover:bg-rose-700 text-white border-0 gap-1.5 px-3 py-1 text-[11px] font-bold rounded-lg shrink-0 shadow-sm shadow-rose-200"
            >
              <Sparkles className="h-3.5 w-3.5 fill-white/20 animate-pulse text-rose-100" />
              NỔI BẬT
            </Badge>
            <div className="text-sm font-bold text-primary">
              {formatSalary(7000000, 20000000, 'compact')}
            </div>
          </div>

          {/* Core content */}
          <div className="space-y-1">
            <p className="w-[70%] font-medium text-lg line-clamp-2 leading-snug">
              Kế Toán Trưởng Bệnh Viện Mắt Quốc Tế Việt - Nga- (Thu Nhập 30-50
              Triệu)- Tại Hà Nội
            </p>
            <p className="text-xs text-muted-foreground truncate">
              CÔNG TY CỔ PHẦN VIỆN MẮT QUỐC TẾ VIỆT - NGA
            </p>
          </div>

          {/* Bottom meta row */}
          <div className="flex justify-between items-center text-xs">
            <Badge variant="outline" className="font-normal text-[10px]">
              Hà Nội
            </Badge>
            <div className="text-muted-foreground">Cập nhật 20 phút trước</div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

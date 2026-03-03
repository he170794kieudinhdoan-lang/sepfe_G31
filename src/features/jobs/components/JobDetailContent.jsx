import { Card } from '@/components/ui/card';
import { formatInVN } from '@/shared/utils/dateUtils';
import { JobAction } from './JobActions';
import { FileText, Info, Send } from 'lucide-react';

const Section = ({ title, children, icon: Icon }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-primary m-0 pb-2">
      {Icon && <Icon className="h-5 w-5" />}
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
    </div>
    <div className=" leading-relaxed whitespace-pre-line text-sm md:text-base">
      {children}
    </div>
  </div>
);

export const JobDetailContent = ({ job, onApply, onReport }) => {
  return (
    <div className="flex gap-4 flex-col">
      <Section title="Chi tiết tuyển dụng" icon={FileText}>
        {job?.description}
      </Section>

      <Section title="Cách thức ứng tuyển" icon={Send}>
        <p>
          Ứng viên nộp hồ sơ trực tuyến bằng cách bấm{' '}
          <span className="font-bold">Ứng tuyển</span> ngay dưới đây.
        </p>

        <div className="flex items-center gap-2 ">
          <span className="text-muted-foreground text-sm italic">
            Hạn nộp hồ sơ:
          </span>
          <span className="font-bold">{formatInVN(job.expiredAt)}</span>
        </div>
      </Section>

      <JobAction job={job} onApply={onApply} className="py-2" />

      <div className="flex items-start gap-3 p-4 bg-orange-50/50 border border-orange-100 rounded-xl text-sm transition-all duration-300">
        <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
        <p className="text-muted-foreground leading-relaxed">
          <span className="font-semibold text-orange-700">
            Báo cáo tin tuyển dụng:
          </span>{' '}
          Nếu bạn thấy rằng tin tuyển dụng này không chính xác hoặc có dấu hiệu
          lừa đảo,{' '}
          <button
            onClick={onReport}
            className="text-primary font-bold hover:underline underline-offset-4 cursor-pointer transition-all"
          >
            hãy phản ánh với chúng tôi.
          </button>
        </p>
      </div>
    </div>
  );
};

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Wallet, Clock } from 'lucide-react';
import { formatInVN, getDaysLeft } from '@/shared/utils/dateUtils';
import { SHIFTS } from '@/shared/constants/enums';
import { formatSalary } from '@/shared/utils/salaryUtils';
import { JobAction } from './JobActions';

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  </div>
);

export const JobDetailHeader = ({ job, onApply, onSave }) => {
  console.log(job);

  const salaryDisplay = formatSalary(job.salaryMin, job.salaryMax, 'full');
  const shiftDisplay =
    SHIFTS.find((s) => s.value === job.workingShift)?.label || 'Không yêu cầu';
  const locationDisplay = [job.district, job.province]
    .filter(Boolean)
    .join(', ');
  return (
    <>
      <Card className="flex flex-col gap-6 border-0 p-6 shadow-sm rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold lg:text-3xl">{job.title}</h1>
          <Badge className="rounded-lg">{job.status}</Badge>
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-4 justify-between">
          <InfoItem
            icon={<Wallet className="h-5 w-5" />}
            label="Mức lương"
            value={salaryDisplay}
          />
          <InfoItem
            icon={<MapPin className="h-5 w-5" />}
            label="Địa điểm"
            value={locationDisplay}
          />
          <InfoItem
            icon={<Clock className="h-5 w-5" />}
            label="Ca làm"
            value={shiftDisplay}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 ">
            <span className="text-muted-foreground text-sm italic">
              Ngành nghề:
            </span>
            <span className="font-bold">{job.occupation.name}</span>
          </div>
          <span className="text-sm">
            <span className="text-muted-foreground mr-1">Hạn nộp hồ sơ:</span>
            <span className="font-semibold">{formatInVN(job.expiredAt)}</span>
            <span className="mx-2 text-slate-300">|</span>
            <span className="font-semibold">
              Còn {getDaysLeft(job.expiredAt)} ngày
            </span>
          </span>
        </div>

        <JobAction job={job} fullWidth onApply={onApply} onSave={onSave} />
      </Card>
    </>
  );
};

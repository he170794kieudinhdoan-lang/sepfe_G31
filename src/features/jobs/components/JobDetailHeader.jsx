import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Wallet, Clock, User, Users, CircleUser } from 'lucide-react';
import { formatInVN, getDaysLeft } from '@/shared/utils/dateUtils';
import { GENDERS, SHIFTS } from '@/shared/constants/enums';
import { formatSalary } from '@/shared/utils/salaryUtils';
import { JobAction } from './JobActions';

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  </div>
);

const CompactInfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-primary">{icon}</div>
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  </div>
);

export const JobDetailHeader = ({ job, onApply, onSave }) => {
  const salaryDisplay = formatSalary(job.salaryMin, job.salaryMax, 'full');

  const ageDisplay =
    job.ageMin && job.ageMax
      ? `${job.ageMin} - ${job.ageMax} tuổi`
      : job.ageMin
        ? `Trên ${job.ageMin} tuổi`
        : job.ageMax
          ? `Dưới ${job.ageMax} tuổi`
          : 'Không yêu cầu';

  const shiftDisplay =
    SHIFTS.find((s) => s.value === job.workingShift)?.label || 'Không yêu cầu';

  const genderDisplay =
    GENDERS.find((g) => g.value === job.genderRequirement)?.label ||
    'Không yêu cầu';

  return (
    <>
      <Card className="flex flex-col gap-6 border-0 p-6 shadow-sm rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold lg:text-3xl">{job.title}</h1>
          <Badge className="rounded-lg">{job.status}</Badge>
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-4">
          <InfoItem
            icon={<Wallet className="h-5 w-5" />}
            label="Mức lương"
            value={salaryDisplay}
          />
          <InfoItem
            icon={<MapPin className="h-5 w-5" />}
            label="Địa điểm"
            value={job.address}
          />
          <InfoItem
            icon={<Clock className="h-5 w-5" />}
            label="Ca làm"
            value={shiftDisplay}
          />
        </div>

        <Card className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-primary/5 border-0">
          <div className="flex sm:justify-center">
            <CompactInfoItem
              icon={<User className="h-4 w-4" />}
              label="Độ tuổi"
              value={ageDisplay}
            />
          </div>
          <div className="flex sm:justify-center border-y sm:border-y-0 sm:border-x border-slate-200/60 py-4 sm:py-0 px-0 sm:px-4">
            <CompactInfoItem
              icon={<Users className="h-4 w-4" />}
              label="Số lượng"
              value={job.quantity || 'Không giới hạn'}
            />
          </div>
          <div className="flex sm:justify-center">
            <CompactInfoItem
              icon={<CircleUser className="h-4 w-4" />}
              label="Giới tính"
              value={genderDisplay}
            />
          </div>
        </Card>

        <span className="text-sm">
          <span className="text-muted-foreground mr-1">Hạn nộp hồ sơ:</span>
          <span className="font-semibold">{formatInVN(job.expiredAt)}</span>
          <span className="mx-2 text-slate-300">|</span>
          <span className="font-semibold">
            Còn {getDaysLeft(job.expiredAt)} ngày
          </span>
        </span>

        <JobAction
          job={job}
          fullWidth
          onApply={onApply}
          onSave={onSave}
          className="pt-2"
        />
      </Card>
    </>
  );
};

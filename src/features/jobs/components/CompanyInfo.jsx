import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import {
  Building2,
  MapPin,
  Globe,
  ExternalLink,
  User,
  Users,
  CircleUser,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { GENDERS } from '@/shared/constants/enums';

const InfoItem = ({ icon, label, value, isLink }) => (
  <div className="group flex items-start gap-3 p-2 ">
    <div className="mt-1 flex items-start justify-center shrink-0">{icon}</div>
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 ">
      <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground w-20 shrink-0">
        {label}
      </span>
      {isLink ? (
        <div className="flex items-center gap-1  group/link ">
          <a
            href={value.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-foreground hover:underline underline-offset-4 transition-all "
          >
            {value}
          </a>
          <ExternalLink className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-y-0 group-hover/link:translate-x-0 transition-all duration-200" />
        </div>
      ) : (
        <span className="text-sm font-semibold text-foreground wrap-break-word">
          {value}
        </span>
      )}
    </div>
  </div>
);

const CompactInfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-primary bg-primary/15 p-3 rounded-full">
      {icon}
    </div>
    <div className="flex flex-col text-left">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  </div>
);

const CommonInfoJob = ({ job, className }) => {
  const ageDisplay =
    job.ageMin && job.ageMax
      ? `${job.ageMin} - ${job.ageMax} tuổi`
      : job.ageMin
        ? `Trên ${job.ageMin} tuổi`
        : job.ageMax
          ? `Dưới ${job.ageMax} tuổi`
          : 'Không yêu cầu';

  const genderDisplay =
    GENDERS.find((g) => g.value === job.genderRequirement)?.label ||
    'Không yêu cầu';

  return (
    <Card className={`flex flex-col justify-around py-6 p-6 ${className}`}>
      <CardTitle className={'text-lg mb-4'}>Thông tin chung</CardTitle>
      <div className="flex flex-col  text-center gap-1">
        <CompactInfoItem
          icon={<User className="h-5 w-5" />}
          label={'Độ Tuổi'}
          value={ageDisplay}
        />
      </div>

      <div className="flex flex-col my-4 text-center gap-1">
        <CompactInfoItem
          icon={<Users className="h-5 w-5" />}
          label={'Số lượng'}
          value={job.ageMin}
        />
      </div>

      <div className="flex flex-col  text-center gap-1">
        <CompactInfoItem
          icon={<CircleUser className="h-5 w-5" />}
          label={'Giới tính'}
          value={genderDisplay}
        />
      </div>
    </Card>
  );
};

export const CompanyInfo = ({ job, company, handleCreateConversation }) => {
  return (
    <div className="sticky top-24 space-y-3">
      <Card className="p-6 rounded-xl shadow-sm border-0">
        <div className="flex gap-4">
          {company.logoUrl ? (
            <div className="h-18 w-18 rounded-xl overflow-hidden shrink-0 bg-gray-100">
              <ImageWithFallback
                src={company.logoUrl}
                alt={company.logoUrl}
                className="w-full h-full object-cover"
                fallbackClassName="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xl line-clamp-2 wrap-break-word">
              {company.name}
            </p>
          </div>
        </div>
        <div className="flex-1">
          <InfoItem
            icon={<MapPin className="h-4 w-4 text-primary" />}
            label={'Địa điểm '}
            value={company.address}
          />
          <InfoItem
            icon={<Globe className="h-4 w-4 text-primary" />}
            label="Website"
            value={company.website || 'Chưa cập nhật'}
            isLink={!!company.website}
          />
        </div>

        <Button
          variant="outline"
          className="w-full rounded-xl py-5 mt-2 border-2 border-slate-100 font-semibold transition-all text-slate-600 "
        >
          Xem chi tiết công ty
          <ChevronRight className="h-4 w-4 mt-1 ml-2 transition-transform" />
        </Button>
      </Card>

      <Button
        className="w-full rounded-2xl py-7 text-lg transition-all duration-300 flex gap-3"
        onClick={() => handleCreateConversation(company.ownerId)}
      >
        <MessageSquare className="h-5 w-5" />
        Liên hệ ngay
      </Button>

      <CommonInfoJob job={job} className={'h-full'} />
    </div>
  );
};

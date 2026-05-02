import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetOccupations,
  useGetWorkerProfile,
  useUpdateWorkerProfile,
} from '@/features/users/api/useUser';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';
import { SHIFTS, GENDERS } from '@/shared/constants/enums';
import {
  Briefcase,
  User,
  Clock,
  DollarSign,
  Star,
  Loader2,
} from 'lucide-react';
import { useProvinces, useWards } from '@/shared/hooks/useProvinces';

const schema = z.object({
  occupationId: z
    .number({ required_error: 'Vui lòng chọn nghề nghiệp' })
    .min(1, 'Vui lòng chọn nghề nghiệp'),
  shift: z.string().min(1, 'Vui lòng chọn ca làm việc'),
  province: z.string().min(1, 'Vui lòng nhập địa điểm làm việc'),
  gender: z.string().min(1, 'Vui lòng chọn giới tính'),
  birthYear: z.preprocess(
    (val) =>
      val === '' ||
      val === null ||
      val === undefined ||
      Number.isNaN(Number(val))
        ? undefined
        : Number(val),
    z
      .number()
      .min(1900, 'Năm sinh không hợp lệ')
      .max(new Date().getFullYear(), 'Năm sinh không hợp lệ')
      .optional(),
  ),
  expectedSalary: z.preprocess(
    (val) =>
      val === '' ||
      val === null ||
      val === undefined ||
      Number.isNaN(Number(val))
        ? undefined
        : Number(val),
    z
      .number({ required_error: 'Vui lòng nhập mức lương mong muốn' })
      .min(1_000_000, 'Mức lương tối thiểu là 1,000,000 VNĐ')
      .max(100_000_000, 'Mức lương tối đa là 100,000,000 VNĐ'),
  ),
  experienceYear: z.preprocess(
    (val) =>
      val === '' ||
      val === null ||
      val === undefined ||
      Number.isNaN(Number(val))
        ? undefined
        : Number(val),
    z
      .number({ required_error: 'Vui lòng chọn số năm kinh nghiệm' })
      .min(0, 'Số năm kinh nghiệm không hợp lệ')
      .max(80, 'Số năm kinh nghiệm không hợp lệ'),
  ),
  bio: z.string().max(300, 'Mô tả bản thân tối đa 100 ký tự').optional(),
  desiredJobText: z
    .string()
    .max(300, 'Mong muốn công việc tối đa 100 ký tự')
    .optional(),
  ward: z.string().optional(),
});

export const WorkerProfileView = () => {
  const { toast } = useToast();
  const [sectorId, setSectorId] = useState('');
  const hasUserEditedProvince = useRef(false);

  const { data: occupationsData, isLoading: occupationsLoading } =
    useGetOccupations();
  const { data: workerProfile, isLoading: profileLoading } =
    useGetWorkerProfile({ enabled: true });
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateWorkerProfile();
  const { provinces, isLoading: provincesLoading } = useProvinces();

  const [provinceCode, setProvinceCode] = useState('');

  const { wards, isLoading: wardsLoading } = useWards(provinceCode);

  const filteredOccupations = useMemo(() => {
    if (!occupationsData || !sectorId) return [];
    const sector = occupationsData.find((s) => s.id.toString() === sectorId);
    return sector?.occupations || [];
  }, [occupationsData, sectorId]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      occupationId: undefined,
      shift: '',
      province: '',
      ward: '',
      gender: '',
      birthYear: '',
      expectedSalary: '',
      experienceYear: '',
      bio: '',
      desiredJobText: '',
    },
  });

  const watchProvince = watch('province');

  // Sync province code when province name changes
  useEffect(() => {
    if (watchProvince && provinces.length > 0) {
      const p = provinces.find((p) => p.name === watchProvince);
      if (p) setProvinceCode(p.code);
    } else {
      setProvinceCode('');
    }
  }, [watchProvince, provinces]);

  // Main form reset — only depends on core data, NOT on wards
  useEffect(() => {
    if (!workerProfile || !occupationsData || provinces.length === 0) return;

    const { occupation, ...rest } = workerProfile;

    if (occupation?.sectorId) {
      setSectorId(occupation.sectorId.toString());
    }

    reset({
      occupationId: occupation?.id ?? undefined,
      shift: rest.shift || '',
      province: rest.province || '',
      ward: rest.ward || '',
      gender: rest.gender || '',
      birthYear: rest.birthYear || '',
      expectedSalary: rest.expectedSalary || '',
      experienceYear: rest.experienceYear ?? '',
      bio: rest.bio || '',
      desiredJobText: rest.desiredJobText || '',
    });
  }, [workerProfile, occupationsData, provinces, reset]);

  // Re-apply saved ward value once wards data finishes loading
  // This is needed because Radix Select can't display the value text
  // until its SelectItem children are rendered (which requires wards data)
  useEffect(() => {
    if (hasUserEditedProvince.current) return;
    if (!workerProfile?.ward || wards.length === 0) return;

    const savedWard = workerProfile.ward;
    const wardExists = wards.some((w) => w.name === savedWard);

    if (wardExists) {
      setValue('ward', savedWard);
    }
  }, [wards, workerProfile, setValue]);

  const handleSectorChange = (newSectorId) => {
    if (!newSectorId) return;
    setSectorId(newSectorId);
    if (newSectorId !== workerProfile?.occupation?.sectorId?.toString()) {
      setValue('occupationId', undefined);
    }
  };

  const onSubmit = (data) => {
    const payload = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (sectorId) {
      const sector = occupationsData?.find((s) => s.id.toString() === sectorId);
      if (sector) payload.sectorId = sector.id;
    } else if (workerProfile?.occupation?.sectorId) {
      payload.sectorId = workerProfile.occupation.sectorId;
    }

    updateProfile(payload, {
      onSuccess: () => {
        toast(MSG.MSG_WORKER_PROFILE_UPDATE_SUCCESS);
        hasUserEditedProvince.current = false;
      },
      onError: (error) => {
        const message =
          error.response?.data?.message || MSG.MSG_WORKER_PROFILE_UPDATE_ERROR;
        toast(message, 'error');
      },
    });
  };

  if (profileLoading) {
    return (
      <Card className="overflow-hidden rounded-2xl shadow-sm border-0">
        <div className="h-2 bg-primary" />
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </Card>
    );
  }

  const SectionHeading = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-muted">
        <Icon size={16} className="text-primary" />
      </div>
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        {title}
      </h3>
      <div className="flex-1 h-px bg-gray-100 ml-1" />
    </div>
  );

  const RequiredMark = () => <span className="text-red-500 ml-0.5">*</span>;

  const FieldError = ({ message }) =>
    message ? (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        {message}
      </p>
    ) : null;

  return (
    <Card className="overflow-hidden rounded-2xl shadow-sm border border-gray-100">
      {/* Top accent bar */}
      <div className="h-1.5 bg-primary" />

      <div className="p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary-muted shadow-md">
            <User size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Hồ sơ lao động</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Cập nhật thông tin AI sẽ giúp gợi ý công việc phù hợp với bạn hơn!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* ── Section 1: Nghề nghiệp ── */}
          <section>
            <SectionHeading icon={Briefcase} title="Nghề nghiệp" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Sector */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Ngành nghề <RequiredMark />
                </Label>
                <Select
                  value={sectorId}
                  onValueChange={handleSectorChange}
                  disabled={occupationsLoading}
                >
                  <SelectTrigger className="w-full h-11! rounded-xl border-gray-200 bg-gray-50/60 focus:bg-white transition-colors">
                    <SelectValue placeholder="Chọn ngành nghề" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    side="bottom"
                    sideOffset={4}
                    align="start"
                  >
                    {occupationsData?.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id.toString()}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Occupation */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Nghề cụ thể <RequiredMark />
                </Label>
                <Controller
                  name="occupationId"
                  control={control}
                  render={({ field }) => {
                    const occupationValue =
                      field.value != null && !Number.isNaN(field.value)
                        ? field.value.toString()
                        : '';
                    return (
                      <Select
                        value={occupationValue}
                        onValueChange={(val) => {
                          if (!val) return;
                          field.onChange(parseInt(val, 10));
                        }}
                        disabled={!sectorId}
                      >
                        <SelectTrigger className="w-full h-11! rounded-xl border-gray-200 bg-gray-50/60 focus:bg-white transition-colors disabled:opacity-50">
                          <SelectValue placeholder="Chọn nghề cụ thể" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          side="bottom"
                          sideOffset={4}
                          align="start"
                        >
                          {filteredOccupations.map((occupation) => (
                            <SelectItem
                              key={occupation.id}
                              value={occupation.id.toString()}
                            >
                              {occupation.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
                <FieldError message={errors.occupationId?.message} />
              </div>
            </div>
          </section>

          {/* ── Section 2: Thông tin cá nhân ── */}
          <section>
            <SectionHeading icon={User} title="Thông tin cá nhân" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Giới tính <RequiredMark />
                </Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex gap-5 pt-1"
                    >
                      {GENDERS.map((gender) => (
                        <label
                          key={gender.value}
                          htmlFor={`gender-${gender.value}`}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <RadioGroupItem
                            value={gender.value}
                            id={`gender-${gender.value}`}
                            className="text-primary"
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                            {gender.label}
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  )}
                />
                <FieldError message={errors.gender?.message} />
              </div>

              {/* Birth Year */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="birthYear"
                  className="text-sm font-medium text-gray-700"
                >
                  Năm sinh
                </Label>
                <Input
                  id="birthYear"
                  type="number"
                  placeholder="VD: 1995"
                  className="h-11 rounded-xl border-gray-200 bg-gray-50/60 focus:bg-white transition-colors"
                  {...register('birthYear', { valueAsNumber: true })}
                />
                <FieldError message={errors.birthYear?.message} />
              </div>

              {/* Bio */}
              <div className="col-span-full space-y-1.5">
                <Label
                  htmlFor="bio"
                  className="text-sm font-medium text-gray-700"
                >
                  Mô tả bản thân
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Hãy giới thiệu một chút về bản thân bạn (kinh nghiệm, kỹ năng, thái độ làm việc...)"
                  className="min-h-[100px] rounded-xl border-gray-200 bg-gray-50/60 focus:bg-white transition-colors resize-none"
                  {...register('bio')}
                />
                <FieldError message={errors.bio?.message} />
              </div>
            </div>
          </section>

          {/* ── Section 3: Yêu cầu công việc ── */}
          <section>
            <SectionHeading icon={Star} title="Yêu cầu & Mong muốn" />
            <div className="space-y-5">
              {/* Shift */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Ca làm việc mong muốn <RequiredMark />
                </Label>
                <Controller
                  name="shift"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1"
                    >
                      {SHIFTS.map((shift) => (
                        <label
                          key={shift.value}
                          htmlFor={`shift-${shift.value}`}
                          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                            field.value === shift.value
                              ? 'border-primary/20 bg-primary-muted text-primary'
                              : 'border-gray-200 bg-gray-50/60 text-gray-600 hover:border-primary-hover/20 hover:bg-primary-muted/50'
                          }`}
                        >
                          <RadioGroupItem
                            value={shift.value}
                            id={`shift-${shift.value}`}
                            className="sr-only"
                          />
                          <Clock
                            size={14}
                            className={
                              field.value === shift.value
                                ? 'text-primary'
                                : 'text-gray-400'
                            }
                          />
                          <span className="text-sm font-medium">
                            {shift.label}
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  )}
                />
                <FieldError message={errors.shift?.message} />
              </div>

              {/* Experience + Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Số năm kinh nghiệm <RequiredMark />
                  </Label>
                  <Controller
                    name="experienceYear"
                    control={control}
                    render={({ field }) => {
                      const selectValue =
                        field.value != null &&
                        field.value !== '' &&
                        !Number.isNaN(Number(field.value))
                          ? field.value.toString()
                          : '';
                      return (
                        <Select
                          value={selectValue}
                          //onValueChange={(val) => field.onChange(parseInt(val, 10))}
                          onValueChange={(val) => {
                            if (val) field.onChange(parseInt(val, 10));
                          }}
                        >
                          <SelectTrigger className="w-full h-11! rounded-xl border-gray-200 bg-gray-50/60 focus:bg-white transition-colors">
                            <SelectValue placeholder="Chọn số năm kinh nghiệm" />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            side="bottom"
                            sideOffset={4}
                            align="start"
                          >
                            <SelectItem value="0">
                              Chưa có kinh nghiệm
                            </SelectItem>
                            {[1, 2, 3, 4, 5].map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year} năm
                              </SelectItem>
                            ))}
                            <SelectItem value="6">Trên 5 năm</SelectItem>
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                  <FieldError message={errors.experienceYear?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="expectedSalary"
                    className="text-sm font-medium text-gray-700"
                  >
                    Mức lương mong muốn <RequiredMark />
                  </Label>
                  <div className="relative">
                    <DollarSign
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      id="expectedSalary"
                      type="number"
                      placeholder="1,000,000"
                      className="h-11 rounded-xl border-gray-200 bg-gray-50/60 focus:bg-white transition-colors pl-9"
                      {...register('expectedSalary', { valueAsNumber: true })}
                    />
                  </div>
                  <FieldError message={errors.expectedSalary?.message} />
                </div>
              </div>

              {/* Desired Job Context */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="desiredJobText"
                  className="text-sm font-medium text-gray-700"
                >
                  Mong muốn cụ thể về công việc
                </Label>
                <Input
                  id="desiredJobText"
                  placeholder="VD: Muốn làm gần nhà, ưu tiên tăng ca..."
                  className="h-11 rounded-xl border-gray-200 bg-gray-50/60 focus:bg-white transition-colors"
                  {...register('desiredJobText')}
                />
                <FieldError message={errors.desiredJobText?.message} />
              </div>

              {/* Province - Ward */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Province */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Tỉnh/Thành phố <RequiredMark />
                    </Label>
                    <Controller
                      name="province"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || ''}
                          onValueChange={(val) => {
                            if (val) {
                              hasUserEditedProvince.current = true;
                              field.onChange(val);
                              setValue('ward', '');
                            }
                          }}
                        >
                          <SelectTrigger className="w-full h-11! rounded-xl border-gray-200 bg-gray-50/60 focus:bg-white transition-colors">
                            <SelectValue placeholder="Chọn tỉnh/thành" />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            side="bottom"
                            sideOffset={4}
                            align="start"
                            className="p-0 rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                          >
                            <div className="max-h-60 overflow-y-auto py-1 px-1">
                              {provinces.map((p) => (
                                <SelectItem
                                  key={p.code}
                                  value={p.name}
                                  className="rounded-lg text-sm cursor-pointer hover:bg-primary-muted focus:bg-primary-muted focus:text-foreground"
                                >
                                  {p.name}
                                </SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError message={errors.province?.message} />
                  </div>

                  {/* Ward (Treating districts as wards) */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Phường/Xã <RequiredMark />
                    </Label>
                    <Controller
                      name="ward"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || ''}
                          onValueChange={field.onChange}
                          disabled={!watchProvince || wardsLoading}
                        >
                          <SelectTrigger className="w-full h-11! rounded-xl border-gray-200 bg-gray-50/60 focus:bg-white transition-colors">
                            <SelectValue
                              placeholder={
                                wardsLoading ? 'Đang tải...' : 'Chọn phường/xã'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            side="bottom"
                            sideOffset={4}
                            align="start"
                            className="p-0 rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                          >
                            <div className="max-h-60 overflow-y-auto py-1 px-1">
                              {wards.map((w) => (
                                <SelectItem
                                  key={w.code}
                                  value={w.name}
                                  className="rounded-lg text-sm cursor-pointer hover:bg-primary-muted focus:bg-primary-muted focus:text-foreground"
                                >
                                  {w.name}
                                </SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError message={errors.ward?.message} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Submit ── */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isUpdating}
              className="w-full h-12 rounded-xl font-semibold text-sm bg-primary hover:bg-primary-hover active:bg-primary-active shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Đang lưu...
                </>
              ) : (
                <span>Lưu thay đổi</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};
//Bản 527

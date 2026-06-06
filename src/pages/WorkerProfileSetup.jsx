import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetOccupations,
  useCreateWorkerProfile,
} from '@/features/users/api/useUser';
import * as userApi from '@/features/users/api/userApi';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';
import { SHIFTS, GENDERS } from '@/shared/constants/enums';
import { useProvinces, useWards } from '@/shared/hooks/useProvinces';
import { Textarea } from '@/components/ui/textarea';
import { formatVND, parseNumber } from '@/shared/utils/formatCurrency';

const schema = z.object({
  phone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(/^(0|\+84)[0-9]{8,10}$/, 'Số điện thoại không hợp lệ (VD: 0912345678)'),
  occupationId: z
    .number({ required_error: 'Vui lòng chọn nghề nghiệp' })
    .min(1, 'Vui lòng chọn nghề nghiệp'),
  shift: z.string().min(1, 'Vui lòng chọn ca làm việc'),
  province: z.string().min(1, 'Vui lòng chọn tỉnh/thành'),
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
      .number()
      .min(1_000_000, 'Mức lương tối thiểu là 1,000,000 VNĐ')
      .max(100_000_000, 'Mức lương tối đa là 100,000,000 VNĐ')
      .optional(),
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
      .number()
      .min(0, 'Số năm kinh nghiệm không hợp lệ')
      .max(80, 'Số năm kinh nghiệm không hợp lệ')
      .optional(),
  ),
  bio: z.string().max(1000, 'Mô tả bản thân tối đa 1000 ký tự').optional(),
  desiredJobText: z
    .string()
    .max(100, 'Mong muốn công việc tối đa 100 ký tự')
    .optional(),
  ward: z.string().min(1, 'Vui lòng chọn phường/xã'),
});

export const WorkerProfileSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sectorId, setSectorId] = useState('');

  const { data: occupationsData, isLoading: occupationsLoading } =
    useGetOccupations();
  const { mutate: createProfile, isPending: isCreating } =
    useCreateWorkerProfile();
  const { provinces, isLoading: provincesLoading } = useProvinces();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: '',
      occupationId: '',
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
  const [provinceCode, setProvinceCode] = useState('');
  const { wards, isLoading: wardsLoading } = useWards(provinceCode);

  useEffect(() => {
    if (watchProvince && provinces.length > 0) {
      const p = provinces.find((p) => p.name === watchProvince);
      if (p) setProvinceCode(p.code);
    } else {
      setProvinceCode('');
    }
  }, [watchProvince, provinces]);

  const filteredOccupations = useMemo(() => {
    if (!occupationsData || !sectorId) return [];
    const sector = occupationsData.find((s) => s.id.toString() === sectorId);
    return sector?.occupations || [];
  }, [occupationsData, sectorId]);

  // Reset occupation when sector changes
  useEffect(() => {
    if (sectorId) {
      setValue('occupationId', '');
    }
  }, [sectorId, setValue]);

  const [sectorTouched, setSectorTouched] = useState(false);
  const sectorError = sectorTouched && !sectorId;

  const FIELD_LABELS = {
    phone: 'Số điện thoại',
    occupationId: 'Nghề cụ thể',
    shift: 'Ca làm việc mong muốn',
    province: 'Tỉnh/Thành phố',
    ward: 'Phường/Xã',
    gender: 'Giới tính',
    birthYear: 'Năm sinh',
    expectedSalary: 'Mức lương mong muốn',
  };

  const onSubmit = async (data) => {
    if (!sectorId) {
      setSectorTouched(true);
      toast('Vui lòng chọn Ngành nghề trước khi hoàn tất.', 'error');
      return;
    }

    // Update phone on user account first
    if (data.phone) {
      try {
        const fd = new FormData();
        fd.append('phone', data.phone);
        await userApi.updateUserInfo(fd);
      } catch {
        toast('Cập nhật số điện thoại thất bại. Vui lòng thử lại.', 'error');
        return;
      }
    }

    // Build worker profile payload (phone is on User, not WorkerProfile)
    const { phone: _phone, ...rest } = data;
    const payload = Object.entries(rest).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    const sector = occupationsData?.find((s) => s.id.toString() === sectorId);
    if (sector) payload.sectorId = sector.id;

    createProfile(payload, {
      onSuccess: () => {
        toast(MSG.MSG_WORKER_PROFILE_CREATE_SUCCESS);
        navigate('/');
      },
      onError: (error) => {
        const message =
          error.response?.data?.message || MSG.MSG_WORKER_PROFILE_CREATE_ERROR;
        toast(message, 'error');
      },
    });
  };

  const onInvalid = (formErrors) => {
    setSectorTouched(true);

    const missing = [];
    if (!sectorId) missing.push('Ngành nghề');
    Object.entries(formErrors).forEach(([key]) => {
      const label = FIELD_LABELS[key];
      if (label && !missing.includes(label)) missing.push(label);
    });

    const message =
      missing.length > 0
        ? `Vui lòng điền đầy đủ thông tin: ${missing.join(', ')}.`
        : 'Vui lòng kiểm tra lại thông tin trước khi hoàn tất.';
    toast(message, 'error');
  };

  const isLoading = isCreating;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 rounded-2xl shadow-sm border-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Mô tả công việc mong muốn của bạn
            </h1>
            <p className="text-muted-foreground mt-2">
              Chúng tôi sẽ gợi ý việc làm, cá nhân hoá trải nghiệm dựa trên mong
              muốn của bạn!
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
            {/* Phone — required personal info */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="VD: 0912345678"
                className={`h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors ${errors.phone ? 'border-destructive' : ''}`}
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sector Selection */}
              <div className="space-y-2">
                <Label htmlFor="sector" className="text-sm font-medium">
                  Ngành nghề <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={sectorId}
                  onValueChange={(val) => {
                    setSectorId(val);
                    setSectorTouched(true);
                  }}
                  disabled={occupationsLoading}
                >
                  <SelectTrigger className={`w-full h-11! rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors ${sectorError ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Chọn ngành nghề" />
                  </SelectTrigger>
                  <SelectContent>
                    {occupationsData?.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id.toString()}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {sectorError && (
                  <p className="text-xs text-destructive">
                    Vui lòng chọn ngành nghề
                  </p>
                )}
              </div>

              {/* Occupation Selection */}
              <div className="space-y-2">
                <Label htmlFor="occupationId" className="text-sm font-medium">
                  Nghề cụ thể <span className="text-destructive">*</span>
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
                        <SelectTrigger className="w-full h-11! rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors">
                          <SelectValue placeholder="Chọn nghề cụ thể" />
                        </SelectTrigger>
                        <SelectContent>
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
                {errors.occupationId && (
                  <p className="text-xs text-destructive">
                    {errors.occupationId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Experience Years */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Số năm kinh nghiệm
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
                        onValueChange={(val) =>
                          field.onChange(parseInt(val, 10))
                        }
                      >
                        <SelectTrigger className="w-full h-11! rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors">
                          <SelectValue placeholder="Chọn số năm kinh nghiệm" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Chưa có kinh nghiệm</SelectItem>
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
                {errors.experienceYear && (
                  <p className="text-xs text-destructive">
                    {errors.experienceYear.message}
                  </p>
                )}
              </div>

              {/* Birth Year */}
              <div className="space-y-2">
                <Label htmlFor="birthYear" className="text-sm font-medium">
                  Năm sinh
                </Label>
                <Input
                  id="birthYear"
                  type="number"
                  placeholder="VD: 1990"
                  className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                  {...register('birthYear', { valueAsNumber: true })}
                />
                {errors.birthYear && (
                  <p className="text-xs text-destructive">
                    {errors.birthYear.message}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div className="col-span-full space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">
                  Mô tả bản thân
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Hãy giới thiệu một chút về bản thân bạn (kinh nghiệm, kỹ năng, thái độ làm việc...)"
                  className="min-h-[100px] rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors resize-none"
                  {...register('bio')}
                />
                {errors.bio && (
                  <p className="text-xs text-destructive">
                    {errors.bio.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expected Salary Min */}
              <div className="space-y-2">
                <Label htmlFor="expectedSalary" className="text-sm font-medium">
                  Mức lương mong muốn
                </Label>
                <Controller
                  name="expectedSalary"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="expectedSalary"
                      type="text"
                      inputMode="numeric"
                      placeholder="VD: 10.000.000"
                      className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                      value={field.value ? formatVND(field.value) : ''}
                      onChange={(e) => {
                        const raw = parseNumber(e.target.value);
                        field.onChange(raw || '');
                      }}
                    />
                  )}
                />
                {errors.expectedSalary && (
                  <p className="text-xs text-destructive">
                    {errors.expectedSalary.message}
                  </p>
                )}
              </div>
              {/* Province */}
              <div className="space-y-2">
                <Label htmlFor="province" className="text-sm font-medium">
                  Tỉnh/Thành phố
                </Label>
                <Controller
                  name="province"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(val) => {
                        field.onChange(val);
                        setValue('ward', '');
                      }}
                      disabled={provincesLoading}
                    >
                      <SelectTrigger className="w-full h-11! rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors">
                        <SelectValue
                          placeholder={
                            provincesLoading ? 'Đang tải...' : 'Chọn tỉnh/thành'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="p-0 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="max-h-60 overflow-y-auto py-1 px-1">
                          {provinces.map((p) => (
                            <SelectItem
                              key={p.code}
                              value={p.name}
                              className="rounded-lg text-sm cursor-pointer hover:bg-primary/10 focus:bg-primary/10 focus:text-foreground"
                            >
                              {p.name}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Ward (Treating districts as wards) */}
              <div className="space-y-2">
                <Label htmlFor="ward" className="text-sm font-medium">
                  Phường/Xã
                </Label>
                <Controller
                  name="ward"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(val) => field.onChange(val)}
                      disabled={!watchProvince || wardsLoading}
                    >
                      <SelectTrigger className="w-full h-11! rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors disabled:opacity-50">
                        <SelectValue
                          placeholder={
                            wardsLoading ? 'Đang tải...' : 'Chọn phường/xã'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="p-0 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="max-h-60 overflow-y-auto py-1 px-1">
                          {wards.map((w) => (
                            <SelectItem
                              key={w.code}
                              value={w.name}
                              className="rounded-lg text-sm cursor-pointer hover:bg-primary/10 focus:bg-primary/10 focus:text-foreground"
                            >
                              {w.name}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Desired Job Text */}
              <div className="col-span-full space-y-2">
                <Label htmlFor="desiredJobText" className="text-sm font-medium">
                  Mong muốn cụ thể về công việc
                </Label>
                <Input
                  id="desiredJobText"
                  placeholder="VD: Muốn làm gần nhà, ưu tiên tăng ca..."
                  className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                  {...register('desiredJobText')}
                />
                {errors.desiredJobText && (
                  <p className="text-xs text-destructive">
                    {errors.desiredJobText.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shift */}
              <div className="space-y-3 pt-2">
                <Label className="text-sm font-medium">
                  Ca làm việc mong muốn <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="shift"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-4"
                    >
                      {SHIFTS.map((shift) => (
                        <div
                          key={shift.value}
                          className="flex h-10 items-center space-x-2 bg-gray-50/50 px-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                        >
                          <RadioGroupItem
                            value={shift.value}
                            id={shift.value}
                          />
                          <Label
                            htmlFor={shift.value}
                            className="font-normal cursor-pointer text-sm w-full"
                          >
                            {shift.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
                {errors.shift && (
                  <p className="text-xs text-destructive">{errors.shift.message}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Giới tính <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex gap-6 h-11 items-center"
                    >
                      {GENDERS.map((gender) => (
                        <div
                          key={gender.value}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={gender.value}
                            id={gender.value}
                          />
                          <Label
                            htmlFor={gender.value}
                            className="font-normal cursor-pointer"
                          >
                            {gender.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
                {errors.gender && (
                  <p className="text-xs text-destructive">{errors.gender.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 ">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-xl h-11 font-medium"
              >
                {isLoading ? 'Đang lưu...' : 'Hoàn tất thiết lập'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="rounded-xl h-11"
              >
                Bỏ qua
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

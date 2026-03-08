import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/shared/api/apiClient';
import { useProvinces } from '@/shared/hooks/useProvinces';
import { useCreateJob } from '@/features/jobs/api/useJobs';
import { useToast } from '@/shared/contexts/ToastContext';
import {
  Briefcase,
  MapPin,
  ClipboardList,
  PenTool,
  CheckCircle,
  Trash2,
  Plus,
  Loader2,
  X,
} from 'lucide-react';

const schema = z
  .object({
    // Step 1: Lĩnh vực & Thông tin chung
    sectorId: z.string().min(1, 'Vui lòng chọn lĩnh vực'),
    occupationId: z.number({ required_error: 'Vui lòng chọn ngành nghề' }),
    title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
    description: z.string().min(20, 'Mô tả phải có ít nhất 20 ký tự'),
    quantity: z
      .number({ required_error: 'Vui lòng nhập số lượng' })
      .int('Số lượng phải là số nguyên')
      .min(1, 'Số lượng phải lớn hơn 0'),
    genderRequirement: z.string().optional(),

    // Tuổi
    // Tuổi
    ageMin: z.preprocess(
      (val) =>
        val === '' || val === undefined || val === null
          ? undefined
          : Number(val),
      z
        .number({ invalid_type_error: 'Vui lòng nhập số' })
        .int('Tuổi phải là số nguyên')
        .min(0, 'Tuổi không được âm')
        .optional()
        .nullable(),
    ),
    ageMax: z.preprocess(
      (val) =>
        val === '' || val === undefined || val === null
          ? undefined
          : Number(val),
      z
        .number({ invalid_type_error: 'Vui lòng nhập số' })
        .int('Tuổi phải là số nguyên')
        .min(0, 'Tuổi không được âm')
        .optional()
        .nullable(),
    ),

    // Lương
    salaryMin: z.preprocess(
      (val) =>
        val === '' || val === undefined || val === null
          ? undefined
          : Number(val),
      z
        .number({ invalid_type_error: 'Vui lòng nhập số' })
        .int('Lương phải là số nguyên')
        .min(0, 'Lương không được âm')
        .optional()
        .nullable(),
    ),
    salaryMax: z.preprocess(
      (val) =>
        val === '' || val === undefined || val === null
          ? undefined
          : Number(val),
      z
        .number({ invalid_type_error: 'Vui lòng nhập số' })
        .int('Lương phải là số nguyên')
        .min(0, 'Lương không được âm')
        .optional()
        .nullable(),
    ),

    // Hạn bài viết
    expiredAt: z
      .string()
      .min(1, 'Vui lòng chọn ngày hết hạn')
      .refine((val) => {
        const selectedDate = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset giờ để so sánh ngày
        return selectedDate >= today;
      }, 'Ngày hết hạn không được trong quá khứ'),

    // Step 2: Địa điểm & Ca làm
    workingShift: z.string().min(1, 'Vui lòng chọn ca làm việc'),
    province: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
    district: z.string().min(1, 'Vui lòng chọn Quận/Huyện'),
    address: z.string().optional(),

    // Step 3: Form ứng tuyển
    fields: z
      .array(
        z.object({
          label: z.string().min(1, 'Vui lòng nhập nội dung câu hỏi'),
          fieldType: z.string(),
          isRequired: z.boolean(),
          options: z.array(z.string()).optional(),
        }),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.ageMin && data.ageMax && data.ageMin > data.ageMax) {
      ctx.addIssue({
        path: ['ageMin'],
        message: 'Tuổi tối thiểu không được lớn hơn tối đa',
        code: 'custom',
      });
      ctx.addIssue({
        path: ['ageMax'],
        message: 'Tuổi tối đa không được nhỏ hơn tối thiểu',
        code: 'custom',
      });
    }
    if (data.salaryMin && data.salaryMax && data.salaryMin > data.salaryMax) {
      ctx.addIssue({
        path: ['salaryMin'],
        message: 'Lương tối thiểu không được lớn hơn tối đa',
        code: 'custom',
      });
      ctx.addIssue({
        path: ['salaryMax'],
        message: 'Lương tối đa không được nhỏ hơn tối thiểu',
        code: 'custom',
      });
    }
  });

export const CreateJobPage = ({ onBack, onSuccess: onSuccessProp }) => {
  const PROVINCES_API = import.meta.env.VITE_PROVINCES_API_URL;
  const { toast } = useToast();
  const navigate = useNavigate();
  const handleClose = () => (onBack ? onBack() : navigate('/employer'));
  const { mutate: createJob, isPending: isSubmitting } = useCreateJob();

  const steps = [
    { title: 'Thông tin chung', icon: PenTool },
    { title: 'Địa điểm & Ca làm', icon: MapPin },
    { title: 'Form ứng tuyển', icon: ClipboardList },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [sectors, setSectors] = useState([]);
  const [loadingSector, setLoadingSector] = useState(false);

  const { provinces, isLoading: loadingProvince } = useProvinces();
  const [districts, setDistricts] = useState([]);
  const [loadingDistrict, setLoadingDistrict] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched', // Trigger validation on blur and change
    defaultValues: {
      sectorId: '',
      occupationId: undefined,
      title: '',
      description: '',
      quantity: undefined,
      genderRequirement: '',
      ageMin: '',
      ageMax: '',
      salaryMin: '',
      salaryMax: '',
      expiredAt: '',
      workingShift: '',
      province: '',
      district: '',
      address: '',
      fields: [],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = form;

  const {
    fields: customFields,
    append,
    remove,
    update,
  } = useFieldArray({
    control,
    name: 'fields',
  });

  const watchSectorId = watch('sectorId');
  const watchProvince = watch('province');

  const occupations = useMemo(() => {
    if (!watchSectorId) return [];
    const sector = sectors.find((s) => s.id.toString() === watchSectorId);
    return sector?.occupations || [];
  }, [watchSectorId, sectors]);

  // Fetch Sectors
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoadingSector(true);
        const data = await apiClient.get('/occupations/grouped-by-sector');
        setSectors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch sectors error:', err);
      } finally {
        setLoadingSector(false);
      }
    };
    fetchSectors();
  }, []);

  // Fetch Districts
  useEffect(() => {
    if (!watchProvince) {
      setDistricts([]);
      return;
    }
    const provinceObj = provinces.find((p) => p.name === watchProvince);
    if (!provinceObj) return;

    const fetchDistricts = async () => {
      try {
        setLoadingDistrict(true);
        const res = await fetch(
          `https://provinces.open-api.vn/api/p/${provinceObj.code}?depth=2`,
        );
        const data = await res.json();
        setDistricts(data.districts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDistrict(false);
      }
    };
    fetchDistricts();
  }, [watchProvince, provinces, PROVINCES_API]);
  const handleNextStep = async () => {
    let fieldsToValidate = [];
    if (currentStep === 0) {
      fieldsToValidate = [
        'sectorId',
        'occupationId',
        'title',
        'description',
        'quantity',
        'expiredAt',
        'ageMin',
        'ageMax',
        'salaryMin',
        'salaryMax',
      ];
    } else if (currentStep === 1) {
      fieldsToValidate = ['workingShift', 'province', 'district'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const onSubmit = (data) => {
    const payload = {
      title: data.title,
      description: data.description,
      occupationId: data.occupationId,
      workingShift: data.workingShift,
      quantity: data.quantity,
      expiredAt: data.expiredAt
        ? new Date(data.expiredAt).toISOString()
        : undefined,
      genderRequirement: data.genderRequirement || undefined,
      address: data.address || undefined,
      province: data.province || undefined,
      district: data.district || undefined,
      ageMin: data.ageMin,
      ageMax: data.ageMax,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      fields:
        data.fields?.map((f) => ({
          label: f.label,
          fieldType: f.fieldType,
          isRequired: f.isRequired,
          options:
            f.fieldType === 'select' ||
            f.fieldType === 'radio' ||
            f.fieldType === 'checkbox'
              ? JSON.stringify(f.options.filter((opt) => opt.trim() !== ''))
              : undefined,
        })) || [],
    };

    createJob(payload, {
      onSuccess: () => {
        toast('Tạo tin tuyển dụng thành công', 'success');
        onSuccessProp ? onSuccessProp() : navigate('/employer');
      },
      onError: (error) => {
        const message =
          error?.response?.data?.message || 'Tạo tin tuyển dụng thất bại';
        toast(Array.isArray(message) ? message.join(', ') : message, 'error');
      },
    });
  };

  const FieldError = ({ error }) => {
    if (!error) return null;
    return (
      <p className="text-red-500 text-xs mt-1.5 font-medium">{error.message}</p>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative p-6 shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10 rounded-full hover:bg-gray-100"
          onClick={handleClose}
        >
          <X className="w-5 h-5" />
        </Button>
        <div className="mb-10 text-center pt-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Tạo tin tuyển dụng mới
          </h1>
          <p className="text-muted-foreground mt-2">
            Hoàn thiện thông tin thu hút ứng viên tài năng
          </p>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center mb-10 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500 ease-in-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;

            return (
              <div
                key={idx}
                className="relative z-10 flex flex-col items-center gap-2"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-4 shadow-sm transition-all duration-300
                                    ${
                                      isActive
                                        ? 'bg-primary border-primary/20 text-white scale-110'
                                        : isCompleted
                                          ? 'bg-primary border-primary text-white'
                                          : 'bg-white border-gray-200 text-gray-400'
                                    }`}
                >
                  {isCompleted ? (
                    <CheckCircle size={20} />
                  ) : (
                    <StepIcon size={20} />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        <Card className="rounded-2xl shadow-xl border-0 overflow-hidden bg-white">
          <div className="h-2 bg-primary w-full" />
          <div className="p-8 sm:p-10">
            {/* STEP 1: THÔNG TIN CHUNG */}
            {currentStep === 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                  <Briefcase className="text-primary" /> Thông tin công việc
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Lĩnh vực <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="sectorId"
                      render={({ field }) => (
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            setValue('occupationId', undefined);
                          }}
                          value={field.value}
                          disabled={loadingSector}
                        >
                          <SelectTrigger
                            className={`h-12 rounded-xl bg-gray-50 border-gray-200 hover:border-primary/50 transition-colors ${errors.sectorId ? 'border-red-500 focus:ring-red-500' : ''}`}
                          >
                            <SelectValue
                              placeholder={
                                loadingSector ? 'Đang tải...' : 'Chọn lĩnh vực'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {sectors.map((s) => (
                              <SelectItem key={s.id} value={s.id.toString()}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError error={errors.sectorId} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Ngành nghề <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="occupationId"
                      render={({ field }) => (
                        <Select
                          onValueChange={(val) => field.onChange(Number(val))}
                          value={field.value?.toString()}
                          disabled={!watchSectorId}
                        >
                          <SelectTrigger
                            className={`h-12 rounded-xl bg-gray-50 border-gray-200 hover:border-primary/50 transition-colors ${errors.occupationId ? 'border-red-500 focus:ring-red-500' : ''}`}
                          >
                            <SelectValue
                              placeholder={
                                !watchSectorId
                                  ? 'Chọn lĩnh vực trước'
                                  : 'Chọn ngành nghề'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {occupations.map((o) => (
                              <SelectItem key={o.id} value={o.id.toString()}>
                                {o.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError error={errors.occupationId} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Tiêu đề công việc <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('title')}
                    className={`h-12 rounded-xl bg-gray-50 border-gray-200 hover:border-primary/50 focus:bg-white transition-colors ${errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    placeholder="VD: Tuyển gấp kỹ sư phần mềm Javascript"
                  />
                  <FieldError error={errors.title} />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Mô tả chi tiết <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    {...register('description')}
                    className={`min-h-[140px] rounded-xl bg-gray-50 border-gray-200 hover:border-primary/50 focus:bg-white resize-none transition-colors ${errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    placeholder="Mô tả công việc, yêu cầu, quyền lợi..."
                  />
                  <FieldError error={errors.description} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Số lượng tuyển <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      {...register('quantity', { valueAsNumber: true })}
                      className={`h-12 rounded-xl bg-gray-50 border-gray-200 ${errors.quantity ? 'border-red-500' : ''}`}
                      placeholder="VD: 5"
                    />
                    <FieldError error={errors.quantity} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Giới tính yêu cầu
                    </Label>
                    <Controller
                      control={control}
                      name="genderRequirement"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
                            <SelectValue placeholder="Không yêu cầu" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MALE">Nam</SelectItem>
                            <SelectItem value="FEMALE">Nữ</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                      Độ tuổi yêu cầu
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Input
                          type="number"
                          {...register('ageMin')}
                          placeholder="Từ (Tối thiểu 0)"
                          className={`h-11 bg-white ${errors.ageMin ? 'border-red-500' : ''}`}
                        />
                        <FieldError error={errors.ageMin} />
                      </div>
                      <span className="text-gray-400 font-medium">-</span>
                      <div className="flex-1">
                        <Input
                          type="number"
                          {...register('ageMax')}
                          placeholder="Đến"
                          className={`h-11 bg-white ${errors.ageMax ? 'border-red-500' : ''}`}
                        />
                        <FieldError error={errors.ageMax} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                      Mức lương (VND)
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Input
                          type="number"
                          {...register('salaryMin')}
                          placeholder="Từ (Tối thiểu 0)"
                          className={`h-11 bg-white ${errors.salaryMin ? 'border-red-500' : ''}`}
                        />
                        <FieldError error={errors.salaryMin} />
                      </div>
                      <span className="text-gray-400 font-medium">-</span>
                      <div className="flex-1">
                        <Input
                          type="number"
                          {...register('salaryMax')}
                          placeholder="Đến"
                          className={`h-11 bg-white ${errors.salaryMax ? 'border-red-500' : ''}`}
                        />
                        <FieldError error={errors.salaryMax} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Ngày hết hạn bài viết{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    {...register('expiredAt')}
                    min={new Date().toISOString().split('T')[0]}
                    className={`h-12 rounded-xl bg-gray-50 border-gray-200 ${errors.expiredAt ? 'border-red-500' : ''}`}
                  />
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <CheckCircle size={12} className="text-green-500" /> Tin sẽ
                    tự động ẩn sau ngày này
                  </p>
                  <FieldError error={errors.expiredAt} />
                </div>
              </div>
            )}

            {/* STEP 2: ĐỊA ĐIỂM & CA LÀM */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                  <MapPin className="text-primary" /> Thông tin làm việc
                </h2>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Ca làm việc <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="workingShift"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          className={`h-12 rounded-xl bg-gray-50 border-gray-200 ${errors.workingShift ? 'border-red-500' : ''}`}
                        >
                          <SelectValue placeholder="Chọn ca làm việc" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MORNING">Ca sáng</SelectItem>
                          <SelectItem value="AFTERNOON">Ca chiều</SelectItem>
                          <SelectItem value="NIGHT">Ca tối</SelectItem>
                          <SelectItem value="FULL_DAY">
                            Toàn thời gian
                          </SelectItem>
                          <SelectItem value="FLEXIBLE">Linh hoạt</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError error={errors.workingShift} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="province"
                      render={({ field }) => (
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            setValue('district', '');
                          }}
                          value={field.value}
                          disabled={loadingProvince}
                        >
                          <SelectTrigger
                            className={`h-12 rounded-xl bg-gray-50 border-gray-200 ${errors.province ? 'border-red-500' : ''}`}
                          >
                            <SelectValue
                              placeholder={
                                loadingProvince
                                  ? 'Đang tải...'
                                  : 'Chọn tỉnh/thành phố'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {provinces.map((p) => (
                              <SelectItem key={p.code} value={p.name}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError error={errors.province} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="district"
                      render={({ field }) => (
                        <Select
                          key={`district-${watchProvince || 'none'}`}
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                          disabled={!watchProvince || loadingDistrict}
                        >
                          <SelectTrigger
                            className={`h-12 rounded-xl bg-gray-50 border-gray-200 ${errors.district ? 'border-red-500' : ''}`}
                          >
                            <SelectValue
                              placeholder={
                                !watchProvince
                                  ? 'Chọn tỉnh trước'
                                  : loadingDistrict
                                    ? 'Đang tải...'
                                    : 'Chọn quận/huyện'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {districts.map((d) => (
                              <SelectItem key={d.code} value={d.name}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError error={errors.district} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Địa chỉ cụ thể (tùy chọn)
                  </Label>
                  <Input
                    {...register('address')}
                    className="h-12 rounded-xl bg-gray-50 border-gray-200 hover:border-primary/50"
                    placeholder="Số nhà, đường, ngõ..."
                  />
                </div>
              </div>
            )}

            {/* STEP 3: FORM ỨNG TUYỂN */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex justify-between items-center bg-blue-50/50 p-5 rounded-2xl border border-blue-100 border-dashed">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-blue-800">
                      <ClipboardList className="text-blue-500" /> Biểu mẫu khảo
                      sát
                    </h2>
                    <p className="text-sm text-blue-600/80 mt-1">
                      Câu hỏi phụ để sàng lọc ứng viên tốt hơn
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() =>
                      append({
                        label: '',
                        fieldType: 'text',
                        isRequired: false,
                        options: [],
                      })
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md border-0"
                  >
                    <Plus size={16} className="mr-2" /> Thêm câu hỏi
                  </Button>
                </div>

                <div className="space-y-5">
                  {customFields.map((field, index) => (
                    <Card
                      key={field.id}
                      className="p-6 rounded-2xl border-gray-200 shadow-sm relative overflow-hidden group"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-400 opacity-50 group-hover:opacity-100 transition-opacity" />

                      <div className="flex justify-between items-start mb-5 block sm:hidden">
                        <h3 className="font-medium text-sm text-gray-500">
                          Câu số {index + 1}
                        </h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8 w-8 p-0 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                        <div className="col-span-1 border border-gray-200 bg-gray-50 rounded-xl w-10 h-10 flex items-center justify-center font-bold text-gray-400 hidden sm:flex">
                          {index + 1}
                        </div>

                        <div className="col-span-1 md:col-span-7 space-y-2">
                          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Nội dung câu hỏi
                          </Label>
                          <Input
                            {...register(`fields.${index}.label`)}
                            placeholder="VD: Bạn đã sử dụng React bao lâu?"
                            className={`h-11 rounded-xl ${errors.fields?.[index]?.label ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          />
                          <FieldError error={errors.fields?.[index]?.label} />
                        </div>

                        <div className="col-span-1 md:col-span-3 space-y-2">
                          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Loại đáp án
                          </Label>
                          <Controller
                            control={control}
                            name={`fields.${index}.fieldType`}
                            render={({ field: fProps }) => (
                              <Select
                                onValueChange={(val) => {
                                  fProps.onChange(val);
                                  if (
                                    val !== 'select' &&
                                    val !== 'radio' &&
                                    val !== 'checkbox'
                                  ) {
                                    const currentField = form.getValues(
                                      `fields.${index}`,
                                    );
                                    update(index, {
                                      ...currentField,
                                      options: [],
                                    });
                                  } else {
                                    const currentField = form.getValues(
                                      `fields.${index}`,
                                    );
                                    if (
                                      !currentField.options ||
                                      currentField.options.length === 0
                                    ) {
                                      update(index, {
                                        ...currentField,
                                        options: [''],
                                      });
                                    }
                                  }
                                }}
                                value={fProps.value}
                              >
                                <SelectTrigger className="h-11 rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">
                                    Trả lời ngắn
                                  </SelectItem>
                                  <SelectItem value="textarea">
                                    Đoạn văn
                                  </SelectItem>
                                  <SelectItem value="select">
                                    Dropdown chọn 1
                                  </SelectItem>
                                  <SelectItem value="radio">
                                    Radio (chọn 1)
                                  </SelectItem>
                                  <SelectItem value="checkbox">
                                    Checkbox (chọn nhiều)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div className="col-span-1 hidden sm:flex justify-end pt-7">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => remove(index)}
                            className="text-red-400 hover:bg-red-50 hover:text-red-600 h-11 w-11 rounded-xl"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>

                      {(watch(`fields.${index}.fieldType`) === 'select' ||
                        watch(`fields.${index}.fieldType`) === 'radio' ||
                        watch(`fields.${index}.fieldType`) === 'checkbox') && (
                        <div className="mt-5 ml-0 sm:ml-16 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                          <div className="flex justify-between items-center mb-3">
                            <Label className="text-sm font-medium text-gray-600">
                              Các lựa chọn có thể chọn
                            </Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const opts =
                                  watch(`fields.${index}.options`) || [];
                                const currentField = form.getValues(
                                  `fields.${index}`,
                                );
                                update(index, {
                                  ...currentField,
                                  options: [...opts, ''],
                                });
                              }}
                              className="h-8 text-xs rounded-lg"
                            >
                              <Plus size={14} className="mr-1" /> Thêm option
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {(watch(`fields.${index}.options`) || []).map(
                              (_, optIdx) => (
                                <div
                                  key={optIdx}
                                  className="flex gap-3 items-center"
                                >
                                  <div className="w-4 flex flex-col items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                  </div>
                                  <Input
                                    {...register(
                                      `fields.${index}.options.${optIdx}`,
                                    )}
                                    placeholder={`Lựa chọn ${optIdx + 1}`}
                                    className="h-10 rounded-lg flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                      const opts =
                                        watch(`fields.${index}.options`) || [];
                                      const currentField = form.getValues(
                                        `fields.${index}`,
                                      );
                                      opts.splice(optIdx, 1);
                                      update(index, {
                                        ...currentField,
                                        options: opts,
                                      });
                                    }}
                                    className="h-10 w-10 text-gray-400 hover:text-red-500 rounded-lg"
                                  >
                                    &times;
                                  </Button>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-5 ml-0 sm:ml-16 pt-4 border-t border-gray-100">
                        <Controller
                          control={control}
                          name={`fields.${index}.isRequired`}
                          render={({ field: reqField }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`req-${index}`}
                                checked={reqField.value}
                                onCheckedChange={reqField.onChange}
                              />
                              <label
                                htmlFor={`req-${index}`}
                                className="text-sm font-medium text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                Bắt buộc trả lời câu hỏi này
                              </label>
                            </div>
                          )}
                        />
                      </div>
                    </Card>
                  ))}

                  {customFields.length === 0 && (
                    <div className="text-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-3xl">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="text-gray-400" size={28} />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        Chưa có câu hỏi phụ
                      </h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                        Thêm các câu hỏi ngắn để yêu cầu ứng viên cung cấp thêm
                        thông tin chứng chỉ, số năm kinh nghiệm...
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          append({
                            label: '',
                            fieldType: 'text',
                            isRequired: false,
                            options: [],
                          })
                        }
                        className="rounded-xl"
                      >
                        Thêm câu hỏi đầu tiên
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-6 sm:px-10 border-t bg-gray-50/80 flex justify-between items-center rounded-b-2xl">
            {currentStep > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                className="h-12 px-6 rounded-xl font-medium"
              >
                Quay lại
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="h-12 px-8 rounded-xl font-medium bg-primary hover:bg-primary/90 text-white shadow-md"
              >
                Tiếp tục
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="h-12 px-10 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Đang lưu...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} /> Đăng tin tuyển dụng
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

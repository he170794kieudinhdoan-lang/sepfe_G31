import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
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
import { useCreateJob } from '@/features/jobs/useJobMutation';
import { useToast } from '@/shared/contexts/ToastContext';
import { useMyWallet, useWalletPricing } from '@/features/wallet/api/useWallet';
import { InsufficientPointModal } from '@/shared/components/wallet/InsufficientPointModal';
import {
  consumeWalletResumeState,
  extractApiErrorMessage,
  goToWalletTopup,
  isInsufficientPointError,
} from '@/shared/utils/walletPointFlow';
import { formatVND } from '@/shared/utils/formatCurrency';
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

const isEmptyInput = (value) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (typeof value === 'number' && Number.isNaN(value));

const requiredNumberField = (emptyMessage) =>
  z.preprocess(
    (val) => {
      if (isEmptyInput(val)) return undefined;
      const n = Number(val);
      return Number.isNaN(n) ? val : n;
    },
    z.coerce
      .number({
        error: (iss) =>
          isEmptyInput(iss.input) ? emptyMessage : 'Vui lòng nhập số hợp lệ',
      })
      .int('Phải là số nguyên')
      .min(1, emptyMessage),
  );

const schema = z
  .object({
    // Step 1: Lĩnh vực & Thông tin chung
    sectorId: z.string().min(1, 'Vui lòng chọn lĩnh vực'),
    occupationId: requiredNumberField('Vui lòng chọn ngành nghề'),
    title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
    description: z.string().min(20, 'Mô tả phải có ít nhất 20 ký tự'),
    quantity: requiredNumberField('Vui lòng nhập số lượng tuyển'),
    genderRequirement: z.string().optional(),

    // Tuổi
    // Tuổi
    ageMin: z.preprocess(
      (val) => {
        if (val === '' || val === undefined || val === null) return undefined;
        const n = Number(val);
        return isNaN(n) ? val : n;
      },
      z
        .number({
          error: (iss) =>
            isEmptyInput(iss.input)
              ? 'Vui lòng nhập số hợp lệ'
              : 'Vui lòng nhập số hợp lệ',
        })
        .int('Tuổi phải là số nguyên')
        .min(15, 'Tuổi phải từ 15 trở lên')
        .max(60, 'Tuổi tối đa là 60')
        .optional()
        .nullable(),
    ),
    ageMax: z.preprocess(
      (val) => {
        if (val === '' || val === undefined || val === null) return undefined;
        const n = Number(val);
        return isNaN(n) ? val : n;
      },
      z
        .number({
          error: (iss) =>
            isEmptyInput(iss.input)
              ? 'Vui lòng nhập số hợp lệ'
              : 'Vui lòng nhập số hợp lệ',
        })
        .int('Tuổi phải là số nguyên')
        .min(15, 'Tuổi phải từ 15 trở lên')
        .max(60, 'Tuổi tối đa là 60')
        .optional()
        .nullable(),
    ),

    // Lương
    salaryMin: z.preprocess(
      (val) => {
        if (val === '' || val === undefined || val === null) return undefined;
        const rawValue = typeof val === 'string' ? val.replace(/,/g, '') : val;
        const n = Number(rawValue);
        return isNaN(n) ? val : n;
      },
      z
        .number({
          error: (iss) =>
            isEmptyInput(iss.input)
              ? 'Vui lòng nhập số hợp lệ'
              : 'Vui lòng nhập số hợp lệ',
        })
        .int('Lương phải là số nguyên')
        .min(0, 'Lương không được âm')
        .max(2000000000, 'Lương quá lớn, tối đa 2.000.000.000 VND')
        .optional()
        .nullable(),
    ),
    salaryMax: z.preprocess(
      (val) => {
        if (val === '' || val === undefined || val === null) return undefined;
        const rawValue = typeof val === 'string' ? val.replace(/,/g, '') : val;
        const n = Number(rawValue);
        return isNaN(n) ? val : n;
      },
      z
        .number({
          error: (iss) =>
            isEmptyInput(iss.input)
              ? 'Vui lòng nhập số hợp lệ'
              : 'Vui lòng nhập số hợp lệ',
        })
        .int('Lương phải là số nguyên')
        .min(0, 'Lương không được âm')
        .max(2000000000, 'Lương quá lớn, tối đa 2.000.000.000 VND')
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

export const CreateJobPage = ({
  onBack,
  onSuccess: onSuccessProp,
  isModal,
}) => {
  const PROVINCES_API = import.meta.env.VITE_PROVINCES_API_URL;
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: createJob, isPending: isSubmitting } = useCreateJob();

  const steps = [
    { title: 'Thông tin chung', icon: PenTool },
    { title: 'Địa điểm & Ca làm', icon: MapPin },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [sectors, setSectors] = useState([]);
  const [loadingSector, setLoadingSector] = useState(false);

  const { provinces, isLoading: loadingProvince } = useProvinces();
  const [districts, setDistricts] = useState([]);
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [insufficientPointModalOpen, setInsufficientPointModalOpen] =
    useState(false);
  const [insufficientPointMessage, setInsufficientPointMessage] = useState(
    'Số dư điểm không đủ để đăng tin.',
  );

  const { data: walletRes } = useMyWallet();
  const wallet = walletRes?.data || walletRes;
  const { data: walletPricingRes } = useWalletPricing();
  const walletPricing = walletPricingRes?.data || walletPricingRes || {};

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
    getValues,
    reset,
  } = form;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('walletTopupSuccess') !== '1') return;

    const resumeKey = params.get('resumeKey');
    const restored = consumeWalletResumeState(resumeKey);
    if (restored?.type === 'create-job') {
      if (restored?.formValues) {
        reset(restored.formValues);
      }
      setCurrentStep(Number(restored?.currentStep || 0));
    }
    toast('Nạp điểm thành công. Bạn có thể tiếp tục đăng tin.', 'success');

    params.delete('walletTopupSuccess');
    params.delete('resumeKey');
    navigate(
      params.toString()
        ? `${location.pathname}?${params.toString()}`
        : location.pathname,
      { replace: true },
    );
  }, [location.pathname, location.search, navigate, reset, toast]);

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
    if (!watchProvince || !provinces.length) {
      setDistricts([]);
      return;
    }

    const provinceObj = provinces.find(
      (p) =>
        p.name.trim().toLowerCase() === watchProvince?.trim().toLowerCase(),
    );

    if (!provinceObj) {
      console.warn(
        '[CreateJob] Province not found in list. watchProvince:',
        watchProvince,
        'available:',
        provinces.map((p) => p.name),
      );
      return;
    }

    const fetchDistricts = async () => {
      try {
        setLoadingDistrict(true);
        const res = await fetch(
          `${PROVINCES_API}/p/${provinceObj.code}?depth=2`,
        );

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setDistricts(data.districts || data.wards || []);
      } catch (err) {
        console.error('[CreateJob] Fetch districts error:', err);
        toast('Không thể tải danh sách quận huyện', 'error');
      } finally {
        setLoadingDistrict(false);
      }
    };
    fetchDistricts();
  }, [watchProvince, provinces, PROVINCES_API, toast]);

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
    };

    createJob(payload, {
      onSuccess: (res) => {
        const msg = res?.message || 'Đã đăng tin tuyển dụng thành công';
        toast(msg, 'success');
        if (onSuccessProp) {
          onSuccessProp();
        } else if (onBack) {
          onBack();
        } else {
          navigate('/employer/jobs');
        }
      },
      onError: (error) => {
        const errorText = extractApiErrorMessage(
          error,
          'Tạo tin tuyển dụng thất bại',
        );
        if (isInsufficientPointError(error)) {
          setInsufficientPointMessage(errorText);
          setInsufficientPointModalOpen(true);
          return;
        }
        toast(errorText, 'error');
      },
    });
  };

  const handleGoToTopup = () => {
    goToWalletTopup({
      navigate,
      location,
      resumePayload: {
        type: 'create-job',
        currentStep,
        formValues: getValues(),
      },
    });
  };

  const FieldError = ({ error }) => {
    if (!error) return null;
    const message =
      error.message === 'Invalid input'
        ? 'Vui lòng điền thông tin hợp lệ'
        : error.message;
    return (
      <p className="text-red-500 text-xs mt-1.5 font-medium">{message}</p>
    );
  };

  return (
    <>
      <div
        className={
          isModal
            ? 'w-full bg-transparent'
            : 'min-h-screen bg-slate-50 py-8 px-4'
        }
      >
        <div
          className={
            isModal
              ? 'w-full bg-transparent p-0 border-0 shadow-none'
              : 'max-w-5xl mx-auto bg-white rounded-2xl w-full max-h-[none] sm:max-h-[90vh] overflow-y-auto relative p-6 shadow-xl border border-slate-100'
          }
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10 rounded-full hover:bg-gray-100"
            onClick={() => (onBack ? onBack() : navigate('/employer/jobs'))}
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

          <Card
            className={`rounded-2xl border-0 overflow-hidden ${isModal ? 'bg-white border border-slate-100 shadow-sm' : 'bg-white shadow-xl'}`}
          >
            <div className="h-2 bg-primary w-full" />
            <div className="p-8 sm:p-10">
              {/* STEP 1: THÔNG TIN CHUNG */}
              {currentStep === 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                    <Briefcase className="text-primary" /> Thông tin công việc
                  </h2>
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-slate-700">
                    <p>
                      Số dư ví:{' '}
                      <strong>
                        {(wallet?.balancePoint || 0).toLocaleString('vi-VN')}{' '}
                        điểm
                      </strong>
                    </p>
                    <p className="mt-1">
                      Chi phí đăng tin:{' '}
                      <strong>
                        {Number(
                          walletPricing?.JOB_POST_POINT_COST || 0,
                        ).toLocaleString('vi-VN')}{' '}
                        điểm
                      </strong>{' '}
                      (tin đầu tiên bạn sẽ được đăng miễn phí).
                    </p>
                  </div>

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
                            value={field.value || ''}
                            disabled={loadingSector}
                            modal={false}
                          >
                            <SelectTrigger
                              className={`h-12 rounded-xl bg-gray-50 border-gray-200 hover:border-primary/50 transition-colors ${errors.sectorId ? 'border-red-500 focus:ring-red-500' : ''}`}
                            >
                              <SelectValue
                                placeholder={
                                  loadingSector
                                    ? 'Đang tải...'
                                    : 'Chọn lĩnh vực'
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
                            value={field.value?.toString() || ''}
                            disabled={!watchSectorId}
                            modal={false}
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
                      placeholder="VD: Tuyển công nhân cơ khí - chế tạo máy CNC"
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
                        {...register('quantity')}
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
                            value={field.value || ''}
                            modal={false}
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
                            placeholder="Từ (Tối thiểu 15)"
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
                          <Controller
                            control={control}
                            name="salaryMin"
                            render={({
                              field: { onChange, value, ...field },
                            }) => (
                              <Input
                                {...field}
                                type="number"
                                placeholder="Từ (Tối thiểu 0)"
                                className={`h-11 bg-white ${errors.salaryMin ? 'border-red-500' : ''}`}
                                value={value ?? ''}
                                onChange={(e) =>
                                  onChange(
                                    e.target.value === ''
                                      ? undefined
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            )}
                          />
                          <FieldError error={errors.salaryMin} />
                        </div>
                        <span className="text-gray-400 font-medium mt-3">
                          -
                        </span>
                        <div className="flex-1">
                          <Controller
                            control={control}
                            name="salaryMax"
                            render={({
                              field: { onChange, value, ...field },
                            }) => (
                              <Input
                                {...field}
                                type="number"
                                placeholder="Đến"
                                className={`h-11 bg-white ${errors.salaryMax ? 'border-red-500' : ''}`}
                                value={value ?? ''}
                                onChange={(e) =>
                                  onChange(
                                    e.target.value === ''
                                      ? undefined
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            )}
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
                      <CheckCircle size={12} className="text-green-500" /> Tin
                      sẽ tự động ẩn sau ngày này
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
                          value={field.value || ''}
                          modal={false}
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
                            value={field.value || ''}
                            disabled={loadingProvince}
                            modal={false}
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
                            key={watchProvince}
                            onValueChange={field.onChange}
                            value={field.value || ''}
                            disabled={!watchProvince || loadingDistrict}
                            modal={false}
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
                      <Loader2 className="animate-spin" size={18} /> Đang tạo
                      tin...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} /> Đăng tin bằng điểm
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <InsufficientPointModal
        open={insufficientPointModalOpen}
        onClose={() => setInsufficientPointModalOpen(false)}
        onGoTopup={handleGoToTopup}
        message={insufficientPointMessage}
      />
    </>
  );
};

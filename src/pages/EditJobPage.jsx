import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { z } from 'zod';

const step0Schema = z
  .object({
    occupationId: z.coerce.number().min(1, 'Vui lòng chọn ngành nghề'),
    title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
    description: z.string().min(20, 'Mô tả phải có ít nhất 20 ký tự'),
    quantity: z.coerce.number().min(1, 'Số lượng tuyển phải lớn hơn 0'),
    ageMin: z.preprocess(
      (v) => (v === '' || v === null ? undefined : Number(v)),
      z.number().min(18, 'Tuổi tối thiểu phải từ 18').optional(),
    ),
    ageMax: z.preprocess(
      (v) => (v === '' || v === null ? undefined : Number(v)),
      z.number().min(18, 'Tuổi tối đa phải từ 18').optional(),
    ),
    salaryMin: z.preprocess(
      (v) => (v === '' || v === null ? undefined : Number(v)),
      z
        .number()
        .min(0, 'Lương không được âm')
        .max(100000000, 'Lương không được quá 100.000.000')
        .optional(),
    ),
    salaryMax: z.preprocess(
      (v) => (v === '' || v === null ? undefined : Number(v)),
      z
        .number()
        .min(0, 'Lương không được âm')
        .max(100000000, 'Lương không được quá 100.000.000')
        .optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.ageMin && data.ageMax && data.ageMin > data.ageMax) {
      ctx.addIssue({
        path: ['ageMax'],
        message: 'Tuổi tối đa không được nhỏ hơn tuổi tối thiểu',
        code: 'custom',
      });
    }
    if (data.salaryMin && data.salaryMax && data.salaryMin > data.salaryMax) {
      ctx.addIssue({
        path: ['salaryMax'],
        message: 'Lương tối đa không được nhỏ hơn lương tối thiểu',
        code: 'custom',
      });
    }
  });

const step1Schema = z.object({
  workingShift: z.string().min(1, 'Vui lòng chọn ca làm việc'),
  province: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  district: z.string().min(1, 'Vui lòng chọn Quận/Huyện'),
});

import { useUpdateJob } from '@/features/jobs/useJobMutation';
import { useJobDetail } from '@/features/jobs/api/useJobs';
import { useToast } from '@/shared/contexts/ToastContext';
import { apiClient } from '@/shared/api/apiClient';
import { useProvinces } from '@/shared/hooks/useProvinces';
import { X, PenTool, MapPin, CheckCircle } from 'lucide-react';
export const EditJobPage = ({ jobIdProp, onBack, onSuccess }) => {
  const { jobId: paramsId } = useParams();
  const jobId = jobIdProp || paramsId;
  const navigate = useNavigate();
  const PROVINCES_API = import.meta.env.VITE_PROVINCES_API_URL;
  const { toast } = useToast();

  const steps = [
    { title: 'Ngành nghề & Thông tin', icon: PenTool },
    { title: 'Địa điểm & Ca làm', icon: MapPin },
  ];
  const { data: jobDetail, isLoading } = useJobDetail(Number(jobId));
  const { mutate: updateJob, isPending } = useUpdateJob();
  const [currentStep, setCurrentStep] = useState(0);
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState('');
  const [loadingSector, setLoadingSector] = useState(false);
  const [occupations, setOccupations] = useState([]);
  const [loadingOccupation, setLoadingOccupation] = useState(false);
  const { provinces, isLoading: loadingProvince } = useProvinces();
  const [districts, setDistricts] = useState([]);
  const [loadingDistrict, setLoadingDistrict] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    occupationId: '',
    workingShift: '',
    quantity: '',
    genderRequirement: '',
    address: '',
    province: '',
    district: '',
    ageMin: '',
    ageMax: '',
    salaryMin: '',
    salaryMax: '',
  });
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setErrorMessage('');
      setErrors({});
    }
  };

  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  const FieldError = ({ error }) => {
    if (!error) return null;
    return <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>;
  };

  const validateStep = (stepIndex) => {
    setErrorMessage('');

    // sectorId is independent of the form block
    if (stepIndex === 0 && !selectedSector) {
      setErrors({ sectorId: 'Vui lòng chọn lĩnh vực.' });
      return false;
    }

    let schemaToValidate;
    if (stepIndex === 0) schemaToValidate = step0Schema;
    if (stepIndex === 1) schemaToValidate = step1Schema;

    if (schemaToValidate) {
      const result = schemaToValidate.safeParse(form);
      if (!result.success) {
        const fieldErrors = {};
        result.error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          if (!fieldErrors[path]) {
            fieldErrors[path] = issue.message;
          }
        });
        setErrors(fieldErrors);
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const nextStep = () => {
    const isValid = validateStep(currentStep);
    if (!isValid) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (!jobDetail) return;

    setForm({
      title: jobDetail.title || '',
      description: jobDetail.description || '',
      occupationId: jobDetail.occupationId || '',
      workingShift: jobDetail.workingShift || '',
      quantity: jobDetail.quantity || '',
      genderRequirement: jobDetail.genderRequirement || '',
      address: jobDetail.address || '',
      province: jobDetail.province || '',
      district: jobDetail.district || '',
      ageMin: jobDetail.ageMin || '',
      ageMax: jobDetail.ageMax || '',
      salaryMin: jobDetail.salaryMin || '',
      salaryMax: jobDetail.salaryMax || '',
    });

    const foundSector = sectors.find((sector) =>
      sector.occupations?.some((o) => o.id === jobDetail.occupationId),
    );

    if (foundSector) {
      setSelectedSector(foundSector.id.toString());
    }
    console.log('jobDetail:', jobDetail);
    console.log('sectors:', sectors);
    console.log('form:', form);
    console.log('jobId:', jobId);
    console.log('jobDetail:', jobDetail);
    console.log('isLoading:', isLoading);
  }, [jobDetail, sectors]);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoadingSector(true);

        // apiClient đã có baseURL + unwrap data
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

  useEffect(() => {
    if (!selectedSector) {
      setOccupations([]);
      return;
    }

    const sector = sectors.find((s) => s.id === Number(selectedSector));

    setOccupations(sector?.occupations || []);
  }, [selectedSector, sectors]);
  useEffect(() => {
    if (!form.province) {
      setDistricts([]);
      return;
    }

    const provinceObj = provinces.find(
      (p) => p.name.trim().toLowerCase() === form.province.trim().toLowerCase(),
    );

    if (!provinceObj) return;

    const fetchDistricts = async () => {
      try {
        setLoadingDistrict(true);
        const res = await fetch(
          `${PROVINCES_API}/p/${provinceObj.code}?depth=2`,
        );
        const data = await res.json();
        const districtList = data.districts || data.wards || [];
        setDistricts(districtList);
      } catch (err) {
        console.error('[EditJob] Fetch district error:', err);
      } finally {
        setLoadingDistrict(false);
      }
    };

    fetchDistricts();
  }, [form.province, provinces]);

  if (isLoading) return <div>Loading...</div>;

  const handleSubmit = () => {
    const isValid = validateStep(currentStep);
    if (!isValid) return;

    const payload = {
      title: form.title,
      description: form.description,
      occupationId: Number(form.occupationId),
      workingShift: form.workingShift,
      quantity: Number(form.quantity),

      genderRequirement: form.genderRequirement || null,
      address: form.address || null,
      province: form.province || null,
      district: form.district || null,

      ageMin:
        form.ageMin !== '' && form.ageMin !== undefined && form.ageMin !== null
          ? Number(form.ageMin)
          : null,
      ageMax:
        form.ageMax !== '' && form.ageMax !== undefined && form.ageMax !== null
          ? Number(form.ageMax)
          : null,
      salaryMin:
        form.salaryMin !== '' &&
        form.salaryMin !== undefined &&
        form.salaryMin !== null
          ? Number(form.salaryMin)
          : null,
      salaryMax:
        form.salaryMax !== '' &&
        form.salaryMax !== undefined &&
        form.salaryMax !== null
          ? Number(form.salaryMax)
          : null,
    };

    updateJob(
      {
        jobId: Number(jobId),
        payload,
      },
      {
        onSuccess: () => {
          toast('Cập nhật thành công', 'success');
          if (onSuccess) {
            onSuccess();
          } else {
            navigate('/employer');
          }
        },
        onError: (err) => {
          console.error('Lỗi cập nhật:', err);
          const message =
            err?.response?.data?.message ||
            'Lỗi khi cập nhật tin. Vui lòng thử lại.';
          setErrorMessage(
            Array.isArray(message) ? message.join(', ') : message,
          );
          toast('Cập nhật thất bại', 'error');
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative p-8 shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10 rounded-full hover:bg-gray-100"
          onClick={() => (onBack ? onBack() : navigate('/employer'))}
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="mb-6 pt-2">
          <h1 className="text-2xl font-semibold">Chỉnh sửa tin tuyển dụng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hoàn thành các bước để cập nhập tin tuyển dụng
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
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600 text-sm">
            {errorMessage}
          </div>
        )}
        <Card className="p-8 rounded-xl shadow-sm min-h-[450px]">
          {/* STEP 1 */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Lĩnh vực *</label>
                  <select
                    className={`w-full mt-1 h-11 rounded-xl border px-3 text-sm bg-white hover:border-primary/50 transition-colors ${errors.sectorId ? 'border-red-500' : ''}`}
                    value={selectedSector}
                    onChange={(e) => {
                      setSelectedSector(e.target.value);
                      setForm({ ...form, occupationId: '' });
                      setErrors({ ...errors, sectorId: undefined });
                    }}
                    disabled={loadingSector}
                  >
                    <option value="">
                      {loadingSector ? 'Đang tải...' : 'Chọn lĩnh vực'}
                    </option>
                    {sectors.map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                  <FieldError error={errors.sectorId} />
                </div>

                <div>
                  <label className="text-sm font-medium">Ngành nghề *</label>
                  <select
                    className={`w-full mt-1 h-11 rounded-xl border px-3 text-sm bg-white hover:border-primary/50 transition-colors ${errors.occupationId ? 'border-red-500' : ''}`}
                    value={form.occupationId}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        occupationId: Number(e.target.value),
                      });
                      setErrors({ ...errors, occupationId: undefined });
                    }}
                    disabled={!selectedSector || loadingOccupation}
                  >
                    <option value="">
                      {!selectedSector
                        ? 'Chọn lĩnh vực trước'
                        : loadingOccupation
                          ? 'Đang tải...'
                          : 'Chọn ngành nghề'}
                    </option>
                    {occupations.map((occupation) => (
                      <option key={occupation.id} value={occupation.id}>
                        {occupation.name}
                      </option>
                    ))}
                  </select>
                  <FieldError error={errors.occupationId} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tiêu đề *</label>
                <Input
                  className={`h-11 rounded-xl hover:border-primary/50 transition-colors ${errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value });
                    setErrors({ ...errors, title: undefined });
                  }}
                />
                <FieldError error={errors.title} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mô tả *</label>
                <textarea
                  className={`w-full rounded-xl border px-4 py-3 text-sm min-h-[140px] hover:border-primary/50 transition-colors ${errors.description ? 'border-red-500 focus-visible:outline-red-500' : ''}`}
                  rows={4}
                  value={form.description}
                  onChange={(e) => {
                    setForm({ ...form, description: e.target.value });
                    setErrors({ ...errors, description: undefined });
                  }}
                />
                <FieldError error={errors.description} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">
                    Số lượng tuyển *
                  </label>
                  <Input
                    className={`h-11 mt-1 rounded-xl hover:border-primary/50 transition-colors ${errors.quantity ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    type="number"
                    value={form.quantity}
                    onChange={(e) => {
                      setForm({ ...form, quantity: e.target.value });
                      setErrors({ ...errors, quantity: undefined });
                    }}
                  />
                  <FieldError error={errors.quantity} />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Giới tính yêu cầu
                  </label>
                  <select
                    className="w-full mt-1 h-11 rounded-xl border px-3 text-sm bg-white hover:border-primary/50 transition-colors"
                    value={form.genderRequirement}
                    onChange={(e) =>
                      setForm({ ...form, genderRequirement: e.target.value })
                    }
                  >
                    <option value="">Không yêu cầu</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Độ tuổi yêu cầu
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input
                        className={`h-11 bg-white hover:border-primary/50 transition-colors ${errors.ageMin ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        type="number"
                        placeholder="Từ (Tối thiểu 18)"
                        value={form.ageMin}
                        onChange={(e) => {
                          setForm({ ...form, ageMin: e.target.value });
                          setErrors({ ...errors, ageMin: undefined });
                        }}
                      />
                      <FieldError error={errors.ageMin} />
                    </div>
                    <span className="text-gray-400 font-medium">-</span>
                    <div className="flex-1">
                      <Input
                        className={`h-11 bg-white hover:border-primary/50 transition-colors ${errors.ageMax ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        type="number"
                        placeholder="Đến"
                        value={form.ageMax}
                        onChange={(e) => {
                          setForm({ ...form, ageMax: e.target.value });
                          setErrors({ ...errors, ageMax: undefined });
                        }}
                      />
                      <FieldError error={errors.ageMax} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Mức lương yêu cầu (VND)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input
                        className={`h-11 bg-white hover:border-primary/50 transition-colors ${errors.salaryMin ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        type="text"
                        placeholder="Từ (Tối thiểu 0)"
                        value={
                          form.salaryMin
                            ? new Intl.NumberFormat('en-US').format(
                                form.salaryMin,
                              )
                            : ''
                        }
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(
                            /[^0-9]/g,
                            '',
                          );
                          setForm({ ...form, salaryMin: rawValue });
                          setErrors({ ...errors, salaryMin: undefined });
                        }}
                      />
                      <FieldError error={errors.salaryMin} />
                    </div>
                    <span className="text-gray-400 font-medium">-</span>
                    <div className="flex-1">
                      <Input
                        className={`h-11 bg-white hover:border-primary/50 transition-colors ${errors.salaryMax ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        type="text"
                        placeholder="Đến"
                        value={
                          form.salaryMax
                            ? new Intl.NumberFormat('en-US').format(
                                form.salaryMax,
                              )
                            : ''
                        }
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(
                            /[^0-9]/g,
                            '',
                          );
                          setForm({ ...form, salaryMax: rawValue });
                          setErrors({ ...errors, salaryMax: undefined });
                        }}
                      />
                      <FieldError error={errors.salaryMax} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Ca làm *</label>
                  <select
                    className={`w-full mt-1 h-11 rounded-xl border px-3 text-sm bg-white hover:border-primary/50 transition-colors ${errors.workingShift ? 'border-red-500' : ''}`}
                    value={form.workingShift}
                    onChange={(e) => {
                      setForm({ ...form, workingShift: e.target.value });
                      setErrors({ ...errors, workingShift: undefined });
                    }}
                  >
                    <option value="">Chọn ca</option>
                    <option value="MORNING">Ca sáng</option>
                    <option value="AFTERNOON">Ca chiều</option>
                    <option value="NIGHT">Ca tối</option>
                    <option value="FULL_DAY">Toàn thời gian</option>
                    <option value="FLEXIBLE">Linh hoạt</option>
                  </select>
                  <FieldError error={errors.workingShift} />
                </div>

                <div>
                  <label className="text-sm font-medium">Địa chỉ</label>
                  <Input
                    className="mt-1 h-11 rounded-xl bg-white hover:border-primary/50 transition-colors"
                    value={form.address}
                    placeholder="Số nhà, đường, ngõ..."
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">
                    Tỉnh/Thành phố *
                  </label>
                  <select
                    className={`w-full mt-1 h-11 rounded-xl border px-3 text-sm bg-white hover:border-primary/50 transition-colors ${errors.province ? 'border-red-500' : ''}`}
                    value={form.province}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        province: e.target.value,
                        district: '',
                      });
                      setErrors({ ...errors, province: undefined });
                    }}
                    disabled={loadingProvince}
                  >
                    <option value="">
                      {loadingProvince ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}
                    </option>

                    {provinces.map((province) => (
                      <option key={province.code} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  <FieldError error={errors.province} />
                </div>

                {/* District */}
                <div>
                  <label className="text-sm font-medium">Quận/Huyện *</label>
                  <select
                    className={`w-full mt-1 h-11 rounded-xl border px-3 text-sm bg-white hover:border-primary/50 transition-colors ${errors.district ? 'border-red-500' : ''}`}
                    value={form.district}
                    onChange={(e) => {
                      setForm({ ...form, district: e.target.value });
                      setErrors({ ...errors, district: undefined });
                    }}
                    disabled={!form.province || loadingDistrict}
                  >
                    <option value="">
                      {!form.province
                        ? 'Chọn tỉnh trước'
                        : loadingDistrict
                          ? 'Đang tải...'
                          : 'Chọn quận/huyện'}
                    </option>

                    {districts.map((district) => (
                      <option key={district.code} value={district.name}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  <FieldError error={errors.district} />
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Quay lại
          </Button>

          <Button
            onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
            disabled={isPending}
          >
            {currentStep === steps.length - 1
              ? isPending
                ? 'Đang cập nhật...'
                : 'Cập nhật tin'
              : 'Tiếp tục'}
          </Button>
        </div>
      </div>
    </div>
  );
};

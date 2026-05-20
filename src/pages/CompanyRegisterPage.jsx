import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Image } from '@tiptap/extension-image';
import {
  Loader2,
  Image as ImageIcon,
  Check,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Highlighter,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Building2,
  Globe,
  MapPin,
  FileText,
  Upload,
  FileUp,
  Info,
} from 'lucide-react';
import {
  useGetMyCompany,
  useCreateCompany,
  useUpdateCompany,
} from '@/features/companies/api/useGetCompanies';

const getPlainTextFromHtml = (html = '') =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const normalizeAddressText = (value = '') =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const stripProvincePrefix = (value = '') =>
  normalizeAddressText(value)
    .replace(/^(tinh|thanh pho|tp)\s+/, '')
    .trim();

const stripWardPrefix = (value = '') =>
  normalizeAddressText(value)
    .replace(/^(xa|phuong|thi tran|tt)\s+/, '')
    .trim();

const findBestRegionMatch = (
  parts,
  regions = [],
  normalizer = (v) => normalizeAddressText(v),
) => {
  const normalizedRegions = regions.map((region) => ({
    ...region,
    normalizedName: normalizer(region.name),
  }));

  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const part = parts[index];
    const normalizedPart = normalizer(part);
    const candidates = normalizedRegions.filter(
      (region) =>
        normalizedPart === region.normalizedName ||
        normalizedPart.includes(region.normalizedName) ||
        region.normalizedName.includes(normalizedPart),
    );

    if (candidates.length > 0) {
      const bestMatch = candidates.sort(
        (a, b) => b.normalizedName.length - a.normalizedName.length,
      )[0];
      return {
        item: bestMatch,
        index,
      };
    }
  }

  return null;
};

const splitAddressParts = (address = '') =>
  address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

const WEBSITE_SHAPE = /^[^\s]+\.[^\s]+$/;

/** CompanyRegisterPage gán `companyRegistrationEditMode = isEdit` mỗi render (trước submit/validate). */
let companyRegistrationEditMode = false;
let companyRegistrationHasExistingLogo = false;
let companyRegistrationHasExistingLicense = false;

const companyRegistrationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Tên công ty không được để trống')
      .min(3, 'Tên công ty phải từ 3 – 100 ký tự')
      .max(100, 'Tên công ty phải từ 3 – 100 ký tự'),
    taxCode: z
      .string()
      .trim()
      .min(1, 'Mã số thuế không được để trống')
      .regex(/^[0-9]{10,13}$/, 'Mã số thuế phải từ 10 – 13 chữ số'),
    address: z
      .string()
      .trim()
      .min(1, 'Địa chỉ không được để trống')
      .min(5, 'Địa chỉ phải từ 5 – 255 ký tự')
      .max(255, 'Địa chỉ phải từ 5 – 255 ký tự'),
    description: z.string(),
    provinceCode: z
      .string()
      .trim()
      .min(1, 'Vui lòng chọn Tỉnh / Thành phố'),
    wardCode: z
      .string()
      .trim()
      .min(1, 'Vui lòng chọn Xã / Phường'),
    website: z
      .string()
      .trim()
      .min(1, 'Website không được để trống')
      .regex(WEBSITE_SHAPE, 'Website không hợp lệ (VD: tencongty.vn)'),
    logoFile: z.any().optional().nullable(),
    businessLicenseFile: z.any().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const plain = getPlainTextFromHtml(data.description || '');
    if (!plain) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mô tả không được để trống',
        path: ['description'],
      });
    } else if (plain.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mô tả phải tối thiểu 10 ký tự',
        path: ['description'],
      });
    }
  })
  .superRefine((data, ctx) => {
    const hasLogo = data.logoFile instanceof File || companyRegistrationHasExistingLogo;
    if (!hasLogo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Logo không được để trống',
        path: ['logoFile'],
      });
    }
  })
  .superRefine((data, ctx) => {
    const hasLicense =
      data.businessLicenseFile instanceof File ||
      companyRegistrationHasExistingLicense;
    if (!hasLicense) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Giấy phép kinh doanh không được để trống',
        path: ['businessLicenseFile'],
      });
    }
  })
  .superRefine((data, ctx) => {
    const f = data.logoFile;
    if (f instanceof File) {
      if (!['image/jpeg', 'image/png'].includes(f.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Logo phải là file JPG hoặc PNG',
          path: ['logoFile'],
        });
      }
      if (f.size > 2 * 1024 * 1024) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Logo không được vượt quá 2MB',
          path: ['logoFile'],
        });
      }
    }
  })
  .superRefine((data, ctx) => {
    const f = data.businessLicenseFile;
    if (f instanceof File) {
      const ok = ['application/pdf', 'image/jpeg', 'image/png'].includes(
        f.type,
      );
      if (!ok) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Giấy phép phải là PDF, JPG hoặc PNG',
          path: ['businessLicenseFile'],
        });
      }
      if (f.size > 5 * 1024 * 1024) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Giấy phép không được vượt quá 5MB',
          path: ['businessLicenseFile'],
        });
      }
    }
  });

const EditorButton = ({ onClick, isActive, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`company-editor-btn ${isActive ? 'active' : ''}`}
  >
    {children}
  </button>
);

const CompanyDescriptionEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Image.configure({
        HTMLAttributes: { class: 'company-editor-image' },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'company-editor-content',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value || '<p></p>', false);
    }
  }, [editor, value]);

  const insertImageByUrl = () => {
    const url = window.prompt('Nhập URL ảnh');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  if (!editor) {
    return (
      <div className="company-editor-shell">
        <div className="company-editor-content">Đang tải editor...</div>
      </div>
    );
  }

  const headingLevel = editor.getAttributes('heading').level;
  const currentHeading = headingLevel ? `h${headingLevel}` : 'p';

  return (
    <div className="company-editor-shell">
      <div className="company-editor-toolbar">
        <EditorButton
          title="Đậm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
        >
          <Bold size={15} />
        </EditorButton>
        <EditorButton
          title="Nghiêng"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
        >
          <Italic size={15} />
        </EditorButton>
        <EditorButton
          title="Gạch chân"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
        >
          <UnderlineIcon size={15} />
        </EditorButton>
        <EditorButton
          title="Tô sáng"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
        >
          <Highlighter size={15} />
        </EditorButton>

        <div className="company-editor-divider" />

        <EditorButton
          title="Căn trái"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
        >
          <AlignLeft size={15} />
        </EditorButton>
        <EditorButton
          title="Căn giữa"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
        >
          <AlignCenter size={15} />
        </EditorButton>
        <EditorButton
          title="Căn phải"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
        >
          <AlignRight size={15} />
        </EditorButton>
        <EditorButton
          title="Căn đều"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
        >
          <AlignJustify size={15} />
        </EditorButton>

        <div className="company-editor-divider" />

        <select
          className="company-editor-select"
          value={currentHeading}
          onChange={(e) => {
            const selected = e.target.value;
            if (selected === 'p') {
              editor.chain().focus().setParagraph().run();
            } else {
              const level = Number(selected.replace('h', ''));
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
        >
          <option value="p">Cỡ thường</option>
          <option value="h3">Cỡ vừa</option>
          <option value="h2">Cỡ lớn</option>
          <option value="h1">Cỡ rất lớn</option>
        </select>

        <div className="company-editor-divider" />

        <EditorButton
          title="Chèn ảnh từ URL"
          onClick={insertImageByUrl}
          isActive={false}
        >
          <Link2 size={15} />
        </EditorButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export const CompanyRegisterPage = ({ isModal = false, onSuccess, onBack }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const logoInputRef = useRef(null);
  const licenseInputRef = useRef(null);

  const [companyId, setCompanyId] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [licenseUrl, setLicenseUrl] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [licensePreview, setLicensePreview] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadedWardProvinceCode, setLoadedWardProvinceCode] = useState('');
  const [pendingAddressParse, setPendingAddressParse] = useState(null);
  const [addressHydrated, setAddressHydrated] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // ========== HOOKS ==========
  const { data: myCompany, isLoading: isFetchingCompany } = useGetMyCompany();
  const { mutateAsync: createCompanyMutate } = useCreateCompany();
  const { mutateAsync: updateCompanyMutate } = useUpdateCompany();

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, submitCount },
  } = useForm({
    resolver: zodResolver(companyRegistrationSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      taxCode: '',
      address: '',
      description: '',
      website: '',
      logoFile: null,
      businessLicenseFile: null,
      provinceCode: '',
      wardCode: '',
    },
  });

  /** Đồng bộ mã tỉnh/xã vào giá trị form; validate khi đã thử submit (tránh báo lỗi ngay khi vào trang). */
  useEffect(() => {
    setValue('provinceCode', selectedProvinceCode, {
      shouldValidate: submitCount > 0,
    });
  }, [selectedProvinceCode, setValue, submitCount]);

  useEffect(() => {
    setValue('wardCode', selectedWardCode, {
      shouldValidate: submitCount > 0,
    });
  }, [selectedWardCode, setValue, submitCount]);

  const watchedAddress = watch('address');
  /** Zod resolver dùng khi kiểm tra bắt buộc file trên cả tạo mới/cập nhật */
  companyRegistrationEditMode = isEdit;
  companyRegistrationHasExistingLogo = Boolean(logoUrl);
  companyRegistrationHasExistingLicense = Boolean(licenseUrl);

  const bizLicenseFileWatch = watch('businessLicenseFile');

  const buildFullAddress = (detail, wardCode, provinceCode) => {
    const wardName =
      wards.find((item) => String(item.code) === String(wardCode))?.name || '';
    const provinceName =
      provinces.find((item) => String(item.code) === String(provinceCode))
        ?.name || '';

    return [detail?.trim(), wardName, provinceName].filter(Boolean).join(', ');
  };

  const syncAddress = (detail, wardCode, provinceCode) => {
    const fullAddress = buildFullAddress(detail, wardCode, provinceCode);
    const merged =
      (typeof fullAddress === 'string' && fullAddress.trim()
        ? fullAddress
        : detail) ?? '';
    setValue('address', typeof merged === 'string' ? merged : '', {
      shouldValidate: true,
    });
  };

  useEffect(() => {
    if (isFetchingCompany || myCompany === undefined) {
      setLoading(isFetchingCompany);
      return;
    }

    // Nếu có data công ty (kể cả data mảng null tuỳ API trả về)
    if (myCompany && myCompany.id) {
      setCompanyId(myCompany.id);

      reset({
        name: myCompany.name ?? '',
        taxCode: myCompany.taxCode ?? '',
        address: myCompany.address ?? '',
        description: myCompany.description ?? '',
        website: myCompany.website ?? '',
        logoFile: null,
        businessLicenseFile: null,
        provinceCode: '',
        wardCode: '',
      });
      setAddressDetail('');
      setSelectedProvinceCode('');
      setSelectedWardCode('');
      setWards([]);
      setLoadedWardProvinceCode('');
      setPendingAddressParse(null);
      setAddressHydrated(false);

      setLogoUrl(myCompany.logoUrl ?? null);
      setLicenseUrl(myCompany.businessLicenseUrl ?? null);

      setIsEdit(true);
    } else {
      setIsEdit(false);
    }

    setLoading(false);
  }, [myCompany, isFetchingCompany]);

  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const response = await fetch('https://provinces.open-api.vn/api/v2/p/');
      if (!response.ok) {
        throw new Error('Failed to fetch provinces');
      }
      const data = await response.json();
      setProvinces(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast('Không thể tải danh sách Tỉnh/Thành phố', 'error');
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchWardsByProvince = async (provinceCode) => {
    if (!provinceCode) {
      setWards([]);
      setLoadedWardProvinceCode('');
      return;
    }

    setLoadingWards(true);
    setLoadedWardProvinceCode('');
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`,
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch wards: ${response.status}`);
      }

      const data = await response.json();
      let wardList = [];

      if (Array.isArray(data?.wards)) {
        // API v2: Province -> Wards (2 levels)
        wardList = data.wards.map((ward) => ({
          ...ward,
          districtName: '',
        }));
      } else if (Array.isArray(data?.districts)) {
        // Fallback for old structure
        wardList = data.districts.flatMap((district) =>
          (district?.wards || []).map((ward) => ({
            ...ward,
            districtName: district.name,
          })),
        );
      }

      setWards(wardList);
    } catch (error) {
      console.error(error);
      setWards([]);
      toast('Không thể tải danh sách Xã/Phường', 'error');
    } finally {
      setLoadingWards(false);
      setLoadedWardProvinceCode(String(provinceCode));
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!selectedProvinceCode) return;
    fetchWardsByProvince(selectedProvinceCode);
  }, [selectedProvinceCode]);

  useEffect(() => {
    if (
      !isEdit ||
      addressHydrated ||
      !watchedAddress ||
      provinces.length === 0
    )
      return;

    const addressParts = splitAddressParts(watchedAddress);
    const provinceMatch = findBestRegionMatch(
      addressParts,
      provinces,
      stripProvincePrefix,
    );

    if (!provinceMatch) {
      setAddressDetail(watchedAddress);
      setAddressHydrated(true);
      return;
    }

    const remainingParts = addressParts.filter(
      (_, index) => index !== provinceMatch.index,
    );
    setSelectedProvinceCode(String(provinceMatch.item.code));
    setPendingAddressParse({
      remainingAddress: remainingParts.join(', '),
      provinceCode: String(provinceMatch.item.code),
    });
  }, [isEdit, addressHydrated, watchedAddress, provinces]);

  useEffect(() => {
    if (!pendingAddressParse) return;
    if (
      selectedProvinceCode !== pendingAddressParse.provinceCode ||
      loadingWards
    )
      return;
    if (loadedWardProvinceCode !== pendingAddressParse.provinceCode) return;

    const remainingParts = splitAddressParts(
      pendingAddressParse.remainingAddress,
    );
    const wardMatch = findBestRegionMatch(
      remainingParts,
      wards,
      stripWardPrefix,
    );

    if (wardMatch) {
      setSelectedWardCode(String(wardMatch.item.code));
      const detailParts = remainingParts.filter(
        (_, index) => index !== wardMatch.index,
      );
      setAddressDetail(detailParts.join(', '));
    } else {
      setSelectedWardCode('');
      setAddressDetail(pendingAddressParse.remainingAddress || watchedAddress);
    }

    setPendingAddressParse(null);
    setAddressHydrated(true);
  }, [
    pendingAddressParse,
    selectedProvinceCode,
    wards,
    loadingWards,
    loadedWardProvinceCode,
    watchedAddress,
  ]);

  const onSubmit = async (values) => {
    if (loadingSubmit) return;

    const hasCompanyProfileChanged =
      !isEdit ||
      !myCompany ||
      values.name.trim() !== (myCompany.name ?? '').trim() ||
      values.taxCode.trim() !== (myCompany.taxCode ?? '').trim() ||
      values.address.trim() !== (myCompany.address ?? '').trim() ||
      values.description !== (myCompany.description ?? '') ||
      values.website.trim() !== (myCompany.website ?? '').trim() ||
      values.logoFile instanceof File ||
      values.businessLicenseFile instanceof File;

    if (!hasCompanyProfileChanged) {
      toast('Không có thay đổi để cập nhật', 'error');
      return;
    }

    const fd = new FormData();
    fd.append('name', values.name.trim());
    fd.append('taxCode', values.taxCode.trim());
    fd.append('address', values.address.trim());
    fd.append('description', values.description);
    fd.append('website', values.website.trim());
    if (values.logoFile instanceof File)
      fd.append('logo', values.logoFile);
    if (values.businessLicenseFile instanceof File)
      fd.append('businessLicense', values.businessLicenseFile);

    try {
      setLoadingSubmit(true);

      if (isEdit) {
        await updateCompanyMutate({ companyId, formData: fd });
        toast('Đã gửi cập nhật thông tin công ty, vui lòng chờ quản lý duyệt lại');
      } else {
        await createCompanyMutate(fd);
        toast('Gửi đăng ký công ty thành công');
      }

      if (isModal && onSuccess) {
        onSuccess();
      } else {
        navigate('/employer');
      }
    } catch (error) {
      console.error(
        error?.response?.status,
        error?.response?.data || error.message,
      );
      const errorMsg =
        error?.response?.data?.message || 'Đăng ký công ty thất bại. Vui lòng thử lại.';
      toast(errorMsg, 'error');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Đang tải dữ liệu công ty...
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isModal ? 'pb-6' : ''}`}>
      <div
        className={`mx-auto w-full ${isModal
          ? 'max-w-4xl px-2 pb-4 md:px-6 md:pb-6'
          : 'max-w-3xl px-4 md:px-6 py-8'
          }`}
      >
        {!isModal && (
          <div className="mb-8 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Building2 className="text-primary" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {isEdit ? 'Hồ sơ doanh nghiệp' : 'Đăng ký doanh nghiệp'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {isEdit
                  ? 'Cập nhật mặt tiền chuyên nghiệp để thu hút ứng viên.'
                  : 'Hoàn thiện thông tin để bắt đầu hành trình chiêu mộ nhân tài.'}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={rhfHandleSubmit(onSubmit)} className="space-y-5">
          {/* ===== SECTION 1: Thông tin chung ===== */}
          <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <Info size={15} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Thông tin chung
                </h3>
                <p className="text-xs text-slate-500">
                  Thông tin cơ bản về pháp nhân doanh nghiệp
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  Tên công ty <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register('name')}
                  placeholder="VD: Công ty CP Giải pháp Công nghệ ABC"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    Mã số thuế <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('taxCode')}
                    placeholder="0123456789"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
                  />
                  {errors.taxCode && (
                    <p className="text-xs text-destructive">
                      {errors.taxCode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    Website <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Globe
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <Input
                      {...register('website')}
                      placeholder="company.vn"
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-9 focus:bg-white transition-colors"
                    />
                  </div>
                  {errors.website && (
                    <p className="text-xs text-destructive">
                      {errors.website.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* ===== SECTION 2: Trụ sở hoạt động ===== */}
          <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                <MapPin size={15} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Trụ sở hoạt động
                </h3>
                <p className="text-xs text-slate-500">
                  Địa chỉ chính thức của doanh nghiệp
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  Địa chỉ cụ thể <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={addressDetail}
                  onChange={(e) => {
                    const nextDetail = e.target.value;
                    setAddressDetail(nextDetail);
                    syncAddress(
                      nextDetail,
                      selectedWardCode,
                      selectedProvinceCode,
                    );
                  }}
                  placeholder="Số nhà, tên ngõ, tên đường..."
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
                />
                {errors.address && (
                  <p className="text-xs text-destructive">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    Tỉnh / Thành phố <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={selectedProvinceCode}
                    onChange={(e) => {
                      const nextProvinceCode = e.target.value;
                      setSelectedProvinceCode(nextProvinceCode);
                      setSelectedWardCode('');
                      setWards([]);
                      syncAddress(addressDetail, '', nextProvinceCode);
                    }}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-700 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:bg-white"
                  >
                    <option value="">
                      {loadingProvinces
                        ? 'Đang tải...'
                        : 'Chọn Tỉnh / Thành phố'}
                    </option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {errors.provinceCode && (
                    <p className="text-xs text-destructive">
                      {errors.provinceCode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    Xã / Phường <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={selectedWardCode}
                    onChange={(e) => {
                      const nextWardCode = e.target.value;
                      setSelectedWardCode(nextWardCode);
                      syncAddress(
                        addressDetail,
                        nextWardCode,
                        selectedProvinceCode,
                      );
                    }}
                    disabled={!selectedProvinceCode || loadingWards}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-700 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {!selectedProvinceCode
                        ? 'Chọn Tỉnh/TP trước'
                        : loadingWards
                          ? 'Đang tải...'
                          : 'Chọn Xã / Phường'}
                    </option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                        {ward.districtName ? ` (${ward.districtName})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.wardCode && (
                    <p className="text-xs text-destructive">
                      {errors.wardCode.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* ===== SECTION 3: Giới thiệu ===== */}
          <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <FileText size={15} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Giới thiệu công ty <span className="text-red-500">*</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Mô tả về công ty để thu hút ứng viên tiềm năng
                </p>
              </div>
            </div>

            <div className="p-5 space-y-1.5">
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <CompanyDescriptionEditor
                      value={field.value || ''}
                      onChange={(html) => field.onChange(html)}
                    />
                  )}
                />
              </div>
              {errors.description && (
                <p className="text-xs text-destructive px-1">
                  {errors.description.message}
                </p>
              )}
            </div>
          </Card>

          {/* ===== SECTION 4: Tài liệu & Hình ảnh ===== */}
          <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                <Upload size={15} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Tài liệu & Hình ảnh
                </h3>
                <p className="text-xs text-slate-500">
                  Logo và giấy phép kinh doanh của doanh nghiệp
                </p>
              </div>
            </div>

            <div className="p-5 grid md:grid-cols-2 gap-5">
              {/* --- Logo Upload --- */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Logo công ty <span className="text-red-500">*</span>
                </Label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setValue('logoFile', file, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                      setLogoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="group relative w-full h-44 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden"
                >
                  {logoPreview || logoUrl ? (
                    <>
                      <img
                        src={logoPreview || logoUrl}
                        alt="Xem trước logo"
                        className="h-full w-full object-contain p-3"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800">
                          Thay đổi ảnh
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-primary/10">
                        <ImageIcon
                          size={22}
                          className="text-slate-400 transition-colors group-hover:text-primary"
                        />
                      </div>
                      <p className="text-sm font-medium text-slate-500 transition-colors group-hover:text-primary">
                        Nhấn để tải lên logo
                      </p>
                      <p className="text-xs text-slate-400">
                        JPG, PNG · Tối đa 2MB
                      </p>
                    </>
                  )}
                </button>
                {errors.logoFile && (
                  <p className="text-xs text-destructive">
                    {errors.logoFile.message}
                  </p>
                )}
              </div>

              {/* --- License Upload --- */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Giấy phép kinh doanh <span className="text-red-500">*</span>
                </Label>
                <input
                  ref={licenseInputRef}
                  type="file"
                  accept=".pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setValue('businessLicenseFile', file, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                      setLicensePreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => licenseInputRef.current?.click()}
                  className="group relative w-full h-44 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2"
                >
                  {licensePreview || licenseUrl ? (
                    <div className="flex w-full flex-col items-center gap-2 px-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <Check size={22} className="text-green-600" />
                      </div>
                      <p className="w-full truncate text-center text-sm font-medium text-slate-700">
                        {bizLicenseFileWatch instanceof File
                          ? bizLicenseFileWatch.name
                          : 'Giấy phép đã tải lên'}
                      </p>
                      <a
                        href={licensePreview || licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Xem tài liệu
                      </a>
                      <p className="text-xs text-slate-400 transition-colors group-hover:text-primary">
                        Nhấn để thay thế
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-primary/10">
                        <FileUp
                          size={22}
                          className="text-slate-400 transition-colors group-hover:text-primary"
                        />
                      </div>
                      <p className="text-sm font-medium text-slate-500 transition-colors group-hover:text-primary">
                        Nhấn để tải lên giấy phép
                      </p>
                      <p className="text-xs text-slate-400">
                        PDF, JPG, PNG · Tối đa 5MB
                      </p>
                    </>
                  )}
                </button>
                {errors.businessLicenseFile && (
                  <p className="text-xs text-destructive">
                    {errors.businessLicenseFile.message}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* ===== SUBMIT ===== */}
          <Button
            type="submit"
            disabled={loadingSubmit}
            className="w-full h-12 rounded-xl text-base font-semibold shadow-sm hover:shadow-md transition-all gap-2"
          >
            {loadingSubmit ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Check size={18} />
                {isEdit ? 'Lưu cập nhật hồ sơ' : 'Hoàn tất đăng ký'}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

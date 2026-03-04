import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  X,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Highlighter,
  ImagePlus,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import { CompanyService } from '@/features/companies/api/company.service';

const getPlainTextFromHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
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
  normalizeAddressText(value).replace(/^(tinh|thanh pho|tp)\s+/, '').trim();

const stripWardPrefix = (value = '') =>
  normalizeAddressText(value).replace(/^(xa|phuong|thi tran|tt)\s+/, '').trim();

const findBestRegionMatch = (parts, regions = [], normalizer = (v) => normalizeAddressText(v)) => {
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
        region.normalizedName.includes(normalizedPart)
    );

    if (candidates.length > 0) {
      const bestMatch = candidates.sort((a, b) => b.normalizedName.length - a.normalizedName.length)[0];
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
  const imageInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Image.configure({
        allowBase64: true,
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

  const insertImageFromFile = (event) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result, alt: file.name }).run();
      event.target.value = '';
    };
    reader.readAsDataURL(file);
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

        <EditorButton title="Chèn ảnh từ máy" onClick={() => imageInputRef.current?.click()} isActive={false}>
          <ImagePlus size={15} />
        </EditorButton>
        <EditorButton title="Chèn ảnh từ URL" onClick={insertImageByUrl} isActive={false}>
          <Link2 size={15} />
        </EditorButton>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={insertImageFromFile}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};


export const CompanyRegisterPage = ({ isModal = false, onSuccess, onBack }) => {
  const navigate = useNavigate();
  const { toast, clearToasts } = useToast();
  const [form, setForm] = useState({
    name: '',
    taxCode: '',
    address: '',
    description: '',
    website: '',
    logoFile: null,
    businessLicenseFile: null,
  });

  const [companyId, setCompanyId] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [licenseUrl, setLicenseUrl] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [licensePreview, setLicensePreview] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialForm, setInitialForm] = useState(null);
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

  const buildFullAddress = (detail, wardCode, provinceCode) => {
    const wardName = wards.find((item) => String(item.code) === String(wardCode))?.name || '';
    const provinceName = provinces.find((item) => String(item.code) === String(provinceCode))?.name || '';

    return [detail?.trim(), wardName, provinceName].filter(Boolean).join(', ');
  };

  const syncAddress = (detail, wardCode, provinceCode) => {
    const fullAddress = buildFullAddress(detail, wardCode, provinceCode);
    setForm((prev) => ({
      ...prev,
      address: fullAddress || detail,
    }));
  };

  const isFormChanged = () => {
    if (!initialForm) return true;

    const textChanged =
      form.name !== initialForm.name ||
      form.taxCode !== initialForm.taxCode ||
      form.address !== initialForm.address ||
      form.description !== initialForm.description ||
      form.website !== initialForm.website;

    const fileChanged = form.logoFile !== null || form.businessLicenseFile !== null;

    return textChanged || fileChanged;
  };

  const fetchCompany = async () => {
    try {
      const data = await CompanyService.getMyCompany();

      setCompanyId(data.id);

      const fetchedForm = {
        name: data.name ?? '',
        taxCode: data.taxCode ?? '',
        address: data.address ?? '',
        description: data.description ?? '',
        website: data.website ?? '',
        logoFile: null,
        businessLicenseFile: null,
      };

      setForm(fetchedForm);
      setInitialForm(fetchedForm);
      setAddressDetail('');
      setSelectedProvinceCode('');
      setSelectedWardCode('');
      setWards([]);
      setLoadedWardProvinceCode('');
      setPendingAddressParse(null);
      setAddressHydrated(false);

      setLogoUrl(data.logoUrl ?? null);
      setLicenseUrl(data.businessLicenseUrl ?? null);

      setIsEdit(true);
      setPending(data.status === 'PENDING');
    } catch (error) {
      setIsEdit(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

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
      const response = await fetch(`https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`);
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
          }))
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
    if (!isEdit || addressHydrated || !form.address || provinces.length === 0) return;

    const addressParts = splitAddressParts(form.address);
    const provinceMatch = findBestRegionMatch(addressParts, provinces, stripProvincePrefix);

    if (!provinceMatch) {
      setAddressDetail(form.address);
      setAddressHydrated(true);
      return;
    }

    const remainingParts = addressParts.filter((_, index) => index !== provinceMatch.index);
    setSelectedProvinceCode(String(provinceMatch.item.code));
    setPendingAddressParse({
      remainingAddress: remainingParts.join(', '),
      provinceCode: String(provinceMatch.item.code),
    });
  }, [isEdit, addressHydrated, form.address, provinces]);

  useEffect(() => {
    if (!pendingAddressParse) return;
    if (selectedProvinceCode !== pendingAddressParse.provinceCode || loadingWards) return;
    if (loadedWardProvinceCode !== pendingAddressParse.provinceCode) return;

    const remainingParts = splitAddressParts(pendingAddressParse.remainingAddress);
    const wardMatch = findBestRegionMatch(remainingParts, wards, stripWardPrefix);

    if (wardMatch) {
      setSelectedWardCode(String(wardMatch.item.code));
      const detailParts = remainingParts.filter((_, index) => index !== wardMatch.index);
      setAddressDetail(detailParts.join(', '));
    } else {
      setSelectedWardCode('');
      setAddressDetail(pendingAddressParse.remainingAddress || form.address);
    }

    setPendingAddressParse(null);
    setAddressHydrated(true);
  }, [pendingAddressParse, selectedProvinceCode, wards, loadingWards, loadedWardProvinceCode, form.address]);

  const validateForm = (formData, inEditMode) => {
    const errors = [];

    if (!formData.name || formData.name.trim() === '') {
      errors.push('Tên công ty không được để trống');
    } else if (formData.name.length < 3 || formData.name.length > 100) {
      errors.push('Tên công ty phải từ 3 - 100 ký tự');
    }

    const taxCodeRegex = /^[0-9]{10,13}$/;
    if (!formData.taxCode || formData.taxCode.trim() === '') {
      errors.push('Mã số thuế không được để trống');
    } else if (!taxCodeRegex.test(formData.taxCode)) {
      errors.push('Mã số thuế phải từ 10 - 13 chữ số');
    }

    if (!formData.address || formData.address.trim() === '') {
      errors.push('Địa chỉ không được để trống');
    } else if (formData.address.length < 5 || formData.address.length > 255) {
      errors.push('Địa chỉ phải từ 5 - 255 ký tự');
    }

    const descriptionText = getPlainTextFromHtml(formData.description);
    if (!descriptionText) {
      errors.push('Mô tả không được để trống');
    } else if (descriptionText.length < 10) {
      errors.push('Mô tả phải tối thiểu 10 ký tự');
    }

    const websiteRegex = /^[^\s]+\.[^\s]+$/;
    if (!formData.website || formData.website.trim() === '') {
      errors.push('Website không được để trống');
    } else if (!websiteRegex.test(formData.website)) {
      errors.push('Website không hợp lệ');
    }

    if (!inEditMode && !formData.logoFile) {
      errors.push('Logo không được để trống');
    }

    if (formData.logoFile) {
      const allowedImageTypes = ['image/jpeg', 'image/png'];
      if (!allowedImageTypes.includes(formData.logoFile.type)) {
        errors.push('Logo phải là file JPG hoặc PNG');
      }
      if (formData.logoFile.size > 2 * 1024 * 1024) {
        errors.push('Logo không được vượt quá 2MB');
      }
    }

    if (!inEditMode && !formData.businessLicenseFile) {
      errors.push('Giấy phép kinh doanh không được để trống');
    }

    if (formData.businessLicenseFile) {
      const allowedLicenseTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedLicenseTypes.includes(formData.businessLicenseFile.type)) {
        errors.push('Giấy phép phải là PDF, JPG hoặc PNG');
      }
      if (formData.businessLicenseFile.size > 5 * 1024 * 1024) {
        errors.push('Giấy phép không được vượt quá 5MB');
      }
    }

    /* ========= HIỂN THỊ TẤT CẢ LỖI ========= */
    if (errors.length > 0) {
      clearToasts();
      const errorData = (
        <div>
          {errors.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>
      );
      toast(
        errorData,
        'error'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit && !isFormChanged()) {
      toast("Không có thay đổi để cập nhật", "error");
      return;
    }
    if (!validateForm(form, isEdit)) return;
    const fd = new FormData();

    fd.append('name', form.name);
    fd.append('taxCode', form.taxCode);
    fd.append('address', form.address);
    fd.append('description', form.description);
    fd.append('website', form.website);
    if (form.logoFile) fd.append('logo', form.logoFile);
    if (form.businessLicenseFile) fd.append('businessLicense', form.businessLicenseFile);

    try {
      if (isEdit) {
        await CompanyService.updateCompany(companyId, fd);
        toast('Cập nhật thông tin công ty thành công');
        await fetchCompany();
      } else {
        await CompanyService.createCompany(fd);
        toast('Gửi đăng ký công ty thành công');
      }
      if (isModal && onSuccess) {
        onSuccess();
      } else {
        navigate('/employer');
      }
    } catch (error) {
      console.error(error?.response?.status, error?.response?.data || error.message);
      toast(MSG.MSG36, 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Đang tải dữ liệu công ty...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isModal && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-black"
          >
            <X size={25} />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-2xl px-4">
        <h1 className="mb-6 text-2xl font-bold">{isEdit ? 'Chỉnh sửa công ty' : 'Đăng ký công ty'}</h1>

        {pending && (
          <Card className="mb-6 rounded-xl border-0 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">Hồ sơ công ty đang chờ duyệt. Bạn có thể chỉnh sửa thông tin.</p>
          </Card>
        )}

        <Card className="rounded-xl border-0 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Tên công ty *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Tên công ty"
                className="mt-1 rounded-xl"
              />
            </div>

            <div>
              <Label>Mã số thuế *</Label>
              <Input
                value={form.taxCode}
                onChange={(e) => setForm({ ...form, taxCode: e.target.value })}
                placeholder="Mã số thuế"
                className="mt-1 rounded-xl"
              />
            </div>

            <div>
              <Label>Địa chỉ *</Label>
              <Input
                value={addressDetail}
                onChange={(e) => {
                  const nextDetail = e.target.value;
                  setAddressDetail(nextDetail);
                  syncAddress(nextDetail, selectedWardCode, selectedProvinceCode);
                }}
                placeholder="Số nhà, tên đường"
                className="mt-1 rounded-xl"
              />
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <select
                  value={selectedProvinceCode}
                  onChange={(e) => {
                    const nextProvinceCode = e.target.value;
                    setSelectedProvinceCode(nextProvinceCode);
                    setSelectedWardCode('');
                    setWards([]);
                    syncAddress(addressDetail, '', nextProvinceCode);
                  }}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="">
                    {loadingProvinces ? 'Đang tải Tỉnh/Thành phố...' : 'Chọn Tỉnh/Thành phố'}
                  </option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedWardCode}
                  onChange={(e) => {
                    const nextWardCode = e.target.value;
                    setSelectedWardCode(nextWardCode);
                    syncAddress(addressDetail, nextWardCode, selectedProvinceCode);
                  }}
                  disabled={!selectedProvinceCode || loadingWards}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {!selectedProvinceCode
                      ? 'Chọn Tỉnh/Thành phố trước'
                      : loadingWards
                        ? 'Đang tải Xã/Phường...'
                        : 'Chọn Xã/Phường'}
                  </option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                      {ward.districtName ? ` (${ward.districtName})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label>Mô tả công ty *</Label>
              <div className="mt-1">
                <CompanyDescriptionEditor
                  value={form.description}
                  onChange={(html) => setForm((prev) => ({ ...prev, description: html }))}
                />
              </div>
            </div>

            <div>
              <Label>Trang web công ty *</Label>
              <Input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="Trang web công ty"
                className="mt-1 rounded-xl"
              />
            </div>

            <div>
              <Label>Logo công ty *</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setForm({ ...form, logoFile: file });
                    setLogoPreview(URL.createObjectURL(file));
                  }
                }}
              />
              {(logoPreview || logoUrl) && (
                <div className="mt-3">
                  <img src={logoPreview || logoUrl} alt="Company Logo" className="max-h-48 rounded-lg border object-contain" />
                </div>
              )}
            </div>

            <div>
              <Label>Giấy phép kinh doanh *</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setForm({ ...form, businessLicenseFile: file });
                    setLicensePreview(URL.createObjectURL(file));
                  }
                }}
              />
              {(licensePreview || licenseUrl) && (
                <div className="mt-3">
                  <a href={licensePreview || licenseUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Xem giấy phép kinh doanh
                  </a>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full rounded-xl">
              {isEdit ? 'Cập nhật' : 'Gửi'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

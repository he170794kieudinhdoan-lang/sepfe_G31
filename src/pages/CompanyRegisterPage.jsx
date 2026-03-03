import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';
import { X } from 'lucide-react';
import { CompanyService } from '@/features/companies/api/company.service';


export const CompanyRegisterPage = ({ isModal = false, onSuccess, onBack }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const isFormChanged = () => {
    if (!initialForm) return true; // create mode

    // So sánh text fields
    const textChanged =
      form.name !== initialForm.name ||
      form.taxCode !== initialForm.taxCode ||
      form.address !== initialForm.address ||
      form.description !== initialForm.description ||
      form.website !== initialForm.website;

    // Nếu user upload file mới thì coi như changed
    const fileChanged =
      form.logoFile !== null ||
      form.businessLicenseFile !== null;

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

  const validateForm = (form, isEdit) => {
    const errors = [];

    /* ========= 1. NAME ========= */
    if (!form.name || form.name.trim() === "") {
      errors.push("Tên công ty không được để trống");
    } else if (form.name.length < 3 || form.name.length > 100) {
      errors.push("Tên công ty phải từ 3 - 100 ký tự");
    }

    /* ========= 2. TAX CODE ========= */
    const taxCodeRegex = /^[0-9]{10,13}$/;
    if (!form.taxCode || form.taxCode.trim() === "") {
      errors.push("Mã số thuế không được để trống");
    } else if (!taxCodeRegex.test(form.taxCode)) {
      errors.push("Mã số thuế phải từ 10 - 13 chữ số");
    }

    /* ========= 3. ADDRESS ========= */
    if (!form.address || form.address.trim() === "") {
      errors.push("Địa chỉ không được để trống");
    } else if (form.address.length < 5 || form.address.length > 255) {
      errors.push("Địa chỉ phải từ 5 - 255 ký tự");
    }

    /* ========= 4. DESCRIPTION ========= */
    if (!form.description || form.description.trim() === "") {
      errors.push("Mô tả không được để trống");
    } else if (form.description.length < 10) {
      errors.push("Mô tả phải tối thiểu 10 ký tự");
    }

    /* ========= 5. WEBSITE ========= */
    const websiteRegex = /^[^\s]+\.[^\s]+$/;
    if (!form.website || form.website.trim() === "") {
      errors.push("Website không được để trống");
    } else if (!websiteRegex.test(form.website)) {
      errors.push("Website không hợp lệ");
    }

    /* ========= 6. LOGO ========= */
    if (!isEdit) {
      // CREATE → bắt buộc phải có file
      if (!form.logoFile) {
        errors.push("Logo không được để trống");
      }
    }

    // Nếu có upload file mới (create hoặc update) → validate file
    if (form.logoFile) {
      const allowedImageTypes = ["image/jpeg", "image/png"];
      if (!allowedImageTypes.includes(form.logoFile.type)) {
        errors.push("Logo phải là file JPG hoặc PNG");
      }
      if (form.logoFile.size > 2 * 1024 * 1024) {
        errors.push("Logo không được vượt quá 2MB");
      }
    }

    /* ========= 7. BUSINESS LICENSE ========= */
    if (!isEdit) {
      // CREATE → bắt buộc phải có file
      if (!form.businessLicenseFile) {
        errors.push("Giấy phép kinh doanh không được để trống");
      }
    }

    // Nếu có upload file mới → validate
    if (form.businessLicenseFile) {
      const allowedLicenseTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
      ];
      if (!allowedLicenseTypes.includes(form.businessLicenseFile.type)) {
        errors.push("Giấy phép phải là PDF, JPG hoặc PNG");
      }
      if (form.businessLicenseFile.size > 5 * 1024 * 1024) {
        errors.push("Giấy phép không được vượt quá 5MB");
      }
    }

    /* ========= HIỂN THỊ TẤT CẢ LỖI ========= */
    if (errors.length > 0) {
      toast(
        <div>
          {errors.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>,
        "error"
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
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-black"
          >
            <X size={25} />
          </button>
        </div>
      )}
      <div className="mx-auto px-4 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Chỉnh sửa công ty' : 'Đăng ký công ty'}</h1>
        {pending && (
          <Card className="p-4 rounded-xl bg-amber-50 border-0 mb-6">
            <p className="text-sm text-amber-800">Hồ sơ công ty đang chờ duyệt. Bạn có thể chỉnh sửa thông tin.</p>
          </Card>
        )}
        <Card className="p-6 rounded-xl shadow-sm border-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Tên công ty *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên công ty" className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Mã số thuế *</Label>
              <Input value={form.taxCode} onChange={(e) => setForm({ ...form, taxCode: e.target.value })} placeholder="Mã số thuế" className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Địa chỉ *</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Địa chỉ" className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Mô tả</Label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Giới thiệu công ty" className="w-full rounded-xl border-0 shadow-sm bg-gray-50 p-3 mt-1 min-h-[100px]" />
            </div>
            <div>
              <Label>Trang web công ty *</Label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="Trang web công ty" className="rounded-xl mt-1" />
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
                  <img
                    src={logoPreview || logoUrl}
                    alt="Company Logo"
                    className="max-h-48 object-contain rounded-lg border"
                  />
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
                  <a
                    href={licensePreview || licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Xem giấy phép kinh doanh
                  </a>
                </div>
              )}
            </div>
            <Button type="submit" className="rounded-xl w-full">{isEdit ? 'Cập nhật' : 'Gửi'}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

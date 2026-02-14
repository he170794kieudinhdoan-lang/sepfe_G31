import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CompanyService } from '@/shared/api/company.service';


export const CompanyRegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '',
    taxCode: '',
    address: '',
    description: '',
    website: '',
    logoUrl: null,
    businessLicenseUrl: null,
  });

  const [isEdit, setIsEdit] = useState(false);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await CompanyService.getMyCompany();
        console.log('Company data:', data);
        setForm({
          name: data.name ?? '',
          taxCode: data.taxCode ?? '',
          address: data.address ?? '',
          description: data.description ?? '',
          website: data.website ?? '',
          logoUrl: null,
          businessLicenseUrl: null,
        });

        setIsEdit(false);
        setPending(data.status === 'PENDING');
      } catch (error) {
        // Chưa có company → đăng ký mới
        setIsEdit(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  const handleSubmit = async (e) => {
    console.log('Submitting form:', form);
    e.preventDefault();
    if (!form.name?.trim() || !form.address?.trim()) {
      toast(MSG.MSG08, 'error');
      return;
    }
    const fd = new FormData();

    fd.append('name', form.name);
    fd.append('taxCode', form.taxCode);
    fd.append('address', form.address);
    fd.append('description', form.description);
    fd.append('website', form.website);

    if (form.logoUrl) {
      fd.append('logo', form.logoUrl);
    }

    if (form.businessLicenseUrl) {
      fd.append('businessLicense', form.businessLicenseUrl);
    }
    try {
      if (isEdit) {
        await CompanyService.updateCompany(form);
        toast('Cập nhật thông tin công ty thành công');
      } else {
        await CompanyService.createCompany(form);
        toast('Gửi đăng ký công ty thành công');
      }

      navigate('/employer');
    } catch (error) {
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
    <div className="bg-gray-50 min-h-full py-6">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link to="/employer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
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
                onChange={(e) =>
                  setForm({ ...form, logoFile: e.target.files?.[0] })
                }
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label>Giấy phép kinh doanh *</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setForm({ ...form, businessLicenseFile: e.target.files?.[0] })
                }
                className="rounded-xl mt-1"
              />
            </div>
            <Button type="submit" className="rounded-xl w-full">{isEdit ? 'Cập nhật' : 'Gửi'}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

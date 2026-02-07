import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CompanyRegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '',
    address: '',
    description: '',
    license: '',
    contact: '',
  });
  const [isEdit] = useState(false);
  const [pending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.address?.trim()) {
      toast(MSG.MSG08, 'error');
      return;
    }
    toast('Gửi đăng ký thành công. Trạng thái: Pending.');
    navigate('/employer');
  };

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
              <Label>Địa chỉ *</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Địa chỉ" className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Mô tả</Label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Giới thiệu công ty" className="w-full rounded-xl border-0 shadow-sm bg-gray-50 p-3 mt-1 min-h-[100px]" />
            </div>
            <div>
              <Label>Giấy phép / Mã số thuế</Label>
              <Input value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })} placeholder="Mã số" className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Liên hệ</Label>
              <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Email / SĐT" className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Upload tài liệu (placeholder)</Label>
              <div className="mt-1 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center text-sm text-muted-foreground">
                Kéo thả file hoặc click để chọn
              </div>
            </div>
            <Button type="submit" className="rounded-xl w-full">Gửi</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

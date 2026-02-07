import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/shared/components/Modal';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';

const MOCK_PROFILE = {
  id: 1,
  name: 'Nguyễn Văn A',
  phone: '0901234567',
  email: 'a@example.com',
  address: 'TP.HCM',
  role: 'Worker',
  skills: 'Giao tiếp, Excel',
  experience: '1 năm bán hàng',
  preferredLocation: 'TP.HCM, Bình Dương',
};

const MOCK_APPLY_HISTORY = [
  { id: 1, jobId: 1, jobTitle: 'Nhân viên kho vận ca đêm', company: 'LogiFast', appliedAt: '2025-02-01', status: 'Pending' },
  { id: 2, jobId: 3, jobTitle: 'Thu ngân siêu thị', company: 'Freshmart', appliedAt: '2025-01-28', status: 'Reviewed' },
];

const MENU = [
  { key: 'view', label: 'Thông tin cá nhân' },
  { key: 'edit', label: 'Chỉnh sửa hồ sơ' },
  { key: 'password', label: 'Đổi mật khẩu' },
  { key: 'history', label: 'Lịch sử ứng tuyển' },
  { key: 'delete', label: 'Xóa tài khoản' },
];

export const UserProfilePage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const isOwnProfile = !id;
  const viewOtherId = id ? Number(id) : null;

  const [active, setActive] = useState('view');
  const [editForm, setEditForm] = useState({ ...MOCK_PROFILE });
  const [pw, setPw] = useState({ current: '', new: '', confirm: '' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const profile = MOCK_PROFILE;
  const applyHistory = MOCK_APPLY_HISTORY;
  const notFound = false;
  const noPermission = false;

  if (notFound) {
    return (
      <div className="container mx-auto px-6 py-16 text-center">
        <p className="text-destructive font-medium">{MSG.MSG13}</p>
        <Button className="mt-4 rounded-xl" asChild><Link to="/">Về trang chủ</Link></Button>
      </div>
    );
  }
  if (noPermission) {
    return (
      <div className="container mx-auto px-6 py-16 text-center">
        <p className="text-destructive font-medium">{MSG.MSG14}</p>
      </div>
    );
  }

  const handleSaveProfile = () => {
    if (!editForm.name?.trim() || !editForm.email?.trim()) {
      toast(MSG.MSG23, 'error');
      return;
    }
    toast(MSG.MSG15);
    setActive('view');
  };

  const handleChangePassword = () => {
    if (pw.current !== 'mock') {
      toast(MSG.MSG16, 'error');
      return;
    }
    if (pw.new.length < 6) {
      toast(MSG.MSG17, 'error');
      return;
    }
    if (pw.new !== pw.confirm) {
      toast(MSG.MSG18, 'error');
      return;
    }
    toast(MSG.MSG15);
    setPw({ current: '', new: '', confirm: '' });
  };

  const handleDeleteAccount = () => {
    setDeleteConfirmOpen(false);
    toast(MSG.MSG19, 'error');
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="container mx-auto px-6 py-8">
        <Card className="p-6 rounded-xl shadow-sm mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center shrink-0">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">{isOwnProfile ? profile.name : 'Hồ sơ người dùng'}</h1>
              <Badge className="rounded-lg mt-1">{profile.role}</Badge>
            </div>
          </div>
        </Card>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-56 shrink-0">
            <nav className="space-y-1">
              {MENU.map((item) => {
                if (item.key === 'history' && profile.role !== 'Worker') return null;
                if (!isOwnProfile && item.key !== 'view') return null;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActive(item.key)}
                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium ${
                      active === item.key ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            {active === 'view' && (
              <Card className="p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Thông tin cá nhân</h2>
                <dl className="grid gap-3 text-sm">
                  <div><dt className="text-muted-foreground">Họ tên</dt><dd className="font-medium">{profile.name}</dd></div>
                  <div><dt className="text-muted-foreground">Số điện thoại</dt><dd>{profile.phone}</dd></div>
                  <div><dt className="text-muted-foreground">Email</dt><dd>{profile.email}</dd></div>
                  <div><dt className="text-muted-foreground">Địa chỉ</dt><dd>{profile.address}</dd></div>
                  {profile.role === 'Worker' && (
                    <>
                      <div><dt className="text-muted-foreground">Kỹ năng</dt><dd>{profile.skills}</dd></div>
                      <div><dt className="text-muted-foreground">Kinh nghiệm</dt><dd>{profile.experience}</dd></div>
                      <div><dt className="text-muted-foreground">Khu vực mong muốn</dt><dd>{profile.preferredLocation}</dd></div>
                    </>
                  )}
                </dl>
              </Card>
            )}

            {active === 'edit' && isOwnProfile && (
              <Card className="p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Chỉnh sửa hồ sơ</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Họ tên</label>
                    <Input className="mt-1 rounded-xl" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Số điện thoại</label>
                    <Input className="mt-1 rounded-xl" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input className="mt-1 rounded-xl" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Địa chỉ</label>
                    <Input className="mt-1 rounded-xl" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                  </div>
                  <Button className="rounded-xl" onClick={handleSaveProfile}>Lưu</Button>
                </div>
              </Card>
            )}

            {active === 'password' && isOwnProfile && (
              <Card className="p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Đổi mật khẩu</h2>
                <div className="space-y-4 max-w-sm">
                  <div>
                    <label className="text-sm font-medium">Mật khẩu hiện tại</label>
                    <Input className="mt-1 rounded-xl" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Mật khẩu mới</label>
                    <Input className="mt-1 rounded-xl" type="password" value={pw.new} onChange={(e) => setPw({ ...pw, new: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Xác nhận mật khẩu mới</label>
                    <Input className="mt-1 rounded-xl" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
                  </div>
                  <Button className="rounded-xl" onClick={handleChangePassword}>Đổi mật khẩu</Button>
                </div>
              </Card>
            )}

            {active === 'history' && (
              <Card className="p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Lịch sử ứng tuyển</h2>
                {applyHistory.length === 0 ? (
                  <p className="text-muted-foreground">{MSG.MSG12}</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground border-b">
                      <tr><th className="py-2">Tin tuyển dụng</th><th>Công ty</th><th>Ngày ứng tuyển</th><th>Trạng thái</th><th></th></tr>
                    </thead>
                    <tbody>
                      {applyHistory.map((row) => (
                        <tr key={row.id} className="border-b last:border-b-0">
                          <td className="py-3 font-medium">{row.jobTitle}</td>
                          <td>{row.company}</td>
                          <td>{row.appliedAt}</td>
                          <td>{row.status}</td>
                          <td><Button variant="outline" size="sm" className="rounded-xl" asChild><Link to={`/job/${row.jobId}`}>Xem job</Link></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            )}

            {active === 'delete' && isOwnProfile && (
              <Card className="p-6 rounded-xl shadow-sm border-red-200 bg-red-50/50">
                <h2 className="text-lg font-semibold text-red-800 mb-2">Xóa tài khoản</h2>
                <p className="text-sm text-muted-foreground mb-4">Hành động này không thể hoàn tác.</p>
                <Button variant="destructive" className="rounded-xl" onClick={() => setDeleteConfirmOpen(true)}>
                  Xóa tài khoản
                </Button>
              </Card>
            )}
          </main>
        </div>
      </div>

      <Modal
        open={deleteConfirmOpen}
        title="Xác nhận xóa tài khoản"
        description="Bạn chắc chắn muốn xóa tài khoản? Không thể khôi phục."
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteAccount}
        confirmLabel="Xóa"
        tone="danger"
      />
    </div>
  );
};

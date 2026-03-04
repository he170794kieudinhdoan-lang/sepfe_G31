import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/shared/components/Modal';
import { useToast } from '@/shared/contexts/ToastContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { MSG } from '@/shared/constants/messages';
import { User } from 'lucide-react';
import { WorkerProfileView } from '@/features/users/components/WorkerProfileView';

const MENU = [
  { key: 'view', label: 'Thông tin cá nhân' },
  { key: 'worker-profile', label: 'Cài đặt gợi ý việc làm', workerOnly: true },
  { key: 'edit', label: 'Chỉnh sửa hồ sơ' },
  { key: 'password', label: 'Đổi mật khẩu' },
  { key: 'history', label: 'Lịch sử ứng tuyển', workerOnly: true },
  { key: 'delete', label: 'Xóa tài khoản' },
];

const ROLE_LABEL = {
  WORKER: 'Người tìm việc',
  EMPLOYER: 'Nhà tuyển dụng',
  ADMIN: 'Quản trị viên',
};

export const UserProfilePage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();

  const isOwnProfile = !id;

  const [active, setActive] = useState('view');
  const [editForm, setEditForm] = useState({});
  const [pw, setPw] = useState({ current: '', new: '', confirm: '' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Khởi tạo editForm khi user data load xong
  useState(() => {
    if (user) {
      setEditForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        email: user.email || '',
        address: user.address || '',
      });
    }
  });

  if (isLoading) {
    return (
      <>
        <Card className="p-6 rounded-xl shadow-sm mb-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </Card>
      </>
    );
  }

  if (!user && isOwnProfile) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">
          Vui lòng đăng nhập để xem hồ sơ.
        </p>
        <Button className="mt-4 rounded-xl" asChild>
          <Link to="/auth/login">Đăng nhập</Link>
        </Button>
      </div>
    );
  }

  const profile = user;

  const handleSaveProfile = () => {
    if (!editForm.fullName?.trim() || !editForm.email?.trim()) {
      toast(MSG.MSG_PROFILE_REQUIRED, 'error');
      return;
    }
    // TODO: gọi API cập nhật profile
    toast(MSG.MSG_PROFILE_SAVE_SUCCESS);
    setActive('view');
  };

  const handleChangePassword = () => {
    if (!pw.current) {
      toast(MSG.MSG_CHANGE_PW_REQUIRED, 'error');
      return;
    }
    if (pw.new.length < 8) {
      toast(MSG.MSG_CHANGE_PW_MIN, 'error');
      return;
    }
    if (pw.new !== pw.confirm) {
      toast(MSG.MSG_CHANGE_PW_MISMATCH, 'error');
      return;
    }
    // TODO: gọi API đổi mật khẩu
    toast(MSG.MSG_CHANGE_PW_SUCCESS);
    setPw({ current: '', new: '', confirm: '' });
  };

  const handleDeleteAccount = () => {
    setDeleteConfirmOpen(false);
    // TODO: gọi API xóa tài khoản
    toast(MSG.MSG_DELETE_SUCCESS, 'error');
  };

  return (
    <>
      {/* Profile Header */}
      <Card className="p-6 rounded-xl shadow-sm mb-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center shrink-0">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold">
              {profile?.fullName || 'Người dùng'}
            </h1>
            {profile?.roleType && (
              <Badge className="rounded-lg mt-1">
                {ROLE_LABEL[profile.roleType] || profile.roleType}
              </Badge>
            )}
          </div>
        </div>
      </Card>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0">
          <nav className="space-y-1">
            {MENU.map((item) => {
              if (item.workerOnly && profile?.roleType !== 'WORKER')
                return null;
              if (!isOwnProfile && item.key !== 'view') return null;
              return (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium cursor-pointer ${
                    active === item.key
                      ? 'bg-primary/10 text-foreground'
                      : 'text-muted-foreground hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Thông tin cá nhân */}
          {active === 'view' && (
            <Card className="p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Thông tin cá nhân</h2>
              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Họ tên</dt>
                  <dd className="font-medium">{profile?.fullName || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>{profile?.email || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Số điện thoại</dt>
                  <dd>{profile?.phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Địa chỉ</dt>
                  <dd>{profile?.address || '—'}</dd>
                </div>
              </dl>
            </Card>
          )}

          {/* Hồ sơ lao động */}
          {active === 'worker-profile' && profile?.roleType === 'WORKER' && (
            <WorkerProfileView />
          )}

          {/* Chỉnh sửa hồ sơ */}
          {active === 'edit' && isOwnProfile && (
            <Card className="p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Chỉnh sửa hồ sơ</h2>
              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="text-sm font-medium">Họ tên</label>
                  <Input
                    className="mt-1 rounded-xl"
                    value={editForm.fullName || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, fullName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Số điện thoại</label>
                  <Input
                    className="mt-1 rounded-xl"
                    value={editForm.phone || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    className="mt-1 rounded-xl"
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Địa chỉ</label>
                  <Input
                    className="mt-1 rounded-xl"
                    value={editForm.address || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                  />
                </div>
                <Button className="rounded-xl" onClick={handleSaveProfile}>
                  Lưu thay đổi
                </Button>
              </div>
            </Card>
          )}

          {/* Đổi mật khẩu */}
          {active === 'password' && isOwnProfile && (
            <Card className="p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Đổi mật khẩu</h2>
              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="text-sm font-medium">
                    Mật khẩu hiện tại
                  </label>
                  <Input
                    className="mt-1 rounded-xl"
                    type="password"
                    value={pw.current}
                    onChange={(e) => setPw({ ...pw, current: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Mật khẩu mới</label>
                  <Input
                    className="mt-1 rounded-xl"
                    type="password"
                    value={pw.new}
                    onChange={(e) => setPw({ ...pw, new: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Xác nhận mật khẩu mới
                  </label>
                  <Input
                    className="mt-1 rounded-xl"
                    type="password"
                    value={pw.confirm}
                    onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                  />
                </div>
                <Button className="rounded-xl" onClick={handleChangePassword}>
                  Đổi mật khẩu
                </Button>
              </div>
            </Card>
          )}

          {/* Lịch sử ứng tuyển */}
          {active === 'history' && (
            <Card className="p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Lịch sử ứng tuyển</h2>
              <p className="text-muted-foreground text-sm">
                Chưa có lịch sử ứng tuyển.
              </p>
              {/* TODO: fetch và hiển thị apply history từ API */}
            </Card>
          )}

          {/* Xóa tài khoản */}
          {active === 'delete' && isOwnProfile && (
            <Card className="p-6 rounded-xl shadow-sm border-red-200 bg-red-50/50">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Xóa tài khoản
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Hành động này không thể hoàn tác.
              </p>
              <Button
                variant="destructive"
                className="rounded-xl"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Xóa tài khoản
              </Button>
            </Card>
          )}
        </main>
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
    </>
  );
};

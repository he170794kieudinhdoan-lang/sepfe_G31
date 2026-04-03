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
import { User, Loader2, Camera } from 'lucide-react';
import { WorkerProfileView } from '@/features/users/components/WorkerProfileView';
import {
  useMyApplications,
  useCancelApplyJob,
} from '@/features/jobs/api/useJobs';
import {
  useUpdateUserInfo,
  useChangePassword,
  useDeleteAccount,
} from '@/features/users/api/useUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/shared/utils/cropImage';
import { clearTokens } from '@/shared/api/tokenService';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const MENU = [
  { key: 'view', label: 'Thông tin cá nhân' },
  { key: 'worker-profile', label: 'Hồ sơ lao động', workerOnly: true },
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
  const [cancelJobId, setCancelJobId] = useState(null);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  const { mutate: changePassword, isPending: isChangingPassword } =
    useChangePassword();
  const { mutate: deleteAccount, isPending: isDeletingAccount } =
    useDeleteAccount();

  const { mutate: updateProfile, isPending: isUpdatingProfile } =
    useUpdateUserInfo();

  const { data: applications, isLoading: isLoadingApplications } =
    useMyApplications();
  const { mutate: cancelApply, isPending: isCanceling } = useCancelApplyJob();

  const handleCancelApplication = () => {
    if (!cancelJobId) return;
    cancelApply(cancelJobId, {
      onSuccess: () => {
        toast('Hủy ứng tuyển thành công', 'success');
        setCancelJobId(null);
      },
      onError: (err) => {
        const msg =
          err?.response?.data?.message || 'Có lỗi xảy ra khi hủy ứng tuyển';
        toast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
        setCancelJobId(null);
      },
    });
  };

  const handleCropComplete = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);

      const formData = new FormData();
      formData.append('avatar', croppedBlob, 'avatar.jpg');
      setPreviewAvatar(URL.createObjectURL(croppedBlob));
      setIsCropModalOpen(false);
      updateProfile(formData, {
        onSuccess: () => {
          toast('Cập nhật ảnh đại diện thành công', 'success');
        },
        onError: () => {
          toast('Lỗi cập nhật ảnh đại diện', 'error');
          setPreviewAvatar(null);
        },
      });
    } catch (e) {
      console.error(e);
      toast('Có lỗi xảy ra khi cắt ảnh', 'error');
    }
  };

  // Khởi tạo editForm khi user data load xong
  useState(() => {
    if (user) {
      setEditForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        email: user.email || '',
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

    const formData = new FormData();
    if (editForm.fullName) formData.append('fullName', editForm.fullName);
    if (editForm.phone) formData.append('phone', editForm.phone);
    if (editForm.email) formData.append('email', editForm.email);

    updateProfile(formData, {
      onSuccess: () => {
        toast(MSG.MSG_PROFILE_SAVE_SUCCESS, 'success');
        setActive('view');
      },
      onError: (err) => {
        const msg =
          err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ';
        toast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
      },
    });
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
    changePassword(
      {
        oldPassword: pw.current,
        newPassword: pw.new,
        confirmPassword: pw.confirm,
      },
      {
        onSuccess: () => {
          toast(MSG.MSG_CHANGE_PW_SUCCESS, 'success');
          setPw({ current: '', new: '', confirm: '' });
          setActive('view');
        },
        onError: (err) => {
          const msg =
            err?.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu';
          toast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
        },
      },
    );
  };

  const handleDeleteAccount = () => {
    deleteAccount(undefined, {
      onSuccess: () => {
        toast(MSG.MSG_DELETE_SUCCESS, 'success');
        clearTokens();
        // Cú trick nhỏ để văng auth state và về login page
        window.dispatchEvent(new Event('auth:force-logout'));
      },
      onError: (err) => {
        const msg =
          err?.response?.data?.message || 'Có lỗi xảy ra khi xóa tài khoản';
        toast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
        setDeleteConfirmOpen(false);
      },
    });
  };

  return (
    <>
      {/* Profile Header */}
      <Card className="p-6 rounded-xl shadow-sm mb-8">
        <div className="flex items-center gap-6">
          <label className="relative h-24 w-24 rounded-full cursor-pointer group shrink-0">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md group-hover:opacity-90 transition-all duration-200">
              <AvatarImage
                src={
                  previewAvatar ||
                  profile?.avatar ||
                  'https://github.com/shadcn.png'
                }
                alt={profile?.fullName || ''}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
                {profile?.fullName?.charAt(0)?.toUpperCase() || (
                  <User className="h-10 w-10" />
                )}
              </AvatarFallback>
            </Avatar>

            {/* Hover Overlay */}
            <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white backdrop-blur-[1px]">
              {isUpdatingProfile ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : (
                <>
                  <Camera size={24} className="mb-1" />
                  <span className="text-xs font-medium">Đổi ảnh</span>
                </>
              )}
            </div>

            {/* Edit Badge Icon */}
            {!isUpdatingProfile && (
              <div className="absolute bottom-0 right-0 h-8 w-8 bg-white rounded-full border border-gray-200 shadow-md flex items-center justify-center text-gray-600 group-hover:text-primary group-hover:scale-110 transition-all">
                <Camera size={16} />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUpdatingProfile}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Biến ảnh thành URL mộc rồi mở Modal Crop thay vì upload luôn
                  const objectUrl = URL.createObjectURL(file);
                  setImageToCrop(objectUrl);
                  setIsCropModalOpen(true);
                }
                e.target.value = '';
              }}
            />
          </label>
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

                <Button
                  className="rounded-xl"
                  onClick={handleSaveProfile}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
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
                <Button
                  className="rounded-xl w-full"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : null}
                  Xác nhận đổi mật khẩu
                </Button>
              </div>
            </Card>
          )}

          {/* Lịch sử ứng tuyển */}
          {active === 'history' && (
            <Card className="p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Lịch sử ứng tuyển</h2>

              {isLoadingApplications ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !applications || applications.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8 bg-gray-50 rounded-xl">
                  Chưa có lịch sử ứng tuyển.
                </p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <Link
                          to={`/job/${app.job.id}`}
                          className="font-semibold text-lg text-primary hover:underline"
                        >
                          {app.job.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {app.job.company?.name || 'Công ty ẩn danh'}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge
                            variant={
                              app.status === 'APPLIED'
                                ? 'default'
                                : app.status === 'CANCELLED'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {app.status === 'APPLIED'
                              ? 'Đã ứng tuyển'
                              : app.status === 'CANCELLED'
                                ? 'Đã hủy'
                                : app.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Ngày nộp:{' '}
                            {new Date(app.updatedAt).toLocaleDateString(
                              'vi-VN',
                            )}
                          </span>
                        </div>
                      </div>

                      {app.status === 'APPLIED' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="rounded-xl w-full sm:w-auto shrink-0"
                          onClick={() => setCancelJobId(app.job.id)}
                          disabled={isCanceling}
                        >
                          {isCanceling ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Hủy ứng tuyển
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
        confirmLabel={isDeletingAccount ? 'Đang xóa...' : 'Xóa'}
        tone="danger"
        isPending={isDeletingAccount}
      />

      <Modal
        open={!!cancelJobId}
        title="Xác nhận hủy ứng tuyển"
        description="Bạn có chắc chắn muốn hủy ứng tuyển công việc này không?"
        onClose={() => setCancelJobId(null)}
        onConfirm={handleCancelApplication}
        confirmLabel={isCanceling ? 'Đang xử lý...' : 'Hủy'}
        tone="danger"
        isPending={isCanceling}
      />

      {/* --- Modal Cắt Ảnh --- */}
      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tùy chỉnh ảnh đại diện</DialogTitle>
          </DialogHeader>

          <div className="relative h-64 w-full bg-slate-900 rounded-md overflow-hidden mt-2">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1} // Cắt theo khung hình vuông 1:1
                cropShape="round" // Chỉ làm mờ viền tròn (Phù hợp avatar)
                onCropChange={setCrop}
                onCropComplete={(_, croppedPixels) =>
                  setCroppedAreaPixels(croppedPixels)
                }
                onZoomChange={setZoom}
              />
            )}
          </div>
          <div className="mt-4">
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-label="Zoom"
              className="w-full"
              onChange={(e) => setZoom(e.target.value)}
            />
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setIsCropModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCropComplete} disabled={isUpdatingProfile}>
              {isUpdatingProfile ? (
                <Loader2 className="animate-spin mr-2" />
              ) : null}
              Lưu ảnh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

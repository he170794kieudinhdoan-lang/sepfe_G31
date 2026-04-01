import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/shared/components/EmptyState';
import { MSG } from '@/shared/constants/messages';
import { MapPin, Star, Globe, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useToast } from '@/shared/contexts/ToastContext';
import { useGetCompaniesById } from '../api/useGetCompanies';
import {
  useGetCompanyReviews,
  useCreateCompanyReview,
  useUpdateCompanyReview,
  useDeleteCompanyReview,
  useReportCompanyReview,
} from '../api/useGetCompanies';
import { WriteReviewModal, ReportReviewModal } from '../components/ReviewModal';
import { Modal } from '@/shared/components/Modal';
import parse from 'html-react-parser';

// Tab navigation
const TABS = [
  { key: 'info', label: 'Thông tin' },
  { key: 'reviews', label: 'Đánh giá' },
];

// Hiển thị sao
const StarDisplay = ({ value, max = 5 }) => {
  const safeValue = value || 0;
  return (
    <span className="flex text-amber-400 text-sm">
      {'★'.repeat(safeValue)}
      {'☆'.repeat(max - safeValue)}
    </span>
  );
};

export const CompanyDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('info');

  // Modal states
  const [writeOpen, setWriteOpen] = useState(false);       // Mở modal viết review
  const [editData, setEditData] = useState(null);           // Review đang sửa (null = viết mới)
  const [deleteTarget, setDeleteTarget] = useState(null);   // Review đang xóa
  const [reportTarget, setReportTarget] = useState(null);   // Review đang báo cáo

  // Fetch data
  const { data: company, isLoading: companyLoading } = useGetCompaniesById(id);
  const { data: reviews = [], isLoading: reviewsLoading } = useGetCompanyReviews(id);

  // Mutations
  const createMutation = useCreateCompanyReview(Number(id));
  const updateMutation = useUpdateCompanyReview(Number(id));
  const deleteMutation = useDeleteCompanyReview(Number(id));
  const reportMutation = useReportCompanyReview();

  // Kiểm tra user đã viết review chưa (không viết 2 lần)
  const myReview = reviews.find((r) => r.userId === user?.id);
  
  // Chỉ worker mới được viết review
  const isWorker = user?.role === 'WORKER' || user?.roleType === 'WORKER' || !!user?.workerProfile;

  // ============ XỬ LÝ SUBMIT REVIEW ============
  const handleSubmitReview = async (payload) => {
    try {
      if (editData) {
        // Đang sửa review
        await updateMutation.mutateAsync({ reviewId: editData.id, payload });
        toast('Cập nhật đánh giá thành công');
      } else {
        // Viết mới
        await createMutation.mutateAsync(payload);
        toast('Đăng đánh giá thành công');
      }
      setWriteOpen(false);
      setEditData(null);
    } catch (error) {
      toast(error?.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  // ============ XỬ LÝ XÓA REVIEW ============
  const handleDeleteReview = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast('Xóa đánh giá thành công');
      setDeleteTarget(null);
    } catch (error) {
      toast(error?.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  // ============ XỬ LÝ BÁO CÁO REVIEW ============
  const handleReportReview = async ({ reason, description }) => {
    if (!reason) {
      toast('Vui lòng chọn lý do báo cáo', 'error');
      return;
    }
    try {
      await reportMutation.mutateAsync({ reviewId: reportTarget.id, payload: { reason, description } });
      toast('Báo cáo đã được gửi');
      setReportTarget(null);
    } catch (error) {
      toast(error?.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  // ============ LOADING / ERROR ============
  if (companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-slate-500">
        Đang tải thông tin công ty...
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive font-medium">Không tìm thấy công ty.</p>
        <Button className="mt-4 rounded-xl" asChild>
          <Link to="/companies">Về danh sách công ty</Link>
        </Button>
      </div>
    );
  }

  // Tính điểm trung bình
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="w-full">
      {/* ===== HEADER CÔNG TY ===== */}
      <Card className="p-6 rounded-xl shadow-sm border-0 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-20 w-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400">
                {company.name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4" /> {company.address}
            </p>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1"
              >
                <Globe className="h-3 w-3" /> {company.website}
              </a>
            )}
            {avgRating && (
              <div className="flex items-center gap-2 mt-2">
                <StarDisplay value={Math.round(Number(avgRating))} />
                <span className="font-semibold text-amber-500">{avgRating}</span>
                <span className="text-sm text-muted-foreground">({reviews.length} đánh giá)</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* ===== TABS ===== */}
      <div className="flex gap-2 p-1 rounded-xl bg-gray-100 mb-6">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === key ? 'bg-white shadow-sm' : 'text-muted-foreground hover:bg-white/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ===== TAB: THÔNG TIN ===== */}
      {activeTab === 'info' && (
        <Card className="p-6 rounded-xl shadow-sm border-0">
          <h3 className="font-semibold mb-4">Giới thiệu</h3>
          <div className="text-muted-foreground text-sm leading-relaxed">
            {company.description ? parse(company.description) : 'Chưa có mô tả.'}
          </div>
          {company.taxCode && (
            <p className="mt-4 text-sm">
              <span className="text-muted-foreground">Mã số thuế: </span>
              <span className="font-semibold">{company.taxCode}</span>
            </p>
          )}
        </Card>
      )}

      {/* ===== TAB: ĐÁNH GIÁ ===== */}
      {activeTab === 'reviews' && (
        <Card className="p-6 rounded-xl shadow-sm border-0">
          {/* Header: tiêu đề + nút viết review */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Đánh giá của nhân viên</h3>
            {/* Chỉ hiện nút khi là worker và chưa viết review */}
            {isAuthenticated && isWorker && !myReview && (
              <Button
                size="sm"
                className="rounded-xl"
                onClick={() => {
                  setEditData(null);
                  setWriteOpen(true);
                }}
              >
                Viết đánh giá
              </Button>
            )}
            {/* Nếu chưa đăng nhập */}
            {!isAuthenticated && (
              <Button size="sm" variant="outline" className="rounded-xl" asChild>
                <Link to="/auth/login">Đăng nhập để đánh giá</Link>
              </Button>
            )}
          </div>

          {/* Danh sách đánh giá */}
          {reviewsLoading ? (
            <p className="text-muted-foreground text-sm">Đang tải đánh giá...</p>
          ) : reviews.length === 0 ? (
            <EmptyState
              title={MSG.MSG_REVIEW_EMPTY || 'Chưa có đánh giá nào'}
              description="Hãy là người đầu tiên đánh giá công ty này."
            />
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => {
                const isMyReview = user && r.userId === user.id;

                return (
                  <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                    {/* Tên + sao + ngày */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-500">
                          {r.user?.fullName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <span className="font-medium text-sm">
                            {r.isAnonymous ? 'Ẩn danh' : r.user?.fullName || 'Người dùng'}
                          </span>
                          <div className="flex items-center gap-1">
                            <StarDisplay value={r.rating} />
                            <span className="text-xs text-muted-foreground">
                              {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Nút hành động */}
                      <div className="flex gap-1">
                        {/* Nút Sửa + Xóa: chỉ của người dùng chính */}
                        {isMyReview && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-lg text-xs"
                              onClick={() => {
                                setEditData(r);
                                setWriteOpen(true);
                              }}
                            >
                              Sửa
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-lg text-xs text-destructive"
                              onClick={() => setDeleteTarget(r)}
                            >
                              Xóa
                            </Button>
                          </>
                        )}
                        {/* Nút Báo cáo: ai cũng thấy trừ chủ review */}
                        {isAuthenticated && !isMyReview && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg text-xs text-slate-400"
                            onClick={() => setReportTarget(r)}
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Báo cáo
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Tiêu đề review */}
                    {r.title && (
                      <p className="font-semibold text-sm mt-2">{r.title}</p>
                    )}

                    {/* Nội dung review */}
                    {r.content && (
                      <p className="text-sm text-muted-foreground mt-1">{r.content}</p>
                    )}

                    {/* Các tiêu chí phụ (nếu có) */}
                    {(r.salaryRating || r.environmentRating || r.overtimeRating || r.managementRating) && (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                        {r.salaryRating && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            Lương: <StarDisplay value={r.salaryRating} />
                          </div>
                        )}
                        {r.environmentRating && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            Môi trường: <StarDisplay value={r.environmentRating} />
                          </div>
                        )}
                        {r.overtimeRating && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            OT: <StarDisplay value={r.overtimeRating} />
                          </div>
                        )}
                        {r.managementRating && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            Quản lý: <StarDisplay value={r.managementRating} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* ===== MODAL: VIẾT / SỬA REVIEW ===== */}
      <WriteReviewModal
        open={writeOpen}
        onClose={() => {
          setWriteOpen(false);
          setEditData(null);
        }}
        onSubmit={handleSubmitReview}
        initialData={editData}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* ===== MODAL: XÁC NHẬN XÓA ===== */}
      <Modal
        open={!!deleteTarget}
        title="Xóa đánh giá?"
        description="Hành động này không thể hoàn tác. Đánh giá sẽ bị xóa vĩnh viễn."
        confirmLabel={deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
        tone="danger"
        onConfirm={handleDeleteReview}
        onClose={() => setDeleteTarget(null)}
        disabled={deleteMutation.isPending}
      />

      {/* ===== MODAL: BÁO CÁO REVIEW ===== */}
      <ReportReviewModal
        open={!!reportTarget}
        onClose={() => setReportTarget(null)}
        onSubmit={handleReportReview}
        loading={reportMutation.isPending}
      />
    </div>
  );
};

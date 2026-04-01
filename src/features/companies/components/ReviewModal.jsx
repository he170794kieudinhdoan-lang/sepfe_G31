import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Input } from '@/components/ui/input';

// Danh sách lý do báo cáo - khớp với enum BE
const REPORT_REASONS = [
  { value: 'INAPPROPRIATE_CONTENT', label: 'Nội dung không phù hợp' },
  { value: 'FRAUD', label: 'Lừa đảo' },
  { value: 'SCAM', label: 'Lừa đảo/Đa cấp' },
  { value: 'MISLEADING_INFO', label: 'Thông tin sai sự thật' },
  { value: 'OTHER', label: 'Khác' },
];

// ===========================================================
// Modal viết / sửa đánh giá công ty
// ===========================================================
export const WriteReviewModal = ({ open, onClose, onSubmit, initialData = null, loading }) => {
  // initialData khác null → đang ở chế độ sửa
  const [form, setForm] = useState({
    rating: 5,
    title: '',
    content: '',
    salaryRating: 3,
    environmentRating: 3,
    overtimeRating: 3,
    managementRating: 3,
    isAnonymous: false,
  });

  // Khi mở modal sửa, load dữ liệu vào form
  useEffect(() => {
    if (initialData) {
      setForm({
        rating: initialData.rating || 5,
        title: initialData.title || '',
        content: initialData.content || '',
        salaryRating: initialData.salaryRating || 3,
        environmentRating: initialData.environmentRating || 3,
        overtimeRating: initialData.overtimeRating || 3,
        managementRating: initialData.managementRating || 3,
        isAnonymous: initialData.isAnonymous || false,
      });
    } else {
      // Reset lại form khi mở để viết mới
      setForm({
        rating: 5,
        title: '',
        content: '',
        salaryRating: 3,
        environmentRating: 3,
        overtimeRating: 3,
        managementRating: 3,
        isAnonymous: false,
      });
    }
  }, [initialData, open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  // Component chọn sao nhỏ gọn
  const StarSelect = ({ label, field }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleChange(field, star)}
            className={`text-lg ${form[field] >= star ? 'text-amber-400' : 'text-slate-300'}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      title={initialData ? 'Sửa đánh giá' : 'Viết đánh giá công ty'}
      description="Chia sẻ trải nghiệm làm việc của bạn"
      onClose={onClose}
      onConfirm={handleSubmit}
      confirmLabel={loading ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Gửi đánh giá')}
      disabled={loading}
    >
      <div className="space-y-4">
        {/* Đánh giá tổng thể */}
        <div>
          <label className="text-sm font-medium">Đánh giá tổng thể *</label>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleChange('rating', star)}
                className={`text-2xl ${form.rating >= star ? 'text-amber-400' : 'text-slate-300'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Tiêu đề */}
        <div>
          <label className="text-sm font-medium">Tiêu đề</label>
          <Input
            className="mt-1 rounded-xl"
            placeholder="VD: Môi trường làm việc chuyên nghiệp"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </div>

        {/* Nội dung */}
        <div>
          <label className="text-sm font-medium">Nội dung</label>
          <textarea
            className="w-full mt-1 rounded-xl border px-3 py-2 text-sm resize-none min-h-[80px] focus:outline-none"
            placeholder="Chia sẻ chi tiết về trải nghiệm của bạn..."
            value={form.content}
            onChange={(e) => handleChange('content', e.target.value)}
          />
        </div>

        {/* Các tiêu chí phụ */}
        <div className="border rounded-xl p-3 space-y-3">
          <p className="text-sm font-medium">Đánh giá chi tiết</p>
          <StarSelect label="Lương & phúc lợi" field="salaryRating" />
          <StarSelect label="Môi trường làm việc" field="environmentRating" />
          <StarSelect label="Cân bằng làm thêm giờ" field="overtimeRating" />
          <StarSelect label="Quản lý" field="managementRating" />
        </div>

        {/* Ẩn danh */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isAnonymous"
            checked={form.isAnonymous}
            onChange={(e) => handleChange('isAnonymous', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="isAnonymous" className="text-sm text-muted-foreground">
            Đánh giá ẩn danh
          </label>
        </div>
      </div>
    </Modal>
  );
};

// ===========================================================
// Modal báo cáo review
// ===========================================================
export const ReportReviewModal = ({ open, onClose, onSubmit, loading }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const handleClose = () => {
    setReason('');
    setDescription('');
    onClose();
  };

  const handleSubmit = () => {
    onSubmit({ reason, description });
  };

  return (
    <Modal
      open={open}
      title="Báo cáo đánh giá"
      description="Chọn lý do báo cáo đánh giá này"
      onClose={handleClose}
      onConfirm={handleSubmit}
      confirmLabel={loading ? 'Đang gửi...' : 'Gửi báo cáo'}
      disabled={loading}
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Lý do *</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full mt-1 rounded-xl border px-3 py-2 text-sm"
          >
            <option value="">-- Chọn lý do --</option>
            {REPORT_REASONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Mô tả thêm (tùy chọn)</label>
          <Input
            className="mt-1 rounded-xl"
            placeholder="Giải thích thêm về vấn đề..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

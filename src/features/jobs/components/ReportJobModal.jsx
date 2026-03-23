import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Modal } from '@/shared/components/Modal';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';
import { reportJobApi } from '@/features/jobs/api/jobApi';

const REPORT_REASONS = [
  { value: 'FRAUD', label: 'Lừa đảo' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Nội dung không phù hợp' },
  { value: 'SCAM', label: 'Lừa đảo/Đa cấp' },
  { value: 'DUPLICATE', label: 'Tin tuyển dụng trùng lặp' },
  { value: 'MISLEADING_INFO', label: 'Thông tin không đúng sự thật' },
  { value: 'OTHER', label: 'Khác' },
];

export const ReportJobModal = ({ open, onClose, hasReported = false, jobId }) => {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (hasReported) {
      toast(MSG.MSG_REPORT_ALREADY_SENT, 'error');
      onClose();
      return;
    }
    
    if (!reason) {
      toast('Vui lòng chọn lý do báo cáo', 'error');
      return;
    }
    
    try {
      setLoading(true);
      await reportJobApi({
        jobId: Number(jobId),
        reason,
        description
      });
      setReason('');
      setDescription('');
      onClose();
      toast(MSG.MSG_REPORT_SUCCESS);
    } catch (error) {
      toast(error?.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Báo cáo tin tuyển dụng"
      description="Chọn lý do và ghi chú (tùy chọn)"
      onClose={handleClose}
      onConfirm={handleSubmit}
      confirmLabel={loading ? 'Đang gửi...' : 'Gửi báo cáo'}
      disabled={loading}
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Lý do</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full mt-1 rounded-xl border px-3 py-2"
            disabled={loading}
          >
            <option value="">-- Chọn --</option>
            {REPORT_REASONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Ghi chú (tùy chọn)</label>
          <Input
            className="mt-1 rounded-xl"
            placeholder="Mô tả thêm..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
    </Modal>
  );
};

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Modal } from '@/shared/components/Modal';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';

const REPORT_REASONS = [
  { value: 'fraud', label: 'Lừa đảo' },
  { value: 'inappropriate', label: 'Nội dung không phù hợp' },
  { value: 'unclear', label: 'Thông tin không rõ ràng' },
];

export const ReportJobModal = ({ open, onClose, hasReported = false }) => {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (hasReported) {
      toast(MSG.MSG_REPORT_ALREADY_SENT, 'error');
      onClose();
      return;
    }
    // TODO: gọi API report job ở đây
    setReason('');
    setNote('');
    onClose();
    toast(MSG.MSG_REPORT_SUCCESS);
  };

  const handleClose = () => {
    setReason('');
    setNote('');
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Báo cáo tin tuyển dụng"
      description="Chọn lý do và ghi chú (tùy chọn)"
      onClose={handleClose}
      onConfirm={handleSubmit}
      confirmLabel="Gửi báo cáo"
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Lý do</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full mt-1 rounded-xl border px-3 py-2"
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
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

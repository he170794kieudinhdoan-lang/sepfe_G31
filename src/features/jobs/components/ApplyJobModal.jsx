import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Modal } from '@/shared/components/Modal';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';

export const ApplyJobModal = ({ open, onClose }) => {
  const { toast } = useToast();
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = () => {
    if (!note.trim() || !confirmed) {
      toast(MSG.MSG_REQUIRED_APPLY_FIELDS, 'error');
      return;
    }
    // TODO: gọi API apply job ở đây
    setNote('');
    setConfirmed(false);
    onClose();
    toast(MSG.MSG_JOB_SAVE_SUCCESS);
  };

  const handleClose = () => {
    setNote('');
    setConfirmed(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Ứng tuyển"
      description="Điền thông tin ứng tuyển"
      onClose={handleClose}
      onConfirm={handleSubmit}
      confirmLabel="Gửi"
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">
            Giới thiệu bản thân / Ghi chú
          </label>
          <Input
            className="mt-1 rounded-xl"
            placeholder="Viết ngắn gọn..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <span className="text-sm">Tôi xác nhận thông tin đúng sự thật.</span>
        </label>
      </div>
    </Modal>
  );
};

import { Modal } from '@/shared/components/Modal';
import { AlertCircle } from 'lucide-react';

export const InsufficientPointModal = ({
  open,
  onClose,
  onGoTopup,
  message = 'Số dư điểm không đủ để thực hiện thao tác này.',
}) => {
  const formattedMessage = typeof message === 'string'
    ? message.replace(/point/gi, 'điểm')
    : message;

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="confirm"
      title="Số dư điểm không đủ"
      description="Bạn cần nạp thêm điểm để tiếp tục thanh toán tính năng."
      confirmLabel="Đi tới trang nạp điểm"
      cancelLabel="Để sau"
      onConfirm={onGoTopup}
    >
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="font-medium leading-relaxed">{formattedMessage}</p>
      </div>
    </Modal>
  );
};





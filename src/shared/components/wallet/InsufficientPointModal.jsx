import { Modal } from '@/shared/components/Modal';
import { Button } from '@/components/ui/button';

export const InsufficientPointModal = ({
  open,
  onClose,
  onGoTopup,
  message = 'Số dư point không đủ để thực hiện thao tác này.',
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="custom"
      title="Số dư point không đủ"
      description="Bạn cần nạp thêm point để tiếp tục thanh toán tính năng."
      bodyClassName="space-y-4"
    >
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        {message}
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Để sau
        </Button>
        <Button type="button" onClick={onGoTopup}>
          Đi tới trang nạp point
        </Button>
      </div>
    </Modal>
  );
};


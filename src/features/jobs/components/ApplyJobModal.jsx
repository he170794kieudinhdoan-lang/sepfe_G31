import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useApplyJobMutation } from '@/features/jobs/api/useJobs';
import { useToast } from '@/shared/contexts/ToastContext';
import { CheckCircle2, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export const ApplyJobModal = ({ open, onClose, jobId, jobTitle }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState('confirm'); // 'confirm' | 'success'

  const { mutate: applyJob, isPending: isApplying } = useApplyJobMutation();

  useEffect(() => {
    if (open) setStep('confirm');
  }, [open]);

  const handleConfirm = () => {
    applyJob(
      { jobId, payload: { answers: [] } },
      {
        onSuccess: () => {
          setStep('success');
        },
        onError: (err) => {
          const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra';
          toast(msg, 'error');
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    setStep('confirm');
    onClose();
  };

  const handleGoToApplications = () => {
    handleClose();
    navigate('/profile?tab=history');
  };

  if (!open) return null;

  // ── Success popup ──────────────────────────────────────────────
  if (step === 'success') {
    return (
      <Dialog open onOpenChange={handleClose}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-9 w-9 text-green-500" />
              </div>
              <DialogTitle className="text-xl">Ứng tuyển thành công!</DialogTitle>
              <DialogDescription>
                Hồ sơ của bạn đã được gửi đến nhà tuyển dụng.
                Chúng tôi sẽ thông báo khi có kết quả.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col mt-2">
            <Button
              className="w-full rounded-xl"
              onClick={handleGoToApplications}
            >
              Xem danh sách ứng tuyển
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl"
              onClick={handleClose}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Confirmation popup ─────────────────────────────────────────
  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Xác nhận ứng tuyển</DialogTitle>
          </div>
          <DialogDescription className="pt-1">
            Bạn có chắc chắn muốn ứng tuyển vào vị trí{' '}
            {jobTitle && (
              <span className="font-medium text-foreground">"{jobTitle}"</span>
            )}{' '}
            này không? Sau khi gửi, nhà tuyển dụng sẽ xem xét hồ sơ của bạn.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isApplying}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={isApplying}>
            {isApplying ? 'Đang gửi...' : 'Xác nhận ứng tuyển'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

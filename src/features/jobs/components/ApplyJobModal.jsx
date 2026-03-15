import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/shared/components/Modal';
import { useToast } from '@/shared/contexts/ToastContext';
import { useJobApply, useApplyJobMutation } from '@/features/jobs/api/useJobs';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const ApplyJobModal = ({ open, onClose, jobId }) => {
  const { toast } = useToast();

  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState({});

  const { data: applyFormResponse, isLoading: isFormLoading } = useJobApply(open ? jobId : null);
  const { mutate: applyJob, isPending: isApplying } = useApplyJobMutation();

  const formFields = applyFormResponse?.data?.fields || applyFormResponse?.fields || [];

  useEffect(() => {
    if (open) {
      setAnswers({});
      setConfirmed(false);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!confirmed) {
      toast('Bạn cần xác nhận thông tin là đúng sự thật', 'error');
      return;
    }

    // Validate required fields
    for (const field of formFields) {
      if (field.isRequired && !answers[field.id]?.trim()) {
        toast(`Vui lòng điền: ${field.label}`, 'error');
        return;
      }
    }

    const payloadAnswers = Object.entries(answers).map(([fieldId, value]) => ({
      fieldId: Number(fieldId),
      value: value.trim()
    }));

    if (payloadAnswers.length === 0 && formFields.length > 0) {
      toast('Vui lòng điền thông tin', 'error');
      return;
    }

    applyJob({
      jobId,
      payload: { answers: payloadAnswers }
    }, {
      onSuccess: () => {
        toast('Ứng tuyển thành công!', 'success');
        onClose();
        setAnswers({});
        setConfirmed(false);
      },
      onError: (err) => {
        toast(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra', 'error');
      }
    });
  };

  const handleClose = () => {
    setAnswers({});
    setConfirmed(false);
    onClose();
  };

  const renderField = (field) => {
    let options = [];
    if (field.options) {
      try {
        options = JSON.parse(field.options);
      } catch (e) {
        options = [];
      }
    }

    if (field.fieldType === 'textarea') {
      return (
        <Textarea
          className="mt-1 rounded-xl"
          placeholder={`Nhập ${field.label.toLowerCase()}...`}
          value={answers[field.id] || ''}
          onChange={(e) => setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
        />
      );
    }

    if (field.fieldType === 'select' && options.length > 0) {
      return (
        <Select
          onValueChange={(val) => setAnswers(prev => ({ ...prev, [field.id]: val }))}
          value={answers[field.id] || ''}
        >
          <SelectTrigger className="mt-1 h-12 rounded-xl">
            <SelectValue placeholder={`Chọn ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt, i) => (
              <SelectItem key={i} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        className="mt-1 rounded-xl"
        placeholder={`Nhập ${field.label.toLowerCase()}...`}
        value={answers[field.id] || ''}
        onChange={(e) => setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
      />
    );
  };

  return (
    <Modal
      open={open}
      title="Ứng tuyển"
      description="Điền thông tin ứng tuyển"
      onClose={handleClose}
      onConfirm={handleSubmit}
      confirmLabel={isApplying ? "Đang gửi..." : "Gửi"}
      confirmDisabled={isApplying || isFormLoading}
    >
      <div className="space-y-4">
        {isFormLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : formFields.length > 0 ? (
          formFields.map((field) => (
            <div key={field.id} className="space-y-1">
              <label className="text-sm font-medium">
                {field.label} {field.isRequired && <span className="text-red-500">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 italic pb-2">Vui lòng để lại ghi chú nếu có để nộp đơn ứng tuyển cho công việc này.</p>
        )}

        <label className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <span className="text-sm font-medium">Tôi xác nhận thông tin đúng sự thật.</span>
        </label>
      </div>
    </Modal>
  );
};

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useToast } from '@/shared/contexts/ToastContext';
import { useCreateSupportTicket } from '../api/useSupport';

export const SupportTicketForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const createSupportTicketMutation = useCreateSupportTicket();
  const [form, setForm] = useState({
    customerName: '',
    contact: '',
    subject: '',
    description: '',
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      customerName: user?.fullName || current.customerName,
      contact: user?.email || current.contact,
    }));
  }, [user?.email, user?.fullName]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.customerName.trim() || !form.contact.trim() || !form.subject.trim()) {
      toast('Vui lòng điền đủ tên, liên hệ và chủ đề.', 'error');
      return;
    }

    try {
      await createSupportTicketMutation.mutateAsync({
        customerName: form.customerName.trim(),
        contact: form.contact.trim(),
        subject: form.subject.trim(),
        description: form.description.trim(),
      });

      toast('Yêu cầu đã được gửi. Đội ngũ hỗ trợ sẽ xử lý sớm nhất.', 'success');
      setForm((current) => ({
        ...current,
        subject: '',
        description: '',
      }));
    } catch (error) {
      const msg = error?.response?.data?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.';
      toast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    }
  };

  return (
    <Card className="border-0 bg-white/95 p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          Trợ giúp
        </p>
        <h2 className="text-2xl font-bold text-foreground">
          Gửi yêu cầu tới Đội ngũ hỗ trợ
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Mô tả vấn đề bạn gặp phải. Yêu cầu sẽ được xử lý theo thứ tự ưu tiên.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Họ và tên</label>
            <Input
              value={form.customerName}
              onChange={(event) =>
                setForm({ ...form, customerName: event.target.value })
              }
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Email hoặc số điện thoại
            </label>
            <Input
              value={form.contact}
              onChange={(event) => setForm({ ...form, contact: event.target.value })}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Chủ đề</label>
          <Input
            value={form.subject}
            onChange={(event) => setForm({ ...form, subject: event.target.value })}
            placeholder="Chủ đề cần hỗ trợ"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Mô tả chi tiết</label>
          <Textarea
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            placeholder="Mô tả cụ thể vấn đề hoặc lỗi gặp phải..."
            className="min-h-32"
          />
        </div>

        <Button
          type="submit"
          className="w-full rounded-full bg-primary px-6 font-semibold text-primary-foreground"
          disabled={createSupportTicketMutation.isPending}
        >
          {createSupportTicketMutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </Button>
      </form>
    </Card>
  );
};
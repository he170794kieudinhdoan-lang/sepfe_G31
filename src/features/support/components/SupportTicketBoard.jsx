import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/shared/components/EmptyState';
import { Modal } from '@/shared/components/Modal';
import { useToast } from '@/shared/contexts/ToastContext';
import {
  useSupportTickets,
  useUpdateSupportTicket,
} from '../api/useSupport';

const SUPPORT_STATUS_OPTIONS = [
  { value: 'NEW', label: 'Mới' },
  { value: 'IN_PROGRESS', label: 'Đang xử lý' },
  { value: 'WAITING_CUSTOMER', label: 'Chờ khách hàng phản hồi' },
  { value: 'RESOLVED', label: 'Đã giải quyết' },
];

const SUPPORT_PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Thấp' },
  { value: 'MEDIUM', label: 'Trung bình' },
  { value: 'HIGH', label: 'Cao' },
  { value: 'URGENT', label: 'Khẩn cấp' },
];

const SUPPORT_CHANNEL_OPTIONS = [
  { value: 'CHAT', label: 'Chat' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Điện thoại' },
  { value: 'OTHER', label: 'Khác' },
];

const getLabel = (options, value) =>
  options.find((item) => item.value === value)?.label || value;

const getStatusClassName = (status) => {
  if (status === 'RESOLVED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'IN_PROGRESS') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'WAITING_CUSTOMER') return 'bg-violet-50 text-violet-700 border-violet-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
};

const getPriorityClassName = (priority) => {
  if (priority === 'URGENT') return 'bg-rose-50 text-rose-700 border-rose-200';
  if (priority === 'HIGH') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const SupportTicketBoard = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    priority: '',
    channel: '',
    page: 1,
    limit: 10,
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [draft, setDraft] = useState({
    status: 'NEW',
    internalNote: '',
  });

  const queryParams = useMemo(
    () => ({
      page: filters.page,
      limit: filters.limit,
      keyword: filters.keyword,
      status: filters.status,
      priority: filters.priority,
      channel: filters.channel,
    }),
    [filters],
  );

  const { data, isLoading, isFetching } = useSupportTickets(queryParams);
  const updateSupportTicketMutation = useUpdateSupportTicket();

  const tickets = data?.items || [];
  const summary = data?.summary || {
    total: 0,
    NEW: 0,
    IN_PROGRESS: 0,
    WAITING_CUSTOMER: 0,
    RESOLVED: 0,
  };

  const openTicket = (ticket) => {
    setSelectedTicket(ticket);
    setDraft({
      status: ticket.status || 'NEW',
      internalNote: ticket.internalNote || '',
    });
  };

  const handleSave = async () => {
    if (!selectedTicket) return;

    try {
      await updateSupportTicketMutation.mutateAsync({
        id: selectedTicket.id,
        status: draft.status,
        internalNote: draft.internalNote,
      });
      toast('Đã cập nhật ticket hỗ trợ.');
      setSelectedTicket(null);
    } catch (error) {
      const message =
        error.response?.data?.message || 'Không thể cập nhật ticket hỗ trợ.';
      toast(message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Tổng ticket</p>
          <p className="mt-1 text-2xl font-bold">{summary.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Mới</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{summary.NEW}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Đang xử lý</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{summary.IN_PROGRESS}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Đã giải quyết</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{summary.RESOLVED}</p>
        </Card>
      </div>

      <Card className="flex flex-wrap gap-3 p-4">
        <Input
          className="max-w-72 rounded-full"
          placeholder="Tìm theo mã, tên, liên hệ, chủ đề"
          value={filters.keyword}
          onChange={(event) =>
            setFilters({ ...filters, keyword: event.target.value, page: 1 })
          }
        />
        <select
          className="rounded-full border px-4 py-2 text-sm bg-white outline-none"
          value={filters.status}
          onChange={(event) =>
            setFilters({ ...filters, status: event.target.value, page: 1 })
          }
        >
          <option value="">Trạng thái</option>
          {SUPPORT_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="rounded-full border px-4 py-2 text-sm bg-white outline-none"
          value={filters.priority}
          onChange={(event) =>
            setFilters({ ...filters, priority: event.target.value, page: 1 })
          }
        >
          <option value="">Mức ưu tiên</option>
          {SUPPORT_PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="rounded-full border px-4 py-2 text-sm bg-white outline-none"
          value={filters.channel}
          onChange={(event) =>
            setFilters({ ...filters, channel: event.target.value, page: 1 })
          }
        >
          <option value="">Kênh tiếp nhận</option>
          {SUPPORT_CHANNEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          className="rounded-full px-6"
          onClick={() =>
            setFilters({
              keyword: '',
              status: '',
              priority: '',
              channel: '',
              page: 1,
              limit: 10,
            })
          }
        >
          Đặt lại
        </Button>
      </Card>

      <Card className="p-4">
        {isLoading || isFetching ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Đang tải ticket hỗ trợ...
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            title="Không có yêu cầu hỗ trợ"
            description="Không tìm thấy ticket nào phù hợp với bộ lọc hiện tại."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 font-medium">Mã ticket</th>
                  <th className="font-medium">Khách hàng</th>
                  <th className="font-medium">Chủ đề</th>
                  <th className="font-medium">Kênh</th>
                  <th className="font-medium">Ưu tiên</th>
                  <th className="font-medium">Trạng thái</th>
                  <th className="font-medium">Phụ trách</th>
                  <th className="font-medium">Tiếp nhận</th>
                  <th className="font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b last:border-b-0 hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-700">{ticket.ticketCode}</td>
                    <td>
                      <div className="font-medium text-slate-800">{ticket.customerName}</div>
                      <div className="text-xs text-slate-500">{ticket.contact}</div>
                    </td>
                    <td className="max-w-[320px]">
                      <p className="line-clamp-2 text-slate-700">{ticket.subject}</p>
                    </td>
                    <td>{getLabel(SUPPORT_CHANNEL_OPTIONS, ticket.channel)}</td>
                    <td>
                      <Badge variant="outline" className={getPriorityClassName(ticket.priority)}>
                        {getLabel(SUPPORT_PRIORITY_OPTIONS, ticket.priority)}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant="outline" className={getStatusClassName(ticket.status)}>
                        {getLabel(SUPPORT_STATUS_OPTIONS, ticket.status)}
                      </Badge>
                    </td>
                    <td>{ticket.assigneeName || 'Chưa phân công'}</td>
                    <td className="text-slate-600">{formatDateTime(ticket.createdAt)}</td>
                    <td>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => openTicket(ticket)}
                      >
                        Xử lý
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={!!selectedTicket}
        title={`Xử lý ticket ${selectedTicket?.ticketCode || ''}`}
        description="Cập nhật trạng thái và ghi chú nội bộ cho ticket hỗ trợ."
        onClose={() => setSelectedTicket(null)}
        onConfirm={handleSave}
        confirmLabel={updateSupportTicketMutation.isPending ? 'Đang lưu...' : 'Lưu cập nhật'}
        confirmDisabled={updateSupportTicketMutation.isPending}
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Khách hàng</p>
              <p className="font-semibold text-slate-800">{selectedTicket?.customerName}</p>
              <p className="text-sm text-slate-500">{selectedTicket?.contact}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Chủ đề</p>
              <p className="text-sm text-slate-700">{selectedTicket?.subject}</p>
            </div>
          </div>

          {selectedTicket?.description ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Mô tả</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {selectedTicket.description}
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Trạng thái</label>
              <select
                className="w-full rounded-xl border px-4 py-2 text-sm bg-white outline-none"
                value={draft.status}
                onChange={(event) => setDraft({ ...draft, status: event.target.value })}
              >
                {SUPPORT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Ghi chú nội bộ</label>
            <Textarea
              className="min-h-28 rounded-xl"
              placeholder="Thêm ghi chú tiếp nhận, hướng xử lý, kết quả..."
              value={draft.internalNote}
              onChange={(event) =>
                setDraft({ ...draft, internalNote: event.target.value })
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
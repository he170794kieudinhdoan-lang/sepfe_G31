import { useMemo, useState } from 'react';
import { User, Mail, Phone, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/shared/components/EmptyState';
import { Modal } from '@/shared/components/Modal';
import { useToast } from '@/shared/contexts/ToastContext';
import {
  DashboardFilterBar,
  DashboardFilterRow,
  DashboardFilterSearch,
  DashboardFilterSelect,
  DashboardFilterClearAll,
  DashboardFilterChip,
} from '@/shared/components/DashboardFilters';
import {
  useSupportTickets,
  useUpdateSupportTicket,
} from '../api/useSupport';

const SUPPORT_STATUS_OPTIONS = [
  { value: '__all__', label: 'Tất cả trạng thái' },
  { value: 'NEW', label: 'Chưa xử lý' },
  { value: 'IN_PROGRESS', label: 'Đang xử lý' },
  { value: 'WAITING_CUSTOMER', label: 'Đang chờ phản hồi' },
  { value: 'RESOLVED', label: 'Đã hoàn tất' },
];

const getLabel = (options, value) =>
  options.find((item) => item.value === value)?.label || value;

const getStatusClassName = (status) => {
  if (status === 'RESOLVED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'IN_PROGRESS') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'WAITING_CUSTOMER') return 'bg-violet-50 text-violet-700 border-violet-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
};

function SupportTicketContactCard({ ticket }) {
  const contact = ticket?.contact?.trim() || '';
  const isEmail = contact.includes('@');

  return (
    <div className="rounded-xl border-2 border-primary/25 bg-gradient-to-br from-primary/8 via-white to-amber-50/50 p-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary mb-3">
        Thông tin liên hệ
      </p>
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/20">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-lg font-bold text-slate-900 leading-tight">
            {ticket?.customerName || '—'}
          </p>
          {contact ? (
            <div className="inline-flex max-w-full items-center gap-2 rounded-lg bg-white/90 border border-slate-200/80 px-3 py-2 text-sm font-semibold text-slate-800">
              {isEmail ? (
                <Mail className="h-4 w-4 shrink-0 text-primary" />
              ) : (
                <Phone className="h-4 w-4 shrink-0 text-primary" />
              )}
              {isEmail ? (
                <a
                  href={`mailto:${contact}`}
                  className="break-all hover:text-primary hover:underline"
                >
                  {contact}
                </a>
              ) : (
                <a
                  href={`tel:${contact.replace(/\s/g, '')}`}
                  className="break-all hover:text-primary hover:underline"
                >
                  {contact}
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm font-medium text-slate-400">Chưa có thông tin liên hệ</p>
          )}
        </div>
      </div>
    </div>
  );
}

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
    }),
    [filters],
  );

  const { data, isLoading, isFetching, isPlaceholderData } =
    useSupportTickets(queryParams);
  const updateSupportTicketMutation = useUpdateSupportTicket();

  const tickets = data?.items || [];
  const summary = data?.summary || {
    total: 0,
    NEW: 0,
    IN_PROGRESS: 0,
    WAITING_CUSTOMER: 0,
    RESOLVED: 0,
  };

  const hasActiveFilters = Boolean(filters.keyword.trim() || filters.status);
  const statusFilterLabel = getLabel(
    SUPPORT_STATUS_OPTIONS,
    filters.status || '__all__',
  );

  const showInitialLoading = isLoading && !data;
  const showTableRefreshing = isFetching && !isLoading && isPlaceholderData;

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
      toast('Đã cập nhật yêu cầu hỗ trợ.', 'success');
      setSelectedTicket(null);
    } catch (error) {
      const msg = error?.response?.data?.message || 'Không thể cập nhật yêu cầu.';
      toast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    }
  };

  const resetFilters = () => {
    setFilters({
      keyword: '',
      status: '',
      page: 1,
      limit: 10,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Tổng yêu cầu</p>
          <p className="mt-1 text-2xl font-bold">{summary.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Chưa xử lý</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{summary.NEW}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Đang xử lý</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{summary.IN_PROGRESS}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Đã hoàn tất</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{summary.RESOLVED}</p>
        </Card>
      </div>

      <DashboardFilterBar>
        <DashboardFilterRow>
          <DashboardFilterSearch
            placeholder="Tìm theo mã, tên, liên hệ, chủ đề"
            value={filters.keyword}
            onChange={(event) =>
              setFilters({ ...filters, keyword: event.target.value, page: 1 })
            }
            className="flex-1 min-w-[220px] max-w-md"
          />
          <DashboardFilterSelect
            label="Trạng thái"
            value={filters.status || '__all__'}
            onValueChange={(val) =>
              setFilters({
                ...filters,
                status: val === '__all__' ? '' : val,
                page: 1,
              })
            }
            options={SUPPORT_STATUS_OPTIONS}
            placeholder="Trạng thái"
          />
          <Button
            variant="outline"
            className="h-10 rounded-xl shrink-0"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
          >
            Đặt lại
          </Button>
        </DashboardFilterRow>
        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">
              Đang lọc
            </span>
            {filters.keyword.trim() ? (
              <DashboardFilterChip
                label={`Từ khóa: "${filters.keyword.trim()}"`}
                onRemove={() => setFilters({ ...filters, keyword: '', page: 1 })}
              />
            ) : null}
            {filters.status ? (
              <DashboardFilterChip
                label={`Trạng thái: ${statusFilterLabel}`}
                onRemove={() => setFilters({ ...filters, status: '', page: 1 })}
              />
            ) : null}
            <DashboardFilterClearAll onClick={resetFilters} />
          </div>
        ) : null}
      </DashboardFilterBar>

      <Card className="p-4">
        {showInitialLoading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Đang tải dữ liệu yêu cầu...
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            title="Không có yêu cầu hỗ trợ"
            description="Không tìm thấy yêu cầu nào phù hợp với bộ lọc."
          />
        ) : (
          <>
            {showTableRefreshing ? (
              <p className="mb-3 text-xs text-slate-500">Đang cập nhật danh sách...</p>
            ) : null}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 font-medium">Mã số</th>
                    <th className="font-medium">Khách hàng</th>
                    <th className="font-medium">Chủ đề</th>
                    <th className="font-medium">Trạng thái</th>
                    <th className="font-medium">Tiếp nhận</th>
                    <th className="font-medium text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b last:border-b-0 hover:bg-slate-50/50"
                    >
                      <td className="py-3 font-semibold text-slate-700">
                        {ticket.ticketCode}
                      </td>
                      <td>
                        <div className="font-medium text-slate-800">
                          {ticket.customerName}
                        </div>
                        <div className="text-xs text-slate-500">{ticket.contact}</div>
                      </td>
                      <td className="max-w-[360px]">
                        <p className="line-clamp-2 text-slate-700">{ticket.subject}</p>
                      </td>
                      <td>
                        <Badge
                          variant="outline"
                          className={getStatusClassName(ticket.status)}
                        >
                          {getLabel(
                            SUPPORT_STATUS_OPTIONS.filter((o) => o.value !== '__all__'),
                            ticket.status,
                          )}
                        </Badge>
                      </td>
                      <td className="text-slate-600 whitespace-nowrap">
                        {formatDateTime(ticket.createdAt)}
                      </td>
                      <td className="text-right">
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
          </>
        )}
      </Card>

      <Modal
        open={!!selectedTicket}
        title={`Xử lý yêu cầu ${selectedTicket?.ticketCode || ''}`}
        description="Cập nhật trạng thái và ghi chú nghiệp vụ cho yêu cầu."
        onClose={() => setSelectedTicket(null)}
        onConfirm={handleSave}
        confirmLabel={updateSupportTicketMutation.isPending ? 'Đang lưu...' : 'Lưu cập nhật'}
        confirmDisabled={updateSupportTicketMutation.isPending}
      >
        <div className="space-y-4">
          <SupportTicketContactCard ticket={selectedTicket} />

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Chủ đề yêu cầu
            </p>
            <p className="mt-1.5 text-sm font-medium text-slate-800">
              {selectedTicket?.subject || '—'}
            </p>
          </div>

          {selectedTicket?.description ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Chi tiết yêu cầu</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {selectedTicket.description}
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Trạng thái</label>
            <select
              className="w-full rounded-xl border px-4 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/25"
              value={draft.status}
              onChange={(event) => setDraft({ ...draft, status: event.target.value })}
            >
              {SUPPORT_STATUS_OPTIONS.filter((o) => o.value !== '__all__').map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Ghi chú nghiệp vụ</label>
            <Textarea
              className="min-h-28 rounded-xl"
              placeholder="Ghi chú quy trình xử lý, kết quả..."
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

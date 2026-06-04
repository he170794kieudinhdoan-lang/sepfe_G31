import { Search, Calendar, RotateCcw, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/** Bọc nhóm bộ lọc — đồng bộ với JobSearch / Employer interview pages */
export function DashboardFilterBar({ children, className }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 sm:p-4 space-y-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DashboardFilterRow({ children, className }) {
  return (
    <div
      className={cn(
        'flex flex-col lg:flex-row lg:items-end gap-3 lg:gap-4 flex-wrap',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DashboardFilterField({ label, icon: Icon, children, className }) {
  return (
    <div className={cn('space-y-1.5 min-w-0 flex-1 sm:flex-none', className)}>
      {label ? (
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em] flex items-center gap-1.5">
          {Icon ? <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" /> : null}
          {label}
        </label>
      ) : null}
      {children}
    </div>
  );
}

export function DashboardFilterSearch({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  className,
}) {
  return (
    <DashboardFilterField  icon={Search} className={cn('sm:min-w-[200px] sm:max-w-xs flex-1', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="pl-9 h-10 rounded-xl border-slate-200 bg-white focus-visible:ring-primary/25"
        />
      </div>
    </DashboardFilterField>
  );
}

export function DashboardFilterSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  triggerClassName,
  fieldClassName,
}) {
  return (
    <DashboardFilterField label={label} className={fieldClassName}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={cn(
            'h-10 rounded-xl border-slate-200 bg-white focus:ring-primary/25 w-full sm:w-[180px]',
            triggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value || '__empty__'} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </DashboardFilterField>
  );
}

export function DashboardFilterDateRange({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClear,
  fieldClassName,
}) {
  const hasRange = !!(dateFrom || dateTo);

  return (
    <DashboardFilterField
      icon={Calendar}
      className={cn('sm:min-w-0', fieldClassName)}
    >
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          className="h-10 min-w-[130px] flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/25"
          value={dateFrom}
          max={dateTo || undefined}
          onChange={onDateFromChange}
          aria-label="Từ ngày"
        />
        <span className="text-slate-400 text-xs font-medium shrink-0">đến</span>
        <input
          type="date"
          className="h-10 min-w-[130px] flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/25"
          value={dateTo}
          min={dateFrom || undefined}
          onChange={onDateToChange}
          aria-label="Đến ngày"
        />
        {hasRange && onClear ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl border-slate-200 bg-white hover:bg-slate-50"
            onClick={onClear}
            title="Xóa lọc ngày"
          >
            <X className="h-4 w-4 text-slate-500" />
          </Button>
        ) : null}
      </div>
    </DashboardFilterField>
  );
}

export function DashboardFilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-muted text-primary rounded-full text-xs font-medium border border-primary/15">
      {label}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 p-0.5 rounded-full hover:bg-primary/15 transition-colors"
          aria-label={`Bỏ lọc ${label}`}
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </span>
  );
}

export function DashboardFilterClearAll({ onClick, disabled }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-9 rounded-xl text-slate-600 hover:text-destructive shrink-0"
      onClick={onClick}
      disabled={disabled}
    >
      <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
      Xóa bộ lọc
    </Button>
  );
}

export const EMPLOYER_JOB_STATUS_FILTER_OPTIONS = [
  { value: '__all__', label: 'Tất cả trạng thái' },
  { value: 'PUBLISHED', label: 'Hiển thị' },
  { value: 'WARNING', label: 'Chờ thanh toán' },
  { value: 'EXPIRED', label: 'Hết hạn' },
];

export const APPLICANT_STATUS_FILTER_OPTIONS = [
  { value: 'NEEDS_ACTION', label: 'Cần xử lý' },
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'APPLIED', label: 'Chờ xử lý' },
  { value: 'VIEWED', label: 'Đã xem' },
  { value: 'SUITABLE', label: 'Phù hợp' },
  { value: 'UNSUITABLE', label: 'Không phù hợp' },
];

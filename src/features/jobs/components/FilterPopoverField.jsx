import { ChevronDown, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function FilterPopoverField({
  icon: Icon,
  title,
  value,
  placeholder = 'Chọn',
  children,
  onClear,
  side = 'right',
  align = 'start',
  mobile = false,
  open,
  onOpenChange,
  onApply,
  onCancel,
  draftHint,
}) {
  if (mobile) {
    return (
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50/80 border-b border-slate-100">
          <Icon className="h-4 w-4 text-primary shrink-0" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            {title}
          </span>
          {value && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="ml-auto p-1 rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              aria-label={`Xóa ${title}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        {value ? (
          <p className="px-3 py-2 text-sm font-medium text-primary border-b border-slate-100 bg-primary/5 truncate">
            {value}
          </p>
        ) : null}
        {children}
        <div className="flex gap-2 p-3 border-t border-slate-100 bg-slate-50/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 rounded-lg"
            onClick={onCancel}
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1 rounded-lg"
            onClick={onApply}
          >
            Áp dụng
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </span>
      <Popover modal open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'w-full flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all text-left',
              value
                ? 'border-primary/30 bg-primary/5 text-slate-800'
                : 'border-gray-200 bg-white text-slate-500 hover:border-primary/40 hover:bg-slate-50',
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 shrink-0',
                value ? 'text-primary' : 'text-slate-400',
              )}
            />
            <span className="flex-1 truncate font-medium">
              {value || placeholder}
            </span>
            {value && onClear ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClear();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onClear();
                  }
                }}
                className="p-0.5 rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-600 shrink-0"
                aria-label={`Xóa ${title}`}
              >
                <X className="h-3.5 w-3.5" />
              </span>
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          side={side}
          align={align}
          className="w-[min(520px,calc(100vw-1.5rem))] p-0 overflow-hidden rounded-2xl border-slate-200 shadow-2xl data-[state=open]:animate-none data-[state=closed]:animate-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {children}
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t border-slate-100 bg-slate-50/80">
            <p className="text-xs text-slate-500 truncate min-w-0">
              {draftHint || 'Chọn xong rồi bấm Áp dụng'}
            </p>
            <div className="flex gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-lg px-3"
                onClick={onCancel}
              >
                Hủy
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 rounded-lg px-4"
                onClick={onApply}
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const Modal = ({
  open,
  title,
  description,
  children,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  onConfirm,
  onClose,
  tone = 'default',
  variant = 'confirm', // thêm dòng này
  confirmDisabled = false,
  className,
}) => {
  if (!open) return null;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-20 overflow-y-auto", className)}>
      <div
        className={cn(
          'w-full rounded-2xl bg-white shadow-2xl border border-slate-200 relative',
          variant === 'confirm' ? 'max-w-lg' : 'max-w-4xl',
        )}
      >
        {/* Close button (X) - Always show if onClose is provided */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors z-60"
            aria-label="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        )}

        {/* Header - Show if title is provided */}
        {title && (
          <div className="p-6 space-y-1.5 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            {description ? (
              <p className="text-sm text-slate-500 leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>
        )}

        <div
          className={cn(variant === 'confirm' ? 'p-6 space-y-4' : 'p-4 md:p-6')}
        >
          {children}

          {variant === 'confirm' && (
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={onClose}>
                {cancelLabel}
              </Button>
              <Button
                variant={tone === 'danger' ? 'destructive' : 'default'}
                onClick={onConfirm}
                disabled={confirmDisabled}
                className={cn(
                  tone === 'danger' && 'bg-red-600 hover:bg-red-700',
                )}
              >
                {confirmLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* <div className="p-6 space-y-4">
        {children}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'destructive' : 'default'}
            onClick={onConfirm}
            className={cn(tone === 'danger' && 'bg-red-600 hover:bg-red-700')}
          >
            {confirmLabel}
          </Button>
        </div>
      </div> */}
    </div>
  );
};

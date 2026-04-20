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
  variant = 'confirm',
  confirmDisabled = false,
  className,
  contentClassName,
  bodyClassName,
}) => {
  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto px-3 py-6 sm:px-6',
        className,
      )}
    >
      <div
        className={cn(
          'relative flex w-full max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl',
          variant === 'confirm' ? 'max-w-lg' : 'max-w-4xl',
          contentClassName,
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
          <div className="border-b border-slate-100 p-6 space-y-1.5">
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            {description ? (
              <p className="text-sm text-slate-500 leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>
        )}

        <div
          className={cn(
            variant === 'confirm'
              ? 'space-y-4 overflow-y-auto p-6'
              : 'overflow-y-auto p-4 md:p-6',
            bodyClassName,
          )}
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

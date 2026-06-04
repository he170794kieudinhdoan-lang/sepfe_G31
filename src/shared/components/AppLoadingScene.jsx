import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { LogoOrbitLoader } from '@/shared/components/LogoOrbitLoader';

/**
 * Màn phủ toàn màn hình (portal → body) để che cả header/footer/layout.
 * compact: logo nhỏ hơn, vẫn phủ full viewport.
 */
export const AppLoadingScene = ({
  title: _title,
  subtitle: _subtitle,
  bgClassName = 'bg-slate-900/20 backdrop-blur-sm',
  className = '',
}) => {
  const content = (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center p-4',
        bgClassName,
        'pointer-events-auto',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Đang tải</span>
      <LogoOrbitLoader size={64} className="shrink-0" />
    </div>
  );

  if (typeof document === 'undefined') {
    return content;
  }

  return createPortal(content, document.body);
};

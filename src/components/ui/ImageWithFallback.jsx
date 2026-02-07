import { useState } from 'react';
import { cn } from '@/lib/utils';

/** Ảnh có fallback khi lỗi - hiển thị box màu thay vì icon vỡ */
export function ImageWithFallback({
  src,
  alt = '',
  className,
  fallbackClassName = 'bg-gradient-to-br from-amber-100 to-amber-50',
  ...props
}) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={cn('flex items-center justify-center', fallbackClassName, className)}
        {...(props.style ? { style: props.style } : {})}
      >
        <div className="w-12 h-12 rounded-full bg-amber-200/50 flex items-center justify-center">
          <span className="text-amber-700/60 text-xl font-bold">?</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
      {...props}
    />
  );
}

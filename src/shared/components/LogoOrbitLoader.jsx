/**
 * Logo + line ngắn chạy theo khung vuông bo góc (đồng dạng logo).
 */
export function LogoOrbitLoader({
  size = 88,
  className = '',
  arcColor = '#fde047',
  logoSrc = '/logo_short.png',
}) {
  return (
    <div
      className={`relative inline-flex shrink-0 select-none items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Đang tải"
    >
      <div
        className="absolute inset-0 z-0 flex items-center justify-center p-[14%]"
        aria-hidden
      >
        <img
          src={logoSrc}
          alt=""
          className="h-full w-full object-contain"
          draggable={false}
        />
      </div>
      <style>{`
        @keyframes logo-square-dash {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -362; }
        }
      `}</style>
      <svg
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ shapeRendering: 'geometricPrecision' }}
        aria-hidden
      >
        <rect
          x="12"
          y="12"
          width="76"
          height="76"
          rx="18"
          stroke={arcColor}
          strokeWidth="4.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="40 322"
          style={{ animation: 'logo-square-dash 1s linear infinite' }}
        />
      </svg>
    </div>
  );
}

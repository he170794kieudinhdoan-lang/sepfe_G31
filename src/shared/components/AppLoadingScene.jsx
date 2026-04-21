import { Loader2 } from 'lucide-react';

export const AppLoadingScene = ({
  title = 'Đang tải dữ liệu',
  subtitle = 'Vui lòng chờ trong giây lát...',
  compact = false,
  className = '',
}) => {
  if (compact) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm ${className}`}
      >
        <div className="pointer-events-none absolute -top-10 -left-10 h-28 w-28 rounded-full bg-amber-200/40 blur-2xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-12 -right-8 h-28 w-28 rounded-full bg-sky-200/40 blur-2xl animate-pulse" />

        <div className="relative flex items-center gap-4">
          <div className="relative h-12 w-12 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center">
            <div className="absolute h-9 w-9 rounded-full border-2 border-slate-200" />
            <Loader2 className="h-5 w-5 text-slate-700 animate-spin" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-[52vh] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.22),transparent_36%),radial-gradient(circle_at_80%_15%,rgba(56,189,248,0.2),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.96))]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-22%] left-[8%] h-56 w-56 rounded-full bg-amber-200/30 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-20%] right-[6%] h-64 w-64 rounded-full bg-cyan-200/25 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 flex h-full min-h-[52vh] flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-6 h-24 w-24 rounded-[1.75rem] border border-slate-200 bg-white/95 shadow-sm flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full border-[3px] border-slate-200" />
          <div className="absolute h-20 w-20 rounded-full border-2 border-dashed border-slate-300 animate-spin" />
          <Loader2 className="h-8 w-8 text-slate-800 animate-spin" />
        </div>

        <p className="text-xl font-black tracking-tight text-slate-900">{title}</p>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>

        <div className="mt-6 flex items-end gap-1.5">
          {[10, 18, 26, 18, 10].map((h, i) => (
            <span
              key={`${h}-${i}`}
              className="w-1.5 rounded-full bg-slate-300 animate-pulse"
              style={{ height: `${h}px`, animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

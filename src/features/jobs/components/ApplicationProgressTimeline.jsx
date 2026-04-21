import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Tiến độ ứng tuyển — thanh ngang gọn, không dùng số bước wizard.
 */
export function ApplicationProgressTimeline({ status, updatedAt }) {
  if (status === 'CANCELLED') {
    return (
      <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3">
        <p className="text-center text-xs text-muted-foreground">
          Bạn đã rút hồ sơ — không tiếp tục quy trình tuyển dụng.
        </p>
        {updatedAt != null && (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Cập nhật:{' '}
            {formatUpdated(updatedAt)}
          </p>
        )}
      </div>
    );
  }

  const steps = buildSteps(status);

  return (
    <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/90 to-slate-50/40 px-4 py-4">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Tiến độ xử lý
      </p>
      <div className="grid grid-cols-3 gap-0">
        {steps.map((step, i) => (
          <div
            key={step.key}
            className="flex min-w-0 flex-col items-stretch"
          >
            <div className="flex h-9 w-full items-center">
              {i === 0 ? (
                <div className="min-w-0 flex-1" aria-hidden />
              ) : (
                <div
                  className={cn(
                    'h-[3px] min-h-[3px] min-w-0 flex-1 rounded-full',
                    steps[i - 1].state === 'done'
                      ? 'bg-emerald-500'
                      : 'bg-slate-200',
                  )}
                  aria-hidden
                />
              )}
              <div className="flex shrink-0 justify-center px-1">
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full transition-colors',
                    step.state === 'done' &&
                      'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20',
                    step.state === 'current' &&
                      'box-border border-[3px] border-sky-600 bg-white shadow-[0_0_0_4px_rgba(2,132,199,0.12)]',
                    step.state === 'pending' &&
                      'border-2 border-slate-200 bg-white',
                  )}
                >
                  {step.state === 'done' ? (
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  ) : step.state === 'current' ? (
                    <span className="h-2 w-2 rounded-full bg-sky-600" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                  )}
                </span>
              </div>
              {i === steps.length - 1 ? (
                <div className="min-w-0 flex-1" aria-hidden />
              ) : (
                <div
                  className={cn(
                    'h-[3px] min-h-[3px] min-w-0 flex-1 rounded-full',
                    step.state === 'done'
                      ? 'bg-emerald-500'
                      : 'bg-slate-200',
                  )}
                  aria-hidden
                />
              )}
            </div>
            <div className="mt-2 flex min-h-[2.6rem] flex-col items-center justify-start px-0.5 text-center">
              <span
                className={cn(
                  'text-[11px] leading-snug sm:text-xs',
                  step.state === 'current' &&
                    'font-semibold text-slate-900',
                  step.state === 'done' && 'text-slate-600',
                  step.state === 'pending' && 'text-slate-400',
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>
      {updatedAt != null && (
        <p className="mt-1 border-t border-slate-200/80 pt-3 text-center text-[11px] text-muted-foreground">
          Cập nhật lần cuối: {formatUpdated(updatedAt)}
        </p>
      )}
    </div>
  );
}

function formatUpdated(value) {
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildSteps(status) {
  if (status === 'APPLIED') {
    return [
      { key: 'submit', label: 'Đã nộp', state: 'done' },
      { key: 'viewed', label: 'Nhà tuyển dụng xem hồ sơ', state: 'current' },
      { key: 'result', label: 'Kết quả', state: 'pending' },
    ];
  }

  if (status === 'VIEWED') {
    return [
      { key: 'submit', label: 'Đã nộp', state: 'done' },
      { key: 'viewed', label: 'Đã xem hồ sơ', state: 'done' },
      { key: 'result', label: 'Chờ phản hồi cuối', state: 'current' },
    ];
  }

  if (status === 'SUITABLE') {
    return [
      { key: 'submit', label: 'Đã nộp', state: 'done' },
      { key: 'viewed', label: 'Đã xem hồ sơ', state: 'done' },
      { key: 'result', label: 'Phù hợp', state: 'done' },
    ];
  }

  if (status === 'UNSUITABLE') {
    return [
      { key: 'submit', label: 'Đã nộp', state: 'done' },
      { key: 'viewed', label: 'Đã xem hồ sơ', state: 'done' },
      { key: 'result', label: 'Không phù hợp', state: 'done' },
    ];
  }

  return [
    { key: 'submit', label: 'Đã nộp', state: 'current' },
    { key: 'viewed', label: 'Chờ xem hồ sơ', state: 'pending' },
    { key: 'result', label: 'Kết quả', state: 'pending' },
  ];
}

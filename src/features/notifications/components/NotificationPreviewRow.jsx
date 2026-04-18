import {
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  Flag,
  LayoutDashboard,
  MailOpen,
  MessageSquareWarning,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Icon + nền theo loại thông báo (link / tiêu đề), tránh một chuông chung cho mọi case.
 */
function getNotificationVisual(item, isUnread) {
  const link = String(item?.url ?? item?.raw?.link ?? '').toLowerCase();
  const title = String(item?.raw?.title ?? item?.headline ?? '').toLowerCase();
  const message = String(item?.raw?.message ?? '').toLowerCase();
  const blob = `${link} ${title} ${message}`;

  const u = (classes) =>
    cn(
      'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
      isUnread ? classes.active : classes.read,
    );

  if (link.includes('tab=job_reports') || title.includes('báo cáo tin')) {
    return {
      Icon: Flag,
      className: u({
        active: 'bg-amber-100 text-amber-800',
        read: 'bg-amber-50/90 text-amber-700/80',
      }),
    };
  }
  if (link.includes('tab=review_reports') || title.includes('báo cáo đánh giá')) {
    return {
      Icon: MessageSquareWarning,
      className: u({
        active: 'bg-violet-100 text-violet-800',
        read: 'bg-violet-50/90 text-violet-700/80',
      }),
    };
  }
  if (link.includes('applicantsjobid') || title.includes('ứng viên')) {
    return {
      Icon: Users,
      className: u({
        active: 'bg-sky-100 text-sky-800',
        read: 'bg-sky-50/90 text-sky-700/80',
      }),
    };
  }
  if (link.includes('campaignid') || title.includes('phỏng vấn') || title.includes('mời phỏng vấn')) {
    return {
      Icon: CalendarDays,
      className: u({
        active: 'bg-teal-100 text-teal-800',
        read: 'bg-teal-50/90 text-teal-700/80',
      }),
    };
  }
  if (link.includes('interview-invitations')) {
    return {
      Icon: MailOpen,
      className: u({
        active: 'bg-teal-100 text-teal-800',
        read: 'bg-teal-50/90 text-teal-700/80',
      }),
    };
  }
  if (
    title.includes('đẩy tin') ||
    title.includes('thanh toán') ||
    title.includes('boost')
  ) {
    return {
      Icon: Zap,
      className: u({
        active: 'bg-amber-100 text-amber-900',
        read: 'bg-amber-50/90 text-amber-800/80',
      }),
    };
  }
  if (
    link.includes('/admin/companies/') ||
    (title.includes('công ty') &&
      (title.includes('duyệt') || title.includes('chờ')))
  ) {
    return {
      Icon: Building2,
      className: u({
        active: 'bg-slate-200 text-slate-800',
        read: 'bg-slate-100 text-slate-600',
      }),
    };
  }
  if (link.includes('/company/')) {
    return {
      Icon: Building2,
      className: u({
        active: 'bg-emerald-100 text-emerald-800',
        read: 'bg-emerald-50/90 text-emerald-700/80',
      }),
    };
  }
  if (link.includes('/employer') && !link.includes('applicantsjobid')) {
    return {
      Icon: Briefcase,
      className: u({
        active: 'bg-primary/15 text-primary',
        read: 'bg-slate-100 text-slate-600',
      }),
    };
  }
  if (link.includes('/manager')) {
    return {
      Icon: LayoutDashboard,
      className: u({
        active: 'bg-indigo-100 text-indigo-800',
        read: 'bg-indigo-50/90 text-indigo-700/80',
      }),
    };
  }
  if (link.includes('/job/') || blob.includes('hồ sơ') || blob.includes('ứng tuyển')) {
    return {
      Icon: Briefcase,
      className: u({
        active: 'bg-sky-100 text-sky-800',
        read: 'bg-slate-100 text-slate-600',
      }),
    };
  }

  return {
    Icon: Bell,
    className: u({
      active: 'bg-primary/10 text-primary',
      read: 'bg-slate-100 text-slate-500',
    }),
  };
}

/**
 * Một dòng trong danh sách thông báo (popover): tách tiêu đề / chi tiết, footer time + chi tiết.
 */
export function NotificationPreviewRow({
  item,
  onRowClick,
  onDetailClick,
  onDelete,
  deleteDisabled,
  showLeadingIcon = true,
}) {
  const hasDetail = Boolean(item.detail);
  const { Icon, className: iconWrapClass } = getNotificationVisual(item, !item.read);

  return (
    <div
      className={cn(
        'group rounded-xl border transition-colors',
        !item.read
          ? 'bg-slate-50/90 border-slate-200/80 shadow-sm'
          : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50',
      )}
    >
      <div className="flex items-stretch gap-3 px-2.5 py-1">
        {showLeadingIcon ? (
          <div
            className={cn(
              'flex w-11 shrink-0 items-start justify-center pt-2.5 pl-0.5 pr-0',
            )}
          >
            <span className={iconWrapClass} aria-hidden>
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
            </span>
          </div>
        ) : null}

        <div className="min-w-0 flex-1 py-2.5 pr-1 pl-0">
          <button
            type="button"
            className="w-full text-left cursor-pointer rounded-lg -mx-1 px-1 py-0.5 hover:bg-black/[0.02] transition-colors"
            onClick={onRowClick}
          >
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1 space-y-1">
                <p
                  className={cn(
                    'text-sm leading-snug line-clamp-2',
                    hasDetail
                      ? 'font-semibold text-slate-900'
                      : 'font-medium text-slate-800',
                  )}
                >
                  {item.headline ?? item.content}
                </p>
                {hasDetail ? (
                  <p className="text-xs leading-relaxed text-slate-600 line-clamp-2">
                    {item.detail}
                  </p>
                ) : null}
              </div>
              {!item.read ? (
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                  aria-hidden
                />
              ) : null}
            </div>
          </button>

          <div className="mt-2 flex items-center justify-between gap-2 pl-0.5 pr-1">
            <span className="text-[11px] tabular-nums text-slate-400">
              {item.time}
            </span>
            <button
              type="button"
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800 underline-offset-2 hover:underline transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDetailClick?.();
              }}
            >
              Chi tiết
            </button>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-start pt-2 pr-0.5 pl-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
            title="Xoá thông báo"
            disabled={deleteDisabled}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

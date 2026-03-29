import { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Loader2,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Eye,
  Inbox,
} from 'lucide-react';
import { useApplicationFunnel } from '../api/useStatistics';

export const ApplicationFunnelWidget = ({
  jobs = [],
  jobId: controlledJobId,
  onJobChange,
  showSelect = true,
}) => {
  const [internalJobId, setInternalJobId] = useState('');

  const isControlled = controlledJobId !== undefined;
  const currentJobId = isControlled ? controlledJobId : internalJobId;

  const handleJobChange = (e) => {
    const val = e.target.value;
    if (isControlled && onJobChange) {
      onJobChange(val);
    } else {
      setInternalJobId(val);
    }
  };

  const { data: funnelRes, isLoading } = useApplicationFunnel(
    currentJobId || undefined,
  );

  const data = funnelRes || {
    applied: 0,
    viewed: 0,
    suitable: 0,
    unsuitable: 0,
    cancelled: 0,
    total: 0,
  };

  // Tính tổng để chia tỷ lệ (Nếu API không trả về total chính xác)
  const totalApps =
    data.total > 0
      ? data.total
      : (data.applied || 0) +
        (data.viewed || 0) +
        (data.suitable || 0) +
        (data.unsuitable || 0) +
        (data.cancelled || 0);

  // Mảng 5 Trạng thái Ứng tuyển đồng bộ
  const STATS = [
    {
      id: 'applied',
      label: 'Chờ xử lý',
      value: data.applied || 0,
      icon: Clock,
      themeColor: 'amber',
      bgClass: 'bg-amber-500',
      lightBgClass: 'bg-amber-100',
      textClass: 'text-amber-700',
      borderClass: 'border-amber-100',
    },
    {
      id: 'viewed',
      label: 'Đã xem',
      value: data.viewed || 0,
      icon: Eye,
      themeColor: 'blue',
      bgClass: 'bg-blue-500',
      lightBgClass: 'bg-blue-100',
      textClass: 'text-blue-700',
      borderClass: 'border-blue-100',
    },
    {
      id: 'suitable',
      label: 'Phù hợp',
      value: data.suitable || 0,
      icon: CheckCircle,
      themeColor: 'emerald',
      bgClass: 'bg-emerald-500',
      lightBgClass: 'bg-emerald-100',
      textClass: 'text-emerald-700',
      borderClass: 'border-emerald-100',
    },
    {
      id: 'unsuitable',
      label: 'Từ chối',
      value: data.unsuitable || 0,
      icon: XCircle,
      themeColor: 'rose',
      bgClass: 'bg-rose-500',
      lightBgClass: 'bg-rose-100',
      textClass: 'text-rose-700',
      borderClass: 'border-rose-100',
    },
    {
      id: 'cancelled',
      label: 'Đã hủy',
      value: data.cancelled || 0,
      icon: Ban,
      themeColor: 'slate',
      bgClass: 'bg-slate-500',
      lightBgClass: 'bg-slate-200',
      textClass: 'text-slate-700',
      borderClass: 'border-slate-200',
    },
  ];

  return (
    <Card className="p-0 rounded-2xl shadow-sm border-slate-200 flex flex-col h-full bg-white overflow-hidden">
      {/* Header Area */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-primary w-5 h-5" /> Thống kê trạng thái
            ứng viên
          </h3>
          <p className="text-slate-500 text-sm mt-0.5">
            Tổng: <span className="font-bold text-slate-700">{totalApps}</span>{' '}
            hồ sơ
          </p>
        </div>

        {/* Dropdown Box */}
        {showSelect && (
          <select
            value={currentJobId}
            onChange={handleJobChange}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm w-full sm:w-auto min-w-[200px]"
          >
            <option value="">Tất cả bài đăng</option>
            {jobs
              .filter((j) => j.status !== 'DELETED')
              .map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
          </select>
        )}
      </div>

      <div className="flex-1 flex flex-col relative z-10 px-6 py-8">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
          </div>
        ) : totalApps === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
            <Inbox className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium text-slate-500">
              Chưa có dữ liệu thống kê
            </p>
          </div>
        ) : (
          <div className="w-full">
            {/* UNIFIED 5-COMPONENTS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {STATS.map((stat) => {
                const IconComp = stat.icon;
                const percentage =
                  totalApps > 0
                    ? Math.max(0, Math.round((stat.value / totalApps) * 100))
                    : 0;

                return (
                  <div
                    key={stat.id}
                    className={`flex flex-col p-4 bg-white rounded-2xl border ${stat.borderClass} shadow-sm hover:shadow-md transition-all group`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`w-8 h-8 rounded-full ${stat.lightBgClass} ${stat.textClass} flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <IconComp size={16} strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-semibold text-slate-600">
                        {stat.label}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mb-3">
                      <p className="text-3xl font-black text-slate-800">
                        {stat.value}
                      </p>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${stat.lightBgClass} ${stat.textClass}`}
                      >
                        {percentage}%
                      </span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-auto">
                      <div
                        className={`h-full ${stat.bgClass} transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

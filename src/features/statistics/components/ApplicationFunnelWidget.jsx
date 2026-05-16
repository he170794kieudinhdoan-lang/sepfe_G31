import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  Loader2,
  TrendingUp,
  Inbox,
  Briefcase,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  PieChart as PieChartIcon,
  Calendar,
  UserCheck,
  Eye,
} from 'lucide-react';
import { format, subDays, subMonths, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  useDashboardStats,
  useJobFunnel,
  useJobStatus,
} from '../api/useStatistics';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
} from 'recharts';

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const statusConfig = {
    PUBLISHED: {
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Hiển thị',
    },
    WARNING: {
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      label: 'Chờ thanh toán',
    },
    EXPIRED: {
      color: 'bg-red-50 text-red-700 border-red-200',
      label: 'Hết hạn',
    },
  };

  const config = statusConfig[status] || {
    color: 'bg-gray-100 text-gray-800',
    label: status || 'Chưa rõ',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border ${config.color}`}
    >
      {config.label}
    </span>
  );
};

// ─── FUNNEL PILLS ────────────────────────────────────────────────────────────
const FUNNEL_ITEMS = [
  {
    key: 'applied',
    label: 'Chờ duyệt',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
  },
  { key: 'viewed', label: 'Đã xem', bg: 'bg-blue-100', text: 'text-blue-700' },
  {
    key: 'suitable',
    label: 'Phù hợp',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
  },
  {
    key: 'unsuitable',
    label: 'Từ chối',
    bg: 'bg-rose-100',
    text: 'text-rose-700',
  },
  {
    key: 'cancelled',
    label: 'Đã hủy',
    bg: 'bg-slate-200',
    text: 'text-slate-600',
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Lấy toàn bộ data point từ payload của chart hiện tại
    const data = payload[0].payload;
    const views = data.views || 0;
    const apps = data.applications || 0;
    const rate = views > 0 ? ((apps / views) * 100).toFixed(1) : 0;

    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-xl min-w-[180px]">
        <p className="text-sm font-bold text-slate-800 mb-2 border-b pb-1">
          {payload[0].payload.tooltipDate || label}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs text-slate-600">Lượt xem:</span>
            </div>
            <span className="text-xs font-bold text-slate-800 tabular-nums">
              {views.toLocaleString('vi-VN')}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-600">Ứng tuyển:</span>
            </div>
            <span className="text-xs font-bold text-slate-800 tabular-nums">
              {apps.toLocaleString('vi-VN')}
            </span>
          </div>
          <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-slate-500 italic">
              Hiệu quả (CVR):
            </span>
            <span className="text-xs font-bold text-primary">{rate}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// ─── JOB FUNNEL ROW ──────────────────────────────────────────────────────────
const JobFunnelRow = ({ job }) => {
  const { data: funnelData, isLoading: funnelLoading } = useJobFunnel(job.id);

  const views = job.viewCount || 0;
  const apps = job._count?.applications || 0;
  const rate = views > 0 ? (apps / views) * 100 : 0;

  const STEPS = [
    {
      key: 'applied',
      label: 'Chờ thanh toán',
      color: 'text-amber-600',
      dot: 'bg-amber-500',
    },
    {
      key: 'viewed',
      label: 'Đã xem',
      color: 'text-blue-600',
      dot: 'bg-blue-500',
    },
    {
      key: 'suitable',
      label: 'Phù hợp',
      color: 'text-emerald-600',
      dot: 'bg-emerald-500',
    },
    { isDivider: true },
    {
      key: 'unsuitable',
      label: 'Từ chối',
      color: 'text-rose-600',
      dot: 'bg-rose-500',
    },
    {
      key: 'cancelled',
      label: 'Đã hủy',
      color: 'text-slate-500',
      dot: 'bg-slate-400',
    },
  ];

  return (
    <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
      <td className="py-4 px-6 align-top">
        <p className="font-bold text-slate-800 text-sm whitespace-normal min-w-[180px] line-clamp-2">
          {job.title}
        </p>
        <p className="text-slate-500 text-[11px] mt-1 font-medium">
          {job.occupation?.name}
        </p>
      </td>

      <td className="py-4 px-6 align-top pt-5">
        <StatusBadge status={job.status} />
      </td>

      <td className="py-4 px-6 text-center align-top pt-5">
        <span className="text-slate-600 font-bold tabular-nums">
          {views.toLocaleString('vi-VN')}
        </span>
      </td>

      <td className="py-4 px-6 text-center align-top pt-5">
        <span className="text-blue-600 font-bold tabular-nums">
          {apps.toLocaleString('vi-VN')}
        </span>
      </td>

      <td className="py-4 px-6 text-center align-top pt-5">
        <span className="text-sm font-bold text-slate-700">
          {rate.toFixed(1)}%
        </span>
      </td>

      <td className="py-4 px-6 align-top">
        <div className="flex items-center justify-center gap-0 w-full">
          {STEPS.map((step, idx) => {
            if (step.isDivider) {
              return (
                <div
                  key={`div-${idx}`}
                  className="w-[1px] h-6 bg-slate-200 mx-3 mt-2"
                />
              );
            }
            const count = funnelData?.[step.key] ?? 0;
            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center min-w-[70px]">
                  <div className="flex items-center gap-1 mb-0.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${step.dot} shadow-sm`}
                    />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                      {step.label}
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    {count}
                  </span>
                </div>
                {idx < STEPS.length - 1 &&
                  !STEPS[idx + 1].isDivider &&
                  !step.isDivider && (
                    <div className="w-[1px] h-3 bg-slate-100 mt-2 mx-2" />
                  )}
              </React.Fragment>
            );
          })}
        </div>
      </td>
    </tr>
  );
};

// ─── MAIN WIDGET ──────────────────────────────────────────────────────────────
export const ApplicationFunnelWidget = ({ jobs = [] }) => {
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [activePreset, setActivePreset] = useState('14D');
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 13), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });
  const limit = 5;

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const handlePresetChange = (preset) => {
    setActivePreset(preset);
    if (preset === 'CUSTOM') return;

    const today = new Date();
    let fromDate;
    if (preset === '7D') fromDate = subDays(today, 6);
    else if (preset === '14D') fromDate = subDays(today, 13);
    else if (preset === '1M') fromDate = subMonths(today, 1);
    else if (preset === '3M') fromDate = subMonths(today, 3);

    setDateRange({
      from: format(fromDate, 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd'),
    });
  };

  const displayDateRange = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return '14 ngày gần nhất';
    try {
      const [fYear, fMonth, fDay] = dateRange.from.split('-').map(Number);
      const [tYear, tMonth, tDay] = dateRange.to.split('-').map(Number);

      const from = format(new Date(fYear, fMonth - 1, fDay), 'dd/MM/yyyy');
      const to = format(new Date(tYear, tMonth - 1, tDay), 'dd/MM/yyyy');
      return `Từ ${from} đến ${to}`;
    } catch (e) {
      return 'Khoảng thời gian';
    }
  }, [dateRange]);

  // Aggregate timeline (Dashboard Overview)
  const { data: dashboardRes, isLoading } = useDashboardStats({
    from: dateRange.from || undefined,
    to: dateRange.to || undefined,
  });
  // Job status stats (Pie Chart data)
  const { data: jobStatusRes, isLoading: jobStatusLoading } = useJobStatus();

  const formattedTimeline = useMemo(() => {
    return (dashboardRes?.timeline || []).map((item) => {
      try {
        const [year, month, day] = item.period.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        return {
          ...item,
          displayDate: format(dateObj, 'dd/MM'),
          tooltipDate: format(dateObj, 'dd/MM/yyyy'),
        };
      } catch (e) {
        return {
          ...item,
          displayDate: item.period,
          tooltipDate: item.period,
        };
      }
    });
  }, [dashboardRes?.timeline]);

  // Block 2: Job list with filter & pagination
  const filteredJobs = useMemo(() => {
    let list = jobs.filter((j) => j.status !== 'DELETED');
    if (filter === 'PUBLISHED')
      list = list.filter((j) => j.status === 'PUBLISHED');
    else if (filter === 'WARNING')
      list = list.filter((j) => j.status === 'WARNING');
    else if (filter === 'EXPIRED')
      list = list.filter((j) => j.status === 'EXPIRED');
    return list.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  }, [jobs, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / limit));
  const paginatedJobs = filteredJobs.slice((page - 1) * limit, page * limit);

  const handleFilterChange = (value) => {
    setFilter(value);
    setPage(1);
  };

  // Prepare Pie Chart data
  const pieData = useMemo(() => {
    if (!jobStatusRes) return [];
    return [
      {
        name: 'Đang hiển thị',
        value: jobStatusRes.published,
        fill: '#3b82f6', // Light Blue as in image
      },
      {
        name: 'Chờ thanh toán',
        value: jobStatusRes.warning,
        fill: '#10b981', // Green as in image
      },
      {
        name: 'Hết hạn',
        value: jobStatusRes.expired,
        fill: '#f59e0b', // Orange as in image
      },
    ].filter((item) => item.value > 0);
  }, [jobStatusRes]);

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      {/* ================================================================
          BLOCK 1: OVERVIEW CHART
      ================================================================ */}
      <Card className="p-6 rounded-2xl shadow-sm border-slate-200 bg-white">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
              Lượt xem & Lượt ứng tuyển
            </h3>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {displayDateRange}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Presets */}
            <div className="flex bg-slate-100/80 p-1 rounded-xl">
              {[
                { value: '7D', label: '1 tuần' },
                { value: '14D', label: '14 ngày' },
                { value: '1M', label: '1 tháng' },
                { value: '3M', label: '3 tháng' },
                { value: 'CUSTOM', label: 'Tùy chỉnh' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handlePresetChange(value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activePreset === value
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Custom Range Picker */}
            {activePreset === 'CUSTOM' && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="relative">
                  <input
                    type="date"
                    value={dateRange.from}
                    max={todayStr}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        from: e.target.value,
                      }))
                    }
                    className="pl-3 pr-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
                <span className="text-slate-400 text-xs font-bold">-</span>
                <div className="relative">
                  <input
                    type="date"
                    value={dateRange.to}
                    max={todayStr}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, to: e.target.value }))
                    }
                    className="pl-3 pr-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : formattedTimeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
            <BarChart3 className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Chưa có dữ liệu thống kê</p>
          </div>
        ) : (
          <div className="w-full space-y-8">
            {/* Chart 1: Lượt xem */}
            <div className="h-[200px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Lượt xem
                </span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={formattedTimeline}
                  syncId="funnelSync"
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis dataKey="displayDate" hide />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="#3b82f6"
                    fillOpacity={0.05}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Lượt ứng tuyển */}
            <div className="h-[160px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Lượt ứng tuyển
                </span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={formattedTimeline}
                  syncId="funnelSync"
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="displayDate"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    dy={10}
                    interval="preserveStartEnd"
                    minTickGap={30}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: '#10b981',
                      strokeWidth: 2,
                      stroke: '#fff',
                    }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </Card>

      {/* ================================================================
          BLOCK 2: CHI TIẾT TIN TUYỂN DỤNG & PIE CHART
      ================================================================ */}
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Table - Left Side */}
        <Card className="flex-[3] p-0 rounded-2xl shadow-sm border-slate-200 bg-white overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Chi tiết tin tuyển dụng
            </h3>

            <div className="flex bg-slate-100/80 p-1 rounded-xl">
              {[
                { value: 'ALL', label: 'Tất cả' },
                { value: 'PUBLISHED', label: 'Hiển thị' },
                { value: 'WARNING', label: 'Chờ thanh toán' },
                { value: 'EXPIRED', label: 'Hết hạn' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleFilterChange(value)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    filter === value
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Table content */}
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
                <tr className="border-b border-slate-100">
                  <th className="py-4 px-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Tin tuyển dụng
                  </th>
                  <th className="py-4 px-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="py-4 px-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Lượt xem
                  </th>
                  <th className="py-4 px-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Ứng tuyển
                  </th>
                  <th className="py-4 px-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Hiệu quả (CVR)
                  </th>
                  <th className="py-4 px-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Tiến trình hồ sơ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-400"
                    >
                      <Inbox className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      Chưa có tin tuyển dụng nào phù hợp
                    </td>
                  </tr>
                ) : (
                  paginatedJobs.map((job) => (
                    <JobFunnelRow key={job.id} job={job} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30 mt-auto">
              <span className="text-sm text-slate-500 font-medium">
                Trang {page} / {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Pie Chart - Right Side */}
        <Card className="lg:w-[350px] p-6 rounded-2xl shadow-sm border-slate-200 bg-white flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            Trạng thái tin tuyển dụng
          </h3>

          <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] relative">
            {jobStatusLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : pieData.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <PieChartIcon className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium text-center">
                  Chưa có dữ liệu trạng thái
                </p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={2}
                      fill="#3b82f6"
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        value,
                        name,
                        percent,
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius + 25;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#64748b"
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            className="text-[11px] font-bold"
                          >
                            {`${name}: ${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                      labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const percent =
                            jobStatusRes.total > 0
                              ? (
                                  (data.value / jobStatusRes.total) *
                                  100
                                ).toFixed(1)
                              : 0;
                          return (
                            <div className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-md text-xs">
                              <p className="font-bold text-slate-800">
                                {data.name}
                              </p>
                              <p className="text-slate-600 mt-1 flex items-center justify-between gap-4">
                                Số lượng:{' '}
                                <span className="font-bold">{data.value}</span>
                              </p>
                              <p className="text-slate-600 flex items-center justify-between gap-4">
                                Tỉ lệ:{' '}
                                <span className="font-bold text-primary">
                                  {percent}%
                                </span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Custom Legend at bottom in a horizontal layout to match image */}
                <div className="w-full mt-6 flex flex-wrap justify-center gap-4 border-t border-slate-50 pt-4">
                  {pieData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-[11px]"
                    >
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-slate-600 font-medium">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

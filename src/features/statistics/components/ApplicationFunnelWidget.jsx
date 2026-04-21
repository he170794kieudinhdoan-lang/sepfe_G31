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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApplicationFunnel, useJobStatus } from '../api/useStatistics';
import {
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
  Cell,
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
      label: 'Cảnh báo',
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

// ─── JOB FUNNEL ROW ──────────────────────────────────────────────────────────
const JobFunnelRow = ({ job }) => {
  const { data: funnelData, isLoading: funnelLoading } = useApplicationFunnel(
    job.id,
  );

  const views = job.viewCount || 0;
  const apps = job._count?.applications || 0;
  const rate = views > 0 ? (apps / views) * 100 : 0;
  const displayProgress = Math.min(100, rate);

  return (
    <tr className="group">
      <td className="py-3 px-6 align-top">
        <p className="font-bold text-slate-800 text-sm whitespace-normal min-w-[180px]">
          {job.title}
        </p>
        <p className="text-slate-500 text-xs mt-0.5">{job.occupation?.name}</p>
      </td>

      <td className="py-3 px-6 align-top pt-4">
        <StatusBadge status={job.status} />
      </td>

      <td className="py-3 px-6 text-center align-top pt-4">
        <span className="text-slate-600 font-medium tabular-nums">
          {views.toLocaleString('vi-VN')}
        </span>
      </td>

      <td className="py-3 px-6 text-center align-top pt-4">
        <span className="text-slate-600 font-medium tabular-nums">
          {apps.toLocaleString('vi-VN')}
        </span>
      </td>

      <td className="py-3 px-6 align-top pt-4">
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm font-semibold text-slate-700 w-12 text-right">
            {rate.toFixed(1)}%
          </span>
          <div className="w-[80px] h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>
      </td>

      <td className="py-3 px-6 align-top pt-4">
        <div className="flex flex-wrap gap-1.5 justify-end w-full max-w-[280px] ml-auto">
          {funnelLoading ? (
            <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
          ) : (
            FUNNEL_ITEMS.map(({ key, label, bg, text }) => {
              const count = funnelData?.[key] ?? 0;
              return (
                <span
                  key={key}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${bg} ${text}`}
                >
                  {label}
                  <span className="font-black">{count}</span>
                </span>
              );
            })
          )}
        </div>
      </td>
    </tr>
  );
};

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg">
        <p className="text-sm font-semibold text-slate-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm mt-1">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600">{entry.name}:</span>
            <span className="font-bold tabular-nums text-slate-900">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── MAIN WIDGET ──────────────────────────────────────────────────────────────
export const ApplicationFunnelWidget = ({ jobs = [] }) => {
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 5;

  // Aggregate timeline (không có jobId)
  const { data: funnelRes, isLoading } = useApplicationFunnel(undefined);
  // Job status stats (Pie Chart data)
  const { data: jobStatusRes, isLoading: jobStatusLoading } = useJobStatus();

  const formattedTimeline = useMemo(() => {
    return (funnelRes?.timeline || []).map((item) => {
      const parts = item.period?.split('-') || [];
      return {
        ...item,
        displayDate:
          parts.length === 3 ? `${parts[2]}/${parts[1]}` : item.period,
      };
    });
  }, [funnelRes?.timeline]);

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
        color: '#3b82f6', // Light Blue as in image
      },
      { 
        name: 'Chờ duyệt', 
        value: jobStatusRes.warning, 
        color: '#10b981' // Green as in image
      },
      { 
        name: 'Hết hạn', 
        value: jobStatusRes.expired, 
        color: '#f59e0b' // Orange as in image
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
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
          Lượt xem & Lượt ứng tuyển trong 14 ngày qua
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[320px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : formattedTimeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[320px] text-slate-400">
            <BarChart3 className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Chưa có dữ liệu thống kê</p>
          </div>
        ) : (
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formattedTimeline}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="views"
                  name="Lượt xem"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="applications"
                  name="Ứng tuyển"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
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
                { value: 'WARNING', label: 'Cảnh báo' },
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
                <tr>
                  <th className="font-semibold py-4 px-6 tracking-wide text-xs w-[30%]">
                    Công việc
                  </th>
                  <th className="font-semibold py-4 px-6 tracking-wide text-xs">
                    Trạng thái
                  </th>
                  <th className="font-semibold py-4 px-6 tracking-wide text-xs text-center">
                    Lượt xem
                  </th>
                  <th className="font-semibold py-4 px-6 tracking-wide text-xs text-center">
                    Ứng tuyển
                  </th>
                  <th className="font-semibold py-4 px-6 tracking-wide text-xs text-right w-[15%] min-w-[140px]">
                    Tỉ lệ ứng tuyển
                  </th>
                  <th className="font-semibold py-4 px-6 tracking-wide text-xs text-right w-[25%] min-w-[280px]">
                    Tiến trình hồ sơ ứng viên
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
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, value, name, percent }) => {
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
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
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
                          style={{ backgroundColor: item.color }}
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

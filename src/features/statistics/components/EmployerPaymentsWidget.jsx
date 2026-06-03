import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Loader2,
  TrendingUp,
  Calendar,
  Filter,
  CircleDollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmployerPayments } from '../api/useStatistics';

export const EmployerPaymentsWidget = () => {
  const getLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const defaultTo = getLocalDateString(new Date());
  const defaultFrom = getLocalDateString(
    new Date(new Date().getFullYear(), 0, 1),
  );

  const [dateRange, setDateRange] = useState({
    from: defaultFrom,
    to: defaultTo,
  });
  const [groupBy, setGroupBy] = useState('month');
  const [page, setPage] = useState(1);
  const limit = 8;

  useEffect(() => {
    setPage(1);
  }, [dateRange.from, dateRange.to, groupBy]);

  // Gọi API với params
  const { data: paymentsRes, isLoading } = useEmployerPayments({
    from: dateRange.from,
    to: dateRange.to,
    groupBy,
    page,
    limit,
  });

  const data = paymentsRes?.data || paymentsRes || {
    totalSpent: 0,
    trends: [],
    transactions: [],
    meta: { page: 1, totalPage: 1, total: 0 },
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);

  const formatCurrencyK = (val) => {
    if (val >= 1000000)
      return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'Tr';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val;
  };

  const formatDateLabel = (isoDate, group) => {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate; // Fallback
    if (group === 'day')
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      });
    if (group === 'month') return `Tháng ${d.getMonth() + 1}`;
    if (group === 'year') return d.getFullYear().toString();
    // week -> dd/MM
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const getOrderTypeLabel = (orderType) => {
    if (orderType === 'BOOST_JOB') return 'Đẩy tin nổi bật';
    if (orderType === 'FEATURE_LISTING') return 'Dang tin';
    if (orderType === 'PREMIUM_SUBSCRIPTION') return 'Premium';
    return orderType || '-';
  };

  // Tính toán chiều cao các cột Bar Chart
  const maxAmount =
    data.trends.length > 0 ? Math.max(...data.trends.map((t) => t.amount)) : 0;

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="p-0 rounded-2xl shadow-sm border-slate-200 flex flex-col h-full bg-white overflow-hidden">
      {/* HEADER: Title & Màng lọc */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-slate-50/50">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            Dòng tiền Chi tiêu
          </h3>
        </div>

        {/* BỘ LỌC */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Lọc: Từ Ngày */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm focus-within:ring-2 ring-primary/20 transition-all">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => handleDateChange('from', e.target.value)}
              className="border-none bg-transparent outline-none text-sm text-slate-700 w-32"
            />
          </div>
          <span className="text-slate-400 text-sm">-</span>
          {/* Lọc: Đến Ngày */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm focus-within:ring-2 ring-primary/20 transition-all">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => handleDateChange('to', e.target.value)}
              className="border-none bg-transparent outline-none text-sm text-slate-700 w-32"
            />
          </div>

          {/* Lọc: Group By */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm ml-auto lg:ml-0">
            <Filter size={16} className="text-slate-400" />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="border-none bg-transparent outline-none text-sm font-medium text-slate-700 w-24 cursor-pointer"
            >
              <option value="day">Theo Ngày</option>
              <option value="week">Theo Tuần</option>
              <option value="month">Theo Tháng</option>
              <option value="year">Theo Năm</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative z-10 px-6 py-8">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col gap-8">
            {/* TỔNG QUAN CHI TIÊU (Box Gold/Emerald nổi bật) */}
            <div className="w-full md:max-w-md bg-linear-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-lg shadow-emerald-500/20 text-white relative overflow-hidden group">
              {/* Vòng sáng decor */}
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-[-10px] right-2 w-24 h-24 bg-teal-400/30 rounded-full blur-xl pointer-events-none"></div>

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-emerald-50 font-medium text-sm mb-1 opacity-90">
                    Tổng ngân sách đã dùng
                  </p>
                  <p className="text-4xl font-black tracking-tight drop-shadow-sm">
                    {formatCurrency(data.totalSpent)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-inner">
                  <CircleDollarSign size={28} className="text-white" />
                </div>
              </div>
            </div>

            {/* BAR CHART CSS THUẦN */}
            {data.trends.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                <TrendingUp className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">
                  Không có dữ liệu chi tiêu trong khoảng thời gian này
                </p>
              </div>
            ) : (
              <div className="flex-1 min-h-[300px] w-full mt-8 flex flex-col">
                <h4 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider">
                  Biểu đồ Phân bổ chi tiêu
                </h4>

                {/* Scrollable Container */}
                <div className="w-full overflow-x-auto pb-6">
                  <div className="min-w-[500px] flex flex-col h-full">
                    {/* Trục Y & Cột */}
                    <div className="flex-1 flex items-end gap-1 sm:gap-2 relative border-b-2 border-slate-200 pb-0 h-64 mt-2">
                      {/* Grid Lines mờ đằng sau */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="border-t border-slate-100 w-full h-0"
                          ></div>
                        ))}
                      </div>

                      {data.trends.map((item, idx) => {
                        const heightPercent =
                          maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;

                        return (
                          <div
                            key={idx}
                            className="relative flex-1 flex flex-col items-center justify-end h-full group z-10"
                          >
                            {/* Tooltip Hover */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 flex flex-col items-center">
                              <div className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                                <span className="text-emerald-400">
                                  {formatDateLabel(item.period, groupBy)}
                                </span>
                                : {formatCurrency(item.amount)}
                              </div>
                              <div className="w-2 h-2 bg-slate-800 rotate-45 -mt-1"></div>
                            </div>

                            {/* Cột dữ liệu */}
                            <div
                              className="w-full max-w-[40px] bg-linear-to-t from-emerald-500 to-teal-400 rounded-t-lg relative transition-all duration-500 ease-out group-hover:brightness-110 shadow-sm"
                              style={{
                                height: `${heightPercent}%`,
                                minHeight: heightPercent > 0 ? '4px' : '0',
                              }}
                            >
                              <div className="absolute top-0 w-full h-1 bg-white/30 rounded-t-lg"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Trục X: Labels */}
                    <div className="flex items-center gap-1 sm:gap-2 pt-3">
                      {data.trends.map((item, idx) => (
                        <div key={idx} className="flex-1 flex justify-center">
                          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 whitespace-nowrap -rotate-45 sm:rotate-0 mt-2 sm:mt-0">
                            {formatDateLabel(item.period, groupBy)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Lịch sử giao dịch
                </h4>
                <p className="text-xs text-slate-500">{data.meta?.total || 0} giao dịch</p>
              </div>

              {data.transactions?.length ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-slate-500 bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 font-medium">Thời gian</th>
                          <th className="px-4 py-2 font-medium">Loại</th>
                          <th className="px-4 py-2 font-medium">Gói</th>
                          <th className="px-4 py-2 font-medium">Số tiền</th>
                          <th className="px-4 py-2 font-medium">Mã GD</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.transactions.map((row) => (
                          <tr key={row.id} className="border-t border-slate-100">
                            <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                              {new Date(row.createdAt).toLocaleString('vi-VN')}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {getOrderTypeLabel(row.orderType)}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {row.packageName ||
                                (row.packageDays ? `${row.packageDays} ngày` : 'Chưa xác định')}
                            </td>
                            <td className="px-4 py-3 font-semibold text-emerald-700">
                              {formatCurrency(row.amount || 0)}
                            </td>
                            <td className="px-4 py-3 text-slate-500 max-w-40 truncate" title={row.transactionCode || ''}>
                              {row.transactionCode || `DH-${row.id}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Trang {data.meta?.page || 1}/{data.meta?.totalPage || 1}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        disabled={(data.meta?.page || 1) <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        disabled={(data.meta?.page || 1) >= (data.meta?.totalPage || 1)}
                        onClick={() =>
                          setPage((p) => Math.min(data.meta?.totalPage || 1, p + 1))
                        }
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  Chưa có giao dịch trong khoảng thời gian đã chọn.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

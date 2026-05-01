import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Modal } from '@/shared/components/Modal';
import { DashboardLayout } from '@/shared/components/Layout/DashboardLayout';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useToast } from '@/shared/contexts/ToastContext';
import { parseNumber } from '@/shared/utils/formatCurrency';
import {
  useMyWallet,
  useTopupCheckout,
  useTopupOrderStatus,
  useWalletPricing,
  useWalletTransactions,
} from '@/features/wallet/api/useWallet';
import { useBoostPackages } from '@/features/jobs/api/useJobs';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  BarChart3,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Clock3,
  Coins,
  CreditCard,
  Home,
  History,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';

const EMPLOYER_MENU = [
  { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard, path: '/employer' },
  { key: 'jobs', label: 'Tin tuyển dụng', icon: Briefcase, path: '/employer/jobs' },
  { key: 'stats', label: 'Thống kê', icon: BarChart3, path: '/employer/stats' },
  { key: 'wallet', label: 'Ví point', icon: Wallet, path: '/employer/wallet' },
  { key: 'chat', label: 'Tin nhắn', icon: MessageCircle, path: '/chat', externalNav: true },
  { key: 'home', label: 'Trang chủ', icon: Home, path: '/', externalNav: true },
];

const QUICK_TOPUP_AMOUNTS = [100000, 200000, 500000, 1000000];
const TOPUP_MIN_AMOUNT = 10000;
const TOPUP_MAX_AMOUNT = 10000000;

const formatNumber = (value) => Number(value || 0).toLocaleString('vi-VN');

const formatCommaNumber = (value) => formatNumber(parseNumber(value));

const formatTransactionType = (type) => {
  if (!type) return 'Giao dịch point';
  return String(type)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
};

const formatDateTime = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

export const EmployerWalletPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [topupAmount, setTopupAmount] = useState('100000');
  const [checkoutData, setCheckoutData] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const txLimit = 10;

  const { data: walletRes, refetch: refetchWallet } = useMyWallet();
  const wallet = walletRes?.data || walletRes;
  const { data: boostPackagesRes } = useBoostPackages();
  const { data: walletPricingRes } = useWalletPricing();
  const walletPricing = walletPricingRes?.data || walletPricingRes || {};
  const invitePointCost = Number(walletPricing?.AI_INVITE_POINT_COST_PER_WORKER || 1000);
  const boostPackages = boostPackagesRes?.items || boostPackagesRes?.data || [];
  const activeBoostPackages = boostPackages.filter((item) => item?.isActive !== false);
  const configuredBoostDays = Math.max(1, Number(walletPricing?.BOOST_JOB_DURATION_DAYS || 7));
  const configuredBoostPointCost = Math.max(
    0,
    Number(walletPricing?.BOOST_JOB_POINT_COST || 50000),
  );
  const fallbackBoostPackage = useMemo(
    () => ({
      id: 0,
      name: `Gói boost ${configuredBoostDays} ngày`,
      description: 'Gói mặc định theo cấu hình hệ thống',
      durationDays: configuredBoostDays,
      price: configuredBoostPointCost,
      isDefault: true,
      isActive: true,
    }),
    [configuredBoostDays, configuredBoostPointCost],
  );
  const boostPackageOptions =
    activeBoostPackages.length > 0 ? activeBoostPackages : [fallbackBoostPackage];
  const referenceBoostPackage =
    boostPackageOptions.find((item) => item.isDefault) || boostPackageOptions[0] || fallbackBoostPackage;
  const { data: txRes } = useWalletTransactions({ page: txPage, limit: txLimit });
  const txPayload = txRes?.data || txRes;
  const transactions = txPayload?.items || [];
  const txMeta = txPayload?.meta;
  const totalPages = Math.max(Number(txMeta?.totalPage || 1), 1);
  const topupMutation = useTopupCheckout();

  // Poll the order status while modal is open
  const { data: orderStatusRes } = useTopupOrderStatus(orderId, {
    enabled: !!orderId && isPolling,
    refetchInterval: 2000, // Check every 2 seconds
    refetchOnFocus: false,
  });
  const orderStatus = orderStatusRes?.data || orderStatusRes;

  const amountNumber = useMemo(() => parseNumber(topupAmount), [topupAmount]);
  const isBelowBoostThreshold = amountNumber > 0 && amountNumber < Number(referenceBoostPackage?.price || 0);
  const isTopupAmountValid =
    Number.isInteger(amountNumber) &&
    amountNumber >= TOPUP_MIN_AMOUNT &&
    amountNumber <= TOPUP_MAX_AMOUNT;

  const closeCheckoutModal = () => {
    setIsPolling(false);
    setOrderId(null);
    setCheckoutData(null);
  };

  const handleTopup = async () => {
    if (!Number.isInteger(amountNumber)) {
      toast('Vui lòng nhập số tiền là số nguyên, không có số lẻ', 'error');
      return;
    }
    if (amountNumber < TOPUP_MIN_AMOUNT) {
      toast(`Số tiền tối thiểu là ${formatNumber(TOPUP_MIN_AMOUNT)}đ`, 'error');
      return;
    }
    if (amountNumber > TOPUP_MAX_AMOUNT) {
      toast(`Số tiền tối đa là ${formatNumber(TOPUP_MAX_AMOUNT)}đ`, 'error');
      return;
    }
    try {
      const res = await topupMutation.mutateAsync({ amount: amountNumber });
      const data = res?.data || res;
      setCheckoutData(data);
      setOrderId(data.paymentOrderId);
      setIsPolling(true);
      toast('Đã tạo QR nạp point thành công', 'success');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tạo QR nạp point';
      toast(Array.isArray(message) ? message.join(', ') : message, 'error');
    }
  };

  useEffect(() => {
    if (!orderStatus) return;

    const PaymentStatus = {
      PENDING: 'PENDING',
      COMPLETED: 'COMPLETED',
      FAILED: 'FAILED',
      CANCELLED: 'CANCELLED',
    };

    if (orderStatus.status === PaymentStatus.COMPLETED) {
      setIsPolling(false);
      refetchWallet();

      setTimeout(() => {
        toast('Thanh toán thành công! Point đã được cộng vào ví.', 'success');

        const returnTo = searchParams.get('returnTo');
        const resumeKey = searchParams.get('resumeKey');
        if (returnTo) {
          const [returnPath, returnQuery = ''] = returnTo.split('?');
          const nextParams = new URLSearchParams(returnQuery);
          nextParams.set('walletTopupSuccess', '1');
          if (resumeKey) {
            nextParams.set('resumeKey', resumeKey);
          }
          navigate(
            nextParams.toString() ? `${returnPath}?${nextParams.toString()}` : returnPath,
            { replace: true },
          );
          return;
        }
        closeCheckoutModal();
      }, 500);
    } else if (
      orderStatus.status === PaymentStatus.FAILED ||
      orderStatus.status === PaymentStatus.CANCELLED
    ) {
      setIsPolling(false);
      toast(`Thanh toán ${orderStatus.status === PaymentStatus.FAILED ? 'thất bại' : 'bị hủy'}. Vui lòng thử lại.`, 'error');
      closeCheckoutModal();
    }
  }, [orderStatus, navigate, searchParams, refetchWallet, toast]);

  const quickTopupOptions = useMemo(
    () =>
      QUICK_TOPUP_AMOUNTS.map((amount) => ({
        amount,
        point: amount,
        active: amount === amountNumber,
      })),
    [amountNumber],
  );

  const recentTransactions = transactions.slice(0, 5);

  return (
    <DashboardLayout
      title="Ví point doanh nghiệp"
      subtitle="Nạp point và theo dõi lịch sử giao dịch"
      menu={EMPLOYER_MENU}
      activeKey="wallet"
      topbarBell={<NotificationBellPopover />}
    >
      <div className="relative isolate space-y-6 pb-4">
        <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.22),transparent_38%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_30%),linear-gradient(to_bottom,rgba(248,250,252,0.95),rgba(255,255,255,0))]" />

        <section className="relative overflow-hidden rounded-3xl border border-amber-100 bg-linear-to-br from-amber-50 via-white to-cyan-50 px-6 py-7 text-slate-900 shadow-[0_26px_70px_-36px_rgba(15,23,42,0.18)] md:px-8 md:py-8">
          <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-5">
              <Badge className="w-fit border-amber-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Employer Wallet
              </Badge>

              <div className="space-y-3">
                <h2 className="max-w-2xl text-3xl font-black tracking-tight text-balance md:text-5xl">
                  Nạp point thật nhanh để đăng tin, boost job và dùng AI ngay khi cần.
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                  Mọi thao tác nạp đều được tạo QR tức thì. Chuyển khoản đúng nội dung để hệ thống tự cộng point và mở khóa các tính năng tuyển dụng.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-2">
                  <BadgeCheck className="h-4 w-4 text-emerald-600" />
                  1.000đ = 1 point
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50/80 px-3 py-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-600" />
                  Tự động cộng point sau khi thanh toán
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-3 py-2">
                  <Clock3 className="h-4 w-4 text-amber-600" />
                  QR tạo trong vài giây
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-4 shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Số dư hiện tại</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {formatNumber(wallet?.balancePoint || 0)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Point sẵn sàng để dùng</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-4 shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Đã nạp</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    {formatNumber(wallet?.totalTopupPoint || 0)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Point đã cộng vào ví</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-4 shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Đã tiêu</p>
                  <p className="mt-2 text-2xl font-bold text-rose-600">
                    {formatNumber(wallet?.totalSpentPoint || 0)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Point đã dùng cho tuyển dụng</p>
                </div>
              </div>
            </div>

            <Card className="overflow-hidden border-amber-100 bg-white/95 p-0 shadow-[0_20px_70px_-25px_rgba(15,23,42,0.12)]">
              <div className="border-b border-amber-100 bg-linear-to-r from-amber-50/80 via-white to-cyan-50/70 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/15">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Nạp point nhanh</p>
                    <p className="text-xs text-slate-500">Tạo QR và chuyển khoản đúng nội dung</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 p-5">
                <div className="rounded-2xl border border-amber-100 bg-linear-to-br from-amber-50/70 to-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Gợi ý nạp</p>
                      <p className="mt-1 text-lg font-black text-slate-900">
                        {formatNumber(Number(referenceBoostPackage?.price || configuredBoostPointCost))} point
                      </p>
                    </div>
                    <div className="rounded-2xl bg-amber-100 px-3 py-2 text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                        Boost job mặc định
                      </p>
                      <p className="text-xs text-amber-700/80">
                        {formatNumber(Number(referenceBoostPackage?.price || configuredBoostPointCost))} point / {Number(referenceBoostPackage?.durationDays || configuredBoostDays)} ngày
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      1 boost job
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      {formatNumber(invitePointCost)} point / AI invite
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Giao dịch gần nhất', value: formatDateTime(transactions[0]?.createdAt), icon: Clock3 },
                    { label: 'Tổng giao dịch', value: formatNumber(txMeta?.total || transactions.length), icon: CreditCard },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <item.icon className="h-4 w-4 text-slate-400" />
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleTopup}
                  disabled={topupMutation.isPending}
                  className="h-12 rounded-2xl bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-700"
                >
                  {topupMutation.isPending ? 'Đang tạo QR...' : 'Tạo QR nạp point'}
                  {!topupMutation.isPending && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]" id="topup-section">
          <Card className="overflow-hidden border-slate-200/70 bg-white/95 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]">
              <div className="border-b border-slate-100 bg-linear-to-r from-amber-50/70 to-white px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Nạp point</p>
              <h3 className="mt-1 text-xl font-black text-slate-900">Chọn mức nạp phù hợp cho kế hoạch tuyển dụng</h3>
              <p className="mt-2 text-sm text-slate-500">
                Chọn nhanh một mức nạp hoặc nhập số tiền riêng. Mức nạp sẽ được quy đổi 1:1 sang point.
              </p>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {quickTopupOptions.map((item) => (
                  <button
                    key={item.amount}
                    type="button"
                    onClick={() => setTopupAmount(String(item.amount))}
                    className={cn(
                      'group rounded-2xl border px-4 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                      item.active
                        ? 'border-cyan-600 bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                        : 'border-slate-200 bg-slate-50/80 text-slate-800 hover:border-cyan-200 hover:bg-white',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={cn('text-xs font-semibold uppercase tracking-[0.2em]', item.active ? 'text-cyan-100' : 'text-slate-400')}>
                          Nạp nhanh
                        </p>
                        <p className="mt-2 text-2xl font-black">{formatNumber(item.amount)}</p>
                      </div>
                      <div className={cn('rounded-full p-2', item.active ? 'bg-white/10' : 'bg-slate-100')}>
                        <Sparkles className={cn('h-4 w-4', item.active ? 'text-amber-300' : 'text-amber-500')} />
                      </div>
                    </div>
                    <p className={cn('mt-3 text-sm', item.active ? 'text-cyan-50' : 'text-slate-500')}>
                      {formatNumber(item.point)} point
                    </p>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900">Số tiền cần nạp</label>
                <p className="text-xs text-slate-500">
                  Tối thiểu {formatNumber(TOPUP_MIN_AMOUNT)}đ, tối đa {formatNumber(TOPUP_MAX_AMOUNT)}đ, chỉ nhập số nguyên.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      value={formatCommaNumber(topupAmount)}
                      onChange={(e) => setTopupAmount(String(e.target.value || '').replace(/\D/g, ''))}
                      placeholder="Nhập số tiền cần nạp"
                      inputMode="numeric"
                      min={TOPUP_MIN_AMOUNT}
                      max={TOPUP_MAX_AMOUNT}
                      pattern="[0-9]*"
                      className="h-12 rounded-2xl border-slate-200 bg-white pl-4 pr-16 text-base shadow-sm focus-visible:ring-slate-400"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-slate-400">
                      VND
                    </span>
                  </div>
                  <Button
                    onClick={handleTopup}
                    disabled={topupMutation.isPending || !isTopupAmountValid}
                    className="h-12 rounded-2xl px-6 shadow-lg shadow-primary/20"
                  >
                    {topupMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tạo QR...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Tạo mã nạp point
                      </>
                    )}
                  </Button>
                </div>

                <div
                  className={cn(
                    'rounded-2xl border px-4 py-4 text-sm',
                    !isTopupAmountValid
                      ? 'border-rose-200 bg-rose-50/70 text-rose-900'
                      : isBelowBoostThreshold
                      ? 'border-amber-200 bg-amber-50/70 text-amber-900'
                      : 'border-emerald-200 bg-emerald-50/70 text-emerald-900',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('mt-0.5 rounded-full p-2', !isTopupAmountValid ? 'bg-rose-100' : isBelowBoostThreshold ? 'bg-amber-100' : 'bg-emerald-100')}>
                      <ShieldCheck className={cn('h-4 w-4', !isTopupAmountValid ? 'text-rose-700' : isBelowBoostThreshold ? 'text-amber-700' : 'text-emerald-700')} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {!isTopupAmountValid
                          ? 'Số tiền chưa hợp lệ. Hãy nhập trong khoảng cho phép và không dùng số lẻ.'
                          : isBelowBoostThreshold
                          ? `Mức nạp này thấp hơn gói boost ${formatNumber(Number(referenceBoostPackage?.price || configuredBoostPointCost))} point.`
                          : 'Mức nạp này đủ để kích hoạt các tác vụ tuyển dụng phổ biến.'}
                      </p>
                      <p className="text-xs leading-5 opacity-80">
                        {!isTopupAmountValid
                          ? `Ví dụ hợp lệ: ${formatNumber(TOPUP_MIN_AMOUNT)}đ, ${formatNumber(500000)}đ, ${formatNumber(TOPUP_MAX_AMOUNT)}đ.`
                          : isBelowBoostThreshold
                          ? 'Nếu muốn đăng tin nổi bật hoặc chạy boost job, bạn có thể bấm nhanh mức lớn hơn bên trên.'
                          : 'Hệ thống sẽ tự cộng point sau khi nhận đúng giao dịch.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="overflow-hidden border-slate-200/70 bg-white/95 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]">
              <div className="border-b border-slate-100 bg-linear-to-r from-cyan-50/60 to-white px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Công cụ nhanh</p>
                <h3 className="mt-1 text-xl font-black text-slate-900">Chi phí point theo từng gói boost</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Lấy trực tiếp từ bảng gói boost đang active, không dùng một giá cố định nữa.
                </p>
              </div>
              <div className="grid gap-3 p-6 sm:grid-cols-2 xl:grid-cols-3">
                {boostPackageOptions.map((pkg, index) => {
                  const durationDays = Number(pkg?.durationDays || configuredBoostDays);
                  const price = Number(pkg?.price || configuredBoostPointCost);
                  const pointPerDay = durationDays > 0 ? Math.round(price / durationDays) : price;

                  return (
                    <div
                      key={`${pkg.id || index}-${durationDays}-${price}`}
                      className={cn(
                        'rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                        pkg?.isDefault
                          ? 'border-amber-200 bg-linear-to-br from-amber-50/80 to-white'
                          : 'border-slate-100 bg-linear-to-br from-slate-50/70 to-white',
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {pkg?.name || `Gói boost ${durationDays} ngày`}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatNumber(pointPerDay)} point/ngày
                          </p>
                        </div>
                        <div className={cn('rounded-full p-2', pkg?.isDefault ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500')}>
                          <TrendingUp className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Giá gói</p>
                          <p className="mt-1 text-2xl font-black text-slate-900">{formatNumber(price)}</p>
                        </div>
                        {pkg?.isDefault ? (
                          <Badge className="border-amber-200 bg-amber-100 text-amber-700">Mặc định</Badge>
                        ) : null}
                      </div>

                      {pkg?.description ? (
                        <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{pkg.description}</p>
                      ) : null}
                    </div>
                  );
                })}

                <div className="rounded-2xl border border-slate-100 bg-linear-to-br from-cyan-50/70 to-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">AI invite</p>
                      <p className="mt-1 text-xs text-slate-500">Mời ứng viên nhanh bằng AI</p>
                    </div>
                    <div className="rounded-full bg-cyan-100 p-2 text-cyan-700">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-black text-slate-900">{formatNumber(invitePointCost)}</p>
                  <p className="mt-1 text-sm text-slate-500">point / worker</p>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-slate-200/70 bg-white/95 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]">
              <div className="border-b border-slate-100 bg-linear-to-r from-white to-amber-50/50 px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Lịch sử giao dịch</p>
                    <h3 className="mt-1 text-xl font-black text-slate-900">Giao dịch point gần đây</h3>
                  </div>
                  <Badge variant="secondary" className="border-0 bg-slate-100 text-slate-700">
                    <History className="mr-1.5 h-3.5 w-3.5" />
                    {formatNumber(txMeta?.total || transactions.length)} giao dịch
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 p-6">
                {recentTransactions.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <CreditCard className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="mt-4 text-base font-semibold text-slate-900">Chưa có giao dịch point nào</p>
                    <p className="mt-2 text-sm text-slate-500">Nạp point để bắt đầu dùng boost job, AI invite và các tính năng tuyển dụng khác.</p>
                    <Button className="mt-5 rounded-2xl" onClick={handleTopup} disabled={topupMutation.isPending}>
                      Nạp point ngay
                    </Button>
                  </div>
                ) : (
                  recentTransactions.map((tx) => {
                    const delta = Number(tx.pointDelta || 0);
                    const positive = delta >= 0;

                    return (
                      <div
                        key={tx.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={positive ? 'secondary' : 'destructive'} className="border-0">
                                {positive ? 'Cộng point' : 'Trừ point'}
                              </Badge>
                              <span className="text-xs text-slate-500">{formatDateTime(tx.createdAt)}</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900">
                              {formatTransactionType(tx.type)}
                            </p>
                            <p className="text-xs text-slate-500">
                              Số dư sau giao dịch: {formatNumber(tx.balanceAfter)} point
                            </p>
                          </div>

                          <div className="text-right">
                            <p className={cn('text-xl font-black', positive ? 'text-emerald-600' : 'text-rose-600')}>
                              {positive ? '+' : ''}{formatNumber(delta)}
                            </p>
                            <p className="text-xs text-slate-500">point biến động</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    Trang {txPage}/{totalPages}
                    {txMeta?.total ? ` • Tổng ${formatNumber(txMeta.total)} giao dịch` : ''}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTxPage((prev) => Math.max(prev - 1, 1))}
                      disabled={txPage <= 1}
                      className="rounded-xl"
                    >
                      Trang trước
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTxPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={txPage >= totalPages}
                      className="rounded-xl"
                    >
                      Trang sau
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>

      <Modal
        open={!!checkoutData}
        title="Quét QR để nạp point"
        description="Chuyển khoản đúng nội dung để hệ thống tự cộng point."
        variant="custom"
        onClose={closeCheckoutModal}
      >
        {checkoutData && (
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-linear-to-b from-white to-slate-50 p-4 shadow-sm">
                    <div className="rounded-[20px] border border-slate-200 bg-white p-3 shadow-sm">
                {checkoutData.paymentUrl ? (
                  <img src={checkoutData.paymentUrl} alt="QR nạp point" className="mx-auto w-full max-w-[320px] rounded-2xl" />
                ) : (
                  <div className="flex min-h-70 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                    QR đang được tạo...
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Thông tin chuyển khoản</p>
                  <h4 className="mt-1 text-xl font-black text-slate-900">{checkoutData.paymentCode}</h4>
                </div>
                <div className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  Đang chờ thanh toán
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Số tiền</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {formatNumber(checkoutData.amount || 0)}đ
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Point nhận</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {formatNumber(checkoutData.pointAmount || 0)}
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-white p-1.5 text-slate-700 shadow-sm">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <p>Chuyển khoản đúng nội dung hiển thị ở trên để hệ thống tự cộng point.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-white p-1.5 text-slate-700 shadow-sm">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <p>Hệ thống đang tự động kiểm tra trạng thái giao dịch vài giây một lần.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-white p-1.5 text-slate-700 shadow-sm">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <p>
                    Số dư hiện tại: <strong>{formatNumber(wallet?.balancePoint || 0)} point</strong>
                  </p>
                </div>
              </div>

              <Button className="w-full rounded-2xl border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100" variant="outline" onClick={closeCheckoutModal}>
                Đóng cửa sổ thanh toán
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

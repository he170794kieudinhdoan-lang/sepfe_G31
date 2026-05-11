import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Modal } from '@/shared/components/Modal';
import { DashboardLayout } from '@/shared/components/Layout/DashboardLayout';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useNotificationRealtime } from '@/features/notifications';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useToast } from '@/shared/contexts/ToastContext';
import { parseNumber } from '@/shared/utils/formatCurrency';
import {
  useMyWallet,
  useTopupCheckout,
  useTopupOrderStatus,
  useWalletPricing,
  useWalletTransactions,
} from '@/features/wallet/api/useWallet';
import { usePointPricingRealtime } from '@/features/admin/hooks/usePointPricingRealtime';
import { usePaymentOrderRealtime } from '@/features/wallet/hooks/usePaymentOrderRealtime';
import { useBoostPackages } from '@/features/jobs/api/useJobs';
import { cn } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';
import {
  BarChart3,
  Briefcase,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Home,
  History,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  Wallet,
} from 'lucide-react';

const EMPLOYER_MENU = [
  { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard, path: '/employer' },
  { key: 'jobs', label: 'Tin tuyển dụng', icon: Briefcase, path: '/employer/jobs' },
  { key: 'interviews', label: 'Lịch phỏng vấn', icon: CalendarCheck, path: '/employer/interviews' },
  { key: 'stats', label: 'Thống kê', icon: BarChart3, path: '/employer/stats' },
  { key: 'wallet', label: 'Tài khoản điểm', icon: Wallet, path: '/employer/wallet' },
  { key: 'chat', label: 'Tin nhắn', icon: MessageCircle, path: '/chat', externalNav: true },
  { key: 'home', label: 'Trang chủ', icon: Home, path: '/', externalNav: true },
];

const QUICK_TOPUP_AMOUNTS = [100000, 200000, 500000, 1000000];
const TOPUP_MIN_AMOUNT = 10000;
const TOPUP_MAX_AMOUNT = 10000000;

const formatNumber = (value) => Number(value || 0).toLocaleString('vi-VN');

const formatCommaNumber = (value) => formatNumber(parseNumber(value));

const formatTransactionType = (type) => {
  if (!type) return 'Giao dịch';
  const t = String(type).toUpperCase();
  const map = {
    'TOPUP': 'Nạp điểm ví',
    'POST_JOB': 'Phí đăng tin',
    'BOOST_JOB': 'Phí đẩy tin',
    'AI_INVITE': 'Mời ứng viên AI',
    'INVITE_AI': 'Mời ứng viên AI',
    'JOB_POST': 'Phí đăng tin',
    'JOB_BOOST': 'Phí đẩy tin',
  };
  return map[t] || t.replace(/_/g, ' ').toLowerCase().replace(/(^|\s)\S/g, m => m.toUpperCase());
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

const PROMO_SLIDES = [
  { id: 'banner1', image: '/wallet-smart-banner.png' },
  { id: 'banner2', image: '/banner_1.png' },
  { id: 'banner3', image: '/banner_2.png' },
];

export const EmployerWalletPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [topupAmount, setTopupAmount] = useState('100000');
  const [checkoutData, setCheckoutData] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [txPage, setTxPage] = useState(1);
  const handledOrderIdRef = useRef(null);
  const txLimit = 10;
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

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
  const boostPackageOptions = activeBoostPackages;
  const referenceBoostPackage =
    boostPackageOptions.find((item) => item.isDefault) || boostPackageOptions[0];
  const minBoostPrice = useMemo(() => {
    try {
      const prices = (boostPackageOptions || []).map((p) => Number(p?.price || configuredBoostPointCost));
      if (!prices.length) return Number(configuredBoostPointCost || 0);
      return Math.max(0, Math.min(...prices));
    } catch (e) {
      return Number(configuredBoostPointCost || 0);
    }
  }, [boostPackageOptions, configuredBoostPointCost]);
  // Subscribe to realtime pricing updates so UI reflects admin changes immediately
  usePointPricingRealtime({
    enabled: true,
    onEvent: () => {
      // nothing extra to do here; the hook already invalidates queries
    },
  });

  // Subscribe to payment order realtime updates (disables polling when connected)
  const { realtimeStatus: orderRealtimeStatus, isRealtimeSubscribed: isOrderRealtimeSubscribed } = usePaymentOrderRealtime({
    orderId,
    enabled: !!orderId && !!checkoutData,
    onEvent: () => {
      // hook already invalidates query; no extra action needed
    },
  });

  const { data: txRes, isLoading: txLoading } = useWalletTransactions({ page: txPage, limit: txLimit });
  const txPayload = txRes?.data || txRes;
  const transactions = txPayload?.items || [];
  const txMeta = txPayload?.meta;
  const totalPages = Math.max(Number(txMeta?.totalPages || txMeta?.totalPage || 1), 1);
  const topupMutation = useTopupCheckout();
  const userId = user?.userId || user?.id || user?._id;

  const handleCheckoutSuccess = () => {
    if (handledOrderIdRef.current === orderId) return;

    handledOrderIdRef.current = orderId;
    refetchWallet();
    toast('Thanh toán thành công! Point đã được cộng vào ví.', 'success');

    const returnTo = searchParams.get('returnTo');
    const resumeKey = searchParams.get('resumeKey');
    closeCheckoutModal();

    if (returnTo) {
      const [returnPath, returnQuery = ''] = returnTo.split('?');
      const nextParams = new URLSearchParams(returnQuery);
      nextParams.set('walletTopupSuccess', '1');
      if (resumeKey) {
        nextParams.set('resumeKey', resumeKey);
      }
      navigate(nextParams.toString() ? `${returnPath}?${nextParams.toString()}` : returnPath, {
        replace: true,
      });
    }
  };

  useNotificationRealtime({
    enabled: !!checkoutData && !!orderId && !!userId,
    userId,
    onEvent: (payload) => {
      const notification = payload?.new || payload?.old;
      if (!notification) return;

      const title = typeof notification.title === 'string' ? notification.title : '';
      const link = typeof notification.link === 'string' ? notification.link : '';
      const message = typeof notification.message === 'string' ? notification.message : '';
      const isTopupSuccess =
        title.toLowerCase().includes('nạp point thành công') ||
        link.includes('walletTopupSuccess=1') ||
        message.toLowerCase().includes('đã cộng') && message.toLowerCase().includes('point');

      if (isTopupSuccess) {
        handleCheckoutSuccess();
      }
    },
  });

  // Poll the order status while modal is open (always enabled as fallback; realtime is preferred but polling is reliable)
  const { data: orderStatusRes } = useTopupOrderStatus(orderId, {
    enabled: !!orderId && !!checkoutData,
    refetchInterval: (query) => {
      const currentStatus = query?.state?.data?.data?.status || query?.state?.data?.status;
      if (currentStatus && currentStatus !== 'PENDING') return false;

      // Realtime-first: only fallback to a light interval while socket is not subscribed.
      return isOrderRealtimeSubscribed ? false : 3000;
    },
    refetchIntervalInBackground: true,
    refetchOnFocus: false,
  });
  const orderStatus = orderStatusRes?.data || orderStatusRes;

  const amountNumber = useMemo(() => parseNumber(topupAmount), [topupAmount]);
  const isBelowBoostThreshold = amountNumber > 0 && amountNumber < Number(minBoostPrice || 0);
  const isTopupAmountValid =
    Number.isInteger(amountNumber) &&
    amountNumber >= TOPUP_MIN_AMOUNT &&
    amountNumber <= TOPUP_MAX_AMOUNT;

  const closeCheckoutModal = () => {
    handledOrderIdRef.current = null;
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
      handledOrderIdRef.current = null;
      toast('Đã tạo QR nạp point thành công', 'success');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tạo QR nạp điểm';
      toast(Array.isArray(message) ? message.join(', ') : message, 'error');
    }
  };

  useEffect(() => {
    if (!orderId || !orderStatus) return;
    if (handledOrderIdRef.current === orderId) return;

    const PaymentStatus = {
      PENDING: 'PENDING',
      COMPLETED: 'COMPLETED',
      FAILED: 'FAILED',
      CANCELLED: 'CANCELLED',
    };

    if (orderStatus.status === PaymentStatus.COMPLETED) {
      handleCheckoutSuccess();
    } else if (
      orderStatus.status === PaymentStatus.FAILED ||
      orderStatus.status === PaymentStatus.CANCELLED
    ) {
      handledOrderIdRef.current = orderId;
      toast(`Thanh toán ${orderStatus.status === PaymentStatus.FAILED ? 'thất bại' : 'bị hủy'}. Vui lòng thử lại.`, 'error');
      closeCheckoutModal();
    }
  }, [orderId, orderStatus, navigate, searchParams, refetchWallet, toast]);

  const quickTopupOptions = useMemo(
    () =>
      QUICK_TOPUP_AMOUNTS.map((amount) => ({
        amount,
        point: amount,
        active: amount === amountNumber,
      })),
    [amountNumber],
  );

  const recentTransactions = transactions;
  const activeSlide = PROMO_SLIDES[selectedSlide] || PROMO_SLIDES[0];

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedSlide(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  const handlePrevSlide = () => emblaApi?.scrollPrev();
  const handleNextSlide = () => emblaApi?.scrollNext();

  return (
    <DashboardLayout
      title="Tài khoản điểm"
      subtitle="Nạp điểm • Theo dõi biến động"
      menu={EMPLOYER_MENU}
      activeKey="wallet"
      topbarBell={<NotificationBellPopover />}
    >
      <div className="space-y-6">
        {/* TOP SECTION: GRID CỘT TRÁI (7) VÀ CỘT PHẢI (5) */}
        <div className="grid gap-6 xl:grid-cols-12 items-start">
          {/* CỘT TRÁI: Carousel & Lịch sử */}
          <div className="xl:col-span-7 flex flex-col gap-6">
            {/* BĂNG CHUYỀN BANNER (Thay thế cả Banner độc lập) */}
            <Card className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md aspect-[21/9]">
              <div className="group relative flex-1 bg-slate-100">
                <div className="h-full overflow-hidden" ref={emblaRef}>
                  <div className="flex h-full">
                    {PROMO_SLIDES.map((slide) => (
                      <div key={slide.id} className="relative min-w-0 shrink-0 grow-0 basis-full">
                        <img src={slide.image} alt="Banner" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Nút điều hướng */}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/20 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/40"
                  onClick={handlePrevSlide}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/20 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/40"
                  onClick={handleNextSlide}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>

                <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
                  {PROMO_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => emblaApi?.scrollTo(idx)}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        idx === selectedSlide ? 'w-8 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/90',
                      )}
                      aria-label={`Xem slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </Card>

            {/* LỊCH SỬ GIAO DỊCH (Kéo lên lấp chỗ trống dưới Băng chuyền) */}
            <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <History className="h-5 w-5 text-slate-500" /> Lịch sử giao dịch
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Chi tiết biến động số dư tài khoản.
                  </p>
                </div>
                <Badge variant="secondary" className="bg-slate-100 px-3 py-1.5 text-slate-700">
                  {formatNumber(txMeta?.total || transactions.length)} giao dịch
                </Badge>
              </div>

              <div className="p-0 min-h-[300px] relative">
                {txLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 backdrop-blur-[1px]">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : null}
                {recentTransactions.length === 0 && !txLoading ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <History className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-900">Chưa phát sinh giao dịch</p>
                    <p className="mt-1 text-sm text-slate-500">Vui lòng nạp điểm để bắt đầu sử dụng.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentTransactions.map((tx) => {
                      const delta = Number(tx.pointDelta || 0);
                      const positive = delta >= 0;

                      return (
                        <div key={tx.id} className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-slate-50">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                                positive ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600',
                              )}
                            >
                              {positive ? <CreditCard className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-slate-800 leading-tight">{formatTransactionType(tx.type)}</p>
                              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                                <span>{formatDateTime(tx.createdAt)}</span>
                                <span className="h-0.5 w-0.5 rounded-full bg-slate-300" />
                                <span>Số dư mới: <strong className="text-slate-600">{formatNumber(tx.balanceAfter)}</strong></span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={cn(
                                'text-sm font-bold',
                                positive ? 'text-emerald-600' : 'text-slate-800',
                              )}
                            >
                              {positive ? '+' : ''}{formatNumber(delta)}
                            </p>
                            <p className="text-[9px] font-bold uppercase tracking-tighter text-slate-400">điểm</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {(totalPages > 1 || recentTransactions.length > 0) && (
                <div className="flex items-center justify-between rounded-b-xl border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                  <p className="text-sm text-slate-500">
                    Trang <span className="font-semibold text-slate-900">{txPage}</span> / {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTxPage((prev) => Math.max(prev - 1, 1))}
                      disabled={txPage <= 1}
                      className="bg-white hover:bg-slate-100"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" /> Trước
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTxPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={txPage >= totalPages}
                      className="bg-white hover:bg-slate-100"
                    >
                      Sau <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* CỘT PHẢI: Form Nạp Điểm & Thống Kê (sticky) */}
          <div className="xl:col-span-5 flex flex-col gap-6 sticky top-6">
            {/* THỐNG KÊ SỐ DƯ (Màu Vàng & Ngôn ngữ B2B) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 p-5 text-slate-900 shadow-md ring-1 ring-amber-300/50">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-white/40 p-3 shadow-sm ring-1 ring-white/50">
                    <Wallet className="h-6 w-6 text-amber-900" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">Số dư hiện tại</p>
                    <p className="mt-1 text-2xl font-black tracking-tight text-amber-950">
                      {formatNumber(wallet?.balancePoint || 0)} <span className="text-sm font-semibold text-amber-900">điểm</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col justify-center rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600">Đã nạp</p>
                <p className="mt-1 text-lg font-bold text-slate-800">{formatNumber(wallet?.totalTopupPoint || 0)}</p>
              </div>
              <div className="flex flex-col justify-center rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600">Đã sử dụng</p>
                <p className="mt-1 text-lg font-bold text-slate-800">{formatNumber(wallet?.totalSpentPoint || 0)}</p>
              </div>
            </div>

            {/* FORM NẠP ĐIỂM */}
            <Card className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-md">
              <div className="border-b border-slate-100 p-5">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <CreditCard className="h-5 w-5 text-primary" /> Nạp điểm vào ví
                </h3>
                <p className="mt-1 text-sm text-slate-500">Tỷ lệ quy đổi: 1.000 VNĐ = 1 điểm</p>
              </div>
              
              <div className="flex flex-1 flex-col gap-6 p-5">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Chọn mức nạp nhanh</label>
                  <div className="grid grid-cols-2 gap-3">
                    {quickTopupOptions.map((item) => (
                      <button
                        key={item.amount}
                        type="button"
                        onClick={() => setTopupAmount(String(item.amount))}
                        className={cn(
                          'rounded-lg border p-3 text-center transition-all duration-200',
                          item.active
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50',
                        )}
                      >
                        <p className={cn('text-base font-bold', item.active ? 'text-primary' : 'text-slate-700')}>
                          {formatNumber(item.amount)}đ
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          +{formatNumber(item.point)} điểm
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Nhập số tiền tuỳ chọn</label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={formatCommaNumber(topupAmount)}
                      onChange={(e) => setTopupAmount(String(e.target.value || '').replace(/\D/g, ''))}
                      placeholder="VD: 50,000"
                      inputMode="numeric"
                      className="h-12 rounded-lg pr-14 text-lg font-semibold text-slate-900"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-slate-500">
                      VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Tối thiểu: {formatNumber(TOPUP_MIN_AMOUNT)}đ</span>
                    <span>Tối đa: {formatNumber(TOPUP_MAX_AMOUNT)}đ</span>
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  {(!isTopupAmountValid || isBelowBoostThreshold) && (
                    <div
                      className={cn(
                        'mb-5 flex items-start gap-2 rounded-lg px-4 py-3 text-sm font-medium',
                        !isTopupAmountValid
                          ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                          : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
                      )}
                    >
                      <div className="mt-0.5">
                        {!isTopupAmountValid ? '⚠️' : '💡'}
                      </div>
                      <div>
                        {!isTopupAmountValid
                          ? 'Số tiền nạp không hợp lệ.'
                          : `Cần tối thiểu ${formatNumber(Number(minBoostPrice || configuredBoostPointCost))} điểm để dùng dịch vụ đẩy tin.`}
                      </div>
                    </div>
                  )}

                  <Button
                    size="lg"
                    onClick={handleTopup}
                    disabled={topupMutation.isPending || !isTopupAmountValid}
                    className="h-12 w-full rounded-lg text-base font-bold shadow-md transition-all hover:shadow-lg"
                  >
                    {topupMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang tạo mã thanh toán...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Tạo mã thanh toán
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        open={!!checkoutData}
        title="Xác nhận thanh toán"
        description="Lưu ý: Vui lòng chuyển khoản đúng nội dung bên dưới."
        variant="custom"
        onClose={closeCheckoutModal}
      >
        {checkoutData && (
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-none border border-slate-200 bg-linear-to-b from-white to-slate-50 p-4 shadow-sm">
                    <div className="rounded-none border border-slate-200 bg-white p-3 shadow-sm">
                {checkoutData.paymentUrl ? (
                  <img src={checkoutData.paymentUrl} alt="QR nạp điểm" className="mx-auto w-full max-w-[320px] rounded-none" />
                ) : (
                  <div className="flex min-h-70 items-center justify-center rounded-none border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                    Đang khởi tạo mã QR...
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-none border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Thông tin chuyển khoản</p>
                  <h4 className="mt-1 text-xl font-black text-slate-900">{checkoutData.paymentCode}</h4>
                </div>
                <div className="rounded-none bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  {isOrderRealtimeSubscribed ? 'Đang theo dõi realtime' : 'Đang chờ thanh toán'}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-none bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Số tiền</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {formatNumber(checkoutData.amount || 0)}đ
                  </p>
                </div>
                <div className="rounded-none bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Điểm nhận</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {formatNumber(checkoutData.pointAmount || 0)}
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-none border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-none bg-white p-1.5 text-slate-700 shadow-sm">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <p>Chuyển khoản đúng nội dung hiển thị ở trên để hệ thống tự cộng điểm.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-none bg-white p-1.5 text-slate-700 shadow-sm">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <p>
                    {isOrderRealtimeSubscribed
                      ? 'Trạng thái thanh toán đang được cập nhật realtime.'
                      : 'Hệ thống đang kết nối kênh realtime để cập nhật thanh toán.'}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-none bg-white p-1.5 text-slate-700 shadow-sm">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <p>
                    Số dư hiện tại: <strong>{formatNumber(wallet?.balancePoint || 0)} điểm</strong>
                  </p>
                </div>
              </div>

              <Button className="w-full rounded-none border-primary/20 bg-primary/5 text-primary hover:bg-primary/10" variant="outline" onClick={closeCheckoutModal}>
                Đóng cửa sổ thanh toán
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};


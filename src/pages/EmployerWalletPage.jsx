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
import useEmblaCarousel from 'embla-carousel-react';
import {
  BarChart3,
  Briefcase,
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
  { key: 'stats', label: 'Thống kê', icon: BarChart3, path: '/employer/stats' },
  { key: 'wallet', label: 'Ví điểm', icon: Wallet, path: '/employer/wallet' },
  { key: 'chat', label: 'Tin nhắn', icon: MessageCircle, path: '/chat', externalNav: true },
  { key: 'home', label: 'Trang chủ', icon: Home, path: '/', externalNav: true },
];

const QUICK_TOPUP_AMOUNTS = [100000, 200000, 500000, 1000000];
const TOPUP_MIN_AMOUNT = 10000;
const TOPUP_MAX_AMOUNT = 10000000;

const formatNumber = (value) => Number(value || 0).toLocaleString('vi-VN');

const formatCommaNumber = (value) => formatNumber(parseNumber(value));

const formatTransactionType = (type) => {
  if (!type) return 'Giao dịch điểm';
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

const PROMO_SLIDES = [
  {
    id: 'boost',
    title: 'Đẩy tin đúng lúc',
    desc: 'Tăng hiển thị cho tin quan trọng.',
    image:
      'https://picsum.photos/seed/worklink-boost/900/540',
  },
  {
    id: 'invite',
    title: 'Mời ứng viên bằng AI',
    desc: 'Chọn nhanh người phù hợp.',
    image:
      'https://picsum.photos/seed/worklink-ai/900/540',
  },
  {
    id: 'wallet',
    title: 'Theo dõi chi phí rõ ràng',
    desc: 'Biết ngay điểm vào và ra.',
    image:
      'https://picsum.photos/seed/worklink-wallet/900/540',
  },
];

export const EmployerWalletPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [topupAmount, setTopupAmount] = useState('100000');
  const [checkoutData, setCheckoutData] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const txLimit = 10;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

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
      name: `Gói đẩy tin ${configuredBoostDays} ngày`,
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
      toast('Đã tạo QR nạp điểm thành công', 'success');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tạo QR nạp điểm';
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
        toast('Thanh toán thành công! Điểm đã được cộng vào ví.', 'success');

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
      title="Ví điểm"
      subtitle="Nạp điểm • Theo dõi biến động"
      menu={EMPLOYER_MENU}
      activeKey="wallet"
      topbarBell={<NotificationBellPopover />}
    >
      <div className="space-y-4 rounded-none border border-slate-200 bg-white p-4">
        <section className="grid gap-4 xl:grid-cols-12">
          <Card className="rounded-none overflow-hidden border-l-2 border-l-amber-400 bg-white shadow-none xl:col-span-8">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Tính năng nổi bật</p>
                <p className="text-xs text-slate-500">Khám phá nhanh công cụ tuyển dụng</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-none bg-slate-100 hover:bg-slate-200"
                  onClick={handlePrevSlide}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-none bg-slate-100 hover:bg-slate-200"
                  onClick={handleNextSlide}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {PROMO_SLIDES.map((slide) => (
                  <div key={slide.id} className="min-w-0 shrink-0 grow-0 basis-full">
                    <img src={slide.image} alt={slide.title} className="h-56 w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 p-4">
              <p className="text-sm font-semibold text-slate-900">{activeSlide.title}</p>
              <p className="text-xs text-slate-500 line-clamp-1">{activeSlide.desc}</p>
              <div className="flex items-center gap-1.5 pt-1">
                {PROMO_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => emblaApi?.scrollTo(idx)}
                    className={cn(
                      'h-1.5 rounded-none transition-all',
                      idx === selectedSlide ? 'w-6 bg-primary' : 'w-2 bg-slate-300',
                    )}
                    aria-label={`Xem slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-3 xl:col-span-4 xl:grid-cols-1">
            <Card className="h-fit rounded-none border-t-2 border-t-amber-400 bg-white p-4 shadow-none">
              <p className="text-xs uppercase tracking-wide text-slate-500">Số dư</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatNumber(wallet?.balancePoint || 0)}
              </p>
              <p className="mt-1 text-xs text-slate-500">điểm khả dụng</p>
            </Card>
            <Card className="h-fit rounded-none border-t-2 border-t-amber-400 bg-white p-4 shadow-none">
              <p className="text-xs uppercase tracking-wide text-slate-500">Đã nạp</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatNumber(wallet?.totalTopupPoint || 0)}
              </p>
              <p className="mt-1 text-xs text-slate-500">điểm</p>
            </Card>
            <Card className="h-fit rounded-none border-t-2 border-t-amber-400 bg-white p-4 shadow-none">
              <p className="text-xs uppercase tracking-wide text-slate-500">Đã tiêu</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatNumber(wallet?.totalSpentPoint || 0)}
              </p>
              <p className="mt-1 text-xs text-slate-500">điểm</p>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-none border-l-2 border-l-amber-400 bg-white shadow-none">
            <div className="px-5 py-4">
              <h3 className="text-lg font-bold text-slate-900">Nạp điểm</h3>
              <p className="mt-1 text-xs text-slate-500">Tỷ lệ: 1.000đ = 1 điểm</p>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {quickTopupOptions.map((item) => (
                  <button
                    key={item.amount}
                    type="button"
                    onClick={() => setTopupAmount(String(item.amount))}
                    className={cn(
                      'rounded-none px-3 py-3 text-left transition',
                      item.active
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200',
                    )}
                  >
                    <p className="text-lg font-bold">{formatNumber(item.amount)}</p>
                    <p className={cn('mt-1 text-xs', item.active ? 'text-white/90' : 'text-slate-500')}>
                      {formatNumber(item.point)} điểm
                    </p>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900">Mức nạp tùy chỉnh</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      value={formatCommaNumber(topupAmount)}
                      onChange={(e) => setTopupAmount(String(e.target.value || '').replace(/\D/g, ''))}
                      placeholder="Nhập số tiền"
                      inputMode="numeric"
                      min={TOPUP_MIN_AMOUNT}
                      max={TOPUP_MAX_AMOUNT}
                      pattern="[0-9]*"
                      className="h-11 rounded-none bg-slate-100 pr-14 text-base"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-slate-400">
                      VND
                    </span>
                  </div>
                  <Button
                    onClick={handleTopup}
                    disabled={topupMutation.isPending || !isTopupAmountValid}
                    className="h-11 rounded-none px-5"
                  >
                    {topupMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tạo QR
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Tạo QR nạp điểm
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Min {formatNumber(TOPUP_MIN_AMOUNT)}đ • Max {formatNumber(TOPUP_MAX_AMOUNT)}đ
                </p>
              </div>

              <div
                className={cn(
                  'rounded-none px-3 py-3 text-sm',
                  !isTopupAmountValid
                    ? 'bg-rose-50 text-rose-700'
                    : isBelowBoostThreshold
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-emerald-50 text-emerald-700',
                )}
              >
                {!isTopupAmountValid
                  ? 'Số tiền chưa hợp lệ.'
                  : isBelowBoostThreshold
                  ? `Chưa đủ cho gói đẩy tin ${formatNumber(Number(referenceBoostPackage?.price || configuredBoostPointCost))} điểm.`
                  : 'Đủ cho thao tác chính.'}
              </div>
            </div>
          </Card>

          <Card className="rounded-none border-r-2 border-r-amber-400 bg-white shadow-none">
            <div className="px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Lịch sử biến động</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Tổng {formatNumber(txMeta?.total || transactions.length)} giao dịch
                  </p>
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                  <History className="mr-1.5 h-3.5 w-3.5" />
                  {formatDateTime(transactions[0]?.createdAt)}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 px-5 py-5">
              {recentTransactions.length === 0 ? (
                <div className="rounded-none bg-slate-50 px-4 py-10 text-center">
                  <p className="text-sm font-semibold text-slate-900">Chưa có biến động điểm</p>
                  <p className="mt-1 text-xs text-slate-500">Nạp điểm để bắt đầu.</p>
                </div>
              ) : (
                recentTransactions.map((tx) => {
                  const delta = Number(tx.pointDelta || 0);
                  const positive = delta >= 0;

                  return (
                    <div key={tx.id} className="rounded-none bg-slate-50 px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{formatTransactionType(tx.type)}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(tx.createdAt)}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Số dư sau GD: {formatNumber(tx.balanceAfter)} điểm
                          </p>
                        </div>
                        <p className={cn('text-lg font-extrabold', positive ? 'text-emerald-600' : 'text-rose-600')}>
                          {positive ? '+' : ''}
                          {formatNumber(delta)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}

              <div className="flex flex-col gap-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Trang {txPage}/{totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setTxPage((prev) => Math.max(prev - 1, 1))}
                    disabled={txPage <= 1}
                    className="rounded-none bg-slate-100 hover:bg-slate-200"
                  >
                    Trang trước
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setTxPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={txPage >= totalPages}
                    className="rounded-none bg-slate-100 hover:bg-slate-200"
                  >
                    Trang sau
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>

      <Modal
        open={!!checkoutData}
        title="Thanh toán nạp điểm"
        description="Chuyển khoản đúng nội dung."
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
                    QR đang được tạo...
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
                  Đang chờ thanh toán
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
                  <p>Hệ thống đang tự động kiểm tra trạng thái giao dịch vài giây một lần.</p>
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


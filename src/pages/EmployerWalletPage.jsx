import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Modal } from '@/shared/components/Modal';
import { DashboardLayout } from '@/shared/components/Layout/DashboardLayout';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useToast } from '@/shared/contexts/ToastContext';
import {
  useMyWallet,
  useTopupCheckout,
  useWalletTransactions,
} from '@/features/wallet/api/useWallet';
import { LayoutDashboard, Briefcase, BarChart3, Wallet } from 'lucide-react';

const EMPLOYER_MENU = [
  { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard, path: '/employer' },
  { key: 'jobs', label: 'Tin tuyển dụng', icon: Briefcase, path: '/employer/jobs' },
  { key: 'stats', label: 'Thống kê', icon: BarChart3, path: '/employer/stats' },
  { key: 'wallet', label: 'Ví point', icon: Wallet, path: '/employer/wallet' },
];

export const EmployerWalletPage = () => {
  const { toast } = useToast();
  const [topupAmount, setTopupAmount] = useState('100000');
  const [checkoutData, setCheckoutData] = useState(null);

  const { data: walletRes } = useMyWallet();
  const wallet = walletRes?.data || walletRes;
  const { data: txRes } = useWalletTransactions({ page: 1, limit: 20 });
  const transactions = txRes?.items || txRes?.data || [];
  const topupMutation = useTopupCheckout();

  const amountNumber = useMemo(() => Number(topupAmount || 0), [topupAmount]);

  const handleTopup = async () => {
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      toast('Vui lòng nhập số tiền hợp lệ', 'error');
      return;
    }
    try {
      const res = await topupMutation.mutateAsync({ amount: amountNumber });
      const data = res?.data || res;
      setCheckoutData(data);
      toast('Đã tạo QR nạp point thành công', 'success');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tạo QR nạp point';
      toast(Array.isArray(message) ? message.join(', ') : message, 'error');
    }
  };

  return (
    <DashboardLayout
      title="Ví point doanh nghiệp"
      subtitle="Nạp point và theo dõi lịch sử giao dịch"
      menu={EMPLOYER_MENU}
      activeKey="wallet"
      topbarBell={<NotificationBellPopover />}
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Số dư point</p>
            <p className="text-2xl font-bold mt-2">
              {(wallet?.balancePoint || 0).toLocaleString('vi-VN')}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Đã nạp</p>
            <p className="text-2xl font-bold mt-2 text-emerald-600">
              {(wallet?.totalTopupPoint || 0).toLocaleString('vi-VN')}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Đã tiêu</p>
            <p className="text-2xl font-bold mt-2 text-rose-600">
              {(wallet?.totalSpentPoint || 0).toLocaleString('vi-VN')}
            </p>
          </Card>
        </div>

        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Nạp point (1.000đ = 1.000 point)</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="number"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              placeholder="Nhập số tiền cần nạp"
              className="sm:max-w-xs"
            />
            <Button onClick={handleTopup} disabled={topupMutation.isPending}>
              {topupMutation.isPending ? 'Đang tạo QR...' : 'Tạo mã nạp point'}
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Lịch sử giao dịch point</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Thời gian</th>
                  <th>Loại</th>
                  <th>Biến động</th>
                  <th>Số dư sau giao dịch</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground">
                      Chưa có giao dịch.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-b-0">
                      <td className="py-3">{new Date(tx.createdAt).toLocaleString('vi-VN')}</td>
                      <td>{tx.type}</td>
                      <td className={tx.pointDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {tx.pointDelta >= 0 ? '+' : ''}
                        {tx.pointDelta.toLocaleString('vi-VN')}
                      </td>
                      <td>{tx.balanceAfter.toLocaleString('vi-VN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal
        open={!!checkoutData}
        title="Quét QR để nạp point"
        description="Chuyển khoản đúng nội dung để hệ thống tự cộng point."
        onClose={() => setCheckoutData(null)}
      >
        {checkoutData && (
          <div className="space-y-4">
            <div className="rounded-xl border p-3">
              <p className="text-xs text-slate-500">Mã chuyển khoản</p>
              <p className="font-semibold">{checkoutData.paymentCode}</p>
              <p className="text-xs text-slate-500 mt-2">
                Số tiền: {(checkoutData.amount || 0).toLocaleString('vi-VN')}đ
              </p>
              <p className="text-xs text-slate-500">
                Point nhận: {(checkoutData.pointAmount || 0).toLocaleString('vi-VN')}
              </p>
            </div>
            {checkoutData.paymentUrl ? (
              <img src={checkoutData.paymentUrl} alt="QR nạp point" className="w-64 mx-auto" />
            ) : null}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

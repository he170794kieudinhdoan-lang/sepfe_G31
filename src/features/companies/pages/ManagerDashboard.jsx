import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/shared/components/Layout/DashboardLayout';
import { Modal } from '@/shared/components/Modal';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';
import {
  Building2,
  FileText,
  MapPin,
  Globe,
  Mail,
  Calendar,
  ExternalLink,
  Eye,
  CheckCircle,
  XCircle,
  Phone,
  User,
  Search,
} from 'lucide-react';
import {
  useGetCompanies,
  useGetCompaniesById,
  useGetCompaniesByStatus,
  useReviewCompany,
} from '../api/useGetCompanies';

// 1. Cấu hình Menu và Màu sắc trạng thái
const MENU_QUAN_LY = [
  { key: 'all', label: 'Tất cả đơn' },
  { key: 'approvals', label: 'Đang xếp hàng duyệt' },
  { key: 'rejected', label: 'Đã từ chối' },
];

const MAU_TRANG_THAI = {
  APPROVED: {
    label: 'Đã thông qua',
    color: 'bg-green-50 text-green-700 border-green-100',
  },
  PENDING: {
    label: 'Đang chờ',
    color: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  REJECTED: {
    label: 'Từ chối',
    color: 'bg-red-50 text-red-700 border-red-100',
  },
};

export const ManagerDashboard = () => {
  const { toast } = useToast();

  // --- CÁC BIẾN QUẢN LÝ TRẠNG THÁI (STATE) ---
  const [tabHienTai, setTabHienTai] = useState('all'); // Lưu tab đang chọn
  const [idCongTyDangXem, setIdCongTyDangXem] = useState(null); // ID công ty khi nhấn "Xem"
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState(''); // Ô tìm kiếm

  const [moModalDuyet, setMoModalDuyet] = useState(false); // Đóng/mở modal Duyệt
  const [moModalTuChoi, setMoModalTuChoi] = useState(false); // Đóng/mở modal Từ chối
  const [lyDoTuChoi, setLyDoTuChoi] = useState(''); // Nội dung lý do từ chối

  // --- LẤY DỮ LIỆU TỪ API ---
  const { data: tatCaCongTy = [], isLoading: dangTaiTatCa } = useGetCompanies();
  const { data: congTyChoDuyet = [], isLoading: dangTaiChoDuyet } =
    useGetCompaniesByStatus('PENDING');
  const { data: congTyBiTuChoi = [], isLoading: dangTaiTuChoi } =
    useGetCompaniesByStatus('REJECTED');
  const { data: chiTietCongTy, isLoading: dangTaiChiTiet } =
    useGetCompaniesById(idCongTyDangXem);
  const mutationDuyetDon = useReviewCompany();

  // Logic chọn danh sách nào để hiển thị
  const mapperDữLiệu = {
    all: { data: tatCaCongTy, loading: dangTaiTatCa },
    approvals: { data: congTyChoDuyet, loading: dangTaiChoDuyet },
    rejected: { data: congTyBiTuChoi, loading: dangTaiTuChoi },
  };

  const dangTaiData = mapperDữLiệu[tabHienTai]?.loading;
  const danhSachGoc = mapperDữLiệu[tabHienTai]?.data || [];

  // Logic lọc theo ô tìm kiếm
  const danhSachHienThi = danhSachGoc.filter((item) =>
    item.name.toLowerCase().includes(tuKhoaTimKiem.toLowerCase()),
  );

  // --- HÀM XỬ LÝ DUYỆT / TỪ CHỐI ---
  const xuLyDuyetDon = async (traiThaiMoi) => {
    try {
      await mutationDuyetDon.mutateAsync({
        id: idCongTyDangXem,
        status: traiThaiMoi,
        rejectionReason: traiThaiMoi === 'REJECTED' ? lyDoTuChoi : null,
      });

      toast(traiThaiMoi === 'APPROVED' ? MSG.MSG55 : 'Đã gửi từ chối');

      // Reset trạng thái sau khi làm xong
      setMoModalDuyet(false);
      setMoModalTuChoi(false);
      setLyDoTuChoi('');
      setIdCongTyDangXem(null); // Quay lại danh sách
    } catch (error) {
      toast(MSG.MSG54, 'error');
    }
  };

  // ==========================================================
  // GIAO DIỆN 1: CHI TIẾT CÔNG TY (KHI NHẤN XEM)
  // ==========================================================
  const renderChiTiet = () => {
    if (dangTaiChiTiet)
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-600">
          <div className="h-10 w-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p>Đang lấy thông tin chi tiết...</p>
        </div>
      );

    if (!chiTietCongTy) return null;

    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => setIdCongTyDangXem(null)}
          className="text-slate-600 hover:bg-primary-muted hover:text-primary-muted-foreground"
        >
          ← Quay lại danh sách
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* CỘT TRÁI: THÔNG TIN CHUNG */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 rounded-xl border border-slate-200 shadow-sm bg-white">
              <div className="flex gap-6 items-start pb-6 border-b border-slate-100">
                <div className="h-20 w-20 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0">
                  {chiTietCongTy.logoUrl ? (
                    <img
                      src={chiTietCongTy.logoUrl}
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-slate-800">
                      {chiTietCongTy.name}
                    </h2>
                    <Badge
                      className={
                        MAU_TRANG_THAI[chiTietCongTy.status]?.color +
                        ' rounded-md'
                      }
                    >
                      {MAU_TRANG_THAI[chiTietCongTy.status]?.label}
                    </Badge>
                  </div>
                  <p className="text-slate-500 flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-slate-400" />{' '}
                    {chiTietCongTy.address}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <ItemThongTin
                  icon={FileText}
                  label="Mã số thuế"
                  value={chiTietCongTy.taxCode}
                />
                <ItemThongTin
                  icon={Globe}
                  label="Website"
                  value={chiTietCongTy.website || 'Chưa cập nhật'}
                  link={chiTietCongTy.website}
                />
                <ItemThongTin
                  icon={Calendar}
                  label="Ngày đăng ký"
                  value={new Date(chiTietCongTy.createdAt).toLocaleDateString(
                    'vi-VN',
                  )}
                />
                <ItemThongTin
                  icon={FileText}
                  label="Giấy phép kinh doanh"
                  value={
                    chiTietCongTy.businessLicenseUrl
                      ? 'Xem bản gốc'
                      : 'Chưa tải lên'
                  }
                  link={chiTietCongTy.businessLicenseUrl}
                />
              </div>

              <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-semibold text-slate-800 mb-2">
                  Giới thiệu công ty
                </h4>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {chiTietCongTy.description || 'Chưa có mô tả chi tiết.'}
                </p>
              </div>

              {chiTietCongTy.status === 'REJECTED' &&
                chiTietCongTy.rejectionReason && (
                  <div className="mt-4 p-5 bg-red-50 rounded-xl border border-red-100">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4" /> Lý do từ chối
                    </h4>
                    <p className="text-red-700 leading-relaxed text-sm font-medium">
                      {chiTietCongTy.rejectionReason}
                    </p>
                  </div>
                )}
            </Card>
          </div>

          {/* CỘT PHẢI: LIÊN HỆ & DUYỆT */}
          <div className="space-y-6">
            <Card className="p-6 rounded-xl border border-slate-200 shadow-sm bg-white">
              <h3 className="text-base font-bold mb-4 text-slate-800">
                Người đại diện
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                    {chiTietCongTy.owner?.fullName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {chiTietCongTy.owner?.fullName}
                    </p>
                    <p className="text-slate-400 text-xs">
                      ID: {chiTietCongTy.ownerId}
                    </p>
                  </div>
                </div>
                <div className="pt-4 space-y-2 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />{' '}
                    {chiTietCongTy.owner?.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />{' '}
                    {chiTietCongTy.owner?.phone}
                  </div>
                </div>
              </div>
            </Card>

            {chiTietCongTy.status === 'PENDING' && (
              <div className="space-y-3">
                <Button
                  className="w-full h-11 rounded-lg"
                  onClick={() => setMoModalDuyet(true)}
                >
                  Chấp thuận đơn
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-lg border-red-100 text-red-600 hover:bg-red-50 font-semibold"
                  onClick={() => setMoModalTuChoi(true)}
                >
                  Từ chối đơn
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================
  // GIAO DIỆN 2: DANH SÁCH CÔNG TY
  // ==========================================================
  const renderDanhSach = () => {
    return (
      <div className="space-y-4">
        {/* Thanh công cụ: Tìm kiếm */}
        <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm công ty..."
              className="pl-9 rounded-lg h-10 border-slate-200 focus:border-blue-500 bg-slate-50/50"
              value={tuKhoaTimKiem}
              onChange={(e) => setTuKhoaTimKiem(e.target.value)}
            />
          </div>
          <p className="text-sm text-slate-500 px-2 font-medium">
            Hiển thị{' '}
            <span className="text-blue-600 font-bold">
              {danhSachHienThi.length}
            </span>{' '}
            đơn
          </p>
        </div>

        {/* Bảng dữ liệu */}
        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Công ty</th>
                  <th className="px-6 py-4 font-semibold">Địa chỉ</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dangTaiData ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-20 text-center text-slate-400 font-medium"
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : danhSachHienThi.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-20 text-center text-slate-400"
                    >
                      Không tìm thấy dữ liệu nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  danhSachHienThi.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                            {c.logoUrl ? (
                              <img
                                src={c.logoUrl}
                                className="h-full w-full object-cover rounded-lg"
                              />
                            ) : (
                              <Building2 className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {c.name}
                            </p>
                            <p className="text-xs text-slate-400 font-normal">
                              {c.owner?.email || 'Chưa có email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {c.address || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={
                            MAU_TRANG_THAI[c.status]?.color +
                            ' border font-normal px-2 py-0.5 rounded-md text-[10px]'
                          }
                        >
                          {MAU_TRANG_THAI[c.status]?.label}
                        </Badge>
                        {c.status === 'REJECTED' && c.rejectionReason && (
                          <p
                            className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate italic"
                            title={c.rejectionReason}
                          >
                            Lý do: {c.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => setIdCongTyDangXem(c.id)}
                          variant="outline"
                          size="sm"
                          className="rounded-lg bg-primary-muted border-primary/20 text-primary-muted-foreground hover:bg-primary/10 hover:border-primary/30 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> Xem
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  // --- RENDERING CHÍNH ---
  return (
    <DashboardLayout
      title={
        MENU_QUAN_LY.find((m) => m.key === tabHienTai)?.label ||
        'Quản lý công ty'
      }
      menu={MENU_QUAN_LY}
      activeKey={tabHienTai}
      onSelect={(key) => {
        setTabHienTai(key);
        setIdCongTyDangXem(null);
      }}
      topbarBell={<NotificationBellPopover />}
    >
      <div className="min-h-screen bg-slate-50/50 p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <h2 className="text-xl font-bold text-slate-800">
            {MENU_QUAN_LY.find((m) => m.key === tabHienTai)?.label}
          </h2>
          {idCongTyDangXem ? renderChiTiet() : renderDanhSach()}
        </div>
      </div>

      {/* --- CÁC CỬA SỔ XÁC NHẬN (MODALS) --- */}
      <Modal
        open={moModalDuyet}
        title="Đồng ý duyệt đơn?"
        description="Sau khi duyệt, công ty có thể bắt đầu đăng tin tuyển dụng."
        confirmLabel="Đồng ý duyệt"
        onConfirm={() => xuLyDuyetDon('APPROVED')}
        onClose={() => setMoModalDuyet(false)}
      />

      <Modal
        open={moModalTuChoi}
        title="Lý do từ chối đơn"
        confirmLabel="Gửi thông báo"
        tone="danger"
        onConfirm={() => xuLyDuyetDon('REJECTED')}
        onClose={() => setMoModalTuChoi(false)}
      >
        <textarea
          className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 focus:border-red-400 outline-none text-sm bg-white"
          placeholder="Nhập lý do từ chối (ví dụ: Thiếu giấy phép kinh doanh...)"
          value={lyDoTuChoi}
          onChange={(e) => setLyDoTuChoi(e.target.value)}
        />
      </Modal>
    </DashboardLayout>
  );
};

// Component con để hiển thị thông tin từng dòng cho gọn
const ItemThongTin = ({ icon: Icon, label, value, link }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
      <Icon className="h-3 w-3" /> {label}
    </p>
    {link ? (
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
      >
        {value} <ExternalLink className="h-3 w-3" />
      </a>
    ) : (
      <p className="text-sm font-semibold text-slate-700">{value || '—'}</p>
    )}
  </div>
);

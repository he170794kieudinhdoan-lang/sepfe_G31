import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Modal } from '@/shared/components/Modal';
import { useToast } from '@/shared/contexts/ToastContext';
import { getJobById, getRelatedJobs } from '@/shared/data/mockJobs';
import { MSG } from '@/shared/constants/messages';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { MapPin, Wallet, Clock, Building2 } from 'lucide-react';

const TABS = [
  { key: 'desc', label: 'Mô tả' },
  { key: 'req', label: 'Yêu cầu' },
  { key: 'benefits', label: 'Quyền lợi' },
  { key: 'address', label: 'Địa điểm' },
];

export const JobDetailPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('desc');
  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [applyNote, setApplyNote] = useState('');
  const [applyConfirm, setApplyConfirm] = useState(false);

  const job = getJobById(id);
  const relatedJobs = getRelatedJobs(id);
  const isGuest = true;
  const isWorker = false;
  const hasApplied = false;
  const hasReported = false;

  if (!job) {
    return (
      <div className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-destructive">{MSG.MSG22}</h1>
        <Button className="mt-4 rounded-xl" asChild>
          <Link to="/">Về trang chủ</Link>
        </Button>
      </div>
    );
  }

  const handleApply = () => {
    if (!applyNote.trim() || !applyConfirm) {
      toast(MSG.MSG08, 'error');
      return;
    }
    setApplyOpen(false);
    toast(MSG.MSG25);
  };

  const handleReport = () => {
    if (hasReported) {
      toast(MSG.MSG31, 'error');
      setReportOpen(false);
      return;
    }
    setReportOpen(false);
    setReportReason('');
    setReportNote('');
    toast(MSG.MSG32);
  };

  return (
    <div className="bg-gray-50 min-h-full">
      {job.imageUrl ? (
        <div className="h-48 md:h-64 w-full overflow-hidden bg-gray-100">
          <ImageWithFallback src={job.imageUrl} alt="" className="w-full h-full object-cover" fallbackClassName="h-full w-full bg-gradient-to-br from-amber-100 to-amber-50" />
        </div>
      ) : null}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl lg:text-3xl font-bold">{job.title}</h1>
                <Badge className="rounded-lg">{job.status}</Badge>
              </div>
            </div>

            <Card className="p-4 rounded-xl shadow-sm flex items-center gap-4 border-0">
              {job.imageUrl ? (
                <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  <ImageWithFallback src={job.imageUrl} alt="" className="w-full h-full object-cover" fallbackClassName="w-full h-full bg-gradient-to-br from-amber-100 to-amber-50" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold">{job.company}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {job.location}
                </p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">
                Xem công ty
              </Button>
            </Card>

            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" /> {job.salary}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" /> {job.location}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> {job.shift}
              </span>
              <span className="text-muted-foreground">Số lượng: {job.vacancies}</span>
            </div>

            <div className="flex gap-1 p-1 rounded-xl bg-gray-100/80">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                    activeTab === key ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:bg-white/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Card className="p-6 rounded-xl shadow-sm border-0">
              {activeTab === 'desc' && <p className="text-muted-foreground">{job.description}</p>}
              {activeTab === 'req' && <p className="text-muted-foreground">{job.requirements}</p>}
              {activeTab === 'benefits' && <p className="text-muted-foreground">{job.benefits}</p>}
              {activeTab === 'address' && (
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {job.address}
                </p>
              )}
            </Card>

            <div>
              <h2 className="text-lg font-semibold mb-4">Việc làm liên quan</h2>
              {relatedJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có tin liên quan.</p>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {relatedJobs.map((j) => (
                    <Link key={j.id} to={`/job/${j.id}`}>
                      <Card className="p-0 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border-0">
                        {j.imageUrl ? (
                          <ImageWithFallback src={j.imageUrl} alt="" className="w-full h-28 object-cover" fallbackClassName="h-28 w-full bg-gradient-to-br from-amber-100 to-amber-50" />
                        ) : null}
                        <div className="p-4">
                          <p className="font-medium line-clamp-2">{j.title}</p>
                          <p className="text-sm text-muted-foreground">{j.company}</p>
                          <p className="text-sm mt-1">{j.salary}</p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-3">
              <Card className="p-6 rounded-xl shadow-sm border-0">
                {isGuest ? (
                  <Button className="w-full rounded-xl" asChild>
                    <Link to="/auth/login">Đăng nhập để ứng tuyển</Link>
                  </Button>
                ) : hasApplied ? (
                  <Button className="w-full rounded-xl" disabled>
                    Đã ứng tuyển
                  </Button>
                ) : (
                  <Button className="w-full rounded-xl" onClick={() => setApplyOpen(true)}>
                    Ứng tuyển ngay
                  </Button>
                )}
                {isWorker && !hasApplied && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full mt-2 rounded-xl"
                      onClick={() => {}}
                    >
                      Thêm vào Wishlist
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full mt-2 rounded-xl"
                      onClick={() => setReportOpen(true)}
                    >
                      Báo cáo
                    </Button>
                  </>
                )}
                {hasApplied && <p className="text-sm text-muted-foreground mt-2">{MSG.MSG27}</p>}
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={applyOpen}
        title="Ứng tuyển"
        description="Điền thông tin ứng tuyển"
        onClose={() => setApplyOpen(false)}
        onConfirm={handleApply}
        confirmLabel="Gửi"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Giới thiệu bản thân / Ghi chú</label>
            <Input
              className="mt-1 rounded-xl"
              placeholder="Viết ngắn gọn..."
              value={applyNote}
              onChange={(e) => setApplyNote(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={applyConfirm}
              onChange={(e) => setApplyConfirm(e.target.checked)}
            />
            <span className="text-sm">Tôi xác nhận thông tin đúng sự thật.</span>
          </label>
        </div>
      </Modal>

      <Modal
        open={reportOpen}
        title="Báo cáo tin tuyển dụng"
        description="Chọn lý do và ghi chú (tùy chọn)"
        onClose={() => setReportOpen(false)}
        onConfirm={handleReport}
        confirmLabel="Gửi báo cáo"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Lý do</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full mt-1 rounded-xl border px-3 py-2"
            >
              <option value="">-- Chọn --</option>
              <option value="fraud">Lừa đảo</option>
              <option value="inappropriate">Nội dung không phù hợp</option>
              <option value="unclear">Thông tin không rõ ràng</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Ghi chú (tùy chọn)</label>
            <Input
              className="mt-1 rounded-xl"
              placeholder="Mô tả thêm..."
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

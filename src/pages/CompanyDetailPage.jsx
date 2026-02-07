import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/shared/components/EmptyState';
import { getCompanyById, MOCK_REVIEWS } from '@/shared/data/mockCompanies';
import { MOCK_JOBS } from '@/shared/data/mockJobs';
import { MSG } from '@/shared/constants/messages';
import { MapPin, Star } from 'lucide-react';

const TABS = [
  { key: 'info', label: 'Thông tin' },
  { key: 'jobs', label: 'Việc làm' },
  { key: 'reviews', label: 'Đánh giá' },
];

export const CompanyDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('info');
  const company = getCompanyById(id);
  const jobs = MOCK_JOBS.filter((j) => j.companyId === company?.id);
  const reviews = MOCK_REVIEWS;

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-destructive font-medium">Không tìm thấy công ty.</p>
        <Button className="mt-4 rounded-xl" asChild><Link to="/companies">Về danh sách công ty</Link></Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="p-6 rounded-xl shadow-sm border-0 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-20 w-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              <img src={company.logoUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{company.name}</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" /> {company.location}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {company.rating}
                </span>
                <Badge variant="secondary" className="rounded-lg">{company.sector}</Badge>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 p-1 rounded-xl bg-gray-100 mb-6">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === key ? 'bg-white shadow-sm' : 'text-muted-foreground hover:bg-white/50'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'info' && (
          <Card className="p-6 rounded-xl shadow-sm border-0">
            <h3 className="font-semibold mb-4">Giới thiệu</h3>
            <p className="text-muted-foreground">{company.description}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div><dt className="text-muted-foreground">Quy mô</dt><dd>{company.size} nhân viên</dd></div>
              <div><dt className="text-muted-foreground">Ngành</dt><dd>{company.sector}</dd></div>
            </dl>
          </Card>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <Card className="p-6 rounded-xl border-0"><p className="text-muted-foreground">Chưa có tin tuyển dụng.</p></Card>
            ) : (
              jobs.map((j) => (
                <Link key={j.id} to={`/job/${j.id}`}>
                  <Card className="p-4 rounded-xl shadow-sm border-0 hover:shadow-md transition">
                    <h4 className="font-semibold">{j.title}</h4>
                    <p className="text-sm text-muted-foreground">{j.salary} · {j.location}</p>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <Card className="p-6 rounded-xl shadow-sm border-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Đánh giá</h3>
              <Button size="sm" className="rounded-xl">Viết đánh giá</Button>
            </div>
            {reviews.length === 0 ? (
              <EmptyState title={MSG.MSG56} description="Chưa có đánh giá nào." />
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.userName}</span>
                      <span className="flex text-amber-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      <span className="text-xs text-muted-foreground">{r.createdAt}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{r.content}</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="ghost" size="sm" className="rounded-lg text-xs">Sửa</Button>
                      <Button variant="ghost" size="sm" className="rounded-lg text-xs text-destructive">Xóa</Button>
                      <Button variant="ghost" size="sm" className="rounded-lg text-xs">Báo cáo</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

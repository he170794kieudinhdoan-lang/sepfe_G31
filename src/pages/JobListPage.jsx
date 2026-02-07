import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/shared/components/EmptyState';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { MOCK_JOBS } from '@/shared/data/mockJobs';
import { MSG } from '@/shared/constants/messages';
import { MapPin, Search, Timer, Wallet } from 'lucide-react';

const FILTERS = {
  location: ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Bình Dương', 'Nha Trang'],
  salary: ['Dưới 5 triệu', '5-10 triệu', '10-15 triệu', 'Trên 15 triệu'],
  shift: ['Ca ngày', 'Ca đêm', 'Ca xoay', 'Ca tối'],
  sector: ['Kho vận', 'Nhà hàng', 'Bán lẻ', 'Giao hàng', 'Khách sạn'],
  jobType: ['Full-time', 'Part-time'],
};

const JobCard = ({ job }) => (
  <Card className="p-0 shadow-sm hover:shadow-md transition rounded-xl overflow-hidden border-0">
    {job.imageUrl && (
      <ImageWithFallback src={job.imageUrl} alt="" className="w-full h-32 object-cover" fallbackClassName="h-32 w-full bg-gradient-to-br from-amber-100 to-amber-50" />
    )}
    <div className="p-4">
      <h3 className="font-semibold line-clamp-1">{job.title}</h3>
      <p className="text-sm text-muted-foreground">{job.company}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
        <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> {job.salary}</span>
        <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> {job.shift}</span>
      </div>
      <Button variant="outline" size="sm" className="mt-3 rounded-xl w-full" asChild>
        <Link to={`/job/${job.id}`}>Xem chi tiết</Link>
      </Button>
    </div>
  </Card>
);

export const JobListPage = () => {
  const [search, setSearch] = useState(() => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('q') || '');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [shift, setShift] = useState('');
  const [sector, setSector] = useState('');
  const [jobType, setJobType] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...MOCK_JOBS];
    if (search) list = list.filter((j) => j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()));
    if (location) list = list.filter((j) => j.location === location);
    if (salary) list = list.filter((j) => j.salary && j.salary.includes(salary.replace(' triệu', '').split('-')[0]?.trim() || ''));
    if (shift) list = list.filter((j) => j.shift === shift);
    if (sector) list = list.filter((j) => j.sector === sector);
    if (sort === 'salary') list.sort((a, b) => (b.salary || '').localeCompare(a.salary || ''));
    return list;
  }, [search, location, salary, shift, sector, sort]);

  const perPage = 8;
  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const FilterPanel = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-muted-foreground">Khu vực</label>
        <select value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full rounded-xl bg-gray-50 shadow-sm text-sm">
          <option value="">Tất cả</option>
          {FILTERS.location.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Mức lương</label>
        <select value={salary} onChange={(e) => setSalary(e.target.value)} className="mt-1 w-full rounded-xl bg-gray-50 shadow-sm text-sm">
          <option value="">Tất cả</option>
          {FILTERS.salary.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Ca làm</label>
        <select value={shift} onChange={(e) => setShift(e.target.value)} className="mt-1 w-full rounded-xl bg-gray-50 shadow-sm text-sm">
          <option value="">Tất cả</option>
          {FILTERS.shift.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Ngành nghề</label>
        <select value={sector} onChange={(e) => setSector(e.target.value)} className="mt-1 w-full rounded-xl bg-gray-50 shadow-sm text-sm">
          <option value="">Tất cả</option>
          {FILTERS.sector.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Loại hình</label>
        <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="mt-1 w-full rounded-xl bg-gray-50 shadow-sm text-sm">
          <option value="">Tất cả</option>
          {FILTERS.jobType.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 shrink-0">
            <Card className="p-4 rounded-xl shadow-sm border-0 sticky top-24">
              <h3 className="font-semibold mb-4">Bộ lọc</h3>
              <FilterPanel />
            </Card>
          </aside>
          <main className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên việc, công ty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl border-0 shadow-sm bg-white"
                />
              </div>
              <Button variant="outline" className="rounded-xl lg:hidden" onClick={() => setDrawerOpen(true)}>Bộ lọc</Button>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl bg-white shadow-sm px-4 py-2 text-sm">
                <option value="newest">Mới nhất</option>
                <option value="salary">Lương cao</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <EmptyState title={MSG.MSG22} description="Thử thay đổi bộ lọc hoặc từ khóa." />
            ) : (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginated.map((job) => <JobCard key={job.id} job={job} />)}
                </div>
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button key={p} variant={page === p ? 'default' : 'outline'} size="sm" className="rounded-xl" onClick={() => setPage(p)}>{p}</Button>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setDrawerOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white p-4 z-50 shadow-xl lg:hidden overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Bộ lọc</h3>
              <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>Đóng</Button>
            </div>
            <FilterPanel />
          </div>
        </>
      )}
    </div>
  );
}

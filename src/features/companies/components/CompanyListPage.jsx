import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/shared/components/EmptyState';
import { MOCK_COMPANIES } from '@/shared/data/mockCompanies';
import { MSG } from '@/shared/constants/messages';
import { MapPin, Search, Star } from 'lucide-react';

export const CompanyListPage = () => {
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');

  const filtered = useMemo(() => {
    let list = [...MOCK_COMPANIES];
    if (search) list = list.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    if (sector) list = list.filter((c) => c.sector === sector);
    if (location) list = list.filter((c) => c.location === location);
    if (size) list = list.filter((c) => c.size === size);
    return list;
  }, [search, sector, location, size]);

  return (
    <div className="bg-gray-50 min-h-full py-6">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Danh sách công ty</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm theo tên công ty" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl bg-white shadow-sm" />
          </div>
          <select value={sector} onChange={(e) => setSector(e.target.value)} className="rounded-xl bg-white shadow-sm px-4 py-2 text-sm">
            <option value="">Ngành nghề</option>
            <option value="Kho vận">Kho vận</option>
            <option value="Nhà hàng">Nhà hàng</option>
            <option value="Bán lẻ">Bán lẻ</option>
            <option value="Giao hàng">Giao hàng</option>
          </select>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-xl bg-white shadow-sm px-4 py-2 text-sm">
            <option value="">Khu vực</option>
            <option value="TP.HCM">TP.HCM</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Bình Dương">Bình Dương</option>
          </select>
          <select value={size} onChange={(e) => setSize(e.target.value)} className="rounded-xl bg-white shadow-sm px-4 py-2 text-sm">
            <option value="">Quy mô</option>
            <option value="10-50">10-50</option>
            <option value="50-100">50-100</option>
            <option value="100-500">100-500</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title={MSG.MSG49} description="Thử thay đổi bộ lọc." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <Link key={c.id} to={`/company/${c.id}`}>
                <Card className="p-4 rounded-xl shadow-sm border-0 hover:shadow-md transition h-full">
                  <div className="flex gap-3">
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <img src={c.logoUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{c.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {c.location}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {c.rating}
                        </span>
                        <span className="text-xs text-muted-foreground">· {c.jobCount} tin tuyển dụng</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

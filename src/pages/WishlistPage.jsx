import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/shared/components/EmptyState';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useToast } from '@/shared/contexts/ToastContext';
import { MSG } from '@/shared/constants/messages';
import { MOCK_JOBS } from '@/shared/data/mockJobs';
import { MapPin, Trash2, Wallet } from 'lucide-react';

const SAVED_IDS = [1, 2, 3];

export const WishlistPage = () => {
  const [savedIds, setSavedIds] = useState(SAVED_IDS);
  const { toast } = useToast();
  const list = MOCK_JOBS.filter((j) => savedIds.includes(j.id));

  const remove = (id) => {
    setSavedIds((prev) => prev.filter((x) => x !== id));
    toast('Đã xóa khỏi wishlist.');
  };

  if (list.length === 0) {
    return (
      <div className="bg-gray-50 min-h-full py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Việc làm đã lưu</h1>
          <EmptyState title="Chưa có việc làm nào được lưu" description={MSG.MSG30} actionLabel="Xem việc làm" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full py-6">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Việc làm đã lưu</h1>
        <div className="space-y-4">
          {list.map((job) => (
            <Card key={job.id} className="p-4 rounded-xl shadow-sm border-0 flex flex-col sm:flex-row gap-4">
              {job.imageUrl && (
                <div className="w-full sm:w-32 h-24 sm:h-24 rounded-xl overflow-hidden shrink-0">
                  <ImageWithFallback src={job.imageUrl} alt="" className="w-full h-full object-cover" fallbackClassName="w-full h-full bg-amber-100" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-muted-foreground">{job.company}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Wallet className="h-4 w-4" /> {job.salary}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" className="rounded-xl" asChild>
                  <Link to={`/job/${job.id}`}>Xem chi tiết</Link>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl text-destructive hover:text-destructive" onClick={() => remove(job.id)} title="Xóa khỏi wishlist">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

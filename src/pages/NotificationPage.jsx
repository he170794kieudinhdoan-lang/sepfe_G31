import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/shared/components/EmptyState';
import { MSG } from '@/shared/constants/messages';
import { Bell, Check, Trash2 } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  { id: 1, icon: Bell, content: 'Tin "Nhân viên kho vận" phù hợp với hồ sơ của bạn.', time: '10 phút trước', read: false },
  { id: 2, icon: Bell, content: 'Công ty LogiFast đã xem hồ sơ của bạn.', time: '1 giờ trước', read: false },
  { id: 3, icon: Bell, content: 'Bạn đã ứng tuyển thành công vào "Thu ngân siêu thị".', time: 'Hôm qua', read: true },
];

export const NotificationPage = () => {
  const [items, setItems] = useState(MOCK_NOTIFICATIONS);

  const markRead = (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const remove = (id) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-full py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Thông báo</h1>
          <EmptyState title={MSG.MSG65} description="Chưa có thông báo nào." />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full py-6">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Thông báo</h1>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={markAllRead}>Đánh dấu tất cả đã đọc</Button>
        </div>
        <div className="space-y-3">
          {items.sort((a, b) => (a.read === b.read ? 0 : a.read ? 1 : -1)).map((n) => (
            <Card key={n.id} className={`p-4 rounded-xl shadow-sm border-0 ${!n.read ? 'bg-primary/5' : ''}`}>
              <div className="flex gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${!n.read ? 'bg-primary/20' : 'bg-gray-100'}`}>
                  <n.icon className={`h-5 w-5 ${!n.read ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{n.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!n.read && (
                    <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => markRead(n.id)} title="Đánh dấu đã đọc">
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground" onClick={() => remove(n.id)} title="Xóa">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

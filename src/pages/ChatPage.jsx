import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/shared/contexts/ToastContext';
import { Send, User } from 'lucide-react';

const MOCK_CONVOS = [
  { id: 1, name: 'LogiFast', last: 'Chào bạn, chúng tôi đã xem hồ sơ...', time: '10:30', unread: 2 },
  { id: 2, name: 'Freshmart', last: 'Bạn có thể đến phỏng vấn vào thứ 6.', time: 'Hôm qua', unread: 0 },
];

const MOCK_MESSAGES = [
  { id: 1, from: 'them', text: 'Xin chào, tôi là HR bên LogiFast.', time: '10:28' },
  { id: 2, from: 'me', text: 'Dạ em chào anh/chị.', time: '10:29' },
  { id: 3, from: 'them', text: 'Chúng tôi đã xem hồ sơ của bạn. Bạn có thể đến phỏng vấn vào sáng thứ 6 không?', time: '10:30' },
  { id: 4, from: 'them', text: 'Đang soạn...', typing: true },
];

export const ChatPage = () => {
  const [selected, setSelected] = useState(MOCK_CONVOS[0]?.id);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const { toast } = useToast();

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev.filter((m) => !m.typing), { id: Date.now(), from: 'me', text: input.trim(), time: new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: 'them', text: 'Cảm ơn bạn. Chúng tôi sẽ liên hệ sớm.', time: new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1500);
  };

  return (
    <div className="bg-gray-50 min-h-full flex flex-col">
      <div className="container mx-auto flex-1 flex flex-col lg:flex-row max-w-6xl">
        <aside className="w-full lg:w-80 border-r bg-white shrink-0 flex flex-col max-h-[calc(100vh-8rem)]">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Tin nhắn</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {MOCK_CONVOS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 ${selected === c.id ? 'bg-primary/10' : ''}`}
              >
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{c.name}</span>
                    {c.unread > 0 && <span className="text-xs bg-primary text-primary-foreground rounded-full px-2">{c.unread}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{c.last}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>
        <main className="flex-1 flex flex-col bg-white min-h-[400px]">
          {selected && (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold">{MOCK_CONVOS.find((c) => c.id === selected)?.name}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${m.from === 'me' ? 'bg-primary text-primary-foreground' : 'bg-gray-100'}`}>
                      {m.typing ? <span className="italic text-muted-foreground">Đang soạn...</span> : <p className="text-sm">{m.text}</p>}
                      {!m.typing && <p className="text-xs opacity-80 mt-1">{m.time}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t flex gap-2">
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  className="rounded-xl flex-1"
                />
                <Button className="rounded-xl shrink-0" onClick={send}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import {
  useGetMessages,
  useGetUserConversations,
  useMarkAsRead,
  useSendMessage,
} from '../api/useChat';
import { AvatarImage } from '@/components/ui/avatar';
import { Avatar } from '@radix-ui/react-avatar';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useChatRealtime } from '../hooks/useChatRealtime';
import { formatMessageTime } from '@/shared/utils/dateUtils';

const ChatAvatar = ({ src, alt }) => (
  <Avatar className="h-full w-full rounded-full border-white shadow-md group-hover:opacity-90 transition-all duration-200">
    <AvatarImage
      src={src || 'https://github.com/shadcn.png'}
      alt={alt || ''}
      className="object-cover rounded-full"
    />
  </Avatar>
);

const ConverSationList = ({ items, selectedId, onSelect }) => (
  <aside className="w-full lg:w-80 border-r bg-white shrink-0 flex flex-col max-h-[calc(100vh-8rem)] rounded-l-xl">
    <div className="p-4 border-b">
      <h2 className="font-semibold">Tin nhắn</h2>
    </div>
    <div className="flex-1 overflow-y-auto">
      {items?.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c.id)}
          className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 ${selectedId === c.id ? 'bg-primary/10' : ''}`}
        >
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <ChatAvatar
              src={c.partner?.company?.logoUrl || c.partner?.avatar}
              alt={c.partner?.fullName || ''}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium truncate">
                {c.partner?.company?.name || c.partner.fullName}
              </span>
              {c.unreadCount > 0 && (
                <span className="text-xs bg-primary text-primary-foreground rounded-full px-2">
                  {c.unreadCount}
                </span>
              )}
            </div>
            <p
              className={`text-sm truncate ${c.unreadCount > 0 ? 'font-bold' : 'text-muted-foreground '}`}
            >
              {c?.lastMessage?.content}
            </p>
          </div>
        </button>
      ))}
    </div>
  </aside>
);

const MessageThread = ({ messages, isTyping, avatar }) => {
  const { user } = useAuth();
  const containerRef = useRef(null);

  const lastMsg = Array.isArray(messages) ? messages[0] : null;
  const isSeen =
    lastMsg && lastMsg.senderId === user.id && lastMsg.status === 'READ';

  useEffect(() => {
    if (containerRef.current) {
      const { scrollHeight, clientHeight } = containerRef.current;
      containerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages?.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Chưa có tin nhắn.
        </p>
      )}
      {messages
        ?.slice()
        .reverse()
        ?.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                m.senderId === user.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100'
              }`}
            >
              <p className="text-sm">{m?.content}</p>
              <p className="text-xs opacity-80 mt-1">
                {formatMessageTime(m?.createdAt)}
              </p>
            </div>
          </div>
        ))}
      {/* {isTyping && (
      <div className="flex justify-start">
        <div className="max-w-[60%] rounded-2xl px-4 py-2 bg-gray-100 text-sm text-muted-foreground italic">
          {companionName} đang soạn...
        </div>
      </div>
    )} */}
      {isSeen && (
        <div className="flex items-center gap-1 justify-end">
          <div className="h-3 w-3 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Avatar className="h-full w-full rounded-full border-white shadow-md group-hover:opacity-90 transition-all duration-200">
              <AvatarImage
                src={avatar}
                alt={avatar}
                className="object-cover rounded-full"
              />
            </Avatar>
          </div>
        </div>
      )}
    </div>
  );
};

const MessageInput = ({ value, onChange, onSend }) => (
  <div className="p-4 border-t flex gap-2">
    <Input
      placeholder="Nhập tin nhắn..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSend()}
      className="rounded-xl flex-1"
    />
    <Button className="rounded-xl shrink-0" onClick={onSend}>
      <Send className="h-4 w-4" />
    </Button>
  </div>
);

export const ChatPage = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [selected, setSelected] = useState(conversationId);
  const [input, setInput] = useState('');

  const { user } = useAuth();
  const { data: conversations, isLoading, error } = useGetUserConversations();
  const { data: messages } = useGetMessages(selected);
  const { mutate: sendMessage } = useSendMessage();
  const { mutate: markAsRead } = useMarkAsRead();

  useChatRealtime(conversationId, user.id);

  const send = () => {
    if (!input.trim()) return;
    sendMessage({ id: conversationId, content: input });
    setInput('');
  };

  useEffect(() => {
    if (!selected || !conversations) return;
    const current = conversations.find(
      (c) => String(c.id) === String(selected),
    );

    if (current && current.unreadCount > 0) {
      markAsRead({ id: selected });
    }
  }, [selected, conversations, markAsRead]);

  const handleSelect = (id) => {
    setSelected(id);
    navigate(`/chat/${id}`);
  };

  const currentChat = conversations?.find(
    (c) => String(c.id) === String(selected),
  );
  const chatPartner = currentChat?.partner;
  const avatar = chatPartner?.company?.logoUrl || chatPartner?.avatar;

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[600px] w-full bg-white rounded-xl shadow-sm border">
      <ConverSationList
        items={conversations}
        selectedId={selected}
        onSelect={handleSelect}
      />
      <main className="flex-1 flex flex-col bg-white min-h-[400px] rounded-r-xl max-h-[calc(100vh-8rem)]">
        {selected && (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <ChatAvatar src={avatar} alt={avatar || ''} />
              </div>
              <span className="font-semibold">
                {chatPartner?.company?.name || chatPartner?.fullName}
              </span>
            </div>
            <MessageThread messages={messages} avatar={avatar} />
            <MessageInput value={input} onChange={setInput} onSend={send} />
          </>
        )}
      </main>
    </div>
  );
};

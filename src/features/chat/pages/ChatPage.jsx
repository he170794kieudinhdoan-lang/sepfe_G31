import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessagesSquare, Search, Send, X } from 'lucide-react';
import {
  useGetMessages,
  useGetUserConversations,
  useMarkAsRead,
  useSendMessage,
} from '../api/useChat';
import { AvatarImage } from '@/components/ui/avatar';
import { Avatar } from '@radix-ui/react-avatar';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useChatRealtime } from '../hooks/useChatRealtime';
import { formatMessageTime } from '@/shared/utils/dateUtils';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** @param {string} text */
const highlightFragments = (text, rawQuery) => {
  const q = rawQuery?.trim();
  if (!q || !text) return text;
  try {
    const re = new RegExp(`(${escapeRegex(q)})`, 'gi');
    const nodes = [];
    let last = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) {
        nodes.push(text.slice(last, m.index));
      }
      nodes.push(
        <mark
          key={`h-${last}-${nodes.length}-${m.index}`}
          className="rounded px-0.5"
        >
          {m[0]}
        </mark>,
      );
      last = m.index + m[0].length;
    }
    if (last < text.length) nodes.push(text.slice(last));
    return nodes.length > 0 ? nodes : text;
  } catch {
    return text;
  }
};

/** Renders markdown links + optional search highlight inside non-link spans and link titles. */
const renderMessagePieces = (content, highlightQuery) => {
  const raw = content ?? '';
  return raw.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, index) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const labelHighlighted = highlightFragments(linkMatch[1], highlightQuery);
      const url = linkMatch[2];
      const isInternal = url.startsWith(window.location.origin);
      const path = isInternal ? url.replace(window.location.origin, '') : url;
      const commonProps = {
        className:
          'text-black font-bold font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity ',
      };

      if (isInternal) {
        return (
          <Link key={index} to={path} {...commonProps}>
            {labelHighlighted}
          </Link>
        );
      }

      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          {...commonProps}
        >
          {labelHighlighted}
        </a>
      );
    }
    return <span key={index}>{highlightFragments(part, highlightQuery)}</span>;
  });
};

export const ChatAvatar = ({ src, alt }) => (
  <Avatar className="h-full w-full rounded-full border-white shadow-md group-hover:opacity-90 transition-all duration-200">
    <AvatarImage
      src={
        src ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || 'User')}&background=e0e7ff&color=4338ca`
      }
      alt={alt || ''}
      className="object-cover rounded-full"
    />
  </Avatar>
);

export const ConversationList = ({
  items,
  selectedId,
  onSelect,
  listSearch,
  onListSearchChange,
}) => (
  <aside className="w-full lg:w-80 border-r bg-white shrink-0 flex flex-col max-h-[calc(100vh-8rem)] rounded-l-xl">
    <div className="p-4 border-b flex items-center gap-4">
      <h2 className="font-semibold m-0 whitespace-nowrap">Tin nhắn</h2>
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={listSearch}
          onChange={(e) => onListSearchChange(e.target.value)}
          placeholder="Tìm cuộc trò chuyện..."
          className="pl-9 pr-9 rounded-xl h-10"
          aria-label="Tìm cuộc trò chuyện"
        />
        {listSearch.trim() !== '' && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted text-muted-foreground"
            onClick={() => onListSearchChange('')}
            aria-label="Xóa tìm kiếm"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
    <div className="flex-1 overflow-y-auto">
      {items?.length === 0 && (
        <p className="text-sm text-muted-foreground text-center px-4 py-8">
          Không có cuộc trò chuyện nào khớp.
        </p>
      )}
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
            <div className="flex items-center justify-between gap-1">
              <span className="font-medium truncate">
                {c.partner?.company?.name || c.partner.fullName}
              </span>
              {c.unreadCount > 0 && (
                <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 shrink-0 leading-none">
                  {c.unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-1 mt-0.5">
              <p
                className={`text-sm truncate flex-1 ${c.unreadCount > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
              >
                {c?.lastMessage?.content}
              </p>
              {c.lastMessage?.createdAt && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatMessageTime(c.lastMessage.createdAt)}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  </aside>
);

export const MessageThread = ({
  messages,
  isTyping,
  avatar,
  highlightQuery,
}) => {
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
          {highlightQuery?.trim()
            ? 'Không có tin nhắn nào khớp từ khóa trong cuộc trò chuyện này.'
            : 'Chưa có tin nhắn.'}
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
              className={`max-w-[75%] rounded-2xl px-4 py-2 [&_mark]:rounded [&_mark]:px-0.5 ${
                m.senderId === user.id
                  ? 'bg-primary text-primary-foreground [&_mark]:bg-white/35 [&_mark]:text-white'
                  : 'bg-gray-100 [&_mark]:bg-amber-200/95 [&_mark]:text-slate-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap wrap-break-word">
                {renderMessagePieces(m?.content, highlightQuery)}
              </p>
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

export const MessageInput = ({ value, onChange, onSend }) => (
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
  const [listSearch, setListSearch] = useState('');
  const [threadSearchInput, setThreadSearchInput] = useState('');
  const [threadSearchDebounced, setThreadSearchDebounced] = useState('');

  const { user } = useAuth();
  const { data: conversations, isLoading, error } = useGetUserConversations();

  useEffect(() => {
    const t = setTimeout(() => {
      setThreadSearchDebounced(threadSearchInput.trim());
    }, 320);
    return () => clearTimeout(t);
  }, [threadSearchInput]);

  useEffect(() => {
    setSelected(conversationId);
  }, [conversationId]);

  useEffect(() => {
    setThreadSearchInput('');
    setThreadSearchDebounced('');
  }, [selected]);

  const activeThreadSearch =
    threadSearchDebounced.length > 0 ? threadSearchDebounced : '';

  const messageQueryParams =
    activeThreadSearch.length > 0
      ? { search: activeThreadSearch, limit: 120 }
      : { limit: 80 };

  const { data: messages } = useGetMessages(selected, messageQueryParams);
  const { mutate: sendMessage } = useSendMessage();
  const { mutate: markAsRead } = useMarkAsRead();

  useChatRealtime(conversationId, user.id);

  const listQuery = listSearch.trim().toLowerCase();
  const filteredConversations =
    !conversations || !listQuery
      ? conversations
      : conversations.filter((c) => {
          const title = (
            c.partner?.company?.name ||
            c.partner?.fullName ||
            ''
          ).toLowerCase();
          const last = (c?.lastMessage?.content || '').toLowerCase();
          return title.includes(listQuery) || last.includes(listQuery);
        });

  const send = () => {
    if (!input.trim() || !selected) return;
    sendMessage({ id: selected, content: input });
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
      <ConversationList
        items={filteredConversations}
        selectedId={selected}
        onSelect={handleSelect}
        listSearch={listSearch}
        onListSearchChange={setListSearch}
      />
      <main className="flex-1 flex flex-col bg-white min-h-[400px] rounded-r-xl max-h-[calc(100vh-8rem)] min-w-0">
        {selected ? (
          <>
            <div className="p-4 border-b space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <ChatAvatar src={avatar} alt={avatar || ''} />
                  </div>
                  <span className="font-semibold truncate min-w-0">
                    {chatPartner?.company?.name || chatPartner?.fullName}
                  </span>
                </div>
                <div className="relative w-72 shrink-0">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    value={threadSearchInput}
                    onChange={(e) => setThreadSearchInput(e.target.value)}
                    placeholder="Tìm trong cuộc trò chuyện..."
                    className="pl-9 pr-10 rounded-xl h-10 w-full"
                    aria-label="Tìm trong cuộc trò chuyện"
                  />
                  {threadSearchInput.trim() !== '' && (
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted text-muted-foreground"
                      onClick={() => setThreadSearchInput('')}
                      aria-label="Xóa tìm trong cuộc trò chuyện"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <MessageThread
              messages={messages}
              avatar={avatar}
              highlightQuery={activeThreadSearch}
            />
            <MessageInput value={input} onChange={setInput} onSend={send} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessagesSquare
                className="h-10 w-10"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Chọn cuộc hội thoại
            </h3>
          </div>
        )}
      </main>
    </div>
  );
};

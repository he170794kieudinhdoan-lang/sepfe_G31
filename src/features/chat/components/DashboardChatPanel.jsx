import { useEffect, useState } from 'react';
import { MessagesSquare } from 'lucide-react';
import { useAuth } from '@/shared/contexts/AuthContext';
import {
  useGetMessages,
  useGetUserConversations,
  useMarkAsRead,
  useSendMessage,
} from '@/features/chat/api/useChat';
import { useChatRealtime } from '@/features/chat/hooks/useChatRealtime';
import {
  ChatAvatar,
  ConversationList,
  MessageInput,
  MessageThread,
} from '@/features/chat/pages/ChatPage';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

export const DashboardChatPanel = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState('');
  const [listSearch, setListSearch] = useState('');
  const [threadSearchInput, setThreadSearchInput] = useState('');
  const [threadSearchDebounced, setThreadSearchDebounced] = useState('');

  const { data: conversations } = useGetUserConversations();

  useEffect(() => {
    const t = setTimeout(() => {
      setThreadSearchDebounced(threadSearchInput.trim());
    }, 320);
    return () => clearTimeout(t);
  }, [threadSearchInput]);

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

  useChatRealtime(selected, user?.id);

  // Mark as read when selecting a conversation
  useEffect(() => {
    if (!selected || !conversations) return;
    const current = conversations.find(
      (c) => String(c.id) === String(selected),
    );
    if (current && current.unreadCount > 0) {
      markAsRead({ id: selected });
    }
  }, [selected, conversations, markAsRead]);

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
        onSelect={setSelected}
        listSearch={listSearch}
        onListSearchChange={setListSearch}
      />

      <main className="flex-1 flex flex-col bg-white min-h-[400px] rounded-r-xl max-h-[calc(100vh-8rem)] min-w-0">
        {selected ? (
          <>
            {/* Chat Header + Thread Search */}
            <div className="p-4 border-b space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <ChatAvatar
                      src={avatar}
                      alt={chatPartner?.fullName || ''}
                    />
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

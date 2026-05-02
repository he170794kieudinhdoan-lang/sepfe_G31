import { useState, useEffect } from 'react';
import { useGetUserConversations, useGetMessages, useSendMessage, useMarkAsRead } from '@/features/chat/api/useChat';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useChatRealtime } from '@/features/chat/hooks/useChatRealtime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Search,
  Send,
  X,
  MessageCircle,
  Clock,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export const DashboardChatPanel = () => {
  const { user } = useAuth();
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [input, setInput] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);

  const { data: conversations, isLoading } = useGetUserConversations();
  const { data: messages } = useGetMessages(selectedConvId, { limit: 100 });
  const { mutate: sendMessage } = useSendMessage();
  const { mutate: markAsRead } = useMarkAsRead();

  useChatRealtime(selectedConvId, user?.userId || user?.id);

  // Mark as read
  useEffect(() => {
    if (!selectedConvId || !conversations) return;
    const current = conversations.find(
      (c) => String(c.id) === String(selectedConvId),
    );
    if (current && current.unreadCount > 0) {
      markAsRead({ id: selectedConvId });
    }
  }, [selectedConvId, conversations, markAsRead]);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredConversations = !conversations
    ? []
    : conversations.filter((c) => {
        const query = searchText.toLowerCase();
        const title = (c.partner?.company?.name || c.partner?.fullName || '').toLowerCase();
        const lastMsg = (c.lastMessage?.content || '').toLowerCase();
        return title.includes(query) || lastMsg.includes(query);
      });

  const selectedConversation = conversations?.find(
    (c) => String(c.id) === String(selectedConvId),
  );

  const handleSend = () => {
    if (!input.trim() || !selectedConvId) return;
    sendMessage({ id: selectedConvId, content: input });
    setInput('');
  };

  const totalUnread = conversations?.reduce((acc, c) => acc + (c.unreadCount || 0), 0) || 0;

  // Mobile: show list OR chat
  if (isMobileView && selectedConvId) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-slate-200">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <button
            onClick={() => setSelectedConvId(null)}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {selectedConversation?.partner?.company?.name ||
                selectedConversation?.partner?.fullName}
            </h3>
            <p className="text-xs text-slate-500">
              {selectedConversation?.lastMessage?.createdAt
                ? formatDistanceToNow(new Date(selectedConversation.lastMessage.createdAt), {
                    locale: vi,
                    addSuffix: true,
                  })
                : 'Chưa có tin nhắn'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages?.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="h-12 w-12 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">Chưa có tin nhắn</p>
            </div>
          )}
          {messages?.slice().reverse().map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  msg.senderId === user.id
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-slate-200 text-slate-900 rounded-bl-none'
                }`}
              >
                <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập tin nhắn..."
              className="rounded-full"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              size="icon"
              className="rounded-full shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop or list view
  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Conversations List */}
      <div className={`flex flex-col border-r border-slate-200 bg-gradient-to-b from-slate-50 to-white ${
        isMobileView ? 'w-full' : 'w-80'
      }`}>
        {/* Search */}
        <div className="p-4 space-y-3 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900">Tin nhắn</h2>
            {totalUnread > 0 && (
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white text-xs font-bold">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm kiếm..."
              className="pl-9 rounded-lg h-9 text-sm"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded transition"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center text-sm text-slate-500">Đang tải...</div>
          )}
          {!isLoading && filteredConversations.length === 0 && (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                {searchText ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}
              </p>
            </div>
          )}
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConvId(conv.id)}
              className={`w-full p-4 text-left border-b border-slate-100 hover:bg-slate-100/50 transition ${
                String(selectedConvId) === String(conv.id) ? 'bg-primary/5 border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <img
                    src={conv.partner?.company?.logoUrl || conv.partner?.avatar}
                    alt="avatar"
                    className="h-10 w-10 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-sm truncate">
                      {conv.partner?.company?.name || conv.partner?.fullName}
                    </h4>
                    {conv.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold shrink-0">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-1">
                    {conv.lastMessage?.content || 'Không có tin nhắn'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {conv.lastMessage?.createdAt
                      ? formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                          locale: vi,
                        })
                      : ''}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {!isMobileView && (
        <div className="flex-1 flex flex-col bg-white min-w-0">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <img
                      src={selectedConversation.partner?.company?.logoUrl || selectedConversation.partner?.avatar}
                      alt="avatar"
                      className="h-12 w-12 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base">
                      {selectedConversation.partner?.company?.name ||
                        selectedConversation.partner?.fullName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedConversation.lastMessage?.createdAt
                        ? formatDistanceToNow(new Date(selectedConversation.lastMessage.createdAt), {
                            locale: vi,
                            addSuffix: true,
                          })
                        : 'Chưa có tin nhắn'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/30 to-slate-50/10">
                {messages?.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="h-16 w-16 text-slate-200 mb-3" />
                    <p className="text-sm text-slate-500 font-medium">Bắt đầu cuộc trò chuyện</p>
                    <p className="text-xs text-slate-400 mt-1">Gửi tin nhắn đầu tiên của bạn</p>
                  </div>
                )}
                {messages?.slice().reverse().map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 items-end ${
                      msg.senderId === user.id ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`flex-1 max-w-md px-4 py-2 rounded-2xl ${
                        msg.senderId === user.id
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                      <p className={`text-xs mt-1 flex items-center gap-1 ${
                        msg.senderId === user.id ? 'text-white/70' : 'text-slate-400'
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {msg.senderId === user.id && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <div className="flex gap-2 items-end">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Gõ tin nhắn..."
                    className="rounded-full h-10"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    size="icon"
                    className="rounded-full h-10 w-10 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Chọn cuộc trò chuyện</h3>
              <p className="text-sm text-slate-500">
                Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import { useEffect, useRef, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import api from '../../utils/api.js';

const roleBadgeClasses = {
  admin: 'border-rose-200 bg-rose-50 text-rose-700',
  trainer: 'border-blue-200 bg-blue-50 text-blue-700',
  member: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

const avatarClasses = {
  admin: 'bg-rose-600',
  trainer: 'bg-blue-600',
  member: 'bg-emerald-600',
};

const getId = (value) => (value?._id || value)?.toString();

const getDisplayName = (person) => (
  person?.displayName || person?.fullName || person?.username || 'Unknown user'
);

const getOtherParticipant = (chat, currentUserId) => (
  chat?.participants?.find((participant) => getId(participant) !== currentUserId)
);

const formatMessageTime = (dateValue) => {
  if (!dateValue) {
    return '';
  }

  return new Date(dateValue).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Avatar = ({ person }) => (
  <div
    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${avatarClasses[person?.role] || 'bg-slate-700'} font-semibold text-white`}
  >
    {getDisplayName(person).charAt(0).toUpperCase()}
  </div>
);

const ChatWindow = ({
  chat,
  currentUser,
  onChatRead,
  socket,
  socketConnected,
}) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const chatId = chat?._id;
  const currentUserId = currentUser?._id;
  const recipient = getOtherParticipant(chat, currentUserId);

  useEffect(() => {
    let cancelled = false;

    const loadMessages = async () => {
      if (!chatId) {
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/chats/${chatId}/messages`);

        if (!cancelled) {
          setMessages(response.data || []);
          setError('');
          onChatRead?.(chatId);
          socket?.emit('markAsRead', { chatId });
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
        if (!cancelled) {
          setError(err.response?.data?.message || 'Unable to load messages');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [chatId, onChatRead, socket]);

  useEffect(() => {
    if (!socket || !chatId) {
      return undefined;
    }

    const handleReceiveMessage = (message) => {
      if (getId(message.chat) !== chatId) {
        return;
      }

      setMessages((previous) => {
        if (previous.some((item) => item._id === message._id)) {
          return previous;
        }

        return [...previous, message];
      });

      if (getId(message.sender) !== currentUserId) {
        socket.emit('markAsRead', { chatId });
        onChatRead?.(chatId);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [chatId, currentUserId, onChatRead, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (event) => {
    event?.preventDefault();
    const content = messageText.trim();

    if (!content || !chatId || sending) {
      return;
    }

    if (!socket || !socketConnected) {
      setError('Connection is not ready yet');
      return;
    }

    setSending(true);
    setError('');
    setMessageText('');

    socket.timeout(7000).emit('sendMessage', { chatId, content }, (timeoutError, response) => {
      setSending(false);

      if (timeoutError || !response?.ok) {
        setMessageText((current) => current || content);
        setError(response?.message || 'Message could not be sent');
      }
    });
  };

  const handleMessageKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessage(event);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar person={recipient} />
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-950">
              {getDisplayName(recipient)}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${roleBadgeClasses[recipient?.role] || 'border-slate-200 bg-slate-50 text-slate-600'}`}
              >
                {recipient?.role || 'user'}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                <span className={`h-1.5 w-1.5 rounded-full ${socketConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                {socketConnected ? 'Live' : 'Connecting'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
            No messages yet
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isMine = getId(message.sender) === currentUserId;

              return (
                <div
                  key={message._id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[78%] rounded-lg px-4 py-2 shadow-sm ${
                      isMine
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {message.content}
                    </p>
                    <p className={`mt-1 text-right text-[11px] ${isMine ? 'text-emerald-50/80' : 'text-slate-400'}`}>
                      {formatMessageTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {error && (
        <div className="border-t border-red-100 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 sm:px-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            onKeyDown={handleMessageKeyDown}
            rows={1}
            placeholder="Message"
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
          <button
            type="submit"
            aria-label="Send message"
            title="Send message"
            disabled={!messageText.trim() || sending || !socketConnected}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;

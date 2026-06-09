import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import {
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import api from '../../utils/api';
import ChatWindow from '../../components/shared/ChatWindow';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || import.meta.env.VITE_API_BASE?.replace(/\/api\/?$/, '')
  || 'http://localhost:5000';

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

const formatTime = (dateValue) => {
  if (!dateValue) {
    return '';
  }

  return new Date(dateValue).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const sortConversations = (items) => [...items].sort((a, b) => {
  const aTime = new Date(a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
  const bTime = new Date(b.lastMessage?.createdAt || b.updatedAt || 0).getTime();
  return bTime - aTime;
});

const mergeChat = (current, incoming) => {
  if (!current) {
    return incoming;
  }

  const currentParticipants = new Map(
    (current.participants || []).map((participant) => [getId(participant), participant])
  );
  const incomingParticipants = incoming.participants?.length
    ? incoming.participants
    : current.participants || [];

  return {
    ...current,
    ...incoming,
    participants: incomingParticipants.filter(Boolean).map((participant) => {
      const oldParticipant = currentParticipants.get(getId(participant));

      return {
        ...oldParticipant,
        ...participant,
        displayName: participant.displayName || oldParticipant?.displayName || participant.username,
      };
    }),
    unreadCount: incoming.unreadCount ?? current.unreadCount ?? 0,
  };
};

const upsertConversation = (items, incoming) => {
  const existing = items.find((item) => item._id === incoming._id);
  const nextItems = existing
    ? items.map((item) => (item._id === incoming._id ? mergeChat(item, incoming) : item))
    : [incoming, ...items];

  return sortConversations(nextItems);
};

const Avatar = ({ person, size = 'md' }) => {
  const role = person?.role || 'member';
  const sizeClass = size === 'sm' ? 'h-9 w-9 text-sm' : 'h-11 w-11 text-base';

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full ${avatarClasses[role] || 'bg-slate-700'} font-semibold text-white`}
    >
      {getDisplayName(person).charAt(0).toUpperCase()}
    </div>
  );
};

const RoleBadge = ({ role }) => (
  <span
    className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${roleBadgeClasses[role] || 'border-slate-200 bg-slate-50 text-slate-600'}`}
  >
    {role || 'user'}
  </span>
);

const Chat = () => {
  const { user } = useSelector((state) => state.auth);
  const currentUserId = user?._id;
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [openingContactId, setOpeningContactId] = useState(null);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const selectedChatIdRef = useRef(null);

  useEffect(() => {
    selectedChatIdRef.current = selectedChat?._id || null;
  }, [selectedChat]);

  const fetchChatData = useCallback(async () => {
    try {
      setLoading(true);
      const [chatsResponse, usersResponse] = await Promise.all([
        api.get('/chats'),
        api.get('/chats/users'),
      ]);

      setConversations(sortConversations(chatsResponse.data || []));
      setContacts(usersResponse.data || []);
      setError('');
    } catch (err) {
      console.error('Failed to load chats:', err);
      setError(err.response?.data?.message || 'Unable to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token || !currentUserId) {
      return undefined;
    }

    const nextSocket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
    });

    const handleConnect = () => {
      setSocketConnected(true);
      setError('');
    };
    const handleDisconnect = () => setSocketConnected(false);
    const handleConnectError = (err) => {
      console.error('Chat socket error:', err.message);
      setSocketConnected(false);
    };
    const handleChatUpdated = (chat) => {
      setConversations((previous) => {
        const existing = previous.find((item) => item._id === chat._id);
        const unreadCount = selectedChatIdRef.current === chat._id
          ? 0
          : existing?.unreadCount || 0;

        return upsertConversation(previous, { ...chat, unreadCount });
      });

      setSelectedChat((previous) => {
        if (!previous || previous._id !== chat._id) {
          return previous;
        }

        return mergeChat(previous, { ...chat, unreadCount: 0 });
      });
    };
    const handleReceiveMessage = (message) => {
      const chatId = getId(message.chat);
      const sentByMe = getId(message.sender) === currentUserId;

      setConversations((previous) => sortConversations(previous.map((chat) => {
        if (chat._id !== chatId) {
          return chat;
        }

        const isOpen = selectedChatIdRef.current === chatId;

        return {
          ...chat,
          lastMessage: message,
          updatedAt: message.createdAt,
          unreadCount: sentByMe || isOpen ? 0 : (chat.unreadCount || 0) + 1,
        };
      })));
    };

    nextSocket.on('connect', handleConnect);
    nextSocket.on('disconnect', handleDisconnect);
    nextSocket.on('connect_error', handleConnectError);
    nextSocket.on('chatUpdated', handleChatUpdated);
    nextSocket.on('receiveMessage', handleReceiveMessage);
    setSocket(nextSocket);

    return () => {
      nextSocket.off('connect', handleConnect);
      nextSocket.off('disconnect', handleDisconnect);
      nextSocket.off('connect_error', handleConnectError);
      nextSocket.off('chatUpdated', handleChatUpdated);
      nextSocket.off('receiveMessage', handleReceiveMessage);
      nextSocket.disconnect();
      setSocket(null);
      setSocketConnected(false);
    };
  }, [currentUserId]);

  const handleChatRead = useCallback((chatId) => {
    setConversations((previous) => previous.map((chat) => (
      chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
    )));
  }, []);

  const openConversation = useCallback((chat) => {
    setSelectedChat(chat);
    handleChatRead(chat._id);
    api.patch(`/chats/${chat._id}/read`).catch((err) => {
      console.error('Failed to mark chat read:', err);
    });
    socket?.emit('markAsRead', { chatId: chat._id });
  }, [handleChatRead, socket]);

  const openContactChat = async (contact) => {
    try {
      setOpeningContactId(contact._id);
      const response = await api.post('/chats', { participantId: contact._id });
      const chat = response.data;

      setConversations((previous) => upsertConversation(previous, chat));
      setSelectedChat(chat);
      setError('');
    } catch (err) {
      console.error('Failed to open chat:', err);
      setError(err.response?.data?.message || 'Unable to open chat');
    } finally {
      setOpeningContactId(null);
    }
  };

  const activeChat = selectedChat
    ? conversations.find((chat) => chat._id === selectedChat._id) || selectedChat
    : null;

  const normalizedSearch = search.trim().toLowerCase();

  const visibleConversations = useMemo(() => conversations.filter((chat) => {
    const participant = getOtherParticipant(chat, currentUserId);
    const label = `${getDisplayName(participant)} ${participant?.username || ''} ${participant?.role || ''} ${chat.lastMessage?.content || ''}`;

    return label.toLowerCase().includes(normalizedSearch);
  }), [conversations, currentUserId, normalizedSearch]);

  const visibleContacts = useMemo(() => contacts.filter((contact) => {
    const label = `${getDisplayName(contact)} ${contact.username || ''} ${contact.role || ''}`;

    return label.toLowerCase().includes(normalizedSearch);
  }), [contacts, normalizedSearch]);

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[640px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex h-full flex-col lg:flex-row">
        <aside className="flex min-h-0 w-full flex-col border-b border-slate-200 bg-white lg:w-[380px] lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-950">Messages</h1>
                <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className={`h-2 w-2 rounded-full ${socketConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                  {socketConnected ? 'Live' : 'Connecting'}
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                <MessageCircle className="h-5 w-5" />
              </div>
            </div>

            <label className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 focus-within:border-slate-400 focus-within:bg-white">
              <Search className="h-4 w-4" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Search"
              />
            </label>
          </div>

          {error && (
            <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </div>
            ) : (
              <>
                <section>
                  <div className="mb-2 flex items-center justify-between px-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Chats</h2>
                    <span className="text-xs font-semibold text-slate-400">{visibleConversations.length}</span>
                  </div>

                  <div className="space-y-1">
                    {visibleConversations.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500">
                        No conversations
                      </div>
                    ) : (
                      visibleConversations.map((chat) => {
                        const participant = getOtherParticipant(chat, currentUserId);
                        const isActive = activeChat?._id === chat._id;

                        return (
                          <button
                            key={chat._id}
                            type="button"
                            onClick={() => openConversation(chat)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition ${
                              isActive ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'
                            }`}
                          >
                            <Avatar person={participant} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className={`truncate text-sm font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>
                                  {getDisplayName(participant)}
                                </p>
                                <span className={`shrink-0 text-[11px] ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                                  {formatTime(chat.lastMessage?.createdAt || chat.updatedAt)}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-2">
                                <p className={`min-w-0 flex-1 truncate text-xs ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                                  {chat.lastMessage?.content || 'No messages yet'}
                                </p>
                                {chat.unreadCount > 0 && (
                                  <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-bold text-white">
                                    {chat.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </section>

                <section className="mt-6">
                  <div className="mb-2 flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">People</h2>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{visibleContacts.length}</span>
                  </div>

                  <div className="space-y-1">
                    {visibleContacts.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500">
                        No users found
                      </div>
                    ) : (
                      visibleContacts.map((contact) => (
                        <button
                          key={contact._id}
                          type="button"
                          onClick={() => openContactChat(contact)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-slate-50"
                        >
                          <Avatar person={contact} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {getDisplayName(contact)}
                              </p>
                              <RoleBadge role={contact.role} />
                            </div>
                            <p className="mt-0.5 truncate text-xs text-slate-500">@{contact.username}</p>
                          </div>
                          {openingContactId === contact._id ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" />
                          ) : (
                            <Plus className="h-4 w-4 shrink-0 text-slate-400" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </section>
              </>
            )}
          </div>
        </aside>

        <main className="min-h-0 flex-1 bg-slate-50">
          {activeChat ? (
            <ChatWindow
              chat={activeChat}
              currentUser={user}
              onChatRead={handleChatRead}
              socket={socket}
              socketConnected={socketConnected}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">Select a chat</h2>
                <p className="mt-1 text-sm text-slate-500">Choose a conversation or start one from People.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Chat;

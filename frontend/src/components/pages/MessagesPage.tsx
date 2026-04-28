import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import type { UserData, Conversation, MessageData } from '../shared/types';
import { useSocket } from '../shared/SocketContext';

interface MessagesPageProps {
  userData: UserData;
  onViewProfile: (username: string) => void;
  initialChatUser?: string | null;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ userData, onViewProfile, initialChatUser }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChatUser, setActiveChatUser] = useState<string | null>(initialChatUser || null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatOtherUser, setChatOtherUser] = useState<{ id: number; username: string; about?: string | null } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New chat state
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatUsername, setNewChatUsername] = useState('');
  const [newChatError, setNewChatError] = useState('');

  const { socket } = useSocket();

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Conversation[]>('http://localhost:5000/api/messages/conversations', {
        params: { username: userData.username },
      });
      setConversations(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [userData.username]);

  useEffect(() => {
    if (initialChatUser) {
      setActiveChatUser(initialChatUser);
    }
  }, [initialChatUser]);

  const fetchMessages = async (otherUsername: string) => {
    setChatLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/messages/${encodeURIComponent(otherUsername)}`, {
        params: { username: userData.username },
      });
      setMessages(res.data.messages);
      setChatOtherUser(res.data.otherUser);
    } catch {
      setMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (activeChatUser) {
      fetchMessages(activeChatUser);
      // Mark as read
      axios.put(`http://localhost:5000/api/messages/${encodeURIComponent(activeChatUser)}/read`, { username: userData.username }).catch(() => {});
    }
  }, [activeChatUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (msg: MessageData) => {
      fetchConversations();
      if (activeChatUser && (msg.sender.username === activeChatUser || msg.receiver.username === activeChatUser)) {
        fetchMessages(activeChatUser);
        // If it's open right now, mark it read immediately
        if (msg.receiver.username === userData.username) {
           axios.put(`http://localhost:5000/api/messages/${encodeURIComponent(activeChatUser)}/read`, { username: userData.username }).catch(() => {});
        }
      }
    };

    const handleMessagesRead = () => {
      fetchConversations();
    };

    socket.on('new_message', handleNewMessage);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, activeChatUser]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatUser) return;

    setSending(true);
    try {
      const res = await axios.post<MessageData>('http://localhost:5000/api/messages', {
        senderUsername: userData.username,
        receiverUsername: activeChatUser,
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  const handleStartNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewChatError('');
    const target = newChatUsername.trim();
    if (!target) return;
    if (target === userData.username) {
      setNewChatError("You can't message yourself");
      return;
    }

    try {
      // Check if user exists
      await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(target)}`);
      setActiveChatUser(target);
      setShowNewChat(false);
      setNewChatUsername('');
    } catch {
      setNewChatError('User not found');
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #e7e5e4',
    overflow: 'hidden',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: '12px',
    border: '1.5px solid #e7e5e4',
    background: '#fafaf9',
    padding: '12px 16px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#1c1917',
    transition: 'border-color 0.2s ease',
  };

  const btnPrimary: React.CSSProperties = {
    background: '#1c1917',
    color: '#fff',
    fontWeight: 600,
    fontSize: '13px',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
    transition: 'background 0.2s ease',
  };

  const btnOutline: React.CSSProperties = {
    background: 'transparent',
    color: '#44403c',
    fontWeight: 500,
    fontSize: '13px',
    padding: '10px 20px',
    border: '1.5px solid #e7e5e4',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
    transition: 'border-color 0.2s ease',
  };

  // ── Chat View ──
  if (activeChatUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '100px' }}>
        {/* Chat header */}
        <div style={{ ...cardStyle, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => { setActiveChatUser(null); fetchConversations(); }}
              style={{ ...btnOutline, padding: '6px 14px', fontSize: '12px' }}
            >
              ← Back
            </button>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#1c1917',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              onClick={() => onViewProfile(activeChatUser)}
            >
              {activeChatUser.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{ fontSize: '15px', fontWeight: 600, color: '#1c1917', cursor: 'pointer' }}
                onClick={() => onViewProfile(activeChatUser)}
              >
                {activeChatUser}
              </p>
              {chatOtherUser?.about && (
                <p style={{ fontSize: '11px', color: '#a8a29e' }}>{chatOtherUser.about}</p>
              )}
            </div>
            <button
              onClick={() => fetchMessages(activeChatUser)}
              style={{ ...btnOutline, padding: '6px 14px', fontSize: '12px' }}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ ...cardStyle, padding: '20px', minHeight: '300px', maxHeight: '55vh', overflowY: 'auto' }}>
          {chatLoading ? (
            <div style={{ textAlign: 'center', color: '#78716c', fontSize: '14px', padding: '40px 0' }}>Loading messages...</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#1c1917' }}>No messages yet</p>
              <p style={{ fontSize: '13px', color: '#78716c', marginTop: '4px' }}>Say hello to start the conversation!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {messages.map((msg) => {
                const isMine = msg.sender.username === userData.username;
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isMine ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '10px 16px',
                        borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMine ? '#1c1917' : '#f5f5f4',
                        color: isMine ? '#fff' : '#1c1917',
                        fontSize: '14px',
                        lineHeight: 1.5,
                      }}
                    >
                      <p style={{ wordBreak: 'break-word' }}>{msg.content}</p>
                      <p style={{
                        fontSize: '10px',
                        color: isMine ? 'rgba(255,255,255,0.5)' : '#a8a29e',
                        marginTop: '4px',
                        textAlign: 'right',
                      }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message input */}
        <form onSubmit={handleSend} style={{ ...cardStyle, padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            style={{ ...btnPrimary, opacity: sending || !newMessage.trim() ? 0.5 : 1, whiteSpace: 'nowrap' }}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    );
  }

  // ── Conversation List ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>

      {/* Header */}
      <div style={{ ...cardStyle, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#a8a29e', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Chat</p>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1c1917', letterSpacing: '-0.02em', marginTop: '2px' }}>Messages</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowNewChat(true)} style={btnPrimary}>New chat</button>
            <button onClick={fetchConversations} style={btnOutline}>Refresh</button>
          </div>
        </div>
      </div>

      {/* New chat modal */}
      {showNewChat && (
        <div style={{ ...cardStyle, padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1c1917', marginBottom: '12px' }}>Start a new conversation</h3>
          <form onSubmit={handleStartNewChat} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={newChatUsername}
                onChange={(e) => { setNewChatUsername(e.target.value); setNewChatError(''); }}
                placeholder="Enter username..."
                style={inputStyle}
              />
              {newChatError && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{newChatError}</p>}
            </div>
            <button type="submit" style={btnPrimary}>Start</button>
            <button type="button" onClick={() => { setShowNewChat(false); setNewChatError(''); }} style={btnOutline}>Cancel</button>
          </form>
        </div>
      )}

      {/* Conversations */}
      {loading ? (
        <div style={{ ...cardStyle, padding: '40px', textAlign: 'center', color: '#78716c', fontSize: '14px' }}>Loading conversations...</div>
      ) : conversations.length === 0 ? (
        <div style={{ ...cardStyle, padding: '48px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917' }}>No conversations yet</p>
          <p style={{ fontSize: '13px', color: '#78716c', marginTop: '6px' }}>Start a chat to connect with your circle!</p>
        </div>
      ) : (
        <div style={{ ...cardStyle }}>
          {conversations.map((conv, idx) => {
            const isUnread = conv.lastMessage.sender.username !== userData.username && !conv.lastMessage.read;
            
            return (
              <div
                key={conv.otherUser.id}
                onClick={() => setActiveChatUser(conv.otherUser.username)}
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  borderBottom: idx < conversations.length - 1 ? '1px solid #f5f5f4' : 'none',
                  background: isUnread ? '#fff5f0' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
              {/* Avatar */}
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#1c1917',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {conv.otherUser.username.charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1c1917' }}>{conv.otherUser.username}</p>
                  <span style={{ fontSize: '11px', color: '#a8a29e', flexShrink: 0 }}>
                    {timeAgo(conv.lastMessage.createdAt)}
                  </span>
                </div>
                <p style={{
                  fontSize: '13px',
                  color: '#78716c',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {conv.lastMessage.sender.username === userData.username ? 'You: ' : ''}
                  {conv.lastMessage.content}
                </p>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { UserData, NotificationData } from '../shared/types';
import { useSocket } from '../shared/SocketContext';

interface NotificationsPageProps {
  userData: UserData;
  onViewProfile: (username: string) => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ userData, onViewProfile }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get<NotificationData[]>('http://localhost:5000/api/notifications', {
        params: { username: userData.username },
      });
      setNotifications(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userData.username]);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchNotifications();
    };

    socket.on('new_notification', handleUpdate);
    socket.on('notifications_read', handleUpdate);

    return () => {
      socket.off('new_notification', handleUpdate);
      socket.off('notifications_read', handleUpdate);
    };
  }, [socket]);

  const handleMarkRead = async (id: number) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // silently fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read-all', { username: userData.username });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silently fail
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="#e85d04" style={{ width: '18px', height: '18px' }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'message':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" style={{ width: '18px', height: '18px' }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="#a8a29e" style={{ width: '18px', height: '18px' }}>
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #e7e5e4',
    overflow: 'hidden',
  };

  const btnOutline: React.CSSProperties = {
    background: 'transparent',
    color: '#44403c',
    fontWeight: 500,
    fontSize: '12px',
    padding: '8px 16px',
    border: '1.5px solid #e7e5e4',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
    transition: 'border-color 0.2s ease',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>

      {/* Header */}
      <div style={{ ...cardStyle, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#a8a29e', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Alerts</p>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1c1917', letterSpacing: '-0.02em', marginTop: '2px' }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '20px',
                  height: '20px',
                  borderRadius: '10px',
                  background: '#e85d04',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  marginLeft: '8px',
                  padding: '0 6px',
                  verticalAlign: 'middle',
                }}>
                  {unreadCount}
                </span>
              )}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} style={btnOutline}>Mark all read</button>
            )}
            <button onClick={fetchNotifications} style={btnOutline}>Refresh</button>
          </div>
        </div>
      </div>

      {/* Notifications list */}
      {loading ? (
        <div style={{ ...cardStyle, padding: '40px', textAlign: 'center', color: '#78716c', fontSize: '14px' }}>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div style={{ ...cardStyle, padding: '48px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917' }}>All caught up!</p>
          <p style={{ fontSize: '13px', color: '#78716c', marginTop: '6px' }}>No notifications yet. They'll appear when people interact with you.</p>
        </div>
      ) : (
        <div style={{ ...cardStyle }}>
          {notifications.map((notif, idx) => (
            <div
              key={notif.id}
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                borderBottom: idx < notifications.length - 1 ? '1px solid #f5f5f4' : 'none',
                background: notif.read ? 'transparent' : '#fffbf7',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onClick={() => {
                if (!notif.read) handleMarkRead(notif.id);
                onViewProfile(notif.actor.username);
              }}
            >
              {/* Icon */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: notif.type === 'follow' ? '#fef0e6' : notif.type === 'message' ? '#eff6ff' : '#f5f5f4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {getNotificationIcon(notif.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', color: '#1c1917', lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 600 }}>{notif.actor.username}</span>{' '}
                  {notif.type === 'follow' ? 'started following you' : notif.type === 'message' ? 'sent you a message' : notif.content}
                </p>
                <p style={{ fontSize: '11px', color: '#a8a29e', marginTop: '2px' }}>{timeAgo(notif.createdAt)}</p>
              </div>

              {/* Unread indicator */}
              {!notif.read && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#e85d04',
                  flexShrink: 0,
                }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

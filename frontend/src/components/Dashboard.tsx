import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './navigation/BottomNavigation';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';
import MessagesPage from './pages/MessagesPage';
import UserProfileView from './pages/UserProfileView';
import type { TabType, UserData } from './shared/types';

import { SocketProvider, useSocket } from './shared/SocketContext';

const DashboardInner: React.FC<{ userData: UserData; onLogout: () => void; handleProfileUpdated: (user: UserData) => void }> = ({ userData, onLogout, handleProfileUpdated }) => {
  const [activeTab, setActiveTab] = React.useState<TabType>('home');

  // State for viewing another user's profile
  const [viewingUsername, setViewingUsername] = React.useState<string | null>(null);
  const [previousTab, setPreviousTab] = React.useState<TabType | null>(null);

  // State for opening a chat with a specific user
  const [chatTargetUser, setChatTargetUser] = React.useState<string | null>(null);

  // State for create post overlay
  const [showCreatePost, setShowCreatePost] = React.useState(false);

  // Badge counts for bottom nav
  const [unreadNotifications, setUnreadNotifications] = React.useState(0);
  const [unreadMessages, setUnreadMessages] = React.useState(0);

  const { socket } = useSocket();

  // Poll for unread counts
  React.useEffect(() => {
    if (!userData) return;

    const fetchBadges = async () => {
      try {
        const [notifRes, convRes] = await Promise.all([
          axios.get<{ count: number }>('http://localhost:5000/api/notifications/unread-count', {
            params: { username: userData.username },
          }),
          axios.get<{ otherUser: any; lastMessage: any }[]>('http://localhost:5000/api/messages/conversations', {
            params: { username: userData.username },
          }),
        ]);

        setUnreadNotifications(notifRes.data.count);

        // Count conversations with messages from others that are unread
        const unreadConvs = convRes.data.filter(
          (c) => c.lastMessage && c.lastMessage.sender && c.lastMessage.sender.username !== userData.username && !c.lastMessage.read
        ).length;
        setUnreadMessages(unreadConvs);
      } catch {
        // silently fail
      }
    };

    fetchBadges();

    if (!socket) return;

    const handleNewNotification = () => setUnreadNotifications((prev) => prev + 1);
    const handleNotificationsRead = () => setUnreadNotifications(0);
    const handleChatUpdate = () => fetchBadges();

    socket.on('new_notification', handleNewNotification);
    socket.on('notifications_read', handleNotificationsRead);
    socket.on('new_message', handleChatUpdate);
    socket.on('messages_read', handleChatUpdate);

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('notifications_read', handleNotificationsRead);
      socket.off('new_message', handleChatUpdate);
      socket.off('messages_read', handleChatUpdate);
    };
  }, [userData, socket]);



  const handleViewProfile = (username: string) => {
    if (userData && username === userData.username) {
      // Viewing own profile → switch to profile tab
      setViewingUsername(null);
      setActiveTab('profile');
      return;
    }
    setPreviousTab(activeTab);
    setViewingUsername(username);
  };

  const handleBackFromProfile = () => {
    setViewingUsername(null);
    if (previousTab) {
      setActiveTab(previousTab);
      setPreviousTab(null);
    }
  };

  const handleSendMessage = (username: string) => {
    setViewingUsername(null);
    setChatTargetUser(username);
    setActiveTab('messages');
  };



  const handleTabChange = (tab: TabType) => {
    setViewingUsername(null);
    setPreviousTab(null);
    if (tab !== 'messages') {
      setChatTargetUser(null);
    }
    setActiveTab(tab);
    setShowCreatePost(false);
  };

  const renderContent = () => {
    // If viewing another user's profile
    if (viewingUsername) {
      return (
        <UserProfileView
          userData={userData}
          viewUsername={viewingUsername}
          onBack={handleBackFromProfile}
          onSendMessage={handleSendMessage}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return <HomePage userData={userData} showCreatePost={showCreatePost} onCloseCreatePost={() => setShowCreatePost(false)} />;
      case 'profile':
        return (
          <ProfilePage
            userData={userData}
            onLogout={onLogout}
            onProfileUpdated={handleProfileUpdated}
            onViewProfile={handleViewProfile}
          />
        );
      case 'notifications':
        return <NotificationsPage userData={userData} onViewProfile={handleViewProfile} />;
      case 'messages':
        return (
          <MessagesPage
            userData={userData}
            onViewProfile={handleViewProfile}
            initialChatUser={chatTargetUser}
          />
        );
      case 'search':
        return <SearchPage userData={userData} onViewProfile={handleViewProfile} />;
      default:
        return <HomePage userData={userData} showCreatePost={showCreatePost} onCloseCreatePost={() => setShowCreatePost(false)} />;
    }
  };

  const displayTab = viewingUsername ? 'profile' : activeTab;

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf9' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px 120px' }}>
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0',
          borderBottom: '1px solid #e7e5e4',
          marginBottom: '24px',
        }}>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#1c1917', letterSpacing: '-0.04em' }}>Circle</span>
          {activeTab === 'home' && !viewingUsername ? (
            <button
              onClick={() => setShowCreatePost((prev) => !prev)}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#fff',
                background: '#1c1917',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 18px',
                cursor: 'pointer',
                fontFamily: 'Inter, system-ui, sans-serif',
                transition: 'background 0.2s ease',
                letterSpacing: '-0.01em',
              }}
            >
              {showCreatePost ? '✕ Close' : '+ Post'}
            </button>
          ) : (
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#a8a29e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {viewingUsername ? `@${viewingUsername}` : activeTab}
            </span>
          )}
        </header>

        <main>
          {renderContent()}
        </main>
      </div>

      <BottomNavigation
        activeTab={displayTab as TabType}
        onTabChange={handleTabChange}
        badges={{
          notifications: unreadNotifications,
          messages: unreadMessages,
        }}
      />
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('user');
  const [userData, setUserData] = React.useState<UserData | null>(null);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setUserData(JSON.parse(user));
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleProfileUpdated = (updatedUser: UserData) => {
    setUserData(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (!userData) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf9' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #e7e5e4', borderTopColor: '#1c1917', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '14px', color: '#78716c' }}>Loading...</span>
      </div>
    </div>
  );

  return (
    <SocketProvider username={userData.username}>
      <DashboardInner userData={userData} onLogout={handleLogout} handleProfileUpdated={handleProfileUpdated} />
    </SocketProvider>
  );
};

export default Dashboard;

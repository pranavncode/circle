import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './navigation/BottomNavigation';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import PlaceholderPage from './pages/PlaceholderPage';
import type { TabType, UserData } from './shared/types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('user');
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [activeTab, setActiveTab] = React.useState<TabType>('home');

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

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleGoHome = () => {
    setActiveTab('home');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage userData={userData} />;
      case 'profile':
        return <ProfilePage userData={userData} onLogout={handleLogout} onProfileUpdated={handleProfileUpdated} />;
      case 'notifications':
        return <PlaceholderPage title="Notifications" subtitle="Stay tuned for alerts" onGoHome={handleGoHome} />;
      case 'messages':
        return <PlaceholderPage title="Messages" subtitle="Chat with your network soon" onGoHome={handleGoHome} />;
      case 'search':
        return <PlaceholderPage title="Search" subtitle="Find people, jobs, and posts" onGoHome={handleGoHome} />;
      default:
        return <HomePage userData={userData} />;
    }
  };

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
          <span style={{ fontSize: '12px', fontWeight: 500, color: '#a8a29e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {activeTab}
          </span>
        </header>

        <main>
          {renderContent()}
        </main>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Dashboard;

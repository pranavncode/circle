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

  if (!userData) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">Loading...</div>;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 text-slate-900">
      <div className="max-w-5xl mx-auto px-4 pb-32 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center border-b border-slate-200 bg-white/80 backdrop-blur py-1 px-5 rounded-3xl shadow-sm ">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-orange-500 font-bold">Circle</p>
          </div>
        </header>

        <main className="mt-8">
          {renderContent()}
        </main>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Dashboard;

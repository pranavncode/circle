import React from 'react';
import Icon from '../shared/Icon';
import type { TabType, NavItem } from '../shared/types';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  badges?: Partial<Record<TabType, number>>;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange, badges = {} }) => {
  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'notifications', label: 'Alerts', icon: 'bell' },
    { id: 'messages', label: 'Chat', icon: 'chat' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      borderTop: '1px solid #e7e5e4',
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 30,
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '8px 16px 12px' }}>
        {navItems.map((item) => {
          const active = activeTab === item.id;
          const badgeCount = badges[item.id] || 0;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '12px',
                transition: 'background 0.2s ease',
                position: 'relative',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Icon name={item.icon} active={active} />
                {badgeCount > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '8px',
                    background: '#e85d04',
                    color: '#fff',
                    fontSize: '9px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    boxShadow: '0 0 0 2px rgba(255,255,255,0.92)',
                    animation: 'badge-pop 0.3s ease',
                  }}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </div>
                )}
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: active ? 600 : 500,
                color: active ? '#1c1917' : '#a8a29e',
                letterSpacing: '0.02em',
                transition: 'color 0.2s ease',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>
                {item.label}
              </span>
              {active && (
                <div style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#e85d04',
                  marginTop: '-2px',
                }} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
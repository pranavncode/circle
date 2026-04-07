import React from 'react';
import Icon from '../shared/Icon';
import type { TabType, NavItem } from '../shared/types';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'notifications', label: 'Alerts', icon: 'bell' },
    { id: 'messages', label: 'Messages', icon: 'chat' },
    { id: 'search', label: 'Search', icon: 'search' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur z-30">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        {navItems.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center gap-1 text-[11px] font-semibold transition"
            >
              <Icon name={item.icon} active={active} />
              <span className={active ? 'text-orange-600' : 'text-slate-500'}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
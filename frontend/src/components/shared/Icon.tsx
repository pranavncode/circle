import React from 'react';

interface IconProps {
  name: string;
  active: boolean;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, active }) => {
  const color = active ? '#1c1917' : '#a8a29e';
  const strokeWidth = active ? '2.2' : '1.8';

  const svgStyle: React.CSSProperties = {
    width: '22px',
    height: '22px',
    transition: 'color 0.2s ease',
  };

  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} style={svgStyle} xmlns="http://www.w3.org/2000/svg">
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'user':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} style={svgStyle} xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="4" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} style={svgStyle} xmlns="http://www.w3.org/2000/svg">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'chat':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} style={svgStyle} xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} style={svgStyle} xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 21l-4.35-4.35" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
};

export default Icon;
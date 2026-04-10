import React from 'react';

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  onGoHome: () => void;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, subtitle, onGoHome }) => {
  return (
    <div style={{ paddingBottom: '100px' }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid #e7e5e4',
        padding: '48px 32px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#a8a29e', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '12px' }}>{title}</p>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1c1917', letterSpacing: '-0.02em' }}>{subtitle}</h2>
        <p style={{ fontSize: '14px', color: '#78716c', marginTop: '8px', lineHeight: 1.6 }}>
          This section is coming soon. Explore the Home and Profile pages for now.
        </p>
        <button
          onClick={onGoHome}
          style={{
            marginTop: '24px',
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
          }}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default PlaceholderPage;
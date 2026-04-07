import React from 'react';

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  onGoHome: () => void;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, subtitle, onGoHome }) => {
  return (
    <div className="space-y-5 pb-28">
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200 text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-orange-500 font-semibold">{title}</p>
        <h2 className="mt-4 text-3xl font-bold text-slate-900">{subtitle}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">This section is coming soon, but you can still explore the Home and Profile pages for now.</p>
        <button onClick={onGoHome} className="mt-6 inline-flex items-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-orange-600 transition">Go to Home</button>
      </div>
    </div>
  );
};

export default PlaceholderPage;
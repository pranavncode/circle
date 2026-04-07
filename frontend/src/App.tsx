import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import React from 'react';

// Authentication check
const isAuthenticated = () => {
  return Boolean(localStorage.getItem('user'));
};

function App() {
  const location = useLocation();
  // If already logged in and trying to access login/signup, redirect to dashboard
  if ((location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup') && isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      {/* Catch-all: redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
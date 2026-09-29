import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import BookingsPage from './pages/BookingsPage';
import RewardsPage from './pages/RewardsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import api from './services/api';

function MainApp() {
  const [currentTab, setTab] = useState('home');
  const [hasActiveBooking, setHasActiveBooking] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/bookings/my')
        .then((res) => {
          setHasActiveBooking(!!res.data.activeBooking);
        })
        .catch(() => {});
    } else {
      setHasActiveBooking(false);
    }
  }, [isAuthenticated, currentTab]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white transition-colors">
      {/* Top Navigation */}
      <Navbar currentTab={currentTab} setTab={setTab} />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {currentTab === 'home' && <HomePage setTab={setTab} />}
        {currentTab === 'bookings' && <BookingsPage setTab={setTab} />}
        {currentTab === 'rewards' && <RewardsPage setTab={setTab} />}
        {currentTab === 'profile' && <ProfilePage setTab={setTab} />}
        {currentTab === 'admin' && <AdminDashboard setTab={setTab} />}
        {currentTab === 'login' && <LoginPage setTab={setTab} />}
        {currentTab === 'register' && <RegisterPage setTab={setTab} />}
      </main>

      {/* Mobile-First Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        setTab={setTab}
        hasActiveBooking={hasActiveBooking}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

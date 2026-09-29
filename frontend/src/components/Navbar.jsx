import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Coins, QrCode, LogOut, ShieldCheck, User, Sun, Moon } from 'lucide-react';

export const Navbar = ({ currentTab, setTab }) => {
  const { user, isAuthenticated, isAdmin, coins, logout, darkMode, toggleDarkMode } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo with SRM College badge */}
        <div 
          onClick={() => setTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-amber-600 dark:from-brand-400 dark:to-amber-400 bg-clip-text text-transparent">
                QuickBite
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 uppercase tracking-wide border border-blue-200 dark:border-blue-800">
                SRMIST
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5 hidden sm:block">
              SRM College Breakfast Pre-Booking
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setTab('home')}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              currentTab === 'home'
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Today's Menu
          </button>
          {isAuthenticated && (
            <>
              <button
                onClick={() => setTab('bookings')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  currentTab === 'bookings'
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                My Bookings
              </button>
              <button
                onClick={() => setTab('rewards')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  currentTab === 'rewards'
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Rewards Store
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => setTab('admin')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Cafeteria Admin
            </button>
          )}
        </nav>

        {/* Right Actions: Dark Mode Switch, Coins Pill & User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Dark Mode Switch Button */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {isAuthenticated ? (
            <>
              {/* Campus Coins Counter */}
              {!isAdmin && (
                <div 
                  onClick={() => setTab('rewards')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-yellow-950/40 border border-amber-300 dark:border-amber-700/60 rounded-full cursor-pointer hover:shadow-xs transition-shadow"
                  title="Your Campus Coins balance. Click to redeem rewards!"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    🪙
                  </div>
                  <span className="font-bold text-amber-900 dark:text-amber-300 text-sm">
                    {coins}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hidden sm:inline">
                    Coins
                  </span>
                </div>
              )}

              {/* Profile Avatar / Trigger */}
              <button
                onClick={() => setTab('profile')}
                className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                  currentTab === 'profile' ? 'ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-slate-900' : ''
                }`}
                title="Account & Coin History"
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline max-w-[100px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setTab('login')}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setTab('register')}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-all hover:shadow-md"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

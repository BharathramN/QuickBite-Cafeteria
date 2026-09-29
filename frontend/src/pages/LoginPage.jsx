import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, LogIn, Sparkles, User, ShieldCheck } from 'lucide-react';

export const LoginPage = ({ setTab }) => {
  const { login, showToast } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      showToast('Please enter your SRM email/Student ID and password.', 'error');
      return;
    }

    try {
      setLoading(true);
      const user = await login(identifier, password);
      if (user.role === 'admin') {
        setTab('admin');
      } else {
        setTab('home');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (type) => {
    if (type === 'student') {
      setIdentifier('bharath@srmist.edu.in');
      setPassword('student123');
    } else {
      setIdentifier('admin@srmist.edu.in');
      setPassword('admin123');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-24 md:pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl transition-colors">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <div className="inline-block px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-extrabold uppercase mb-2 border border-blue-200 dark:border-blue-800">
            SRMIST Campus Dining
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Sign In to QuickBite</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pre-book college breakfast & earn Campus Coins
          </p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="mb-6 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block mb-2 text-center">
            One-Click SRM Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-300 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition-colors shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <User className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>SRM Student</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 block mt-0.5">Bharath (35 Coins)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition-colors shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Cafeteria Admin</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 block mt-0.5">SRM Staff</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              SRM Email or Register Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. bharath@srmist.edu.in or RA2111003010001"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            New SRM student?{' '}
            <button
              onClick={() => setTab('register')}
              className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Register with @srmist.edu.in (Get 10 Free Coins!)
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

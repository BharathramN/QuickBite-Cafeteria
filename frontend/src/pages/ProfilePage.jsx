import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Hash, Phone, LogOut, ArrowUpRight, ArrowDownLeft, Shield, Coins, Sparkles, Sun, Moon } from 'lucide-react';

export const ProfilePage = ({ setTab }) => {
  const { user, isAuthenticated, coins, logout, darkMode, toggleDarkMode } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await api.get('/auth/coins/transactions');
        setTransactions(res.data);
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-600 dark:text-slate-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sign In to QuickBite</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Access your SRM student profile, check coin balances, and review breakfast history.
        </p>
        <button
          onClick={() => setTab('login')}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl text-sm transition-colors shadow-md"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      {/* Student Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white flex items-center justify-center text-2xl font-black shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{user?.name}</h1>
              {user?.role === 'admin' ? (
                <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-300 dark:border-rose-800">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              ) : (
                <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  SRM Student
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
              {user?.studentId && (
                <span className="flex items-center gap-1 font-mono font-semibold">
                  <Hash className="w-3.5 h-3.5 text-slate-400" /> {user.studentId}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}
              </span>
              {user?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions: Coins Badge, Theme Toggle & Logout */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-4 py-2 rounded-2xl flex items-center gap-2.5">
            <span className="text-xl">🪙</span>
            <div>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                Campus Coins
              </span>
              <span className="text-xl font-black text-amber-950 dark:text-amber-300">{coins}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold flex items-center gap-1.5"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              onClick={logout}
              className="px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Coin Transaction Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Campus Coins Ledger</h2>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            5 coins per collected breakfast pass
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading ledger records...</div>
        ) : transactions.length > 0 ? (
          <div className="space-y-2.5">
            {transactions.map((tx) => {
              const isPositive = tx.amount > 0;

              return (
                <div
                  key={tx._id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isPositive ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{tx.description}</h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString()} at{' '}
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {tx.referenceId && ` • Ref: ${tx.referenceId}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-black ${
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isPositive ? `+${tx.amount}` : tx.amount} Coins
                    </span>
                    <span className="text-[10px] block font-semibold text-slate-400 dark:text-slate-500">
                      Balance: {tx.balanceAfter}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            No transactions recorded yet. Pre-book your breakfast to start earning!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('quickbite_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('quickbite_token') || null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('quickbite_theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('quickbite_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('quickbite_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('quickbite_user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    const { user: userData, token: jwtToken } = res.data;
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('quickbite_token', jwtToken);
    localStorage.setItem('quickbite_user', JSON.stringify(userData));
    showToast(`Welcome back, ${userData.name}!`, 'success');
    return userData;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { user: newUser, token: jwtToken } = res.data;
    setUser(newUser);
    setToken(jwtToken);
    localStorage.setItem('quickbite_token', jwtToken);
    localStorage.setItem('quickbite_user', JSON.stringify(newUser));
    showToast(`Registration successful! 10 Welcome Bonus coins added.`, 'success');
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('quickbite_token');
    localStorage.removeItem('quickbite_user');
    showToast('Logged out safely.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        coins: user?.coins || 0,
        loading,
        darkMode,
        toggleDarkMode,
        login,
        register,
        logout,
        refreshUser,
        toast,
        showToast,
      }}
    >
      {children}
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between text-sm font-semibold border ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-3 text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React from 'react';
import { Home, CalendarCheck, Gift, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const BottomNav = ({ currentTab, setTab, hasActiveBooking }) => {
  const { isAuthenticated, isAdmin, coins } = useAuth();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: CalendarCheck,
      badge: hasActiveBooking,
    },
    {
      id: 'rewards',
      label: 'Rewards',
      icon: Gift,
      subBadge: coins > 0 ? `${coins}` : null,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
    },
  ];

  // If admin, append or include admin tab
  const items = isAdmin
    ? [
        ...navItems.slice(0, 3),
        { id: 'admin', label: 'Admin', icon: ShieldCheck, isAdminBadge: true },
      ]
    : navItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1 shadow-lg pb-safe transition-colors">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-brand-600 dark:text-brand-400 stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
                {item.subBadge && (
                  <span className="absolute -top-1.5 -right-3 text-[9px] font-extrabold px-1 rounded-full bg-amber-400 text-amber-950 ring-1 ring-white dark:ring-slate-900">
                    {item.subBadge}
                  </span>
                )}
                {item.isAdminBadge && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

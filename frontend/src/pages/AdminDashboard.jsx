import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import VegNonVegBadge from '../components/VegNonVegBadge';
import ScannerModal from '../components/ScannerModal';
import {
  ShieldCheck,
  Search,
  Scan,
  CheckCircle,
  Clock,
  TrendingUp,
  Utensils,
  Plus,
  Edit2,
  Gift,
  Coins,
  AlertTriangle,
  RotateCw,
  Sparkles,
  MapPin,
} from 'lucide-react';

export const AdminDashboard = ({ setTab }) => {
  const { user, isAdmin, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'menu' | 'rewards' | 'redemptions' | 'transactions'
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    totalVegQty: 0,
    totalNonVegQty: 0,
    totalMealsBooked: 0,
    totalRevenue: 0,
    totalCollected: 0,
    totalPending: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [menu, setMenu] = useState(null);
  const [menuForm, setMenuForm] = useState({
    cutoffTime: '09:00',
    veg: { name: '', description: '', price: 65, imageUrl: '', tags: 'SRM Special, Pure Veg' },
    nonVeg: { name: '', description: '', price: 85, imageUrl: '', tags: 'High Protein, Chef Special' },
  });
  const [rewards, setRewards] = useState([]);
  const [newReward, setNewReward] = useState({
    name: '',
    description: '',
    coinCost: 50,
    category: 'Beverage',
    imageUrl: '',
  });
  const [redemptions, setRedemptions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/dashboard?search=${encodeURIComponent(search)}`);
      setStats(res.data.stats);
      setBookings(res.data.bookings);
      if (res.data.menu) {
        setMenu(res.data.menu);
        setMenuForm({
          cutoffTime: res.data.menu.cutoffTime || '09:00',
          veg: {
            name: res.data.menu.veg?.name || '',
            description: res.data.menu.veg?.description || '',
            price: res.data.menu.veg?.price || 65,
            imageUrl: res.data.menu.veg?.imageUrl || '',
            tags: res.data.menu.veg?.tags?.join(', ') || '',
          },
          nonVeg: {
            name: res.data.menu.nonVeg?.name || '',
            description: res.data.menu.nonVeg?.description || '',
            price: res.data.menu.nonVeg?.price || 85,
            imageUrl: res.data.menu.nonVeg?.imageUrl || '',
            tags: res.data.menu.nonVeg?.tags?.join(', ') || '',
          },
        });
      }

      // Load rewards catalog
      const rewRes = await api.get('/rewards');
      setRewards(rewRes.data);

      // Load redemptions
      const redRes = await api.get('/admin/redemptions');
      setRedemptions(redRes.data);

      // Load transactions
      const txRes = await api.get('/admin/transactions');
      setTransactions(txRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin, search]);

  const handleMarkCollected = async (bookingId) => {
    try {
      setActionLoadingId(bookingId);
      const res = await api.post('/admin/scan/booking', { code: bookingId });
      showToast(res.data.message || 'Breakfast marked Collected & +5 Coins awarded!', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to mark as collected', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleVerifyReward = async (redemptionCode) => {
    try {
      setActionLoadingId(redemptionCode);
      const res = await api.post('/admin/scan/reward', { code: redemptionCode });
      showToast(res.data.message || 'Reward redeemed successfully!', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to verify reward', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        cutoffTime: menuForm.cutoffTime,
        veg: {
          ...menuForm.veg,
          price: Number(menuForm.veg.price),
        },
        nonVeg: {
          ...menuForm.nonVeg,
          price: Number(menuForm.nonVeg.price),
        },
      };
      await api.post('/menu', payload);
      showToast("Today's breakfast menu updated successfully!", 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save menu', 'error');
    }
  };

  const handleCreateReward = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rewards', newReward);
      showToast(`Reward "${newReward.name}" added to catalog!`, 'success');
      setNewReward({
        name: '',
        description: '',
        coinCost: 50,
        category: 'Snacks',
        imageUrl: '',
      });
      fetchDashboardData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create reward', 'error');
    }
  };

  const handleToggleReward = async (rewardId) => {
    try {
      await api.delete(`/rewards/${rewardId}`);
      showToast('Reward status updated.', 'info');
      fetchDashboardData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update reward', 'error');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Cafeteria Admin Only</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Please log in with cafeteria admin credentials to access this dashboard.
        </p>
        <button
          onClick={() => setTab('login')}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-sm transition-colors"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight">Cafeteria Staff Control Center</h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify pre-booked breakfasts, award Campus Coins, update menu and validate rewards.
            </p>
          </div>
        </div>

        {/* Big Action: Open Scanner */}
        <button
          onClick={() => setScannerOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Scan className="w-4 h-4" />
          <span>Launch Counter Scanner</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Veg */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Veg Meals</span>
            <VegNonVegBadge type="veg" showLabel={false} size="sm" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalVegQty}</div>
          <span className="text-[10px] text-emerald-600 font-bold">Total booked today</span>
        </div>

        {/* Total Non-Veg */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Non-Veg Meals</span>
            <VegNonVegBadge type="non_veg" showLabel={false} size="sm" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalNonVegQty}</div>
          <span className="text-[10px] text-red-600 font-bold">Total booked today</span>
        </div>

        {/* Total Meals & Collected */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Meals</span>
            <Utensils className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalMealsBooked}</div>
          <span className="text-[10px] text-slate-500 font-medium">
            {stats.totalCollected} Collected • {stats.totalPending} Pending
          </span>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Day Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-brand-600">₹{stats.totalRevenue}</div>
          <span className="text-[10px] text-slate-500 font-medium">
            {stats.totalBookingsCount} bookings
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'bookings'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          Today's Bookings ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'menu'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Edit2 className="w-3.5 h-3.5" />
          Manage Daily Menu & Cutoff
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'rewards'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          Manage Rewards ({rewards.length})
        </button>

        <button
          onClick={() => setActiveTab('redemptions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'redemptions'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Reward Redemptions ({redemptions.length})
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'transactions'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          Coin Transactions ({transactions.length})
        </button>
      </div>

      {/* TAB 1: TODAY'S BOOKINGS LIST */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, Student ID, or Booking ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-xs"
              />
            </div>
            <button
              onClick={fetchDashboardData}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
              title="Refresh list"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Bookings Table / List */}
          {bookings.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="divide-y divide-slate-100">
                {bookings.map((booking) => {
                  const isCollected = booking.status === 'Collected';
                  const isCancelled = booking.status === 'Cancelled';
                  const isPending = booking.status === 'Pending';

                  return (
                    <div
                      key={booking._id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="mt-1">
                          <VegNonVegBadge type={booking.mealType} showLabel={false} size="md" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-extrabold text-sm text-slate-900">
                              {booking.bookingId}
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              • {booking.student?.name || 'Student'}
                            </span>
                            {booking.student?.studentId && (
                              <span className="text-[11px] font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                {booking.student.studentId}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 flex flex-wrap items-center gap-2">
                            <span>{booking.quantity}x {booking.mealName} (₹{booking.totalPrice})</span>
                            <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 text-[10px]">
                              <MapPin className="w-3 h-3" />
                              {booking.pickupPoint || 'Cafeteria TP1'}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            Booked at {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isCollected && ` • Collected at ${new Date(booking.collectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </p>
                        </div>
                      </div>

                      {/* Right: Status and Mark Collected Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                        {isPending ? (
                          <button
                            onClick={() => handleMarkCollected(booking.bookingId)}
                            disabled={actionLoadingId === booking.bookingId}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>
                              {actionLoadingId === booking.bookingId
                                ? 'Collecting...'
                                : 'Mark Collected (+5 Coins)'}
                            </span>
                          </button>
                        ) : isCollected ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Collected (+5 Coins)</span>
                          </div>
                        ) : (
                          <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-400">
              No breakfast bookings found matching search query.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANAGE DAILY MENU & CUTOFF */}
      {activeTab === 'menu' && (
        <form onSubmit={handleSaveMenu} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Manage Today's Breakfast Menu</h2>
              <p className="text-xs text-slate-500">
                Rule: Exactly ONE Veg option and ONE Non-Veg option are published each day.
              </p>
            </div>

            {/* Cutoff Time Input */}
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 p-2.5 rounded-2xl">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <label className="block text-[10px] font-bold text-amber-800 uppercase">
                  Booking Cutoff Time (24h)
                </label>
                <input
                  type="time"
                  value={menuForm.cutoffTime}
                  onChange={(e) => setMenuForm({ ...menuForm, cutoffTime: e.target.value })}
                  className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* VEG FORM */}
            <div className="p-5 rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/20 space-y-4">
              <div className="flex items-center gap-2">
                <VegNonVegBadge type="veg" size="md" />
                <h3 className="font-extrabold text-sm text-emerald-900 uppercase">Daily Veg Option</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  value={menuForm.veg.name}
                  onChange={(e) => setMenuForm({ ...menuForm, veg: { ...menuForm.veg, name: e.target.value } })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                  placeholder="e.g. Masala Dosa Platter"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={menuForm.veg.description}
                  onChange={(e) => setMenuForm({ ...menuForm, veg: { ...menuForm.veg, description: e.target.value } })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                  placeholder="Ingredients, accompaniments..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={menuForm.veg.price}
                    onChange={(e) => setMenuForm({ ...menuForm, veg: { ...menuForm.veg, price: e.target.value } })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={menuForm.veg.tags}
                    onChange={(e) => setMenuForm({ ...menuForm, veg: { ...menuForm.veg, tags: e.target.value } })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    placeholder="Crispy, South Indian"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Photo URL</label>
                <input
                  type="url"
                  value={menuForm.veg.imageUrl}
                  onChange={(e) => setMenuForm({ ...menuForm, veg: { ...menuForm.veg, imageUrl: e.target.value } })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                />
              </div>
            </div>

            {/* NON-VEG FORM */}
            <div className="p-5 rounded-2xl border-2 border-red-500/50 bg-red-50/20 space-y-4">
              <div className="flex items-center gap-2">
                <VegNonVegBadge type="non_veg" size="md" />
                <h3 className="font-extrabold text-sm text-red-900 uppercase">Daily Non-Veg Option</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  value={menuForm.nonVeg.name}
                  onChange={(e) => setMenuForm({ ...menuForm, nonVeg: { ...menuForm.nonVeg, name: e.target.value } })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                  placeholder="e.g. Chicken Keema Paratha"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={menuForm.nonVeg.description}
                  onChange={(e) => setMenuForm({ ...menuForm, nonVeg: { ...menuForm.nonVeg, description: e.target.value } })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                  placeholder="Ingredients, accompaniments..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={menuForm.nonVeg.price}
                    onChange={(e) => setMenuForm({ ...menuForm, nonVeg: { ...menuForm.nonVeg, price: e.target.value } })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={menuForm.nonVeg.tags}
                    onChange={(e) => setMenuForm({ ...menuForm, nonVeg: { ...menuForm.nonVeg, tags: e.target.value } })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    placeholder="High Protein, Spicy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Photo URL</label>
                <input
                  type="url"
                  value={menuForm.nonVeg.imageUrl}
                  onChange={(e) => setMenuForm({ ...menuForm, nonVeg: { ...menuForm.nonVeg, imageUrl: e.target.value } })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
            >
              Save & Publish Menu Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: MANAGE REWARDS */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          {/* Create Reward Form */}
          <form onSubmit={handleCreateReward} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-slate-900">Add New Campus Reward Item</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Coke 300ml"
                  value={newReward.name}
                  onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Coin Cost</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 100"
                  value={newReward.coinCost}
                  onChange={(e) => setNewReward({ ...newReward, coinCost: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="Beverage, Snacks, Dessert"
                  value={newReward.category}
                  onChange={(e) => setNewReward({ ...newReward, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="Brief reward description..."
                value={newReward.description}
                onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Reward</span>
              </button>
            </div>
          </form>

          {/* Existing Rewards List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <div
                key={reward._id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {reward.category}
                    </span>
                    <span className="font-black text-amber-600 text-xs flex items-center gap-1">
                      <span>🪙</span>
                      <span>{reward.coinCost} Coins</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{reward.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{reward.description}</p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`text-[11px] font-bold ${
                      reward.isActive ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {reward.isActive ? 'Active' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => handleToggleReward(reward._id)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    {reward.isActive ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REWARD REDEMPTIONS AUDIT */}
      {activeTab === 'redemptions' && (
        <div className="space-y-3">
          {redemptions.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
              {redemptions.map((redemption) => {
                const isRedeemed = redemption.status === 'Redeemed';

                return (
                  <div
                    key={redemption._id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-800">
                          {redemption.redemptionCode}
                        </span>
                        <span className="text-xs font-bold text-brand-600">
                          • {redemption.rewardName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Student: <strong className="text-slate-700">{redemption.student?.name}</strong> ({redemption.student?.studentId})
                        • Cost: {redemption.coinCost} Coins
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Requested on {new Date(redemption.createdAt).toLocaleString()}
                        {isRedeemed && ` • Redeemed at counter on ${new Date(redemption.redeemedAt).toLocaleTimeString()}`}
                      </p>
                    </div>

                    <div>
                      {isRedeemed ? (
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Redeemed at Counter</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleVerifyReward(redemption.redemptionCode)}
                          disabled={actionLoadingId === redemption.redemptionCode}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                        >
                          {actionLoadingId === redemption.redemptionCode
                            ? 'Verifying...'
                            : 'Mark as Redeemed'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-400">
              No reward redemptions recorded yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: COIN TRANSACTIONS CAMPUS AUDIT */}
      {activeTab === 'transactions' && (
        <div className="space-y-3">
          {transactions.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
              {transactions.map((tx) => (
                <div key={tx._id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{tx.student?.name}</span>
                      <span className="font-mono text-[11px] text-slate-400">({tx.student?.studentId})</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{tx.description}</p>
                    <p className="text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-black text-sm ${
                        tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Coins
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Balance: {tx.balanceAfter}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-400">
              No coin transactions recorded yet.
            </div>
          )}
        </div>
      )}

      {/* Counter Scanner Modal */}
      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onActionSuccess={() => fetchDashboardData()}
      />
    </div>
  );
};

export default AdminDashboard;

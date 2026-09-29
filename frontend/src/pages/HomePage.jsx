import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import VegNonVegBadge from '../components/VegNonVegBadge';
import QrModal from '../components/QrModal';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Plus,
  Minus,
  ArrowRight,
  MapPin,
  Building2,
  Utensils,
} from 'lucide-react';

export const HomePage = ({ setTab }) => {
  const { user, isAuthenticated, showToast, refreshUser } = useAuth();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState('veg'); // 'veg' or 'non_veg'
  const [quantity, setQuantity] = useState(1);
  const [pickupPoint, setPickupPoint] = useState('Cafeteria TP1'); // SRM Campus Pickup Points
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [currentBookingPass, setCurrentBookingPass] = useState(null);

  const pickupOptions = [
    {
      id: 'Cafeteria TP1',
      title: 'Cafeteria TP1',
      subtitle: 'Tech Park 1 • Ground Floor',
      tag: 'Fast Pickup',
    },
    {
      id: 'Food joint UB building',
      title: 'Food joint UB building',
      subtitle: 'University Building • Courtyard',
      tag: 'Central Campus',
    },
    {
      id: 'Cafeteria Main block',
      title: 'Cafeteria Main block',
      subtitle: 'Main Administrative Block • Level 1',
      tag: 'Spacious Counter',
    },
  ];

  const fetchMenuAndActiveBooking = async () => {
    try {
      setLoading(true);
      const res = await api.get('/menu/today');
      setMenu(res.data);

      if (isAuthenticated) {
        const bookingsRes = await api.get('/bookings/my');
        if (bookingsRes.data.activeBooking) {
          setActiveBooking(bookingsRes.data.activeBooking);
        } else {
          setActiveBooking(null);
        }
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuAndActiveBooking();
  }, [isAuthenticated]);

  const handleBooking = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in or register to pre-book breakfast.', 'info');
      setTab('login');
      return;
    }

    if (activeBooking) {
      showToast('You already have an active breakfast pre-booking for today!', 'error');
      return;
    }

    if (menu?.isBookingClosed) {
      showToast('Pre-booking cutoff time has passed for today.', 'error');
      return;
    }

    try {
      setBookingLoading(true);
      const res = await api.post('/bookings', {
        mealType: selectedMeal,
        quantity,
        pickupPoint,
      });

      showToast(res.data.message || 'Breakfast pre-booked successfully!', 'success');
      setCurrentBookingPass(res.data.booking);
      setActiveBooking(res.data.booking);
      setQrModalOpen(true);
      refreshUser();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to book breakfast.', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-300 font-semibold text-sm">
          Loading today's SRM cafeteria breakfast...
        </p>
      </div>
    );
  }

  const defaultVeg = {
    name: 'SRM Special: Ghee Podi Masala Dosa Platter',
    description: 'Crispy golden crepe roasted in pure ghee with spiced potato masala, served with fresh coconut chutney, tomato dip, and steaming sambar.',
    price: 65,
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
    tags: ['SRM Special', 'Pure Veg', 'Freshly Made'],
  };

  const defaultNonVeg = {
    name: 'SRM Cafeteria Signature: Chicken Keema Paratha & Egg',
    description: 'Whole wheat flaky paratha stuffed with flavorful minced chicken keema, served with spiced boondi raita, pickle, and a fluffy boiled egg.',
    price: 85,
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    tags: ['High Protein', 'Student Favorite', 'Chef Special'],
  };

  const vegItem = {
    ...defaultVeg,
    ...(menu?.veg || {}),
    imageUrl: menu?.veg?.imageUrl || defaultVeg.imageUrl,
    price: Number(menu?.veg?.price) > 0 ? Number(menu.veg.price) : 65,
    name: menu?.veg?.name || defaultVeg.name,
    description: menu?.veg?.description || defaultVeg.description,
  };

  const nonVegItem = {
    ...defaultNonVeg,
    ...(menu?.nonVeg || {}),
    imageUrl: menu?.nonVeg?.imageUrl || defaultNonVeg.imageUrl,
    price: Number(menu?.nonVeg?.price) > 0 ? Number(menu.nonVeg.price) : 85,
    name: menu?.nonVeg?.name || defaultNonVeg.name,
    description: menu?.nonVeg?.description || defaultNonVeg.description,
  };

  const selectedItem = selectedMeal === 'veg' ? vegItem : nonVegItem;
  const unitPrice = selectedItem.price;
  const totalPrice = unitPrice * quantity;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      {/* Hero / SRM Campus Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-amber-600 to-amber-700 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-100 mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>SRMIST Campus Dining</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Today's Fresh Breakfast
          </h1>
          <p className="text-sm sm:text-base text-amber-100/90 mt-1 font-medium">
            Pre-book your morning meal, select your pickup counter, and earn 5 Campus Coins on counter collection!
          </p>

          {/* Cutoff & Date Badge */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-semibold text-white">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>Booking Cutoff: {menu?.cutoffTime || '09:00'}</span>
            </div>

            {menu?.isBookingClosed ? (
              <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs">
                <AlertCircle className="w-3.5 h-3.5" /> Bookings Closed for Today
              </span>
            ) : (
              <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pre-Booking Open
              </span>
            )}
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Active Booking Reminder Card (if already pre-booked) */}
      {activeBooking && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl mt-0.5">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-100">
                You Have an Active Breakfast Booking!
              </span>
              <h3 className="text-lg font-bold">
                {activeBooking.quantity}x {activeBooking.mealName}
              </h3>
              <p className="text-xs text-emerald-100 flex flex-wrap items-center gap-2 mt-0.5">
                <span>Pass: <strong className="font-mono">{activeBooking.bookingId}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  {activeBooking.pickupPoint || 'Cafeteria TP1'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setCurrentBookingPass(activeBooking);
              setQrModalOpen(true);
            }}
            className="px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-xl text-sm shadow-md transition-all self-start sm:self-auto shrink-0 flex items-center gap-2"
          >
            <span>View QR Pass</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Two Breakfast Options Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Choose Today's Breakfast
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Every day SRM cafeteria prepares two curated morning choices: Pure Veg (₹65) & Non-Veg (₹85)
            </p>
          </div>
        </div>

        {/* Dual Breakfast Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. VEG OPTION CARD (₹65) */}
          <div
            onClick={() => setSelectedMeal('veg')}
            className={`group cursor-pointer rounded-3xl border-2 transition-all p-5 flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900 shadow-xs ${
              selectedMeal === 'veg'
                ? 'border-emerald-500 ring-4 ring-emerald-500/10 shadow-lg -translate-y-0.5'
                : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700'
            }`}
          >
            {/* Selected Tag */}
            {selectedMeal === 'veg' && (
              <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-xs flex items-center gap-1 z-10">
                <CheckCircle2 className="w-3.5 h-3.5" /> Selected
              </div>
            )}

            <div>
              {/* Image Preview */}
              <div className="h-44 w-full rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800 relative">
                <img
                  src={vegItem.imageUrl}
                  alt={vegItem.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultVeg.imageUrl;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-2 left-2">
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-xs">
                    <VegNonVegBadge type="veg" size="sm" />
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {vegItem.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                {vegItem.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(vegItem.tags || defaultVeg.tags).map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Price Row */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                  Pre-booking Price
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{vegItem.price}
                </span>
              </div>
              <button
                type="button"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  selectedMeal === 'veg'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950 group-hover:text-emerald-600'
                }`}
              >
                {selectedMeal === 'veg' ? 'Selected Veg' : 'Select Veg'}
              </button>
            </div>
          </div>

          {/* 2. NON-VEG OPTION CARD (₹85) */}
          <div
            onClick={() => setSelectedMeal('non_veg')}
            className={`group cursor-pointer rounded-3xl border-2 transition-all p-5 flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900 shadow-xs ${
              selectedMeal === 'non_veg'
                ? 'border-red-500 ring-4 ring-red-500/10 shadow-lg -translate-y-0.5'
                : 'border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-700'
            }`}
          >
            {/* Selected Tag */}
            {selectedMeal === 'non_veg' && (
              <div className="absolute top-4 right-4 bg-red-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-xs flex items-center gap-1 z-10">
                <CheckCircle2 className="w-3.5 h-3.5" /> Selected
              </div>
            )}

            <div>
              {/* Image Preview */}
              <div className="h-44 w-full rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800 relative">
                <img
                  src={nonVegItem.imageUrl}
                  alt={nonVegItem.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultNonVeg.imageUrl;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-2 left-2">
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-xs">
                    <VegNonVegBadge type="non_veg" size="sm" />
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {nonVegItem.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                {nonVegItem.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(nonVegItem.tags || defaultNonVeg.tags).map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Price Row */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                  Pre-booking Price
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{nonVegItem.price}
                </span>
              </div>
              <button
                type="button"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  selectedMeal === 'non_veg'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-red-50 dark:group-hover:bg-red-950 group-hover:text-red-600'
                }`}
              >
                {selectedMeal === 'non_veg' ? 'Selected Non-Veg' : 'Select Non-Veg'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PICK-UP POINT SELECTION (SRM CAMPUS REQUIREMENT) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Select SRM Campus Pick-up Counter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pick where you would like to collect your breakfast box
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {pickupOptions.map((opt) => {
            const isSelected = pickupPoint === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => setPickupPoint(opt.id)}
                className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 ring-2 ring-brand-500/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {opt.tag}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {opt.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {opt.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Customization & Confirmation Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Quantity Controls */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Quantity
            </label>
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-2xl p-1 bg-slate-50 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || !!activeBooking}
                className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold disabled:opacity-40 transition-colors shadow-xs"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-extrabold text-base text-slate-800 dark:text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                disabled={quantity >= 5 || !!activeBooking}
                className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold disabled:opacity-40 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Total Price Calculation */}
          <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">
              Total Amount
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
                ₹{totalPrice}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                ({quantity}x ₹{unitPrice})
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="text-center sm:text-right hidden sm:block">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>+5 Campus Coins</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Credited upon counter collection</p>
          </div>

          <button
            onClick={handleBooking}
            disabled={bookingLoading || menu?.isBookingClosed || !!activeBooking}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              activeBooking
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                : menu?.isBookingClosed
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow-lg hover:shadow-brand-500/25 active:scale-95'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {activeBooking
                ? 'Already Booked for Today'
                : menu?.isBookingClosed
                ? 'Pre-Bookings Closed'
                : bookingLoading
                ? 'Confirming...'
                : `Confirm Booking (₹${totalPrice})`}
            </span>
          </button>
        </div>
      </div>

      {/* QR Pass Modal */}
      <QrModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        data={currentBookingPass}
        type="booking"
      />
    </div>
  );
};

export default HomePage;

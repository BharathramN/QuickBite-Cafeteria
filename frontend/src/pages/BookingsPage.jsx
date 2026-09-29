import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import VegNonVegBadge from '../components/VegNonVegBadge';
import QrModal from '../components/QrModal';
import { QrCode, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, ArrowRight, Sparkles, MapPin } from 'lucide-react';

export const BookingsPage = ({ setTab }) => {
  const { isAuthenticated, showToast, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedPass, setSelectedPass] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/bookings/my');
      setActiveBooking(res.data.activeBooking || null);
      // History excluding currently active one
      const hist = res.data.bookings.filter(
        (b) => !res.data.activeBooking || b._id !== res.data.activeBooking._id
      );
      setHistory(hist);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isAuthenticated]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this breakfast pre-booking?')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      const res = await api.patch(`/bookings/${bookingId}/cancel`);
      showToast('Booking cancelled successfully.', 'info');
      fetchBookings();
      refreshUser();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-brand-100 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sign in to view your bookings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Track active breakfast passes, show counter QR codes, and see your booking history.
        </p>
        <button
          onClick={() => setTab('login')}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl text-sm transition-colors shadow-md"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Breakfast Passes</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Show your active QR pass at the designated SRM counter to collect your meal.
        </p>
      </div>

      {/* 1. ACTIVE BOOKING SECTION */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Active Today's Pass
        </h2>

        {activeBooking ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500/80 shadow-lg p-5 sm:p-6 overflow-hidden relative transition-colors">
            {/* Top status bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  Ready to Collect
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  {activeBooking.bookingId}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>{activeBooking.date}</span>
              </div>
            </div>

            {/* Meal info & actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-2">
                <VegNonVegBadge type={activeBooking.mealType} size="sm" />
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {activeBooking.mealName}
                </h3>
                
                {/* SRM Pickup Point Banner */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Pick-up Counter: {activeBooking.pickupPoint || 'Cafeteria TP1'}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                  <span>Quantity: <strong className="text-slate-900 dark:text-white">{activeBooking.quantity}</strong></span>
                  <span>•</span>
                  <span>Total: <strong className="text-brand-600 dark:text-brand-400 font-bold">₹{activeBooking.totalPrice}</strong></span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold pt-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>5 Campus Coins will be awarded upon collection</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCancelBooking(activeBooking._id)}
                  disabled={cancellingId === activeBooking._id}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-600 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400 text-xs font-bold transition-colors"
                >
                  {cancellingId === activeBooking._id ? 'Cancelling...' : 'Cancel Booking'}
                </button>

                <button
                  onClick={() => {
                    setSelectedPass(activeBooking);
                    setQrModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                >
                  <QrCode className="w-4 h-4" />
                  <span>View QR Code</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-xs">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No active breakfast pre-booking for today.</p>
            <button
              onClick={() => setTab('home')}
              className="mt-3 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              <span>Explore Today's Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. BOOKING HISTORY SECTION */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          Booking History
        </h2>

        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((booking) => {
              const isCollected = booking.status === 'Collected';
              const isCancelled = booking.status === 'Cancelled';

              return (
                <div
                  key={booking._id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      <VegNonVegBadge type={booking.mealType} showLabel={false} size="sm" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{booking.mealName}</h4>
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                          ({booking.quantity}x)
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-mono font-medium">{booking.bookingId}</span>
                        <span>•</span>
                        <span>{booking.date}</span>
                        <span>•</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">₹{booking.totalPrice}</span>
                        {booking.pickupPoint && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-amber-700 dark:text-amber-400 font-semibold">
                              <MapPin className="w-3 h-3" />
                              {booking.pickupPoint}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                    {/* Status Badge */}
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        isCollected
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : isCancelled
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {isCollected && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                      {isCancelled && <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{booking.status}</span>
                    </span>

                    {/* Coins Awarded Tag */}
                    {isCollected && booking.coinsAwarded && (
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span>🪙 +5 Coins</span>
                      </span>
                    )}

                    {/* QR Button if still pending */}
                    {booking.status === 'Pending' && (
                      <button
                        onClick={() => {
                          setSelectedPass(booking);
                          setQrModalOpen(true);
                        }}
                        className="p-2 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="View QR"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
            No past bookings found.
          </div>
        )}
      </div>

      {/* QR Modal */}
      <QrModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        data={selectedPass}
        type="booking"
      />
    </div>
  );
};

export default BookingsPage;

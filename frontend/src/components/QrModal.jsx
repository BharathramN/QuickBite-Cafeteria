import React, { useState } from 'react';
import { X, Copy, Check, Sun, Utensils, AlertCircle, MapPin } from 'lucide-react';
import VegNonVegBadge from './VegNonVegBadge';

export const QrModal = ({ isOpen, onClose, data, type = 'booking' }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const code = type === 'booking' ? data.bookingId : data.redemptionCode;

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col transition-colors">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-brand-600 to-amber-600 p-4 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-200">
            {type === 'booking' ? 'SRM Breakfast Pass' : 'Campus Reward Voucher'}
          </span>
          <h3 className="text-lg font-extrabold mt-0.5">
            {type === 'booking' ? data.mealName : data.rewardName}
          </h3>
        </div>

        {/* Boarding Pass Body */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* QR Code Container (always crisp on white canvas for scanner contrast) */}
          <div className="p-3 bg-white border-2 border-dashed border-slate-300 rounded-2xl shadow-inner mb-4 relative group">
            {data.qrCodeDataUrl ? (
              <img
                src={data.qrCodeDataUrl}
                alt="QR Code Pass"
                className="w-48 h-48 rounded-lg object-contain"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-slate-100 text-slate-400 text-sm">
                Generating QR...
              </div>
            )}
          </div>

          {/* Code & Copy button */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-full mb-3 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 tracking-wider">
              {code}
            </span>
            <button
              onClick={handleCopy}
              className="text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 p-1 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Details Box */}
          {type === 'booking' && (
            <div className="w-full bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 mb-4 text-left text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Diet Type:</span>
                <VegNonVegBadge type={data.mealType} size="sm" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Quantity:</span>
                <span className="font-bold text-slate-800 dark:text-white">{data.quantity} Meal(s)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Total Price:</span>
                <span className="font-black text-brand-700 dark:text-brand-400 text-sm">₹{data.totalPrice}</span>
              </div>

              {/* SRM Pick-up Point Indicator */}
              <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Pick-up Counter:</span>
                <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {data.pickupPoint || 'Cafeteria TP1'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md ${
                    data.status === 'Collected'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : data.status === 'Pending'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 animate-pulse'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {data.status === 'Pending' ? 'Ready to Collect' : data.status}
                </span>
              </div>
            </div>
          )}

          {/* Brightness Tip */}
          <div className="flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 w-full text-left">
            <Sun className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Turn up screen brightness so the counter scanner can read it quickly.</span>
          </div>

          {/* Earn reminder */}
          {type === 'booking' && data.status === 'Pending' && (
            <p className="mt-3 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
              ✨ You will earn <span className="font-bold">5 Campus Coins</span> when the counter marks this collected!
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-700 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrModal;

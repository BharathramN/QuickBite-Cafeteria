import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Scan, CheckCircle, AlertTriangle, KeyRound, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../services/api';

export const ScannerModal = ({ isOpen, onClose, onActionSuccess }) => {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'manual'
  const [codeType, setCodeType] = useState('booking'); // 'booking' or 'reward'
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const qrRegionId = 'quickbite-qr-scanner-region';
  const html5QrCodeRef = useRef(null);

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (e) {
        console.error('Error stopping scanner:', e);
      }
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      const scanner = new Html5Qrcode(qrRegionId);
      html5QrCodeRef.current = scanner;

      const config = { fps: 10, qrbox: { width: 220, height: 220 } };

      scanner
        .start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            // Decoded QR successfully
            handleProcessCode(decodedText);
          },
          (errorMessage) => {
            // scanning frame error (ignore continuous scan noise)
          }
        )
        .catch((err) => {
          console.warn('Camera failed to start:', err);
          setCameraError('Camera access not available or blocked. Please use Manual Input tab.');
          setActiveTab('manual');
        });

      return () => {
        stopScanner();
      };
    }
  }, [isOpen, activeTab]);

  const handleProcessCode = async (rawCode) => {
    if (!rawCode || loading) return;

    setLoading(true);
    setResult(null);

    try {
      // Determine if code or payload is for booking or reward
      let isReward = codeType === 'reward';
      if (rawCode.includes('REWARD_REDEMPTION') || rawCode.startsWith('RDM-')) {
        isReward = true;
      } else if (rawCode.includes('BREAKFAST_BOOKING') || rawCode.startsWith('QB-')) {
        isReward = false;
      }

      const endpoint = isReward ? '/admin/scan/reward' : '/admin/scan/booking';
      const res = await api.post(endpoint, { code: rawCode });

      // Trigger celebratory confetti on collection/redemption!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      setResult({
        success: true,
        isReward,
        message: res.data.message,
        data: res.data,
      });

      if (onActionSuccess) {
        onActionSuccess(res.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Verification failed';
      setResult({
        success: false,
        message: msg,
        data: err.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleProcessCode(manualCode.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Cafeteria Verification Scanner</h3>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Camera vs Manual Input */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2">
          <button
            onClick={() => {
              setResult(null);
              setActiveTab('camera');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t-xl transition-colors ${
              activeTab === 'camera'
                ? 'bg-white text-brand-600 border-t border-x border-slate-200 -mb-[1px]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Live Camera
          </button>
          <button
            onClick={() => {
              stopScanner();
              setResult(null);
              setActiveTab('manual');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t-xl transition-colors ${
              activeTab === 'manual'
                ? 'bg-white text-brand-600 border-t border-x border-slate-200 -mb-[1px]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Enter Code Manually
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col items-center">
          {/* Target Type Selector */}
          <div className="flex items-center gap-2 mb-4 bg-slate-100 p-1 rounded-xl w-full text-xs font-semibold">
            <button
              onClick={() => setCodeType('booking')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                codeType === 'booking'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600'
              }`}
            >
              🍳 Breakfast Pass (Awards +5 Coins)
            </button>
            <button
              onClick={() => setCodeType('reward')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                codeType === 'reward'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600'
              }`}
            >
              🎁 Reward Voucher
            </button>
          </div>

          {/* Active Tab View */}
          {activeTab === 'camera' ? (
            <div className="w-full flex flex-col items-center">
              <div
                id={qrRegionId}
                className="w-full h-64 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 relative shadow-inner"
              />
              <p className="text-xs text-slate-500 mt-2 text-center">
                Point student's phone QR code towards the camera frame.
              </p>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="w-full space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {codeType === 'booking' ? 'Booking Reference ID' : 'Redemption Voucher Code'}
                </label>
                <input
                  type="text"
                  placeholder={codeType === 'booking' ? 'e.g. QB-20260929-ABC12' : 'e.g. RDM-20260929-XY98'}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !manualCode.trim()}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
              >
                {loading ? 'Verifying...' : 'Verify & Confirm'}
              </button>
            </form>
          )}

          {/* Result Alert Box */}
          {result && (
            <div
              className={`mt-4 w-full p-4 rounded-2xl text-xs flex flex-col gap-1.5 animate-in fade-in duration-150 ${
                result.success
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{result.success ? 'Action Successful!' : 'Action Rejected'}</span>
              </div>
              <p className="font-medium text-slate-700 dark:text-slate-300">{result.message}</p>
              
              {result.success && result.data?.booking?.pickupPoint && (
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold bg-amber-100/70 dark:bg-amber-950/60 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                  <span>📍 Pick-up Counter: {result.data.booking.pickupPoint}</span>
                </div>
              )}

              {result.success && result.data?.coinsAwarded && (
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold mt-1 bg-emerald-100/60 dark:bg-emerald-950/60 p-2 rounded-lg">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>+5 Campus Coins added to student's account!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;

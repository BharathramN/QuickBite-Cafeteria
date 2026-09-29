import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import QrModal from '../components/QrModal';
import confetti from 'canvas-confetti';
import { Gift, Coins, Sparkles, Check, QrCode, ArrowRight, Lock, Award, History } from 'lucide-react';

export const RewardsPage = ({ setTab }) => {
  const { user, isAuthenticated, coins, showToast, refreshUser } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'my_vouchers'
  const [redeemingId, setRedeemingId] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resRewards = await api.get('/rewards');
      setRewards(resRewards.data);

      if (isAuthenticated) {
        const resRedemptions = await api.get('/rewards/my-redemptions');
        setRedemptions(resRedemptions.data);
      }
    } catch (err) {
      console.error('Failed to load rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const handleRedeem = async (reward) => {
    if (!isAuthenticated) {
      showToast('Please sign in to redeem rewards.', 'info');
      setTab('login');
      return;
    }

    if (coins < reward.coinCost) {
      showToast(`You need ${reward.coinCost - coins} more coins for this perk!`, 'error');
      return;
    }

    if (!window.confirm(`Redeem ${reward.name} for ${reward.coinCost} Campus Coins?`)) {
      return;
    }

    try {
      setRedeemingId(reward._id);
      const res = await api.post(`/rewards/${reward._id}/redeem`);
      
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });

      showToast(`🎉 Redeemed ${reward.name}! Show QR at the counter.`, 'success');
      setSelectedVoucher(res.data.redemption);
      setQrModalOpen(true);
      await refreshUser();
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to redeem reward', 'error');
    } finally {
      setRedeemingId(null);
    }
  };

  // Find next reward student can achieve
  const nextTargetReward = rewards
    .filter((r) => r.isActive && r.coinCost > coins)
    .sort((a, b) => a.coinCost - b.coinCost)[0] || null;

  // Calculate progress percentage toward next reward
  const progressPercent = nextTargetReward
    ? Math.min(100, Math.round((coins / nextTargetReward.coinCost) * 100))
    : 100;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Loading Campus Rewards Store...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      {/* 1. CAMPUS COINS HIGHLIGHT CARD */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-100 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Campus Coins Gamification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pre-Book, Collect & Earn
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-md">
              Earn <span className="font-bold underline decoration-amber-300">5 coins</span> every time you pick up your breakfast! Redeem coins for free drinks, snacks, and cafeteria upgrades.
            </p>
          </div>

          {/* Coin Counter Pill */}
          <div className="bg-black/25 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 text-amber-950 flex items-center justify-center text-3xl font-black shadow-md shadow-amber-900/20">
              🪙
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider block">
                Your Balance
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-white">{coins}</span>
                <span className="text-xs font-bold text-amber-300">Coins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar Toward Next Reward */}
        {nextTargetReward ? (
          <div className="mt-6 pt-5 border-t border-white/20 relative z-10">
            <div className="flex justify-between items-center text-xs font-bold text-amber-100 mb-2">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-300" />
                <span>Next Milestone: <strong>{nextTargetReward.name}</strong> ({nextTargetReward.coinCost} coins)</span>
              </span>
              <span>{coins} / {nextTargetReward.coinCost} ({nextTargetReward.coinCost - coins} to go)</span>
            </div>
            <div className="w-full h-3 bg-black/25 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-300 to-yellow-200 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-6 pt-5 border-t border-white/20 relative z-10 flex items-center gap-2 text-xs font-bold text-amber-100">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Incredible! You have unlocked all available rewards in the catalog!</span>
          </div>
        )}

        {/* Background glow circle */}
        <div className="absolute -right-8 -top-8 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Tabs: Rewards Catalog vs My Vouchers */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            Available Perks ({rewards.filter(r => r.isActive).length})
          </button>
          <button
            onClick={() => setActiveTab('my_vouchers')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'my_vouchers'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            My Claim Passes ({redemptions.length})
          </button>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setTab('profile')}
            className="text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline hidden sm:flex items-center gap-1"
          >
            <History className="w-3.5 h-3.5" />
            Coin Ledger History
          </button>
        )}
      </div>

      {/* TAB 1: REWARDS CATALOG */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rewards
            .filter((r) => r.isActive)
            .map((reward) => {
              const canAfford = coins >= reward.coinCost;

              return (
                <div
                  key={reward._id}
                  className={`bg-white dark:bg-slate-900 rounded-3xl border-2 transition-all p-5 flex flex-col justify-between shadow-xs overflow-hidden ${
                    canAfford
                      ? 'border-amber-400 hover:border-amber-500 hover:shadow-md'
                      : 'border-slate-200 dark:border-slate-800 opacity-90'
                  }`}
                >
                  <div>
                    {/* Image */}
                    <div className="h-36 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 relative">
                      <img
                        src={reward.imageUrl || 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80'}
                        alt={reward.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className="bg-slate-900/80 backdrop-blur-md text-amber-300 font-black text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                          <span>🪙</span>
                          <span>{reward.coinCost}</span>
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md inline-block mb-1 border border-amber-200 dark:border-amber-800">
                      {reward.category || 'Reward'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {reward.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {reward.description}
                    </p>
                  </div>

                  {/* Redeem Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={redeemingId === reward._id || !canAfford}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs hover:shadow-md active:scale-95'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? (
                        <>
                          <Gift className="w-3.5 h-3.5" />
                          <span>{redeemingId === reward._id ? 'Redeeming...' : `Redeem for ${reward.coinCost} Coins`}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Need {reward.coinCost - coins} more coins</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* TAB 2: MY CLAIM VOUCHERS */}
      {activeTab === 'my_vouchers' && (
        <div className="space-y-3">
          {redemptions.length > 0 ? (
            redemptions.map((redemption) => {
              const isClaimed = redemption.status === 'Redeemed';

              return (
                <div
                  key={redemption._id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{redemption.rewardName}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
                        Voucher: {redemption.redemptionCode}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Redeemed for {redemption.coinCost} coins • {new Date(redemption.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isClaimed
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 animate-pulse'
                      }`}
                    >
                      {isClaimed ? 'Claimed at Counter' : 'Unclaimed / Ready'}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedVoucher(redemption);
                        setQrModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Show QR</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
              You have not redeemed any rewards yet. Pre-book breakfasts to earn coins and unlock free perks!
            </div>
          )}
        </div>
      )}

      {/* QR Voucher Modal */}
      <QrModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        data={selectedVoucher}
        type="reward"
      />
    </div>
  );
};

export default RewardsPage;

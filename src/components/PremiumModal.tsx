import React, { useState } from 'react';
import {
  X,
  Check,
  RefreshCw,
} from 'lucide-react';
import { MembershipTier } from '../types/recorder';
import {
  googlePlayBilling,
  GOOGLE_PLAY_SKUS,
  PlayBillingReceipt
} from '../services/googlePlayBilling';
import { soundEffects } from '../services/soundEffects';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: MembershipTier;
  onUnlockTier: (tier: MembershipTier, receipt?: PlayBillingReceipt | null) => void;
  featureAttempted?: string | null;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  onUnlockTier,
  featureAttempted,
}) => {
  const [selectedTier, setSelectedTier] = useState<'pro_2k' | 'ultra_4k'>(
    currentTier === 'pro_2k' ? 'ultra_4k' : 'ultra_4k'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeSku = GOOGLE_PLAY_SKUS[selectedTier];

  const handleGooglePlayPurchase = async () => {
    setIsProcessing(true);
    setStatusMsg(null);
    try {
      const receipt = await googlePlayBilling.purchaseSubscription(selectedTier, 'Google Play Billing');
      soundEffects.playClipSavedSound();
      onUnlockTier(receipt.tier, receipt);
      onClose();
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Purchase was not completed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    setStatusMsg(null);
    try {
      const restored = await googlePlayBilling.restorePurchases();
      if (restored) {
        onUnlockTier(restored.tier, restored);
        soundEffects.playClipSavedSound();
        setStatusMsg(`Restored ${GOOGLE_PLAY_SKUS[restored.tier].title}.`);
      } else {
        setStatusMsg('No active subscription found.');
      }
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCancelSubscription = () => {
    googlePlayBilling.clearReceipt();
    onUnlockTier('free', null);
    setConfirmCancel(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-[#11151e] border border-white/[0.08] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <div>
            <h2 className="text-base font-semibold font-display text-white">
              ClutchClip Plans
            </h2>
            <p className="text-xs text-slate-400">
              Monthly auto-renewing via Google Play
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {featureAttempted && (
            <div className="p-3 rounded-xl bg-[#090b10] border border-white/[0.06] text-xs text-slate-300">
              <span className="font-semibold text-white">{featureAttempted}</span> requires an active Premium plan.
            </div>
          )}

          {/* Plan Selection Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* ₹29 Tier */}
            <button
              type="button"
              onClick={() => setSelectedTier('pro_2k')}
              className={`p-4 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                selectedTier === 'pro_2k'
                  ? 'bg-[#141924] border-white/40'
                  : 'bg-[#090b10] border-white/[0.06] hover:border-white/[0.15]'
              }`}
            >
              <div>
                <div className="text-xs text-slate-400 font-medium">Premium</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono-numbers text-white">₹29</span>
                  <span className="text-xs text-slate-400">/ mo</span>
                </div>
              </div>
              <ul className="mt-3 pt-3 border-t border-white/[0.05] space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-slate-300 shrink-0" />
                  <span>2K QHD · 90 FPS</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-slate-300 shrink-0" />
                  <span>No ads or watermark</span>
                </li>
              </ul>
            </button>

            {/* ₹99 Tier */}
            <button
              type="button"
              onClick={() => setSelectedTier('ultra_4k')}
              className={`p-4 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                selectedTier === 'ultra_4k'
                  ? 'bg-[#141924] border-rose-500/60'
                  : 'bg-[#090b10] border-white/[0.06] hover:border-rose-500/30'
              }`}
            >
              <div>
                <div className="text-xs text-rose-400 font-medium">Premium Plus</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono-numbers text-white">₹99</span>
                  <span className="text-xs text-slate-400">/ mo</span>
                </div>
              </div>
              <ul className="mt-3 pt-3 border-t border-white/[0.05] space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-rose-400 shrink-0" />
                  <span>4K UHD · 120 FPS</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-rose-400 shrink-0" />
                  <span>22 Mbps studio quality</span>
                </li>
              </ul>
            </button>
          </div>

          {statusMsg && (
            <div className="p-3 rounded-xl bg-[#090b10] border border-white/[0.08] text-xs text-slate-300 text-center">
              {statusMsg}
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleGooglePlayPurchase}
            disabled={isProcessing}
            className="w-full py-3 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-display font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {isProcessing ? (
              <span>Opening Google Play...</span>
            ) : (
              <span>
                {currentTier === selectedTier
                  ? `Renew ${activeSku.title} — ${activeSku.formattedPrice}`
                  : `Subscribe ${activeSku.title} — ${activeSku.formattedPrice}`}
              </span>
            )}
          </button>

          {/* Footer Controls: Restore & Cancel Subscription */}
          <div className="pt-2 border-t border-white/[0.05] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleRestorePurchases}
                disabled={isRestoring}
                className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
                <span>{isRestoring ? 'Restoring...' : 'Restore Purchase'}</span>
              </button>

              {currentTier !== 'free' && !confirmCancel && (
                <button
                  type="button"
                  onClick={() => setConfirmCancel(true)}
                  className="text-slate-400 hover:text-rose-400 font-medium transition-colors cursor-pointer"
                >
                  Cancel Subscription
                </button>
              )}
            </div>

            {currentTier !== 'free' && confirmCancel && (
              <div className="p-3 rounded-xl bg-[#090b10] border border-rose-500/25 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-300">Cancel and switch to Free?</span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCancelSubscription}
                    className="py-1 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(false)}
                    className="py-1 px-2.5 rounded-lg bg-white/[0.06] text-slate-300 text-xs cursor-pointer"
                  >
                    Keep
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

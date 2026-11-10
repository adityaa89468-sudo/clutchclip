import React, { useState } from 'react';
import {
  Check,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LogIn,
  ExternalLink,
} from 'lucide-react';
import { MembershipTier } from '../types/recorder';
import {
  googlePlayBilling,
  GOOGLE_PLAY_SKUS,
  ANDROID_PACKAGE_NAME,
  PlayBillingReceipt
} from '../services/googlePlayBilling';
import { User, fetchUserSubscriptionFromFirestore } from '../services/firebase';
import { soundEffects } from '../services/soundEffects';

interface PremiumComparisonViewProps {
  currentTier: MembershipTier;
  tierExpiresAt?: number | null;
  playReceipt?: PlayBillingReceipt | null;
  currentUser: User | null;
  onRequireGoogleSignIn: () => Promise<User | null>;
  onUnlockTier: (tier: MembershipTier, receipt?: PlayBillingReceipt | null, signedInUser?: User | null) => void;
}

const COMPARISON_ROWS: Array<{
  feature: string;
  free: string | boolean;
  pro29: string | boolean;
  ultra99: string | boolean;
}> = [
  {
    feature: 'Monthly Price',
    free: '₹0',
    pro29: '₹29 / month',
    ultra99: '₹99 / month',
  },
  {
    feature: 'Max Video Resolution',
    free: '1080p Full HD',
    pro29: '2K QHD (1440p)',
    ultra99: '4K UHD (2160p)',
  },
  {
    feature: 'Max Frame Rate',
    free: '60 FPS',
    pro29: '90 FPS',
    ultra99: '120 FPS',
  },
  {
    feature: 'Video Bitrate',
    free: '6.5 Mbps',
    pro29: '12.0 Mbps',
    ultra99: '22.0 Mbps',
  },
  {
    feature: '5-Minute Replay Buffer',
    free: true,
    pro29: true,
    ultra99: true,
  },
  {
    feature: 'Ad-Free Experience',
    free: false,
    pro29: true,
    ultra99: true,
  },
  {
    feature: 'Hide Logo in Saved Clips',
    free: false,
    pro29: true,
    ultra99: true,
  },
  {
    feature: 'Custom Brand Logo',
    free: false,
    pro29: true,
    ultra99: true,
  },
];

export const PremiumComparisonView: React.FC<PremiumComparisonViewProps> = ({
  currentTier,
  tierExpiresAt,
  playReceipt,
  currentUser,
  onRequireGoogleSignIn,
  onUnlockTier,
}) => {
  const [processingTier, setProcessingTier] = useState<'pro_2k' | 'ultra_4k' | null>(null);
  const [pendingSignInTier, setPendingSignInTier] = useState<'pro_2k' | 'ultra_4k' | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [latestReceipt, setLatestReceipt] = useState<PlayBillingReceipt | null>(playReceipt || null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isErrorStatus, setIsErrorStatus] = useState(false);

  const daysRemaining =
    tierExpiresAt && tierExpiresAt > Date.now()
      ? Math.max(1, Math.ceil((tierExpiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

  const executePlanActivation = async (tierToBuy: 'pro_2k' | 'ultra_4k', verifiedUser: User) => {
    setProcessingTier(tierToBuy);
    setStatusMessage(null);
    setIsErrorStatus(false);
    setConfirmCancel(false);
    try {
      const isNativeApkBilling =
        typeof window !== 'undefined' && Boolean(window.ClutchClipAndroid?.purchaseSubscription);

      if (!isNativeApkBilling) {
        const existingRecord = await fetchUserSubscriptionFromFirestore(verifiedUser);
        if (
          existingRecord &&
          existingRecord.tier === tierToBuy &&
          existingRecord.expiresAtMs > Date.now() &&
          currentTier !== tierToBuy
        ) {
          const sku = GOOGLE_PLAY_SKUS[tierToBuy];
          const restoredReceipt: PlayBillingReceipt = {
            orderId: existingRecord.orderId || 'GPA.VERIFIED-ACCOUNT',
            packageName: ANDROID_PACKAGE_NAME,
            productId: existingRecord.productId || sku.itemId,
            basePlanId: sku.basePlanId,
            tier: tierToBuy,
            purchaseTime: Date.now(),
            expiresAt: existingRecord.expiresAtMs,
            purchaseToken: `verified_${verifiedUser.uid}`,
            paymentMethod: existingRecord.paymentMethod || 'Google Play Billing',
            amountPaid: existingRecord.amountPaid || sku.formattedPrice,
            acknowledged: true,
            autoRenewing: true,
          };
          setLatestReceipt(restoredReceipt);
          soundEffects.playClipSavedSound();
          onUnlockTier(tierToBuy, restoredReceipt, verifiedUser);
          setStatusMessage(
            `Verified existing ${sku.title} on ${verifiedUser.email}.`
          );
          return;
        }
      }

      const receipt = await googlePlayBilling.purchaseSubscription(tierToBuy, 'Google Play Billing');
      setLatestReceipt(receipt);
      soundEffects.playClipSavedSound();
      onUnlockTier(receipt.tier, receipt, verifiedUser);
      setStatusMessage(
        `Activated ${GOOGLE_PLAY_SKUS[receipt.tier].title} (${receipt.basePlanId || GOOGLE_PLAY_SKUS[receipt.tier].basePlanId}) for ${verifiedUser.email}.`
      );
    } catch (err) {
      setIsErrorStatus(true);
      setStatusMessage(
        err instanceof Error ? err.message : 'Could not complete Google Play subscription.'
      );
    } finally {
      setProcessingTier(null);
    }
  };

  const handleClickActivatePlan = async (tierToBuy: 'pro_2k' | 'ultra_4k') => {
    if (processingTier !== null || isSigningIn) return;
    if (!currentUser) {
      setPendingSignInTier(tierToBuy);
      return;
    }
    await executePlanActivation(tierToBuy, currentUser);
  };

  const handleSignInAndActivate = async () => {
    if (!pendingSignInTier) return;
    setIsSigningIn(true);
    setStatusMessage(null);
    setIsErrorStatus(false);
    try {
      const signedInUser = await onRequireGoogleSignIn();
      if (signedInUser) {
        const targetTier = pendingSignInTier;
        setPendingSignInTier(null);
        await executePlanActivation(targetTier, signedInUser);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleConfirmCancelSubscription = () => {
    googlePlayBilling.clearReceipt();
    setLatestReceipt(null);
    setConfirmCancel(false);
    setIsErrorStatus(false);
    onUnlockTier('free', null, currentUser);
    setStatusMessage('Subscription cancelled. You are now on the Free plan.');
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    setStatusMessage(null);
    setIsErrorStatus(false);
    setConfirmCancel(false);
    try {
      let activeUser = currentUser;
      if (!activeUser) {
        activeUser = await onRequireGoogleSignIn();
        if (!activeUser) return;
      }

      const restored = await googlePlayBilling.restorePurchases();
      if (restored) {
        setLatestReceipt(restored);
        onUnlockTier(restored.tier, restored, activeUser);
        soundEffects.playClipSavedSound();
        setStatusMessage(`Restored active Google Play plan for ${activeUser.email}.`);
        return;
      }

      const cloudSub = await fetchUserSubscriptionFromFirestore(activeUser);
      if (cloudSub && cloudSub.tier !== 'free' && cloudSub.expiresAtMs > Date.now()) {
        const sku = GOOGLE_PLAY_SKUS[cloudSub.tier];
        const restoredReceipt: PlayBillingReceipt = {
          orderId: cloudSub.orderId || 'GPA.CLOUD-RESTORED',
          packageName: ANDROID_PACKAGE_NAME,
          productId: cloudSub.productId || sku.itemId,
          basePlanId: sku.basePlanId,
          tier: cloudSub.tier,
          purchaseTime: Date.now(),
          expiresAt: cloudSub.expiresAtMs,
          purchaseToken: `cloud_${activeUser.uid}`,
          paymentMethod: cloudSub.paymentMethod,
          amountPaid: cloudSub.amountPaid,
          acknowledged: true,
          autoRenewing: true,
        };
        setLatestReceipt(restoredReceipt);
        onUnlockTier(cloudSub.tier, restoredReceipt, activeUser);
        soundEffects.playClipSavedSound();
        setStatusMessage(`Restored ${cloudSub.tier === 'ultra_4k' ? 'Premium Plus' : 'Premium'} for ${activeUser.email}.`);
        return;
      }

      setIsErrorStatus(true);
      setStatusMessage(`No active subscription found for ${activeUser.email}.`);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 pb-10 select-none">
      {/* Header Card */}
      <div className="p-6 rounded-2xl bg-[#11151e] border border-white/[0.06] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-semibold font-display text-white tracking-tight">
              ClutchClip Plans
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Unlock 2K/4K high-refresh recording, remove all ads, and hide the watermark in saved video clips.
            </p>
          </div>

          {currentTier !== 'free' && (
            <div className="text-left sm:text-right shrink-0">
              <div className="text-xs font-semibold text-emerald-400">
                {currentTier === 'ultra_4k' ? 'Premium Plus Active' : 'Premium Active'}
              </div>
              {daysRemaining && (
                <div className="text-xs font-mono-numbers text-slate-400 mt-0.5">
                  {daysRemaining} days remaining
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active Subscription Management & Cancel Option */}
        {currentTier !== 'free' && (
          <div className="pt-4 border-t border-white/[0.06]">
            {!confirmCancel ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  Current plan:{' '}
                  <span className="text-white font-medium">
                    {currentTier === 'ultra_4k'
                      ? 'Premium Plus (₹99/mo · monthly-ultra-4k)'
                      : 'Premium (₹29/mo · monthly-pro-2k)'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => googlePlayBilling.openManageSubscriptions(currentTier)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Google Play Subscriptions</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(true)}
                    className="py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-rose-500/15 border border-white/[0.08] hover:border-rose-500/30 text-slate-300 hover:text-rose-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#090b10] border border-rose-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-white">
                    Cancel your active subscription?
                  </div>
                  <div className="text-xs text-slate-400">
                    Your account will immediately switch back to the Free plan (1080p · 60 FPS).
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleConfirmCancelSubscription}
                    className="py-1.5 px-3.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Confirm Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(false)}
                    className="py-1.5 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Keep Plan
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 1 Prompt when not signed in */}
      {pendingSignInTier && !currentUser && (
        <div className="p-5 rounded-2xl bg-[#11151e] border border-white/[0.12] space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Sign in with Google to continue
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Link your {pendingSignInTier === 'ultra_4k' ? 'Premium Plus (₹99)' : 'Premium (₹29)'} subscription to your Google account.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPendingSignInTier(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={handleSignInAndActivate}
              disabled={isSigningIn}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>
                {isSigningIn
                  ? 'Signing in...'
                  : `Continue with Google · ${pendingSignInTier === 'ultra_4k' ? '₹99' : '₹29'}`}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPendingSignInTier(null)}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl bg-[#11151e] border text-xs flex items-center justify-between gap-2 ${
            isErrorStatus
              ? 'border-rose-500/30 text-rose-300'
              : 'border-emerald-500/30 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {isErrorStatus ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{statusMessage}</span>
          </div>
          {latestReceipt && !isErrorStatus && (
            <span className="text-xs font-mono-numbers text-slate-400 shrink-0">
              {latestReceipt.orderId}
            </span>
          )}
        </div>
      )}

      {/* 2 Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
        {/* Plan 1: Premium ₹29 (clutchclip_pro_2k_90fps_monthly / monthly-pro-2k) */}
        <div
          className={`p-5 rounded-2xl border transition-colors flex flex-col justify-between ${
            currentTier === 'pro_2k'
              ? 'border-white/30 bg-[#141924]'
              : 'border-white/[0.06] bg-[#11151e] hover:border-white/[0.15]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>2K QHD · 90 FPS</span>
              <span className="font-mono-numbers">Monthly · auto-renewing</span>
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold font-display text-white">Premium</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono-numbers text-white">₹29</span>
                <span className="text-xs text-slate-400">/ mo</span>
              </div>
            </div>

            <ul className="mt-4 pt-4 border-t border-white/[0.05] space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span>2K QHD (2560×1440) resolution</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span>90 FPS high-refresh capture</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span>Hide watermark in saved videos</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span>Ad-free experience</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={() => handleClickActivatePlan('pro_2k')}
              disabled={processingTier !== null}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-950 font-display font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {processingTier === 'pro_2k' ? (
                <span>Opening Google Play...</span>
              ) : currentTier === 'pro_2k' ? (
                <span>Active · Renew ₹29</span>
              ) : (
                <span>Choose Premium — ₹29</span>
              )}
            </button>

            {currentTier === 'pro_2k' && (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 text-slate-400 hover:text-rose-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {/* Plan 2: Premium Plus ₹99 (clutchclip_ultra_4k_120fps_monthly / monthly-ultra-4k) */}
        <div
          className={`p-5 rounded-2xl border transition-colors flex flex-col justify-between ${
            currentTier === 'ultra_4k'
              ? 'border-rose-500/60 bg-[#141924]'
              : 'border-rose-500/25 bg-[#11151e] hover:border-rose-500/50'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs text-rose-400">
              <span>4K UHD · 120 FPS</span>
              <span className="font-mono-numbers text-slate-400">Monthly · auto-renewing</span>
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold font-display text-white">Premium Plus</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono-numbers text-white">₹99</span>
                <span className="text-xs text-slate-400">/ mo</span>
              </div>
            </div>

            <ul className="mt-4 pt-4 border-t border-white/[0.05] space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Full 4K UHD (3840×2160) resolution</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>120 FPS ultra-refresh capture</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>22 Mbps studio bitrate</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Ad-free + hidden video watermark</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={() => handleClickActivatePlan('ultra_4k')}
              disabled={processingTier !== null}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-display font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {processingTier === 'ultra_4k' ? (
                <span>Opening Google Play...</span>
              ) : currentTier === 'ultra_4k' ? (
                <span>Active · Renew ₹99</span>
              ) : (
                <span>Choose Premium Plus — ₹99</span>
              )}
            </button>

            {currentTier === 'ultra_4k' && (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 text-slate-400 hover:text-rose-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Clean Comparison Table */}
      <div className="rounded-2xl bg-[#11151e] border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">Plan Comparison</h3>
          <button
            type="button"
            onClick={handleRestore}
            disabled={isRestoring}
            className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
            <span>{isRestoring ? 'Restoring...' : 'Restore Purchase'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.05] text-slate-400">
                <th className="py-3 px-4 font-medium">Feature</th>
                <th className="py-3 px-4 font-medium">Free</th>
                <th className="py-3 px-4 font-medium text-white">Premium</th>
                <th className="py-3 px-4 font-medium text-rose-400">Premium Plus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature}>
                  <td className="py-3 px-4 text-slate-300">{row.feature}</td>
                  <td className="py-3 px-4 font-mono-numbers text-slate-400">
                    {typeof row.free === 'boolean' ? (
                      row.free ? <Check className="w-4 h-4 text-slate-300" /> : <X className="w-4 h-4 text-slate-600" />
                    ) : (
                      row.free
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono-numbers text-slate-200">
                    {typeof row.pro29 === 'boolean' ? (
                      row.pro29 ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-slate-600" />
                    ) : (
                      row.pro29
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono-numbers text-slate-200">
                    {typeof row.ultra99 === 'boolean' ? (
                      row.ultra99 ? <Check className="w-4 h-4 text-rose-400" /> : <X className="w-4 h-4 text-slate-600" />
                    ) : (
                      row.ultra99
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

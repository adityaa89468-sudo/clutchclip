import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Check,
  Zap,
  Lock,
  Calendar,
  Clock,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Receipt,
  LogIn,
  UserCheck
} from 'lucide-react';
import { MembershipTier } from '../types/recorder';
import { soundEffects } from '../services/soundEffects';
import {
  googlePlayBilling,
  GOOGLE_PLAY_SKUS,
  ANDROID_PACKAGE_NAME,
  PlayBillingReceipt
} from '../services/googlePlayBilling';
import { User, fetchUserSubscriptionFromFirestore } from '../services/firebase';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockTier: (tier: MembershipTier, receipt?: PlayBillingReceipt | null, signedInUser?: User | null) => void;
  currentTier: MembershipTier;
  tierExpiresAt?: number | null;
  targetFeature?: string;
  currentUser: User | null;
  onRequireGoogleSignIn: () => Promise<User | null>;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  onUnlockTier,
  currentTier,
  tierExpiresAt,
  targetFeature,
  currentUser,
  onRequireGoogleSignIn,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'pro_2k' | 'ultra_4k'>(
    targetFeature?.includes('4K') || targetFeature?.includes('120') ? 'ultra_4k' : 'pro_2k'
  );
  const [processingPlan, setProcessingPlan] = useState<'pro_2k' | 'ultra_4k' | null>(null);
  const [pendingSignInPlan, setPendingSignInPlan] = useState<'pro_2k' | 'ultra_4k' | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<PlayBillingReceipt | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProcessingPlan(null);
      setPendingSignInPlan(null);
      setCompletedReceipt(null);
      setStatusNote(null);
      if (targetFeature?.includes('4K') || targetFeature?.includes('120')) {
        setSelectedPlan('ultra_4k');
      } else if (targetFeature?.includes('2K') || targetFeature?.includes('90')) {
        setSelectedPlan('pro_2k');
      }
    }
  }, [isOpen, targetFeature]);

  if (!isOpen) return null;

  const executePlanActivation = async (plan: 'pro_2k' | 'ultra_4k', verifiedUser: User) => {
    setSelectedPlan(plan);
    setProcessingPlan(plan);
    setStatusNote(null);
    try {
      // Check if this Google account already bought a valid premium plan in Firestore
      const existingRecord = await fetchUserSubscriptionFromFirestore(verifiedUser);
      if (
        existingRecord &&
        existingRecord.tier === plan &&
        existingRecord.expiresAtMs > Date.now()
      ) {
        const restoredReceipt: PlayBillingReceipt = {
          orderId: existingRecord.orderId || 'GPA.VERIFIED-ACCOUNT',
          packageName: ANDROID_PACKAGE_NAME,
          productId: existingRecord.productId || GOOGLE_PLAY_SKUS[plan].itemId,
          tier: plan,
          purchaseTime: Date.now(),
          expiresAt: existingRecord.expiresAtMs,
          purchaseToken: `verified_${verifiedUser.uid}`,
          paymentMethod: existingRecord.paymentMethod || 'Google Play Billing',
          amountPaid: existingRecord.amountPaid || GOOGLE_PLAY_SKUS[plan].formattedPrice,
          acknowledged: true,
          autoRenewing: true,
        };
        setCompletedReceipt(restoredReceipt);
        soundEffects.playClipSavedSound();
        onUnlockTier(plan, restoredReceipt, verifiedUser);
        setStatusNote(
          `Verified existing ${GOOGLE_PLAY_SKUS[plan].title} on ${verifiedUser.email}!`
        );
        return;
      }

      await new Promise((r) => setTimeout(r, 600));
      const receipt = await googlePlayBilling.purchaseSubscription(plan, 'Google Play Billing');
      setCompletedReceipt(receipt);
      soundEffects.playClipSavedSound();
      onUnlockTier(plan, receipt, verifiedUser);
      setStatusNote(
        `Activated via Google Play Billing for ${verifiedUser.email}!`
      );
    } finally {
      setProcessingPlan(null);
    }
  };

  // When user clicks on Activate Plan: Firstly ask user to sign in via Google if not signed in
  const handleClickActivatePlan = async (plan: 'pro_2k' | 'ultra_4k') => {
    setSelectedPlan(plan);
    if (processingPlan || isSigningIn) return;

    if (!currentUser) {
      setPendingSignInPlan(plan);
      return;
    }

    await executePlanActivation(plan, currentUser);
  };

  const handleSignInAndActivate = async () => {
    if (!pendingSignInPlan) return;
    setIsSigningIn(true);
    setStatusNote(null);
    try {
      const signedInUser = await onRequireGoogleSignIn();
      if (signedInUser) {
        const targetPlan = pendingSignInPlan;
        setPendingSignInPlan(null);
        await executePlanActivation(targetPlan, signedInUser);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Restore purchases from Google Play Billing & Firestore
  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    setStatusNote(null);
    try {
      let activeUser = currentUser;
      if (!activeUser) {
        activeUser = await onRequireGoogleSignIn();
        if (!activeUser) return;
      }

      const cloudSub = await fetchUserSubscriptionFromFirestore(activeUser);
      if (cloudSub && cloudSub.tier !== 'free' && cloudSub.expiresAtMs > Date.now()) {
        const restoredReceipt: PlayBillingReceipt = {
          orderId: cloudSub.orderId || 'GPA.CLOUD-RESTORED',
          packageName: ANDROID_PACKAGE_NAME,
          productId: cloudSub.productId,
          tier: cloudSub.tier,
          purchaseTime: Date.now(),
          expiresAt: cloudSub.expiresAtMs,
          purchaseToken: `cloud_${activeUser.uid}`,
          paymentMethod: cloudSub.paymentMethod,
          amountPaid: cloudSub.amountPaid,
          acknowledged: true,
          autoRenewing: true,
        };
        setCompletedReceipt(restoredReceipt);
        onUnlockTier(cloudSub.tier, restoredReceipt, activeUser);
        soundEffects.playClipSavedSound();
        setStatusNote(`Verified active subscription for ${activeUser.email}`);
        return;
      }

      const restored = await googlePlayBilling.restorePurchases();
      if (restored) {
        onUnlockTier(restored.tier, restored, activeUser);
        soundEffects.playClipSavedSound();
        setStatusNote(`Restored active subscription for ${activeUser.email}`);
      } else {
        setStatusNote(`No active Google Play subscriptions found on ${activeUser.email}.`);
      }
    } finally {
      setIsRestoring(false);
    }
  };

  // Calculate remaining days if membership is active
  const daysRemaining =
    tierExpiresAt && tierExpiresAt > Date.now()
      ? Math.max(1, Math.ceil((tierExpiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

  const formattedExpiryDate =
    tierExpiresAt && tierExpiresAt > Date.now()
      ? new Date(tierExpiresAt).toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.15)] flex flex-col max-h-[94vh]">
        {/* Glow accent */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-500 flex items-center justify-center text-slate-950 shadow-md">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base font-bold font-display text-white">
                  Google Play Billing Plans
                </h2>
                {currentUser ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <UserCheck className="w-2.5 h-2.5" />
                    {currentUser.email}
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase">
                    Google Sign-In Verified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Instant unlock · Google Play Billing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-5 py-2 overflow-y-auto space-y-3.5 relative z-10 text-left">
          {/* Step 1 Prompt when user clicks Activate Plan while signed out */}
          {pendingSignInPlan && !currentUser && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/90 via-slate-900 to-slate-950 border-2 border-sky-500/60 shadow-xl space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  Step 1 of 2 · Google Sign-In Required
                </span>
                <button
                  type="button"
                  onClick={() => setPendingSignInPlan(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs font-bold text-white">
                Sign in with Google to Activate{' '}
                {pendingSignInPlan === 'ultra_4k' ? 'Premium Plus (₹99 · 4K + 120 FPS)' : 'Premium (₹29 · 2K + 90 FPS)'}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Please sign in with your Google account first so we can check if your account already has an active subscription and link your purchase to your profile.
              </p>
              <button
                type="button"
                onClick={handleSignInAndActivate}
                disabled={isSigningIn}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-display font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-600" />
                <span>
                  {isSigningIn
                    ? 'Signing in with Google...'
                    : `Sign in with Google & Activate ${pendingSignInPlan === 'ultra_4k' ? 'Premium Plus (₹99)' : 'Premium (₹29)'}`}
                </span>
              </button>
            </div>
          )}

          {/* Active Subscription Status Banner if already subscribed */}
          {currentTier !== 'free' && daysRemaining && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">
                    {currentTier === 'ultra_4k'
                      ? 'Google Play: Premium Plus (₹99 · 4K + 120 FPS) Active'
                      : 'Google Play: Premium (₹29 · 2K + 90 FPS) Active'}
                  </div>
                  <div className="text-[10px] text-emerald-300/90">
                    Valid until {formattedExpiryDate} ({daysRemaining} days remaining)
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono-numbers text-[10px] font-bold">
                Active
              </span>
            </div>
          )}

          {/* Target feature callout banner */}
          {targetFeature && (
            <div className="py-2 px-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-200">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>{targetFeature}</strong> requires a 1-Month Google Play subscription.
              </span>
            </div>
          )}

          {/* Tier 0: Free Tier Breakdown (Available to Everyone) */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-200">Free User Plan</span>
                <span className="text-[9px] font-bold py-0.5 px-2 rounded-full bg-slate-800 text-amber-300 uppercase">
                  Uses Banner &amp; App Open Ads
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                1080p Full HD · 60 FPS · 5-Min Buffer · Logo in recorded video · Ad-Supported
              </div>
            </div>
            <div className="text-right shrink-0 pl-3">
              <span className="text-sm font-bold text-white font-mono-numbers">₹0</span>
              <div className="text-[9px] text-emerald-400 font-semibold">Free Forever</div>
            </div>
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Click Activate Plan (Google Sign-In + Play Billing)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono-numbers flex items-center gap-1 normal-case">
              <Calendar className="w-3 h-3 text-emerald-400" />
              1 Month (30 Days)
            </span>
          </div>

          {/* Tier 1: ₹29 Premium -> 2K + 90 FPS for 1 Month */}
          <div
            onClick={() => handleClickActivatePlan('pro_2k')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
              selectedPlan === 'pro_2k'
                ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-950/20'
                : 'border-slate-800 bg-slate-900/60 hover:border-amber-400/60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold py-0.5 px-2 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wide">
                    PREMIUM · 2K + 90 FPS
                  </span>
                </div>
                <div className="flex items-baseline gap-2 pt-0.5">
                  <span className="text-base font-black font-display text-white">Premium</span>
                  <span className="text-2xl font-extrabold font-mono-numbers text-amber-300 tracking-tight">₹29</span>
                  <span className="text-xs text-amber-300 font-semibold">/ 1 Month (30 Days)</span>
                </div>
              </div>

              <div
                className={`px-2.5 py-1 rounded-xl text-[10px] font-display font-black flex items-center gap-1 shrink-0 ${
                  processingPlan === 'pro_2k'
                    ? 'bg-amber-400 text-slate-950'
                    : currentTier === 'pro_2k'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-400 text-slate-950'
                }`}
              >
                {processingPlan === 'pro_2k' ? (
                  <>
                    <Sparkles className="w-3 h-3 animate-spin" />
                    <span>Google Play...</span>
                  </>
                ) : currentTier === 'pro_2k' ? (
                  <>
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Premium Active</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                    <span>Activate Premium (₹29)</span>
                  </>
                )}
              </div>
            </div>

            <ul className="mt-3 space-y-1.5 text-[11px] text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  <strong>2K Resolution (1440p Quad-HD)</strong> + <strong>90 FPS</strong> unlocked for <strong>1 Month</strong>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  <strong>12 Mbps High-Bitrate</strong> esports smooth frame capture
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  <strong>Hide Logo in Recorded Video</strong> (Logo stays visible on screen)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Remove All Ads for Premium User</strong> (No Banner or App Open Ads)
                </span>
              </li>
            </ul>
          </div>

          {/* Tier 2: ₹99 Premium Plus -> 4K + 120 FPS for 1 Month */}
          <div
            onClick={() => handleClickActivatePlan('ultra_4k')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
              selectedPlan === 'ultra_4k'
                ? 'border-rose-500 bg-gradient-to-br from-rose-500/15 via-amber-500/10 to-slate-900 shadow-xl shadow-rose-950/30'
                : 'border-slate-800 bg-slate-900/60 hover:border-rose-500/60'
            }`}
          >
            <div className="absolute top-0 right-0 bg-gradient-to-l from-rose-600 to-amber-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl tracking-wider shadow">
              PREMIUM PLUS
            </div>

            <div className="flex items-start justify-between pt-1">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold py-0.5 px-2 rounded-full bg-rose-500 text-white uppercase tracking-wide">
                    PREMIUM PLUS · 4K + 120 FPS
                  </span>
                </div>
                <div className="flex items-baseline gap-2 pt-0.5">
                  <span className="text-base font-black font-display text-white">Premium Plus</span>
                  <span className="text-2xl font-extrabold font-mono-numbers text-rose-300 tracking-tight">₹99</span>
                  <span className="text-xs text-rose-300 font-semibold">/ 1 Month (30 Days)</span>
                </div>
              </div>

              <div
                className={`px-2.5 py-1 rounded-xl text-[10px] font-display font-black flex items-center gap-1 shrink-0 ${
                  processingPlan === 'ultra_4k'
                    ? 'bg-rose-500 text-white'
                    : currentTier === 'ultra_4k'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-gradient-to-r from-rose-600 to-amber-500 text-white'
                }`}
              >
                {processingPlan === 'ultra_4k' ? (
                  <>
                    <Sparkles className="w-3 h-3 animate-spin" />
                    <span>Google Play...</span>
                  </>
                ) : currentTier === 'ultra_4k' ? (
                  <>
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Premium Plus Active</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                    <span>Activate Premium Plus (₹99)</span>
                  </>
                )}
              </div>
            </div>

            <ul className="mt-3 space-y-1.5 text-[11px] text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>
                  <strong>Full 4K Ultra-HD (2160p)</strong> + <strong>120 FPS</strong> recording unlocked for <strong>1 Month</strong>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>
                  <strong>All Premium (2K + 90 FPS) Features Included</strong> for 30 days
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>
                  <strong>Hide Logo in Recorded Video</strong> (Logo stays visible on screen)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Remove All Ads for Premium Plus User</strong> (No Banner or App Open Ads)
                </span>
              </li>
            </ul>
          </div>

          {statusNote && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{statusNote}</span>
              </div>
              {completedReceipt && (
                <span className="text-[10px] font-semibold text-emerald-200 flex items-center gap-1 shrink-0">
                  <Receipt className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions: Restore Purchases & Free Reset */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 px-1">
            <button
              type="button"
              onClick={handleRestorePurchases}
              disabled={isRestoring}
              className="hover:text-emerald-400 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isRestoring ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isRestoring ? 'Checking Google Account...' : 'Verify / Restore Google Play Purchases'}</span>
            </button>

            {currentTier !== 'free' && (
              <button
                type="button"
                onClick={() => {
                  googlePlayBilling.clearReceipt();
                  onUnlockTier('free', null, currentUser);
                  onClose();
                }}
                className="hover:text-rose-400 underline underline-offset-2 cursor-pointer"
              >
                Cancel / Switch to Free Tier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

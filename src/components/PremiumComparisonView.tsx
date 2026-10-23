import React, { useState } from 'react';
import {
  Crown,
  Check,
  X,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Receipt,
  Clock,
  UserCheck,
  LogIn
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
  highlight?: boolean;
}> = [
  {
    feature: 'Monthly Price',
    free: '₹0 (Free Forever)',
    pro29: '₹29 / 1 Month',
    ultra99: '₹99 / 1 Month',
    highlight: true,
  },
  {
    feature: 'Max Video Resolution',
    free: '1080p Full HD',
    pro29: '2K QHD (1440p)',
    ultra99: '4K UHD (2160p)',
    highlight: true,
  },
  {
    feature: 'Max Frame Rate (FPS)',
    free: '60 FPS',
    pro29: '90 FPS Esports',
    ultra99: '120 FPS Ultra',
    highlight: true,
  },
  {
    feature: 'Target Video Bitrate',
    free: '6.5 Mbps',
    pro29: '12.0 Mbps',
    ultra99: '22.0 Mbps Studio',
  },
  {
    feature: '5-Min Rolling Replay Buffer',
    free: true,
    pro29: true,
    ultra99: true,
  },
  {
    feature: 'Audio Recording (Game Only · Mic Only · Game + Mic)',
    free: true,
    pro29: true,
    ultra99: true,
  },
  {
    feature: 'Ad-Free Experience (Remove All Ads)',
    free: 'Ads Active (Free User)',
    pro29: '100% Ad-Free (Ads Removed)',
    ultra99: '100% Ad-Free (Ads Removed)',
    highlight: true,
  },
  {
    feature: 'Google Banner Ads',
    free: 'Used for Free Users',
    pro29: 'Removed for Premium',
    ultra99: 'Removed for Premium Plus',
    highlight: true,
  },
  {
    feature: 'Google App Open Ads',
    free: 'Used for Free Users',
    pro29: 'Removed for Premium',
    ultra99: 'Removed for Premium Plus',
    highlight: true,
  },
  {
    feature: 'Hide Logo in Recorded Video (Kept on Screen)',
    free: 'Logo in Recorded Video',
    pro29: 'Hidden in Video (Shown on Screen)',
    ultra99: 'Hidden in Video (Shown on Screen)',
    highlight: true,
  },
  {
    feature: 'Custom Clan / Brand Logo',
    free: false,
    pro29: true,
    ultra99: true,
  },
  {
    feature: 'Adaptive Low Power Mode',
    free: true,
    pro29: true,
    ultra99: true,
  },
  {
    feature: '120Hz High-Refresh Encoder',
    free: false,
    pro29: false,
    ultra99: true,
  },
  {
    feature: 'Plan Validity',
    free: 'Unlimited (Ad-Supported)',
    pro29: '30 Days (1 Month)',
    ultra99: '30 Days (1 Month)',
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
  const [latestReceipt, setLatestReceipt] = useState<PlayBillingReceipt | null>(playReceipt || null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const daysRemaining =
    tierExpiresAt && tierExpiresAt > Date.now()
      ? Math.max(1, Math.ceil((tierExpiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

  // Execute Google Play Billing activation once user is signed in with Google
  const executePlanActivation = async (tierToBuy: 'pro_2k' | 'ultra_4k', verifiedUser: User) => {
    setProcessingTier(tierToBuy);
    setStatusMessage(null);
    try {
      // First check if this Google account already bought a valid premium plan in Firestore
      const existingRecord = await fetchUserSubscriptionFromFirestore(verifiedUser);
      if (
        existingRecord &&
        existingRecord.tier === tierToBuy &&
        existingRecord.expiresAtMs > Date.now()
      ) {
        const restoredReceipt: PlayBillingReceipt = {
          orderId: existingRecord.orderId || 'GPA.VERIFIED-ACCOUNT',
          packageName: ANDROID_PACKAGE_NAME,
          productId: existingRecord.productId || GOOGLE_PLAY_SKUS[tierToBuy].itemId,
          tier: tierToBuy,
          purchaseTime: Date.now(),
          expiresAt: existingRecord.expiresAtMs,
          purchaseToken: `verified_${verifiedUser.uid}`,
          paymentMethod: existingRecord.paymentMethod || 'Google Play Billing',
          amountPaid: existingRecord.amountPaid || GOOGLE_PLAY_SKUS[tierToBuy].formattedPrice,
          acknowledged: true,
          autoRenewing: true,
        };
        setLatestReceipt(restoredReceipt);
        soundEffects.playClipSavedSound();
        onUnlockTier(tierToBuy, restoredReceipt, verifiedUser);
        setStatusMessage(
          `Verified existing ${GOOGLE_PLAY_SKUS[tierToBuy].title} on ${verifiedUser.email}!`
        );
        return;
      }

      const sku = GOOGLE_PLAY_SKUS[tierToBuy];
      await new Promise((r) => setTimeout(r, 550));
      const receipt = await googlePlayBilling.purchaseSubscription(tierToBuy, 'Google Play Billing');
      setLatestReceipt(receipt);
      soundEffects.playClipSavedSound();
      onUnlockTier(tierToBuy, receipt, verifiedUser);
      setStatusMessage(
        `Activated ${sku.title} for ${verifiedUser.email} via Google Play Billing!`
      );
    } finally {
      setProcessingTier(null);
    }
  };

  // When user clicks on Activate Plan: Firstly ask user to sign in via Google if not signed in
  const handleClickActivatePlan = async (tierToBuy: 'pro_2k' | 'ultra_4k') => {
    if (processingTier !== null || isSigningIn) return;

    if (!currentUser) {
      // Prompt user to sign in via Google first so we can check/link which user bought premium
      setPendingSignInTier(tierToBuy);
      return;
    }

    await executePlanActivation(tierToBuy, currentUser);
  };

  // Handle Google Sign-In from the prompt and then check/activate the selected plan
  const handleSignInAndActivate = async () => {
    if (!pendingSignInTier) return;
    setIsSigningIn(true);
    setStatusMessage(null);
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

  const handleRestore = async () => {
    setIsRestoring(true);
    setStatusMessage(null);
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
        setLatestReceipt(restoredReceipt);
        onUnlockTier(cloudSub.tier, restoredReceipt, activeUser);
        soundEffects.playClipSavedSound();
        setStatusMessage(`Verified & restored ${cloudSub.tier === 'ultra_4k' ? 'Premium Plus' : 'Premium'} for ${activeUser.email}`);
        return;
      }

      const restored = await googlePlayBilling.restorePurchases();
      if (restored) {
        setLatestReceipt(restored);
        onUnlockTier(restored.tier, restored, activeUser);
        soundEffects.playClipSavedSound();
        setStatusMessage(`Restored active Google Play plan for ${activeUser.email}`);
      } else {
        setStatusMessage(`No active premium subscription found for ${activeUser.email}.`);
      }
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 pb-10 select-none">
      {/* Hero Banner */}
      <div className="p-6 rounded-2xl bg-[#121620] border border-white/[0.07] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>ClutchClip Memberships</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">
                {currentUser ? `Signed in as ${currentUser.email}` : 'Google Sign-In required on activation'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
              Upgrade Your Recording Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              The Free plan is available to everyone. Upgrade to <strong className="text-slate-200">Premium (₹29)</strong> or <strong className="text-slate-200">Premium Plus (₹99)</strong> to unlock 2K/4K high-frame-rate capture, remove all ads, and hide the watermark in recorded videos.
            </p>
          </div>

          {currentTier !== 'free' && daysRemaining && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-left sm:text-right shrink-0">
              <div className="flex items-center sm:justify-end gap-1.5 text-xs font-semibold text-emerald-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{currentTier === 'ultra_4k' ? 'Premium Plus Active' : 'Premium Active'}</span>
              </div>
              <div className="text-xs font-mono-numbers text-slate-300 mt-0.5">
                {daysRemaining} days remaining
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 1 Prompt Modal/Banner: Ask User to Sign In via Google First when clicking Activate Plan */}
      {pendingSignInTier && !currentUser && (
        <div className="p-5 rounded-2xl bg-[#121620] border border-sky-500/40 shadow-xl space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                  />
                  <path
                    fill="#34A853"
                    d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-sky-400">
                  Step 1 of 2 · Account Verification
                </div>
                <h3 className="text-sm sm:text-base font-bold font-display text-white">
                  Sign in with Google to activate{' '}
                  {pendingSignInTier === 'ultra_4k' ? 'Premium Plus (₹99)' : 'Premium (₹29)'}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPendingSignInTier(null)}
              className="p-1.5 rounded-lg bg-white/[0.05] text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Sign in with your Google account so we can verify your membership and link your{' '}
            <strong>{GOOGLE_PLAY_SKUS[pendingSignInTier].title}</strong> pass directly to your profile.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={handleSignInAndActivate}
              disabled={isSigningIn}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-display font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 text-sky-600" />
              <span>
                {isSigningIn
                  ? 'Signing in with Google...'
                  : `Sign in with Google & Activate ${pendingSignInTier === 'ultra_4k' ? 'Premium Plus (₹99)' : 'Premium (₹29)'}`}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPendingSignInTier(null)}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Status / Receipt Banner if just purchased via Google Play Billing */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          {latestReceipt && (
            <span className="text-xs font-medium text-emerald-200 flex items-center gap-1 shrink-0">
              <Receipt className="w-3.5 h-3.5" />
              <span>Verified</span>
            </span>
          )}
        </div>
      )}

      {/* Free User Plan Overview Banner */}
      <div className="p-5 rounded-2xl bg-[#121620] border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-white">Free Plan</span>
            <span aria-hidden="true">·</span>
            <span>Ad-Supported (Google Banner &amp; App Open Ads)</span>
            <span aria-hidden="true">·</span>
            <span>Watermarked Video</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Includes <strong className="text-slate-200">1080p 60 FPS</strong> and <strong className="text-slate-200">5-Minute Replay Buffer</strong> for free users. Upgrade to <strong className="text-amber-300">Premium (₹29)</strong> or <strong className="text-rose-400">Premium Plus (₹99)</strong> to remove all ads and hide the logo in recorded videos.
          </p>
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <span className="text-xl font-bold font-mono-numbers text-white">₹0</span>
          <div className="text-xs text-slate-400">
            {currentTier === 'free' ? 'Current Plan' : 'Included'}
          </div>
        </div>
      </div>

      {/* Side-by-Side Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
        {/* Plan 1: ₹29 Premium (2K + 90 FPS) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleClickActivatePlan('pro_2k')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClickActivatePlan('pro_2k');
            }
          }}
          className={`p-5 rounded-2xl border transition-colors flex flex-col justify-between cursor-pointer ${
            currentTier === 'pro_2k'
              ? 'border-amber-400/70 bg-amber-500/[0.06]'
              : 'border-white/[0.08] bg-[#121620] hover:border-amber-400/50'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 text-xs text-amber-400 font-medium">
              <span>2K QHD · 90 FPS</span>
              <span className="font-mono-numbers text-slate-400">30 Days</span>
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-bold font-display text-white">Premium</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono-numbers text-white">₹29</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Unlocks 2K (1440p) at 90 FPS, removes all ads, and hides the logo in recorded videos.
            </p>

            <ul className="mt-4 pt-4 border-t border-white/[0.06] space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong className="text-white">2K QHD (2560×1440)</strong> Resolution</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong className="text-white">90 FPS</strong> High-Refresh Capture</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong className="text-white">12 Mbps</strong> High-Bitrate Stream</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong className="text-white">Hide Logo in Recorded Video</strong> (Kept on Screen)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong className="text-white">100% Ad-Free</strong> (Removes Banner &amp; App Open Ads)</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors">
            {processingTier === 'pro_2k' ? (
              <span>Activating Premium...</span>
            ) : currentTier === 'pro_2k' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Premium Active · Renew ₹29</span>
              </>
            ) : (
              <span>Activate Premium — ₹29</span>
            )}
          </div>
        </div>

        {/* Plan 2: ₹99 Premium Plus (4K + 120 FPS) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleClickActivatePlan('ultra_4k')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClickActivatePlan('ultra_4k');
            }
          }}
          className={`p-5 rounded-2xl border transition-colors flex flex-col justify-between cursor-pointer ${
            currentTier === 'ultra_4k'
              ? 'border-rose-500/80 bg-rose-500/[0.06]'
              : 'border-rose-500/35 bg-[#121620] hover:border-rose-500/70'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 text-xs text-rose-400 font-medium">
              <span>4K UHD · 120 FPS</span>
              <span className="font-mono-numbers text-slate-400">30 Days</span>
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-bold font-display text-white">Premium Plus</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono-numbers text-white">₹99</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Unlocks 4K (2160p) at 120 FPS, removes all ads, and hides the logo in recorded videos.
            </p>

            <ul className="mt-4 pt-4 border-t border-white/[0.06] space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-400 shrink-0" />
                <span><strong className="text-white">Full 4K UHD (3840×2160)</strong> Resolution</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-400 shrink-0" />
                <span><strong className="text-white">120 FPS</strong> Ultra-Refresh Capture</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-400 shrink-0" />
                <span><strong className="text-white">22 Mbps</strong> Studio Bitrate + All Premium Features</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-400 shrink-0" />
                <span><strong className="text-white">Hide Logo in Recorded Video</strong> (Kept on Screen)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong className="text-white">100% Ad-Free</strong> (Removes Banner &amp; App Open Ads)</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors">
            {processingTier === 'ultra_4k' ? (
              <span>Activating Premium Plus...</span>
            ) : currentTier === 'ultra_4k' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Premium Plus Active · Renew ₹99</span>
              </>
            ) : (
              <span>Activate Premium Plus — ₹99</span>
            )}
          </div>
        </div>
      </div>

      {/* Full Side-by-Side Comparison Table */}
      <div className="rounded-2xl bg-[#121620] border border-white/[0.07] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white font-display">
            Plans Comparison
          </h3>
          <button
            type="button"
            onClick={handleRestore}
            disabled={isRestoring}
            className="text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRestoring ? 'animate-spin' : ''}`} />
            <span>{isRestoring ? 'Checking...' : 'Restore Purchase'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="py-3 px-4 text-slate-400 font-medium">Feature</th>
                <th className="py-3 px-4 text-slate-300 font-semibold">Free (₹0)</th>
                <th className="py-3 px-4 text-amber-400 font-semibold">
                  Premium (₹29)
                </th>
                <th className="py-3 px-4 text-rose-400 font-semibold">
                  Premium Plus (₹99)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-300">{row.feature}</td>
                  <td className="py-3 px-4 font-mono-numbers text-slate-400">
                    {typeof row.free === 'boolean' ? (
                      row.free ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-slate-600" />
                      )
                    ) : (
                      row.free
                    )}
                  </td>
                  <td
                    className={`py-3 px-4 font-mono-numbers ${
                      row.highlight ? 'font-semibold text-amber-300' : 'text-slate-200'
                    }`}
                  >
                    {typeof row.pro29 === 'boolean' ? (
                      row.pro29 ? (
                        <Check className="w-4 h-4 text-amber-400" />
                      ) : (
                        <X className="w-4 h-4 text-slate-600" />
                      )
                    ) : (
                      row.pro29
                    )}
                  </td>
                  <td
                    className={`py-3 px-4 font-mono-numbers ${
                      row.highlight ? 'font-semibold text-rose-300' : 'text-slate-200'
                    }`}
                  >
                    {typeof row.ultra99 === 'boolean' ? (
                      row.ultra99 ? (
                        <Check className="w-4 h-4 text-rose-400" />
                      ) : (
                        <X className="w-4 h-4 text-slate-600" />
                      )
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

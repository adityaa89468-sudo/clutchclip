import React, { useState } from 'react';
import {
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Crown,
  Mail,
  CheckCircle2,
  RefreshCw,
  Receipt,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  User,
  UserSubscriptionRecord,
} from '../services/firebase';
import { MembershipTier } from '../types/recorder';

interface UserProfileSettingsCardProps {
  currentUser: User | null;
  subscriptionRecord: UserSubscriptionRecord | null;
  userTier: MembershipTier;
  daysRemaining: number;
  isAuthLoading: boolean;
  onSignInWithGoogle: () => Promise<unknown>;
  onSignOut: () => Promise<void>;
  onSyncSubscription: () => Promise<void>;
  onOpenPremium: () => void;
}

export const UserProfileSettingsCard: React.FC<UserProfileSettingsCardProps> = ({
  currentUser,
  subscriptionRecord,
  userTier,
  daysRemaining,
  isAuthLoading,
  onSignInWithGoogle,
  onSignOut,
  onSyncSubscription,
  onOpenPremium,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isProUser = userTier !== 'free';

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    try {
      await onSignInWithGoogle();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncSubscription();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3.5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <UserIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Google Account &amp; Profile</h3>
            <p className="text-[10px] text-slate-400">
              Sign in to link &amp; verify your Pro membership
            </p>
          </div>
        </div>

        {currentUser ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Signed In</span>
          </span>
        ) : (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            Not Signed In
          </span>
        )}
      </div>

      {isAuthLoading ? (
        <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
          <span>Checking Google Account status...</span>
        </div>
      ) : !currentUser ? (
        /* Signed Out View */
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-white">
              Sign in with Google
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sign in with your Google account to display your <strong className="text-amber-300">Pro User</strong> badge on your profile photo and sync your{' '}
              <strong className="text-amber-300">Premium (₹29 · 2K + 90 FPS)</strong> or{' '}
              <strong className="text-rose-400">Premium Plus (₹99 · 4K + 120 FPS)</strong> membership.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSigningIn}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-display font-black text-xs shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {/* Google G Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span>
              {isSigningIn ? 'Signing in with Google...' : 'Sign in with Google'}
            </span>
          </button>
        </div>
      ) : (
        /* Signed In Profile & Verified Subscription View */
        <div className="space-y-3">
          {/* User Identity Card with PRO Badge on Profile Photo */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Profile Photo Container with Overlaid PRO Badge */}
              <div className="relative shrink-0 pb-1">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Profile'}
                    referrerPolicy="no-referrer"
                    className={`w-14 h-14 rounded-2xl object-cover shrink-0 transition-all ${
                      isProUser
                        ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/30'
                        : 'border border-slate-700'
                    }`}
                  />
                ) : (
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-display font-black text-lg shrink-0 ${
                      isProUser
                        ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/30'
                        : 'border border-slate-700'
                    }`}
                  >
                    {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                  </div>
                )}

                {/* Crown Badge on Top-Right of Profile Photo when Pro */}
                {isProUser && (
                  <div
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-rose-500 border-2 border-slate-950 flex items-center justify-center shadow-md"
                    title="Verified Pro User"
                  >
                    <Crown className="w-2.5 h-2.5 text-slate-950 fill-slate-950" />
                  </div>
                )}

                {/* PRO Badge Overlaid directly on Bottom of Profile Photo */}
                {isProUser ? (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-rose-500 text-slate-950 font-display font-black text-[8px] tracking-wider uppercase shadow-md border border-slate-950 flex items-center gap-0.5 whitespace-nowrap">
                    <span>PRO</span>
                  </div>
                ) : (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-display font-bold text-[8px] tracking-wider uppercase border border-slate-700 whitespace-nowrap">
                    <span>FREE</span>
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate flex items-center gap-1.5 flex-wrap">
                  <span className="truncate">{currentUser.displayName || 'ClutchClip Gamer'}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {isProUser && (
                    <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-400/40 text-amber-300 font-display font-black text-[9px] tracking-wide uppercase flex items-center gap-1 shrink-0">
                      <Crown className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span>PRO USER</span>
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{currentUser.email}</span>
                </div>
                {isProUser && (
                  <div className="text-[10px] font-semibold text-amber-300/90 mt-0.5">
                    {userTier === 'ultra_4k' ? 'Premium Plus (4K + 120 FPS)' : 'Premium (2K + 90 FPS)'} · Ad-Free Active
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onSignOut}
                className="py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Sign out of Google account"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Delete Account & Data"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  <span>Delete Account</span>
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await currentUser.delete();
                      } catch {
                        // Fallback sign out & clear local data
                      }
                      await onSignOut();
                      setConfirmDelete(false);
                    }}
                    className="px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account-Linked Subscription Verification Box */}
          <div
            className={`p-3.5 rounded-2xl border space-y-2 ${
              userTier === 'ultra_4k'
                ? 'bg-rose-950/25 border-rose-500/40'
                : userTier === 'pro_2k'
                ? 'bg-amber-950/25 border-amber-500/40'
                : 'bg-slate-950/70 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Crown
                  className={`w-4 h-4 ${
                    userTier === 'ultra_4k'
                      ? 'text-rose-400 fill-rose-400'
                      : userTier === 'pro_2k'
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-500'
                  }`}
                />
                <span>
                  {userTier === 'ultra_4k'
                    ? 'Premium Plus · 4K + 120 FPS (₹99/mo)'
                    : userTier === 'pro_2k'
                    ? 'Premium · 2K + 90 FPS (₹29/mo)'
                    : 'Free Plan (1080p · 60 FPS)'}
                </span>
              </div>

              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase font-mono-numbers ${
                  userTier !== 'free'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {userTier !== 'free' ? `Verified · ${daysRemaining}d Left` : 'Free Account'}
              </span>
            </div>

            {userTier !== 'free' && subscriptionRecord ? (
              <div className="pt-1.5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono-numbers text-slate-400">
                <div className="flex items-center gap-1 truncate">
                  <Receipt className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate text-slate-200">Google Play Verified</span>
                </div>
                <div className="text-right text-emerald-400">
                  Paid: {subscriptionRecord.amountPaid}
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400">
                No active paid subscription on <strong className="text-slate-200">{currentUser.email}</strong>. Activate Premium (₹29) or Premium Plus (₹99) to link it to this Google account.
              </p>
            )}

            <div className="pt-1 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                className="text-[10px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Checking Account...' : 'Verify Account Subscription'}</span>
              </button>

              {userTier !== 'ultra_4k' && (
                <button
                  type="button"
                  onClick={onOpenPremium}
                  className="py-1 px-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-display font-black text-[10px] flex items-center gap-1 shadow cursor-pointer"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{userTier === 'free' ? 'Get Premium' : 'Upgrade to Premium Plus'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

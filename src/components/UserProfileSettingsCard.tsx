import React, { useState } from 'react';
import {
  LogOut,
  RefreshCw,
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
  onCancelSubscription?: () => void;
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
  onCancelSubscription,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmCancelSub, setConfirmCancelSub] = useState(false);

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
    <div className="p-5 rounded-2xl bg-[#11151e] border border-white/[0.06] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Google Account</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentUser ? 'Signed in and synced with your profile' : 'Sign in to link your account and subscription'}
          </p>
        </div>
        <span className="text-xs font-mono-numbers text-slate-400">
          {isProUser ? `Pro · ${daysRemaining}d` : currentUser ? 'Free Plan' : 'Signed Out'}
        </span>
      </div>

      {isAuthLoading ? (
        <div className="py-4 flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
          <span>Checking account...</span>
        </div>
      ) : !currentUser ? (
        <div className="pt-1 space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSigningIn}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-display font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-60"
          >
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
            <span>{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>

          {isProUser && onCancelSubscription && (
            <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-400">
                Active local plan: {userTier === 'ultra_4k' ? 'Premium Plus' : 'Premium'}
              </span>
              {!confirmCancelSub ? (
                <button
                  type="button"
                  onClick={() => setConfirmCancelSub(true)}
                  className="text-slate-400 hover:text-rose-400 font-medium transition-colors cursor-pointer"
                >
                  Cancel Subscription
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onCancelSubscription();
                      setConfirmCancelSub(false);
                    }}
                    className="text-rose-400 font-semibold hover:underline cursor-pointer"
                  >
                    Confirm Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmCancelSub(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    Keep Plan
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Profile'}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-xl object-cover shrink-0 border border-white/10"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white font-display font-semibold text-sm shrink-0">
                  {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {currentUser.displayName || 'ClutchClip User'}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {currentUser.email}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {userTier === 'ultra_4k'
                    ? 'Premium Plus · 4K 120 FPS'
                    : userTier === 'pro_2k'
                    ? 'Premium · 2K 90 FPS'
                    : 'Free Plan · 1080p 60 FPS'}
                  {subscriptionRecord?.amountPaid ? ` · ${subscriptionRecord.amountPaid}` : ''}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onSignOut}
              className="py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="pt-3 border-t border-white/[0.05] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Subscription'}</span>
              </button>

              {isProUser && onCancelSubscription && (
                !confirmCancelSub ? (
                  <button
                    type="button"
                    onClick={() => setConfirmCancelSub(true)}
                    className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Cancel Subscription
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onCancelSubscription();
                        setConfirmCancelSub(false);
                      }}
                      className="text-rose-400 font-semibold hover:underline cursor-pointer"
                    >
                      Confirm Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmCancelSub(false)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      Keep Plan
                    </button>
                  </div>
                )
              )}

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
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
                    className="text-rose-400 font-semibold hover:underline cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {userTier !== 'ultra_4k' && (
              <button
                type="button"
                onClick={onOpenPremium}
                className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                {userTier === 'free' ? 'Upgrade Plan' : 'Upgrade to 4K'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

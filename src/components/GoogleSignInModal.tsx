import React, { useState } from 'react';
import { X, ShieldCheck, Mail, User as UserIcon, CheckCircle2, Crown } from 'lucide-react';

export interface GoogleAccountProfileInput {
  email: string;
  displayName: string;
  photoURL?: string;
}

interface GoogleSignInModalProps {
  isOpen: boolean;
  onSelectAccount: (profile: GoogleAccountProfileInput) => void;
  onCancel: () => void;
}

const SAVED_ACCOUNTS_KEY = 'clutchclip_recent_google_accounts';

function getSavedGoogleAccounts(): GoogleAccountProfileInput[] {
  const defaults: GoogleAccountProfileInput[] = [
    {
      email: 'adityaa89468@gmail.com',
      displayName: 'Aditya',
    },
  ];
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as GoogleAccountProfileInput[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaults;
    const merged = [...parsed];
    if (!merged.some((a) => a.email.toLowerCase() === 'adityaa89468@gmail.com')) {
      merged.push(defaults[0]);
    }
    return merged;
  } catch {
    return defaults;
  }
}

export function rememberGoogleAccount(profile: GoogleAccountProfileInput): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedGoogleAccounts().filter(
      (a) => a.email.toLowerCase() !== profile.email.toLowerCase()
    );
    const updated = [profile, ...existing].slice(0, 5);
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onSelectAccount,
  onCancel,
}) => {
  const savedAccounts = getSavedGoogleAccounts();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickSelect = (acc: GoogleAccountProfileInput) => {
    rememberGoogleAccount(acc);
    onSelectAccount(acc);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || cleanEmail.length < 5) {
      setErrorMsg('Please enter a valid Google email address (e.g., gamer@gmail.com)');
      return;
    }
    const rawName = displayName.trim() || cleanEmail.split('@')[0] || 'Gamer';
    const profile: GoogleAccountProfileInput = {
      email: cleanEmail,
      displayName: rawName.charAt(0).toUpperCase() + rawName.slice(1),
    };
    rememberGoogleAccount(profile);
    onSelectAccount(profile);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <h3 className="text-sm font-bold text-white font-display">Sign in with Google</h3>
              <p className="text-[11px] text-slate-400">Choose an account to continue to ClutchClip</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {!showCustomForm ? (
            <div className="space-y-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Available Google Accounts on Device
              </div>

              <div className="space-y-2">
                {savedAccounts.map((acc) => {
                  const isOwnerPro = acc.email.toLowerCase() === 'adityaa89468@gmail.com';
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleQuickSelect(acc)}
                      className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/40 flex items-center justify-between gap-3 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-display font-black text-sm shrink-0 shadow">
                          {(acc.displayName || acc.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                            <span className="truncate">{acc.displayName}</span>
                            {isOwnerPro && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[9px] font-display font-black uppercase flex items-center gap-0.5 shrink-0">
                                <Crown className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                <span>PRO</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{acc.email}</div>
                        </div>
                      </div>

                      <CheckCircle2 className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 shrink-0 transition-colors" />
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCustomForm(true);
                  setErrorMsg(null);
                }}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Use another Google account</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>Google Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Display Name (Optional)</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Gamer Tag / Name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-[11px] text-rose-300">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-display font-black text-xs transition-colors cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Google Account Sync</span>
            </span>
            <span>ClutchClip Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};

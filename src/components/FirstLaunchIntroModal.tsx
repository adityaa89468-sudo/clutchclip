import React, { useState } from 'react';
import {
  Monitor,
  Headphones,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Layers,
  Lock,
  Sparkles,
  Volume2,
  Mic,
  Crown,
  FileText,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { PRIVACY_POLICY_URL, TERMS_AND_CONDITIONS_URL } from './LegalSettingsFooter';

export const ONBOARDING_STORAGE_KEY = 'clutchclip_intro_completed_v2';

interface FirstLaunchIntroModalProps {
  onComplete: () => void;
}

export const FirstLaunchIntroModal: React.FC<FirstLaunchIntroModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  // Unchecked by default so the user must actively read and check consent before continuing
  const [acceptedDisclosure, setAcceptedDisclosure] = useState(false);
  const [acknowledgedLocalOnly, setAcknowledgedLocalOnly] = useState(false);
  const [previewLegalDoc, setPreviewLegalDoc] = useState<'none' | 'privacy' | 'terms'>('none');
  const [demoAudio, setDemoAudio] = useState<'game_only' | 'mic_only' | 'game_and_mic'>('game_and_mic');
  const [demoWindow, setDemoWindow] = useState<'30s' | '1m' | '2m' | '3m' | '5m'>('5m');

  const canFinish = acceptedDisclosure && acknowledgedLocalOnly;

  const handleFinish = () => {
    if (!canFinish) return;
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#07090e] text-slate-100 flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
      {/* Subtle ambient radial glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[520px] h-[260px] bg-rose-600/10 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-xl rounded-3xl bg-[#121620] border border-white/[0.09] shadow-2xl overflow-hidden my-auto">
        {/* Top Progress Bar (3 segments) */}
        <div className="grid grid-cols-3 gap-1.5 px-6 pt-5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-rose-500' : 'bg-white/[0.07]'
              }`}
            />
          ))}
        </div>

        {/* Brand Header */}
        <div className="px-6 pt-4 pb-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  ClutchClip Studio
                </h1>
                <span className="text-[11px] font-mono-numbers text-rose-400 font-semibold">
                  v1.00.01
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Created by <strong className="text-slate-200 font-semibold">Aditya</strong> &bull; Official Onboarding
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono-numbers uppercase tracking-wider text-slate-400 block">
              Step {step} of 3
            </span>
            <span className="text-[11px] font-medium text-rose-400">
              {step === 1
                ? 'Flashback Engine'
                : step === 2
                ? 'Audio & Pro Controls'
                : 'Play Store Disclosure'}
            </span>
          </div>
        </div>

        {/* STEP 1: How the 5-Min Retroactive Flashback Engine Works */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Retroactive Screen Recorder</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                Clip your best gaming moments AFTER they happen.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Traditional screen recorders waste gigabytes of storage recording full matches. ClutchClip maintains a continuous <strong className="text-white">rolling RAM buffer</strong> and only saves video when you tap <strong className="text-rose-400">Clip</strong>.
              </p>
            </div>

            {/* Visual Timeline Diagram */}
            <div className="p-4 rounded-2xl bg-[#0b0e14] border border-white/[0.07] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>Live Rolling Memory Loop</span>
                </span>
                <span className="font-mono-numbers text-emerald-400 font-semibold">
                  0 MB Wasted Disk Space
                </span>
              </div>

              {/* Timeline Visual Bar */}
              <div className="relative pt-2 pb-1">
                <div className="h-2.5 w-full rounded-full bg-slate-900 border border-white/[0.06] overflow-hidden flex">
                  <div className="w-1/4 bg-slate-800/70" title="Old frames auto-discarded" />
                  <div className="w-3/4 bg-gradient-to-r from-rose-600/40 via-rose-500 to-amber-400" />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono-numbers text-slate-400 mt-2">
                  <span>-05:00 (Auto-Purged)</span>
                  <span className="text-amber-300 font-semibold">★ Clutch Play Happens</span>
                  <span className="text-rose-400 font-bold">Tap Clip (Saved!)</span>
                </div>
              </div>
            </div>

            {/* Key Comparison / Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#0b0e14] border border-white/[0.06] space-y-1">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Up to 4K UHD &amp; 120 FPS</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hardware-accelerated encoding with Adaptive Low Power Mode so your game never drops frames.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0b0e14] border border-white/[0.06] space-y-1">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Private Local Vault</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All clips are stored directly inside your device&apos;s local storage with built-in instant trimming.
                </p>
              </div>
            </div>

            {/* Step 1 Footer */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/[0.06]">
              <span className="text-xs text-slate-400">
                Please complete all 3 steps to unlock the recorder
              </span>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Interactive Audio Recording, Buffer Window & Pro Tier Overview */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5" />
                <span>Studio-Grade Capture Controls</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                Tailor your audio, buffer window &amp; video watermark.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Test out your default capture controls below—you can switch these anytime inside the <strong className="text-white">Buffer</strong> and <strong className="text-white">Settings</strong> tabs.
              </p>
            </div>

            {/* Interactive Preview: Audio Recording + Buffer Memory Window (Exact Theme) */}
            <div className="p-4 rounded-2xl bg-[#0b0e14] border border-white/[0.07] space-y-3.5">
              {/* Audio Recording Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-rose-400" />
                    <span>3-Way Audio Recording</span>
                  </span>
                  <span className="text-[10px] font-mono-numbers font-bold text-rose-400">
                    {demoAudio === 'game_only'
                      ? 'Game Audio Only'
                      : demoAudio === 'mic_only'
                      ? 'Mic Only'
                      : 'Game + Mic'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  {[
                    { id: 'game_only' as const, label: 'Game Audio Only', icon: Volume2 },
                    { id: 'mic_only' as const, label: 'Mic Only', icon: Mic },
                    { id: 'game_and_mic' as const, label: 'Game + Mic', icon: Headphones },
                  ].map((opt) => {
                    const IconComp = opt.icon;
                    const isSelected = demoAudio === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDemoAudio(opt.id)}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <IconComp className="w-3 h-3 shrink-0" />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Buffer Memory Window Selector */}
              <div className="pt-2.5 border-t border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Buffer Memory Window</span>
                  </span>
                  <span className="text-[10px] font-mono-numbers font-bold text-rose-400">
                    {demoWindow}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  {(['30s', '1m', '2m', '3m', '5m'] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setDemoWindow(w)}
                      className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                        demoWindow === w
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Membership Tiers Overview */}
            <div className="p-4 rounded-2xl bg-[#0b0e14] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Free vs. Premium Memberships</span>
                </span>
                <span className="text-[11px] font-mono-numbers text-slate-400">
                  Google Play Billing v8.3.0
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                • <strong className="text-white">Free Tier:</strong> 1080p 60 FPS &amp; up to 5-min buffer (ad-supported, includes watermark on saved clips).<br />
                • <strong className="text-amber-300">Premium (₹29/mo):</strong> 2K QHD · 90 FPS · <strong className="text-emerald-400">100% Ad-Free</strong> · Hide Logo in Recorded Video.<br />
                • <strong className="text-rose-400">Premium Plus (₹99/mo):</strong> 4K UHD · 120 FPS · <strong className="text-emerald-400">100% Ad-Free</strong> · Hide Logo in Recorded Video.
              </p>
            </div>

            {/* Step 2 Footer */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Final Step: Permissions &amp; Consent</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Mandatory Google Play Prominent Disclosure & Explicit Checkboxes */}
        {step === 3 && (
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Mandatory Google Play Prominent Disclosure</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Permissions &amp; Data Privacy Agreement
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Before entering ClutchClip, please review how sensitive Android permissions are used and check both boxes below to confirm your consent:
              </p>
            </div>

            {/* Permission Disclosure Items */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#0b0e14] border border-white/[0.06] flex items-start gap-3">
                <Monitor className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">
                    1. Screen Capture Permission (MediaProjection)
                  </div>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    ClutchClip captures your screen <strong className="text-slate-200">only when you explicitly activate the Replay Buffer</strong>. Video chunks are held in temporary on-device memory and are never transmitted or uploaded to any external server.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#0b0e14] border border-white/[0.06] flex items-start gap-3">
                <Headphones className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">
                    2. Audio Recording Permission (RECORD_AUDIO)
                  </div>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Used strictly to capture internal game audio and/or microphone voice commentary according to your selected Audio Mode while buffering.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#0b0e14] border border-white/[0.06] flex items-start gap-3">
                <Layers className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">
                    3. Floating Overlay, Account Sync &amp; Ads
                  </div>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Optional floating Quick-Clip button for in-game clipping. Google Sign-In is used only to verify your subscription tier. Free tier displays Google AdMob ads; Premium plans remove all ads.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick In-Modal Reader for Privacy Policy & Terms & Conditions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewLegalDoc(previewLegalDoc === 'privacy' ? 'none' : 'privacy')
                    }
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      previewLegalDoc === 'privacy'
                        ? 'bg-rose-500/15 border-rose-500/50 text-white'
                        : 'bg-white/[0.04] border-white/[0.07] text-slate-300 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                    <span>{previewLegalDoc === 'privacy' ? 'Hide Privacy Policy' : 'Read Privacy Policy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPreviewLegalDoc(previewLegalDoc === 'terms' ? 'none' : 'terms')
                    }
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      previewLegalDoc === 'terms'
                        ? 'bg-rose-500/15 border-rose-500/50 text-white'
                        : 'bg-white/[0.04] border-white/[0.07] text-slate-300 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>{previewLegalDoc === 'terms' ? 'Hide Terms' : 'Read Terms & Conditions'}</span>
                  </button>
                </div>

                <a
                  href={previewLegalDoc === 'terms' ? TERMS_AND_CONDITIONS_URL : PRIVACY_POLICY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Full Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {previewLegalDoc !== 'none' && (
                <div className="p-3.5 rounded-xl bg-[#0b0e14] border border-white/[0.08] max-h-32 overflow-y-auto text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                  {previewLegalDoc === 'privacy' ? (
                    <>
                      <div className="font-semibold text-white">
                        Privacy Policy Summary (Created by Aditya)
                      </div>
                      <p>
                        All rolling replay buffers and clipped videos are stored 100% locally on your device inside IndexedDB/local storage. We never upload your screen recordings or voice audio to external servers. Google Sign-In stores only your email/UID to sync your subscription status. Payments are processed by Google Play Billing v8.3.0.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="font-semibold text-white">
                        Terms &amp; Conditions Summary (Created by Aditya)
                      </div>
                      <p>
                        You are responsible for recording content in compliance with applicable laws. Free users receive ad-supported capture with watermarked video exports. Premium (₹29) and Premium Plus (₹99) subscribers receive a 100% ad-free experience and can hide the ClutchClip logo inside recorded videos.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mandatory Explicit Checkboxes (Must be checked by user to unlock button) */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgedLocalOnly}
                  onChange={(e) => setAcknowledgedLocalOnly(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-rose-500 rounded cursor-pointer shrink-0"
                />
                <span className="text-xs text-slate-200 leading-snug">
                  I understand and consent to ClutchClip using <strong>Screen Capture</strong> and <strong>Audio Recording</strong> permissions when I activate the replay buffer.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-white/[0.06]">
                <input
                  type="checkbox"
                  checked={acceptedDisclosure}
                  onChange={(e) => setAcceptedDisclosure(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-rose-500 rounded cursor-pointer shrink-0"
                />
                <span className="text-xs text-slate-200 leading-snug">
                  I have reviewed and agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setPreviewLegalDoc('privacy')}
                    className="text-rose-400 hover:underline font-semibold cursor-pointer"
                  >
                    Privacy Policy
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setPreviewLegalDoc('terms')}
                    className="text-rose-400 hover:underline font-semibold cursor-pointer"
                  >
                    Terms &amp; Conditions
                  </button>
                  .
                </span>
              </label>
            </div>

            {/* Step 3 Footer */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={!canFinish}
                onClick={handleFinish}
                className={`py-3 px-6 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                  canFinish
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 cursor-pointer'
                    : 'bg-white/[0.06] text-slate-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {canFinish ? 'Agree & Launch ClutchClip' : 'Check Both Boxes Above to Continue'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, Copy, Check, ExternalLink, X } from 'lucide-react';

const PUBLIC_BASE_URL = 'https://ais-pre-3snlo54mrza2oxwm33xnfx-309080682455.asia-east1.run.app';
export const PRIVACY_POLICY_URL = `${PUBLIC_BASE_URL}/privacy-policy.html`;
export const TERMS_AND_CONDITIONS_URL = `${PUBLIC_BASE_URL}/terms-and-conditions.html`;

type LegalDocType = 'privacy' | 'terms' | null;

export const LegalSettingsFooter: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<LegalDocType>(null);
  const [copiedField, setCopiedField] = useState<'privacy' | 'terms' | null>(null);

  // Auto-open if URL query parameter ?legal=privacy or ?legal=terms is visited
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const legalParam = params.get('legal') || params.get('page');
    if (legalParam === 'privacy') {
      setActiveDoc('privacy');
    } else if (legalParam === 'terms') {
      setActiveDoc('terms');
    }
  }, []);

  const handleCopyUrl = async (type: 'privacy' | 'terms', url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedField(type);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedField(type);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <>
      {/* Minimal Bottom Footer */}
      <div className="pt-4 pb-2 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveDoc('privacy')}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Privacy Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDoc('terms')}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Terms &amp; Conditions</span>
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Created by <span className="text-white font-semibold">Aditya</span> &bull; v1.00.01
        </div>
      </div>

      {/* In-App Legal Document Reader Modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-white/[0.09] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
                  ClutchClip Legal &bull; Created by Aditya
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {activeDoc === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDoc(null)}
                className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeDoc === 'privacy' ? (
                <>
                  <p className="text-slate-400 text-xs">
                    <strong>Effective Date:</strong> March 30, 2026 &bull; <strong>Developer:</strong> Created by Aditya
                  </p>
                  <p>
                    Welcome to <strong>ClutchClip</strong>, created and maintained by <strong>Aditya</strong>. This Privacy Policy describes how your data is handled when using ClutchClip.
                  </p>
                  <h4 className="text-white font-semibold pt-2">1. Screen Recording &amp; Audio Capture (100% Local Processing)</h4>
                  <p>
                    ClutchClip requests screen capture (<code>FOREGROUND_SERVICE_MEDIA_PROJECTION</code>) and audio recording (<code>RECORD_AUDIO</code> for Game Audio Only, Mic Only, or Game + Mic) strictly to maintain your rolling flashback buffer and save clips on your device. All video buffers and saved highlights remain locally on your device inside IndexedDB/local storage and are never uploaded to external servers.
                  </p>
                  <h4 className="text-white font-semibold pt-2">2. Account &amp; Authentication</h4>
                  <p>
                    When you sign in via Google Sign-In or Email/Password (powered by Firebase Authentication), we store your basic account identifier (name, email, UID) to sync your subscription status across sessions.
                  </p>
                  <h4 className="text-white font-semibold pt-2">3. Google Play Billing &amp; Subscriptions</h4>
                  <p>
                    Optional memberships (<strong>Premium — ₹29</strong> and <strong>Premium Plus — ₹99</strong>) are processed securely through <strong>Google Play Billing Library v8.3.0</strong>. ClutchClip never accesses or stores your private payment card or banking credentials.
                  </p>
                  <h4 className="text-white font-semibold pt-2">4. Advertisements (Free Users Only)</h4>
                  <p>
                    Free tier users are shown banner and rewarded ads via Google AdMob, which may use standard device advertising identifiers for ad delivery. Upgrading to Premium or Premium Plus removes all ads immediately.
                  </p>
                  <h4 className="text-white font-semibold pt-2">5. Data Deletion &amp; Control</h4>
                  <p>
                    You can delete individual clips or purge the entire local storage vault anytime from the Highlight Vault or Settings tab.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-slate-400 text-xs">
                    <strong>Effective Date:</strong> March 30, 2026 &bull; <strong>Developer:</strong> Created by Aditya
                  </p>
                  <p>
                    By using <strong>ClutchClip</strong> (created by <strong>Aditya</strong>), you agree to these Terms &amp; Conditions.
                  </p>
                  <h4 className="text-white font-semibold pt-2">1. License &amp; Responsible Recording</h4>
                  <p>
                    ClutchClip grants you a personal, non-exclusive license to capture gameplay highlights and screen recordings. You are solely responsible for complying with copyright laws and obtaining any necessary consent when recording audio or screen content.
                  </p>
                  <h4 className="text-white font-semibold pt-2">2. Membership Plans &amp; Features</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Free Plan:</strong> 60s max buffer, 720p HD, 30 FPS, ad-supported, includes watermark on exported clips.</li>
                    <li><strong>Premium (₹29):</strong> 100% Ad-Free Experience, 1080p Full HD, 60 FPS, up to 3-min buffer, and optional watermark removal on recorded videos.</li>
                    <li><strong>Premium Plus (₹99):</strong> 100% Ad-Free Experience, 4K Ultra HD, 120 FPS Ultra Smooth, up to 5-min buffer, and watermark-free exported videos.</li>
                  </ul>
                  <h4 className="text-white font-semibold pt-2">3. Hide Logo in Recorded Video</h4>
                  <p>
                    When a subscribed user enables "Hide Logo in Video", the ClutchClip logo remains visible inside the app preview screen for branding consistency, while exported/recorded video files are saved completely without the logo watermark.
                  </p>
                  <h4 className="text-white font-semibold pt-2">4. Subscription Management &amp; Cancellation</h4>
                  <p>
                    Google Play subscriptions renew automatically unless canceled at least 24 hours before the renewal date via the Google Play Store Subscriptions settings.
                  </p>
                </>
              )}
            </div>

            <div className="px-6 py-3.5 border-t border-white/[0.07] bg-white/[0.02] flex items-center justify-between gap-3">
              <div className="text-xs text-slate-400 truncate">
                URL: <span className="text-slate-300 font-mono">{activeDoc === 'privacy' ? PRIVACY_POLICY_URL : TERMS_AND_CONDITIONS_URL}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleCopyUrl(
                      activeDoc,
                      activeDoc === 'privacy' ? PRIVACY_POLICY_URL : TERMS_AND_CONDITIONS_URL
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedField === activeDoc ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
                <a
                  href={activeDoc === 'privacy' ? '/privacy-policy.html' : '/terms-and-conditions.html'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-colors"
                  title="Open Standalone Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveDoc(null)}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

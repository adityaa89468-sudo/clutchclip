import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ExternalLink, Info, Star } from 'lucide-react';
import { ADMOB_CONFIG, admobService } from '../services/admobService';
import { nativeAndroidBridge } from '../services/nativeAndroidBridge';

interface AdMobAppOpenModalProps {
  isOpen: boolean;
  isPremium: boolean;
  onClose: () => void;
  onUpgradePremium?: () => void;
}

interface GoogleSponsoredAdCreative {
  advertiser: string;
  domain: string;
  headline: string;
  description: string;
  rating: string;
  downloads: string;
  category: string;
  ctaText: string;
  ctaUrl: string;
  accentGradient: string;
  iconBg: string;
  iconLabel: string;
}

const GOOGLE_ADS_NETWORK_CREATIVES: GoogleSponsoredAdCreative[] = [
  {
    advertiser: 'Google Play Games',
    domain: 'play.google.com',
    headline: 'Play Instant Mobile Action Titles on Google Play',
    description:
      'Discover top-rated multiplayer battle royale, racing, and tactical shooters optimized for 120Hz Android displays.',
    rating: '4.7 ★',
    downloads: '100M+ Downloads',
    category: 'Action · Google Play',
    ctaText: 'Install on Google Play',
    ctaUrl: 'https://play.google.com/store/games',
    accentGradient: 'from-blue-600 via-indigo-600 to-sky-500',
    iconBg: 'bg-blue-600',
    iconLabel: 'GP',
  },
  {
    advertiser: 'YouTube Gaming',
    domain: 'youtube.com/gaming',
    headline: 'Stream & Watch Live Esports Tournaments in HDR',
    description:
      'Follow live mobile esports championships, creator streams, and tournament highlights on YouTube.',
    rating: '4.8 ★',
    downloads: '1B+ Downloads',
    category: 'Entertainment · Video',
    ctaText: 'Open YouTube',
    ctaUrl: 'https://www.youtube.com/gaming',
    accentGradient: 'from-red-600 via-rose-600 to-orange-500',
    iconBg: 'bg-red-600',
    iconLabel: 'YT',
  },
  {
    advertiser: 'Google One Cloud',
    domain: 'one.google.com',
    headline: 'Expand Your Google Account Cloud Storage up to 2 TB',
    description:
      'Automatically back up your original quality mobile videos, photos, and device data safely in Google Cloud.',
    rating: '4.6 ★',
    downloads: '500M+ Downloads',
    category: 'Productivity · Google LLC',
    ctaText: 'Learn More',
    ctaUrl: 'https://one.google.com',
    accentGradient: 'from-emerald-600 via-teal-600 to-sky-600',
    iconBg: 'bg-emerald-600',
    iconLabel: 'G1',
  },
];

export const AdMobAppOpenModal: React.FC<AdMobAppOpenModalProps> = ({
  isOpen,
  isPremium,
  onClose,
}) => {
  const [countdown, setCountdown] = useState(2);
  const [creativeIndex] = useState(() =>
    Math.floor(Math.random() * GOOGLE_ADS_NETWORK_CREATIVES.length)
  );
  const adPushedRef = useRef(false);

  useEffect(() => {
    if (!isOpen || isPremium) return;
    setCountdown(2);
    adPushedRef.current = false;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Trigger real Google Ads / AdSense slot fill
    const pushTimer = setTimeout(() => {
      if (!adPushedRef.current) {
        adPushedRef.current = true;
        admobService.pushGoogleAdSlot();
      }
    }, 100);

    return () => {
      clearInterval(timer);
      clearTimeout(pushTimer);
    };
  }, [isOpen, isPremium]);

  // Never show App Open Ads for Premium users, and in Native APK let MainActivity.java show native Google AppOpenAd
  if (!isOpen || isPremium || nativeAndroidBridge.isRunningInNativeApk()) {
    return null;
  }

  const creative = GOOGLE_ADS_NETWORK_CREATIVES[creativeIndex];

  return (
    <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200 select-none">
      {/* Official Google Ads App Open Header Bar (No Ad Unit IDs shown to public users) */}
      <div className="w-full bg-white text-slate-900 px-4 py-3 flex items-center justify-between shadow-md border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider leading-none">
            Ad
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              Sponsored
            </span>
            <span className="text-[10px] text-slate-500 leading-tight">
              Ads by Google
            </span>
          </div>
        </div>

        {/* Google AdMob "Continue to app" Action Pill */}
        <button
          type="button"
          onClick={onClose}
          disabled={countdown > 0}
          className={`py-2 px-4 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all border ${
            countdown > 0
              ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-wait'
              : 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white shadow-sm cursor-pointer active:scale-95'
          }`}
        >
          <span>{countdown > 0 ? `Continue in ${countdown}s` : 'Continue to app'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Google AdMob App Open Interstitial Slot */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 relative">
          {/* Top AdChoices & Google Attribution Bar */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[9px]">
                Ad
              </span>
              <span className="font-semibold text-slate-600">{creative.domain}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600 font-medium">
              <span>Ads by Google</span>
              <Info className="w-3 h-3" />
            </div>
          </div>

          {/* Live Google Ads Container */}
          <div className="w-full flex justify-center bg-slate-50">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', minHeight: '1px' }}
              data-ad-client={ADMOB_CONFIG.PUBLISHER_ID}
              data-ad-slot={ADMOB_CONFIG.APP_OPEN_SLOT_ID}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>

          {/* Google AdMob Third-Party Sponsored Creative */}
          <div className={`h-36 bg-gradient-to-r ${creative.accentGradient} p-5 flex flex-col justify-end relative overflow-hidden`}>
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-[10px] font-semibold">
              {creative.category}
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl ${creative.iconBg} border-2 border-white/80 shadow-lg flex items-center justify-center text-white font-black text-lg shrink-0`}>
                {creative.iconLabel}
              </div>
              <div className="text-white">
                <div className="text-base font-extrabold leading-tight">{creative.advertiser}</div>
                <div className="flex items-center gap-2 text-xs text-white/90 mt-1">
                  <span className="flex items-center gap-0.5 font-bold">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    {creative.rating}
                  </span>
                  <span>•</span>
                  <span>{creative.downloads}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {creative.headline}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {creative.description}
              </p>
            </div>

            <div className="pt-1 flex items-center gap-2.5">
              <a
                href={creative.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{creative.ctaText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={onClose}
                disabled={countdown > 0}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="w-full py-2 bg-slate-950" />
    </div>
  );
};

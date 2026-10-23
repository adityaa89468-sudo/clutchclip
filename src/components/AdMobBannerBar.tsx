import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { ADMOB_CONFIG, admobService } from '../services/admobService';
import { nativeAndroidBridge } from '../services/nativeAndroidBridge';

interface AdMobBannerBarProps {
  isPremium: boolean;
  onOpenPremium?: () => void;
}

const GOOGLE_BANNER_CREATIVES = [
  {
    advertiser: 'Google Play Games',
    headline: 'Play Top Mobile Action & Esports Games',
    domain: 'play.google.com',
    cta: 'Install',
    url: 'https://play.google.com/store/games',
  },
  {
    advertiser: 'YouTube Gaming',
    headline: 'Watch Live 120FPS Esports Streams & Highlights',
    domain: 'youtube.com/gaming',
    cta: 'Open',
    url: 'https://www.youtube.com/gaming',
  },
  {
    advertiser: 'Google One',
    headline: 'Back Up Mobile Videos with 100 GB Cloud Storage',
    domain: 'one.google.com',
    cta: 'Learn More',
    url: 'https://one.google.com',
  },
];

export const AdMobBannerBar: React.FC<AdMobBannerBarProps> = ({
  isPremium,
}) => {
  const [adIndex, setAdIndex] = useState(0);
  const adPushedRef = useRef(false);

  useEffect(() => {
    if (isPremium) return;
    if (!adPushedRef.current) {
      adPushedRef.current = true;
      admobService.pushGoogleAdSlot();
    }
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % GOOGLE_BANNER_CREATIVES.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [isPremium]);

  // Completely remove Banner Ad for Premium users (₹29 Pro & ₹99 Ultra),
  // and in Native APK let MainActivity.java render the native AdView Banner
  if (isPremium || nativeAndroidBridge.isRunningInNativeApk()) {
    return null;
  }

  const currentAd = GOOGLE_BANNER_CREATIVES[adIndex];

  return (
    <div className="fixed bottom-16 left-0 right-0 sm:absolute z-30 bg-white text-slate-900 border-t border-slate-200 px-3 py-1.5 flex items-center justify-between gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.35)] select-none">
      {/* Live Google Ads 320x50 Banner Slot */}
      <ins
        className="adsbygoogle hidden"
        style={{ display: 'inline-block', width: '320px', height: '50px' }}
        data-ad-client={ADMOB_CONFIG.PUBLISHER_ID}
        data-ad-slot={ADMOB_CONFIG.BANNER_SLOT_ID}
      />

      {/* Left: Google Ad Badge & Third-Party Advertiser Banner Content */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="flex flex-col items-center justify-center px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 shrink-0">
          <span className="text-[8px] font-black uppercase tracking-wider leading-none">
            Ad
          </span>
          <span className="text-[7px] font-semibold leading-tight mt-0.5">
            Google
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-900 truncate">
              {currentAd.headline}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 truncate">
            <span className="font-medium text-slate-600">{currentAd.advertiser}</span>
            <span>·</span>
            <span className="truncate">{currentAd.domain}</span>
          </div>
        </div>
      </div>

      {/* Right: Google AdChoices + External Advertiser CTA */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className="text-[9px] text-blue-600 flex items-center gap-0.5 px-1"
          title="Ads by Google"
        >
          <Info className="w-3 h-3" />
        </span>
        <a
          href={currentAd.url}
          target="_blank"
          rel="noopener noreferrer"
          className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] shadow-sm flex items-center gap-1 shrink-0 active:scale-95 transition-all"
        >
          <span>{currentAd.cta}</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
};

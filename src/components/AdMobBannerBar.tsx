import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { ADMOB_CONFIG, admobService } from '../services/admobService';

interface AdMobBannerBarProps {
  isPremium: boolean;
  onOpenPremium?: () => void;
  variant?: 'compact' | 'native';
}

const GOOGLE_INLINE_CREATIVES = [
  {
    advertiser: 'Google Play Games',
    headline: 'Discover 120Hz Mobile Action & Esports Titles',
    description: 'Explore multiplayer battle royale and tactical shooters on Google Play.',
    domain: 'play.google.com',
    cta: 'Explore',
    url: 'https://play.google.com/store/games',
  },
  {
    advertiser: 'YouTube Gaming',
    headline: 'Watch Live Esports Tournaments & Creator Streams',
    description: 'Follow pro gameplay breakdowns and community highlights on YouTube.',
    domain: 'youtube.com/gaming',
    cta: 'Watch',
    url: 'https://www.youtube.com/gaming',
  },
  {
    advertiser: 'Google One',
    headline: 'Back Up Gameplay Captures with 100 GB Cloud Storage',
    description: 'Keep your original-quality gaming highlights safely backed up.',
    domain: 'one.google.com',
    cta: 'Learn More',
    url: 'https://one.google.com',
  },
];

export const AdMobBannerBar: React.FC<AdMobBannerBarProps> = ({
  isPremium,
  onOpenPremium,
  variant = 'compact',
}) => {
  const [adIndex, setAdIndex] = useState(() => (variant === 'native' ? 1 : 0));
  const adPushedRef = useRef(false);

  useEffect(() => {
    if (isPremium) return;
    if (!adPushedRef.current) {
      adPushedRef.current = true;
      admobService.pushGoogleAdSlot();
    }
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % GOOGLE_INLINE_CREATIVES.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [isPremium]);

  if (isPremium) {
    return null;
  }

  const currentAd = GOOGLE_INLINE_CREATIVES[adIndex];
  const slotId =
    variant === 'native'
      ? ADMOB_CONFIG.APP_OPEN_SLOT_ID
      : ADMOB_CONFIG.BANNER_SLOT_ID;

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl bg-[#11151e]/80 border border-white/[0.05] px-4 py-3 flex items-center justify-between gap-4 select-none">
      {/* Live Google AdSense / AdMob Slot */}
      <ins
        className="adsbygoogle hidden"
        style={{ display: 'block', width: '100%', minHeight: '1px' }}
        data-ad-client={ADMOB_CONFIG.PUBLISHER_ID}
        data-ad-slot={slotId}
        data-ad-format="fluid"
        data-full-width-responsive="true"
      />

      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="font-medium text-slate-400">Sponsored</span>
          <span aria-hidden="true">·</span>
          <span>{currentAd.advertiser}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{currentAd.domain}</span>
          {onOpenPremium && (
            <>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={onOpenPremium}
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                Remove ads
              </button>
            </>
          )}
        </div>
        <div className="text-xs font-medium text-slate-200 truncate">
          {currentAd.headline}
        </div>
        {variant === 'native' && (
          <p className="text-xs text-slate-400 truncate">
            {currentAd.description}
          </p>
        )}
      </div>

      <a
        href={currentAd.url}
        target="_blank"
        rel="noopener noreferrer"
        className="py-1.5 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.06] text-slate-200 font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors whitespace-nowrap"
      >
        <span>{currentAd.cta}</span>
        <ExternalLink className="w-3 h-3 text-slate-400" />
      </a>
    </div>
  );
};

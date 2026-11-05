import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Info, Star } from 'lucide-react';
import { ADMOB_CONFIG, admobService } from '../services/admobService';

interface AdMobBannerBarProps {
  isPremium: boolean;
  onOpenPremium?: () => void;
  variant?: 'compact' | 'native';
}

const GOOGLE_INLINE_CREATIVES = [
  {
    advertiser: 'Google Play Games',
    headline: 'Play Top Mobile Action & Esports Games',
    description: 'Discover multiplayer battle royale, racing, and tactical shooters optimized for 120Hz displays.',
    domain: 'play.google.com',
    rating: '4.7 ★',
    cta: 'Install',
    url: 'https://play.google.com/store/games',
    badgeBg: 'bg-blue-600',
    badgeText: 'GP',
  },
  {
    advertiser: 'YouTube Gaming',
    headline: 'Watch Live 120FPS Esports Streams & Highlights',
    description: 'Follow mobile esports tournaments, creator streams, and pro gameplay breakdowns on YouTube.',
    domain: 'youtube.com/gaming',
    rating: '4.8 ★',
    cta: 'Open',
    url: 'https://www.youtube.com/gaming',
    badgeBg: 'bg-rose-600',
    badgeText: 'YT',
  },
  {
    advertiser: 'Google One Cloud',
    headline: 'Back Up Mobile Videos with 100 GB Cloud Storage',
    description: 'Keep your original-quality 4K & 1080p gaming highlights safely backed up in your Google Account.',
    domain: 'one.google.com',
    rating: '4.6 ★',
    cta: 'Learn More',
    url: 'https://one.google.com',
    badgeBg: 'bg-emerald-600',
    badgeText: 'G1',
  },
];

export const AdMobBannerBar: React.FC<AdMobBannerBarProps> = ({
  isPremium,
  onOpenPremium,
  variant = 'compact',
}) => {
  const [adIndex, setAdIndex] = useState(() =>
    variant === 'native' ? 1 : 0
  );
  const adPushedRef = useRef(false);

  useEffect(() => {
    if (isPremium) return;
    if (!adPushedRef.current) {
      adPushedRef.current = true;
      admobService.pushGoogleAdSlot();
    }
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % GOOGLE_INLINE_CREATIVES.length);
    }, 18000);
    return () => clearInterval(interval);
  }, [isPremium]);

  // Completely remove all ads for Premium users (₹29 Pro & ₹99 Ultra)
  if (isPremium) {
    return null;
  }

  const currentAd = GOOGLE_INLINE_CREATIVES[adIndex];
  const slotId =
    variant === 'native'
      ? ADMOB_CONFIG.APP_OPEN_SLOT_ID
      : ADMOB_CONFIG.BANNER_SLOT_ID;

  if (variant === 'native') {
    return (
      <div className="w-full max-w-3xl mx-auto rounded-2xl bg-[#121620] border border-white/[0.07] p-4 space-y-3 select-none">
        {/* Live Responsive Inline Google Ad Slot */}
        <ins
          className="adsbygoogle hidden"
          style={{ display: 'block', width: '100%', minHeight: '1px' }}
          data-ad-client={ADMOB_CONFIG.PUBLISHER_ID}
          data-ad-slot={slotId}
          data-ad-format="fluid"
          data-full-width-responsive="true"
        />

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-[9px] leading-none">
              Ad
            </span>
            <span className="font-semibold text-slate-300">{currentAd.advertiser}</span>
            <span>·</span>
            <span className="text-slate-500">{currentAd.domain}</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPremium && (
              <button
                type="button"
                onClick={onOpenPremium}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-medium transition-colors cursor-pointer"
              >
                Remove Ads
              </button>
            )}
            <span className="text-sky-400 flex items-center gap-0.5" title="Ads by Google">
              <span>Ads by Google</span>
              <Info className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3.5 pt-0.5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`w-11 h-11 rounded-xl ${currentAd.badgeBg} text-white font-display font-black text-sm flex items-center justify-center shrink-0 shadow-md`}
            >
              {currentAd.badgeText}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-bold text-white truncate">
                {currentAd.headline}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {currentAd.description}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-semibold mt-1">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span>{currentAd.rating}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Sponsored</span>
              </div>
            </div>
          </div>

          <a
            href={currentAd.url}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
          >
            <span>{currentAd.cta}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  // Compact inline banner placed naturally between cards in empty spaces (never floating)
  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl bg-[#121620] border border-white/[0.07] px-3.5 py-2.5 flex items-center justify-between gap-3 select-none">
      {/* Live Google Ads Inline Banner Slot */}
      <ins
        className="adsbygoogle hidden"
        style={{ display: 'inline-block', width: '320px', height: '50px' }}
        data-ad-client={ADMOB_CONFIG.PUBLISHER_ID}
        data-ad-slot={slotId}
      />

      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="flex flex-col items-center justify-center px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 shrink-0">
          <span className="text-[8px] font-black uppercase tracking-wider leading-none">
            Ad
          </span>
          <span className="text-[7px] font-semibold leading-tight mt-0.5">
            Google
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-white truncate">
            {currentAd.headline}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate mt-0.5">
            <span className="font-medium text-slate-300">{currentAd.advertiser}</span>
            <span>·</span>
            <span className="truncate">{currentAd.domain}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onOpenPremium && (
          <button
            type="button"
            onClick={onOpenPremium}
            className="hidden sm:inline-block text-[10px] text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            Ad-Free
          </button>
        )}
        <span
          className="text-[10px] text-sky-400 flex items-center gap-0.5"
          title="Ads by Google"
        >
          <Info className="w-3 h-3" />
        </span>
        <a
          href={currentAd.url}
          target="_blank"
          rel="noopener noreferrer"
          className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 shrink-0 active:scale-95 transition-all"
        >
          <span>{currentAd.cta}</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
};

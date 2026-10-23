import React, { useId } from 'react';
import { LogoVariant } from '../types/recorder';

interface AppLogoProps {
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: LogoVariant;
  customLogoUrl?: string | null;
  className?: string;
  showText?: boolean;
  showBadge?: boolean;
  animated?: boolean;
}

/**
 * Returns raw SVG markup for either the Main App Logo or Mini App Logo
 * so it can also be serialized for favicons, canvas watermarks, or PNG exports.
 */
export function getClutchClipLogoSvgString(variant: LogoVariant = 'main'): string {
  if (variant === 'mini') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="cc_mini_bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="55%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#090d16"/>
        </linearGradient>
        <linearGradient id="cc_mini_ring" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#f43f5e"/>
          <stop offset="50%" stop-color="#fb7185"/>
          <stop offset="100%" stop-color="#f59e0b"/>
        </linearGradient>
        <linearGradient id="cc_mini_bolt" x1="20" y1="12" x2="44" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="45%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#f43f5e"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#cc_mini_bg)" stroke="url(#cc_mini_ring)" stroke-width="3.5"/>
      <path d="M48.5 22A19 19 0 1 0 50 38" stroke="url(#cc_mini_ring)" stroke-width="4.5" stroke-linecap="round"/>
      <polygon points="52,15 53,26 42,23" fill="#f59e0b"/>
      <path d="M35.5 14L21 34.5H31.5L27.5 50L43 29.5H32.5L35.5 14Z" fill="url(#cc_mini_bolt)" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/>
      <circle cx="49" cy="15" r="3.5" fill="#f43f5e" stroke="#ffffff" stroke-width="1.2"/>
    </svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
    <defs>
      <linearGradient id="cc_main_bg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#111827"/>
        <stop offset="50%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#1f122b"/>
      </linearGradient>
      <linearGradient id="cc_main_rim" x1="8" y1="8" x2="112" y2="112" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#f43f5e"/>
        <stop offset="50%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#e11d48"/>
      </linearGradient>
      <linearGradient id="cc_main_shield" x1="20" y1="16" x2="100" y2="104" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.08"/>
      </linearGradient>
      <linearGradient id="cc_main_bolt" x1="42" y1="24" x2="78" y2="96" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="35%" stop-color="#fde047"/>
        <stop offset="75%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#f43f5e"/>
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="112" height="112" rx="30" fill="url(#cc_main_bg)" stroke="url(#cc_main_rim)" stroke-width="4.5"/>
    <path d="M60 14L98 31V63C98 85.5 81.5 101.8 60 108C38.5 101.8 22 85.5 22 63V31L60 14Z" fill="url(#cc_main_shield)" stroke="url(#cc_main_rim)" stroke-width="2" stroke-opacity="0.65"/>
    <circle cx="60" cy="60" r="34" stroke="#334155" stroke-width="2" stroke-dasharray="5 5"/>
    <path d="M88 43A33 33 0 1 0 90 73" stroke="url(#cc_main_rim)" stroke-width="6.5" stroke-linecap="round"/>
    <polygon points="94,32 96,50 79,45" fill="#f59e0b"/>
    <path d="M51 43C42.5 43 36 49.8 36 60C36 70.2 42.5 77 51 77" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.92"/>
    <path d="M67 27L43 62H61L53 93L79 58H61L67 27Z" fill="url(#cc_main_bolt)" stroke="#090d16" stroke-width="2.2" stroke-linejoin="round"/>
    <circle cx="90" cy="28" r="6" fill="#f43f5e" stroke="#ffffff" stroke-width="2"/>
  </svg>`;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  variant = 'main',
  customLogoUrl,
  className = '',
  showText = false,
  showBadge = false,
  animated = false,
}) => {
  const uid = useId().replace(/:/g, '');

  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'xs'
      ? 22
      : size === 'sm'
      ? 28
      : size === 'lg'
      ? 48
      : size === 'xl'
      ? 64
      : 36;

  const borderRadius =
    variant === 'mini'
      ? Math.max(8, Math.round(pixelSize * 0.3))
      : Math.max(9, Math.round(pixelSize * 0.27));

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        style={{
          width: `${pixelSize}px`,
          height: `${pixelSize}px`,
          borderRadius: `${borderRadius}px`,
        }}
        className={`relative overflow-hidden flex items-center justify-center shrink-0 select-none shadow-lg shadow-rose-950/50 ${
          animated ? 'group' : ''
        }`}
      >
        {customLogoUrl ? (
          <div className="w-full h-full bg-slate-950 border border-rose-500/40 flex items-center justify-center p-0.5">
            <img
              src={customLogoUrl}
              alt="ClutchClip Custom Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
        ) : variant === 'mini' ? (
          /* MINI APP LOGO: High-contrast compact replay ring + lightning shutter core */
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full block"
            aria-label="ClutchClip Mini Logo"
          >
            <defs>
              <linearGradient
                id={`mini_bg_${uid}`}
                x1="0"
                y1="0"
                x2="64"
                y2="64"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="50%" stopColor="#111827" />
                <stop offset="100%" stopColor="#1f122b" />
              </linearGradient>
              <linearGradient
                id={`mini_ring_${uid}`}
                x1="4"
                y1="4"
                x2="60"
                y2="60"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient
                id={`mini_bolt_${uid}`}
                x1="20"
                y1="10"
                x2="44"
                y2="54"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#fef08a" />
                <stop offset="75%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>

            {/* Outer Obsidian Squircle Base */}
            <rect
              x="2"
              y="2"
              width="60"
              height="60"
              rx="18"
              fill={`url(#mini_bg_${uid})`}
              stroke={`url(#mini_ring_${uid})`}
              strokeWidth="3.5"
            />

            {/* Subtle inner aperture glow */}
            <circle cx="32" cy="32" r="22" fill="#f43f5e" fillOpacity="0.1" />

            {/* Sweeping Retroactive Replay C-Arc */}
            <path
              d="M48.5 22A19 19 0 1 0 49.5 39"
              stroke={`url(#mini_ring_${uid})`}
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Replay Arrow Tip */}
            <polygon points="52,14 54,26 42,23" fill="#f59e0b" />

            {/* Center High-Voltage Clutch Lightning Bolt */}
            <path
              d="M36 13L20.5 34.5H31.5L27 51L43.5 29.5H32.5L36 13Z"
              fill={`url(#mini_bolt_${uid})`}
              stroke="#090d16"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Active Recording Beacon Dot */}
            <circle
              cx="49"
              cy="15"
              r="3.8"
              fill="#f43f5e"
              stroke="#ffffff"
              strokeWidth="1.3"
            />
          </svg>
        ) : (
          /* MAIN APP LOGO: Flagship Esports Crest + Camera Shutter Aperture + Replay Arc + CC & Bolt */
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full block"
            aria-label="ClutchClip Main Logo"
          >
            <defs>
              <linearGradient
                id={`main_bg_${uid}`}
                x1="0"
                y1="0"
                x2="120"
                y2="120"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="45%" stopColor="#090d16" />
                <stop offset="100%" stopColor="#27112b" />
              </linearGradient>
              <linearGradient
                id={`main_rim_${uid}`}
                x1="6"
                y1="6"
                x2="114"
                y2="114"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
              <linearGradient
                id={`main_shield_${uid}`}
                x1="22"
                y1="14"
                x2="98"
                y2="106"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.28" />
                <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient
                id={`main_bolt_${uid}`}
                x1="44"
                y1="22"
                x2="78"
                y2="98"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#fef08a" />
                <stop offset="68%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>

            {/* App Icon Chassis with Glowing Rim */}
            <rect
              x="4"
              y="4"
              width="112"
              height="112"
              rx="30"
              fill={`url(#main_bg_${uid})`}
              stroke={`url(#main_rim_${uid})`}
              strokeWidth="4.5"
            />

            {/* Inner Esports Crest Shield */}
            <path
              d="M60 13L98 30V62C98 85 81.5 101.5 60 108C38.5 101.5 22 85 22 62V30L60 13Z"
              fill={`url(#main_shield_${uid})`}
              stroke={`url(#main_rim_${uid})`}
              strokeWidth="2.2"
              strokeOpacity="0.75"
            />

            {/* Camera Aperture Segmented Ring */}
            <circle
              cx="60"
              cy="60"
              r="35"
              stroke="#475569"
              strokeWidth="2"
              strokeDasharray="6 5"
              opacity="0.7"
            />

            {/* Sweeping 5-Min Replay Buffer Outer C-Arc */}
            <path
              d="M88 43A33 33 0 1 0 89.5 74"
              stroke={`url(#main_rim_${uid})`}
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Replay Arrow Head */}
            <polygon points="94,32 96,50 79,45" fill="#f59e0b" />

            {/* Inner Stylized 'C' Monogram Curve */}
            <path
              d="M52 44C43.2 44 36.5 50.6 36.5 60C36.5 69.4 43.2 76 52 76"
              stroke="#ffffff"
              strokeWidth="6.5"
              strokeLinecap="round"
              opacity="0.95"
            />

            {/* High-Voltage Clutch Lightning Bolt Striking Through Center */}
            <path
              d="M68 25L43 61.5H61L52.5 95L79.5 58.5H61.5L68 25Z"
              fill={`url(#main_bolt_${uid})`}
              stroke="#090d16"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Live REC Ruby Beacon */}
            <circle
              cx="90"
              cy="28"
              r="6"
              fill="#f43f5e"
              stroke="#ffffff"
              strokeWidth="2.2"
            />
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black font-display tracking-tight text-white">
              Clutch<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">Clip</span>
            </span>
            {showBadge && (
              <span className="text-[8px] font-mono-numbers font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                PRO
              </span>
            )}
          </div>
          {showBadge && (
            <span className="text-[9px] font-mono-numbers text-slate-400 tracking-wider uppercase mt-0.5">
              5M Replay Studio
            </span>
          )}
        </div>
      )}
    </div>
  );
};

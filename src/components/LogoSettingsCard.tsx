import React, { useRef, useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Eye,
  EyeOff,
  Lock,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Download,
  Check
} from 'lucide-react';
import { LogoConfig, LogoSize, LogoPosition, LogoVariant } from '../types/recorder';
import { AppLogo, getClutchClipLogoSvgString } from './AppLogo';

interface LogoSettingsCardProps {
  logoConfig: LogoConfig;
  onChangeLogoConfig: (newConfig: LogoConfig) => void;
  isPremium: boolean;
  onRequirePremium: (feature: string) => void;
}

export const LogoSettingsCard: React.FC<LogoSettingsCardProps> = ({
  logoConfig,
  onChangeLogoConfig,
  isPremium,
  onRequirePremium,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Unsubscribed users ALWAYS have the watermark visible
  const effectiveShowLogo = !isPremium ? true : logoConfig.showLogo;
  const currentVariant: LogoVariant = logoConfig.variant || 'main';

  // Handle custom image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Logo image must be under 4MB.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChangeLogoConfig({
          ...logoConfig,
          customLogoUrl: reader.result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Toggle show/hide logo (Available to Subscribed Users Only)
  const handleToggleShowLogo = () => {
    if (!isPremium) {
      onRequirePremium('Remove Watermark / Hide Logo (Subscribed Users Only)');
      return;
    }

    onChangeLogoConfig({
      ...logoConfig,
      showLogo: !effectiveShowLogo,
    });
  };

  const handleSetSize = (size: LogoSize) => {
    onChangeLogoConfig({
      ...logoConfig,
      size,
    });
  };

  const handleSetPosition = (position: LogoPosition) => {
    onChangeLogoConfig({
      ...logoConfig,
      position,
    });
  };

  const handleSetVariant = (variant: LogoVariant) => {
    onChangeLogoConfig({
      ...logoConfig,
      customLogoUrl: null,
      variant,
    });
  };

  const handleResetToDefault = () => {
    onChangeLogoConfig({
      ...logoConfig,
      customLogoUrl: null,
      variant: 'main',
    });
  };

  const handleDownloadLogoSvg = (variantToDownload: LogoVariant) => {
    const svgString = getClutchClipLogoSvgString(variantToDownload);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download =
      variantToDownload === 'main'
        ? 'clutchclip-main-app-logo.svg'
        : 'clutchclip-mini-app-logo.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">App Logo, Mini Logo & Watermark</h3>
            <p className="text-[10px] text-slate-400">
              Official ClutchClip Main & Mini Logos · Hide logo is for subscribed users only
            </p>
          </div>
        </div>

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono-numbers ${
            !effectiveShowLogo
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-300'
          }`}
        >
          {!effectiveShowLogo ? 'Hidden in Video · Shown on Screen' : 'Watermark Active in Video'}
        </span>
      </div>

      {/* Main App Logo & Mini App Logo Showcase Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Official App Logo & Mini App Logo</span>
          </span>
          <span className="text-[10px] text-slate-400">Tap to set active watermark style</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Main App Logo */}
          <div
            onClick={() => handleSetVariant('main')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center relative ${
              !logoConfig.customLogoUrl && currentVariant === 'main'
                ? 'bg-gradient-to-b from-rose-950/40 to-slate-950 border-rose-500 shadow-lg shadow-rose-950/30'
                : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
            }`}
          >
            {!logoConfig.customLogoUrl && currentVariant === 'main' && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
            <AppLogo size={56} variant="main" />
            <div className="mt-2 text-xs font-bold text-white font-display">Main App Logo</div>
            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
              Esports Crest + Shutter Lens & Bolt
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadLogoSvg('main');
              }}
              className="mt-2 py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[10px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Download className="w-2.5 h-2.5 text-rose-400" />
              <span>Save SVG</span>
            </button>
          </div>

          {/* Card 2: Mini App Logo */}
          <div
            onClick={() => handleSetVariant('mini')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center relative ${
              !logoConfig.customLogoUrl && currentVariant === 'mini'
                ? 'bg-gradient-to-b from-amber-950/40 to-slate-950 border-amber-400 shadow-lg shadow-amber-950/30'
                : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
            }`}
          >
            {!logoConfig.customLogoUrl && currentVariant === 'mini' && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
            <div className="h-[56px] flex items-center justify-center gap-2">
              <AppLogo size={46} variant="mini" />
              <AppLogo size={26} variant="mini" />
            </div>
            <div className="mt-2 text-xs font-bold text-white font-display">Mini App Logo</div>
            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
              Compact Replay Ring for Bubble & HUD
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadLogoSvg('mini');
              }}
              className="mt-2 py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[10px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Download className="w-2.5 h-2.5 text-amber-400" />
              <span>Save SVG</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Remove Watermark / Hide Logo Option (Subscribed Users Only) */}
      <div
        className={`p-3.5 rounded-2xl border transition-all ${
          !effectiveShowLogo
            ? 'bg-emerald-950/30 border-emerald-500/40'
            : isPremium
            ? 'bg-slate-950 border-slate-800'
            : 'bg-amber-500/5 border-amber-500/30'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-white">
                Remove Watermark / Hide Logo
              </span>
              {!isPremium ? (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1 uppercase">
                  <Lock className="w-2.5 h-2.5" />
                  Subscribed Only
                </span>
              ) : (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 uppercase">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Unlocked
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              {!isPremium
                ? 'Requires an active Premium (₹29) or Premium Plus (₹99) subscription to hide the logo in recorded videos.'
                : !effectiveShowLogo
                ? 'Logo remains visible on your screen, and is hidden in your recorded video clips.'
                : 'Tap to hide the logo in your recorded videos while keeping it visible on screen.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleShowLogo}
            className={`py-2 px-3 rounded-xl text-xs font-bold font-display flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer ${
              !effectiveShowLogo
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                : !isPremium
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
            }`}
          >
            {!effectiveShowLogo ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hidden in Video</span>
              </>
            ) : !isPremium ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Hide Logo (PRO)</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide Logo</span>
              </>
            )}
          </button>
        </div>

        {/* Option to show logo again in recorded video when hidden */}
        {isPremium && !effectiveShowLogo && (
          <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[10px] text-emerald-300">
            <span>Logo stays visible on screen · Removed from recorded videos</span>
            <button
              type="button"
              onClick={handleToggleShowLogo}
              className="font-bold underline underline-offset-2 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>Show in Video Again</span>
            </button>
          </div>
        )}
      </div>

      {/* Live Real-Time Screen Simulation */}
      <div className="relative w-full aspect-[16/9] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between p-3 select-none">
        {/* Simulated HUD elements */}
        <div className="flex items-center justify-between text-[10px] font-mono-numbers text-slate-500 pointer-events-none">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            LIVE SCREEN PREVIEW ({currentVariant.toUpperCase()} LOGO)
          </span>
          <span>{logoConfig.position.toUpperCase()}</span>
        </div>

        {/* Simulated Game Action in background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <div className="w-12 h-12 border border-sky-400/40 rounded-full flex items-center justify-center animate-ping">
            <div className="w-4 h-4 bg-sky-400/50 rounded-full" />
          </div>
        </div>

        {/* On-Screen Logo is ALWAYS visible on the screen */}
        <div
          className={`absolute transition-all duration-200 pointer-events-none ${
            logoConfig.position === 'top-left'
              ? 'top-4 left-4'
              : logoConfig.position === 'bottom-left'
              ? 'bottom-6 left-4'
              : logoConfig.position === 'bottom-right'
              ? 'bottom-6 right-4'
              : 'top-4 right-4'
          }`}
        >
          <AppLogo
            size={logoConfig.size === 'small' ? 26 : logoConfig.size === 'medium' ? 38 : 52}
            variant={currentVariant}
            customLogoUrl={logoConfig.customLogoUrl}
          />
        </div>

        {/* Status badge when Hide Logo is enabled: shows logo remains on screen but is hidden in recorded video */}
        {!effectiveShowLogo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-emerald-300 bg-slate-950/90 px-3 py-1.5 rounded-full border border-emerald-500/40 shadow-lg flex items-center gap-1.5">
              <span>✓ Shown on Screen · Hidden in Recorded Video</span>
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-slate-400 pointer-events-none z-10">
          <span>Real-time on-screen scale</span>
          <span className="font-mono-numbers text-slate-300">
            {logoConfig.size.toUpperCase()} · {logoConfig.size === 'small' ? '26px' : logoConfig.size === 'medium' ? '38px' : '52px'}
          </span>
        </div>
      </div>

      {/* Logo Size Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
          <Maximize2 className="w-3 h-3 text-slate-500" />
          <span>Logo Size</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {(['small', 'medium', 'large'] as LogoSize[]).map((sz) => (
            <button
              key={sz}
              onClick={() => handleSetSize(sz)}
              className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                logoConfig.size === sz
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sz === 'small' ? 'Small (26px)' : sz === 'medium' ? 'Medium (38px)' : 'Large (52px)'}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Logo Upload & Preset Choice */}
      <div className="space-y-2 pt-1 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">Custom Clan / Brand Logo</span>
          {logoConfig.customLogoUrl && (
            <button
              onClick={handleResetToDefault}
              className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Official Logo</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Logo Preview Badge */}
          <div className="relative w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            <AppLogo
              size={44}
              variant={currentVariant}
              customLogoUrl={logoConfig.customLogoUrl}
            />
          </div>

          <div className="flex-1 space-y-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 text-rose-400" />
              <span>{logoConfig.customLogoUrl ? 'Change Custom Logo' : 'Upload Custom Logo'}</span>
            </button>
            {uploadError ? (
              <div className="text-[10px] text-rose-400 text-center">{uploadError}</div>
            ) : (
              <div className="text-[10px] text-slate-500 text-center">
                PNG, JPG, or SVG with transparent background recommended
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logo Position on Recording */}
      <div className="space-y-1.5 pt-1 border-t border-slate-800">
        <label className="text-[11px] font-medium text-slate-400 block">
          Watermark Corner Placement
        </label>
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as LogoPosition[]).map((pos) => (
            <button
              key={pos}
              onClick={() => handleSetPosition(pos)}
              className={`py-1 text-[11px] font-medium rounded-lg capitalize transition-colors ${
                logoConfig.position === pos
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {pos.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

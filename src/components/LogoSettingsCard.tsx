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
        : 'clutchclip-mini-apk-logo.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadLogoPng = (variantToDownload: LogoVariant, pixelDimension = 512) => {
    const svgString = getClutchClipLogoSvgString(variantToDownload);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelDimension;
      canvas.height = pixelDimension;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, pixelDimension, pixelDimension);
        ctx.drawImage(img, 0, 0, pixelDimension, pixelDimension);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            const pngUrl = URL.createObjectURL(pngBlob);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download =
              variantToDownload === 'mini'
                ? `clutchclip-mini-apk-logo-${pixelDimension}x${pixelDimension}.png`
                : `clutchclip-main-apk-logo-${pixelDimension}x${pixelDimension}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(pngUrl);
          }
        }, 'image/png');
      }
      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
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
            <h3 className="text-xs font-bold text-white">App Logo, Mini APK Logo & Watermark</h3>
            <p className="text-[10px] text-slate-400">
              Official ClutchClip Main & Mini APK Logos · Hide logo is for subscribed users only
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

      {/* Main App Logo & Mini APK Logo Showcase Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Official App Logo & Mini APK Logo</span>
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
            <div className="mt-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadLogoPng('main', 512);
                }}
                className="py-1 px-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-[10px] font-semibold text-rose-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Download className="w-2.5 h-2.5 text-rose-400" />
                <span>512 PNG</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadLogoSvg('main');
                }}
                className="py-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[10px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>SVG</span>
              </button>
            </div>
          </div>

          {/* Card 2: Mini APK Logo */}
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
              <AppLogo size={48} variant="mini" />
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-amber-400/50 shadow-md flex items-center justify-center bg-[#090d16]">
                  <AppLogo size={28} variant="mini" />
                </div>
                <span className="text-[8px] font-mono-numbers text-amber-300/90 uppercase tracking-tighter">
                  APK Icon
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs font-bold text-white font-display">Mini APK Logo</div>
            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
              Android Home Launcher, Bubble & HUD
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadLogoPng('mini', 512);
                }}
                className="py-1 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-[10px] font-semibold text-amber-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Download className="w-2.5 h-2.5 text-amber-400" />
                <span>512 PNG</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadLogoSvg('mini');
                }}
                className="py-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[10px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>SVG</span>
              </button>
            </div>
          </div>
        </div>

        {/* Native Android Home Screen & Play Store Mini APK Icon Strip */}
        <div className="p-2.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center -space-x-1.5 shrink-0">
              {/* Squircle Adaptive APK Icon */}
              <div className="w-9 h-9 rounded-[10px] overflow-hidden ring-2 ring-slate-950 shadow-md">
                <AppLogo size={36} variant="mini" />
              </div>
              {/* Round Launcher APK Icon */}
              <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-slate-950 shadow-md bg-[#090d16] flex items-center justify-center">
                <AppLogo size={32} variant="mini" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-white truncate">
                Android Native Mini APK Icon Ready
              </div>
              <div className="text-[9px] text-slate-400 truncate">
                Adaptive Squircle + Round Launcher + 192px/512px Play Store PNG
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleDownloadLogoPng('mini', 192)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-bold text-amber-300 hover:text-white flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3 text-amber-400" />
            <span>192px APK</span>
          </button>
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

import React, { useRef, useState } from 'react';
import {
  Upload,
  RotateCcw,
  EyeOff,
  Lock,
} from 'lucide-react';
import { LogoConfig, LogoSize, LogoPosition, LogoVariant } from '../types/recorder';
import { AppLogo } from './AppLogo';

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

  const effectiveShowLogo = !isPremium ? true : logoConfig.showLogo;
  const currentVariant: LogoVariant = logoConfig.variant || 'main';

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

  const handleToggleShowLogo = () => {
    if (!isPremium) {
      onRequirePremium('Hide Watermark in Video (Premium · ₹29)');
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

  return (
    <div className="p-5 rounded-2xl bg-[#11151e] border border-white/[0.06] space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Video Watermark &amp; Logo</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Customize corner placement, size, or hide the watermark in recorded clips
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleShowLogo}
          className="py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-slate-200 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
        >
          {!effectiveShowLogo ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hidden in Video</span>
            </>
          ) : (
            <>
              {!isPremium && <Lock className="w-3 h-3 text-slate-400" />}
              <span>Hide in Video</span>
            </>
          )}
        </button>
      </div>

      {/* Style & Size Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <span className="text-xs text-slate-400 block">Logo Style</span>
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#090b10] rounded-xl border border-white/[0.05]">
            {(
              [
                { id: 'main' as LogoVariant, label: 'Crest Logo' },
                { id: 'mini' as LogoVariant, label: 'Minimal Icon' },
              ]
            ).map((v) => {
              const active = !logoConfig.customLogoUrl && currentVariant === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleSetVariant(v.id)}
                  className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-rose-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs text-slate-400 block">Logo Size</span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#090b10] rounded-xl border border-white/[0.05]">
            {(['small', 'medium', 'large'] as LogoSize[]).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => handleSetSize(sz)}
                className={`py-2 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                  logoConfig.size === sz
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Corner Placement */}
      <div className="space-y-1.5">
        <span className="text-xs text-slate-400 block">Corner Placement</span>
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#090b10] rounded-xl border border-white/[0.05]">
          {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as LogoPosition[]).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => handleSetPosition(pos)}
              className={`py-2 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                logoConfig.position === pos
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {pos.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Upload Row */}
      <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#090b10] border border-white/[0.06] flex items-center justify-center shrink-0">
            <AppLogo
              size={30}
              variant={currentVariant}
              customLogoUrl={logoConfig.customLogoUrl}
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-white truncate">Custom Brand Logo</div>
            <div className="text-xs text-slate-400 truncate">
              {uploadError || 'PNG, JPG, or SVG up to 4MB'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleFileUpload}
            className="hidden"
          />
          {logoConfig.customLogoUrl && (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Reset to default logo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>{logoConfig.customLogoUrl ? 'Change' : 'Upload'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

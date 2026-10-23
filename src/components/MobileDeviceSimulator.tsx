import React from 'react';
import { SubscriptionTier } from '../types/replay';

interface MobileDeviceSimulatorProps {
  children: React.ReactNode;
  onOpenPremium?: () => void;
  userTier?: SubscriptionTier;
  daysRemaining?: number;
  isBuffering?: boolean;
  onQuickClip5m?: () => void;
  batteryLevel?: number;
  isCharging?: boolean;
  isLowPowerActive?: boolean;
}

export const MobileDeviceSimulator: React.FC<MobileDeviceSimulatorProps> = ({
  children,
  isBuffering = false,
  onQuickClip5m,
  isLowPowerActive = false,
}) => {
  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col items-center relative overflow-x-hidden">
      {/* Subtle ambient backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 left-1/4 w-[560px] h-[560px] bg-rose-500/[0.04] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/[0.03] rounded-full blur-[140px]" />
      </div>

      {/* Responsive Application Shell */}
      <div className="w-full max-w-4xl min-h-screen bg-[#0b0e14] sm:border-x sm:border-white/[0.06] flex flex-col relative z-10 shrink-0">
        {/* Active Recording Status Strip (Only shown when 5-Min Buffer is actively recording) */}
        {isBuffering && (
          <div
            className={`border-b px-4 py-1.5 flex items-center justify-between text-xs shrink-0 ${
              isLowPowerActive
                ? 'bg-amber-950/60 border-amber-500/25 text-amber-200'
                : 'bg-emerald-950/60 border-emerald-500/25 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${
                  isLowPowerActive ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span className="font-medium truncate">
                {isLowPowerActive
                  ? 'Low Power Buffer Active · 30 FPS Eco Mode'
                  : '5-Minute Replay Buffer Recording'}
              </span>
            </div>
            {onQuickClip5m && (
              <button
                type="button"
                onClick={onQuickClip5m}
                className="px-2.5 py-0.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] shrink-0 transition-colors cursor-pointer whitespace-nowrap"
              >
                Save Clip
              </button>
            )}
          </div>
        )}

        {/* App Viewport Content */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative">
          {children}
        </div>
      </div>
    </div>
  );
};

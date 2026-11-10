import React from 'react';
import { MembershipTier } from '../types/recorder';

interface MobileDeviceSimulatorProps {
  children: React.ReactNode;
  onOpenPremium?: () => void;
  userTier?: MembershipTier;
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
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col items-center relative overflow-x-hidden">
      {/* Responsive Application Shell */}
      <div className="w-full max-w-4xl min-h-screen bg-[#090b10] flex flex-col relative z-10 shrink-0">
        {/* Subtle Active Recording Bar */}
        {isBuffering && (
          <div className="border-b border-white/[0.06] bg-[#11151e] px-5 py-2 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 min-w-0 text-slate-200">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isLowPowerActive ? 'bg-amber-400' : 'bg-rose-500'
                }`}
              />
              <span className="font-medium truncate">
                {isLowPowerActive
                  ? 'Replay buffer active · Eco mode (30 FPS)'
                  : '5-minute replay buffer active'}
              </span>
            </div>
            {onQuickClip5m && (
              <button
                type="button"
                onClick={onQuickClip5m}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shrink-0 transition-colors cursor-pointer whitespace-nowrap"
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

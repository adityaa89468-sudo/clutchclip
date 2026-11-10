import React from 'react';
import {
  LowPowerConfig,
  LowPowerPolicy,
  LowPowerThreshold,
  LowPowerTargetResolution,
  BatteryStatusInfo,
  ResolutionOption,
  FpsOption,
  RESOLUTION_SLOTS,
} from '../types/recorder';

interface LowPowerModeCardProps {
  config: LowPowerConfig;
  batteryStatus: BatteryStatusInfo;
  isLowPowerActive: boolean;
  userResolution: ResolutionOption;
  userFps: FpsOption;
  effectiveResolution: ResolutionOption;
  effectiveFps: FpsOption;
  normalBitrate: number;
  effectiveBitrate: number;
  powerSavingsPercent: number;
  onSetPolicy: (policy: LowPowerPolicy) => void;
  onSetThreshold: (threshold: LowPowerThreshold) => void;
  onSetTargetResolution: (res: LowPowerTargetResolution) => void;
  onSetDisableWhenCharging: (disable: boolean) => void;
  onToggleSimulateLowBattery: () => void;
}

export const LowPowerModeCard: React.FC<LowPowerModeCardProps> = ({
  config,
  batteryStatus,
  isLowPowerActive,
  effectiveResolution,
  effectiveFps,
  powerSavingsPercent,
  onSetPolicy,
  onSetThreshold,
  onSetTargetResolution,
  onSetDisableWhenCharging,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-[#11151e] border border-white/[0.06] space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Low Power Mode</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatically reduces capture load during low battery to keep gameplay smooth
          </p>
        </div>
        <span className="text-xs font-mono-numbers text-slate-400 shrink-0">
          {batteryStatus.levelPercent}% {batteryStatus.isCharging ? '· Charging' : ''}
        </span>
      </div>

      {/* Mode Policy Segmented Control */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#090b10] rounded-xl border border-white/[0.05]">
        {[
          { id: 'auto' as LowPowerPolicy, label: `Auto (≤${config.thresholdPercent}%)` },
          { id: 'always_on' as LowPowerPolicy, label: 'Always Eco' },
          { id: 'off' as LowPowerPolicy, label: 'Off' },
        ].map((opt) => {
          const active = config.policy === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSetPolicy(opt.id)}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                active
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {config.policy !== 'off' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Battery Trigger</span>
              <span className="font-mono-numbers">≤{config.thresholdPercent}%</span>
            </div>
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#090b10] rounded-xl border border-white/[0.05]">
              {([15, 20, 30] as LowPowerThreshold[]).map((thresh) => (
                <button
                  key={thresh}
                  type="button"
                  onClick={() => onSetThreshold(thresh)}
                  className={`py-1.5 rounded-lg text-xs font-mono-numbers font-medium transition-colors cursor-pointer ${
                    config.thresholdPercent === thresh
                      ? 'bg-white/[0.12] text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {thresh}%
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Eco Resolution</span>
              <span className="font-mono-numbers">{config.targetResolution.toUpperCase()} · 30 FPS</span>
            </div>
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#090b10] rounded-xl border border-white/[0.05]">
              {(['720p', '480p'] as LowPowerTargetResolution[]).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => onSetTargetResolution(res)}
                  className={`py-1.5 rounded-lg text-xs font-mono-numbers font-medium transition-colors cursor-pointer ${
                    config.targetResolution === res
                      ? 'bg-white/[0.12] text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {res.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-white/[0.05] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <span>
          Active output: <strong className="text-slate-200 font-mono-numbers">{RESOLUTION_SLOTS[effectiveResolution].shortLabel} · {effectiveFps} FPS</strong>
          {isLowPowerActive ? ` (-${powerSavingsPercent}% encoder load)` : ''}
        </span>

        {config.policy === 'auto' && (
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.disableWhenCharging}
              onChange={(e) => onSetDisableWhenCharging(e.target.checked)}
              className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
            />
            <span>Full quality while charging</span>
          </label>
        )}
      </div>
    </div>
  );
};

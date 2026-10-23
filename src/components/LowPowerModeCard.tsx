import React from 'react';
import {
  Battery,
  BatteryCharging,
  BatteryLow,
  BatteryWarning,
  Zap,
  Gauge,
  Cpu,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
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
  userResolution,
  userFps,
  effectiveResolution,
  effectiveFps,
  normalBitrate,
  effectiveBitrate,
  powerSavingsPercent,
  onSetPolicy,
  onSetThreshold,
  onSetTargetResolution,
  onSetDisableWhenCharging,
  onToggleSimulateLowBattery,
}) => {
  const isBatteryCritical = batteryStatus.levelPercent <= config.thresholdPercent;

  const renderBatteryIcon = () => {
    if (batteryStatus.isCharging) {
      return <BatteryCharging className="w-4 h-4 text-emerald-400" />;
    }
    if (isBatteryCritical) {
      return <BatteryWarning className="w-4 h-4 text-amber-400 animate-pulse" />;
    }
    if (batteryStatus.levelPercent <= 35) {
      return <BatteryLow className="w-4 h-4 text-amber-300" />;
    }
    return <Battery className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div
      className={`p-4 rounded-3xl border transition-all space-y-3.5 ${
        isLowPowerActive
          ? 'bg-gradient-to-b from-amber-950/35 via-slate-900 to-slate-900 border-amber-500/40 shadow-lg shadow-amber-950/20'
          : 'bg-slate-900 border-slate-800'
      }`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-2xl border ${
              isLowPowerActive
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white font-display">
                Low Power Mode
              </span>
              {isLowPowerActive ? (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 uppercase tracking-wider">
                  Throttling Active
                </span>
              ) : (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                  {config.policy === 'auto' ? `Auto (<${config.thresholdPercent}%)` : 'Standby'}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
              Reduces buffer capture FPS &amp; bitrate during low battery to preserve game FPS
            </p>
          </div>
        </div>

        {/* Live Battery Pill */}
        <div className="flex flex-col items-end shrink-0">
          <div
            className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 text-xs font-mono-numbers font-bold ${
              isBatteryCritical && !batteryStatus.isCharging
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-200'
            }`}
          >
            {renderBatteryIcon()}
            <span>{batteryStatus.levelPercent}%</span>
          </div>
          <span className="text-[9px] text-slate-500 mt-0.5 font-mono-numbers">
            {batteryStatus.isSimulatedLow
              ? 'Simulated Low'
              : batteryStatus.isCharging
              ? 'Charging'
              : 'Discharging'}
          </span>
        </div>
      </div>

      {/* Mode Policy Selector (Auto / Always On / Off) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-medium">Power Saver Trigger Mode</span>
          <button
            type="button"
            onClick={onToggleSimulateLowBattery}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
              batteryStatus.isSimulatedLow
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {batteryStatus.isSimulatedLow ? 'Reset Battery Sim' : 'Simulate 14% Battery'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {[
            { id: 'auto' as LowPowerPolicy, label: `Auto (≤${config.thresholdPercent}%)` },
            { id: 'always_on' as LowPowerPolicy, label: 'Always On' },
            { id: 'off' as LowPowerPolicy, label: 'Off' },
          ].map((opt) => {
            const active = config.policy === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSetPolicy(opt.id)}
                className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Battery Threshold & Target Eco Quality Controls */}
      {config.policy !== 'off' && (
        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          {/* Low Battery Threshold */}
          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Trigger Threshold</span>
              <span className="font-mono-numbers font-bold text-amber-400">
                ≤{config.thresholdPercent}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {([15, 20, 30] as LowPowerThreshold[]).map((thresh) => (
                <button
                  key={thresh}
                  type="button"
                  onClick={() => onSetThreshold(thresh)}
                  className={`py-1 rounded-lg text-[10px] font-mono-numbers font-bold transition-colors cursor-pointer ${
                    config.thresholdPercent === thresh
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {thresh}%
                </button>
              ))}
            </div>
          </div>

          {/* Target Low-Power Quality */}
          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Eco Capture Cap</span>
              <span className="font-mono-numbers font-bold text-emerald-400">
                {config.targetResolution.toUpperCase()} · 30FPS
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {(['720p', '480p'] as LowPowerTargetResolution[]).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => onSetTargetResolution(res)}
                  className={`py-1 rounded-lg text-[10px] font-mono-numbers font-bold transition-colors cursor-pointer ${
                    config.targetResolution === res
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {res.toUpperCase()} 30fps
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Charging Bypass Toggle */}
      {config.policy === 'auto' && (
        <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Restore full quality when charger is connected</span>
          </div>
          <input
            type="checkbox"
            checked={config.disableWhenCharging}
            onChange={(e) => onSetDisableWhenCharging(e.target.checked)}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </div>
      )}

      {/* Live Performance & Capture Throttling Summary Box */}
      <div
        className={`p-3 rounded-2xl border text-[11px] space-y-2 ${
          isLowPowerActive
            ? 'bg-amber-950/30 border-amber-500/30'
            : 'bg-slate-950/70 border-slate-800/80'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Cpu className={`w-3.5 h-3.5 ${isLowPowerActive ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span>
              {isLowPowerActive
                ? 'Active Buffer Throttling (Gameplay Protected)'
                : 'Full Capture Performance Active'}
            </span>
          </div>
          {isLowPowerActive && (
            <span className="text-[10px] font-mono-numbers font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
              -{powerSavingsPercent}% Encoder Load
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-0.5 font-mono-numbers text-[10px]">
          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col">
            <span className="text-slate-400 text-[9px] uppercase">Selected Slot</span>
            <span className="text-slate-200 font-bold mt-0.5">
              {RESOLUTION_SLOTS[userResolution].shortLabel} · {userFps} FPS
            </span>
            <span className="text-slate-500 text-[9px]">
              {(normalBitrate / 1_000_000).toFixed(1)} Mbps stream
            </span>
          </div>

          <div
            className={`p-2 rounded-xl border flex flex-col ${
              isLowPowerActive
                ? 'bg-amber-500/10 border-amber-500/40'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <span className="text-slate-400 text-[9px] uppercase">Effective Capture</span>
            <span
              className={`font-bold mt-0.5 ${
                isLowPowerActive ? 'text-amber-300' : 'text-emerald-400'
              }`}
            >
              {RESOLUTION_SLOTS[effectiveResolution].shortLabel} · {effectiveFps} FPS
            </span>
            <span className="text-slate-400 text-[9px]">
              {(effectiveBitrate / 1_000_000).toFixed(1)} Mbps{' '}
              {isLowPowerActive ? '(Eco Bitrate)' : '(Full Bitrate)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

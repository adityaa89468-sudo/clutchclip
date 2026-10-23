import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Square,
  Mic,
  MicOff,
  Sliders,
  Bookmark,
  CheckCircle2,
  Info,
  Lock,
  Crown,
  Monitor,
  Zap,
  BatteryWarning,
  Volume2,
  Headphones,
  Clock,
} from 'lucide-react';
import {
  BufferDuration,
  ResolutionOption,
  FpsOption,
  MembershipTier,
  LowPowerPolicy,
  AudioRecordingMode,
  AUDIO_MODE_OPTIONS,
  RESOLUTION_SLOTS,
} from '../types/recorder';

interface LiveBufferPanelProps {
  isBuffering: boolean;
  bufferedSeconds: number;
  maxBufferSeconds: BufferDuration;
  onToggleBuffer: (source?: 'game_arena' | 'screen_capture') => void;
  onClip: (seconds: number) => void;
  onSetMaxBuffer: (secs: BufferDuration) => void;
  resolution: ResolutionOption;
  fps: FpsOption;
  onSetResolution: (res: ResolutionOption) => void;
  onSetFps: (fps: FpsOption) => void;
  isPremium: boolean;
  userTier?: MembershipTier;
  onOpenPremium: (feature?: string) => void;
  isSaving: boolean;
  sourceType?: 'game_arena' | 'screen_capture';
  onSetSourceType?: (s: 'game_arena' | 'screen_capture') => void;
  micEnabled: boolean;
  onToggleMic: () => void;
  audioMode?: AudioRecordingMode;
  onSetAudioMode?: (mode: AudioRecordingMode) => void;
  onAddMarker: (label: string) => void;
  totalSavedCount: number;
  isLowPowerActive?: boolean;
  effectiveResolution?: ResolutionOption;
  effectiveFps?: FpsOption;
  powerSavingsPercent?: number;
  batteryLevel?: number;
  lowPowerPolicy?: LowPowerPolicy;
  onSetLowPowerPolicy?: (policy: LowPowerPolicy) => void;
}

export const LiveBufferPanel: React.FC<LiveBufferPanelProps> = ({
  isBuffering,
  bufferedSeconds,
  maxBufferSeconds,
  onToggleBuffer,
  onClip,
  onSetMaxBuffer,
  resolution,
  fps,
  onSetResolution,
  onSetFps,
  isPremium,
  userTier = 'free',
  onOpenPremium,
  isSaving,
  micEnabled,
  onToggleMic,
  audioMode = micEnabled ? 'game_and_mic' : 'game_only',
  onSetAudioMode,
  onAddMarker,
  totalSavedCount,
  isLowPowerActive = false,
  effectiveResolution,
  effectiveFps,
  powerSavingsPercent = 0,
  batteryLevel = 80,
  lowPowerPolicy = 'auto',
  onSetLowPowerPolicy,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  const activeRes = effectiveResolution || resolution;
  const activeFps = effectiveFps || fps;

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Buffer percentage filled
  const bufferPercent = Math.min(100, Math.round((bufferedSeconds / maxBufferSeconds) * 100));

  // Simulated live audio meter pulse when mic is on
  useEffect(() => {
    if (!micEnabled || !isBuffering) {
      setMicLevel(0);
      return;
    }
    const interval = setInterval(() => {
      setMicLevel(Math.floor(Math.random() * 55 + 25));
    }, 150);
    return () => clearInterval(interval);
  }, [micEnabled, isBuffering]);

  const handleSelectResolution = (res: ResolutionOption) => {
    if (res === '1440p' && userTier === 'free') {
      onOpenPremium('2K (1440p) Resolution (Premium · ₹29)');
      return;
    }
    if (res === '4k' && userTier !== 'ultra_4k') {
      onOpenPremium('4K Ultra-HD Resolution (Premium Plus · ₹99)');
      return;
    }
    onSetResolution(res);
  };

  const handleSelectFps = (f: FpsOption) => {
    if (f === 90 && userTier === 'free') {
      onOpenPremium('90 FPS High-Refresh Capture (Premium · ₹29)');
      return;
    }
    if (f === 120 && userTier !== 'ultra_4k') {
      onOpenPremium('120 FPS Ultra-Refresh Capture (Premium Plus · ₹99)');
      return;
    }
    onSetFps(f);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto pb-2 space-y-4">
      {/* Whole Screen & Game Mode Status Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#121620] border border-white/[0.07] rounded-2xl">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white">
          <Monitor className="w-4 h-4 text-rose-400" />
          <span>Whole Screen &amp; Game Recording</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono-numbers">
          <span>
            {isLowPowerActive ? `Eco ${activeRes.toUpperCase()} · ${activeFps} FPS` : 'System Audio + DisplayMedia'}
          </span>
        </div>
      </div>

      {/* Active Low Power Mode Alert Banner */}
      {isLowPowerActive && (
        <div className="px-4 py-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <BatteryWarning className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-xs leading-tight">
              <div className="font-semibold text-amber-200 flex items-center gap-2">
                <span>Low Power Mode Active ({batteryLevel}%)</span>
                <span className="text-emerald-300 font-mono-numbers">
                  · -{powerSavingsPercent}% Load
                </span>
              </div>
              <div className="text-slate-300 mt-0.5">
                Throttled from {RESOLUTION_SLOTS[resolution].shortLabel} {fps} FPS to{' '}
                <strong className="text-amber-300">
                  {RESOLUTION_SLOTS[activeRes].shortLabel} {activeFps} FPS
                </strong>{' '}
                to preserve gameplay frame rate
              </div>
            </div>
          </div>
          {onSetLowPowerPolicy && (
            <button
              type="button"
              onClick={() => onSetLowPowerPolicy('off')}
              className="py-1.5 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-amber-500/30 text-xs font-medium text-amber-300 shrink-0 cursor-pointer"
            >
              Bypass
            </button>
          )}
        </div>
      )}

      {/* Main Buffer Gauge Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#121620] border border-white/[0.07] p-6 flex flex-col items-center">
        {/* Subtle background glow */}
        {isBuffering && (
          <div
            className={`absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
              isLowPowerActive ? 'bg-amber-500/10' : 'bg-rose-500/10'
            }`}
          />
        )}

        {/* Circular Radar / Progress Gauge */}
        <div className="relative w-44 h-44 flex items-center justify-center my-2">
          {/* Outer SVG Gauge Track */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            {/* Background Circle */}
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="transparent"
              stroke="rgba(30, 41, 59, 0.7)"
              strokeWidth="10"
            />
            {/* Active Buffered Ring */}
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="transparent"
              stroke={isBuffering ? (isLowPowerActive ? '#f59e0b' : '#f43f5e') : '#475569'}
              strokeWidth="10"
              strokeDasharray={427}
              strokeDashoffset={427 - (427 * bufferPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Central Live Status & Tabular Timer */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            {isBuffering ? (
              <>
                <div
                  className={`flex items-center gap-1 text-[11px] font-semibold tracking-wider ${
                    isLowPowerActive ? 'text-amber-400' : 'text-rose-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full animate-ping ${
                      isLowPowerActive ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />
                  <span>{isLowPowerActive ? 'ECO BUFFER' : 'BUFFERING'}</span>
                </div>
                <div className="text-3xl font-bold font-mono-numbers text-white tracking-tight mt-0.5">
                  {formatTime(bufferedSeconds)}
                </div>
                <div className="text-[11px] font-mono-numbers text-slate-400">
                  / {formatTime(maxBufferSeconds)} Max
                </div>
              </>
            ) : (
              <>
                <div className="text-xs font-medium text-slate-400">STANDBY</div>
                <div className="text-2xl font-bold font-display text-slate-300 mt-1">Ready</div>
                <div className="text-[11px] text-slate-500">Tap Activate to record</div>
              </>
            )}
          </div>
        </div>

        {/* Unboxed Metadata Stats */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 mt-2">
          <span className="font-semibold text-slate-300">
            {RESOLUTION_SLOTS[activeRes].shortLabel}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{activeFps} FPS</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-rose-300 font-semibold">
            {AUDIO_MODE_OPTIONS[audioMode].shortLabel}
          </span>
          {isLowPowerActive && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                <Zap className="w-3 h-3 fill-amber-400" />
                LOW POWER
              </span>
            </>
          )}
          {isPremium && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                <Crown className="w-3 h-3 fill-amber-400" />
                PRO
              </span>
            </>
          )}
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{totalSavedCount} Saved Clips</span>
        </div>

        {/* Audio Recording Quick Selector inside Buffer Card */}
        <div className="w-full mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-rose-400" />
              <span>Audio Recording</span>
            </span>
            <span className="text-[10px] font-mono-numbers font-bold text-rose-400">
              {AUDIO_MODE_OPTIONS[audioMode].label}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {(
              [
                { id: 'game_only' as AudioRecordingMode, label: 'Game Audio Only', icon: Volume2 },
                { id: 'mic_only' as AudioRecordingMode, label: 'Mic Only', icon: Mic },
                { id: 'game_and_mic' as AudioRecordingMode, label: 'Game + Mic', icon: Headphones },
              ]
            ).map((opt) => {
              const IconComp = opt.icon;
              const isSelected = audioMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    if (onSetAudioMode) {
                      onSetAudioMode(opt.id);
                    } else {
                      onToggleMic();
                    }
                  }}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <IconComp className="w-3 h-3 shrink-0" />
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Buffer Memory Window Selector right below Audio Recording (Exact Same Theme) */}
        <div className="w-full mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>Buffer Memory Window</span>
            </span>
            <span className="text-[10px] font-mono-numbers font-bold text-rose-400">
              {maxBufferSeconds}s
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {[
              { label: '30s', val: 30 as BufferDuration },
              { label: '1m', val: 60 as BufferDuration },
              { label: '2m', val: 120 as BufferDuration },
              { label: '3m', val: 180 as BufferDuration },
              { label: '5m', val: 300 as BufferDuration },
            ].map((opt) => {
              const isSelected = maxBufferSeconds === opt.val;
              return (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => onSetMaxBuffer(opt.val)}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Replay Buffer Switch Button */}
        <div className="w-full mt-5">
          <button
            onClick={() => onToggleBuffer('screen_capture')}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
              isBuffering
                ? 'bg-slate-800 text-rose-400 hover:bg-slate-700 border border-rose-500/30'
                : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-950/40'
            }`}
          >
            {isBuffering ? (
              <>
                <Square className="w-4 h-4 fill-rose-400 text-rose-400" />
                <span>Pause Replay Buffer</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white text-white" />
                <span>Activate 5-Min Replay Buffer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary Highlight Capture Hub (Natural Reach Zone) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>Instant Retroactive Highlights</span>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Recording Options"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Action: Clip Last 5 Minutes */}
        <button
          disabled={!isBuffering || bufferedSeconds < 10 || isSaving}
          onClick={() => onClip(maxBufferSeconds)}
          className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-display font-bold text-base shadow-xl shadow-rose-950/40 flex items-center justify-between transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="leading-tight">CLIP LAST 5 MINUTES</span>
              <span className="text-[11px] font-normal text-rose-100 font-sans">
                Retroactively save up to {formatTime(maxBufferSeconds)} highlight
              </span>
            </div>
          </div>
          <div className="text-right">
            {isSaving ? (
              <span className="text-xs font-semibold animate-pulse">Encoding...</span>
            ) : (
              <span className="font-mono-numbers text-xs bg-black/30 py-1 px-2.5 rounded-lg font-bold">
                {formatTime(Math.min(bufferedSeconds, maxBufferSeconds))}
              </span>
            )}
          </div>
        </button>

        {/* Quick Granular Time Slices */}
        <div className="grid grid-cols-3 gap-2">
          <button
            disabled={!isBuffering || bufferedSeconds < 15 || isSaving}
            onClick={() => onClip(120)}
            className="py-2.5 px-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white font-medium text-xs flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-40"
          >
            <span className="font-bold text-slate-200">Clip 2 Min</span>
            <span className="text-[10px] text-slate-400 font-mono-numbers">120s action</span>
          </button>

          <button
            disabled={!isBuffering || bufferedSeconds < 10 || isSaving}
            onClick={() => onClip(60)}
            className="py-2.5 px-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white font-medium text-xs flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-40"
          >
            <span className="font-bold text-slate-200">Clip 60 Sec</span>
            <span className="text-[10px] text-slate-400 font-mono-numbers">Clutch round</span>
          </button>

          <button
            disabled={!isBuffering || bufferedSeconds < 5 || isSaving}
            onClick={() => onClip(30)}
            className="py-2.5 px-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white font-medium text-xs flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-40"
          >
            <span className="font-bold text-slate-200">Clip 30 Sec</span>
            <span className="text-[10px] text-slate-400 font-mono-numbers">Shorts / Reel</span>
          </button>
        </div>

        {/* Drop Marker / Pin Action */}
        <button
          disabled={!isBuffering}
          onClick={() => onAddMarker('Epic Kill')}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-sky-300 font-medium text-xs flex items-center justify-center gap-2 active:scale-98 disabled:opacity-40 transition-colors"
        >
          <Bookmark className="w-4 h-4 text-sky-400" />
          <span>Drop Highlight Pin (Marker at current second)</span>
        </button>
      </div>

      {/* Audio & Quick Settings Drawer */}
      {showSettings && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Quick Stream Config
            </span>
            {userTier === 'free' ? (
              <button
                onClick={() => onOpenPremium()}
                className="text-[11px] font-bold text-amber-400 flex items-center gap-1 hover:underline"
              >
                <Crown className="w-3.5 h-3.5 fill-amber-400" />
                Get Premium (₹29 / ₹99)
              </button>
            ) : userTier === 'pro_2k' ? (
              <button
                onClick={() => onOpenPremium('4K & 120 FPS Premium Plus')}
                className="text-[11px] font-bold text-rose-400 flex items-center gap-1 hover:underline"
              >
                <Crown className="w-3.5 h-3.5 fill-rose-400" />
                Get Premium Plus (₹99)
              </button>
            ) : (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Premium Plus Active
              </span>
            )}
          </div>

          {/* Max Buffer Duration Selector */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
              Maximum Rolling Buffer Window
            </label>
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              {[
                { label: '30s', val: 30 as BufferDuration },
                { label: '1m', val: 60 as BufferDuration },
                { label: '2m', val: 120 as BufferDuration },
                { label: '3m', val: 180 as BufferDuration },
                { label: '5m', val: 300 as BufferDuration },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => onSetMaxBuffer(opt.val)}
                  className={`py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    maxBufferSeconds === opt.val
                      ? 'bg-rose-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Resolution Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-medium text-slate-400">
                Resolution Slot
              </label>
              <span className="text-[10px] text-slate-500 font-mono-numbers">
                Free: 480p-1080p · Premium: 2K (₹29) · Premium Plus: 4K (₹99)
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              {(['480p', '720p', '1080p', '1440p', '4k'] as ResolutionOption[]).map((res) => {
                const slot = RESOLUTION_SLOTS[res];
                const isLocked =
                  (res === '1440p' && userTier === 'free') ||
                  (res === '4k' && userTier !== 'ultra_4k');
                return (
                  <button
                    key={res}
                    onClick={() => handleSelectResolution(res)}
                    className={`py-2 px-1 text-xs font-medium rounded-lg transition-all flex flex-col items-center justify-center gap-0.5 ${
                      resolution === res
                        ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950/40 ring-1 ring-rose-400/40'
                        : isLocked
                        ? 'text-slate-500 hover:text-amber-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-0.5">
                      <span className="font-bold">{slot.shortLabel}</span>
                      {isLocked && <Lock className="w-2.5 h-2.5 text-amber-500/80" />}
                    </div>
                    <span className={`text-[8px] font-mono-numbers ${
                      resolution === res ? 'text-rose-200' : isLocked ? 'text-amber-500/70' : 'text-slate-500'
                    }`}>
                      {slot.priceTag}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-1 px-1 flex items-center justify-between text-[10px] text-slate-500 font-mono-numbers">
              <span>Slot: {RESOLUTION_SLOTS[activeRes]?.width}×{RESOLUTION_SLOTS[activeRes]?.height}</span>
              <span>{RESOLUTION_SLOTS[activeRes]?.storagePerMinute}</span>
            </div>
          </div>

          {/* Quick Frame Rate Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-medium text-slate-400">
                Frame Rate (FPS)
              </label>
              <span className="text-[10px] text-slate-500 font-mono-numbers">
                30-60 Free · Premium: 90 FPS (₹29) · Premium Plus: 120 FPS (₹99)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              {([30, 60, 90, 120] as FpsOption[]).map((f) => {
                const isLocked =
                  (f === 90 && userTier === 'free') ||
                  (f === 120 && userTier !== 'ultra_4k');
                return (
                  <button
                    key={f}
                    onClick={() => handleSelectFps(f)}
                    className={`py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
                      fps === f
                        ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950/40 ring-1 ring-rose-400/40'
                        : isLocked
                        ? 'text-slate-500 hover:text-amber-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{f} FPS</span>
                    {isLocked && <Lock className="w-2.5 h-2.5 text-amber-500/80" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Low Power Mode Selector */}
          {onSetLowPowerPolicy && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Low Power Mode (Battery Throttling)</span>
                </span>
                <span className="text-[10px] font-mono-numbers text-slate-400">
                  Battery: {batteryLevel}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                {[
                  { id: 'auto' as LowPowerPolicy, label: 'Auto' },
                  { id: 'always_on' as LowPowerPolicy, label: 'Always Eco' },
                  { id: 'off' as LowPowerPolicy, label: 'Off' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSetLowPowerPolicy(opt.id)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      lowPowerPolicy === opt.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Audio Recording Mode & Visualizer */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
                <Headphones className="w-3.5 h-3.5 text-rose-400" />
                <span>Audio Recording Source</span>
              </div>
              {(audioMode === 'mic_only' || audioMode === 'game_and_mic') && (
                <div className="flex items-center gap-1.5 w-24">
                  <Mic className="w-3 h-3 text-sky-400 shrink-0" />
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-400 h-full transition-all duration-100"
                      style={{ width: `${micLevel}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              {(
                [
                  { id: 'game_only' as AudioRecordingMode, label: 'Game Audio Only' },
                  { id: 'mic_only' as AudioRecordingMode, label: 'Mic Only' },
                  { id: 'game_and_mic' as AudioRecordingMode, label: 'Game + Mic' },
                ]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    if (onSetAudioMode) {
                      onSetAudioMode(opt.id);
                    } else {
                      onToggleMic();
                    }
                  }}
                  className={`py-1.5 px-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                    audioMode === opt.id
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-slate-400">
              {AUDIO_MODE_OPTIONS[audioMode].description}
            </div>
          </div>
        </div>
      )}

      {/* Informational reassurance footer */}
      <div className="flex items-start gap-2 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/50 text-[11px] text-slate-400 leading-relaxed">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <span>
          <strong>How 5-Min Replay Buffer works:</strong> Gameplay is continuously recorded into a rolling RAM buffer. Only when you pull off an insane play and tap &quot;Clip&quot;, the video is permanently packaged and saved into your Highlight Vault!
        </span>
      </div>
    </div>
  );
};

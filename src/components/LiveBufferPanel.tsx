import React from 'react';
import {
  Play,
  Square,
  Mic,
  Bookmark,
  Volume2,
  Headphones,
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
}) => {
  const activeRes = effectiveResolution || resolution;
  const activeFps = effectiveFps || fps;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const bufferPercent = Math.min(100, Math.round((bufferedSeconds / maxBufferSeconds) * 100));

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto space-y-5">
      {/* Main Buffer Gauge & Controls Card */}
      <div className="rounded-2xl bg-[#11151e] border border-white/[0.06] divide-y divide-white/[0.05]">
        {/* Section 1: Circular Timer & Primary Action */}
        <div className="p-6 flex flex-col items-center text-center">
          <div className="relative w-40 h-40 flex items-center justify-center my-1">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="8"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="transparent"
                stroke={isBuffering ? (isLowPowerActive ? '#f59e0b' : '#e11d48') : '#334155'}
                strokeWidth="8"
                strokeDasharray={427}
                strokeDashoffset={427 - (427 * bufferPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-300 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
              <span className="text-xs font-medium text-slate-400">
                {isBuffering ? (isLowPowerActive ? 'Eco Buffer' : 'Buffering') : 'Standby'}
              </span>
              <span className="text-3xl font-semibold font-mono-numbers text-white tracking-tight mt-0.5">
                {formatTime(bufferedSeconds)}
              </span>
              <span className="text-xs font-mono-numbers text-slate-500 mt-0.5">
                of {formatTime(maxBufferSeconds)}
              </span>
            </div>
          </div>

          {/* Unboxed Summary Line */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 font-mono-numbers mt-3">
            <span className="text-slate-200">{RESOLUTION_SLOTS[activeRes].shortLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{activeFps} FPS</span>
            <span aria-hidden="true">·</span>
            <span>{AUDIO_MODE_OPTIONS[audioMode].shortLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{totalSavedCount} Saved</span>
          </div>

          <div className="w-full max-w-sm mt-5">
            <button
              type="button"
              onClick={() => onToggleBuffer('screen_capture')}
              className={`w-full py-3 px-4 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isBuffering
                  ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08]'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              {isBuffering ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Stop Replay Buffer</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Replay Buffer</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 2: Buffer Duration & Audio Source */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Buffer Length</span>
              <span className="font-mono-numbers text-slate-400">{maxBufferSeconds}s</span>
            </div>
            <div className="grid grid-cols-5 gap-1 p-1 bg-[#090b10] rounded-xl border border-white/[0.05]">
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
                    className={`py-2 rounded-lg text-xs font-mono-numbers font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Audio Source</span>
              <span className="text-slate-400">{AUDIO_MODE_OPTIONS[audioMode].shortLabel}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#090b10] rounded-xl border border-white/[0.05]">
              {(
                [
                  { id: 'game_only' as AudioRecordingMode, label: 'Game', icon: Volume2 },
                  { id: 'mic_only' as AudioRecordingMode, label: 'Mic', icon: Mic },
                  { id: 'game_and_mic' as AudioRecordingMode, label: 'Both', icon: Headphones },
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
                    className={`py-2 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5 shrink-0" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Instant Clip Actions */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Save Highlight Clip</span>
            <span className="text-slate-400 font-mono-numbers">
              {isSaving ? 'Saving clip...' : `${formatTime(Math.min(bufferedSeconds, maxBufferSeconds))} available`}
            </span>
          </div>

          <button
            type="button"
            disabled={!isBuffering || bufferedSeconds < 1 || isSaving}
            onClick={() => onClip(maxBufferSeconds)}
            className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display font-semibold text-sm flex items-center justify-between transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Save Full Replay Buffer</span>
            <span className="text-xs font-mono-numbers text-rose-100">
              {formatTime(Math.min(bufferedSeconds, maxBufferSeconds))}
            </span>
          </button>

          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              disabled={!isBuffering || bufferedSeconds < 1 || isSaving}
              onClick={() => onClip(30)}
              className="py-2.5 px-2 rounded-xl bg-[#090b10] hover:bg-white/[0.04] border border-white/[0.06] text-white font-mono-numbers text-xs font-medium disabled:opacity-40 transition-colors cursor-pointer"
            >
              30s
            </button>
            <button
              type="button"
              disabled={!isBuffering || bufferedSeconds < 1 || isSaving}
              onClick={() => onClip(60)}
              className="py-2.5 px-2 rounded-xl bg-[#090b10] hover:bg-white/[0.04] border border-white/[0.06] text-white font-mono-numbers text-xs font-medium disabled:opacity-40 transition-colors cursor-pointer"
            >
              60s
            </button>
            <button
              type="button"
              disabled={!isBuffering || bufferedSeconds < 1 || isSaving}
              onClick={() => onClip(120)}
              className="py-2.5 px-2 rounded-xl bg-[#090b10] hover:bg-white/[0.04] border border-white/[0.06] text-white font-mono-numbers text-xs font-medium disabled:opacity-40 transition-colors cursor-pointer"
            >
              2m
            </button>
            <button
              type="button"
              disabled={!isBuffering}
              onClick={() => onAddMarker('Highlight')}
              className="py-2.5 px-2 rounded-xl bg-[#090b10] hover:bg-white/[0.04] border border-white/[0.06] text-slate-200 text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-rose-400" />
              <span>Pin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

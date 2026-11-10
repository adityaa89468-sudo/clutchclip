import React, { useEffect, useRef, useState } from 'react';
import {
  Maximize2,
  Minimize2,
  Square,
  Play,
  Volume2,
  Mic,
  Bookmark,
  HelpCircle,
  RefreshCw,
  Lock,
  Sliders,
  EyeOff,
  Headphones
} from 'lucide-react';
import {
  BufferDuration,
  ResolutionOption,
  FpsOption,
  LogoConfig,
  MembershipTier,
  LowPowerPolicy,
  AudioRecordingMode,
  AUDIO_MODE_OPTIONS,
  RESOLUTION_SLOTS
} from '../types/recorder';
import { replayEngine } from '../services/replayBufferEngine';
import { soundEffects } from '../services/soundEffects';
import { GameDetectionResult } from '../services/gameDetector';
import { AppLogo } from './AppLogo';
import { AdMobBannerBar } from './AdMobBannerBar';

interface LiveScreenMonitorProps {
  isBuffering: boolean;
  bufferedSeconds: number;
  maxBufferSeconds: BufferDuration;
  onToggleBuffer: () => void;
  onClip: (seconds: number) => void;
  onAddMarker: (label: string) => void;
  isSaving: boolean;
  resolution: ResolutionOption;
  fps: FpsOption;
  onSetResolution: (res: ResolutionOption) => void;
  onSetFps: (fps: FpsOption) => void;
  userTier?: MembershipTier;
  logoConfig: LogoConfig;
  onChangeLogoConfig?: (newConfig: LogoConfig) => void;
  isPremium: boolean;
  micEnabled: boolean;
  onToggleMic: () => void;
  audioMode?: AudioRecordingMode;
  onSetAudioMode?: (mode: AudioRecordingMode) => void;
  currentGameName: string;
  onChangeGameName: (name: string) => void;
  onRequirePremium: (feature: string) => void;
  isLowPowerActive?: boolean;
  effectiveResolution?: ResolutionOption;
  effectiveFps?: FpsOption;
  powerSavingsPercent?: number;
  batteryLevel?: number;
  lowPowerPolicy?: LowPowerPolicy;
  onSetLowPowerPolicy?: (policy: LowPowerPolicy) => void;
  onToggleSimulateLowBattery?: () => void;
  isSimulatedLowBattery?: boolean;
}

const POPULAR_GAMES = [
  'Valorant',
  'BGMI',
  'GTA V',
  'Apex Legends',
  'CS2',
  'Fortnite',
  'Minecraft',
  'Call of Duty'
];

export const LiveScreenMonitor: React.FC<LiveScreenMonitorProps> = ({
  isBuffering,
  bufferedSeconds,
  maxBufferSeconds,
  onToggleBuffer,
  onClip,
  onAddMarker,
  isSaving,
  resolution,
  fps,
  onSetResolution,
  onSetFps,
  userTier = 'free',
  logoConfig,
  onChangeLogoConfig,
  isPremium,
  micEnabled,
  onToggleMic,
  audioMode = micEnabled ? 'game_and_mic' : 'game_only',
  onSetAudioMode,
  currentGameName,
  onChangeGameName,
  onRequirePremium,
  isLowPowerActive = false,
  effectiveResolution,
  effectiveFps,
  powerSavingsPercent = 0,
  batteryLevel = 80,
  lowPowerPolicy = 'auto',
  onSetLowPowerPolicy,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [autoDetectResult, setAutoDetectResult] = useState<GameDetectionResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hardwareSettings, setHardwareSettings] = useState<MediaTrackSettings | null>(null);
  const [showHudSlotPicker, setShowHudSlotPicker] = useState(false);

  useEffect(() => {
    const unbind = replayEngine.onGameDetected((detection) => {
      setAutoDetectResult(detection);
    });
    return () => unbind();
  }, []);

  const handleScanActiveGame = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = replayEngine.detectCurrentGame();
      if (res && res.detected) {
        setAutoDetectResult(res);
        onChangeGameName(res.gameName);
      }
      setIsScanning(false);
    }, 350);
  };

  useEffect(() => {
    if (isBuffering) {
      const inspectTrack = () => {
        const settings = replayEngine.getTrackSettings();
        if (settings) {
          setHardwareSettings(settings);
        }
      };
      inspectTrack();
      const interval = setInterval(inspectTrack, 1500);
      return () => clearInterval(interval);
    } else {
      setHardwareSettings(null);
      setShowHudSlotPicker(false);
    }
  }, [isBuffering]);

  useEffect(() => {
    const stream = replayEngine.getLiveStream();
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [isBuffering]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const bufferPercent = Math.min(100, Math.round((bufferedSeconds / maxBufferSeconds) * 100));

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSelectResolution = (res: ResolutionOption) => {
    if (res === '1440p' && userTier === 'free') {
      onRequirePremium('2K (1440p) Resolution (Premium · ₹29)');
      return;
    }
    if (res === '4k' && userTier !== 'ultra_4k') {
      onRequirePremium('4K Ultra-HD Resolution (Premium Plus · ₹99)');
      return;
    }
    onSetResolution(res);
    soundEffects.playMarkerDropSound();
  };

  const handleSelectFps = (newFps: FpsOption) => {
    if (newFps === 90 && userTier === 'free') {
      onRequirePremium('90 FPS Capture (Premium · ₹29)');
      return;
    }
    if (newFps === 120 && userTier !== 'ultra_4k') {
      onRequirePremium('120 FPS Capture (Premium Plus · ₹99)');
      return;
    }
    onSetFps(newFps);
    soundEffects.playMarkerDropSound();
  };

  const activeResKey = effectiveResolution || resolution;
  const activeFpsVal = effectiveFps || fps;
  const activeResSlot = RESOLUTION_SLOTS[activeResKey] || RESOLUTION_SLOTS['1080p'];

  const shouldShowLogo = !isPremium || logoConfig.showLogo;
  const positionClasses: Record<string, string> = {
    'top-right': 'top-3 right-3',
    'top-left': 'top-3 left-3',
    'bottom-right': 'bottom-14 right-3',
    'bottom-left': 'bottom-14 left-3',
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto space-y-5 select-none pb-8">
      {!isBuffering ? (
        <div className="space-y-5">
          {/* Card 1: Clean Launch Card */}
          <div className="p-6 rounded-2xl bg-[#11151e] border border-white/[0.06] space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-semibold font-display text-white tracking-tight">
                  Screen &amp; Gameplay Recorder
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                  Keep a rolling 5-minute memory buffer of your screen. Save the last few minutes anytime after a highlight happens.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowHelpGuide(!showHelpGuide)}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                title="How it works"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {showHelpGuide && (
              <div className="p-4 rounded-xl bg-[#090b10] border border-white/[0.05] space-y-2 text-xs text-slate-300">
                <div className="font-medium text-white">How to capture highlights</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Select your preferred video quality and audio mode below.</li>
                  <li>Tap <strong className="text-slate-200">Start 5-Minute Replay Buffer</strong> and allow screen capture.</li>
                  <li>Play your game normally; press <strong className="text-slate-200">Clip 5m</strong> anytime to save the clip.</li>
                </ol>
              </div>
            )}

            {/* Game Title Input */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-slate-300">Game or App Title</label>
                {autoDetectResult?.detected && (
                  <span className="text-slate-400">
                    Detected: <strong className="text-slate-200">{autoDetectResult.gameName}</strong>
                  </span>
                )}
              </div>

              <div className="relative flex items-center">
                <input
                  type="text"
                  value={currentGameName}
                  onChange={(e) => onChangeGameName(e.target.value)}
                  placeholder="Enter game title..."
                  className="w-full bg-[#090b10] border border-white/[0.07] rounded-xl pl-3.5 pr-24 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/[0.2] transition-colors"
                />
                <button
                  type="button"
                  onClick={handleScanActiveGame}
                  disabled={isScanning}
                  className="absolute right-1.5 py-1.5 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 text-slate-400 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Scanning' : 'Detect'}</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {POPULAR_GAMES.map((game) => {
                  const active = currentGameName.toLowerCase() === game.toLowerCase();
                  return (
                    <button
                      key={game}
                      type="button"
                      onClick={() => onChangeGameName(game)}
                      className={`py-1 px-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-white/[0.12] text-white'
                          : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                      }`}
                    >
                      {game}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Start Button */}
            <div className="pt-1 space-y-2.5">
              <button
                type="button"
                onClick={onToggleBuffer}
                className="w-full py-3.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display font-semibold text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.99] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start 5-Minute Replay Buffer</span>
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 font-mono-numbers">
                <span className="text-slate-300">{activeResSlot.name}</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300">{activeFpsVal} FPS</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300">{AUDIO_MODE_OPTIONS[audioMode].label}</span>
                <span aria-hidden="true">·</span>
                <span>{maxBufferSeconds / 60}m Buffer</span>
                {isLowPowerActive && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-400">Eco (-{powerSavingsPercent}%)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Inline Ad Slot in empty space between cards (Free Tier Only) */}
          <AdMobBannerBar
            isPremium={isPremium}
            onOpenPremium={() => onRequirePremium('Ad-Free Experience (Premium · ₹29)')}
            variant="compact"
          />

          {/* Card 2: Clean Preferences Container */}
          <div className="rounded-2xl bg-[#11151e] border border-white/[0.06] divide-y divide-white/[0.05]">
            {/* Video Quality & Frame Rate */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Video Quality</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeResSlot.width} × {activeResSlot.height} · {activeResSlot.storagePerMinute}
                  </p>
                </div>
                <span className="text-xs font-mono-numbers text-slate-400">
                  {activeResSlot.shortLabel} · {activeFpsVal} FPS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Resolution</span>
                    <span className="text-[11px] text-slate-500">Free up to 1080p</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 p-1 bg-[#090b10] rounded-xl border border-white/[0.05]">
                    {(['480p', '720p', '1080p', '1440p', '4k'] as ResolutionOption[]).map((resKey) => {
                      const slot = RESOLUTION_SLOTS[resKey];
                      const isSelected = resolution === resKey;
                      const isLocked =
                        (resKey === '1440p' && userTier === 'free') ||
                        (resKey === '4k' && userTier !== 'ultra_4k');

                      return (
                        <button
                          key={resKey}
                          type="button"
                          onClick={() => handleSelectResolution(resKey)}
                          className={`py-2 px-1 rounded-lg transition-colors flex items-center justify-center gap-0.5 cursor-pointer whitespace-nowrap ${
                            isSelected
                              ? 'bg-rose-600 text-white font-semibold'
                              : isLocked
                              ? 'text-slate-500 hover:text-slate-300'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-mono-numbers">{slot.shortLabel}</span>
                          {isLocked && <Lock className="w-2.5 h-2.5 text-slate-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Frame Rate</span>
                    <span className="text-[11px] text-slate-500">Free up to 60 FPS</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-[#090b10] rounded-xl border border-white/[0.05]">
                    {([30, 60, 90, 120] as FpsOption[]).map((fVal) => {
                      const isSelected = fps === fVal;
                      const isLocked =
                        (fVal === 90 && userTier === 'free') ||
                        (fVal === 120 && userTier !== 'ultra_4k');

                      return (
                        <button
                          key={fVal}
                          type="button"
                          onClick={() => handleSelectFps(fVal)}
                          className={`py-2 px-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs cursor-pointer whitespace-nowrap ${
                            isSelected
                              ? 'bg-rose-600 text-white font-semibold'
                              : isLocked
                              ? 'text-slate-500 hover:text-slate-300'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          <span className="font-mono-numbers">{fVal}</span>
                          {isLocked && <Lock className="w-2.5 h-2.5 text-slate-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Recording Source */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Audio Source</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {AUDIO_MODE_OPTIONS[audioMode].description}
                  </p>
                </div>
                <span className="text-xs font-mono-numbers text-slate-400">
                  {AUDIO_MODE_OPTIONS[audioMode].label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#090b10] rounded-xl border border-white/[0.05]">
                {(
                  [
                    { id: 'game_only' as AudioRecordingMode, label: 'Game Audio', icon: Volume2 },
                    { id: 'mic_only' as AudioRecordingMode, label: 'Mic Only', icon: Mic },
                    { id: 'game_and_mic' as AudioRecordingMode, label: 'Game + Mic', icon: Headphones },
                  ]
                ).map((item) => {
                  const IconComp = item.icon;
                  const isSelected = audioMode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (onSetAudioMode) {
                          onSetAudioMode(item.id);
                        } else {
                          onToggleMic();
                        }
                      }}
                      className={`py-2 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-rose-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Watermark & Battery Row */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white">Video Watermark</div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">
                    {!shouldShowLogo ? 'Hidden in saved clips' : 'Shown on saved clips'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!isPremium) {
                      onRequirePremium('Hide Watermark in Video (Premium · ₹29)');
                      return;
                    }
                    onChangeLogoConfig?.({
                      ...logoConfig,
                      showLogo: !shouldShowLogo,
                    });
                  }}
                  className="py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-slate-200 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {!shouldShowLogo ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Hidden</span>
                    </>
                  ) : (
                    <>
                      {!isPremium && <Lock className="w-3 h-3 text-slate-400" />}
                      <span>Hide Logo</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 sm:border-l sm:border-white/[0.05] sm:pl-4">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white">Power Saver</div>
                  <div className="text-xs text-slate-400 truncate mt-0.5 font-mono-numbers">
                    {isLowPowerActive
                      ? `Eco 30 FPS (${batteryLevel}%)`
                      : `Auto ≤20% (${batteryLevel}%)`}
                  </div>
                </div>

                {onSetLowPowerPolicy && (
                  <button
                    type="button"
                    onClick={() =>
                      onSetLowPowerPolicy(
                        lowPowerPolicy === 'always_on'
                          ? 'auto'
                          : lowPowerPolicy === 'auto'
                          ? 'off'
                          : 'always_on'
                      )
                    }
                    className="py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-slate-200 shrink-0 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {lowPowerPolicy === 'always_on'
                      ? 'Always Eco'
                      : lowPowerPolicy === 'auto'
                      ? 'Auto'
                      : 'Off'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active Buffering Monitor */
        <div className="space-y-4">
          <div
            ref={containerRef}
            className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-black border border-white/[0.07]"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain bg-black"
            />

            {/* Clean Top HUD */}
            <div className="absolute top-0 left-0 right-0 p-3.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md py-1 px-2.5 rounded-lg border border-white/10 text-xs font-medium text-white">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>{currentGameName || 'Screen'}</span>
                  <span className="text-slate-500">·</span>
                  <button
                    type="button"
                    onClick={() => setShowHudSlotPicker(!showHudSlotPicker)}
                    className="font-mono-numbers text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>{activeResSlot.shortLabel}</span>
                    <span>{activeFpsVal}fps</span>
                    <Sliders className="w-3 h-3 text-slate-400 ml-0.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={onToggleBuffer}
                  className="py-1 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Square className="w-3 h-3 fill-white" />
                  <span>Stop</span>
                </button>
              </div>
            </div>

            {showHudSlotPicker && (
              <div className="absolute top-13 left-3.5 z-30 p-3.5 bg-[#11151e]/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md space-y-2.5 w-64">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Capture Quality</span>
                  <button
                    type="button"
                    onClick={() => setShowHudSlotPicker(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Done
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-1">
                  {(['480p', '720p', '1080p', '1440p', '4k'] as ResolutionOption[]).map((rKey) => {
                    const isLocked =
                      (rKey === '1440p' && userTier === 'free') ||
                      (rKey === '4k' && userTier !== 'ultra_4k');
                    return (
                      <button
                        key={rKey}
                        type="button"
                        onClick={() => {
                          handleSelectResolution(rKey);
                          setShowHudSlotPicker(false);
                        }}
                        className={`py-1.5 text-[11px] font-mono-numbers rounded-lg flex items-center justify-center ${
                          resolution === rKey
                            ? 'bg-rose-600 text-white font-semibold'
                            : 'bg-white/[0.04] text-slate-300 hover:text-white'
                        }`}
                      >
                        <span>{RESOLUTION_SLOTS[rKey].shortLabel}</span>
                        {isLocked && <Lock className="w-2.5 h-2.5 ml-0.5 text-slate-500" />}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-4 gap-1">
                  {([30, 60, 90, 120] as FpsOption[]).map((f) => {
                    const isLocked =
                      (f === 90 && userTier === 'free') ||
                      (f === 120 && userTier !== 'ultra_4k');
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          handleSelectFps(f);
                          setShowHudSlotPicker(false);
                        }}
                        className={`py-1.5 text-[11px] font-mono-numbers rounded-lg flex items-center justify-center ${
                          fps === f
                            ? 'bg-rose-600 text-white font-semibold'
                            : 'bg-white/[0.04] text-slate-300 hover:text-white'
                        }`}
                      >
                        <span>{f}fps</span>
                        {isLocked && <Lock className="w-2.5 h-2.5 ml-0.5 text-slate-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* On-Screen Logo */}
            <div
              className={`absolute transition-all duration-150 pointer-events-none flex flex-col items-end gap-1 ${
                positionClasses[logoConfig.position] || 'top-3 right-3'
              }`}
            >
              <AppLogo
                size={logoConfig.size === 'small' ? 28 : logoConfig.size === 'medium' ? 38 : 52}
                variant={logoConfig.variant || 'main'}
                customLogoUrl={logoConfig.customLogoUrl}
              />
            </div>

            {hardwareSettings && (
              <div className="absolute bottom-11 right-3.5 pointer-events-none text-[10px] font-mono-numbers text-slate-400">
                {hardwareSettings.width || activeResSlot.width}×{hardwareSettings.height || activeResSlot.height}
              </div>
            )}

            {/* Bottom Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-3.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between text-xs font-mono-numbers text-white">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold">{formatTime(bufferedSeconds)}</span>
                <span className="text-slate-400">/ {formatTime(maxBufferSeconds)}</span>
              </div>
              <div className="w-36 h-1.5 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${bufferPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Clean Clip Trigger Card */}
          <div className="p-5 rounded-2xl bg-[#11151e] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Save Retroactive Clip</span>
              <span className="font-mono-numbers text-slate-400">
                {bufferedSeconds}s buffered
              </span>
            </div>

            <button
              type="button"
              disabled={bufferedSeconds < 1 || isSaving}
              onClick={() => onClip(maxBufferSeconds)}
              className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display font-semibold text-sm flex items-center justify-between transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Save Last 5 Minutes</span>
              <span className="text-xs font-mono-numbers text-rose-100">
                {formatTime(Math.min(bufferedSeconds, maxBufferSeconds))}
              </span>
            </button>

            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                disabled={bufferedSeconds < 1 || isSaving}
                onClick={() => onClip(30)}
                className="py-2.5 px-2 rounded-xl bg-[#090b10] hover:bg-white/[0.04] border border-white/[0.06] text-white text-xs font-mono-numbers font-medium disabled:opacity-40 transition-colors cursor-pointer"
              >
                30s
              </button>

              <button
                type="button"
                disabled={bufferedSeconds < 1 || isSaving}
                onClick={() => onClip(60)}
                className="py-2.5 px-2 rounded-xl bg-[#090b10] hover:bg-white/[0.04] border border-white/[0.06] text-white text-xs font-mono-numbers font-medium disabled:opacity-40 transition-colors cursor-pointer"
              >
                60s
              </button>

              <button
                type="button"
                disabled={bufferedSeconds < 1 || isSaving}
                onClick={() => onClip(120)}
                className="py-2.5 px-2 rounded-xl bg-[#090b10] hover:bg-white/[0.04] border border-white/[0.06] text-white text-xs font-mono-numbers font-medium disabled:opacity-40 transition-colors cursor-pointer"
              >
                2m
              </button>

              <button
                type="button"
                onClick={() => onAddMarker('Highlight')}
                className="py-2.5 px-2 rounded-xl bg-[#090b10] hover:bg-white/[0.04] border border-white/[0.06] text-slate-200 text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-rose-400" />
                <span>Pin</span>
              </button>
            </div>
          </div>

          <AdMobBannerBar
            isPremium={isPremium}
            onOpenPremium={() => onRequirePremium('Ad-Free Experience (Premium · ₹29)')}
            variant="native"
          />
        </div>
      )}
    </div>
  );
};

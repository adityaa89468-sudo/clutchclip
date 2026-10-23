import React, { useEffect, useRef, useState } from 'react';
import {
  Monitor,
  Maximize2,
  Minimize2,
  Square,
  Play,
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  Radio,
  Bookmark,
  Zap,
  CheckCircle2,
  HelpCircle,
  Gamepad2,
  RefreshCw,
  Lock,
  Crown,
  Layers,
  Gauge,
  Sliders,
  Check,
  Eye,
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
  RESOLUTION_SLOTS,
  FPS_SLOTS
} from '../types/recorder';
import { replayEngine } from '../services/replayBufferEngine';
import { soundEffects } from '../services/soundEffects';
import { GameDetectionResult } from '../services/gameDetector';
import { AppLogo } from './AppLogo';

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
  'GTA V',
  'BGMI',
  'Apex Legends',
  'CS2',
  'Fortnite',
  'Minecraft',
  'Call of Duty',
  'League of Legends',
  'Roblox'
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
  onToggleSimulateLowBattery,
  isSimulatedLowBattery = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [autoDetectResult, setAutoDetectResult] = useState<GameDetectionResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hardwareSettings, setHardwareSettings] = useState<MediaTrackSettings | null>(null);
  const [showHudSlotPicker, setShowHudSlotPicker] = useState(false);

  // Listen to game auto-detection events
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

  // Inspect live capture stream hardware resolution
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

  // Bind live stream to video feed
  useEffect(() => {
    const stream = replayEngine.getLiveStream();
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [isBuffering]);

  // Format MM:SS
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

  // Handle slot resolution selection with tier validation
  const handleSelectResolution = (res: ResolutionOption) => {
    if (res === '1440p' && userTier === 'free') {
      onRequirePremium('2K (1440p) Quad-HD Slot (Premium · ₹29)');
      return;
    }
    if (res === '4k' && userTier !== 'ultra_4k') {
      onRequirePremium('4K Ultra-HD 2160p Slot (Premium Plus · ₹99)');
      return;
    }
    onSetResolution(res);
    soundEffects.playMarkerDropSound();
  };

  // Handle slot frame rate selection with tier validation
  const handleSelectFps = (newFps: FpsOption) => {
    if (newFps === 90 && userTier === 'free') {
      onRequirePremium('90 FPS High-Refresh Slot (Premium · ₹29)');
      return;
    }
    if (newFps === 120 && userTier !== 'ultra_4k') {
      onRequirePremium('120 FPS Ultra-Refresh Slot (Premium Plus · ₹99)');
      return;
    }
    onSetFps(newFps);
    soundEffects.playMarkerDropSound();
  };

  const activeResKey = effectiveResolution || resolution;
  const activeFpsVal = effectiveFps || fps;
  const activeResSlot = RESOLUTION_SLOTS[activeResKey] || RESOLUTION_SLOTS['1080p'];
  const activeFpsSlot = FPS_SLOTS[activeFpsVal] || FPS_SLOTS[60];

  // Watermark logo parameters
  const shouldShowLogo = !isPremium || logoConfig.showLogo;
  const sizeMap: Record<string, string> = {
    small: 'w-7 h-7 text-[10px]',
    medium: 'w-10 h-10 text-[12px]',
    large: 'w-14 h-14 text-[14px]',
  };
  const positionClasses: Record<string, string> = {
    'top-right': 'top-3 right-3',
    'top-left': 'top-3 left-3',
    'bottom-right': 'bottom-16 right-3',
    'bottom-left': 'bottom-16 left-3',
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto space-y-5 select-none pb-8">
      {/* If Not Buffering: Screen Capture Launchpad */}
      {!isBuffering ? (
        <div className="space-y-4">
          {/* Primary Launch Card */}
          <div className="p-6 rounded-2xl bg-[#121620] border border-white/[0.07] space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-rose-400">
                  Continuous 5-Minute Replay Buffer
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                  Record Your Gameplay
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                  Keep a rolling 5-minute memory buffer of your screen or game window. When a highlight happens, save the clip retroactively.
                </p>
              </div>

              <button
                onClick={() => setShowHelpGuide(!showHelpGuide)}
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                title="How screen capture works"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Step instructions toggle */}
            {showHelpGuide && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-2 text-xs text-slate-300">
                <div className="font-semibold text-white">
                  How to record your gameplay
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Choose your preferred resolution, frame rate, and audio mode below.</li>
                  <li>Click <strong className="text-slate-200">Start 5-Minute Replay Buffer</strong> and select your screen or game window.</li>
                  <li>Enable system audio sharing when prompted to capture in-game sound.</li>
                  <li>Play normally and press <strong className="text-slate-200">Clip 5m</strong> anytime to save the last 5 minutes.</li>
                </ol>
              </div>
            )}

            {/* Game Title Selector with Auto-Detect */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Active Game Title</span>
                </label>
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
                  placeholder="Enter or detect active game title..."
                  className="w-full bg-[#0b0e14] border border-white/[0.08] rounded-xl pl-3.5 pr-24 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleScanActiveGame}
                  disabled={isScanning}
                  className="absolute right-1.5 py-1.5 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Scan active window to detect game"
                >
                  <RefreshCw className={`w-3 h-3 text-rose-400 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Scanning' : 'Detect'}</span>
                </button>
              </div>

              {/* Quick Game Presets */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {POPULAR_GAMES.map((game) => (
                  <button
                    key={game}
                    type="button"
                    onClick={() => onChangeGameName(game)}
                    className={`py-1 px-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      currentGameName.toLowerCase() === game.toLowerCase()
                        ? 'bg-rose-600 text-white'
                        : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                    }`}
                  >
                    {game}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary CTA Button */}
            <div className="pt-2 space-y-2.5">
              <button
                onClick={onToggleBuffer}
                className="w-full py-3.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display font-semibold text-sm shadow-lg shadow-rose-950/30 flex items-center justify-center gap-2 transition-colors active:scale-[0.99] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start 5-Minute Replay Buffer</span>
              </button>

              {/* Clean Unboxed Summary Line */}
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
                    <span className="text-amber-400">Eco Mode (-{powerSavingsPercent}%)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Studio Configuration Card (Single-level container with clean hairline dividers) */}
          <div className="rounded-2xl bg-[#121620] border border-white/[0.07] divide-y divide-white/[0.06]">
            {/* Section 1: Resolution & Frame Rate */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white">Video Quality &amp; Frame Rate</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeResSlot.width} × {activeResSlot.height} · {Math.round(activeResSlot.baseBitrate / 1_000_000 * (activeFpsVal / 60) * (isLowPowerActive ? 0.55 : 1))} Mbps · {activeResSlot.storagePerMinute}
                  </p>
                </div>
                <span className="text-xs font-mono-numbers text-slate-400">
                  {activeResSlot.shortLabel} / {activeFpsVal} FPS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Resolution Segmented Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Resolution</span>
                    <span className="text-[11px] text-slate-500">Free up to 1080p</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 p-1 bg-[#0b0e14] rounded-xl border border-white/[0.06]">
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
                          className={`py-2 px-1 rounded-lg transition-colors flex flex-col items-center justify-center gap-0.5 cursor-pointer whitespace-nowrap ${
                            isSelected
                              ? 'bg-rose-600 text-white font-semibold'
                              : isLocked
                              ? 'text-slate-500 hover:text-amber-300'
                              : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-0.5">
                            <span className="text-xs font-mono-numbers">{slot.shortLabel}</span>
                            {isLocked && <Lock className="w-2.5 h-2.5 text-amber-400/80" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Frame Rate Segmented Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Frame Rate</span>
                    <span className="text-[11px] text-slate-500">Free up to 60 FPS</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-[#0b0e14] rounded-xl border border-white/[0.06]">
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
                              ? 'text-slate-500 hover:text-amber-300'
                              : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          <span className="font-mono-numbers">{fVal}</span>
                          {isLocked && <Lock className="w-2.5 h-2.5 text-amber-400/80 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Audio Recording Source */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white">Audio Recording</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {AUDIO_MODE_OPTIONS[audioMode].description}
                  </p>
                </div>
                <span className="text-xs font-mono-numbers text-slate-400">
                  {AUDIO_MODE_OPTIONS[audioMode].label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0b0e14] rounded-xl border border-white/[0.06]">
                {(
                  [
                    { id: 'game_only' as AudioRecordingMode, label: 'Game Audio Only', icon: Volume2 },
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
                      className={`py-2.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-rose-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Watermark & Low Power Controls */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Hide Logo in Recorded Video */}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>Recorded Video Logo</span>
                    {!isPremium && <span className="text-[11px] font-normal text-amber-400">· Premium</span>}
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">
                    {!isPremium
                      ? 'Keep on screen, hide in saved video'
                      : !shouldShowLogo
                      ? 'Shown on screen · Hidden in video'
                      : 'Visible on screen & recorded video'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!isPremium) {
                      onRequirePremium('Remove Watermark / Hide Logo (Subscribed Users Only)');
                      return;
                    }
                    onChangeLogoConfig?.({
                      ...logoConfig,
                      showLogo: !shouldShowLogo,
                    });
                  }}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer whitespace-nowrap ${
                    !shouldShowLogo
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/[0.05] text-slate-200 hover:bg-white/[0.1] border border-white/[0.08]'
                  }`}
                >
                  {!shouldShowLogo ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hidden in Video</span>
                    </>
                  ) : !isPremium ? (
                    <>
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Hide Logo</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide Logo</span>
                    </>
                  )}
                </button>
              </div>

              {/* Low Power Mode Quick Toggle */}
              <div className="flex items-center justify-between gap-3 sm:border-l sm:border-white/[0.06] sm:pl-4">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white">Low Power Mode</div>
                  <div className="text-xs text-slate-400 truncate mt-0.5 font-mono-numbers">
                    {isLowPowerActive
                      ? `Eco ${activeResSlot.shortLabel} @ ${activeFpsVal} FPS (${batteryLevel}%)`
                      : `Auto ≤20% (${batteryLevel}% battery)`}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onToggleSimulateLowBattery && (
                    <button
                      type="button"
                      onClick={onToggleSimulateLowBattery}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                        isSimulatedLowBattery
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                          : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
                      }`}
                      title="Simulate low battery state (14%)"
                    >
                      {isSimulatedLowBattery ? '14% Sim' : 'Test Low'}
                    </button>
                  )}
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
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        isLowPowerActive
                          ? 'bg-amber-500 text-slate-950 font-semibold'
                          : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] border border-white/[0.08]'
                      }`}
                    >
                      {lowPowerPolicy === 'always_on'
                        ? 'Eco On'
                        : lowPowerPolicy === 'auto'
                        ? 'Auto'
                        : 'Off'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* If Buffering: Live Screen Monitor & Real-Time Highlight Deck */
        <div className="space-y-4">
          {/* Live Video Monitor Frame */}
          <div
            ref={containerRef}
            className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-2xl group"
          >
            {/* Live Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain bg-black"
            />

            {/* Top HUD Overlay */}
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/85 via-black/50 to-transparent flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <div className="flex items-center gap-1.5 bg-slate-900/90 py-0.5 px-2 rounded-lg border border-slate-700/60 text-xs font-bold text-white font-display">
                  <span className="text-rose-400">REC</span>
                  <span>{currentGameName || 'Game Screen'}</span>
                  <button
                    onClick={handleScanActiveGame}
                    disabled={isScanning}
                    className="p-0.5 text-slate-400 hover:text-white transition-colors ml-0.5"
                    title="Rescan active game"
                  >
                    <RefreshCw className={`w-3 h-3 text-rose-400 ${isScanning ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Interactive Slot Badge on Recording HUD */}
                <button
                  type="button"
                  onClick={() => setShowHudSlotPicker(!showHudSlotPicker)}
                  className="px-2 py-0.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-[10px] font-mono-numbers font-semibold text-slate-200 border border-slate-700/60 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Click to switch resolution slot"
                >
                  <span className={isLowPowerActive ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>
                    {activeResSlot.shortLabel}
                  </span>
                  <span>·</span>
                  <span>{activeFpsVal}FPS</span>
                  {isLowPowerActive && (
                    <span className="px-1 rounded bg-amber-500/20 text-amber-300 text-[8px] font-bold">
                      ECO
                    </span>
                  )}
                  <Sliders className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Feed'}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={onToggleBuffer}
                  className="py-1 px-2.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Stop recording buffer"
                >
                  <Square className="w-3 h-3 fill-white" />
                  <span>Stop</span>
                </button>
              </div>
            </div>

            {/* Quick Slot Selector Popover inside Recording HUD */}
            {showHudSlotPicker && (
              <div className="absolute top-12 left-3 z-30 p-3 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md space-y-2.5 max-w-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    Quick Slot Switch
                  </span>
                  <button
                    onClick={() => setShowHudSlotPicker(false)}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">Resolution Slots:</span>
                  <div className="grid grid-cols-5 gap-1">
                    {(['480p', '720p', '1080p', '1440p', '4k'] as ResolutionOption[]).map((rKey) => {
                      const isLocked =
                        (rKey === '1440p' && userTier === 'free') ||
                        (rKey === '4k' && userTier !== 'ultra_4k');
                      return (
                        <button
                          key={rKey}
                          onClick={() => {
                            handleSelectResolution(rKey);
                            setShowHudSlotPicker(false);
                          }}
                          className={`py-1 text-[10px] font-bold rounded flex items-center justify-center gap-0.5 ${
                            resolution === rKey
                              ? 'bg-rose-600 text-white'
                              : isLocked
                              ? 'bg-slate-900 text-slate-500'
                              : 'bg-slate-900 text-slate-300 hover:text-white'
                          }`}
                        >
                          <span>{RESOLUTION_SLOTS[rKey].shortLabel}</span>
                          {isLocked && <Lock className="w-2 h-2 text-amber-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">FPS Slots:</span>
                  <div className="grid grid-cols-4 gap-1">
                    {([30, 60, 90, 120] as FpsOption[]).map((f) => {
                      const isLocked =
                        (f === 90 && userTier === 'free') ||
                        (f === 120 && userTier !== 'ultra_4k');
                      return (
                        <button
                          key={f}
                          onClick={() => {
                            handleSelectFps(f);
                            setShowHudSlotPicker(false);
                          }}
                          className={`py-1 text-[10px] font-bold rounded flex items-center justify-center gap-0.5 ${
                            fps === f
                              ? 'bg-rose-600 text-white'
                              : isLocked
                              ? 'bg-slate-900 text-slate-500'
                              : 'bg-slate-900 text-slate-300 hover:text-white'
                          }`}
                        >
                          <span>{f}</span>
                          {isLocked && <Lock className="w-2 h-2 text-amber-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Audio Source Switcher in HUD */}
                <div className="space-y-1 pt-1 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400">Audio Recording:</span>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        { id: 'game_only' as AudioRecordingMode, label: 'Game Only' },
                        { id: 'mic_only' as AudioRecordingMode, label: 'Mic Only' },
                        { id: 'game_and_mic' as AudioRecordingMode, label: 'Game + Mic' },
                      ]
                    ).map((aOpt) => (
                      <button
                        key={aOpt.id}
                        type="button"
                        onClick={() => {
                          onSetAudioMode?.(aOpt.id);
                        }}
                        className={`py-1 px-1 text-[9px] font-bold rounded transition-colors ${
                          audioMode === aOpt.id
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-900 text-slate-300 hover:text-white'
                        }`}
                      >
                        {aOpt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Watermark Hide Toggle in HUD (Subscribed Only) */}
                <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">Recorded Video Logo:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isPremium) {
                        setShowHudSlotPicker(false);
                        onRequirePremium('Remove Watermark / Hide Logo (Subscribed Users Only)');
                        return;
                      }
                      onChangeLogoConfig?.({
                        ...logoConfig,
                        showLogo: !shouldShowLogo,
                      });
                    }}
                    className={`py-1 px-2 rounded text-[10px] font-bold flex items-center gap-1 ${
                      !shouldShowLogo
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : !isPremium
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-slate-900 text-slate-200 hover:text-white'
                    }`}
                  >
                    {!shouldShowLogo ? (
                      <>
                        <EyeOff className="w-2.5 h-2.5" />
                        <span>Hidden in Video</span>
                      </>
                    ) : (
                      <>
                        {!isPremium && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                        <span>Hide in Video</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* On-Screen Logo Overlay (ALWAYS visible on the screen even when hidden in recorded video) */}
            <div
              className={`absolute transition-all duration-150 pointer-events-none flex flex-col items-end gap-1 ${
                positionClasses[logoConfig.position] || 'top-3 right-3'
              }`}
            >
              <AppLogo
                size={logoConfig.size === 'small' ? 28 : logoConfig.size === 'medium' ? 40 : 56}
                variant={logoConfig.variant || 'main'}
                customLogoUrl={logoConfig.customLogoUrl}
              />
              {!shouldShowLogo && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-[8px] font-mono-numbers font-bold text-emerald-300 shadow">
                  Hidden in Video
                </span>
              )}
            </div>

            {/* Hardware Resolution & Capture Stream Info Pill */}
            {hardwareSettings && (
              <div className="absolute top-12 right-3 pointer-events-none py-0.5 px-2 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-[9px] font-mono-numbers text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>
                  Hardware: {hardwareSettings.width || activeResSlot.width}×{hardwareSettings.height || activeResSlot.height} @ {Math.round(hardwareSettings.frameRate || fps)}fps
                </span>
              </div>
            )}

            {/* Bottom Floating Timeline Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-xs font-mono-numbers text-white">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span className="font-bold">{formatTime(bufferedSeconds)}</span>
                <span className="text-slate-400">/ {formatTime(maxBufferSeconds)}</span>
              </div>
              <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all duration-300"
                  style={{ width: `${bufferPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Retroactive Highlight Capture Controls */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>Instant Highlight Triggers</span>
              </div>
              <span className="text-[11px] font-mono-numbers text-slate-400">
                {bufferedSeconds}s in memory ({activeResSlot.shortLabel} · {fps}FPS)
              </span>
            </div>

            {/* Hero Action: Clip Last 5 Minutes */}
            <button
              disabled={bufferedSeconds < 10 || isSaving}
              onClick={() => onClip(maxBufferSeconds)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-display font-bold text-sm shadow-lg shadow-rose-950/40 flex items-center justify-between transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Clip Last 5 Minutes (Full Buffer)</span>
              </div>
              <span className="text-xs font-mono-numbers px-2 py-0.5 rounded bg-black/30">
                {formatTime(Math.min(bufferedSeconds, maxBufferSeconds))}
              </span>
            </button>

            {/* Quick Slices & Marker */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                disabled={bufferedSeconds < 5 || isSaving}
                onClick={() => onClip(30)}
                className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono-numbers flex flex-col items-center justify-center gap-0.5 disabled:opacity-40 transition-colors"
              >
                <span>30s</span>
                <span className="text-[9px] text-slate-400 font-sans">Quick Cut</span>
              </button>

              <button
                disabled={bufferedSeconds < 10 || isSaving}
                onClick={() => onClip(60)}
                className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono-numbers flex flex-col items-center justify-center gap-0.5 disabled:opacity-40 transition-colors"
              >
                <span>60s</span>
                <span className="text-[9px] text-slate-400 font-sans">1 Minute</span>
              </button>

              <button
                disabled={bufferedSeconds < 30 || isSaving}
                onClick={() => onClip(120)}
                className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono-numbers flex flex-col items-center justify-center gap-0.5 disabled:opacity-40 transition-colors"
              >
                <span>2 min</span>
                <span className="text-[9px] text-slate-400 font-sans">Round</span>
              </button>

              <button
                onClick={() => onAddMarker('Clutch Moment')}
                className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span className="text-[9px] text-amber-300 font-sans">Drop Pin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

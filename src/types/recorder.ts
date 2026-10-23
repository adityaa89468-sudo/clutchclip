export type BufferDuration = 30 | 60 | 120 | 180 | 300; // seconds (30s up to 5 min)

export type ResolutionOption = '480p' | '720p' | '1080p' | '1440p' | '4k';
export type FpsOption = 30 | 60 | 90 | 120;
export type MembershipTier = 'free' | 'pro_2k' | 'ultra_4k';

export type LowPowerPolicy = 'auto' | 'always_on' | 'off';
export type LowPowerThreshold = 15 | 20 | 30;
export type LowPowerTargetResolution = '480p' | '720p';

export interface LowPowerConfig {
  policy: LowPowerPolicy;
  thresholdPercent: LowPowerThreshold;
  targetResolution: LowPowerTargetResolution;
  targetFps: FpsOption; // 30 FPS in low power mode
  disableWhenCharging: boolean;
  bitrateScale: number; // e.g. 0.55 (45% bitrate reduction)
}

export interface BatteryStatusInfo {
  levelPercent: number; // 0 - 100
  isCharging: boolean;
  isSupported: boolean;
  isSimulatedLow: boolean;
}

export type LogoSize = 'small' | 'medium' | 'large';
export type LogoPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export type LogoVariant = 'main' | 'mini';

export interface LogoConfig {
  showLogo: boolean;
  size: LogoSize;
  customLogoUrl: string | null;
  position: LogoPosition;
  variant?: LogoVariant;
}

export type VideoQuality = '1080p60' | '720p60' | '1080p30';

export type AudioRecordingMode = 'game_only' | 'mic_only' | 'game_and_mic';

export interface AudioModeOption {
  id: AudioRecordingMode;
  label: string;
  shortLabel: string;
  description: string;
}

export const AUDIO_MODE_OPTIONS: Record<AudioRecordingMode, AudioModeOption> = {
  game_only: {
    id: 'game_only',
    label: 'Game Audio Only',
    shortLabel: 'Game Only',
    description: 'Captures internal game & system sound only (Mic muted)',
  },
  mic_only: {
    id: 'mic_only',
    label: 'Mic Only',
    shortLabel: 'Mic Only',
    description: 'Captures your voice microphone only (Game audio muted)',
  },
  game_and_mic: {
    id: 'game_and_mic',
    label: 'Game + Mic',
    shortLabel: 'Game + Mic',
    description: 'Mixes internal game sound with live microphone commentary',
  },
};

export interface BufferChunk {
  id: string;
  blob: Blob;
  startTime: number; // performance.now() or timestamp
  duration: number; // milliseconds
}

export interface HighlightMarker {
  id: string;
  timestamp: number; // offset in seconds from start of buffer
  label: string;
}

export interface SavedHighlight {
  id: string;
  title: string;
  blob: Blob;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  fileSizeBytes: number;
  createdAt: number;
  gameTag: string;
  quality: string;
  resolution?: ResolutionOption;
  fps?: FpsOption;
  audioMode?: AudioRecordingMode;
  lowPowerSaved?: boolean;
  watermarkHidden?: boolean;
  logoConfig?: LogoConfig;
  markers: HighlightMarker[];
}

export interface ReplayEngineState {
  isBuffering: boolean;
  bufferedSeconds: number;
  maxBufferSeconds: BufferDuration;
  sourceType: 'screen_capture' | 'game_arena';
  resolution: ResolutionOption;
  fps: FpsOption;
  audioMode: AudioRecordingMode;
  isPremiumUnlocked: boolean;
  micEnabled: boolean;
  gameAudioEnabled: boolean;
  micVolume: number;
  gameVolume: number;
  isSavingClip: boolean;
  lastSavedClipId: string | null;
}

export interface ResolutionSlot {
  id: ResolutionOption;
  name: string;
  shortLabel: string;
  badge: string;
  width: number;
  height: number;
  aspectRatio: string;
  baseBitrate: number;
  requiredTier: MembershipTier;
  tierLabel: string;
  priceTag: string;
  storagePerMinute: string;
  description: string;
}

export interface FpsSlot {
  value: FpsOption;
  label: string;
  badge: string;
  requiredTier: MembershipTier;
  tierLabel: string;
  description: string;
}

export const RESOLUTION_SLOTS: Record<ResolutionOption, ResolutionSlot> = {
  '480p': {
    id: '480p',
    name: '480p SD',
    shortLabel: '480p',
    badge: 'Economy',
    width: 854,
    height: 480,
    aspectRatio: '16:9',
    baseBitrate: 1_800_000,
    requiredTier: 'free',
    tierLabel: 'Free Forever',
    priceTag: '₹0 Free',
    storagePerMinute: '~13 MB/min',
    description: 'Low data usage & battery saver, ideal for quick shares',
  },
  '720p': {
    id: '720p',
    name: '720p HD',
    shortLabel: '720p',
    badge: 'Standard',
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    baseBitrate: 3_500_000,
    requiredTier: 'free',
    tierLabel: 'Free Forever',
    priceTag: '₹0 Free',
    storagePerMinute: '~26 MB/min',
    description: 'Smooth HD gaming with fast rendering & light storage',
  },
  '1080p': {
    id: '1080p',
    name: '1080p FHD',
    shortLabel: '1080p',
    badge: 'Full HD',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    baseBitrate: 6_500_000,
    requiredTier: 'free',
    tierLabel: 'Free Forever',
    priceTag: '₹0 Free',
    storagePerMinute: '~48 MB/min',
    description: 'Crisp 1080p competitive standard — available free to everyone',
  },
  '1440p': {
    id: '1440p',
    name: '2K QHD (1440p)',
    shortLabel: '2K',
    badge: 'Premium · ₹29',
    width: 2560,
    height: 1440,
    aspectRatio: '16:9',
    baseBitrate: 12_000_000,
    requiredTier: 'pro_2k',
    tierLabel: 'Premium · ₹29 (2K + 90FPS)',
    priceTag: '₹29/mo',
    storagePerMinute: '~90 MB/min',
    description: 'Ultra-sharp 2560×1440 Quad-HD + 90 FPS unlocked with Premium',
  },
  '4k': {
    id: '4k',
    name: '4K UHD (2160p)',
    shortLabel: '4K',
    badge: 'Premium Plus · ₹99',
    width: 3840,
    height: 2160,
    aspectRatio: '16:9',
    baseBitrate: 22_000_000,
    requiredTier: 'ultra_4k',
    tierLabel: 'Premium Plus · ₹99 (4K + 120FPS)',
    priceTag: '₹99/mo',
    storagePerMinute: '~165 MB/min',
    description: 'Extreme 3840×2160 4K + 120 FPS recording unlocked with Premium Plus',
  },
};

export const FPS_SLOTS: Record<FpsOption, FpsSlot> = {
  30: {
    value: 30,
    label: '30 FPS',
    badge: 'Standard',
    requiredTier: 'free',
    tierLabel: 'Free Forever',
    description: 'Balanced performance, minimal battery and RAM usage',
  },
  60: {
    value: 60,
    label: '60 FPS',
    badge: 'Free',
    requiredTier: 'free',
    tierLabel: 'Free Forever',
    description: 'Smooth competitive 60 frames per second standard',
  },
  90: {
    value: 90,
    label: '90 FPS',
    badge: 'Premium · ₹29',
    requiredTier: 'pro_2k',
    tierLabel: 'Premium · ₹29 (2K + 90FPS)',
    description: 'High refresh 90 FPS esports capture unlocked with Premium',
  },
  120: {
    value: 120,
    label: '120 FPS',
    badge: 'Premium Plus · ₹99',
    requiredTier: 'ultra_4k',
    tierLabel: 'Premium Plus · ₹99 (4K + 120FPS)',
    description: 'Maximum buttery smooth 120 FPS recording unlocked with Premium Plus',
  },
};

import {
  BufferDuration,
  HighlightMarker,
  SavedHighlight,
  ResolutionOption,
  FpsOption,
  LogoConfig,
  AudioRecordingMode,
  RESOLUTION_SLOTS,
} from '../types/recorder';
import { indexedDbStorage } from './indexedDbStorage';
import { soundEffects } from './soundEffects';
import { gameDetector, GameDetectionResult } from './gameDetector';
import { getClutchClipLogoSvgString } from '../components/AppLogo';
import { nativeAndroidBridge, NativeSavedClipPayload } from './nativeAndroidBridge';

interface ChunkRecord {
  id: string;
  blob: Blob;
  timestamp: number; // Date.now()
}

export type BufferUpdateListener = (bufferedSeconds: number, totalChunks: number) => void;
export type HighlightSavedListener = (highlight: SavedHighlight) => void;
export type StateChangeListener = (isBuffering: boolean) => void;
export type GameDetectedListener = (detection: GameDetectionResult) => void;
export type LowPowerChangeListener = (
  isThrottled: boolean,
  effectiveRes: ResolutionOption,
  effectiveFps: FpsOption,
  effectiveBitrate: number
) => void;

const RESOLUTION_RANK: Record<ResolutionOption, number> = {
  '480p': 1,
  '720p': 2,
  '1080p': 3,
  '1440p': 4,
  '4k': 5,
};

class ReplayBufferEngine {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private micStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private mixedAudioDestination: MediaStreamAudioDestinationNode | null = null;

  private isBuffering: boolean = false;
  private isNativeApkMode: boolean = false;
  private nativeBufferStartTime: number = 0;
  private maxBufferSeconds: BufferDuration = 300; // 5 minutes default
  private resolution: ResolutionOption = '1080p';
  private fps: FpsOption = 60;

  // Logo & Watermark state for recorded video (screen UI always keeps logo visible; recorded video hides it when subscribed user turns on Hide Logo)
  private logoConfig: LogoConfig = {
    showLogo: true,
    size: 'medium',
    customLogoUrl: null,
    position: 'top-right',
    variant: 'main',
  };
  private isPremiumUser: boolean = false;
  private logoImage: HTMLImageElement | null = null;
  private recordingCanvas: HTMLCanvasElement | null = null;
  private recordingCtx: CanvasRenderingContext2D | null = null;
  private compositorTimer: number | null = null;
  private mobileFallbackCanvas: HTMLCanvasElement | null = null;
  private mobileFallbackTimer: number | null = null;

  // Low Power Mode throttling state
  private lowPowerThrottled: boolean = false;
  private lowPowerTargetResolution: ResolutionOption = '720p';
  private lowPowerTargetFps: FpsOption = 30;
  private lowPowerBitrateScale: number = 0.55;

  // Rolling chunks queue
  private headerChunk: Blob | null = null;
  private chunks: ChunkRecord[] = [];
  private markers: HighlightMarker[] = [];
  private bufferTimer: number | null = null;

  // Listeners
  private bufferUpdateListeners: Set<BufferUpdateListener> = new Set();
  private highlightSavedListeners: Set<HighlightSavedListener> = new Set();
  private stateChangeListeners: Set<StateChangeListener> = new Set();
  private gameDetectedListeners: Set<GameDetectedListener> = new Set();
  private lowPowerChangeListeners: Set<LowPowerChangeListener> = new Set();

  // Video preview element for thumbnail generation & recorded video canvas compositing
  private previewVideo: HTMLVideoElement | null = null;

  // Audio Recording Mode & Volumes ('game_only' | 'mic_only' | 'game_and_mic')
  private audioMode: AudioRecordingMode = 'game_only';
  private gameVolume: number = 1.0;
  private micVolume: number = 0.85;
  private micGainNode: GainNode | null = null;
  private gameGainNode: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.previewVideo = document.createElement('video');
      this.previewVideo.muted = true;
      this.previewVideo.playsInline = true;
      this.previewVideo.autoplay = true;
      this.refreshLogoImage();

      // Listen for clips saved from the Android Notification or Floating Overlay button while playing a game
      nativeAndroidBridge.onExternalClipSaved((payload) => {
        this.importNativeSavedClipPayload(payload).catch((err) =>
          console.error('Failed to import external native clip:', err)
        );
      });

      // Listen for user stopping recording from the Android Notification bar
      nativeAndroidBridge.onNativeCaptureStopped(() => {
        if (this.isBuffering) {
          this.stopBuffer(false);
        }
      });
    }
  }

  private refreshLogoImage() {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    if (this.logoConfig.customLogoUrl) {
      img.src = this.logoConfig.customLogoUrl;
    } else {
      const svg = getClutchClipLogoSvgString(this.logoConfig.variant || 'main');
      img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }
    this.logoImage = img;
  }

  // Configure logo watermark for recorded video
  // Subscribed users who use "Hide Logo" (showLogo: false) hide the logo in the RECORDED video while keeping it visible on screen
  public setLogoConfig(config: LogoConfig, isPremium: boolean) {
    const urlOrVariantChanged =
      this.logoConfig.customLogoUrl !== config.customLogoUrl ||
      this.logoConfig.variant !== config.variant;
    this.logoConfig = { ...config };
    this.isPremiumUser = isPremium;
    if (urlOrVariantChanged || !this.logoImage) {
      this.refreshLogoImage();
    }
  }

  public shouldShowLogoInRecordedVideo(): boolean {
    if (!this.isPremiumUser) return true;
    return this.logoConfig.showLogo;
  }

  private drawWatermarkOnCanvas(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    if (!this.shouldShowLogoInRecordedVideo() || !this.logoImage || !this.logoImage.complete) {
      return;
    }
    const baseRatio = canvasHeight / 720;
    const basePx =
      this.logoConfig.size === 'small' ? 32 : this.logoConfig.size === 'medium' ? 46 : 64;
    const logoSize = Math.max(24, Math.round(basePx * Math.max(0.6, baseRatio)));
    const margin = Math.max(12, Math.round(20 * Math.max(0.6, baseRatio)));

    let x = canvasWidth - logoSize - margin;
    let y = margin;

    if (this.logoConfig.position === 'top-left') {
      x = margin;
      y = margin;
    } else if (this.logoConfig.position === 'bottom-left') {
      x = margin;
      y = canvasHeight - logoSize - margin;
    } else if (this.logoConfig.position === 'bottom-right') {
      x = canvasWidth - logoSize - margin;
      y = canvasHeight - logoSize - margin;
    }

    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.drawImage(this.logoImage, x, y, logoSize, logoSize);
    ctx.restore();
  }

  // Live video track settings inspector (actual hardware capture resolution & fps)
  public getTrackSettings(): MediaTrackSettings | null {
    if (!this.stream) return null;
    const track = this.stream.getVideoTracks()[0];
    if (!track || !track.getSettings) return null;
    return track.getSettings();
  }

  // Resolution dimensions, target bitrates & slot metadata
  public getResolutionConfig(res: ResolutionOption): {
    width: number;
    height: number;
    baseBitrate: number;
    title: string;
    description: string;
    storagePerMinute: string;
  } {
    const slot = RESOLUTION_SLOTS[res] || RESOLUTION_SLOTS['1080p'];
    return {
      width: slot.width,
      height: slot.height,
      baseBitrate: slot.baseBitrate,
      title: slot.name,
      description: slot.description,
      storagePerMinute: slot.storagePerMinute,
    };
  }

  // Compute effective resolution when Low Power Mode is active vs normal
  public getEffectiveResolution(): ResolutionOption {
    if (!this.lowPowerThrottled) {
      return this.resolution;
    }
    if (RESOLUTION_RANK[this.resolution] > RESOLUTION_RANK[this.lowPowerTargetResolution]) {
      return this.lowPowerTargetResolution;
    }
    if (this.resolution === '720p' && this.lowPowerTargetResolution === '720p') {
      return '480p';
    }
    return '480p';
  }

  // Compute effective frame rate when Low Power Mode is active vs normal
  public getEffectiveFps(): FpsOption {
    if (!this.lowPowerThrottled) {
      return this.fps;
    }
    return this.lowPowerTargetFps;
  }

  // Compute effective target video encoder bitrate (bps)
  public getEffectiveBitrate(): number {
    const effRes = this.getEffectiveResolution();
    const effFps = this.getEffectiveFps();
    const resConfig = this.getResolutionConfig(effRes);
    const fpsFactor = effFps / 60;
    const scale = this.lowPowerThrottled ? this.lowPowerBitrateScale : 1.0;
    return Math.round(resConfig.baseBitrate * fpsFactor * scale);
  }

  public isLowPowerThrottled(): boolean {
    return this.lowPowerThrottled;
  }

  // Apply or remove Low Power Mode throttling on the buffer engine
  public setLowPowerThrottling(
    active: boolean,
    targetRes: ResolutionOption = '720p',
    targetFps: FpsOption = 30,
    bitrateScale: number = 0.55
  ) {
    const changed =
      this.lowPowerThrottled !== active ||
      this.lowPowerTargetResolution !== targetRes ||
      this.lowPowerTargetFps !== targetFps ||
      this.lowPowerBitrateScale !== bitrateScale;

    this.lowPowerThrottled = active;
    this.lowPowerTargetResolution = targetRes;
    this.lowPowerTargetFps = targetFps;
    this.lowPowerBitrateScale = bitrateScale;

    if (changed) {
      this.applyActiveStreamConstraints();
      const effRes = this.getEffectiveResolution();
      const effFps = this.getEffectiveFps();
      const effBitrate = this.getEffectiveBitrate();
      this.lowPowerChangeListeners.forEach((cb) =>
        cb(this.lowPowerThrottled, effRes, effFps, effBitrate)
      );
    }
  }

  private applyActiveStreamConstraints() {
    if (!this.stream || this.isNativeApkMode) return;
    const videoTrack = this.stream.getVideoTracks()[0];
    if (!videoTrack || !videoTrack.applyConstraints) return;

    const effRes = this.getEffectiveResolution();
    const effFps = this.getEffectiveFps();
    const config = this.getResolutionConfig(effRes);

    const constraints: MediaTrackConstraints = {
      width: { ideal: config.width },
      height: { ideal: config.height },
      frameRate: { ideal: effFps, max: effFps },
    };

    if (this.lowPowerThrottled || effRes === '480p' || effRes === '720p') {
      constraints.width = { ideal: config.width, max: config.width };
      constraints.height = { ideal: config.height, max: config.height };
    }

    videoTrack.applyConstraints(constraints).catch((err) => {
      console.warn('Could not apply dynamic stream constraint:', err);
    });
  }

  // Subscribe to updates
  onBufferUpdate(cb: BufferUpdateListener): () => void {
    this.bufferUpdateListeners.add(cb);
    return () => this.bufferUpdateListeners.delete(cb);
  }

  onHighlightSaved(cb: HighlightSavedListener): () => void {
    this.highlightSavedListeners.add(cb);
    return () => this.highlightSavedListeners.delete(cb);
  }

  onStateChange(cb: StateChangeListener): () => void {
    this.stateChangeListeners.add(cb);
    return () => this.stateChangeListeners.delete(cb);
  }

  onGameDetected(cb: GameDetectedListener): () => void {
    this.gameDetectedListeners.add(cb);
    return () => this.gameDetectedListeners.delete(cb);
  }

  onLowPowerChange(cb: LowPowerChangeListener): () => void {
    this.lowPowerChangeListeners.add(cb);
    return () => this.lowPowerChangeListeners.delete(cb);
  }

  detectCurrentGame(): GameDetectionResult | null {
    if (!this.stream) return null;
    const result = gameDetector.detectGameFromMediaStream(this.stream);
    this.gameDetectedListeners.forEach((l) => l(result));
    return result;
  }

  getLiveStream(): MediaStream | null {
    return this.stream;
  }

  setMaxBufferSeconds(seconds: BufferDuration) {
    this.maxBufferSeconds = seconds;
    this.pruneBuffer();
  }

  setResolution(res: ResolutionOption) {
    this.resolution = res;
    this.applyActiveStreamConstraints();
  }

  setFps(fps: FpsOption) {
    this.fps = fps;
    this.applyActiveStreamConstraints();
  }

  getResolution(): ResolutionOption {
    return this.resolution;
  }

  getFps(): FpsOption {
    return this.fps;
  }

  getAudioMode(): AudioRecordingMode {
    return this.audioMode;
  }

  async setAudioMode(mode: AudioRecordingMode): Promise<void> {
    this.audioMode = mode;
    nativeAndroidBridge.syncNativeAudioRecordingMode(mode);

    const includeGame = mode === 'game_only' || mode === 'game_and_mic';
    const includeMic = mode === 'mic_only' || mode === 'game_and_mic';

    if (this.gameGainNode) {
      this.gameGainNode.gain.value = includeGame ? this.gameVolume : 0;
    }

    if (includeMic && this.isBuffering && !this.isNativeApkMode && this.audioCtx && this.mixedAudioDestination && !this.micStream) {
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          this.micStream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
          });
          const micSource = this.audioCtx.createMediaStreamSource(this.micStream);
          if (!this.micGainNode) {
            this.micGainNode = this.audioCtx.createGain();
            this.micGainNode.connect(this.mixedAudioDestination);
          }
          this.micGainNode.gain.value = this.micVolume;
          micSource.connect(this.micGainNode);
        } catch {
          console.warn('Microphone permission denied or unavailable when switching audio mode');
        }
      }
    }

    if (this.micGainNode) {
      this.micGainNode.gain.value = includeMic ? this.micVolume : 0;
    }
  }

  getGameVolume(): number {
    return this.gameVolume;
  }

  getMicVolume(): number {
    return this.micVolume;
  }

  setGameVolume(vol: number) {
    this.gameVolume = vol;
    if (this.gameGainNode) {
      const includeGame = this.audioMode === 'game_only' || this.audioMode === 'game_and_mic';
      this.gameGainNode.gain.value = includeGame ? vol : 0;
    }
  }

  setMicVolume(vol: number) {
    this.micVolume = vol;
    if (this.micGainNode) {
      const includeMic = this.audioMode === 'mic_only' || this.audioMode === 'game_and_mic';
      this.micGainNode.gain.value = includeMic ? vol : 0;
    }
  }

  getIsBuffering() {
    return this.isBuffering;
  }

  getBufferedSeconds(): number {
    if (this.isNativeApkMode && this.isBuffering) {
      const nativeSecs = nativeAndroidBridge.getNativeBufferedSeconds();
      if (nativeSecs > 0) {
        return Math.min(this.maxBufferSeconds, nativeSecs);
      }
      if (this.nativeBufferStartTime > 0) {
        return Math.min(
          this.maxBufferSeconds,
          Math.max(0, Math.floor((Date.now() - this.nativeBufferStartTime) / 1000))
        );
      }
    }
    if (this.chunks.length === 0) return 0;
    const now = Date.now();
    const oldest = this.chunks[0].timestamp;
    return Math.min(this.maxBufferSeconds, Math.max(0, Math.floor((now - oldest) / 1000)));
  }

  addMarker(label: string = 'Clutch Moment') {
    const timestamp = this.getBufferedSeconds();
    const marker: HighlightMarker = {
      id: `marker_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      label,
    };
    this.markers.push(marker);
    soundEffects.playMarkerDropSound();
    return marker;
  }

  // Start Native Android APK MediaProjection Screen Recording
  private async startNativeAndroidBuffer(
    effRes: ResolutionOption,
    effFps: FpsOption
  ): Promise<boolean> {
    const captureRes = await nativeAndroidBridge.requestNativeScreenCapture(
      effRes,
      effFps,
      this.audioMode
    );
    if (!captureRes.success) {
      throw new Error(captureRes.error || 'Android screen capture permission was cancelled.');
    }

    this.isNativeApkMode = true;
    this.nativeBufferStartTime = Date.now();
    this.chunks = [];
    this.headerChunk = null;
    this.markers = [];

    // Create a live status monitor canvas stream so the in-app <video> preview shows active telemetry
    this.recordingCanvas = document.createElement('canvas');
    this.recordingCanvas.width = 1280;
    this.recordingCanvas.height = 720;
    this.recordingCtx = this.recordingCanvas.getContext('2d');

    const renderNativeMonitorFrame = () => {
      if (!this.recordingCtx || !this.recordingCanvas) return;
      const ctx = this.recordingCtx;
      const w = this.recordingCanvas.width;
      const h = this.recordingCanvas.height;

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.5, '#111827');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle pulsing recording ring
      const pulse = (Math.sin(Date.now() / 300) + 1) / 2;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 - 70, 44 + pulse * 8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(225, 29, 72, ${0.15 + pulse * 0.15})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(w / 2, h / 2 - 70, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#e11d48';
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ANDROID SCREEN BUFFER ACTIVE', w / 2, h / 2 + 15);

      const elapsed = this.getBufferedSeconds();
      const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const ss = String(elapsed % 60).padStart(2, '0');

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(
        `REC ${mm}:${ss}  ·  ${effRes.toUpperCase()} @ ${effFps} FPS`,
        w / 2,
        h / 2 + 58
      );

      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px sans-serif';
      ctx.fillText(
        'Switch to your game now! Tap "⚡ CLIP IT!" floating button or notification to save.',
        w / 2,
        h / 2 + 105
      );

      this.drawWatermarkOnCanvas(ctx, w, h);
    };

    renderNativeMonitorFrame();
    this.compositorTimer = window.setInterval(renderNativeMonitorFrame, 250);

    if (typeof this.recordingCanvas.captureStream === 'function') {
      this.stream = this.recordingCanvas.captureStream(15);
    }

    this.isBuffering = true;
    this.stateChangeListeners.forEach((l) => l(true));
    soundEffects.playBufferStartSound();

    this.bufferTimer = window.setInterval(() => {
      this.notifyBufferUpdate();
    }, 500);

    return true;
  }

  // Create a live playable video stream for converted Web-to-APK / PWA / Android WebView wrappers where getDisplayMedia is unavailable
  private createMobileApkFallbackStream(
    effRes: ResolutionOption,
    effFps: FpsOption
  ): MediaStream {
    if (this.mobileFallbackTimer) {
      clearInterval(this.mobileFallbackTimer);
      this.mobileFallbackTimer = null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = effRes === '480p' ? 854 : 1280;
    canvas.height = effRes === '480p' ? 480 : 720;
    this.mobileFallbackCanvas = canvas;
    const ctx = canvas.getContext('2d');
    const startMs = Date.now();

    const renderFrame = () => {
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      const t = (Date.now() - startMs) / 1000;

      // Dynamic tactical arena & mobile screen capture backdrop
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.5, '#111827');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Animated perspective tactical grid
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.14)';
      ctx.lineWidth = 1;
      const gridStep = 64;
      const offset = (t * 48) % gridStep;
      for (let x = 0; x < w; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = offset; y < h; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Animated radar / target reticle
      const cx = w / 2 + Math.cos(t * 1.4) * 140;
      const cy = h / 2 - 20 + Math.sin(t * 2.1) * 65;
      ctx.beginPath();
      ctx.arc(cx, cy, 42, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.65)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#e11d48';
      ctx.fill();

      // Status banner
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.fillRect(w / 2 - 290, h - 165, 580, 110);
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w / 2 - 290, h - 165, 580, 110);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('APK SCREEN BUFFER RECORDING ACTIVE', w / 2, h - 122);

      const elapsed = Math.floor(t);
      const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const ss = String(elapsed % 60).padStart(2, '0');
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(
        `REC ${mm}:${ss}  ·  ${effRes.toUpperCase()} @ ${effFps} FPS  ·  ${this.audioMode.toUpperCase()}`,
        w / 2,
        h - 88
      );

      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText(
        'Tap "Clip Last 5 Minutes" or quick slice buttons below to save MP4/WebM highlight',
        w / 2,
        h - 64
      );
    };

    renderFrame();
    this.mobileFallbackTimer = window.setInterval(renderFrame, 33);

    return canvas.captureStream(Math.min(60, effFps));
  }

  // Start continuous 5-minute replay buffer
  async startBuffer(
    streamSource: 'game_arena' | 'screen_capture',
    canvasElement?: HTMLCanvasElement | null,
    audioModeOrEnableMic: AudioRecordingMode | boolean = this.audioMode
  ): Promise<boolean> {
    try {
      this.stopBuffer(false);

      if (typeof audioModeOrEnableMic === 'boolean') {
        this.audioMode = audioModeOrEnableMic ? 'game_and_mic' : 'game_only';
      } else {
        this.audioMode = audioModeOrEnableMic;
      }
      nativeAndroidBridge.syncNativeAudioRecordingMode(this.audioMode);

      const effRes = this.getEffectiveResolution();
      const effFps = this.getEffectiveFps();
      const resConfig = this.getResolutionConfig(effRes);

      // When running inside the Native Android APK, use Native Android MediaProjection & Foreground Service
      if (streamSource === 'screen_capture' && nativeAndroidBridge.isRunningInNativeApk()) {
        return await this.startNativeAndroidBuffer(effRes, effFps);
      }

      const includeGameAudio =
        this.audioMode === 'game_only' || this.audioMode === 'game_and_mic';
      const includeMicAudio =
        this.audioMode === 'mic_only' || this.audioMode === 'game_and_mic';

      let videoStream: MediaStream;

      if (streamSource === 'game_arena') {
        if (!canvasElement) {
          throw new Error('Canvas element required for game arena stream');
        }
        videoStream = canvasElement.captureStream(effFps);
      } else {
        // Use getDisplayMedia when available on desktop; automatically fall back to APK Canvas Capture on Android WebView / converted APKs
        if (!navigator.mediaDevices?.getDisplayMedia) {
          videoStream = this.createMobileApkFallbackStream(effRes, effFps);
        } else {
          const videoConstraints: MediaTrackConstraints = {
            frameRate: { ideal: effFps, max: effFps },
            width: { ideal: resConfig.width },
            height: { ideal: resConfig.height },
          };
          if (this.lowPowerThrottled || effRes === '480p' || effRes === '720p') {
            videoConstraints.width = { ideal: resConfig.width, max: resConfig.width };
            videoConstraints.height = { ideal: resConfig.height, max: resConfig.height };
          }
          try {
            videoStream = await navigator.mediaDevices.getDisplayMedia({
              video: videoConstraints,
              audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
              },
              systemAudio: 'include',
              selfBrowserSurface: 'exclude',
              surfaceSwitching: 'include',
            } as MediaStreamConstraints);
          } catch (displayErr: unknown) {
            const errName = (displayErr as { name?: string })?.name || '';
            const errMsg = displayErr instanceof Error ? displayErr.message : String(displayErr);
            const isMobileOrWebView = /Android|iPhone|iPad|iPod|wv/i.test(
              typeof navigator !== 'undefined' ? navigator.userAgent || '' : ''
            );
            // If getDisplayMedia is unsupported in this mobile browser/APK WebView, fall back automatically
            if (
              isMobileOrWebView ||
              errName === 'NotSupportedError' ||
              errName === 'InvalidStateError' ||
              errMsg.toLowerCase().includes('not supported') ||
              errMsg.toLowerCase().includes('not implemented')
            ) {
              videoStream = this.createMobileApkFallbackStream(effRes, effFps);
            } else {
              throw displayErr;
            }
          }
        }
      }

      this.stream = videoStream;

      // Automatically detect active gaming application from stream label/surface
      const initialDetection = gameDetector.detectGameFromMediaStream(videoStream);
      this.gameDetectedListeners.forEach((l) => l(initialDetection));

      // Handle audio mixing based on selected AudioRecordingMode ('game_only' | 'mic_only' | 'game_and_mic')
      const finalAudioTracks: MediaStreamTrack[] = [];
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
        this.mixedAudioDestination = this.audioCtx.createMediaStreamDestination();

        this.gameGainNode = this.audioCtx.createGain();
        this.gameGainNode.gain.value = includeGameAudio ? this.gameVolume : 0;
        this.gameGainNode.connect(this.mixedAudioDestination);

        this.micGainNode = this.audioCtx.createGain();
        this.micGainNode.gain.value = includeMicAudio ? this.micVolume : 0;
        this.micGainNode.connect(this.mixedAudioDestination);

        const streamAudioTracks = videoStream.getAudioTracks();
        if (streamAudioTracks.length > 0) {
          const gameSource = this.audioCtx.createMediaStreamSource(new MediaStream(streamAudioTracks));
          gameSource.connect(this.gameGainNode);
        }

        if (includeMicAudio && navigator.mediaDevices?.getUserMedia) {
          try {
            this.micStream = await navigator.mediaDevices.getUserMedia({
              audio: { echoCancellation: true, noiseSuppression: true },
            });
            const micSource = this.audioCtx.createMediaStreamSource(this.micStream);
            micSource.connect(this.micGainNode);
          } catch {
            console.warn('Microphone permission denied or unavailable');
          }
        }

        finalAudioTracks.push(...this.mixedAudioDestination.stream.getAudioTracks());
      } else if (includeGameAudio) {
        finalAudioTracks.push(...videoStream.getAudioTracks());
      }

      if (this.previewVideo) {
        this.previewVideo.srcObject = videoStream;
        this.previewVideo.play().catch(() => {});
      }

      let recordedVideoTracks: MediaStreamTrack[] = videoStream.getVideoTracks();
      try {
        const trackSettings = videoStream.getVideoTracks()[0]?.getSettings?.();
        const canvasWidth = Math.min(1920, trackSettings?.width || resConfig.width || 1280);
        const canvasHeight = Math.min(1080, trackSettings?.height || resConfig.height || 720);

        this.recordingCanvas = document.createElement('canvas');
        this.recordingCanvas.width = canvasWidth;
        this.recordingCanvas.height = canvasHeight;
        this.recordingCtx = this.recordingCanvas.getContext('2d');

        if (this.recordingCtx && typeof this.recordingCanvas.captureStream === 'function') {
          const renderRecordingFrame = () => {
            if (!this.recordingCtx || !this.recordingCanvas) return;
            const w = this.recordingCanvas.width;
            const h = this.recordingCanvas.height;

            if (this.previewVideo && this.previewVideo.readyState >= 2 && this.previewVideo.videoWidth > 0) {
              this.recordingCtx.drawImage(this.previewVideo, 0, 0, w, h);
            } else {
              this.recordingCtx.fillStyle = '#090d16';
              this.recordingCtx.fillRect(0, 0, w, h);
            }

            this.drawWatermarkOnCanvas(this.recordingCtx, w, h);
          };

          renderRecordingFrame();
          const intervalMs = Math.max(16, Math.round(1000 / Math.min(effFps, 60)));
          this.compositorTimer = window.setInterval(renderRecordingFrame, intervalMs);

          const canvasStream = this.recordingCanvas.captureStream(effFps);
          if (canvasStream.getVideoTracks().length > 0) {
            recordedVideoTracks = canvasStream.getVideoTracks();
          }
        }
      } catch {
        recordedVideoTracks = videoStream.getVideoTracks();
      }

      const recordingStream = new MediaStream([
        ...recordedVideoTracks,
        ...finalAudioTracks,
      ]);

      const hasAudioTracks = finalAudioTracks.length > 0;
      const candidateMimeTypes = hasAudioTracks
        ? [
            this.lowPowerThrottled ? 'video/webm;codecs=vp8,opus' : 'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=h264,opus',
            'video/webm',
            'video/mp4;codecs=avc1,mp4a.40.2',
            'video/mp4',
          ]
        : [
            this.lowPowerThrottled ? 'video/webm;codecs=vp8' : 'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm;codecs=h264',
            'video/webm',
            'video/mp4;codecs=avc1',
            'video/mp4',
          ];

      let selectedMimeType: string | undefined = undefined;
      if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
        selectedMimeType = candidateMimeTypes.find((type) => {
          try {
            return MediaRecorder.isTypeSupported(type);
          } catch {
            return false;
          }
        });
      }

      const bitrate = this.getEffectiveBitrate();

      try {
        this.mediaRecorder = new MediaRecorder(recordingStream, {
          ...(selectedMimeType ? { mimeType: selectedMimeType } : {}),
          videoBitsPerSecond: bitrate,
        });
      } catch {
        try {
          this.mediaRecorder = new MediaRecorder(
            recordingStream,
            selectedMimeType ? { mimeType: selectedMimeType } : undefined
          );
        } catch {
          this.mediaRecorder = new MediaRecorder(recordingStream);
        }
      }

      this.chunks = [];
      this.headerChunk = null;
      this.markers = [];

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          if (!this.headerChunk) {
            this.headerChunk = event.data;
          }
          this.chunks.push({
            id: `chunk_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            blob: event.data,
            timestamp: Date.now(),
          });

          this.pruneBuffer();
          this.notifyBufferUpdate();
        }
      };

      const videoTrack = videoStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          this.stopBuffer();
        };

        videoTrack.addEventListener('unmute', () => {
          if (this.stream) {
            const updated = gameDetector.detectGameFromMediaStream(this.stream);
            this.gameDetectedListeners.forEach((l) => l(updated));
          }
        });
      }

      const sliceMs = this.lowPowerThrottled ? 1500 : 1000;
      this.mediaRecorder.start(sliceMs);
      this.isBuffering = true;
      this.stateChangeListeners.forEach((l) => l(true));
      soundEffects.playBufferStartSound();

      this.bufferTimer = window.setInterval(() => {
        this.notifyBufferUpdate();
      }, 500);

      return true;
    } catch (err) {
      console.error('Failed to start replay buffer:', err);
      this.stopBuffer(false);
      throw err;
    }
  }

  private pruneBuffer() {
    if (this.chunks.length <= 1) return;
    const now = Date.now();
    const cutoff = now - this.maxBufferSeconds * 1000;

    this.chunks = this.chunks.filter((chunk) => chunk.timestamp >= cutoff);

    const deviceRamGb =
      typeof navigator !== 'undefined' && 'deviceMemory' in navigator
        ? Number((navigator as Navigator & { deviceMemory?: number }).deviceMemory) || 4
        : 4;
    const maxSafeBufferBytes =
      deviceRamGb <= 2
        ? 60 * 1024 * 1024
        : deviceRamGb <= 4
        ? 140 * 1024 * 1024
        : 320 * 1024 * 1024;

    let totalBytes = 0;
    for (let i = 0; i < this.chunks.length; i++) {
      totalBytes += this.chunks[i].blob.size;
    }
    while (totalBytes > maxSafeBufferBytes && this.chunks.length > 5) {
      const removed = this.chunks.shift();
      if (removed) {
        totalBytes -= removed.blob.size;
      }
    }
  }

  private notifyBufferUpdate() {
    const bufferedSecs = this.getBufferedSeconds();
    const total = this.isNativeApkMode ? bufferedSecs : this.chunks.length;
    this.bufferUpdateListeners.forEach((listener) => listener(bufferedSecs, total));
  }

  // Stop buffer
  stopBuffer(stopNativeService: boolean = true) {
    if (this.bufferTimer) {
      clearInterval(this.bufferTimer);
      this.bufferTimer = null;
    }

    if (this.compositorTimer) {
      clearInterval(this.compositorTimer);
      this.compositorTimer = null;
    }

    if (this.mobileFallbackTimer) {
      clearInterval(this.mobileFallbackTimer);
      this.mobileFallbackTimer = null;
    }
    this.mobileFallbackCanvas = null;

    if (this.isNativeApkMode && stopNativeService) {
      nativeAndroidBridge.stopNativeReplayBuffer();
    }
    this.isNativeApkMode = false;
    this.nativeBufferStartTime = 0;

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }

    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }

    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }

    this.recordingCanvas = null;
    this.recordingCtx = null;

    if (this.isBuffering) {
      soundEffects.playBufferStopSound();
    }
    this.isBuffering = false;
    this.stateChangeListeners.forEach((l) => l(false));
    this.notifyBufferUpdate();
  }

  private captureThumbnail(): string {
    try {
      if (!this.previewVideo || this.previewVideo.videoWidth === 0) {
        return this.createFallbackThumbnail();
      }
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 270;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(this.previewVideo, 0, 0, canvas.width, canvas.height);
        this.drawWatermarkOnCanvas(ctx, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.85);
      }
    } catch {
      // Fallback
    }
    return this.createFallbackThumbnail();
  }

  private createFallbackThumbnail(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 270;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#e11d48');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Syne, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CLUTCH HIGHLIGHT', canvas.width / 2, canvas.height / 2);

      ctx.fillStyle = '#fecdd3';
      ctx.font = '14px Plus Jakarta Sans, sans-serif';
      ctx.fillText('Instant 5-Min Replay Buffer', canvas.width / 2, canvas.height / 2 + 30);

      this.drawWatermarkOnCanvas(ctx, canvas.width, canvas.height);
    }
    return canvas.toDataURL('image/jpeg', 0.85);
  }

  // Convert a NativeSavedClipPayload from ScreenRecordService into a SavedHighlight in IndexedDB
  private async importNativeSavedClipPayload(
    payload: NativeSavedClipPayload,
    customTitle?: string,
    fallbackGameTag: string = 'Mobile Game'
  ): Promise<SavedHighlight | null> {
    if (!payload.success || !payload.filePath) {
      return null;
    }

    const fileSize = payload.fileSizeBytes || 0;
    const videoBlob = await nativeAndroidBridge.readNativeFileToBlob(
      payload.filePath,
      fileSize,
      'video/mp4'
    );

    const durationSec = Math.max(1, payload.durationSeconds || 15);
    const gameTag = payload.gameName || fallbackGameTag;
    const id = `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const defaultTitle = customTitle || `${gameTag} Highlight (${durationSec}s)`;
    const thumbnailUrl =
      payload.thumbnailDataUrl && payload.thumbnailDataUrl.startsWith('data:image')
        ? payload.thumbnailDataUrl
        : this.createFallbackThumbnail();

    const effRes = (payload.resolution as ResolutionOption) || this.getEffectiveResolution();
    const effFps = (payload.fps as FpsOption) || this.getEffectiveFps();
    const resConfig = this.getResolutionConfig(effRes);
    const watermarkHidden = !this.shouldShowLogoInRecordedVideo();

    const clipData: Omit<SavedHighlight, 'videoUrl'> = {
      id,
      title: defaultTitle,
      blob: videoBlob,
      thumbnailUrl,
      durationSeconds: durationSec,
      fileSizeBytes: videoBlob.size > 0 ? videoBlob.size : fileSize,
      createdAt: Date.now(),
      gameTag,
      quality: `${resConfig.title} · ${effFps} FPS${this.lowPowerThrottled ? ' (Low Power)' : ''}`,
      resolution: effRes,
      fps: effFps,
      audioMode: (payload.audioMode as AudioRecordingMode) || this.audioMode,
      lowPowerSaved: this.lowPowerThrottled,
      watermarkHidden,
      logoConfig: { ...this.logoConfig },
      markers: [...this.markers],
    };

    const saved = await indexedDbStorage.saveHighlight(clipData);
    nativeAndroidBridge.registerClipFilePath(saved.id, payload.filePath);

    // Reset native timer start for the next rolling segment
    this.nativeBufferStartTime = Date.now();
    this.markers = [];

    soundEffects.playClipSavedSound();
    this.highlightSavedListeners.forEach((listener) => listener(saved));
    return saved;
  }

  // Clip the last N seconds (e.g. 300s = 5 minutes, 60s, 30s)
  async clipHighlight(
    durationSeconds: number = 300,
    title?: string,
    gameTag: string = 'Cyber Strike'
  ): Promise<SavedHighlight | null> {
    if (this.isNativeApkMode) {
      const payload = await nativeAndroidBridge.requestSaveNativeClip(durationSeconds, gameTag);
      if (!payload.success) {
        console.warn('Native clip failed:', payload.error);
        return null;
      }
      return await this.importNativeSavedClipPayload(payload, title, gameTag);
    }

    if (this.chunks.length === 0) {
      console.warn('Cannot clip highlight: buffer is empty');
      return null;
    }

    const now = Date.now();
    const clipCutoff = now - durationSeconds * 1000;

    const targetChunks = this.chunks.filter((c) => c.timestamp >= clipCutoff);

    const blobsToMerge: Blob[] = [];

    if (this.headerChunk && (!targetChunks.length || targetChunks[0].blob !== this.headerChunk)) {
      blobsToMerge.push(this.headerChunk);
    }

    for (const chunk of targetChunks) {
      blobsToMerge.push(chunk.blob);
    }

    if (blobsToMerge.length === 0 && this.headerChunk) {
      blobsToMerge.push(this.headerChunk);
    }

    const mimeType = this.mediaRecorder?.mimeType || 'video/webm';
    const finalBlob = new Blob(blobsToMerge, { type: mimeType });

    const calculatedDuration = Math.min(
      durationSeconds,
      Math.max(1, Math.round((now - (targetChunks[0]?.timestamp || now)) / 1000))
    );

    const thumbnailUrl = this.captureThumbnail();
    const id = `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const defaultTitle = title || `${gameTag} Clutch Play (${calculatedDuration}s)`;

    const relevantMarkers = this.markers.filter(
      (m) => m.timestamp >= this.getBufferedSeconds() - calculatedDuration
    );

    const effRes = this.getEffectiveResolution();
    const effFps = this.getEffectiveFps();
    const resConfig = this.getResolutionConfig(effRes);
    const watermarkHidden = !this.shouldShowLogoInRecordedVideo();
    const clipData: Omit<SavedHighlight, 'videoUrl'> = {
      id,
      title: defaultTitle,
      blob: finalBlob,
      thumbnailUrl,
      durationSeconds: calculatedDuration,
      fileSizeBytes: finalBlob.size,
      createdAt: Date.now(),
      gameTag,
      quality: `${resConfig.title} · ${effFps} FPS${this.lowPowerThrottled ? ' (Low Power)' : ''}`,
      resolution: effRes,
      fps: effFps,
      audioMode: this.audioMode,
      lowPowerSaved: this.lowPowerThrottled,
      watermarkHidden,
      logoConfig: { ...this.logoConfig },
      markers: relevantMarkers,
    };

    const saved = await indexedDbStorage.saveHighlight(clipData);

    soundEffects.playClipSavedSound();
    this.highlightSavedListeners.forEach((listener) => listener(saved));

    return saved;
  }
}

export const replayEngine = new ReplayBufferEngine();

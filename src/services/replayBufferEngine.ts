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
    // Cap resolution at lowPowerTargetResolution (or step down at least 1 tier if already <= target)
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
    return this.lowPowerTargetFps; // 30 FPS cap during low battery states
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
    if (!this.stream) return;
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
    const includeGame = mode === 'game_only' || mode === 'game_and_mic';
    const includeMic = mode === 'mic_only' || mode === 'game_and_mic';

    if (this.gameGainNode) {
      this.gameGainNode.gain.value = includeGame ? this.gameVolume : 0;
    }

    if (includeMic && this.isBuffering && this.audioCtx && this.mixedAudioDestination && !this.micStream) {
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

  // Start continuous 5-minute replay buffer
  async startBuffer(
    streamSource: 'game_arena' | 'screen_capture',
    canvasElement?: HTMLCanvasElement | null,
    audioModeOrEnableMic: AudioRecordingMode | boolean = this.audioMode
  ): Promise<boolean> {
    try {
      this.stopBuffer();

      if (typeof audioModeOrEnableMic === 'boolean') {
        this.audioMode = audioModeOrEnableMic ? 'game_and_mic' : 'game_only';
      } else {
        this.audioMode = audioModeOrEnableMic;
      }

      const includeGameAudio =
        this.audioMode === 'game_only' || this.audioMode === 'game_and_mic';
      const includeMicAudio =
        this.audioMode === 'mic_only' || this.audioMode === 'game_and_mic';

      let videoStream: MediaStream;
      const effRes = this.getEffectiveResolution();
      const effFps = this.getEffectiveFps();
      const resConfig = this.getResolutionConfig(effRes);

      if (streamSource === 'game_arena') {
        if (!canvasElement) {
          throw new Error('Canvas element required for game arena stream');
        }
        // Capture stream at effective FPS
        videoStream = canvasElement.captureStream(effFps);
      } else {
        // Real screen recording API for any game or screen
        if (!navigator.mediaDevices?.getDisplayMedia) {
          throw new Error('Screen capture is not supported by your browser. Please use Chrome, Edge, or Firefox.');
        }
        const videoConstraints: MediaTrackConstraints = {
          frameRate: { ideal: effFps, max: effFps },
          width: { ideal: resConfig.width },
          height: { ideal: resConfig.height },
        };
        if (this.lowPowerThrottled || effRes === '480p' || effRes === '720p') {
          videoConstraints.width = { ideal: resConfig.width, max: resConfig.width };
          videoConstraints.height = { ideal: resConfig.height, max: resConfig.height };
        }
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

        // Game / System audio track
        const streamAudioTracks = videoStream.getAudioTracks();
        if (streamAudioTracks.length > 0) {
          const gameSource = this.audioCtx.createMediaStreamSource(new MediaStream(streamAudioTracks));
          gameSource.connect(this.gameGainNode);
        }

        // Microphone audio track (when 'mic_only' or 'game_and_mic' is selected)
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

      // Attach raw stream to previewVideo for compositor & thumbnail capture
      if (this.previewVideo) {
        this.previewVideo.srcObject = videoStream;
        this.previewVideo.play().catch(() => {});
      }

      // Set up recorded video canvas compositor so the recorded video includes the watermark
      // when showLogo is true (or for free users) and HIDES the logo in the recorded video
      // when a subscribed user turns on Hide Logo (while keeping the logo visible on the screen UI)
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

            // Only draw logo in recorded video if shouldShowLogoInRecordedVideo() is true
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

      // Combine video + mixed audio tracks
      const recordingStream = new MediaStream([
        ...recordedVideoTracks,
        ...finalAudioTracks,
      ]);

      // Check supported MIME types across all Android WebViews, Chrome, Samsung Internet, Firefox, and Safari/WebKit
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

      // Calculate bitrate based on effective resolution, fps, and low-power bitrate scale
      const bitrate = this.getEffectiveBitrate();

      // Multi-stage fallback so MediaRecorder never fails on budget/older hardware encoders
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
          // Final fallback: let the device's native WebView/browser choose its default container & bitrate
          this.mediaRecorder = new MediaRecorder(recordingStream);
        }
      }

      this.chunks = [];
      this.headerChunk = null;
      this.markers = [];

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          if (!this.headerChunk) {
            // First chunk contains essential container metadata / EBML header
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

      // Handle user manually stopping screen share from browser banner
      const videoTrack = videoStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          this.stopBuffer();
        };

        // When user switches shared window mid-stream
        videoTrack.addEventListener('unmute', () => {
          if (this.stream) {
            const updated = gameDetector.detectGameFromMediaStream(this.stream);
            this.gameDetectedListeners.forEach((l) => l(updated));
          }
        });
      }

      // Record in 1000ms slices (or 1500ms in low power mode to reduce chunking overhead)
      const sliceMs = this.lowPowerThrottled ? 1500 : 1000;
      this.mediaRecorder.start(sliceMs);
      this.isBuffering = true;
      this.stateChangeListeners.forEach((l) => l(true));
      soundEffects.playBufferStartSound();

      // Buffer heartbeat timer for UI seconds counter
      this.bufferTimer = window.setInterval(() => {
        this.notifyBufferUpdate();
      }, 500);

      return true;
    } catch (err) {
      console.error('Failed to start replay buffer:', err);
      this.stopBuffer();
      throw err;
    }
  }

  // Prune chunks that are older than maxBufferSeconds AND protect low-RAM (2GB-4GB) devices from Out-Of-Memory
  private pruneBuffer() {
    if (this.chunks.length <= 1) return;
    const now = Date.now();
    const cutoff = now - this.maxBufferSeconds * 1000;

    // Filter out chunks before cutoff, keep at least the most recent chunks
    this.chunks = this.chunks.filter((chunk) => chunk.timestamp >= cutoff);

    // Hardware RAM safety ceiling based on navigator.deviceMemory (defaults to 4GB if unreported)
    const deviceRamGb =
      typeof navigator !== 'undefined' && 'deviceMemory' in navigator
        ? Number((navigator as Navigator & { deviceMemory?: number }).deviceMemory) || 4
        : 4;
    const maxSafeBufferBytes =
      deviceRamGb <= 2
        ? 60 * 1024 * 1024 // 60 MB ceiling on 2GB RAM phones
        : deviceRamGb <= 4
        ? 140 * 1024 * 1024 // 140 MB ceiling on 4GB RAM phones
        : 320 * 1024 * 1024; // 320 MB ceiling on 6GB+ RAM phones

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
    const total = this.chunks.length;
    this.bufferUpdateListeners.forEach((listener) => listener(bufferedSecs, total));
  }

  // Stop buffer
  stopBuffer() {
    if (this.bufferTimer) {
      clearInterval(this.bufferTimer);
      this.bufferTimer = null;
    }

    if (this.compositorTimer) {
      clearInterval(this.compositorTimer);
      this.compositorTimer = null;
    }

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

  // Generate a thumbnail frame from the live video stream (respecting Hide Logo in recorded video)
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
      // Sleek gaming gradient
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

  // Clip the last N seconds (e.g. 300s = 5 minutes, 60s, 30s)
  async clipHighlight(
    durationSeconds: number = 300,
    title?: string,
    gameTag: string = 'Cyber Strike'
  ): Promise<SavedHighlight | null> {
    if (this.chunks.length === 0) {
      console.warn('Cannot clip highlight: buffer is empty');
      return null;
    }

    const now = Date.now();
    const clipCutoff = now - durationSeconds * 1000;

    // Filter chunks within the requested retroactive window
    const targetChunks = this.chunks.filter((c) => c.timestamp >= clipCutoff);

    const blobsToMerge: Blob[] = [];

    // Ensure container initialization segment is present
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

    // Relevant markers within clip timeframe
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

    // Play celebration audio feedback
    soundEffects.playClipSavedSound();

    // Broadcast event
    this.highlightSavedListeners.forEach((listener) => listener(saved));

    return saved;
  }
}

export const replayEngine = new ReplayBufferEngine();

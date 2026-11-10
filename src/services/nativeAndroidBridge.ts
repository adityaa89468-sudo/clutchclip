// Native Android APK Bridge Service
// Connects the React TypeScript frontend directly to MainActivity.java & ScreenRecordService.java
// via @JavascriptInterface (window.ClutchClipAndroid)

export interface NativeAndroidDeviceInfo {
  packageName: string;
  manufacturer: string;
  model: string;
  sdkInt: number;
  release: string;
  isNativeApk: boolean;
  firebaseProjectId: string;
  admobAppId?: string;
}

export interface NativeSavedClipPayload {
  success: boolean;
  filePath?: string;
  fileName?: string;
  fileSizeBytes?: number;
  durationSeconds?: number;
  gameName?: string;
  resolution?: string;
  fps?: number;
  audioMode?: string;
  thumbnailDataUrl?: string;
  galleryUri?: string;
  error?: string;
}

export interface LogcatEntry {
  id: string;
  timestamp: string;
  tag: 'ClutchClipJNI' | 'MediaProjectionSvc' | 'OverlayWM' | 'GoogleAuthBridge' | 'PlayBillingV6' | 'AdMobSDK';
  level: 'INFO' | 'DEBUG' | 'WARN';
  message: string;
}

interface ClutchClipNativeInterface {
  signInWithGoogle?: () => void;
  signOutGoogle?: () => void;
  getGoogleIdToken?: () => string | null;
  requestGoogleIdToken?: () => void;
  startReplayBuffer?: (resolution: string, fps: number) => void;
  startReplayBufferWithAudio?: (resolution: string, fps: number, audioMode: string) => void;
  stopReplayBuffer?: () => void;
  saveRetroactiveClip?: (durationSeconds: number, gameName: string) => void;
  isNativeRecording?: () => boolean;
  getNativeBufferedSeconds?: () => number;
  readClipFileChunkBase64?: (filePath: string, offset: number, length: number) => string;
  shareNativeVideoFile?: (filePath: string, title: string) => void;
  showNativeToast?: (message: string) => void;
  setFloatingOverlayEnabled?: (enabled: boolean) => boolean;
  setPremiumAdFreeStatus?: (isPremium: boolean) => void;
  showAppOpenAdIfFree?: () => void;
  setBannerAdVisible?: (visible: boolean) => void;
  setLowPowerMode?: (active: boolean, effectiveResolution: string, effectiveFps: number) => void;
  setAudioRecordingMode?: (mode: string) => void;
  getBatteryStatusJson?: () => string;
  triggerHaptic?: (durationMs: number) => void;
  getDeviceInfoJson?: () => string;
  purchaseSubscription?: (productId: string, basePlanId: string) => void;
  restorePlayPurchases?: () => void;
  openPlayStoreSubscriptions?: (productId: string) => void;
}

declare global {
  interface Window {
    ClutchClipAndroid?: ClutchClipNativeInterface;
    onNativeGoogleAuthSuccess?: (jsonPayload: string) => void;
    onNativeScreenCaptureResult?: (success: boolean, errorMessage: string | null) => void;
    onNativeScreenCaptureStopped?: () => void;
    onNativeClipSaved?: (jsonPayload: string) => void;
    onNativePlayBillingResult?: (jsonPayload: string) => void;
    onNativePlayRestoreResult?: (jsonPayload: string) => void;
  }
}

class NativeAndroidBridgeService {
  private logcatHistory: LogcatEntry[] = [];
  private listeners: Array<(logs: LogcatEntry[]) => void> = [];
  private floatingOverlayActive = true;
  private pendingCaptureResolver: ((value: { success: boolean; error?: string }) => void) | null = null;
  private pendingClipResolver: ((payload: NativeSavedClipPayload) => void) | null = null;
  private externalClipSavedListeners: Set<(payload: NativeSavedClipPayload) => void> = new Set();
  private nativeStoppedListeners: Set<() => void> = new Set();
  private lastSavedFilePathMap: Map<string, string> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('clutchclip-native-event', (event: Event) => {
        const customEvent = event as CustomEvent<{ type: string; data?: unknown; code?: number }>;
        const detail = customEvent.detail;
        if (detail?.type) {
          this.appendLog(
            'ClutchClipJNI',
            'INFO',
            `Native Event [${detail.type}]`
          );
        }
      });

      window.onNativeScreenCaptureResult = (success: boolean, errorMessage: string | null) => {
        this.appendLog(
          'MediaProjectionSvc',
          success ? 'INFO' : 'WARN',
          success ? 'MediaProjection foreground service started' : `Capture rejected: ${errorMessage || 'cancelled'}`
        );
        if (this.pendingCaptureResolver) {
          const resolve = this.pendingCaptureResolver;
          this.pendingCaptureResolver = null;
          resolve({ success, error: errorMessage || undefined });
        }
      };

      window.onNativeScreenCaptureStopped = () => {
        this.appendLog('MediaProjectionSvc', 'INFO', 'Native screen recording service stopped');
        this.nativeStoppedListeners.forEach((cb) => cb());
      };

      window.onNativeClipSaved = (jsonPayload: string) => {
        try {
          const parsed = JSON.parse(jsonPayload) as NativeSavedClipPayload;
          this.appendLog(
            'MediaProjectionSvc',
            parsed.success ? 'INFO' : 'WARN',
            parsed.success
              ? `Saved MP4 highlight: ${parsed.fileName} (${parsed.durationSeconds}s)`
              : `Clip save failed: ${parsed.error || 'unknown'}`
          );

          if (this.pendingClipResolver) {
            const resolve = this.pendingClipResolver;
            this.pendingClipResolver = null;
            resolve(parsed);
          } else if (parsed.success) {
            // Triggered directly from Android Notification or Native Floating Overlay button while gaming
            this.externalClipSavedListeners.forEach((cb) => cb(parsed));
          }
        } catch (err) {
          console.error('Failed to parse native clip payload:', err);
        }
      };
    }
  }

  public isRunningInNativeApk(): boolean {
    return typeof window !== 'undefined' && Boolean(window.ClutchClipAndroid);
  }

  public isNativeScreenRecording(): boolean {
    if (typeof window !== 'undefined' && window.ClutchClipAndroid?.isNativeRecording) {
      try {
        return Boolean(window.ClutchClipAndroid.isNativeRecording());
      } catch {
        return false;
      }
    }
    return false;
  }

  public getNativeBufferedSeconds(): number {
    if (typeof window !== 'undefined' && window.ClutchClipAndroid?.getNativeBufferedSeconds) {
      try {
        return Number(window.ClutchClipAndroid.getNativeBufferedSeconds()) || 0;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  public requestNativeScreenCapture(
    resolution: string,
    fps: number,
    audioMode: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isRunningInNativeApk()) {
      return Promise.resolve({ success: false, error: 'Not running in Android APK' });
    }

    return new Promise((resolve) => {
      this.pendingCaptureResolver = resolve;
      try {
        if (window.ClutchClipAndroid?.startReplayBufferWithAudio) {
          window.ClutchClipAndroid.startReplayBufferWithAudio(resolution, fps, audioMode);
        } else if (window.ClutchClipAndroid?.startReplayBuffer) {
          window.ClutchClipAndroid.startReplayBuffer(resolution, fps);
        } else {
          this.pendingCaptureResolver = null;
          resolve({ success: false, error: 'Native screen recorder bridge not found' });
        }
      } catch (err) {
        this.pendingCaptureResolver = null;
        resolve({
          success: false,
          error: err instanceof Error ? err.message : 'Failed to start Android screen capture',
        });
      }
    });
  }

  public requestSaveNativeClip(
    durationSeconds: number,
    gameName: string
  ): Promise<NativeSavedClipPayload> {
    if (!this.isRunningInNativeApk()) {
      return Promise.resolve({ success: false, error: 'Not running in Android APK' });
    }

    return new Promise((resolve) => {
      const timeoutId = window.setTimeout(() => {
        if (this.pendingClipResolver) {
          this.pendingClipResolver = null;
          resolve({
            success: false,
            error: 'Clip save timed out. Please try again.',
          });
        }
      }, 12000);

      this.pendingClipResolver = (payload) => {
        clearTimeout(timeoutId);
        resolve(payload);
      };

      try {
        window.ClutchClipAndroid?.saveRetroactiveClip?.(durationSeconds, gameName);
      } catch (err) {
        clearTimeout(timeoutId);
        this.pendingClipResolver = null;
        resolve({
          success: false,
          error: err instanceof Error ? err.message : 'Native clip error',
        });
      }
    });
  }

  public async readNativeFileToBlob(
    filePath: string,
    totalBytes: number,
    mimeType = 'video/mp4'
  ): Promise<Blob> {
    if (!this.isRunningInNativeApk() || !window.ClutchClipAndroid?.readClipFileChunkBase64) {
      return new Blob([], { type: mimeType });
    }

    const chunkSize = 256 * 1024; // 256 KB chunks
    const byteArrays: Uint8Array[] = [];
    let offset = 0;
    const maxBytes = Math.min(totalBytes, 80 * 1024 * 1024); // Cap at 80 MB for IndexedDB safety

    while (offset < maxBytes) {
      const b64 = window.ClutchClipAndroid.readClipFileChunkBase64(filePath, offset, chunkSize);
      if (!b64 || b64.length === 0) {
        break;
      }
      const binaryStr = atob(b64);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      byteArrays.push(bytes);
      offset += len;
      if (len < chunkSize) {
        break;
      }
    }

    return new Blob(byteArrays, { type: mimeType });
  }

  public registerClipFilePath(highlightId: string, nativeFilePath: string): void {
    this.lastSavedFilePathMap.set(highlightId, nativeFilePath);
  }

  public getClipFilePath(highlightId: string): string | undefined {
    return this.lastSavedFilePathMap.get(highlightId);
  }

  public shareNativeClip(highlightId: string, title: string): boolean {
    if (!this.isRunningInNativeApk() || !window.ClutchClipAndroid?.shareNativeVideoFile) {
      return false;
    }
    const path = this.lastSavedFilePathMap.get(highlightId) || '';
    window.ClutchClipAndroid.shareNativeVideoFile(path, title);
    return true;
  }

  public showNativeToast(message: string): void {
    if (typeof window !== 'undefined' && window.ClutchClipAndroid?.showNativeToast) {
      window.ClutchClipAndroid.showNativeToast(message);
    }
  }

  public onExternalClipSaved(cb: (payload: NativeSavedClipPayload) => void): () => void {
    this.externalClipSavedListeners.add(cb);
    return () => this.externalClipSavedListeners.delete(cb);
  }

  public onNativeCaptureStopped(cb: () => void): () => void {
    this.nativeStoppedListeners.add(cb);
    return () => this.nativeStoppedListeners.delete(cb);
  }

  public getDeviceInfo(): NativeAndroidDeviceInfo {
    if (typeof window !== 'undefined' && window.ClutchClipAndroid?.getDeviceInfoJson) {
      try {
        const raw = window.ClutchClipAndroid.getDeviceInfoJson();
        return JSON.parse(raw) as NativeAndroidDeviceInfo;
      } catch {
        // fallback below
      }
    }

    return {
      packageName: '',
      manufacturer: 'Android',
      model: 'Android Device',
      sdkInt: 34,
      release: '14',
      isNativeApk: this.isRunningInNativeApk(),
      firebaseProjectId: '',
    };
  }

  public getNativeBatteryStatus(): { levelPercent: number; isCharging: boolean } | null {
    if (typeof window !== 'undefined' && window.ClutchClipAndroid?.getBatteryStatusJson) {
      try {
        const raw = window.ClutchClipAndroid.getBatteryStatusJson();
        const parsed = JSON.parse(raw) as { level?: number; charging?: boolean };
        if (typeof parsed.level === 'number') {
          return {
            levelPercent: Math.max(0, Math.min(100, Math.round(parsed.level))),
            isCharging: Boolean(parsed.charging),
          };
        }
      } catch {
        // fallback to Web Battery API
      }
    }
    return null;
  }

  public syncNativeLowPowerMode(
    active: boolean,
    effectiveResolution: string,
    effectiveFps: number,
    _batteryLevel: number
  ): void {
    if (typeof window !== 'undefined' && window.ClutchClipAndroid?.setLowPowerMode) {
      window.ClutchClipAndroid.setLowPowerMode(active, effectiveResolution, effectiveFps);
    }
  }

  public syncNativeAudioRecordingMode(mode: string): void {
    if (typeof window !== 'undefined' && window.ClutchClipAndroid?.setAudioRecordingMode) {
      window.ClutchClipAndroid.setAudioRecordingMode(mode);
    }
  }

  public startNativeReplayBuffer(resolution: string, fps: number): void {
    if (typeof window !== 'undefined' && window.ClutchClipAndroid?.startReplayBuffer) {
      window.ClutchClipAndroid.startReplayBuffer(resolution, fps);
    }
    this.triggerHaptic(35);
  }

  public stopNativeReplayBuffer(): void {
    if (typeof window !== 'undefined' && window.ClutchClipAndroid?.stopReplayBuffer) {
      window.ClutchClipAndroid.stopReplayBuffer();
    }
    this.triggerHaptic(20);
  }

  public saveNativeRetroactiveClip(durationSeconds: number, gameName: string): void {
    if (typeof window !== 'undefined' && window.ClutchClipAndroid?.saveRetroactiveClip) {
      window.ClutchClipAndroid.saveRetroactiveClip(durationSeconds, gameName);
    }
    this.triggerHaptic(50);
  }

  public setFloatingOverlay(enabled: boolean): boolean {
    this.floatingOverlayActive = enabled;
    if (typeof window !== 'undefined' && window.ClutchClipAndroid?.setFloatingOverlayEnabled) {
      return window.ClutchClipAndroid.setFloatingOverlayEnabled(enabled);
    }
    this.triggerHaptic(25);
    return true;
  }

  public isFloatingOverlayEnabled(): boolean {
    return this.floatingOverlayActive;
  }

  public syncNativeAdFreeStatus(isPremium: boolean): void {
    if (typeof window !== 'undefined' && window.ClutchClipAndroid?.setPremiumAdFreeStatus) {
      window.ClutchClipAndroid.setPremiumAdFreeStatus(isPremium);
    }
  }

  public triggerNativeAppOpenAd(): void {
    if (typeof window !== 'undefined' && window.ClutchClipAndroid?.showAppOpenAdIfFree) {
      window.ClutchClipAndroid.showAppOpenAdIfFree();
    }
  }

  public triggerNativeGoogleSignIn(): void {
    if (typeof window !== 'undefined' && window.ClutchClipAndroid?.signInWithGoogle) {
      window.ClutchClipAndroid.signInWithGoogle();
    }
  }

  public triggerHaptic(durationMs = 30): void {
    if (typeof window !== 'undefined' && window.ClutchClipAndroid?.triggerHaptic) {
      window.ClutchClipAndroid.triggerHaptic(durationMs);
      return;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(durationMs);
      } catch {
        // ignore vibration restriction
      }
    }
  }

  public getLogs(): LogcatEntry[] {
    return this.logcatHistory;
  }

  public clearLogs(): void {
    this.logcatHistory = [];
    this.notifyListeners();
  }

  public subscribeLogs(cb: (logs: LogcatEntry[]) => void): () => void {
    this.listeners.push(cb);
    cb(this.logcatHistory);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public appendLog(
    tag: LogcatEntry['tag'],
    level: LogcatEntry['level'],
    message: string
  ): void {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const entry: LogcatEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: timeStr,
      tag,
      level,
      message,
    };
    this.logcatHistory = [entry, ...this.logcatHistory.slice(0, 49)];
    this.notifyListeners();
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.logcatHistory);
    }
  }
}

export const nativeAndroidBridge = new NativeAndroidBridgeService();

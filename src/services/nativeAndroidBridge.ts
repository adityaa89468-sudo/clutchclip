// Native Android APK Bridge Service
// Connects the React TypeScript frontend directly to MainActivity.java & NativeBridgeInterface
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

export interface LogcatEntry {
  id: string;
  timestamp: string;
  tag: 'ClutchClipJNI' | 'MediaProjectionSvc' | 'OverlayWM' | 'GoogleAuthBridge' | 'PlayBillingV6' | 'AdMobSDK';
  level: 'INFO' | 'DEBUG' | 'WARN';
  message: string;
}

interface ClutchClipNativeInterface {
  signInWithGoogle?: () => void;
  requestGoogleIdToken?: () => void;
  startReplayBuffer?: (resolution: string, fps: number) => void;
  stopReplayBuffer?: () => void;
  saveRetroactiveClip?: (durationSeconds: number, gameName: string) => void;
  setFloatingOverlayEnabled?: (enabled: boolean) => boolean;
  setPremiumAdFreeStatus?: (isPremium: boolean) => void;
  showAppOpenAdIfFree?: () => void;
  setBannerAdVisible?: (visible: boolean) => void;
  setLowPowerMode?: (active: boolean, effectiveResolution: string, effectiveFps: number) => void;
  setAudioRecordingMode?: (mode: string) => void;
  getBatteryStatusJson?: () => string;
  triggerHaptic?: (durationMs: number) => void;
  getDeviceInfoJson?: () => string;
}

declare global {
  interface Window {
    ClutchClipAndroid?: ClutchClipNativeInterface;
  }
}

class NativeAndroidBridgeService {
  private logcatHistory: LogcatEntry[] = [];
  private listeners: Array<(logs: LogcatEntry[]) => void> = [];
  private floatingOverlayActive = false;

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
    }
  }

  public isRunningInNativeApk(): boolean {
    return typeof window !== 'undefined' && Boolean(window.ClutchClipAndroid);
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

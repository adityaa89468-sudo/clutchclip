import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { nativeAndroidBridge } from '../services/nativeAndroidBridge';

interface NavigatorBatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener(type: 'levelchange' | 'chargingchange', listener: () => void): void;
  removeEventListener(type: 'levelchange' | 'chargingchange', listener: () => void): void;
}

declare global {
  interface Navigator {
    getBattery?: () => Promise<NavigatorBatteryManager>;
  }
}

const STORAGE_KEY = 'clutchclip_low_power_config';

const DEFAULT_LOW_POWER_CONFIG: LowPowerConfig = {
  policy: 'auto',
  thresholdPercent: 20,
  targetResolution: '720p',
  targetFps: 30,
  disableWhenCharging: true,
  bitrateScale: 0.55,
};

const RESOLUTION_RANK: Record<ResolutionOption, number> = {
  '480p': 1,
  '720p': 2,
  '1080p': 3,
  '1440p': 4,
  '4k': 5,
};

export function useLowPowerMode(
  userResolution: ResolutionOption,
  userFps: FpsOption
) {
  const [config, setConfig] = useState<LowPowerConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<LowPowerConfig>;
          return {
            ...DEFAULT_LOW_POWER_CONFIG,
            ...parsed,
          };
        }
      } catch {
        // fallback to default
      }
    }
    return DEFAULT_LOW_POWER_CONFIG;
  });

  const [hardwareBattery, setHardwareBattery] = useState<{
    levelPercent: number;
    isCharging: boolean;
    isSupported: boolean;
  }>({
    levelPercent: 82,
    isCharging: false,
    isSupported: false,
  });

  const [isSimulatedLow, setIsSimulatedLow] = useState<boolean>(false);

  // Persist config changes
  const updateConfig = useCallback((partial: Partial<LowPowerConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Poll / subscribe to Web Battery API & Native Android BatteryManager
  useEffect(() => {
    let batteryManager: NavigatorBatteryManager | null = null;
    let isMounted = true;

    const syncFromBatteryManager = () => {
      if (!isMounted || !batteryManager) return;
      setHardwareBattery({
        levelPercent: Math.round(batteryManager.level * 100),
        isCharging: Boolean(batteryManager.charging),
        isSupported: true,
      });
    };

    const checkNativeOrWebBattery = async () => {
      const nativeBat = nativeAndroidBridge.getNativeBatteryStatus();
      if (nativeBat && isMounted) {
        setHardwareBattery({
          levelPercent: nativeBat.levelPercent,
          isCharging: nativeBat.isCharging,
          isSupported: true,
        });
        return;
      }

      if (typeof navigator !== 'undefined' && typeof navigator.getBattery === 'function') {
        try {
          batteryManager = await navigator.getBattery();
          if (!isMounted) return;
          syncFromBatteryManager();
          batteryManager.addEventListener('levelchange', syncFromBatteryManager);
          batteryManager.addEventListener('chargingchange', syncFromBatteryManager);
        } catch {
          // fallback if blocked by browser permissions policy
        }
      }
    };

    checkNativeOrWebBattery();

    // Also poll native Android battery status every 15s if running in APK
    const interval = window.setInterval(() => {
      const nativeBat = nativeAndroidBridge.getNativeBatteryStatus();
      if (nativeBat && isMounted) {
        setHardwareBattery({
          levelPercent: nativeBat.levelPercent,
          isCharging: nativeBat.isCharging,
          isSupported: true,
        });
      }
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', syncFromBatteryManager);
        batteryManager.removeEventListener('chargingchange', syncFromBatteryManager);
      }
    };
  }, []);

  const batteryStatus: BatteryStatusInfo = useMemo(() => {
    if (isSimulatedLow) {
      return {
        levelPercent: 14,
        isCharging: false,
        isSupported: hardwareBattery.isSupported,
        isSimulatedLow: true,
      };
    }
    return {
      levelPercent: hardwareBattery.levelPercent,
      isCharging: hardwareBattery.isCharging,
      isSupported: hardwareBattery.isSupported,
      isSimulatedLow: false,
    };
  }, [hardwareBattery, isSimulatedLow]);

  // Determine whether Low Power Mode is currently active and throttling the buffer
  const isLowPowerActive = useMemo(() => {
    if (config.policy === 'always_on') return true;
    if (config.policy === 'off') return false;
    // 'auto' policy: activate when battery <= thresholdPercent
    const isBatteryLow = batteryStatus.levelPercent <= config.thresholdPercent;
    if (!isBatteryLow) return false;
    if (config.disableWhenCharging && batteryStatus.isCharging) return false;
    return true;
  }, [config, batteryStatus]);

  // Compute effective throttled resolution
  const effectiveResolution: ResolutionOption = useMemo(() => {
    if (!isLowPowerActive) return userResolution;
    if (RESOLUTION_RANK[userResolution] > RESOLUTION_RANK[config.targetResolution]) {
      return config.targetResolution;
    }
    if (userResolution === '720p' && config.targetResolution === '720p') {
      return '480p';
    }
    return '480p';
  }, [isLowPowerActive, userResolution, config.targetResolution]);

  // Compute effective throttled frame rate
  const effectiveFps: FpsOption = useMemo(() => {
    if (!isLowPowerActive) return userFps;
    return config.targetFps; // 30 FPS
  }, [isLowPowerActive, userFps, config.targetFps]);

  // Compute normal vs effective bitrate & GPU/Encoder load savings
  const normalBitrate = useMemo(() => {
    const slot = RESOLUTION_SLOTS[userResolution] || RESOLUTION_SLOTS['1080p'];
    return Math.round(slot.baseBitrate * (userFps / 60));
  }, [userResolution, userFps]);

  const effectiveBitrate = useMemo(() => {
    const slot = RESOLUTION_SLOTS[effectiveResolution] || RESOLUTION_SLOTS['720p'];
    const scale = isLowPowerActive ? config.bitrateScale : 1.0;
    return Math.round(slot.baseBitrate * (effectiveFps / 60) * scale);
  }, [effectiveResolution, effectiveFps, isLowPowerActive, config.bitrateScale]);

  const powerSavingsPercent = useMemo(() => {
    if (!isLowPowerActive || normalBitrate <= 0) return 0;
    const saved = Math.round((1 - effectiveBitrate / normalBitrate) * 100);
    return Math.max(25, Math.min(85, saved));
  }, [isLowPowerActive, normalBitrate, effectiveBitrate]);

  const setPolicy = useCallback(
    (policy: LowPowerPolicy) => updateConfig({ policy }),
    [updateConfig]
  );

  const setThresholdPercent = useCallback(
    (thresholdPercent: LowPowerThreshold) => updateConfig({ thresholdPercent }),
    [updateConfig]
  );

  const setTargetResolution = useCallback(
    (targetResolution: LowPowerTargetResolution) => updateConfig({ targetResolution }),
    [updateConfig]
  );

  const setDisableWhenCharging = useCallback(
    (disableWhenCharging: boolean) => updateConfig({ disableWhenCharging }),
    [updateConfig]
  );

  const toggleSimulatedLowBattery = useCallback(() => {
    setIsSimulatedLow((prev) => !prev);
  }, []);

  return {
    config,
    batteryStatus,
    isLowPowerActive,
    effectiveResolution,
    effectiveFps,
    normalBitrate,
    effectiveBitrate,
    powerSavingsPercent,
    setPolicy,
    setThresholdPercent,
    setTargetResolution,
    setDisableWhenCharging,
    toggleSimulatedLowBattery,
  };
}

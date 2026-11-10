/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Film,
  SlidersHorizontal,
  Settings,
  Gamepad2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Share2,
  Smartphone,
  Crown,
  Lock,
  Radio,
  Monitor,
  Volume2,
  Mic,
  Headphones
} from 'lucide-react';
import { BufferDuration, SavedHighlight, ResolutionOption, FpsOption, LogoConfig, MembershipTier, AudioRecordingMode, AUDIO_MODE_OPTIONS } from './types/recorder';
import { replayEngine } from './services/replayBufferEngine';
import { indexedDbStorage } from './services/indexedDbStorage';
import { soundEffects } from './services/soundEffects';
import { googlePlayBilling, ANDROID_PACKAGE_NAME, PlayBillingReceipt } from './services/googlePlayBilling';
import {
  auth,
  onAuthStateChanged,
  signInWithGoogleAccount,
  checkRedirectSignInResult,
  signOutGoogleAccount,
  saveUserSubscriptionToFirestore,
  fetchUserSubscriptionFromFirestore,
  ensureUserSubscriptionRecord,
  subscribeToUserSubscription,
  buildDefaultUserSubscription,
  registerGoogleSignInModalListener,
  completeModalGoogleSignIn,
  cancelModalGoogleSignIn,
  User,
  UserSubscriptionRecord
} from './services/firebase';

import { LiveBufferPanel } from './components/LiveBufferPanel';
import { LiveScreenMonitor } from './components/LiveScreenMonitor';
import { FloatingReplayWidget } from './components/FloatingReplayWidget';
import { HighlightVault } from './components/HighlightVault';
import { HighlightEditor } from './components/HighlightEditor';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { MobileDeviceSimulator } from './components/MobileDeviceSimulator';
import { PremiumModal } from './components/PremiumModal';
import { LogoSettingsCard } from './components/LogoSettingsCard';
import { StorageUsageCard } from './components/StorageUsageCard';
import { PremiumComparisonView } from './components/PremiumComparisonView';
import { UserProfileSettingsCard } from './components/UserProfileSettingsCard';
import { LowPowerModeCard } from './components/LowPowerModeCard';
import { AppLogo } from './components/AppLogo';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { useLowPowerMode } from './hooks/useLowPowerMode';
import { nativeAndroidBridge } from './services/nativeAndroidBridge';
import { admobService } from './services/admobService';
import { AdMobBannerBar } from './components/AdMobBannerBar';
import { LegalSettingsFooter } from './components/LegalSettingsFooter';
import { FirstLaunchIntroModal, ONBOARDING_STORAGE_KEY } from './components/FirstLaunchIntroModal';
import { SplashScreen } from './components/SplashScreen';
import { GoogleSignInModal } from './components/GoogleSignInModal';

type Tab = 'screen' | 'buffer' | 'premium' | 'vault' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const legalParam = params.get('legal') || params.get('page');
      if (legalParam === 'privacy' || legalParam === 'terms') {
        return 'settings';
      }
    }
    return 'screen';
  });
  const [currentGameName, setCurrentGameName] = useState<string>('Valorant');

  const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days (1 month)

  const [tierExpiresAt, setTierExpiresAt] = useState<number | null>(null);

  // Membership Tier state (Free until verified via Google Sign-In; ₹29 1-Month 2K+90fps, ₹99 1-Month 4K+120fps)
  const [userTier, setUserTier] = useState<MembershipTier>('free');

  const isPremium = userTier !== 'free';
  const [playReceipt, setPlayReceipt] = useState<PlayBillingReceipt | null>(() => {
    return googlePlayBilling.getSavedReceipt();
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [subscriptionRecord, setSubscriptionRecord] = useState<UserSubscriptionRecord | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const daysRemaining =
    tierExpiresAt && tierExpiresAt > Date.now()
      ? Math.max(1, Math.ceil((tierExpiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
      : 30;
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [premiumTargetFeature, setPremiumTargetFeature] = useState<string | undefined>(undefined);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showFirstLaunchIntro, setShowFirstLaunchIntro] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(ONBOARDING_STORAGE_KEY) !== 'true';
      } catch {
        return true;
      }
    }
    return false;
  });
  const isOnline = useOnlineStatus();

  // Sync AdMob Ad-Free status with Native Android APK whenever membership tier changes
  useEffect(() => {
    admobService.syncMembershipTier(userTier);
  }, [userTier]);

  // Logo & Watermark Configuration (Remove watermark / hide logo is available to subscribed users only)
  const [logoConfig, setLogoConfig] = useState<LogoConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('clutchclip_logo_config');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as LogoConfig;
          return {
            ...parsed,
            showLogo: isPremium ? parsed.showLogo : true,
          };
        } catch {}
      }
    }
    return {
      showLogo: true,
      size: 'medium',
      customLogoUrl: null,
      position: 'top-right',
      variant: 'main',
    };
  });

  // Buffer state
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferedSeconds, setBufferedSeconds] = useState(0);
  const [maxBufferSeconds, setMaxBufferSeconds] = useState<BufferDuration>(300); // 5 minutes default
  const [resolution, setResolution] = useState<ResolutionOption>(() => {
    return (localStorage.getItem('clutchclip_res') as ResolutionOption) || '1080p';
  });
  const [fps, setFps] = useState<FpsOption>(() => {
    const stored = Number(localStorage.getItem('clutchclip_fps'));
    return (stored === 30 || stored === 60 || stored === 90 || stored === 120) ? stored : 60;
  });
  const [sourceType, setSourceType] = useState<'screen_capture'>('screen_capture');
  const [audioMode, setAudioMode] = useState<AudioRecordingMode>(() => {
    const stored = localStorage.getItem('clutchclip_audio_mode') as AudioRecordingMode | null;
    if (stored === 'game_only' || stored === 'mic_only' || stored === 'game_and_mic') {
      return stored;
    }
    return 'game_only';
  });
  const micEnabled = audioMode === 'mic_only' || audioMode === 'game_and_mic';
  const [isSavingClip, setIsSavingClip] = useState(false);
  const [showFloatingWidget, setShowFloatingWidget] = useState(true);

  // Low Power Mode (reduces buffer capture frame rate & quality during low-battery states)
  const {
    config: lowPowerConfig,
    batteryStatus,
    isLowPowerActive,
    effectiveResolution,
    effectiveFps,
    normalBitrate,
    effectiveBitrate,
    powerSavingsPercent,
    setPolicy: setLowPowerPolicy,
    setThresholdPercent: setLowPowerThreshold,
    setTargetResolution: setLowPowerTargetRes,
    setDisableWhenCharging: setLowPowerDisableCharging,
    toggleSimulatedLowBattery,
  } = useLowPowerMode(resolution, fps);
  const prevLowPowerRef = useRef<boolean>(isLowPowerActive);

  // Highlights library
  const [highlights, setHighlights] = useState<SavedHighlight[]>([]);
  const [selectedForPlay, setSelectedForPlay] = useState<SavedHighlight | null>(null);
  const [selectedForEdit, setSelectedForEdit] = useState<SavedHighlight | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show notification toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Apply subscription state from Firestore record
  const applyFirestoreSubscriptionRecord = useCallback((record: UserSubscriptionRecord) => {
    setSubscriptionRecord(record);
    const isValidPaid =
      (record.tier === 'pro_2k' || record.tier === 'ultra_4k') &&
      record.expiresAtMs > Date.now();

    if (isValidPaid) {
      setUserTier(record.tier);
      setTierExpiresAt(record.expiresAtMs);
      localStorage.setItem('clutchclip_membership_tier', record.tier);
      localStorage.setItem('clutchclip_pro_unlocked', 'true');
      localStorage.setItem('clutchclip_tier_expires_at', record.expiresAtMs.toString());
      if (record.orderId) {
        const syncedReceipt: PlayBillingReceipt = {
          orderId: record.orderId,
          packageName: ANDROID_PACKAGE_NAME,
          productId: record.productId,
          tier: record.tier as Exclude<MembershipTier, 'free'>,
          purchaseTime: Date.now(),
          expiresAt: record.expiresAtMs,
          purchaseToken: `cloud_${record.uid}`,
          paymentMethod: record.paymentMethod || 'Google Play Billing',
          amountPaid: record.amountPaid,
          acknowledged: true,
          autoRenewing: true,
        };
        setPlayReceipt(syncedReceipt);
      }
    } else {
      setUserTier('free');
      setTierExpiresAt(null);
      setPlayReceipt(null);
      localStorage.setItem('clutchclip_membership_tier', 'free');
      localStorage.removeItem('clutchclip_pro_unlocked');
      localStorage.removeItem('clutchclip_tier_expires_at');
    }
  }, []);

  const [isGoogleSignInModalOpen, setIsGoogleSignInModalOpen] = useState<boolean>(false);

  // Listen to Firebase Auth state & sync the signed-in user's Firestore subscription record
  useEffect(() => {
    let unsubFirestore: (() => void) | null = null;
    const unsubModal = registerGoogleSignInModalListener((open) => {
      setIsGoogleSignInModalOpen(open);
    });

    // Complete any pending APK / mobile redirect or URL token sign-in
    checkRedirectSignInResult()
      .then((res) => {
        if (res) {
          setCurrentUser(res.user);
          applyFirestoreSubscriptionRecord(res.subscription);
          showToast(`✅ Signed in with Google as ${res.user.email}`);
        }
      })
      .catch((err) => console.warn('Redirect sign-in check error:', err));

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubFirestore) {
        unsubFirestore();
        unsubFirestore = null;
      }
      setCurrentUser(user);
      if (!user) {
        setSubscriptionRecord(null);
        const savedReceipt = googlePlayBilling.getSavedReceipt();
        if (savedReceipt && localStorage.getItem('clutchclip_owner_explicit_free') !== 'true') {
          setUserTier(savedReceipt.tier);
          setTierExpiresAt(savedReceipt.expiresAt);
          setPlayReceipt(savedReceipt);
        } else {
          setUserTier('free');
          setTierExpiresAt(null);
          setPlayReceipt(null);
        }
        setIsAuthLoading(false);
        return;
      }

      try {
        const { subscription } = await ensureUserSubscriptionRecord(user);
        applyFirestoreSubscriptionRecord(subscription);
        unsubFirestore = subscribeToUserSubscription(user, (updated) => {
          if (updated) {
            applyFirestoreSubscriptionRecord(updated);
          }
        });
      } catch (err) {
        console.warn('Firestore subscription sync deferred (using local profile cache):', err);
        applyFirestoreSubscriptionRecord(buildDefaultUserSubscription(user));
      } finally {
        setIsAuthLoading(false);
      }
    });

    return () => {
      unsubAuth();
      unsubModal();
      if (unsubFirestore) unsubFirestore();
    };
  }, [applyFirestoreSubscriptionRecord, showToast]);

  // Sign in with Google handler (used by Settings Profile & Activate Plan flow)
  const handleSignInWithGoogle = async (): Promise<User | null> => {
    try {
      const { user, subscription } = await signInWithGoogleAccount();
      setCurrentUser(user);
      applyFirestoreSubscriptionRecord(subscription);
      if (subscription.tier !== 'free' && subscription.expiresAtMs > Date.now()) {
        showToast(
          `✅ Signed in as ${user.email} · Pro User (${subscription.tier === 'ultra_4k' ? 'Premium Plus · 4K + 120 FPS' : 'Premium · 2K + 90 FPS'}) active!`
        );
      } else {
        showToast(`✅ Signed in with Google as ${user.email}`);
      }
      return user;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In cancelled';
      if (msg === 'REDIRECT_INITIATED' || msg === 'NATIVE_SIGNIN_INITIATED') {
        showToast('Signing in with Google...');
        return null;
      }
      if (!msg.includes('popup-closed-by-user') && !msg.includes('cancelled-popup-request')) {
        showToast(`Google Sign-In: ${msg}`);
      }
      return null;
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOutGoogleAccount();
      setCurrentUser(null);
      setSubscriptionRecord(null);
      handleUnlockTier('free', null, null);
      showToast('Signed out of Google account');
    } catch {
      showToast('Could not sign out');
    }
  };

  // Manually re-verify subscription from Firestore for current user
  const handleSyncSubscription = async () => {
    if (!currentUser) return;
    try {
      const record = await fetchUserSubscriptionFromFirestore(currentUser);
      if (record) {
        applyFirestoreSubscriptionRecord(record);
        showToast(
          record.tier !== 'free'
            ? `👑 Verified ${record.tier === 'ultra_4k' ? 'Premium Plus' : 'Premium'} for ${currentUser.email}`
            : `Verified Free Account for ${currentUser.email}`
        );
      } else {
        showToast(`No paid subscription found for ${currentUser.email}`);
      }
    } catch {
      showToast('Could not verify subscription');
    }
  };

  // Unlock tier handler via Google Play Billing & save to signed-in user's Firestore document
  const handleUnlockTier = (
    tier: MembershipTier,
    receipt?: PlayBillingReceipt | null,
    signedInUser?: User | null
  ) => {
    const activeUser = signedInUser !== undefined ? signedInUser : currentUser;
    setUserTier(tier);
    localStorage.setItem('clutchclip_membership_tier', tier);
    if (tier === 'free') {
      localStorage.setItem('clutchclip_owner_explicit_free', 'true');
      setTierExpiresAt(null);
      setPlayReceipt(null);
      googlePlayBilling.clearReceipt();
      localStorage.removeItem('clutchclip_pro_unlocked');
      localStorage.removeItem('clutchclip_tier_expires_at');
      if (resolution === '1440p' || resolution === '4k') {
        setResolution('1080p');
        replayEngine.setResolution('1080p');
        localStorage.setItem('clutchclip_res', '1080p');
      }
      if (fps === 90 || fps === 120) {
        setFps(60);
        replayEngine.setFps(60);
        localStorage.setItem('clutchclip_fps', '60');
      }
      if (!logoConfig.showLogo) {
        const resetLogo = { ...logoConfig, showLogo: true };
        setLogoConfig(resetLogo);
        localStorage.setItem('clutchclip_logo_config', JSON.stringify(resetLogo));
      }
      if (activeUser) {
        saveUserSubscriptionToFirestore(activeUser, 'free', null)
          .then((rec) => setSubscriptionRecord(rec))
          .catch((e) => console.warn('Subscription update cached locally:', e));
      }
      showToast('Subscription cancelled · Switched to Free Plan');
    } else if (tier === 'pro_2k') {
      localStorage.removeItem('clutchclip_owner_explicit_free');
      const expires = receipt?.expiresAt || Date.now() + ONE_MONTH_MS;
      setTierExpiresAt(expires);
      if (receipt) setPlayReceipt(receipt);
      localStorage.setItem('clutchclip_pro_unlocked', 'true');
      localStorage.setItem('clutchclip_tier_expires_at', expires.toString());
      setResolution('1440p');
      replayEngine.setResolution('1440p');
      localStorage.setItem('clutchclip_res', '1440p');
      setFps(90);
      replayEngine.setFps(90);
      localStorage.setItem('clutchclip_fps', '90');
      if (activeUser) {
        saveUserSubscriptionToFirestore(activeUser, 'pro_2k', receipt)
          .then((rec) => setSubscriptionRecord(rec))
          .catch((e) => console.warn('Subscription update cached locally:', e));
      }
      showToast(
        `👑 Google Play Verified: Premium (2K + 90 FPS) linked to ${activeUser?.email || 'your account'}!`
      );
    } else if (tier === 'ultra_4k') {
      localStorage.removeItem('clutchclip_owner_explicit_free');
      const expires = receipt?.expiresAt || Date.now() + ONE_MONTH_MS;
      setTierExpiresAt(expires);
      if (receipt) setPlayReceipt(receipt);
      localStorage.setItem('clutchclip_pro_unlocked', 'true');
      localStorage.setItem('clutchclip_tier_expires_at', expires.toString());
      setResolution('4k');
      replayEngine.setResolution('4k');
      localStorage.setItem('clutchclip_res', '4k');
      setFps(120);
      replayEngine.setFps(120);
      localStorage.setItem('clutchclip_fps', '120');
      if (activeUser) {
        saveUserSubscriptionToFirestore(activeUser, 'ultra_4k', receipt)
          .then((rec) => setSubscriptionRecord(rec))
          .catch((e) => console.warn('Subscription update cached locally:', e));
      }
      showToast(
        `👑 Google Play Verified: Premium Plus (4K + 120 FPS) linked to ${activeUser?.email || 'your account'}!`
      );
    }
  };

  const openPremiumModal = (feature?: string) => {
    setPremiumTargetFeature(feature);
    setIsPremiumModalOpen(true);
  };

  // Set resolution with persistence & engine update
  const handleSetResolution = (res: ResolutionOption) => {
    if (res === '1440p' && userTier === 'free') {
      openPremiumModal('2K (1440p) Resolution (Premium · ₹29)');
      return;
    }
    if (res === '4k' && userTier !== 'ultra_4k') {
      openPremiumModal('4K Ultra-HD Resolution (Premium Plus · ₹99)');
      return;
    }
    setResolution(res);
    replayEngine.setResolution(res);
    localStorage.setItem('clutchclip_res', res);
    showToast(`Resolution set to ${res === '1440p' ? '2K' : res.toUpperCase()}`);
  };

  // Set FPS with persistence & engine update
  const handleSetFps = (newFps: FpsOption) => {
    if (newFps === 90 && userTier === 'free') {
      openPremiumModal('90 FPS High-Refresh Capture (Premium · ₹29)');
      return;
    }
    if (newFps === 120 && userTier !== 'ultra_4k') {
      openPremiumModal('120 FPS Ultra-Refresh Capture (Premium Plus · ₹99)');
      return;
    }
    setFps(newFps);
    replayEngine.setFps(newFps);
    localStorage.setItem('clutchclip_fps', newFps.toString());
    showToast(`Frame rate set to ${newFps} FPS`);
  };

  // Set Audio Recording Mode ('game_only' | 'mic_only' | 'game_and_mic')
  const handleSetAudioMode = (mode: AudioRecordingMode) => {
    setAudioMode(mode);
    replayEngine.setAudioMode(mode);
    localStorage.setItem('clutchclip_audio_mode', mode);
    showToast(`Audio Recording: ${AUDIO_MODE_OPTIONS[mode].label}`);
  };

  // Change Logo & Watermark settings (Hide Logo / Remove Watermark is available to subscribed users only)
  // When subscribed user uses Hide Logo, the logo stays visible on screen and is hidden in the recorded video
  const handleChangeLogoConfig = (newConfig: LogoConfig) => {
    if (!newConfig.showLogo && !isPremium) {
      openPremiumModal('Remove Watermark / Hide Logo (Subscribed Users Only)');
      return;
    }
    setLogoConfig(newConfig);
    replayEngine.setLogoConfig(newConfig, isPremium);
    localStorage.setItem('clutchclip_logo_config', JSON.stringify(newConfig));
    if (!newConfig.showLogo) {
      showToast('Logo stays on screen · Hidden in recorded video');
    } else {
      showToast('Logo visible on screen & in recorded video');
    }
  };

  // Sync engine settings, recorded video logo policy, and Low Power Mode throttling
  useEffect(() => {
    replayEngine.setResolution(resolution);
    replayEngine.setFps(fps);
    replayEngine.setAudioMode(audioMode);
    replayEngine.setLogoConfig(logoConfig, isPremium);
    replayEngine.setLowPowerThrottling(
      isLowPowerActive,
      lowPowerConfig.targetResolution,
      lowPowerConfig.targetFps,
      lowPowerConfig.bitrateScale
    );
    nativeAndroidBridge.syncNativeLowPowerMode(
      isLowPowerActive,
      effectiveResolution,
      effectiveFps,
      batteryStatus.levelPercent
    );

    if (prevLowPowerRef.current !== isLowPowerActive) {
      prevLowPowerRef.current = isLowPowerActive;
      if (isLowPowerActive) {
        showToast(
          `🔋 Low Power Mode Active (${batteryStatus.levelPercent}%) — Buffer throttled to ${effectiveResolution.toUpperCase()} @ ${effectiveFps} FPS`
        );
      } else {
        showToast(
          `⚡ Full Capture Restored (${resolution === '1440p' ? '2K' : resolution.toUpperCase()} @ ${fps} FPS)`
        );
      }
    }
  }, [
    resolution,
    fps,
    isLowPowerActive,
    lowPowerConfig.targetResolution,
    lowPowerConfig.targetFps,
    lowPowerConfig.bitrateScale,
    effectiveResolution,
    effectiveFps,
    batteryStatus.levelPercent,
    audioMode,
    logoConfig,
    isPremium,
    showToast,
  ]);

  // Load existing highlights on mount
  useEffect(() => {
    const loadHighlights = async () => {
      try {
        const stored = await indexedDbStorage.getAllHighlights();
        setHighlights(stored);
      } catch (err) {
        console.error('Failed to load saved highlights:', err);
      }
    };
    loadHighlights();

    // Listen to replay engine updates
    const unbindBuffer = replayEngine.onBufferUpdate((secs) => {
      setBufferedSeconds(secs);
    });

    const unbindSaved = replayEngine.onHighlightSaved((savedClip) => {
      setHighlights((prev) => [savedClip, ...prev]);
      setIsSavingClip(false);
      showToast(`⚡ Captured ${savedClip.durationSeconds}s Highlight!`);
    });

    const unbindState = replayEngine.onStateChange((buffering) => {
      setIsBuffering(buffering);
    });

    const unbindGame = replayEngine.onGameDetected((detection) => {
      if (detection.detected && detection.gameName) {
        setCurrentGameName(detection.gameName);
        showToast(`🎮 Auto-detected: ${detection.gameName}`);
      }
    });

    return () => {
      unbindBuffer();
      unbindSaved();
      unbindState();
      unbindGame();
    };
  }, [showToast]);

  // Toggle Replay Buffer on / off for Screen / Game capture
  const handleToggleBuffer = async () => {
    if (isBuffering) {
      replayEngine.stopBuffer();
      setIsBuffering(false);
      showToast('Replay buffer stopped');
      return;
    }

    try {
      replayEngine.setResolution(resolution);
      replayEngine.setFps(fps);
      replayEngine.setLowPowerThrottling(
        isLowPowerActive,
        lowPowerConfig.targetResolution,
        lowPowerConfig.targetFps,
        lowPowerConfig.bitrateScale
      );
      await replayEngine.startBuffer('screen_capture', null, audioMode);
      setIsBuffering(true);
      showToast(
        isLowPowerActive
          ? `🔋 Low Power Buffer recording ${currentGameName} (${effectiveResolution.toUpperCase()} @ ${effectiveFps} FPS)!`
          : `⚡ 5-Minute Replay Buffer is recording ${currentGameName}!`
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Could not activate buffer';
      showToast(`Screen capture: ${errorMsg}`);
    }
  };

  // Trigger retroactive highlight clip
  const handleClip = async (durationSecs: number) => {
    if (isSavingClip) return;
    setIsSavingClip(true);
    showToast(`Packaging last ${durationSecs >= 60 ? Math.floor(durationSecs / 60) + ' min' : durationSecs + 's'} highlight...`);

    try {
      const clip = await replayEngine.clipHighlight(durationSecs, undefined, currentGameName);
      if (!clip) {
        setIsSavingClip(false);
        showToast('Buffer was empty. Keep playing for a few seconds to fill buffer!');
      }
    } catch (err) {
      setIsSavingClip(false);
      console.error('Failed to clip:', err);
      showToast('Failed to save highlight');
    }
  };

  // Drop highlight pin marker
  const handleAddMarker = (label: string) => {
    if (!isBuffering) {
      showToast('Start buffer first to drop highlight pins');
      return;
    }
    replayEngine.addMarker(label);
    showToast(`📍 Highlight pin dropped at ${bufferedSeconds}s!`);
  };

  // Delete highlight
  const handleDeleteHighlight = async (id: string) => {
    try {
      await indexedDbStorage.deleteHighlight(id);
      setHighlights((prev) => prev.filter((h) => h.id !== id));
      showToast('Highlight deleted');
    } catch {
      showToast('Could not delete clip');
    }
  };

  // Rename highlight
  const handleRenameHighlight = async (id: string, newTitle: string) => {
    try {
      await indexedDbStorage.updateHighlightTitle(id, newTitle);
      setHighlights((prev) =>
        prev.map((h) => (h.id === id ? { ...h, title: newTitle } : h))
      );
      showToast('Title updated');
    } catch {
      showToast('Could not rename clip');
    }
  };

  // Save trimmed highlight from editor
  const handleSaveTrimmed = async (newClip: Omit<SavedHighlight, 'videoUrl'>) => {
    const saved = await indexedDbStorage.saveHighlight(newClip);
    setHighlights((prev) => [saved, ...prev]);
    showToast(`Saved trimmed highlight: ${saved.title}`);
  };

  // Clear all highlights
  const handleClearAllHighlights = async () => {
    for (const h of highlights) {
      await indexedDbStorage.deleteHighlight(h.id);
    }
    setHighlights([]);
    showToast('All saved highlights cleared from IndexedDB');
  };

  return (
    <MobileDeviceSimulator
      onOpenPremium={() => setActiveTab('premium')}
      userTier={userTier}
      daysRemaining={daysRemaining}
      isBuffering={isBuffering}
      onQuickClip5m={() => handleClip(300)}
      batteryLevel={batteryStatus.levelPercent}
      isCharging={batteryStatus.isCharging}
      isLowPowerActive={isLowPowerActive}
    >
      {/* Top App Header */}
      <header className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-white/[0.06] bg-[#090b10]/90 backdrop-blur-md sticky top-0 z-20 shrink-0">
        {/* Main App Logo & Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <AppLogo size={28} variant="main" customLogoUrl={logoConfig.customLogoUrl} />
          <span className="text-base font-semibold font-display tracking-tight text-white whitespace-nowrap">
            Clutch<span className="text-rose-500">Clip</span>
          </span>
        </div>

        {/* Right: Primary Quick Clip Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleClip(maxBufferSeconds)}
            disabled={!isBuffering || bufferedSeconds < 1 || isSavingClip}
            className="py-1.5 px-3.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-35 disabled:cursor-not-allowed text-white text-xs font-semibold font-display transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Save Last 5 Minutes"
          >
            Clip 5m
          </button>
        </div>
      </header>

      {!isOnline && (
        <div className="mx-5 mt-3 px-3.5 py-2 rounded-xl bg-[#11151e] border border-white/[0.06] text-slate-300 text-xs flex items-center gap-2">
          <span>Offline mode · Local replay buffer and saved clips remain active.</span>
        </div>
      )}

      {/* Floating Replay Widget Overlay */}
      {showFloatingWidget && (
        <FloatingReplayWidget
          isBuffering={isBuffering}
          bufferedSeconds={bufferedSeconds}
          maxBufferSeconds={maxBufferSeconds}
          onClip={handleClip}
          onAddMarker={handleAddMarker}
          isSaving={isSavingClip}
          customLogoUrl={logoConfig.customLogoUrl}
        />
      )}

      {/* Main Tab Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 pb-24 overflow-y-auto">
        {/* Toast Banner */}
        {toastMessage && (
          <div className="fixed top-16 left-4 right-4 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-3 duration-150">
            <div className="py-2 px-4 rounded-xl bg-[#11151e]/95 border border-white/[0.1] text-white font-medium text-xs shadow-2xl backdrop-blur-md">
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Tab 1: Live Game Screen & 5-Min Replay Buffer */}
        {activeTab === 'screen' && (
          <LiveScreenMonitor
            isBuffering={isBuffering}
            bufferedSeconds={bufferedSeconds}
            maxBufferSeconds={maxBufferSeconds}
            onToggleBuffer={handleToggleBuffer}
            onClip={handleClip}
            onAddMarker={handleAddMarker}
            isSaving={isSavingClip}
            resolution={resolution}
            fps={fps}
            onSetResolution={handleSetResolution}
            onSetFps={handleSetFps}
            userTier={userTier}
            logoConfig={logoConfig}
            onChangeLogoConfig={handleChangeLogoConfig}
            isPremium={isPremium}
            micEnabled={micEnabled}
            onToggleMic={() =>
              handleSetAudioMode(audioMode === 'game_only' ? 'game_and_mic' : 'game_only')
            }
            audioMode={audioMode}
            onSetAudioMode={handleSetAudioMode}
            currentGameName={currentGameName}
            onChangeGameName={setCurrentGameName}
            onRequirePremium={openPremiumModal}
            isLowPowerActive={isLowPowerActive}
            effectiveResolution={effectiveResolution}
            effectiveFps={effectiveFps}
            powerSavingsPercent={powerSavingsPercent}
            batteryLevel={batteryStatus.levelPercent}
            lowPowerPolicy={lowPowerConfig.policy}
            onSetLowPowerPolicy={setLowPowerPolicy}
            onToggleSimulateLowBattery={toggleSimulatedLowBattery}
            isSimulatedLowBattery={batteryStatus.isSimulatedLow}
          />
        )}

        {/* Tab 2: Replay Buffer Controls & Gauge */}
        {activeTab === 'buffer' && (
          <div className="w-full max-w-3xl mx-auto space-y-5">
            <LiveBufferPanel
              isBuffering={isBuffering}
              bufferedSeconds={bufferedSeconds}
              maxBufferSeconds={maxBufferSeconds}
              onToggleBuffer={handleToggleBuffer}
              onClip={handleClip}
              onSetMaxBuffer={(secs) => {
                setMaxBufferSeconds(secs);
                replayEngine.setMaxBufferSeconds(secs);
              }}
              resolution={resolution}
              fps={fps}
              onSetResolution={handleSetResolution}
              onSetFps={handleSetFps}
              isPremium={isPremium}
              userTier={userTier}
              onOpenPremium={openPremiumModal}
              isSaving={isSavingClip}
              sourceType={sourceType}
              onSetSourceType={setSourceType}
              micEnabled={micEnabled}
              onToggleMic={() =>
                handleSetAudioMode(audioMode === 'game_only' ? 'game_and_mic' : 'game_only')
              }
              audioMode={audioMode}
              onSetAudioMode={handleSetAudioMode}
              onAddMarker={handleAddMarker}
              totalSavedCount={highlights.length}
              isLowPowerActive={isLowPowerActive}
              effectiveResolution={effectiveResolution}
              effectiveFps={effectiveFps}
              powerSavingsPercent={powerSavingsPercent}
              batteryLevel={batteryStatus.levelPercent}
              lowPowerPolicy={lowPowerConfig.policy}
              onSetLowPowerPolicy={setLowPowerPolicy}
            />

            {/* Inline Ad slot in the empty space between LiveBufferPanel and LowPowerModeCard */}
            <AdMobBannerBar
              isPremium={isPremium}
              onOpenPremium={() => setActiveTab('premium')}
              variant="native"
            />

            {/* Low Power Mode Configuration Card inside Buffer Tab */}
            <LowPowerModeCard
              config={lowPowerConfig}
              batteryStatus={batteryStatus}
              isLowPowerActive={isLowPowerActive}
              userResolution={resolution}
              userFps={fps}
              effectiveResolution={effectiveResolution}
              effectiveFps={effectiveFps}
              normalBitrate={normalBitrate}
              effectiveBitrate={effectiveBitrate}
              powerSavingsPercent={powerSavingsPercent}
              onSetPolicy={setLowPowerPolicy}
              onSetThreshold={setLowPowerThreshold}
              onSetTargetResolution={setLowPowerTargetRes}
              onSetDisableWhenCharging={setLowPowerDisableCharging}
              onToggleSimulateLowBattery={toggleSimulatedLowBattery}
            />
          </div>
        )}

        {/* Center Tab: Get Premium Comparison & Subscription Payment */}
        {activeTab === 'premium' && (
          <PremiumComparisonView
            currentTier={userTier}
            tierExpiresAt={tierExpiresAt}
            playReceipt={playReceipt}
            currentUser={currentUser}
            onRequireGoogleSignIn={handleSignInWithGoogle}
            onUnlockTier={handleUnlockTier}
          />
        )}

        {/* Tab 3: Highlights Vault & Library */}
        {activeTab === 'vault' && (
          <div className="w-full max-w-3xl mx-auto space-y-5">
            <HighlightVault
              highlights={highlights}
              onDeleteHighlight={handleDeleteHighlight}
              onRenameHighlight={handleRenameHighlight}
              onOpenEditor={(h) => {
                setSelectedForEdit(h);
              }}
              onSelectPlay={(h) => {
                setSelectedForPlay(h);
              }}
            />

            {/* Inline Ad slot in the empty space below Highlight Vault */}
            <AdMobBannerBar
              isPremium={isPremium}
              onOpenPremium={() => setActiveTab('premium')}
              variant="native"
            />
          </div>
        )}

        {/* Tab 4: Settings & Profile */}
        {activeTab === 'settings' && (
          <div className="space-y-5 w-full max-w-3xl mx-auto">
            <div>
              <h2 className="text-lg font-semibold font-display text-white">Settings</h2>
              <p className="text-xs text-slate-400">Account, video quality, audio, and storage preferences</p>
            </div>

            {/* Google Sign-In & User Profile Card */}
            <UserProfileSettingsCard
              currentUser={currentUser}
              subscriptionRecord={subscriptionRecord}
              userTier={userTier}
              daysRemaining={daysRemaining}
              isAuthLoading={isAuthLoading}
              onSignInWithGoogle={async () => {
                await handleSignInWithGoogle();
              }}
              onSignOut={handleSignOut}
              onSyncSubscription={handleSyncSubscription}
              onOpenPremium={() => setActiveTab('premium')}
              onCancelSubscription={() => handleUnlockTier('free', null, currentUser)}
            />

            {/* Inline Ad slot in the empty space between Profile Card and Video Quality Card */}
            <AdMobBannerBar
              isPremium={isPremium}
              onOpenPremium={() => setActiveTab('premium')}
              variant="compact"
            />

            {/* Video Quality & Audio Settings Card */}
            <div className="rounded-2xl bg-[#11151e] border border-white/[0.06] divide-y divide-white/[0.05]">
              {/* Resolution Selection */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Video Resolution</div>
                    <div className="text-xs text-slate-400 mt-0.5">Free up to 1080p · 2K &amp; 4K with Premium</div>
                  </div>
                  <span className="text-xs font-mono-numbers text-slate-400">
                    {resolution === '1440p' ? '2K QHD' : resolution.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1 p-1 bg-[#090b10] rounded-xl border border-white/[0.05]">
                  {[
                    { id: '480p' as ResolutionOption, label: '480p', tierReq: 'free' },
                    { id: '720p' as ResolutionOption, label: '720p', tierReq: 'free' },
                    { id: '1080p' as ResolutionOption, label: '1080p', tierReq: 'free' },
                    { id: '1440p' as ResolutionOption, label: '2K', tierReq: 'pro_2k' },
                    { id: '4k' as ResolutionOption, label: '4K', tierReq: 'ultra_4k' },
                  ].map((item) => {
                    const isLocked =
                      (item.tierReq === 'pro_2k' && userTier === 'free') ||
                      (item.tierReq === 'ultra_4k' && userTier !== 'ultra_4k');
                    const isSelected = resolution === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (isLocked) {
                            openPremiumModal(
                              item.tierReq === 'pro_2k'
                                ? '2K (1440p) Resolution (Premium · ₹29)'
                                : '4K Ultra-HD Resolution (Premium Plus · ₹99)'
                            );
                          } else {
                            handleSetResolution(item.id);
                          }
                        }}
                        className={`py-2 px-1 rounded-lg text-xs font-mono-numbers flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600 text-white font-semibold'
                            : isLocked
                            ? 'text-slate-500 hover:text-slate-300'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isLocked && <Lock className="w-2.5 h-2.5 text-slate-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Frame Rate Selection */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Frame Rate</div>
                    <div className="text-xs text-slate-400 mt-0.5">Free up to 60 FPS · 90 &amp; 120 FPS with Premium</div>
                  </div>
                  <span className="text-xs font-mono-numbers text-slate-400">{fps} FPS</span>
                </div>

                <div className="grid grid-cols-4 gap-1 p-1 bg-[#090b10] rounded-xl border border-white/[0.05]">
                  {[
                    { id: 30 as FpsOption, label: '30 FPS', tierReq: 'free' },
                    { id: 60 as FpsOption, label: '60 FPS', tierReq: 'free' },
                    { id: 90 as FpsOption, label: '90 FPS', tierReq: 'pro_2k' },
                    { id: 120 as FpsOption, label: '120 FPS', tierReq: 'ultra_4k' },
                  ].map((item) => {
                    const isLocked =
                      (item.tierReq === 'pro_2k' && userTier === 'free') ||
                      (item.tierReq === 'ultra_4k' && userTier !== 'ultra_4k');
                    const isSelected = fps === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (isLocked) {
                            openPremiumModal(
                              item.tierReq === 'pro_2k'
                                ? '90 FPS Capture (Premium · ₹29)'
                                : '120 FPS Capture (Premium Plus · ₹99)'
                            );
                          } else {
                            handleSetFps(item.id);
                          }
                        }}
                        className={`py-2 px-1 rounded-lg text-xs font-mono-numbers flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600 text-white font-semibold'
                            : isLocked
                            ? 'text-slate-500 hover:text-slate-300'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isLocked && <Lock className="w-2.5 h-2.5 text-slate-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audio Mode */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Audio Mode</div>
                    <div className="text-xs text-slate-400 mt-0.5">{AUDIO_MODE_OPTIONS[audioMode].description}</div>
                  </div>
                  <span className="text-xs font-mono-numbers text-slate-400">
                    {AUDIO_MODE_OPTIONS[audioMode].shortLabel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 p-1 bg-[#090b10] rounded-xl border border-white/[0.05]">
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
                        onClick={() => handleSetAudioMode(item.id)}
                        className={`py-2 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
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
            </div>

            {/* Low Power Mode */}
            <LowPowerModeCard
              config={lowPowerConfig}
              batteryStatus={batteryStatus}
              isLowPowerActive={isLowPowerActive}
              userResolution={resolution}
              userFps={fps}
              effectiveResolution={effectiveResolution}
              effectiveFps={effectiveFps}
              normalBitrate={normalBitrate}
              effectiveBitrate={effectiveBitrate}
              powerSavingsPercent={powerSavingsPercent}
              onSetPolicy={setLowPowerPolicy}
              onSetThreshold={setLowPowerThreshold}
              onSetTargetResolution={setLowPowerTargetRes}
              onSetDisableWhenCharging={setLowPowerDisableCharging}
              onToggleSimulateLowBattery={toggleSimulatedLowBattery}
            />

            {/* Logo & Watermark Settings */}
            <LogoSettingsCard
              logoConfig={logoConfig}
              onChangeLogoConfig={handleChangeLogoConfig}
              isPremium={isPremium}
              onRequirePremium={openPremiumModal}
            />

            {/* Floating Quick-Clip Bubble Toggle */}
            <div className="p-5 rounded-2xl bg-[#11151e] border border-white/[0.06] flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white">Floating Quick-Clip Button</div>
                <div className="text-xs text-slate-400 mt-0.5">Show a draggable quick-save button on screen</div>
              </div>
              <input
                type="checkbox"
                checked={showFloatingWidget}
                onChange={(e) => setShowFloatingWidget(e.target.checked)}
                className="w-4 h-4 accent-rose-600 cursor-pointer rounded shrink-0"
              />
            </div>

            {/* Storage Usage Card */}
            <StorageUsageCard
              highlights={highlights}
              resolution={resolution}
              fps={fps}
              onClearAllHighlights={handleClearAllHighlights}
            />

            {/* Inline Ad slot in the empty space between Storage Card and Legal Footer */}
            <AdMobBannerBar
              isPremium={isPremium}
              onOpenPremium={() => setActiveTab('premium')}
              variant="native"
            />

            {/* Privacy Policy, Terms & Conditions, and Created by Aditya Attribution */}
            <LegalSettingsFooter />
          </div>
        )}

        {/* Video Player Modal */}
        {selectedForPlay && (
          <VideoPlayerModal
            highlight={selectedForPlay}
            onClose={() => setSelectedForPlay(null)}
            onOpenEditor={(h) => {
              setSelectedForPlay(null);
              setSelectedForEdit(h);
            }}
          />
        )}

        {/* Video Editor Modal */}
        {selectedForEdit && (
          <div className="fixed inset-0 z-50 bg-[#080a0f]/95 backdrop-blur-md p-4 overflow-y-auto">
            <HighlightEditor
              highlight={selectedForEdit}
              onBack={() => setSelectedForEdit(null)}
              onSaveTrimmed={handleSaveTrimmed}
              isPremium={isPremium}
              logoConfig={logoConfig}
              onRequirePremium={openPremiumModal}
            />
          </div>
        )}

        {/* Premium Upgrade Modal */}
        <PremiumModal
          isOpen={isPremiumModalOpen}
          onClose={() => setIsPremiumModalOpen(false)}
          onUnlockTier={handleUnlockTier}
          currentTier={userTier}
          tierExpiresAt={tierExpiresAt}
          targetFeature={premiumTargetFeature}
          currentUser={currentUser}
          onRequireGoogleSignIn={handleSignInWithGoogle}
        />

        {/* In-App Google Account Sign-In Modal (for APK WebView & popup-restricted environments) */}
        <GoogleSignInModal
          isOpen={isGoogleSignInModalOpen}
          onSelectAccount={async (profile) => {
            await completeModalGoogleSignIn(profile);
          }}
          onCancel={() => {
            cancelModalGoogleSignIn();
          }}
        />

        {/* One-Time First-Launch App Introduction & Play Console Prominent Disclosure Page */}
        {!showSplash && showFirstLaunchIntro && (
          <FirstLaunchIntroModal onComplete={() => setShowFirstLaunchIntro(false)} />
        )}

        {/* Animated Startup Splash Screen */}
        {showSplash && (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090b10]/95 backdrop-blur-md border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto grid grid-cols-5 items-center h-16 pb-safe px-2">
          <button
            onClick={() => setActiveTab('screen')}
            className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'screen' ? 'text-white font-semibold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Monitor className={`w-5 h-5 ${activeTab === 'screen' ? 'text-rose-500' : ''}`} />
            <span className="text-[11px] mt-1">Screen</span>
          </button>

          <button
            onClick={() => setActiveTab('buffer')}
            className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'buffer' ? 'text-white font-semibold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Radio className={`w-5 h-5 ${activeTab === 'buffer' ? 'text-rose-500' : ''}`} />
            <span className="text-[11px] mt-1">Buffer</span>
          </button>

          <button
            onClick={() => setActiveTab('premium')}
            className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'premium' ? 'text-white font-semibold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Crown className={`w-5 h-5 ${activeTab === 'premium' ? 'text-rose-500' : ''}`} />
            <span className="text-[11px] mt-1">Plans</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`relative flex flex-col items-center justify-center h-full transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'vault' ? 'text-white font-semibold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="relative">
              <Film className={`w-5 h-5 ${activeTab === 'vault' ? 'text-rose-500' : ''}`} />
              {highlights.length > 0 && (
                <span className="absolute -top-1.5 -right-3 text-[10px] font-mono-numbers font-semibold text-rose-400">
                  {highlights.length}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-1">Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'settings' ? 'text-white font-semibold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-rose-500' : ''}`} />
            <span className="text-[11px] mt-1">Settings</span>
          </button>
        </div>
      </nav>
    </MobileDeviceSimulator>
  );
}

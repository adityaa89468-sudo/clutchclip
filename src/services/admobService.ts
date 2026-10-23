import { nativeAndroidBridge } from './nativeAndroidBridge';
import { MembershipTier } from '../types/recorder';

// Google AdMob Production Credentials for ClutchClip (com.adityaclutchclip994.app)
export const ADMOB_CONFIG = {
  APP_ID: 'ca-app-pub-9364231981895017~4610236291',
  PUBLISHER_ID: 'ca-pub-9364231981895017',
  BANNER_AD_UNIT_ID: 'ca-app-pub-9364231981895017/9806722652',
  BANNER_SLOT_ID: '9806722652',
  APP_OPEN_AD_UNIT_ID: 'ca-app-pub-9364231981895017/9335774357',
  APP_OPEN_SLOT_ID: '9335774357',
} as const;

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

class AdMobService {
  private hasShownInitialAppOpenAd = false;

  /**
   * Returns true if Google Ads should be shown (Free Tier only).
   * Premium subscribers (pro_2k ₹29 and ultra_4k ₹99) get 100% Ad-Free experience.
   */
  public shouldShowAds(tier: MembershipTier): boolean {
    return tier === 'free';
  }

  /**
   * Synchronizes the user's membership tier with the native Android AdMob controller
   * so native Banner and App Open ads are immediately destroyed when upgrading to Pro.
   */
  public syncMembershipTier(tier: MembershipTier): void {
    const isPremium = tier !== 'free';
    nativeAndroidBridge.syncNativeAdFreeStatus(isPremium);
  }

  /**
   * Triggers the Google AdMob App Open Ad (ca-app-pub-9364231981895017/9335774357) for Free users on launch.
   * - Inside the Native Android APK: invokes the real Google Mobile Ads SDK AppOpenAd in MainActivity.java.
   * - Inside Web Browser Preview: returns true to render the Google Ads App Open slot.
   */
  public requestAppOpenAdOnLaunch(tier: MembershipTier): boolean {
    if (!this.shouldShowAds(tier)) {
      return false;
    }
    if (this.hasShownInitialAppOpenAd) {
      return false;
    }
    this.hasShownInitialAppOpenAd = true;

    if (nativeAndroidBridge.isRunningInNativeApk()) {
      nativeAndroidBridge.triggerNativeAppOpenAd();
      // Native Google Mobile Ads SDK handles the AppOpenAd Activity overlay directly
      return false;
    }

    return true;
  }

  /**
   * Requests Google AdSense / Publisher Tag to fill an <ins class="adsbygoogle"> slot.
   */
  public pushGoogleAdSlot(): void {
    if (typeof window === 'undefined') return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Slot already filled or blocked by browser extension
    }
  }
}

export const admobService = new AdMobService();

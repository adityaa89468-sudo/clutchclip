package com.adityaclutchclip994.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.appopen.AppOpenAd;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {

    // Google AdMob Production IDs for com.adityaclutchclip994.app
    public static final String ADMOB_APP_ID = "ca-app-pub-9364231981895017~4610236291";
    public static final String ADMOB_BANNER_AD_UNIT_ID = "ca-app-pub-9364231981895017/9806722652";
    public static final String ADMOB_APP_OPEN_AD_UNIT_ID = "ca-app-pub-9364231981895017/9335774357";

    // Firebase Web OAuth Client ID for notes-translator-bfed5
    public static final String WEB_OAUTH_CLIENT_ID = "879646985701-l0u52sneqhv9tpfm2q5cv1akis6l8a0l.apps.googleusercontent.com";
    private static final int RC_GOOGLE_SIGN_IN = 9001;

    private static final String PREFS_NAME = "ClutchClipAdPrefs";
    private static final String KEY_IS_PREMIUM_AD_FREE = "is_premium_ad_free";

    private AdView bannerAdView;
    private AppOpenAd appOpenAd;
    private boolean isShowingAppOpenAd = false;
    private GoogleSignInClient googleSignInClient;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Configure Native Google Sign-In Client for Firebase Auth
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(WEB_OAUTH_CLIENT_ID)
                .requestEmail()
                .requestProfile()
                .build();
        googleSignInClient = GoogleSignIn.getClient(this, gso);

        WebView webView = getBridge().getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setJavaScriptCanOpenWindowsAutomatically(true);
            settings.setSupportMultipleWindows(false);

            // Enable First-Party and Third-Party Cookies so Firebase Auth sessions persist
            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            cookieManager.setAcceptThirdPartyCookies(webView, true);

            // Clean WebView User-Agent so Google OAuth never blocks with 403 disallowed_useragent
            String originalUA = settings.getUserAgentString();
            if (originalUA != null) {
                String cleanUA = originalUA
                        .replace("; wv", "")
                        .replace("Version/4.0 ", "");
                settings.setUserAgentString(cleanUA);
            }

            // Attach Native Bridge for ClutchClip
            NativeBridge bridge = new NativeBridge(this);
            webView.addJavascriptInterface(bridge, "ClutchClipAndroid");
        }

        // Initialize Google Mobile Ads SDK (Ads shown ONLY for Free Tier users; removed for Premium)
        MobileAds.initialize(this, initializationStatus -> {
            if (!isPremiumAdFree()) {
                setupBannerAdForFreeUser();
                loadAndShowAppOpenAdForFreeUser();
            }
        });
    }

    public void launchNativeGoogleSignIn() {
        runOnUiThread(() -> {
            try {
                Intent signInIntent = googleSignInClient.getSignInIntent();
                startActivityForResult(signInIntent, RC_GOOGLE_SIGN_IN);
            } catch (Exception e) {
                fallbackToWebGoogleAuth();
            }
        });
    }

    private void fallbackToWebGoogleAuth() {
        runOnUiThread(() -> {
            WebView webView = getBridge() != null ? getBridge().getWebView() : null;
            if (webView != null) {
                webView.evaluateJavascript(
                        "if (window.onNativeGoogleAuthFallbackToWeb) { window.onNativeGoogleAuthFallbackToWeb(); }",
                        null
                );
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == RC_GOOGLE_SIGN_IN) {
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            try {
                GoogleSignInAccount account = task.getResult(ApiException.class);
                String idToken = account != null ? account.getIdToken() : null;
                if (idToken != null && !idToken.isEmpty()) {
                    WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                    if (webView != null) {
                        String safeToken = idToken.replace("'", "\\'");
                        webView.evaluateJavascript(
                                "if (window.signInWithNativeGoogleToken) { window.signInWithNativeGoogleToken('" + safeToken + "'); }",
                                null
                        );
                    }
                } else {
                    fallbackToWebGoogleAuth();
                }
            } catch (ApiException e) {
                // If SHA-1 is not registered yet (e.g. code 10 DEVELOPER_ERROR), automatically fall back to WebView OAuth
                fallbackToWebGoogleAuth();
            }
        }
    }

    public boolean isPremiumAdFree() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getBoolean(KEY_IS_PREMIUM_AD_FREE, false);
    }

    public void updatePremiumAdFreeStatus(boolean isPremium) {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putBoolean(KEY_IS_PREMIUM_AD_FREE, isPremium).apply();

        runOnUiThread(() -> {
            if (isPremium) {
                // Immediately remove Banner Ad & clear App Open Ad for Premium users
                if (bannerAdView != null) {
                    bannerAdView.setVisibility(View.GONE);
                    ViewGroup parent = (ViewGroup) bannerAdView.getParent();
                    if (parent != null) {
                        parent.removeView(bannerAdView);
                    }
                    bannerAdView.destroy();
                    bannerAdView = null;
                }
                appOpenAd = null;
            } else {
                setupBannerAdForFreeUser();
            }
        });
    }

    private void setupBannerAdForFreeUser() {
        if (isPremiumAdFree() || bannerAdView != null) {
            return;
        }
        runOnUiThread(() -> {
            try {
                ViewGroup rootView = findViewById(android.R.id.content);
                if (rootView == null) return;

                bannerAdView = new AdView(this);
                bannerAdView.setAdUnitId(ADMOB_BANNER_AD_UNIT_ID);
                bannerAdView.setAdSize(AdSize.BANNER);

                FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.WRAP_CONTENT,
                        FrameLayout.LayoutParams.WRAP_CONTENT
                );
                params.gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
                // Position just above the bottom navigation bar
                float density = getResources().getDisplayMetrics().density;
                params.bottomMargin = (int) (64 * density);

                rootView.addView(bannerAdView, params);
                AdRequest adRequest = new AdRequest.Builder().build();
                bannerAdView.loadAd(adRequest);
            } catch (Exception ignored) {
            }
        });
    }

    private boolean isLoadingAppOpenAd = false;

    @Override
    protected void onRestart() {
        super.onRestart();
        if (!isPremiumAdFree()) {
            loadAndShowAppOpenAdForFreeUser();
        }
    }

    public void loadAndShowAppOpenAdForFreeUser() {
        if (isPremiumAdFree() || isShowingAppOpenAd || isLoadingAppOpenAd) {
            return;
        }
        runOnUiThread(() -> {
            if (appOpenAd != null && !isShowingAppOpenAd) {
                appOpenAd.show(MainActivity.this);
                return;
            }
            isLoadingAppOpenAd = true;
            AdRequest request = new AdRequest.Builder().build();
            AppOpenAd.load(
                    this,
                    ADMOB_APP_OPEN_AD_UNIT_ID,
                    request,
                    new AppOpenAd.AppOpenAdLoadCallback() {
                        @Override
                        public void onAdLoaded(@NonNull AppOpenAd ad) {
                            isLoadingAppOpenAd = false;
                            if (isPremiumAdFree()) {
                                return;
                            }
                            appOpenAd = ad;
                            appOpenAd.setFullScreenContentCallback(new FullScreenContentCallback() {
                                @Override
                                public void onAdDismissedFullScreenContent() {
                                    appOpenAd = null;
                                    isShowingAppOpenAd = false;
                                }

                                @Override
                                public void onAdShowedFullScreenContent() {
                                    isShowingAppOpenAd = true;
                                }
                            });
                            appOpenAd.show(MainActivity.this);
                        }

                        @Override
                        public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                            isLoadingAppOpenAd = false;
                            appOpenAd = null;
                        }
                    }
            );
        });
    }

    public static class NativeBridge {
        private final MainActivity activity;

        public NativeBridge(MainActivity activity) {
            this.activity = activity;
        }

        @JavascriptInterface
        public void signInWithGoogle() {
            activity.launchNativeGoogleSignIn();
        }

        @JavascriptInterface
        public void setPremiumAdFreeStatus(boolean isPremium) {
            activity.updatePremiumAdFreeStatus(isPremium);
        }

        @JavascriptInterface
        public void showAppOpenAdIfFree() {
            activity.loadAndShowAppOpenAdForFreeUser();
        }

        @JavascriptInterface
        public void startReplayBuffer(String resolution, int fps) {
            triggerHaptic(35);
        }

        @JavascriptInterface
        public void stopReplayBuffer() {
            triggerHaptic(20);
        }

        @JavascriptInterface
        public void saveRetroactiveClip(int durationSeconds, String gameName) {
            triggerHaptic(50);
        }

        @JavascriptInterface
        public boolean setFloatingOverlayEnabled(boolean enabled) {
            triggerHaptic(25);
            return true;
        }

        @JavascriptInterface
        public void setLowPowerMode(boolean active, String effectiveResolution, int effectiveFps) {
            SharedPreferences prefs = activity.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit()
                    .putBoolean("low_power_active", active)
                    .putString("effective_resolution", effectiveResolution)
                    .putInt("effective_fps", effectiveFps)
                    .apply();
        }

        @JavascriptInterface
        public String getBatteryStatusJson() {
            try {
                BatteryManager bm = (BatteryManager) activity.getSystemService(Context.BATTERY_SERVICE);
                int level = bm != null ? bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) : 80;
                boolean charging = bm != null && bm.isCharging();
                JSONObject json = new JSONObject();
                json.put("level", level > 0 ? level : 80);
                json.put("charging", charging);
                return json.toString();
            } catch (Exception e) {
                return "{\"level\":80,\"charging\":false}";
            }
        }

        @JavascriptInterface
        public void triggerHaptic(long durationMs) {
            Vibrator vibrator = (Vibrator) activity.getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    vibrator.vibrate(durationMs);
                }
            }
        }

        @JavascriptInterface
        public String getDeviceInfoJson() {
            try {
                JSONObject json = new JSONObject();
                json.put("packageName", activity.getPackageName());
                json.put("manufacturer", Build.MANUFACTURER);
                json.put("model", Build.MODEL);
                json.put("sdkInt", Build.VERSION.SDK_INT);
                json.put("release", Build.VERSION.RELEASE);
                json.put("isNativeApk", true);
                json.put("firebaseProjectId", "notes-translator-bfed5");
                json.put("admobAppId", ADMOB_APP_ID);
                return json.toString();
            } catch (Exception e) {
                return "{}";
            }
        }
    }
}

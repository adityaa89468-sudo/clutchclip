package com.adityaclutchclip994.app;

import android.Manifest;
import android.accounts.AccountManager;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.media.projection.MediaProjectionManager;
import android.net.Uri;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.Settings;
import android.util.Base64;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
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
import java.io.File;
import java.io.RandomAccessFile;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {

    // Google AdMob Production IDs for com.adityaclutchclip994.app
    public static final String ADMOB_APP_ID = "ca-app-pub-9364231981895017~4610236291";
    public static final String ADMOB_BANNER_AD_UNIT_ID = "ca-app-pub-9364231981895017/9806722652";
    public static final String ADMOB_APP_OPEN_AD_UNIT_ID = "ca-app-pub-9364231981895017/9335774357";

    // Firebase Web OAuth Client ID for notes-translator-bfed5
    public static final String WEB_OAUTH_CLIENT_ID = "879646985701-l0u52sneqhv9tpfm2q5cv1akis6l8a0l.apps.googleusercontent.com";

    private static final int RC_GOOGLE_SIGN_IN = 9001;
    private static final int RC_SCREEN_CAPTURE = 9002;
    private static final int RC_RECORD_PERMISSIONS = 9003;
    private static final int RC_ACCOUNT_PICKER = 9005;

    private static final String PREFS_NAME = "ClutchClipAdPrefs";
    private static final String KEY_IS_PREMIUM_AD_FREE = "is_premium_ad_free";

    private static MainActivity currentInstance;
    private static final List<String> pendingClipJsons = new ArrayList<>();

    private AdView bannerAdView;
    private AppOpenAd appOpenAd;
    private boolean isShowingAppOpenAd = false;
    private boolean isLoadingAppOpenAd = false;
    private GoogleSignInClient googleSignInClient;

    // Pending screen recording configuration while waiting for Android permission dialog
    private String pendingResolution = "1080p";
    private int pendingFps = 60;
    private String pendingAudioMode = "game_only";
    private boolean floatingOverlayEnabled = true;

    @Override
    protected void load() {
        // Attach NativeBridge BEFORE super.load() calls webView.loadUrl() so window.ClutchClipAndroid is bound on first boot
        WebView preWebView = findViewById(com.getcapacitor.android.R.id.webview);
        if (preWebView != null) {
            WebSettings settings = preWebView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);

            NativeBridge bridge = new NativeBridge(this);
            preWebView.addJavascriptInterface(bridge, "ClutchClipAndroid");
        }

        super.load();

        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
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
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        currentInstance = this;

        // Configure Native Google Sign-In Client for Firebase Auth
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(WEB_OAUTH_CLIENT_ID)
                .requestEmail()
                .requestProfile()
                .build();
        googleSignInClient = GoogleSignIn.getClient(this, gso);

        // Initialize Google Mobile Ads SDK (Ads are displayed inline in empty spaces between sections inside the app UI, never as floating overlays)
        MobileAds.initialize(this, initializationStatus -> {
            // Inline ad slots are rendered inside the app's empty spaces between cards
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        currentInstance = this;
        flushPendingSavedClipsToWebView();
    }

    @Override
    public void onDestroy() {
        if (currentInstance == this) {
            currentInstance = null;
        }
        super.onDestroy();
    }

    // Request Android MediaProjection Screen Capture Permission
    public void requestScreenCapture(String resolution, int fps, String audioMode) {
        this.pendingResolution = resolution != null ? resolution : "1080p";
        this.pendingFps = fps > 0 ? fps : 60;
        this.pendingAudioMode = audioMode != null ? audioMode : "game_only";

        runOnUiThread(() -> {
            List<String> neededPermissions = new ArrayList<>();
            boolean wantsMic = "mic_only".equals(pendingAudioMode) || "game_and_mic".equals(pendingAudioMode);
            if (wantsMic && ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                    != PackageManager.PERMISSION_GRANTED) {
                neededPermissions.add(Manifest.permission.RECORD_AUDIO);
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
                    && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                neededPermissions.add(Manifest.permission.POST_NOTIFICATIONS);
            }

            if (!neededPermissions.isEmpty()) {
                ActivityCompat.requestPermissions(
                        this,
                        neededPermissions.toArray(new String[0]),
                        RC_RECORD_PERMISSIONS
                );
            } else {
                launchMediaProjectionPrompt();
            }
        });
    }

    private void launchMediaProjectionPrompt() {
        try {
            MediaProjectionManager projectionManager =
                    (MediaProjectionManager) getSystemService(Context.MEDIA_PROJECTION_SERVICE);
            if (projectionManager == null) {
                notifyWebViewCaptureStart(false, "MediaProjection service unavailable on this device.");
                return;
            }
            Intent captureIntent = projectionManager.createScreenCaptureIntent();
            startActivityForResult(captureIntent, RC_SCREEN_CAPTURE);
        } catch (Exception e) {
            notifyWebViewCaptureStart(false, "Could not open screen capture prompt: " + e.getMessage());
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == RC_RECORD_PERMISSIONS) {
            // Proceed to screen capture prompt even if user declined optional mic/notification permission
            launchMediaProjectionPrompt();
        }
    }

    public void launchNativeGoogleSignIn() {
        runOnUiThread(() -> {
            try {
                Intent signInIntent = googleSignInClient.getSignInIntent();
                startActivityForResult(signInIntent, RC_GOOGLE_SIGN_IN);
            } catch (Exception e) {
                launchSystemAccountPicker();
            }
        });
    }

    private void launchSystemAccountPicker() {
        runOnUiThread(() -> {
            try {
                Intent pickerIntent;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    pickerIntent = AccountManager.newChooseAccountIntent(
                            null,
                            null,
                            new String[]{"com.google"},
                            null,
                            null,
                            null,
                            null
                    );
                } else {
                    pickerIntent = AccountManager.newChooseAccountIntent(
                            null,
                            null,
                            new String[]{"com.google"},
                            false,
                            null,
                            null,
                            null,
                            null
                    );
                }
                startActivityForResult(pickerIntent, RC_ACCOUNT_PICKER);
            } catch (Exception e) {
                fallbackToWebGoogleAuth();
            }
        });
    }

    public void notifyWebViewGoogleAuthSuccess(
            @Nullable String idToken,
            @Nullable String email,
            @Nullable String displayName,
            @Nullable String photoUrl,
            @Nullable String uid
    ) {
        runOnUiThread(() -> {
            try {
                JSONObject payload = new JSONObject();
                payload.put("idToken", idToken != null ? idToken : "");
                payload.put("email", email != null ? email : "");
                payload.put("displayName", displayName != null ? displayName : "");
                payload.put("photoUrl", photoUrl != null ? photoUrl : "");
                payload.put("uid", uid != null ? uid : "");

                String escaped = payload.toString()
                        .replace("\\", "\\\\")
                        .replace("'", "\\'")
                        .replace("\n", "")
                        .replace("\r", "");

                WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                if (webView != null) {
                    webView.evaluateJavascript(
                            "if (window.onNativeGoogleAuthSuccess) { window.onNativeGoogleAuthSuccess('" + escaped + "'); } " +
                            "else if (window.signInWithNativeGoogleToken && '" + (idToken != null ? idToken.replace("'", "\\'") : "") + "') { " +
                            "window.signInWithNativeGoogleToken('" + (idToken != null ? idToken.replace("'", "\\'") : "") + "'); }",
                            null
                    );
                }
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
    public void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == RC_GOOGLE_SIGN_IN) {
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            try {
                GoogleSignInAccount account = task.getResult(ApiException.class);
                if (account != null) {
                    String idToken = account.getIdToken();
                    String email = account.getEmail();
                    String displayName = account.getDisplayName();
                    String photoUrl = account.getPhotoUrl() != null ? account.getPhotoUrl().toString() : "";
                    String uid = account.getId();
                    notifyWebViewGoogleAuthSuccess(idToken, email, displayName, photoUrl, uid);
                } else {
                    launchSystemAccountPicker();
                }
            } catch (ApiException e) {
                // Status code 10 (DEVELOPER_ERROR) or 12500 occurs when APK keystore SHA-1 is not registered in GCP;
                // seamlessly fall back to Android's native OS AccountManager Google Account Picker
                launchSystemAccountPicker();
            }
        } else if (requestCode == RC_ACCOUNT_PICKER) {
            if (resultCode == Activity.RESULT_OK && data != null) {
                String email = data.getStringExtra(AccountManager.KEY_ACCOUNT_NAME);
                if (email != null && !email.trim().isEmpty()) {
                    String cleanEmail = email.trim();
                    String namePart = cleanEmail.contains("@")
                            ? cleanEmail.substring(0, cleanEmail.indexOf("@"))
                            : cleanEmail;
                    String safeUid = "google_" + cleanEmail.toLowerCase().replaceAll("[^a-z0-9]", "_");
                    notifyWebViewGoogleAuthSuccess("", cleanEmail, namePart, "", safeUid);
                    return;
                }
            }
            fallbackToWebGoogleAuth();
        } else if (requestCode == RC_SCREEN_CAPTURE) {
            if (resultCode == Activity.RESULT_OK && data != null) {
                Intent serviceIntent = new Intent(this, ScreenRecordService.class);
                serviceIntent.setAction(ScreenRecordService.ACTION_START_RECORDING);
                serviceIntent.putExtra(ScreenRecordService.EXTRA_RESULT_CODE, resultCode);
                serviceIntent.putExtra(ScreenRecordService.EXTRA_RESULT_DATA, data);
                serviceIntent.putExtra(ScreenRecordService.EXTRA_RESOLUTION, pendingResolution);
                serviceIntent.putExtra(ScreenRecordService.EXTRA_FPS, pendingFps);
                serviceIntent.putExtra(ScreenRecordService.EXTRA_AUDIO_MODE, pendingAudioMode);
                serviceIntent.putExtra(ScreenRecordService.EXTRA_OVERLAY_ENABLED, floatingOverlayEnabled);
                ContextCompat.startForegroundService(this, serviceIntent);
            } else {
                notifyWebViewCaptureStart(false, "Screen recording permission was cancelled.");
            }
        }
    }

    public static void notifyWebViewCaptureStart(boolean success, @Nullable String errorMessage) {
        if (currentInstance == null) return;
        currentInstance.runOnUiThread(() -> {
            WebView webView = currentInstance.getBridge() != null ? currentInstance.getBridge().getWebView() : null;
            if (webView != null) {
                String safeErr = errorMessage != null
                        ? "'" + errorMessage.replace("\\", "\\\\").replace("'", "\\'") + "'"
                        : "null";
                webView.evaluateJavascript(
                        "if (window.onNativeScreenCaptureResult) { window.onNativeScreenCaptureResult(" + success + ", " + safeErr + "); }",
                        null
                );
            }
        });
    }

    public static void notifyWebViewCaptureStopped() {
        if (currentInstance == null) return;
        currentInstance.runOnUiThread(() -> {
            WebView webView = currentInstance.getBridge() != null ? currentInstance.getBridge().getWebView() : null;
            if (webView != null) {
                webView.evaluateJavascript(
                        "if (window.onNativeScreenCaptureStopped) { window.onNativeScreenCaptureStopped(); }",
                        null
                );
            }
        });
    }

    public static void notifyWebViewClipSaved(String jsonPayload) {
        if (currentInstance == null) {
            synchronized (pendingClipJsons) {
                pendingClipJsons.add(jsonPayload);
            }
            return;
        }
        currentInstance.runOnUiThread(() -> {
            WebView webView = currentInstance.getBridge() != null ? currentInstance.getBridge().getWebView() : null;
            if (webView != null) {
                String escaped = jsonPayload
                        .replace("\\", "\\\\")
                        .replace("'", "\\'")
                        .replace("\n", "\\n")
                        .replace("\r", "");
                webView.evaluateJavascript(
                        "if (window.onNativeClipSaved) { window.onNativeClipSaved('" + escaped + "'); }",
                        null
                );
            } else {
                synchronized (pendingClipJsons) {
                    pendingClipJsons.add(jsonPayload);
                }
            }
        });
    }

    private void flushPendingSavedClipsToWebView() {
        synchronized (pendingClipJsons) {
            if (pendingClipJsons.isEmpty()) return;
            final List<String> copy = new ArrayList<>(pendingClipJsons);
            pendingClipJsons.clear();
            runOnUiThread(() -> {
                for (String payload : copy) {
                    notifyWebViewClipSaved(payload);
                }
            });
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
        });
    }

    private void setupBannerAdForFreeUser() {
        // Floating overlay banner disabled: ads are placed inline in empty spaces between sections in the UI
    }

    @Override
    public void onRestart() {
        super.onRestart();
    }

    public void loadAndShowAppOpenAdForFreeUser() {
        // Full-screen overlay ad disabled so users are never interrupted by blocking overlays
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
        public void signOutGoogle() {
            if (activity.googleSignInClient != null) {
                activity.googleSignInClient.signOut();
            }
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
            activity.requestScreenCapture(resolution, fps, activity.pendingAudioMode);
        }

        @JavascriptInterface
        public void startReplayBufferWithAudio(String resolution, int fps, String audioMode) {
            activity.requestScreenCapture(resolution, fps, audioMode);
        }

        @JavascriptInterface
        public void setAudioRecordingMode(String mode) {
            if (mode != null) {
                activity.pendingAudioMode = mode;
            }
        }

        @JavascriptInterface
        public void stopReplayBuffer() {
            triggerHaptic(20);
            Intent stopIntent = new Intent(activity, ScreenRecordService.class);
            stopIntent.setAction(ScreenRecordService.ACTION_STOP_RECORDING);
            activity.startService(stopIntent);
        }

        @JavascriptInterface
        public void saveRetroactiveClip(int durationSeconds, String gameName) {
            triggerHaptic(50);
            Intent clipIntent = new Intent(activity, ScreenRecordService.class);
            clipIntent.setAction(ScreenRecordService.ACTION_SAVE_CLIP);
            clipIntent.putExtra(ScreenRecordService.EXTRA_CLIP_DURATION, durationSeconds);
            clipIntent.putExtra(ScreenRecordService.EXTRA_GAME_NAME, gameName);
            activity.startService(clipIntent);
        }

        @JavascriptInterface
        public boolean isNativeRecording() {
            return ScreenRecordService.isRecording();
        }

        @JavascriptInterface
        public int getNativeBufferedSeconds() {
            return ScreenRecordService.getBufferedSeconds();
        }

        @JavascriptInterface
        public String readClipFileChunkBase64(String filePath, int offset, int length) {
            if (filePath == null || filePath.isEmpty()) return "";
            File file = new File(filePath);
            if (!file.exists() || offset >= file.length()) return "";
            try (RandomAccessFile raf = new RandomAccessFile(file, "r")) {
                long remaining = file.length() - offset;
                int bytesToRead = (int) Math.min((long) length, remaining);
                if (bytesToRead <= 0) return "";
                byte[] buffer = new byte[bytesToRead];
                raf.seek(offset);
                int read = raf.read(buffer);
                if (read <= 0) return "";
                return Base64.encodeToString(buffer, 0, read, Base64.NO_WRAP);
            } catch (Exception e) {
                return "";
            }
        }

        @JavascriptInterface
        public void shareNativeVideoFile(String filePath, String title) {
            activity.runOnUiThread(() -> {
                try {
                    if (filePath == null || filePath.isEmpty()) {
                        Toast.makeText(activity, "Clip saved in Gallery (Movies/ClutchClip)", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    File videoFile = new File(filePath);
                    if (!videoFile.exists()) {
                        Toast.makeText(activity, "Clip saved in Gallery (Movies/ClutchClip)", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    Uri contentUri = FileProvider.getUriForFile(
                            activity,
                            activity.getPackageName() + ".fileprovider",
                            videoFile
                    );
                    Intent shareIntent = new Intent(Intent.ACTION_SEND);
                    shareIntent.setType("video/mp4");
                    shareIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
                    shareIntent.putExtra(Intent.EXTRA_SUBJECT, title != null ? title : "ClutchClip Highlight");
                    shareIntent.putExtra(Intent.EXTRA_TEXT, "Captured with ClutchClip Instant Replay Recorder!");
                    shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    activity.startActivity(Intent.createChooser(shareIntent, "Share Gameplay Highlight"));
                } catch (Exception e) {
                    Toast.makeText(activity, "Video is available in Gallery (Movies/ClutchClip)", Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void showNativeToast(String message) {
            activity.runOnUiThread(() ->
                    Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
            );
        }

        @JavascriptInterface
        public boolean setFloatingOverlayEnabled(boolean enabled) {
            activity.floatingOverlayEnabled = enabled;
            triggerHaptic(25);
            if (enabled && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(activity)) {
                activity.runOnUiThread(() -> {
                    try {
                        Intent intent = new Intent(
                                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                                Uri.parse("package:" + activity.getPackageName())
                        );
                        activity.startActivity(intent);
                    } catch (Exception ignored) {}
                });
            }
            if (ScreenRecordService.isRecording()) {
                Intent updateIntent = new Intent(activity, ScreenRecordService.class);
                updateIntent.setAction(ScreenRecordService.ACTION_UPDATE_OVERLAY);
                updateIntent.putExtra(ScreenRecordService.EXTRA_OVERLAY_ENABLED, enabled);
                activity.startService(updateIntent);
            }
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

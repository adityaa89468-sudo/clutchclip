package com.adityaclutchclip994.app;

import android.Manifest;
import android.app.Activity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;
import android.media.MediaMetadataRetriever;
import android.media.MediaRecorder;
import android.media.MediaScannerConnection;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.MediaStore;
import android.provider.Settings;
import android.util.Base64;
import android.util.DisplayMetrics;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONObject;

public class ScreenRecordService extends Service {

    public static final String ACTION_START_RECORDING = "com.adityaclutchclip994.app.ACTION_START_RECORDING";
    public static final String ACTION_STOP_RECORDING = "com.adityaclutchclip994.app.ACTION_STOP_RECORDING";
    public static final String ACTION_SAVE_CLIP = "com.adityaclutchclip994.app.ACTION_SAVE_CLIP";
    public static final String ACTION_UPDATE_OVERLAY = "com.adityaclutchclip994.app.ACTION_UPDATE_OVERLAY";

    public static final String EXTRA_RESULT_CODE = "extra_result_code";
    public static final String EXTRA_RESULT_DATA = "extra_result_data";
    public static final String EXTRA_RESOLUTION = "extra_resolution";
    public static final String EXTRA_FPS = "extra_fps";
    public static final String EXTRA_AUDIO_MODE = "extra_audio_mode";
    public static final String EXTRA_CLIP_DURATION = "extra_clip_duration";
    public static final String EXTRA_GAME_NAME = "extra_game_name";
    public static final String EXTRA_OVERLAY_ENABLED = "extra_overlay_enabled";

    private static final String CHANNEL_ID = "clutchclip_replay_channel";
    private static final int NOTIFICATION_ID = 4091;

    private static volatile boolean isServiceRecording = false;
    private static volatile long recordingStartTimeMs = 0L;
    private static ScreenRecordService activeInstance;

    private MediaProjectionManager projectionManager;
    private MediaProjection mediaProjection;
    private VirtualDisplay virtualDisplay;
    private MediaRecorder mediaRecorder;
    private File currentSegmentFile;

    private String currentResolution = "1080p";
    private int currentFps = 60;
    private String currentAudioMode = "game_only";
    private String currentGameName = "Mobile Game";
    private int videoWidth = 1080;
    private int videoHeight = 1920;
    private int screenDensity = 320;
    private boolean isSavingClipNow = false;
    private boolean floatingOverlayWanted = true;

    private WindowManager windowManager;
    private View floatingOverlayView;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final ExecutorService ioExecutor = Executors.newSingleThreadExecutor();

    private final MediaProjection.Callback projectionCallback = new MediaProjection.Callback() {
        @Override
        public void onStop() {
            mainHandler.post(() -> stopRecordingInternal(false));
        }
    };

    public static boolean isRecording() {
        return isServiceRecording;
    }

    public static int getBufferedSeconds() {
        if (!isServiceRecording || recordingStartTimeMs <= 0L) {
            return 0;
        }
        long elapsedSec = (System.currentTimeMillis() - recordingStartTimeMs) / 1000L;
        return (int) Math.min(300L, Math.max(0L, elapsedSec));
    }

    public static ScreenRecordService getInstance() {
        return activeInstance;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        activeInstance = this;
        projectionManager = (MediaProjectionManager) getSystemService(Context.MEDIA_PROJECTION_SERVICE);
        windowManager = (WindowManager) getSystemService(Context.WINDOW_SERVICE);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || intent.getAction() == null) {
            return START_NOT_STICKY;
        }

        String action = intent.getAction();
        if (ACTION_START_RECORDING.equals(action)) {
            int resultCode = intent.getIntExtra(EXTRA_RESULT_CODE, Activity.RESULT_CANCELED);
            Intent resultData = intent.getParcelableExtra(EXTRA_RESULT_DATA);
            currentResolution = intent.getStringExtra(EXTRA_RESOLUTION);
            if (currentResolution == null) currentResolution = "1080p";
            currentFps = intent.getIntExtra(EXTRA_FPS, 60);
            currentAudioMode = intent.getStringExtra(EXTRA_AUDIO_MODE);
            if (currentAudioMode == null) currentAudioMode = "game_only";
            floatingOverlayWanted = intent.getBooleanExtra(EXTRA_OVERLAY_ENABLED, true);

            boolean includeMic = "mic_only".equals(currentAudioMode) || "game_and_mic".equals(currentAudioMode);
            boolean hasMicPerm = ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                    == PackageManager.PERMISSION_GRANTED;

            Notification notification = buildNotification("Buffering screen (" + currentResolution.toUpperCase(Locale.US) + " · " + currentFps + " FPS)");
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                    int fgsType = ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION;
                    if (includeMic && hasMicPerm) {
                        fgsType |= ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE;
                    }
                    startForeground(NOTIFICATION_ID, notification, fgsType);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION);
                } else {
                    startForeground(NOTIFICATION_ID, notification);
                }
            } catch (Exception e) {
                MainActivity.notifyWebViewCaptureStart(false, "Foreground service error: " + e.getMessage());
                stopSelf();
                return START_NOT_STICKY;
            }

            if (resultCode != Activity.RESULT_OK || resultData == null) {
                MainActivity.notifyWebViewCaptureStart(false, "Screen capture permission was not granted.");
                stopForeground(true);
                stopSelf();
                return START_NOT_STICKY;
            }

            startProjectionAndRecorder(resultCode, resultData);
        } else if (ACTION_SAVE_CLIP.equals(action)) {
            int durationSec = intent.getIntExtra(EXTRA_CLIP_DURATION, 300);
            String gameName = intent.getStringExtra(EXTRA_GAME_NAME);
            if (gameName != null && !gameName.isEmpty()) {
                currentGameName = gameName;
            }
            triggerSaveClip(durationSec, currentGameName, true);
        } else if (ACTION_UPDATE_OVERLAY.equals(action)) {
            floatingOverlayWanted = intent.getBooleanExtra(EXTRA_OVERLAY_ENABLED, true);
            if (floatingOverlayWanted && isServiceRecording) {
                showFloatingOverlayButton();
            } else {
                removeFloatingOverlayButton();
            }
        } else if (ACTION_STOP_RECORDING.equals(action)) {
            stopRecordingInternal(true);
        }

        return START_NOT_STICKY;
    }

    private void startProjectionAndRecorder(int resultCode, Intent resultData) {
        try {
            stopRecordingResourcesOnly();

            mediaProjection = projectionManager.getMediaProjection(resultCode, resultData);
            if (mediaProjection == null) {
                MainActivity.notifyWebViewCaptureStart(false, "Could not initialize Android MediaProjection.");
                stopForeground(true);
                stopSelf();
                return;
            }

            // Required on Android 14+ (API 34+) before calling createVirtualDisplay
            mediaProjection.registerCallback(projectionCallback, mainHandler);

            computeSafeScreenDimensions();

            currentSegmentFile = createTempSegmentFile();
            boolean prepared = prepareMediaRecorder(currentSegmentFile, videoWidth, videoHeight, currentFps, shouldUseMic());
            if (!prepared) {
                // Automatic hardware fallback to 720p @ 30fps without mic if device codec rejected high spec
                computeFallback720pDimensions();
                prepared = prepareMediaRecorder(currentSegmentFile, videoWidth, videoHeight, 30, false);
            }

            if (!prepared || mediaRecorder == null) {
                MainActivity.notifyWebViewCaptureStart(false, "Hardware video encoder could not be initialized on this device.");
                stopRecordingInternal(false);
                return;
            }

            virtualDisplay = mediaProjection.createVirtualDisplay(
                    "ClutchClipReplayDisplay",
                    videoWidth,
                    videoHeight,
                    screenDensity,
                    DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                    mediaRecorder.getSurface(),
                    null,
                    mainHandler
            );

            mediaRecorder.start();
            recordingStartTimeMs = System.currentTimeMillis();
            isServiceRecording = true;

            if (floatingOverlayWanted) {
                showFloatingOverlayButton();
            }

            vibrateShort(40);
            MainActivity.notifyWebViewCaptureStart(true, null);
        } catch (Exception e) {
            MainActivity.notifyWebViewCaptureStart(false, "Screen recorder start error: " + e.getMessage());
            stopRecordingInternal(false);
        }
    }

    private boolean shouldUseMic() {
        boolean wantsMic = "mic_only".equals(currentAudioMode) || "game_and_mic".equals(currentAudioMode);
        boolean hasPerm = ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                == PackageManager.PERMISSION_GRANTED;
        return wantsMic && hasPerm;
    }

    private void computeSafeScreenDimensions() {
        DisplayMetrics metrics = getResources().getDisplayMetrics();
        screenDensity = metrics.densityDpi;
        int rawW = metrics.widthPixels;
        int rawH = metrics.heightPixels;
        boolean isPortrait = rawH >= rawW;

        int targetShortSide;
        if ("480p".equalsIgnoreCase(currentResolution)) {
            targetShortSide = 480;
        } else if ("720p".equalsIgnoreCase(currentResolution)) {
            targetShortSide = 720;
        } else {
            // Cap hardware MediaRecorder short side at 1080px for universal H.264 compatibility across all SoCs
            targetShortSide = 1080;
        }

        int actualShort = Math.min(rawW, rawH);
        int actualLong = Math.max(rawW, rawH);
        if (actualShort <= 0) {
            actualShort = 1080;
            actualLong = 1920;
        }

        float scale = Math.min(1.0f, (float) targetShortSide / (float) actualShort);
        int scaledShort = alignTo16(Math.round(actualShort * scale));
        int scaledLong = alignTo16(Math.round(actualLong * scale));

        // Ensure standard hardware bounds
        scaledShort = Math.max(320, Math.min(1080, scaledShort));
        scaledLong = Math.max(640, Math.min(2400, scaledLong));

        if (isPortrait) {
            videoWidth = scaledShort;
            videoHeight = scaledLong;
        } else {
            videoWidth = scaledLong;
            videoHeight = scaledShort;
        }
    }

    private void computeFallback720pDimensions() {
        DisplayMetrics metrics = getResources().getDisplayMetrics();
        boolean isPortrait = metrics.heightPixels >= metrics.widthPixels;
        if (isPortrait) {
            videoWidth = 720;
            videoHeight = 1280;
        } else {
            videoWidth = 1280;
            videoHeight = 720;
        }
    }

    private int alignTo16(int val) {
        int rem = val % 16;
        return rem == 0 ? val : val - rem;
    }

    private File createTempSegmentFile() {
        File dir = getExternalFilesDir(Environment.DIRECTORY_MOVIES);
        if (dir == null) {
            dir = getFilesDir();
        }
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return new File(dir, "clutchclip_buffer_" + System.currentTimeMillis() + ".mp4");
    }

    private boolean prepareMediaRecorder(File outputFile, int width, int height, int fps, boolean useMic) {
        try {
            if (mediaRecorder != null) {
                try {
                    mediaRecorder.reset();
                    mediaRecorder.release();
                } catch (Exception ignored) {}
                mediaRecorder = null;
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                mediaRecorder = new MediaRecorder(this);
            } else {
                mediaRecorder = new MediaRecorder();
            }

            if (useMic) {
                mediaRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            }
            mediaRecorder.setVideoSource(MediaRecorder.VideoSource.SURFACE);
            mediaRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
            mediaRecorder.setOutputFile(outputFile.getAbsolutePath());
            mediaRecorder.setVideoSize(width, height);
            mediaRecorder.setVideoEncoder(MediaRecorder.VideoEncoder.H264);

            int safeFps = Math.min(60, Math.max(24, fps));
            mediaRecorder.setVideoFrameRate(safeFps);

            int bitrate = width * height * (safeFps >= 60 ? 6 : 4);
            bitrate = Math.max(2_500_000, Math.min(14_000_000, bitrate));
            mediaRecorder.setVideoEncodingBitRate(bitrate);

            if (useMic) {
                mediaRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
                mediaRecorder.setAudioEncodingBitRate(128_000);
                mediaRecorder.setAudioSamplingRate(44_100);
            }

            mediaRecorder.prepare();
            return true;
        } catch (Exception e) {
            if (mediaRecorder != null) {
                try {
                    mediaRecorder.reset();
                    mediaRecorder.release();
                } catch (Exception ignored) {}
                mediaRecorder = null;
            }
            return false;
        }
    }

    public void triggerSaveClip(int requestedDurationSec, String gameName, boolean continueBuffering) {
        if (!isServiceRecording || isSavingClipNow) {
            return;
        }
        isSavingClipNow = true;
        vibrateShort(55);

        ioExecutor.execute(() -> {
            try {
                // Ensure MediaRecorder has at least 1.3s of frames so stop() always succeeds cleanly
                long elapsedMs = System.currentTimeMillis() - recordingStartTimeMs;
                if (elapsedMs < 1300L) {
                    try {
                        Thread.sleep(1300L - elapsedMs);
                    } catch (InterruptedException ignored) {}
                }

                final File completedFile = currentSegmentFile;
                final int recordedSec = Math.max(1, (int) Math.round((System.currentTimeMillis() - recordingStartTimeMs) / 1000.0));
                final int finalDurationSec = Math.min(requestedDurationSec, recordedSec);

                // Swap recorder cleanly on the existing VirtualDisplay without calling createVirtualDisplay again (Android 14+ safe)
                if (continueBuffering && virtualDisplay != null && mediaProjection != null) {
                    try {
                        virtualDisplay.setSurface(null);
                    } catch (Exception ignored) {}

                    stopAndReleaseCurrentRecorder();

                    File nextFile = createTempSegmentFile();
                    boolean prepared = prepareMediaRecorder(nextFile, videoWidth, videoHeight, currentFps, shouldUseMic());
                    if (!prepared) {
                        prepared = prepareMediaRecorder(nextFile, videoWidth, videoHeight, 30, false);
                    }
                    if (prepared && mediaRecorder != null) {
                        currentSegmentFile = nextFile;
                        virtualDisplay.setSurface(mediaRecorder.getSurface());
                        mediaRecorder.start();
                        recordingStartTimeMs = System.currentTimeMillis();
                    }
                } else {
                    stopAndReleaseCurrentRecorder();
                }

                if (completedFile != null && completedFile.exists() && completedFile.length() > 1024) {
                    String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(new Date());
                    String cleanGame = (gameName != null ? gameName : "Gameplay").replaceAll("[^a-zA-Z0-9_-]", "_");
                    String displayFileName = "ClutchClip_" + cleanGame + "_" + timeStamp + ".mp4";

                    Uri galleryUri = exportMp4ToPublicGallery(completedFile, displayFileName);
                    String thumbDataUrl = extractThumbnailDataUrl(completedFile);

                    JSONObject result = new JSONObject();
                    result.put("success", true);
                    result.put("filePath", completedFile.getAbsolutePath());
                    result.put("fileName", displayFileName);
                    result.put("fileSizeBytes", completedFile.length());
                    result.put("durationSeconds", finalDurationSec);
                    result.put("gameName", gameName != null ? gameName : "Mobile Game");
                    result.put("resolution", currentResolution);
                    result.put("fps", currentFps);
                    result.put("audioMode", currentAudioMode);
                    result.put("thumbnailDataUrl", thumbDataUrl != null ? thumbDataUrl : "");
                    result.put("galleryUri", galleryUri != null ? galleryUri.toString() : "");

                    mainHandler.post(() -> {
                        Toast.makeText(
                                getApplicationContext(),
                                "⚡ Saved highlight to Gallery (Movies/ClutchClip)!",
                                Toast.LENGTH_SHORT
                        ).show();
                        MainActivity.notifyWebViewClipSaved(result.toString());
                    });
                } else {
                    JSONObject err = new JSONObject();
                    err.put("success", false);
                    err.put("error", "Buffer was still initializing. Play for a few seconds and clip again!");
                    mainHandler.post(() -> MainActivity.notifyWebViewClipSaved(err.toString()));
                }
            } catch (Exception e) {
                try {
                    JSONObject err = new JSONObject();
                    err.put("success", false);
                    err.put("error", e.getMessage());
                    mainHandler.post(() -> MainActivity.notifyWebViewClipSaved(err.toString()));
                } catch (Exception ignored) {}
            } finally {
                isSavingClipNow = false;
            }
        });
    }

    private void stopAndReleaseCurrentRecorder() {
        if (mediaRecorder != null) {
            try {
                mediaRecorder.stop();
            } catch (Exception ignored) {}
            try {
                mediaRecorder.reset();
                mediaRecorder.release();
            } catch (Exception ignored) {}
            mediaRecorder = null;
        }
    }

    private Uri exportMp4ToPublicGallery(File sourceFile, String displayFileName) {
        try {
            ContentResolver resolver = getContentResolver();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentValues values = new ContentValues();
                values.put(MediaStore.Video.Media.DISPLAY_NAME, displayFileName);
                values.put(MediaStore.Video.Media.MIME_TYPE, "video/mp4");
                values.put(MediaStore.Video.Media.RELATIVE_PATH, Environment.DIRECTORY_MOVIES + "/ClutchClip");
                values.put(MediaStore.Video.Media.IS_PENDING, 1);

                Uri collection = MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
                Uri itemUri = resolver.insert(collection, values);
                if (itemUri != null) {
                    try (InputStream in = new FileInputStream(sourceFile);
                         OutputStream out = resolver.openOutputStream(itemUri)) {
                        if (out != null) {
                            byte[] buf = new byte[65536];
                            int len;
                            while ((len = in.read(buf)) > 0) {
                                out.write(buf, 0, len);
                            }
                            out.flush();
                        }
                    }
                    values.clear();
                    values.put(MediaStore.Video.Media.IS_PENDING, 0);
                    resolver.update(itemUri, values, null, null);
                    return itemUri;
                }
            } else {
                File moviesDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES);
                File clutchDir = new File(moviesDir, "ClutchClip");
                if (!clutchDir.exists()) {
                    clutchDir.mkdirs();
                }
                File destFile = new File(clutchDir, displayFileName);
                try (InputStream in = new FileInputStream(sourceFile);
                     OutputStream out = new FileOutputStream(destFile)) {
                    byte[] buf = new byte[65536];
                    int len;
                    while ((len = in.read(buf)) > 0) {
                        out.write(buf, 0, len);
                    }
                    out.flush();
                }
                MediaScannerConnection.scanFile(
                        this,
                        new String[]{destFile.getAbsolutePath()},
                        new String[]{"video/mp4"},
                        null
                );
                return Uri.fromFile(destFile);
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String extractThumbnailDataUrl(File videoFile) {
        MediaMetadataRetriever retriever = new MediaMetadataRetriever();
        try {
            retriever.setDataSource(videoFile.getAbsolutePath());
            Bitmap frame = retriever.getFrameAtTime(500_000, MediaMetadataRetriever.OPTION_CLOSEST_SYNC);
            if (frame == null) {
                frame = retriever.getFrameAtTime();
            }
            if (frame != null) {
                int targetW = 480;
                int targetH = Math.max(270, Math.round(((float) frame.getHeight() / (float) frame.getWidth()) * targetW));
                Bitmap scaled = Bitmap.createScaledBitmap(frame, targetW, targetH, true);
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                scaled.compress(Bitmap.CompressFormat.JPEG, 80, baos);
                String base64 = Base64.encodeToString(baos.toByteArray(), Base64.NO_WRAP);
                return "data:image/jpeg;base64," + base64;
            }
        } catch (Exception ignored) {
        } finally {
            try {
                retriever.release();
            } catch (Exception ignored) {}
        }
        return null;
    }

    private void showFloatingOverlayButton() {
        mainHandler.post(() -> {
            if (floatingOverlayView != null) {
                return;
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
                return;
            }

            try {
                LinearLayout pill = new LinearLayout(this);
                pill.setOrientation(LinearLayout.HORIZONTAL);
                pill.setGravity(Gravity.CENTER_VERTICAL);
                int padH = dpToPx(14);
                int padV = dpToPx(9);
                pill.setPadding(padH, padV, padH, padV);

                GradientDrawable bg = new GradientDrawable(
                        GradientDrawable.Orientation.LEFT_RIGHT,
                        new int[]{Color.parseColor("#E11D48"), Color.parseColor("#BE123C")}
                );
                bg.setCornerRadius(dpToPx(24));
                bg.setStroke(dpToPx(1), Color.parseColor("#FDA4AF"));
                pill.setBackground(bg);

                TextView label = new TextView(this);
                label.setText("⚡ CLIP IT!");
                label.setTextColor(Color.WHITE);
                label.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
                label.setTypeface(Typeface.DEFAULT_BOLD);
                pill.addView(label);

                int layoutType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                        ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                        : WindowManager.LayoutParams.TYPE_PHONE;

                final WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                        WindowManager.LayoutParams.WRAP_CONTENT,
                        WindowManager.LayoutParams.WRAP_CONTENT,
                        layoutType,
                        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                                | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                        PixelFormat.TRANSLUCENT
                );
                params.gravity = Gravity.TOP | Gravity.START;
                params.x = dpToPx(16);
                params.y = dpToPx(180);

                pill.setOnTouchListener(new View.OnTouchListener() {
                    private int initialX;
                    private int initialY;
                    private float initialTouchX;
                    private float initialTouchY;
                    private long downTimeMs;

                    @Override
                    public boolean onTouch(View v, MotionEvent event) {
                        switch (event.getAction()) {
                            case MotionEvent.ACTION_DOWN:
                                initialX = params.x;
                                initialY = params.y;
                                initialTouchX = event.getRawX();
                                initialTouchY = event.getRawY();
                                downTimeMs = System.currentTimeMillis();
                                return true;
                            case MotionEvent.ACTION_MOVE:
                                params.x = initialX + (int) (event.getRawX() - initialTouchX);
                                params.y = initialY + (int) (event.getRawY() - initialTouchY);
                                if (windowManager != null && floatingOverlayView != null) {
                                    windowManager.updateViewLayout(floatingOverlayView, params);
                                }
                                return true;
                            case MotionEvent.ACTION_UP:
                                float dx = Math.abs(event.getRawX() - initialTouchX);
                                float dy = Math.abs(event.getRawY() - initialTouchY);
                                if (dx < dpToPx(10) && dy < dpToPx(10) && (System.currentTimeMillis() - downTimeMs) < 500) {
                                    triggerSaveClip(300, currentGameName, true);
                                }
                                return true;
                        }
                        return false;
                    }
                });

                windowManager.addView(pill, params);
                floatingOverlayView = pill;
            } catch (Exception ignored) {}
        });
    }

    private void removeFloatingOverlayButton() {
        mainHandler.post(() -> {
            if (floatingOverlayView != null && windowManager != null) {
                try {
                    windowManager.removeView(floatingOverlayView);
                } catch (Exception ignored) {}
                floatingOverlayView = null;
            }
        });
    }

    private int dpToPx(int dp) {
        return Math.round(dp * getResources().getDisplayMetrics().density);
    }

    private void vibrateShort(long ms) {
        try {
            Vibrator vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    vibrator.vibrate(ms);
                }
            }
        } catch (Exception ignored) {}
    }

    private void stopRecordingResourcesOnly() {
        isServiceRecording = false;
        recordingStartTimeMs = 0L;
        removeFloatingOverlayButton();

        if (virtualDisplay != null) {
            try {
                virtualDisplay.release();
            } catch (Exception ignored) {}
            virtualDisplay = null;
        }

        stopAndReleaseCurrentRecorder();

        if (mediaProjection != null) {
            try {
                mediaProjection.unregisterCallback(projectionCallback);
            } catch (Exception ignored) {}
            try {
                mediaProjection.stop();
            } catch (Exception ignored) {}
            mediaProjection = null;
        }
    }

    private void stopRecordingInternal(boolean notifyWeb) {
        stopRecordingResourcesOnly();
        if (notifyWeb) {
            MainActivity.notifyWebViewCaptureStopped();
        }
        try {
            stopForeground(true);
        } catch (Exception ignored) {}
        stopSelf();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "ClutchClip Replay Engine",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Continuous instant game replay buffer service");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private Notification buildNotification(String statusText) {
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        Intent openAppIntent = new Intent(this, MainActivity.class);
        PendingIntent openAppPending = PendingIntent.getActivity(this, 100, openAppIntent, flags);

        Intent clipIntent = new Intent(this, ScreenRecordService.class);
        clipIntent.setAction(ACTION_SAVE_CLIP);
        clipIntent.putExtra(EXTRA_CLIP_DURATION, 300);
        PendingIntent clipPending = PendingIntent.getService(this, 101, clipIntent, flags);

        Intent stopIntent = new Intent(this, ScreenRecordService.class);
        stopIntent.setAction(ACTION_STOP_RECORDING);
        PendingIntent stopPending = PendingIntent.getService(this, 102, stopIntent, flags);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("ClutchClip Replay Engine Active")
                .setContentText(statusText)
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setOngoing(true)
                .setContentIntent(openAppPending)
                .addAction(android.R.drawable.ic_menu_save, "⚡ SAVE CLIP", clipPending)
                .addAction(android.R.drawable.ic_media_pause, "⏹ STOP", stopPending)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build();
    }

    @Override
    public void onDestroy() {
        stopRecordingResourcesOnly();
        activeInstance = null;
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  ArrowLeft,
  Scissors,
  Download,
  Share2,
  Sparkles,
  Gauge,
  Check,
  RotateCcw,
  Tag,
  Lock,
  Crown
} from 'lucide-react';
import { SavedHighlight, LogoConfig } from '../types/recorder';

interface HighlightEditorProps {
  highlight: SavedHighlight;
  onBack: () => void;
  onSaveTrimmed: (newClip: Omit<SavedHighlight, 'videoUrl'>) => void;
  isPremium?: boolean;
  logoConfig?: LogoConfig;
  onRequirePremium?: (feature: string) => void;
}

export const HighlightEditor: React.FC<HighlightEditorProps> = ({
  highlight,
  onBack,
  onSaveTrimmed,
  isPremium = false,
  logoConfig,
  onRequirePremium,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(highlight.durationSeconds || 10);

  // Trimming bounds
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(highlight.durationSeconds || 10);

  // Playback speed
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // Esports Watermarks & Overlays in Recorded Video (defaults to logoConfig preference if subscribed)
  const [gamerTag, setGamerTag] = useState('CLUTCH_PRO');
  const [showWatermark, setShowWatermark] = useState(() => {
    if (highlight.watermarkHidden && isPremium) {
      return false;
    }
    if (logoConfig && !logoConfig.showLogo && isPremium) {
      return false;
    }
    return true;
  });
  const effectiveShowWatermark = !isPremium ? true : showWatermark;
  const [selectedBanner, setSelectedBanner] = useState<string>('1v4 ACE CLUTCH');
  const [isExporting, setIsExporting] = useState(false);

  const bannerPresets = [
    '1v4 ACE CLUTCH',
    'VICTORY ROYALE',
    'PENTAKILL',
    'INSANE FLICK',
    'HIGHLIGHT MOMENT',
  ];

  // Set initial video duration once loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const vidDur = videoRef.current.duration;
      if (!isNaN(vidDur) && isFinite(vidDur) && vidDur > 0) {
        setDuration(vidDur);
        setTrimEnd(vidDur);
      }
    }
  };

  // Keep playback within trim range
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    // Loop back to start if exceeding trimEnd
    if (curr >= trimEnd) {
      videoRef.current.currentTime = trimStart;
      if (!isPlaying) {
        videoRef.current.pause();
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime >= trimEnd || videoRef.current.currentTime < trimStart) {
        videoRef.current.currentTime = trimStart;
      }
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Export trimmed highlight with baked watermark
  const handleExportTrim = async () => {
    setIsExporting(true);
    try {
      const vid = videoRef.current;
      if (!vid) throw new Error('Video element not ready');

      // Use an offscreen canvas to bake the trim and gamer overlays
      const canvas = document.createElement('canvas');
      canvas.width = vid.videoWidth || 1280;
      canvas.height = vid.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.start(100);

      // Seek to trim start
      vid.pause();
      vid.currentTime = trimStart;
      await new Promise((r) => setTimeout(r, 200));

      const trimmedLength = trimEnd - trimStart;
      const startTime = performance.now();

      await vid.play();

      const renderLoop = () => {
        if (!ctx) return;
        ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);

        // Render Watermark & Banner
        if (effectiveShowWatermark) {
          // Gamer Tag Top Right
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(canvas.width - 240, 20, 220, 40);
          ctx.fillStyle = '#f43f5e';
          ctx.font = 'bold 16px Syne, sans-serif';
          ctx.fillText(`⚡ ${gamerTag}`, canvas.width - 220, 45);

          // Clutch Banner Bottom Center
          if (selectedBanner) {
            ctx.fillStyle = 'rgba(225, 29, 72, 0.85)';
            ctx.fillRect(canvas.width / 2 - 160, canvas.height - 70, 320, 42);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px Syne, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(selectedBanner, canvas.width / 2, canvas.height - 42);
            ctx.textAlign = 'left';
          }
        }

        if (vid.currentTime < trimEnd && !vid.paused && performance.now() - startTime < (trimmedLength + 1) * 1000) {
          requestAnimationFrame(renderLoop);
        } else {
          vid.pause();
          mediaRecorder.stop();
        }
      };

      requestAnimationFrame(renderLoop);

      await new Promise((resolve) => {
        mediaRecorder.onstop = resolve;
      });

      const finalBlob = new Blob(chunks, { type: 'video/webm' });
      const newDuration = Math.round(trimmedLength);

      const trimmedData: Omit<SavedHighlight, 'videoUrl'> = {
        id: `trim_${Date.now()}`,
        title: `${highlight.title} (Trimmed ${newDuration}s)`,
        blob: finalBlob,
        thumbnailUrl: highlight.thumbnailUrl,
        durationSeconds: newDuration,
        fileSizeBytes: finalBlob.size,
        createdAt: Date.now(),
        gameTag: highlight.gameTag,
        quality: highlight.quality,
        resolution: highlight.resolution,
        fps: highlight.fps,
        watermarkHidden: !effectiveShowWatermark,
        logoConfig: logoConfig || highlight.logoConfig,
        markers: [],
      };

      onSaveTrimmed(trimmedData);
      onBack();
    } catch {
      // Fallback: direct download original
      const a = document.createElement('a');
      a.href = highlight.videoUrl;
      a.download = `${highlight.title}_trimmed.webm`;
      a.click();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4 pb-12 w-full max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Vault</span>
        </button>
        <span className="text-xs font-bold font-display text-white">Highlight Studio</span>
      </div>

      {/* Video Preview Canvas / Player */}
      <div className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
        <video
          ref={videoRef}
          src={highlight.videoUrl}
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          className="w-full h-full object-contain"
        />

        {/* In-Editor Live Watermark Overlay */}
        {effectiveShowWatermark && (
          <div className="absolute top-3 right-3 py-1 px-2.5 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 text-rose-400 font-display font-bold text-[11px] flex items-center gap-1 pointer-events-none">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>{gamerTag}</span>
          </div>
        )}

        {/* Selected Banner Overlay */}
        {effectiveShowWatermark && selectedBanner && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
            <div className="py-1 px-4 rounded-xl bg-rose-600/90 text-white font-display font-bold text-xs shadow-lg uppercase tracking-wider">
              {selectedBanner}
            </div>
          </div>
        )}

        {/* Center Play/Pause button on tap */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg active:scale-90 transition-transform">
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-slate-900" />
            ) : (
              <Play className="w-5 h-5 fill-slate-900 ml-0.5" />
            )}
          </div>
        </button>

        {/* Current Time readout */}
        <div className="absolute bottom-2 left-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono-numbers text-white">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Scrubber & Trimmer Timeline */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-rose-400" />
            <span>Trim Clip Range</span>
          </span>
          <span className="font-mono-numbers text-slate-400 text-[11px]">
            Selected: <strong className="text-white">{(trimEnd - trimStart).toFixed(1)}s</strong>
          </span>
        </div>

        {/* Interactive Double-Handle Timeline Slider */}
        <div className="space-y-2">
          <div className="relative w-full h-8 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center px-1">
            {/* Trimmed active region highlight */}
            <div
              className="absolute top-0 bottom-0 bg-rose-500/25 border-x-2 border-rose-500"
              style={{
                left: `${(trimStart / (duration || 1)) * 100}%`,
                right: `${100 - (trimEnd / (duration || 1)) * 100}%`,
              }}
            />

            {/* Playhead position */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md z-10 pointer-events-none"
              style={{
                left: `${(currentTime / (duration || 1)) * 100}%`,
              }}
            />
          </div>

          {/* Range Sliders */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Start Cut</label>
              <input
                type="range"
                min={0}
                max={Math.max(0, trimEnd - 1)}
                step={0.1}
                value={trimStart}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setTrimStart(val);
                  if (videoRef.current) videoRef.current.currentTime = val;
                }}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <span className="text-[10px] font-mono-numbers text-slate-300">{formatTime(trimStart)}</span>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">End Cut</label>
              <input
                type="range"
                min={trimStart + 1}
                max={duration || 10}
                step={0.1}
                value={trimEnd}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setTrimEnd(val);
                }}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <span className="text-[10px] font-mono-numbers text-slate-300">{formatTime(trimEnd)}</span>
            </div>
          </div>
        </div>

        {/* Playback Speed Multipliers */}
        <div className="pt-2 border-t border-slate-800">
          <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1.5">
            <Gauge className="w-3.5 h-3.5 text-slate-500" />
            <span>Playback Speed (Slo-Mo / Fast)</span>
          </label>
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {[0.5, 1.0, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                onClick={() => changeSpeed(rate)}
                className={`py-1 text-xs font-semibold rounded-lg transition-colors ${
                  playbackRate === rate
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Esports Overlays & GamerTag (Remove Watermark available to Subscribed Users Only) */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-rose-400" />
              <span>Logo in Recorded Video</span>
              {!isPremium && (
                <span className="text-[9px] font-bold text-amber-300 px-1.5 py-0.5 rounded bg-amber-400/20 border border-amber-400/30 flex items-center gap-0.5 uppercase">
                  <Lock className="w-2.5 h-2.5" /> Subscribed Only
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => {
                if (!isPremium) {
                  onRequirePremium?.('Remove Watermark / Hide Logo (Subscribed Users Only)');
                  return;
                }
                setShowWatermark(!effectiveShowWatermark);
              }}
              className={`py-1 px-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                !effectiveShowWatermark
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : !isPremium
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {!effectiveShowWatermark ? (
                <span>Hidden in Video</span>
              ) : !isPremium ? (
                <>
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>Hide in Video (PRO)</span>
                </>
              ) : (
                <span>Hide in Video</span>
              )}
            </button>
          </div>

          {effectiveShowWatermark && (
            <div className="space-y-2">
              <input
                type="text"
                value={gamerTag}
                onChange={(e) => setGamerTag(e.target.value)}
                placeholder="Enter GamerTag..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />

              <div className="flex flex-wrap gap-1">
                {bannerPresets.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBanner(selectedBanner === b ? '' : b)}
                    className={`py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                      selectedBanner === b
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export & Save CTA (Natural Reach Zone) */}
      <div className="pt-2">
        <button
          disabled={isExporting}
          onClick={handleExportTrim}
          className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-display font-bold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
        >
          {isExporting ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-white" />
              <span>Baking Highlight ({(trimEnd - trimStart).toFixed(0)}s)...</span>
            </>
          ) : (
            <>
              <Scissors className="w-4 h-4" />
              <span>Export Trimmed Highlight ({(trimEnd - trimStart).toFixed(1)}s)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

import React, { useRef, useState } from 'react';
import { X, Play, Pause, Download, Share2, SlidersHorizontal, Sparkles } from 'lucide-react';
import { SavedHighlight, AUDIO_MODE_OPTIONS } from '../types/recorder';

interface VideoPlayerModalProps {
  highlight: SavedHighlight;
  onClose: () => void;
  onOpenEditor: (highlight: SavedHighlight) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  highlight,
  onClose,
  onOpenEditor,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = highlight.videoUrl;
    a.download = `${highlight.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.webm`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex flex-col min-w-0 pr-2">
            <h3 className="text-sm font-bold text-white truncate font-display">{highlight.title}</h3>
            <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-slate-400">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono-numbers font-bold text-rose-300 border border-slate-700/60">
                {highlight.resolution === '1440p' ? '2K QHD' : highlight.resolution === '4k' ? '4K UHD' : (highlight.resolution || '1080p').toUpperCase()} · {highlight.fps || 60}FPS
              </span>
              {highlight.audioMode && AUDIO_MODE_OPTIONS[highlight.audioMode] && (
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono-numbers text-sky-300 border border-slate-700/60">
                  {AUDIO_MODE_OPTIONS[highlight.audioMode].label}
                </span>
              )}
              {highlight.watermarkHidden ? (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-[10px] font-mono-numbers font-bold text-emerald-300 border border-emerald-500/30">
                  Logo Hidden in Video
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono-numbers text-slate-300 border border-slate-700/60">
                  Logo in Video
                </span>
              )}
              <span>·</span>
              <span>{highlight.durationSeconds}s</span>
              <span>·</span>
              <span>{highlight.gameTag}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={highlight.videoUrl}
            autoPlay
            controls
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Markers jump bar */}
        {highlight.markers && highlight.markers.length > 0 && (
          <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3 text-rose-400" />
              Pins:
            </span>
            {highlight.markers.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = m.timestamp;
                    videoRef.current.play().catch(() => {});
                  }
                }}
                className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-[10px] font-mono-numbers shrink-0"
              >
                {Math.floor(m.timestamp)}s · {m.label}
              </button>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-3 bg-slate-900 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenEditor(highlight);
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
            <span>Open in Editor</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Clip</span>
          </button>
        </div>
      </div>
    </div>
  );
};

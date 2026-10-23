import React, { useState } from 'react';
import {
  Play,
  Download,
  Share2,
  Trash2,
  Edit3,
  Film,
  Sparkles,
  Clock,
  HardDrive,
  Check,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { SavedHighlight, AUDIO_MODE_OPTIONS } from '../types/recorder';

interface HighlightVaultProps {
  highlights: SavedHighlight[];
  onDeleteHighlight: (id: string) => void;
  onRenameHighlight: (id: string, newTitle: string) => void;
  onOpenEditor: (highlight: SavedHighlight) => void;
  onSelectPlay: (highlight: SavedHighlight) => void;
}

export const HighlightVault: React.FC<HighlightVaultProps> = ({
  highlights,
  onDeleteHighlight,
  onRenameHighlight,
  onOpenEditor,
  onSelectPlay,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [shareSuccessId, setShareSuccessId] = useState<string | null>(null);

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format seconds to mm:ss
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Download clip file
  const handleDownload = (highlight: SavedHighlight, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = highlight.videoUrl;
    const sanitizedTitle = highlight.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `${sanitizedTitle}_highlight.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Native Mobile Web Share API
  const handleShare = async (highlight: SavedHighlight, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.share && navigator.canShare) {
        const file = new File([highlight.blob], `${highlight.title}.webm`, { type: highlight.blob.type });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: highlight.title,
            text: `Check out this 5-minute gameplay highlight from ClutchClip!`,
            files: [file],
          });
          return;
        }
      }
      // Fallback: copy link or trigger download
      handleDownload(highlight, e);
      setShareSuccessId(highlight.id);
      setTimeout(() => setShareSuccessId(null), 2000);
    } catch {
      // User cancelled share
    }
  };

  const handleStartRename = (highlight: SavedHighlight, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(highlight.id);
    setEditTitle(highlight.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameHighlight(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  if (highlights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-[#121620] border border-white/[0.07] flex items-center justify-center text-slate-400 mb-4">
          <Film className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold font-display text-white">No Highlights Captured Yet</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
          Start the 5-Minute Replay Buffer while playing your game. When a highlight happens, tap <span className="text-rose-400 font-semibold">Clip 5m</span> to save it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-display text-white">
            Highlight Vault <span className="text-sm font-normal text-slate-400">({highlights.length})</span>
          </h2>
          <p className="text-xs text-slate-400">Saved retroactive clips stored locally on your device</p>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono-numbers">
          <HardDrive className="w-3.5 h-3.5 text-slate-500" />
          <span>
            {formatSize(highlights.reduce((acc, h) => acc + h.fileSizeBytes, 0))}
          </span>
        </div>
      </div>

      {/* Highlights List */}
      <div className="space-y-3">
        {highlights.map((h) => (
          <div
            key={h.id}
            onClick={() => onSelectPlay(h)}
            className="group relative rounded-2xl bg-[#121620] border border-white/[0.07] hover:border-white/[0.15] p-4 flex flex-col gap-3 transition-colors cursor-pointer"
          >
            {/* Top row: Thumbnail preview + Info */}
            <div className="flex items-start gap-3.5">
              {/* Thumbnail Container */}
              <div className="relative w-32 sm:w-40 aspect-video bg-[#0b0e14] rounded-xl overflow-hidden shrink-0 border border-white/[0.06]">
                <img
                  src={h.thumbnailUrl}
                  alt={h.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-slate-900">
                    <Play className="w-3.5 h-3.5 fill-slate-900 ml-0.5" />
                  </div>
                </div>
                {/* Duration overlay */}
                <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono-numbers font-medium text-white">
                  {formatDuration(h.durationSeconds)}
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="flex-1 min-w-0">
                {editingId === h.id ? (
                  <div className="flex items-center gap-1.5 my-0.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 bg-[#0b0e14] border border-white/[0.12] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-rose-500"
                      autoFocus
                    />
                    <button
                      onClick={(e) => handleSaveRename(h.id, e)}
                      className="p-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="p-1.5 rounded-md bg-white/[0.08] text-slate-300 hover:bg-white/[0.12]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-semibold text-white truncate group-hover:text-rose-400 transition-colors">
                      {h.title}
                    </h3>
                    <button
                      onClick={(e) => handleStartRename(h, e)}
                      className="text-slate-500 hover:text-slate-300 p-1 shrink-0"
                      title="Rename Clip"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Clean unboxed metadata with typographic separators */}
                <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-400 mt-1 font-mono-numbers">
                  <span className="text-rose-400 font-medium">
                    {h.resolution === '1440p' ? '2K QHD' : h.resolution === '4k' ? '4K UHD' : (h.resolution || '1080p').toUpperCase()} · {h.fps || 60} FPS
                  </span>
                  {h.audioMode && (
                    <>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-300">
                        {AUDIO_MODE_OPTIONS[h.audioMode]?.shortLabel || 'Game Audio'}
                      </span>
                    </>
                  )}
                  {h.watermarkHidden && (
                    <>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-emerald-400">Logo Hidden</span>
                    </>
                  )}
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="font-sans font-medium text-slate-300">{h.gameTag}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>{formatSize(h.fileSizeBytes)}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="font-sans truncate">{formatDate(h.createdAt)}</span>
                </div>

                {h.markers && h.markers.length > 0 && (
                  <div className="text-xs text-sky-400 mt-1">
                    {h.markers.length} Highlight Pin{h.markers.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditor(h);
                }}
                className="py-1.5 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
                <span>Edit &amp; Trim</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => handleShare(h, e)}
                  className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Share Clip (Shorts / Reels / Discord)"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={(e) => handleDownload(h, e)}
                  className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete highlight "${h.title}"?`)) {
                      onDeleteHighlight(h.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-800/70 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete Highlight"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

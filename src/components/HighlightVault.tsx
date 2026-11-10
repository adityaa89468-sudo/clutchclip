import React, { useState } from 'react';
import {
  Play,
  Download,
  Share2,
  Trash2,
  Edit3,
  Film,
  Check,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { SavedHighlight, AUDIO_MODE_OPTIONS } from '../types/recorder';
import { nativeAndroidBridge } from '../services/nativeAndroidBridge';

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

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return (
      d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const handleDownload = (highlight: SavedHighlight, e: React.MouseEvent) => {
    e.stopPropagation();
    if (nativeAndroidBridge.isRunningInNativeApk()) {
      nativeAndroidBridge.showNativeToast('Saved in Gallery (Movies/ClutchClip)');
      return;
    }
    const ext = highlight.blob?.type?.includes('mp4') ? 'mp4' : 'webm';
    const a = document.createElement('a');
    a.href = highlight.videoUrl;
    const sanitizedTitle = highlight.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `${sanitizedTitle}_highlight.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async (highlight: SavedHighlight, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (nativeAndroidBridge.isRunningInNativeApk()) {
        const shared = nativeAndroidBridge.shareNativeClip(highlight.id, highlight.title);
        if (shared) return;
      }
      const ext = highlight.blob?.type?.includes('mp4') ? 'mp4' : 'webm';
      if (navigator.share && navigator.canShare) {
        const file = new File([highlight.blob], `${highlight.title}.${ext}`, {
          type: highlight.blob.type || 'video/mp4',
        });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: highlight.title,
            text: `Captured with ClutchClip`,
            files: [file],
          });
          return;
        }
      }
      handleDownload(highlight, e);
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
      <div className="rounded-2xl bg-[#11151e] border border-white/[0.06] py-16 px-6 text-center max-w-3xl mx-auto">
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center text-slate-400 mx-auto mb-3.5">
          <Film className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold font-display text-white">No Saved Clips Yet</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1.5 leading-relaxed">
          Start the 5-minute replay buffer while playing. Tap <span className="text-slate-200 font-medium">Clip 5m</span> anytime to save a highlight here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold font-display text-white">
            Saved Highlights
          </h2>
          <p className="text-xs text-slate-400">
            {highlights.length} {highlights.length === 1 ? 'clip' : 'clips'} · {formatSize(highlights.reduce((acc, h) => acc + h.fileSizeBytes, 0))} stored on device
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {highlights.map((h) => (
          <div
            key={h.id}
            onClick={() => onSelectPlay(h)}
            className="group rounded-2xl bg-[#11151e] border border-white/[0.06] hover:border-white/[0.12] p-4 flex flex-col gap-3.5 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-4">
              {/* Thumbnail */}
              <div className="relative w-32 sm:w-40 aspect-video bg-[#090b10] rounded-xl overflow-hidden shrink-0 border border-white/[0.05]">
                <img
                  src={h.thumbnailUrl}
                  alt={h.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white">
                    <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono-numbers text-white">
                  {formatDuration(h.durationSeconds)}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {editingId === h.id ? (
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 bg-[#090b10] border border-white/[0.12] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={(e) => handleSaveRename(h.id, e)}
                      className="p-1.5 rounded-lg bg-rose-600 text-white"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelRename}
                      className="p-1.5 rounded-lg bg-white/[0.06] text-slate-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                      {h.title}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => handleStartRename(h, e)}
                      className="text-slate-500 hover:text-slate-300 p-1 shrink-0"
                      title="Rename"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-400 mt-1 font-mono-numbers">
                  <span className="text-slate-200">
                    {h.resolution === '1440p' ? '2K' : h.resolution === '4k' ? '4K' : (h.resolution || '1080p').toUpperCase()} · {h.fps || 60} FPS
                  </span>
                  {h.audioMode && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{AUDIO_MODE_OPTIONS[h.audioMode]?.shortLabel || 'Game Audio'}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="font-sans text-slate-300">{h.gameTag}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatSize(h.fileSizeBytes)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-sans">{formatDate(h.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Clean Action Row */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditor(h);
                }}
                className="py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>Trim Clip</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => handleShare(h, e)}
                  className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Share"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDownload(h, e)}
                  className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHighlight(h.id);
                  }}
                  className="p-2 rounded-lg bg-white/[0.04] hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete"
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

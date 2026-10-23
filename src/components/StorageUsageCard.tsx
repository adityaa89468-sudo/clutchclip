import React, { useEffect, useState, useCallback } from 'react';
import {
  HardDrive,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Film,
  Layers,
  Database
} from 'lucide-react';
import { SavedHighlight, ResolutionOption, FpsOption, RESOLUTION_SLOTS } from '../types/recorder';
import { indexedDbStorage, StorageQuotaEstimate } from '../services/indexedDbStorage';

interface StorageUsageCardProps {
  highlights: SavedHighlight[];
  resolution: ResolutionOption;
  fps: FpsOption;
  onClearAllHighlights: () => void;
}

export const StorageUsageCard: React.FC<StorageUsageCardProps> = ({
  highlights,
  resolution,
  fps,
  onClearAllHighlights,
}) => {
  const [quotaInfo, setQuotaInfo] = useState<StorageQuotaEstimate | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const fetchQuota = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const estimate = await indexedDbStorage.getStorageQuotaEstimate(highlights);
      setQuotaInfo(estimate);
    } finally {
      setTimeout(() => setIsRefreshing(false), 250);
    }
  }, [highlights]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  // Format bytes to human-readable B / KB / MB / GB
  const formatBytes = (bytes: number, decimals = 1): string => {
    if (!bytes || bytes <= 0) return '0 MB';
    const k = 1024;
    if (bytes < k) return `${bytes} B`;
    if (bytes < k * k) return `${(bytes / k).toFixed(decimals)} KB`;
    if (bytes < k * k * k) return `${(bytes / (k * k)).toFixed(decimals)} MB`;
    return `${(bytes / (k * k * k)).toFixed(2)} GB`;
  };

  const highlightsBytes = quotaInfo?.highlightsBytes ?? highlights.reduce((acc, h) => acc + (h.fileSizeBytes || 0), 0);
  const quotaBytes = quotaInfo?.quotaBytes ?? 2 * 1024 * 1024 * 1024;
  const availableBytes = quotaInfo?.availableBytes ?? Math.max(0, quotaBytes - highlightsBytes);
  const rawPercent = quotaInfo?.percentUsed ?? (quotaBytes > 0 ? (highlightsBytes / quotaBytes) * 100 : 0);

  // Ensure visual bar shows at least a sliver when highlights exist
  const visualBarPercent =
    highlightsBytes > 0 ? Math.min(100, Math.max(2.5, rawPercent)) : 0;

  // Format percentage nicely
  const formattedPercent =
    rawPercent === 0
      ? '0%'
      : rawPercent < 0.01
      ? '< 0.01%'
      : rawPercent < 1
      ? `${rawPercent.toFixed(2)}%`
      : `${rawPercent.toFixed(1)}%`;

  // Estimate remaining recording minutes at current resolution & FPS
  const activeSlot = RESOLUTION_SLOTS[resolution] || RESOLUTION_SLOTS['1080p'];
  const bytesPerMinute = ((activeSlot.baseBitrate * (fps / 60)) / 8) * 60;
  const estMinutesRemaining = bytesPerMinute > 0 ? Math.floor(availableBytes / bytesPerMinute) : 0;

  // Group saved highlights by resolution for breakdown
  const resolutionGroups: Record<string, { count: number; bytes: number }> = highlights.reduce(
    (acc, h) => {
      const key =
        h.resolution === '1440p'
          ? '2K QHD'
          : h.resolution === '4k'
          ? '4K UHD'
          : (h.resolution || '1080p').toUpperCase();
      if (!acc[key]) acc[key] = { count: 0, bytes: 0 };
      acc[key].count += 1;
      acc[key].bytes += h.fileSizeBytes || 0;
      return acc;
    },
    {} as Record<string, { count: number; bytes: number }>
  );

  const isHighUsage = rawPercent >= 80;
  const isModerateUsage = rawPercent >= 50 && rawPercent < 80;

  return (
    <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>IndexedDB Storage Quota</span>
              {isHighUsage ? (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  Low Space
                </span>
              ) : (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Healthy
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400">
              Browser local video database usage & capacity
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchQuota}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors active:scale-95"
          title="Refresh storage quota estimate"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
        </button>
      </div>

      {/* Visual Quota Progress Bar Card */}
      <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-2.5">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-sm font-extrabold font-mono-numbers text-white">
              {formatBytes(highlightsBytes)}
            </span>
            <span className="text-[11px] text-slate-400 font-mono-numbers ml-1">
              used of {formatBytes(quotaBytes)} quota
            </span>
          </div>
          <span
            className={`text-xs font-bold font-mono-numbers ${
              isHighUsage
                ? 'text-rose-400'
                : isModerateUsage
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {formattedPercent}
          </span>
        </div>

        {/* Multi-layer Visual Meter */}
        <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isHighUsage
                ? 'bg-gradient-to-r from-rose-600 to-red-500'
                : isModerateUsage
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-400'
            }`}
            style={{ width: `${visualBarPercent}%` }}
          />
        </div>

        {/* Legend & Free Space Readout */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-numbers pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            <span>Saved Clips: {highlights.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-700 inline-block" />
            <span>Free: {formatBytes(availableBytes)}</span>
          </div>
        </div>
      </div>

      {/* Storage Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
          <Film className="w-4 h-4 text-rose-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400">Saved Highlights</div>
            <div className="text-xs font-bold text-white font-mono-numbers truncate">
              {highlights.length} {highlights.length === 1 ? 'Clip' : 'Clips'} ({formatBytes(highlightsBytes)})
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
          <HardDrive className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400">Est. Capacity Left</div>
            <div className="text-xs font-bold text-sky-300 font-mono-numbers truncate">
              ~{estMinutesRemaining > 999 ? '999+' : estMinutesRemaining} mins ({activeSlot.shortLabel})
            </div>
          </div>
        </div>
      </div>

      {/* Per-Resolution Breakdown if clips exist */}
      {Object.keys(resolutionGroups).length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-500" />
            <span>Usage by Resolution Slot</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(resolutionGroups).map(([resLabel, info]) => (
              <div
                key={resLabel}
                className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono-numbers flex items-center gap-1.5"
              >
                <span className="font-bold text-rose-400">{resLabel}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300">{info.count}x</span>
                <span className="text-slate-400">({formatBytes(info.bytes)})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear All Highlights Action */}
      {!confirmClear ? (
        <button
          type="button"
          onClick={() => setConfirmClear(true)}
          disabled={highlights.length === 0}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-rose-950/50 border border-slate-700/80 hover:border-rose-500/40 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete All Saved Highlights ({formatBytes(highlightsBytes)})</span>
        </button>
      ) : (
        <div className="p-2.5 rounded-2xl bg-rose-950/30 border border-rose-500/40 flex items-center justify-between gap-2 animate-in fade-in duration-150">
          <span className="text-[11px] text-rose-200 font-medium pl-1">
            Permanently delete all {highlights.length} clips?
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                onClearAllHighlights();
                setConfirmClear(false);
              }}
              className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState, useCallback } from 'react';
import {
  Trash2,
  RefreshCw,
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

  const formatBytes = (bytes: number, decimals = 1): string => {
    if (!bytes || bytes <= 0) return '0 MB';
    const k = 1024;
    if (bytes < k) return `${bytes} B`;
    if (bytes < k * k) return `${(bytes / k).toFixed(decimals)} KB`;
    if (bytes < k * k * k) return `${(bytes / (k * k)).toFixed(decimals)} MB`;
    return `${(bytes / (k * k * k)).toFixed(2)} GB`;
  };

  const highlightsBytes =
    quotaInfo?.highlightsBytes ??
    highlights.reduce((acc, h) => acc + (h.fileSizeBytes || 0), 0);
  const quotaBytes = quotaInfo?.quotaBytes ?? 2 * 1024 * 1024 * 1024;
  const availableBytes = quotaInfo?.availableBytes ?? Math.max(0, quotaBytes - highlightsBytes);
  const rawPercent =
    quotaInfo?.percentUsed ?? (quotaBytes > 0 ? (highlightsBytes / quotaBytes) * 100 : 0);

  const visualBarPercent =
    highlightsBytes > 0 ? Math.min(100, Math.max(2, rawPercent)) : 0;

  const activeSlot = RESOLUTION_SLOTS[resolution] || RESOLUTION_SLOTS['1080p'];
  const bytesPerMinute = ((activeSlot.baseBitrate * (fps / 60)) / 8) * 60;
  const estMinutesRemaining =
    bytesPerMinute > 0 ? Math.floor(availableBytes / bytesPerMinute) : 0;

  return (
    <div className="p-5 rounded-2xl bg-[#11151e] border border-white/[0.06] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Local Storage</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {highlights.length} saved {highlights.length === 1 ? 'clip' : 'clips'} · ~{estMinutesRemaining > 999 ? '999+' : estMinutesRemaining} mins capacity remaining
          </p>
        </div>

        <button
          type="button"
          onClick={fetchQuota}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Refresh storage"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-xs font-mono-numbers">
          <span className="text-slate-200 font-medium">
            {formatBytes(highlightsBytes)} used
          </span>
          <span className="text-slate-400">
            {formatBytes(availableBytes)} free
          </span>
        </div>

        <div className="w-full h-2 bg-[#090b10] rounded-full overflow-hidden border border-white/[0.05]">
          <div
            className="h-full bg-rose-600 rounded-full transition-all duration-300"
            style={{ width: `${visualBarPercent}%` }}
          />
        </div>
      </div>

      {highlights.length > 0 && (
        <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between">
          {!confirmClear ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="text-xs font-medium text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all saved clips</span>
            </button>
          ) : (
            <div className="flex items-center justify-between w-full text-xs">
              <span className="text-slate-300">Delete all {highlights.length} clips?</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClearAllHighlights();
                    setConfirmClear(false);
                  }}
                  className="text-rose-400 font-semibold hover:underline cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

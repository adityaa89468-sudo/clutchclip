import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Bookmark, ChevronRight, X, Clock } from 'lucide-react';
import { BufferDuration } from '../types/recorder';
import { AppLogo } from './AppLogo';

interface FloatingReplayWidgetProps {
  isBuffering: boolean;
  bufferedSeconds: number;
  maxBufferSeconds: BufferDuration;
  onClip: (seconds: number) => void;
  onAddMarker: (label: string) => void;
  isSaving: boolean;
  customLogoUrl?: string | null;
}

export const FloatingReplayWidget: React.FC<FloatingReplayWidgetProps> = ({
  isBuffering,
  bufferedSeconds,
  maxBufferSeconds,
  onClip,
  onAddMarker,
  isSaving,
  customLogoUrl,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 140 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag on bubble handle
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: Math.max(10, Math.min(window.innerWidth - 65, dragStartRef.current.initialX + dx)),
      y: Math.max(50, Math.min(window.innerHeight - 150, dragStartRef.current.initialY + dy)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Auto snap to screen edge when released
  useEffect(() => {
    if (!isDragging) {
      // Snap to nearest horizontal edge
      const screenMid = window.innerWidth / 2;
      const targetX = position.x < screenMid ? 12 : window.innerWidth - 68;
      setPosition((prev) => ({ ...prev, x: targetX }));
    }
  }, [isDragging, position.x]);

  return (
    <div
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 50,
      }}
      className="touch-none select-none transition-transform duration-75"
    >
      {/* Floating Replay Bubble with Mini App Logo */}
      <div className="relative flex items-center">
        <button
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={() => {
            if (!isDragging) setIsOpen(!isOpen);
          }}
          className={`relative w-13 h-13 rounded-full flex flex-col items-center justify-center shadow-2xl border transition-all active:scale-95 ${
            isBuffering
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-200 shadow-rose-950/50'
              : 'bg-slate-900/95 border-slate-700 text-slate-300'
          }`}
          title="ClutchClip Quick Capture Mini Logo Bubble"
        >
          {/* Active recording beacon */}
          {isBuffering && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 z-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border border-slate-900"></span>
            </span>
          )}

          <AppLogo size={24} variant="mini" customLogoUrl={customLogoUrl} />
          <span className="text-[9px] font-mono-numbers font-semibold mt-0.5 leading-none">
            {formatTime(bufferedSeconds)}
          </span>
        </button>

        {/* Expanded Quick Action Flyout */}
        {isOpen && (
          <div
            className={`absolute top-0 flex flex-col gap-1.5 p-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl z-50 min-w-[210px] animate-in fade-in zoom-in-95 duration-150 ${
              position.x < window.innerWidth / 2 ? 'left-15' : 'right-15'
            }`}
          >
            <div className="flex items-center justify-between px-1.5 pb-1 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Quick Replay Buffer</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="px-1 text-[10px] text-slate-400 font-mono-numbers">
              BUFFERED: <span className="text-white font-bold">{formatTime(bufferedSeconds)}</span> / {formatTime(maxBufferSeconds)}
            </div>

            {/* Quick Clip Buttons */}
            <button
              disabled={isSaving || bufferedSeconds === 0}
              onClick={() => {
                onClip(maxBufferSeconds);
                setIsOpen(false);
              }}
              className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold text-xs flex items-center justify-between shadow-md active:scale-95 disabled:opacity-50"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Clip Full 5 Min
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              disabled={isSaving || bufferedSeconds === 0}
              onClick={() => {
                onClip(60);
                setIsOpen(false);
              }}
              className="w-full py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-between active:scale-95 disabled:opacity-50"
            >
              <span>Clip Last 60s</span>
              <span className="text-[10px] text-slate-400">1 Min</span>
            </button>

            <button
              disabled={isSaving || bufferedSeconds === 0}
              onClick={() => {
                onClip(30);
                setIsOpen(false);
              }}
              className="w-full py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-between active:scale-95 disabled:opacity-50"
            >
              <span>Clip Last 30s</span>
              <span className="text-[10px] text-slate-400">Short</span>
            </button>

            {/* Bookmark marker */}
            <button
              disabled={!isBuffering}
              onClick={() => {
                onAddMarker('Quick Pin');
                setIsOpen(false);
              }}
              className="w-full py-1.5 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-sky-300 font-medium text-xs flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <Bookmark className="w-3.5 h-3.5 text-sky-400" />
              <span>Drop Highlight Pin</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

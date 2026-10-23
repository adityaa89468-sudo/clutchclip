import React, { useEffect, useState } from 'react';
import { AppLogo } from './AppLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(12);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setProgress(48), 350);
    const t2 = window.setTimeout(() => setProgress(84), 850);
    const t3 = window.setTimeout(() => setProgress(100), 1300);
    const t4 = window.setTimeout(() => setIsExiting(true), 1550);
    const t5 = window.setTimeout(() => onFinish(), 1850);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      window.clearTimeout(t5);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[120] bg-[#080a0f] text-slate-100 flex flex-col items-center justify-between py-10 px-6 select-none transition-opacity duration-300 ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-rose-600/15 blur-[100px] pointer-events-none" />

      {/* Top Spacer */}
      <div className="text-[11px] font-mono-numbers uppercase tracking-widest text-slate-500">
        Instant Replay Capture Engine
      </div>

      {/* Center Brand Emblem & Title */}
      <div className="relative flex flex-col items-center text-center space-y-5">
        {/* Animated Radar Ring around Logo */}
        <div className="relative flex items-center justify-center p-4">
          <div className="absolute inset-0 rounded-3xl border border-rose-500/30 animate-ping opacity-30" />
          <div className="relative p-3 rounded-3xl bg-[#121620] border border-white/[0.08] shadow-2xl">
            <AppLogo size="xl" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Clutch<span className="text-rose-500">Clip</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            5-Minute Retroactive Screen &amp; Game Recorder
          </p>
        </div>

        {/* Minimal Loading Progress Bar */}
        <div className="w-48 pt-2 space-y-2">
          <div className="h-1 w-full rounded-full bg-white/[0.07] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono-numbers text-slate-500">
            <span>{progress < 100 ? 'Loading Replay Engine...' : 'Ready'}</span>
            <span className="text-rose-400">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Attribution Footer */}
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="text-xs text-slate-400">
          Created by <span className="text-white font-semibold">Aditya</span>
        </div>
        <div className="text-[11px] font-mono-numbers text-slate-500">
          v1.00.01 &bull; 4K 120 FPS Studio
        </div>
      </div>
    </div>
  );
};

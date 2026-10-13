import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Gauge, Minus, Plus } from 'lucide-react';

interface MetronomeProps {
  onTick: () => void;
}

export const Metronome: React.FC<MetronomeProps> = ({ onTick }) => {
  const [bpm, setBpm] = useState<number>(80);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [beatActive, setBeatActive] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const presets = [60, 72, 80, 100, 120];

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = (60 / bpm) * 1000;
      timerRef.current = window.setInterval(() => {
        onTick();
        setBeatActive(true);
        setTimeout(() => setBeatActive(false), 90);
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm, onTick]);

  const togglePlay = () => {
    if (!isPlaying) {
      onTick();
      setBeatActive(true);
      setTimeout(() => setBeatActive(false), 90);
    }
    setIsPlaying(!isPlaying);
  };

  const adjustBpm = (delta: number) => {
    setBpm((prev) => Math.min(150, Math.max(50, prev + delta)));
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-md shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              节拍器辅助
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full transition-all duration-75 ${
                  beatActive
                    ? 'bg-amber-400 ring-4 ring-amber-400/40 scale-125'
                    : isPlaying
                    ? 'bg-amber-600/40'
                    : 'bg-slate-700'
                }`}
              />
            </h3>
            <p className="text-xs text-slate-400">稳定气流与手指颗粒感的基础</p>
          </div>
        </div>

        {/* BPM Quick adjuster */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustBpm(-1)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="减小 1 BPM"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="text-2xl font-black font-mono text-amber-400 min-w-[75px] text-center">
            {bpm} <span className="text-xs font-sans text-slate-400 font-normal">BPM</span>
          </div>
          <button
            onClick={() => adjustBpm(1)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="增加 1 BPM"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slider & Presets */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">50</span>
          <input
            type="range"
            min="50"
            max="150"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
          />
          <span className="text-xs font-semibold text-slate-400">150</span>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
          <div className="flex items-center gap-1.5">
            {presets.map((val) => (
              <button
                key={val}
                onClick={() => setBpm(val)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  bpm === val
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <button
            onClick={togglePlay}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-md ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-amber-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current" /> 停止节拍
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> 启动节拍
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

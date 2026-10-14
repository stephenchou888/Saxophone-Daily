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
    <div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              节拍器辅助
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full transition-all duration-75 ${
                  beatActive
                    ? 'bg-primary ring-4 ring-primary/30 scale-125'
                    : isPlaying
                    ? 'bg-primary/50'
                    : 'bg-muted-foreground/30'
                }`}
              />
            </h3>
            <p className="text-xs text-muted-foreground">稳定气流与手指颗粒感的基础</p>
          </div>
        </div>

        {/* BPM Quick adjuster */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustBpm(-1)}
            className="inline-flex items-center justify-center rounded-md p-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="减小 1 BPM"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="text-xl font-bold font-mono text-primary min-w-[75px] text-center">
            {bpm} <span className="text-xs font-sans text-muted-foreground font-normal">BPM</span>
          </div>
          <button
            onClick={() => adjustBpm(1)}
            className="inline-flex items-center justify-center rounded-md p-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="增加 1 BPM"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slider & Presets */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">50</span>
          <input
            type="range"
            min="50"
            max="150"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary transition-all"
          />
          <span className="text-xs font-medium text-muted-foreground">150</span>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
          <div className="flex items-center gap-1.5">
            {presets.map((val) => (
              <button
                key={val}
                onClick={() => setBpm(val)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  bpm === val
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <button
            onClick={togglePlay}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold text-xs sm:text-sm transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isPlaying
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
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

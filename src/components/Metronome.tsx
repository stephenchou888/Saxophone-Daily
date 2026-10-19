import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Minus, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

interface MetronomeProps {
  onTick: () => void;
}

const MIN_BPM = 50;
const MAX_BPM = 150;
const PRESETS = [60, 72, 80, 100, 120];

export const Metronome: React.FC<MetronomeProps> = ({ onTick }) => {
  const [bpm, setBpm] = useState<number>(80);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [beatActive, setBeatActive] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

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
    setBpm((prev) => Math.min(MAX_BPM, Math.max(MIN_BPM, prev + delta)));
  };

  return (
    // 手机端压缩为横条：标题 + BPM 加减 + 启停；滑杆与预设仅在 sm 以上显示
    <Card className="gap-4 max-sm:flex-row max-sm:items-center max-sm:justify-between max-sm:gap-3 max-sm:px-4 max-sm:py-3">
      <CardHeader className="max-sm:min-w-0 max-sm:flex-1 max-sm:px-0">
        <CardTitle className="flex items-center gap-2 text-[15px] whitespace-nowrap">
          节拍器
          <span
            className={cn(
              'inline-block size-2.5 rounded-full transition-all duration-75',
              beatActive
                ? 'bg-brand ring-4 ring-brand/30 scale-125'
                : isPlaying
                ? 'bg-brand/50'
                : 'bg-border'
            )}
          />
        </CardTitle>
        <CardDescription className="text-xs max-sm:hidden">稳定气流与手指颗粒感</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 max-sm:flex max-sm:shrink-0 max-sm:items-center max-sm:gap-2 max-sm:space-y-0 max-sm:px-0">
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => adjustBpm(-1)} title="减小 1 BPM">
            <Minus />
          </Button>
          <div className="min-w-[72px] text-center text-3xl font-semibold tracking-tight tabular-nums max-sm:text-xl">
            {bpm} <span className="text-xs font-medium tracking-normal text-muted-foreground">BPM</span>
          </div>
          <Button variant="outline" size="icon-sm" onClick={() => adjustBpm(1)} title="增加 1 BPM">
            <Plus />
          </Button>
        </div>
        <div className="flex items-center gap-3 max-sm:hidden">
          <span className="text-xs font-medium text-muted-foreground">{MIN_BPM}</span>
          <Slider
            min={MIN_BPM}
            max={MAX_BPM}
            step={1}
            value={[bpm]}
            onValueChange={([v]) => setBpm(v)}
            aria-label="BPM"
          />
          <span className="text-xs font-medium text-muted-foreground">{MAX_BPM}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <ToggleGroup
            className="max-sm:hidden"
            type="single"
            variant="outline"
            size="sm"
            value={PRESETS.includes(bpm) ? String(bpm) : ''}
            onValueChange={(v) => v && setBpm(Number(v))}
          >
            {PRESETS.map((val) => (
              <ToggleGroupItem
                key={val}
                value={String(val)}
                className="px-2.5 font-mono text-xs"
              >
                {val}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Button
            variant={isPlaying ? 'destructive' : 'default'}
            onClick={togglePlay}
            aria-label={isPlaying ? '停止节拍' : '启动节拍'}
          >
            {isPlaying ? (
              <>
                <Square className="fill-current" /> <span className="max-sm:hidden">停止节拍</span>
              </>
            ) : (
              <>
                <Play className="fill-current" /> <span className="max-sm:hidden">启动节拍</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Gauge, Minus, Plus } from 'lucide-react';
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
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="size-4 text-primary" />
          节拍器辅助
          <span
            className={cn(
              'inline-block size-2.5 rounded-full transition-all duration-75',
              beatActive
                ? 'bg-primary ring-4 ring-primary/30 scale-125'
                : isPlaying
                ? 'bg-primary/50'
                : 'bg-muted-foreground/30'
            )}
          />
        </CardTitle>
        <CardDescription>稳定气流与手指颗粒感的基础</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => adjustBpm(-1)} title="减小 1 BPM">
            <Minus />
          </Button>
          <div className="min-w-[72px] text-center font-mono text-xl font-bold text-primary">
            {bpm} <span className="font-sans text-xs font-normal text-muted-foreground">BPM</span>
          </div>
          <Button variant="outline" size="icon-sm" onClick={() => adjustBpm(1)} title="增加 1 BPM">
            <Plus />
          </Button>
        </div>
        <div className="flex items-center gap-3">
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
                className="px-2.5 text-xs font-semibold data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
              >
                {val}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Button variant={isPlaying ? 'destructive' : 'default'} onClick={togglePlay}>
            {isPlaying ? (
              <>
                <Square className="fill-current" /> 停止节拍
              </>
            ) : (
              <>
                <Play className="fill-current" /> 启动节拍
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

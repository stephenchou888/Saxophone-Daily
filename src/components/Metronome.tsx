import React from 'react';
import { Play, Square, Minus, Plus } from 'lucide-react';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

export const MIN_BPM = 50;
export const MAX_BPM = 150;
export const BEATS_PER_BAR_OPTIONS = [2, 3, 4] as const;

interface MetronomeProps {
  bpm: number;
  onBpmChange: (bpm: number) => void;
  beatsPerBar: number;
  onBeatsPerBarChange: (beats: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  /** 当前拍在小节中的位置（0 起），停止时为 -1 */
  currentBeat: number;
}

// 节拍器只负责展示与输入；计时由 App 中与慢速演示共用的节拍时钟驱动
export const Metronome: React.FC<MetronomeProps> = ({
  bpm,
  onBpmChange,
  beatsPerBar,
  onBeatsPerBarChange,
  isPlaying,
  onTogglePlay,
  currentBeat,
}) => {
  const adjustBpm = (delta: number) => {
    onBpmChange(Math.min(MAX_BPM, Math.max(MIN_BPM, bpm + delta)));
  };

  const beatDots = (
    <div className="flex items-center gap-[5px]" aria-hidden="true">
      {Array.from({ length: beatsPerBar }, (_, i) => (
        <span
          key={i}
          className={cn(
            'size-2 rounded-full transition-colors duration-75',
            isPlaying && i === currentBeat ? 'bg-brand' : 'bg-border'
          )}
        />
      ))}
    </div>
  );

  return (
    // 手机端压缩为横条：标题 + 拍点 + BPM 加减 + 启停；滑杆与拍号仅在 sm 以上显示
    <Card className="gap-4 max-sm:flex-row max-sm:items-center max-sm:justify-between max-sm:gap-3 max-sm:px-4 max-sm:py-3">
      <CardHeader className="max-sm:min-w-0 max-sm:flex-1 max-sm:px-0">
        <CardTitle className="flex items-center gap-2 text-[15px] whitespace-nowrap">
          节拍器
          <span className="sm:hidden">{beatDots}</span>
        </CardTitle>
        <CardDescription className="text-xs max-sm:hidden">稳定气流与手指颗粒感</CardDescription>
        <CardAction className="pt-1.5 max-sm:hidden">{beatDots}</CardAction>
      </CardHeader>

      <CardContent className="space-y-4 max-sm:flex max-sm:shrink-0 max-sm:items-center max-sm:gap-2 max-sm:space-y-0 max-sm:px-0">
        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => adjustBpm(-1)} aria-label="减慢" title="减小 1 BPM">
            <Minus />
          </Button>
          <div className="min-w-[72px] text-center text-3xl font-semibold tracking-tight tabular-nums max-sm:text-xl">
            {bpm}{' '}
            <span className="text-xs font-medium tracking-normal text-muted-foreground">
              BPM<span className="sm:hidden"> · {beatsPerBar}/4</span>
            </span>
          </div>
          <Button variant="outline" size="icon-sm" onClick={() => adjustBpm(1)} aria-label="加快" title="增加 1 BPM">
            <Plus />
          </Button>
        </div>

        <div className="space-y-1.5 max-sm:hidden">
          <Slider
            min={MIN_BPM}
            max={MAX_BPM}
            step={1}
            value={[bpm]}
            onValueChange={([v]) => onBpmChange(v)}
            aria-label="BPM"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{MIN_BPM}</span>
            <span>{MAX_BPM}</span>
          </div>
        </div>

        {/* 卡片较窄时开始按钮换到下一行，按钮宽度随卡片伸缩铺满（手机端紧凑行保持图标按钮） */}
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            className="shrink-0 max-sm:hidden"
            type="single"
            variant="pill"
            size="sm"
            aria-label="拍号"
            value={String(beatsPerBar)}
            onValueChange={(v) => v && onBeatsPerBarChange(Number(v))}
          >
            {BEATS_PER_BAR_OPTIONS.map((n) => (
              <ToggleGroupItem key={n} value={String(n)} className="h-7 px-2.5 font-mono text-xs">
                {n}/4
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Button
            variant={isPlaying ? 'destructive' : 'default'}
            className="sm:min-w-20 sm:flex-1"
            onClick={onTogglePlay}
            aria-label={isPlaying ? '停止节拍' : '启动节拍'}
          >
            {isPlaying ? (
              <>
                <Square className="fill-current" /> <span className="max-sm:hidden">停止</span>
              </>
            ) : (
              <>
                <Play className="fill-current" /> <span className="max-sm:hidden">开始</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

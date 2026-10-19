import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle2, Check, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  addCheckin,
  CheckinData,
  computeStreak,
  dateKey,
  lastSevenDays,
  loadCheckins,
  saveCheckins,
} from '@/lib/streak';

export const StreakCard: React.FC = () => {
  const [data, setData] = useState<CheckinData>({ days: [] });
  const today = new Date();

  useEffect(() => {
    try {
      setData(loadCheckins(localStorage));
    } catch (e) {
      console.error('Error loading checkin streak:', e);
    }
  }, []);

  const streak = computeStreak(data.days, today);
  const hasCheckedInToday = data.days.includes(dateKey(today));
  const week = lastSevenDays(data.days, today);

  const statusMessage = hasCheckedInToday
    ? `今日已完成基本功演练！连续坚持 ${streak} 天，明天继续加油！`
    : streak > 0
    ? `昨日已打卡，今天完成练习即可连击至 ${streak + 1} 天！`
    : '今日尚未打卡，完成 15 分钟音阶与长音练习后点击打卡。';

  const handleCheckin = () => {
    if (hasCheckedInToday) return;
    const next = addCheckin(data, new Date());
    setData(next);
    try {
      saveCheckins(localStorage, next);
    } catch (e) {
      console.error('Error saving checkin streak:', e);
    }

    // Trigger confetti celebration
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
    });
  };

  return (
    // 手机端压缩为横条：左侧天数，右侧打卡按钮
    <Card className="gap-4 max-sm:flex-row max-sm:items-center max-sm:justify-between max-sm:gap-3 max-sm:px-4 max-sm:py-3">
      <CardHeader className="max-sm:min-w-0 max-sm:flex-1 max-sm:gap-1 max-sm:px-0">
        <CardTitle className="flex items-center gap-2 text-[15px] max-sm:hidden">连续打卡</CardTitle>
        <CardDescription className="text-xs max-sm:hidden">数据仅保存在本机浏览器</CardDescription>
        <div className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap sm:hidden">
          <Flame className="size-4 fill-current text-brand" />
          已连续练习打卡
          <span className="text-xl tracking-tight tabular-nums">{streak}</span>天
        </div>
      </CardHeader>

      <CardContent className="space-y-4 max-sm:shrink-0 max-sm:px-0">
        <div className="flex items-baseline gap-1.5 max-sm:hidden">
          <span className="text-4xl font-semibold tracking-tight tabular-nums">{streak}</span>
          <span className="text-sm text-muted-foreground">天</span>
          {streak >= 3 && <Trophy className="ml-1 size-5 self-center fill-brand text-brand" />}
        </div>

        <ol className="grid grid-cols-7 gap-1.5 max-sm:hidden" aria-label="最近 7 天打卡记录">
          {week.map((d) => (
            <li key={d.key} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex aspect-square w-full max-w-8 items-center justify-center rounded-md border',
                  d.done ? 'border-transparent bg-primary text-primary-foreground' : 'bg-background',
                  d.isToday && !d.done && 'border-dashed border-muted-foreground/50'
                )}
                aria-label={`${d.key} ${d.done ? '已打卡' : '未打卡'}`}
              >
                {d.done && <Check className="size-3.5" strokeWidth={3} />}
              </div>
              <span className={cn('text-[11px] text-muted-foreground', d.isToday && 'font-semibold text-foreground')}>
                {d.isToday ? '今' : d.label}
              </span>
            </li>
          ))}
        </ol>

        <p className="text-xs text-muted-foreground max-sm:hidden">{statusMessage}</p>
        <Button
          variant={hasCheckedInToday ? 'secondary' : 'outline'}
          className="w-full disabled:opacity-100 disabled:text-success max-sm:h-9 max-sm:px-3"
          onClick={handleCheckin}
          disabled={hasCheckedInToday}
        >
          {hasCheckedInToday ? (
            <>
              <CheckCircle2 /> <span className="max-sm:hidden">今日练习已打卡</span><span className="sm:hidden">已打卡</span>
            </>
          ) : (
            <>
              <Check /> <span className="max-sm:hidden">完成今日打卡</span><span className="sm:hidden">打卡</span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

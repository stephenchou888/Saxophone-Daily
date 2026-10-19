import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle2, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'sax_daily_streak_v1';

export const StreakCard: React.FC = () => {
  const [streak, setStreak] = useState<number>(0);
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const getYesterdayString = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : { lastDate: '', streak: 0 };
      const today = getTodayString();
      const yesterday = getYesterdayString();

      setStreak(data.streak || 0);

      if (data.lastDate === today) {
        setHasCheckedInToday(true);
        setStatusMessage(`今日已完成基本功演练！连续坚持 ${data.streak} 天，明天继续加油！`);
      } else {
        setHasCheckedInToday(false);
        if (data.streak > 0 && data.lastDate === yesterday) {
          setStatusMessage(`昨日已打卡，今天完成练习即可连击至 ${data.streak + 1} 天！`);
        } else {
          setStatusMessage('今日尚未打卡，完成 15 分钟音阶与长音练习后点击打卡。');
        }
      }
    } catch (e) {
      console.error('Error loading checkin streak:', e);
    }
  }, []);

  const handleCheckin = () => {
    if (hasCheckedInToday) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let data = raw ? JSON.parse(raw) : { lastDate: '', streak: 0 };
      const today = getTodayString();
      const yesterday = getYesterdayString();

      let newStreak = 1;
      if (data.lastDate === yesterday) {
        newStreak = (data.streak || 0) + 1;
      }

      data = { lastDate: today, streak: newStreak };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      setStreak(newStreak);
      setHasCheckedInToday(true);
      setStatusMessage(`打卡成功！已连续练琴 ${newStreak} 天，保持好手感！`);

      // Trigger confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
      });
    } catch (e) {
      console.error('Error saving checkin streak:', e);
    }
  };

  return (
    <Card className="gap-4 text-center">
      <CardHeader className="justify-items-center">
        <CardTitle className="flex items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
          <Flame className="size-5 fill-current text-primary animate-bounce" />
          Daily Streak
        </CardTitle>
        <CardDescription className="flex items-center justify-center gap-2 pt-1 text-base font-semibold text-foreground">
          已连续练习打卡
          <span className="font-mono text-3xl font-bold tracking-tight text-success">{streak}</span>
          天
          {streak >= 3 && <Trophy className="ml-1 size-5 fill-primary text-primary animate-pulse" />}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">{statusMessage}</p>
        <Button
          size="lg"
          variant={hasCheckedInToday ? 'outline' : 'success'}
          className="w-full disabled:opacity-100 disabled:text-success"
          onClick={handleCheckin}
          disabled={hasCheckedInToday}
        >
          {hasCheckedInToday ? (
            <>
              <CheckCircle2 /> 今日练习已打卡
            </>
          ) : (
            <>
              <Sparkles /> 完成今日练习打卡
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

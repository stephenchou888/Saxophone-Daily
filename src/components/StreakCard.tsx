import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle2, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

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
    <div className="rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <Flame className="w-6 h-6 fill-current animate-bounce text-amber-500" />
        </div>
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Daily Streak
        </span>
      </div>

      <div className="flex items-center justify-center gap-2 my-2">
        <span className="text-foreground font-semibold text-base">已连续练习打卡</span>
        <span className="text-3xl font-bold text-emerald-400 font-mono tracking-tight">
          {streak}
        </span>
        <span className="text-foreground font-semibold text-base">天</span>
        {streak >= 3 && (
          <Trophy className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse ml-1" />
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-5">{statusMessage}</p>

      <button
        onClick={handleCheckin}
        disabled={hasCheckedInToday}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          hasCheckedInToday
            ? 'bg-secondary text-emerald-400 border border-emerald-500/30 cursor-default'
            : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20 active:scale-[0.99] cursor-pointer'
        }`}
      >
        {hasCheckedInToday ? (
          <>
            <CheckCircle2 className="w-4 h-4" /> 今日练习已打卡
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" /> 完成今日练习打卡
          </>
        )}
      </button>
    </div>
  );
};

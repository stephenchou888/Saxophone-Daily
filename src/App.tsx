import { useState, useEffect, useCallback, useRef } from 'react';
import { SaxophoneType, ScaleDefinition } from './types/music';
import { SCALES, FINGERINGS, KEY_NAME_MAP } from './data/scales';
import { useSoundEngine, getSaxSoundingPitch } from './hooks/useSoundEngine';
import { SaxophoneDiagram } from './components/SaxophoneDiagram';
import { SheetMusicView } from './components/SheetMusicView';
import { Metronome } from './components/Metronome';
import { StreakCard } from './components/StreakCard';
import { PracticeTipsCard } from './components/PracticeTipsCard';
import {
  Volume2,
  SkipBack,
  SkipForward,
  Play,
  Square,
  Sparkles,
  Calendar,
  Music2,
  CheckCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// 下拉菜单中的音阶分组
const SCALE_GROUPS: { category: NonNullable<ScaleDefinition['category']>; label: string; className: string }[] = [
  { category: 'special', label: '萨克斯核心特训与特色音阶', className: 'text-primary' },
  { category: 'major', label: '五度圈全部 12 个自然大调 (全套)', className: 'text-amber-400' },
  { category: 'minor', label: '常用自然小调与关系小调', className: 'text-indigo-400' },
  { category: 'harmonic_minor', label: '萨克斯考级核心和声小调', className: 'text-purple-400' },
];

const scaleShortName = (s: ScaleDefinition) => s.name.split(' (')[0];

export default function App() {
  const [saxType, setSaxType] = useState<SaxophoneType>('alto');
  const [currentScale, setCurrentScale] = useState(SCALES[0]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [todayDateStr, setTodayDateStr] = useState<string>('');

  const autoPlayTimerRef = useRef<number | null>(null);
  const { playTone, playClick } = useSoundEngine();

  // Initialize today's date and rotating scale
  useEffect(() => {
    const now = new Date();
    const dateOpts: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    };
    setTodayDateStr(now.toLocaleDateString('zh-CN', dateOpts));

    const startOfYear = new Date(now.getFullYear(), 0, 0).getTime();
    const dayOfYear = Math.floor((now.getTime() - startOfYear) / (1000 * 60 * 60 * 24));
    const scaleIdx = dayOfYear % SCALES.length;
    setCurrentScale(SCALES[scaleIdx]);
    setCurrentNoteIndex(0);
  }, []);

  const currentNoteName = currentScale.notes[currentNoteIndex] || 'C4';
  const currentFingering = FINGERINGS[currentNoteName] || {
    desc: currentNoteName,
    keys: [],
    freq: 440,
  };

  // Sounding pitch calculation for display
  const soundingPitchInfo = getSaxSoundingPitch(currentFingering.freq, saxType);
  const soundingFreq = soundingPitchInfo.concertFreq;
  const soundingNote = soundingPitchInfo.noteName;

  const getNoteRegister = (fingering?: { freq: number; keys: string[] }): 'low' | 'high' | 'altissimo' => {
    if (!fingering) return 'low';
    if (fingering.freq >= 1100 || fingering.keys.some((k) => k.includes('palm') || k.includes('front_f'))) {
      return 'altissimo';
    }
    if (fingering.freq >= 580 || fingering.keys.includes('key_octave')) {
      return 'high';
    }
    return 'low';
  };

  // Play current note sound
  const playCurrentNote = useCallback(() => {
    if (currentFingering) {
      playTone(currentFingering.freq, saxType, 0.45, getNoteRegister(currentFingering));
    }
  }, [currentFingering, playTone, saxType]);

  const handlePrevNote = useCallback(() => {
    setCurrentNoteIndex((prev) => {
      const nextIdx = prev > 0 ? prev - 1 : currentScale.notes.length - 1;
      const note = currentScale.notes[nextIdx];
      const fingering = FINGERINGS[note];
      if (fingering) playTone(fingering.freq, saxType, 0.45, getNoteRegister(fingering));
      return nextIdx;
    });
  }, [currentScale.notes, playTone, saxType]);

  const handleNextNote = useCallback(() => {
    setCurrentNoteIndex((prev) => {
      const nextIdx = prev < currentScale.notes.length - 1 ? prev + 1 : 0;
      const note = currentScale.notes[nextIdx];
      const fingering = FINGERINGS[note];
      if (fingering) playTone(fingering.freq, saxType, 0.45, getNoteRegister(fingering));
      return nextIdx;
    });
  }, [currentScale.notes, playTone, saxType]);

  const handleSelectNoteIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < currentScale.notes.length) {
        setCurrentNoteIndex(index);
        const note = currentScale.notes[index];
        const fingering = FINGERINGS[note];
        if (fingering) playTone(fingering.freq, saxType, 0.45, getNoteRegister(fingering));
      }
    },
    [currentScale.notes, playTone, saxType]
  );

  // Auto-play demo cycle
  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      setIsAutoPlaying(false);
    } else {
      setIsAutoPlaying(true);
      playCurrentNote();
      autoPlayTimerRef.current = window.setInterval(() => {
        handleNextNote();
      }, 1100);
    }
  };

  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, []);

  const handleScaleChange = (scaleId: string) => {
    const found = SCALES.find((s) => s.id === scaleId);
    if (found) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      setIsAutoPlaying(false);
      setCurrentScale(found);
      setCurrentNoteIndex(0);
    }
  };

  // Human readable active keys string
  const activeKeysSummary =
    currentFingering.keys.length === 0
      ? '全开音孔（不按任何按键）'
      : currentFingering.keys.map((k) => KEY_NAME_MAP[k] || k).join(' + ');

  return (
    <div className="min-h-screen bg-background text-foreground py-3 sm:py-5 px-3 sm:px-6 touch-manipulation pb-safe">
      <div className="max-w-[1560px] mx-auto grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12">
        {/* ===================== Header: Title + Instrument + Today's Scale ===================== */}
        <Card className="gap-0 py-3 sm:py-4 lg:col-span-12">
          <CardContent className="flex flex-col gap-3 px-4 sm:px-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1 className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-xl font-black tracking-tight text-transparent sm:text-2xl">
                  🎷 Saxophone Daily
                </h1>
                <span className="text-muted-foreground">·</span>
                <div className="flex min-w-0 items-center gap-1.5">
                  <Music2 className="size-4 shrink-0 text-primary" />
                  <h2 className="truncate text-base font-bold sm:text-lg">今日主修：{scaleShortName(currentScale)}</h2>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium">
                <span className="inline-flex items-center gap-1 text-primary">
                  <Calendar className="size-3.5" />
                  {todayDateStr}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{currentScale.keySig}</span>
                <span className="hidden text-muted-foreground sm:inline">·</span>
                <span className="hidden text-muted-foreground sm:inline">
                  本位移调记谱（视谱即吹），试听按{' '}
                  <span className="font-semibold text-primary">
                    {saxType === 'alto' ? 'Eb 中音（发音低大六度）' : 'Bb 高音（发音低大二度）'}
                  </span>{' '}
                  真实发音
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center xl:shrink-0">
              <ToggleGroup
                type="single"
                variant="pill"
                size="sm"
                value={saxType}
                onValueChange={(v) => v && setSaxType(v as SaxophoneType)}
                className="grid w-full grid-cols-2 sm:w-auto"
              >
                <ToggleGroupItem value="alto" className="px-3 text-xs font-semibold">
                  中音 Eb Alto
                  {saxType === 'alto' && <CheckCircle />}
                </ToggleGroupItem>
                <ToggleGroupItem value="soprano" className="px-3 text-xs font-semibold">
                  高音 Bb Soprano
                  {saxType === 'soprano' && <CheckCircle />}
                </ToggleGroupItem>
              </ToggleGroup>

              <div className="flex w-full items-center gap-2 sm:w-72">
                <span className="shrink-0 text-xs font-medium text-muted-foreground">切换调性:</span>
                <Select value={currentScale.id} onValueChange={handleScaleChange}>
                  <SelectTrigger size="sm" className="w-full min-w-0 font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end" className="max-h-[380px]">
                    {SCALE_GROUPS.map((group, gi) => (
                      <SelectGroup key={group.category}>
                        {gi > 0 && <SelectSeparator />}
                        <SelectLabel className={`flex items-center gap-1.5 font-bold ${group.className}`}>
                          {group.category === 'special' ? <Sparkles className="size-3.5" /> : <Music2 className="size-3.5" />}
                          {group.label}
                        </SelectLabel>
                        {SCALES.filter((s) => s.category === group.category).map((s) => (
                          <SelectItem key={s.id} value={s.id} className="text-xs">
                            {scaleShortName(s)} <span className="opacity-70">({s.accidentals})</span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/*
          练习主区：手机端把五线谱 + 当前音符控制条整体吸顶，萨克斯图示在下方滚动；
          桌面端（lg）该容器 display: contents，子元素直接参与外层 12 列网格。
        */}
        <div className="sticky top-0 z-30 -mx-3 space-y-2 bg-background/95 px-3 pt-1 pb-2 backdrop-blur sm:-mx-6 sm:px-6 lg:contents">
          {/* ===================== Sheet Music ===================== */}
          <div className="lg:col-span-12">
            <SheetMusicView
              scale={currentScale}
              abcNotation={currentScale.abc}
              currentNoteIndex={currentNoteIndex}
              onNoteClick={handleSelectNoteIndex}
            />
          </div>

          {/* ===================== Current Note & Step Controls ===================== */}
          <Card className="gap-0 py-3 sm:py-4 lg:sticky lg:top-4 lg:col-span-4 lg:self-start">
            <CardContent className="space-y-2 px-3 sm:space-y-3 sm:px-4">
              <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/40 px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex min-w-0 items-baseline gap-2 lg:block">
                  <span className="hidden text-xs font-semibold tracking-wider text-muted-foreground uppercase lg:block">
                    当前音符 · Current Note
                  </span>
                  <div className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl lg:text-5xl">
                    {currentNoteName}
                  </div>
                  <div className="truncate text-sm font-bold sm:text-base lg:mt-0.5 lg:text-lg">{currentFingering.desc}</div>
                </div>

                <div className="shrink-0 space-y-1 text-right">
                  <Badge variant="success" className="px-2 py-1 text-[11px] sm:text-xs">
                    实际发音({saxType === 'alto' ? 'Eb' : 'Bb'}):
                    <span className="font-bold text-foreground">{soundingNote}</span>
                    <span className="hidden opacity-80 sm:inline">({soundingFreq} Hz)</span>
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    第 <strong className="text-primary">{currentNoteIndex + 1}</strong> / {currentScale.notes.length} 音
                  </div>
                </div>
              </div>

              {/* Active Keys Combinations */}
              <div className="space-y-1 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 sm:px-4 sm:py-3">
                <div className="hidden items-center justify-between text-xs font-semibold tracking-wide text-primary uppercase sm:flex">
                  <span>闭合按键组合说明</span>
                  <span className="text-[11px] font-normal text-muted-foreground normal-case">点击萨克斯按键也可交互</span>
                </div>
                <div data-keys-summary className="text-sm leading-snug font-bold text-primary sm:text-base">
                  {activeKeysSummary}
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 lg:grid-cols-2">
                <Button variant="secondary" className="h-10 px-1 text-xs sm:text-sm" onClick={handlePrevNote}>
                  <SkipBack /> <span className="max-sm:hidden">上一个音</span><span className="sm:hidden">上一个</span>
                </Button>

                <Button
                  variant={isAutoPlaying ? 'destructive' : 'success'}
                  className="h-10 px-1 text-xs font-bold sm:text-sm"
                  onClick={toggleAutoPlay}
                >
                  {isAutoPlaying ? (
                    <>
                      <Square className="fill-current" /> <span className="max-sm:hidden">停止演示</span><span className="sm:hidden">停止</span>
                    </>
                  ) : (
                    <>
                      <Play className="fill-current" /> <span className="max-sm:hidden">慢速指法演示</span><span className="sm:hidden">演示</span>
                    </>
                  )}
                </Button>

                <Button variant="secondary" className="h-10 px-1 text-xs sm:text-sm" onClick={handleNextNote}>
                  <span className="max-sm:hidden">下一个音</span><span className="sm:hidden">下一个</span> <SkipForward />
                </Button>

                <Button
                  variant="outline"
                  className="h-10 border-primary/40 bg-primary/15 px-1 text-xs text-primary hover:bg-primary/25 hover:text-primary sm:text-sm dark:border-primary/40 dark:bg-primary/15 dark:hover:bg-primary/25"
                  onClick={playCurrentNote}
                >
                  <Volume2 /> <span className="max-sm:hidden">发音试听</span><span className="sm:hidden">试听</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===================== Physical Saxophone Diagram Card ===================== */}
        <Card className="py-4 lg:col-span-8">
          <CardContent className="flex flex-col items-center justify-center px-3 sm:px-5">
            <SaxophoneDiagram activeKeys={currentFingering.keys} saxType={saxType} />

            {/* Diagram Legend */}
            <div className="mt-4 w-full space-y-2 border-t pt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="size-3.5 shrink-0 rounded-full bg-primary" />
                <span>橙金高亮：闭合按键（手指需按严密封孔）</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3.5 shrink-0 rounded-full border bg-muted" />
                <span>象牙白贝壳：开放按键（手指自然贴附微悬）</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===================== Practice Aids: Metronome, Streak, Tips ===================== */}
        <section className="space-y-3 pt-2 lg:col-span-12">
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground">
            <Sparkles className="size-4 text-primary" /> 练习辅助
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metronome onTick={playClick} />
            <StreakCard />
            <div className="sm:col-span-2">
              <PracticeTipsCard scaleName={currentScale.name} scaleTip={currentScale.tip} />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-6 text-center text-xs text-muted-foreground lg:col-span-12">
          Saxophone Daily · 专为中音 (Eb) 与高音 (Bb) 萨克斯设计 · PC / 移动端全兼容 · 坚持练习，音色自见
        </footer>
      </div>
    </div>
  );
}

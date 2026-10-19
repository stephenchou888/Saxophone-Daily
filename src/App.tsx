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
  Calendar,
  Music2,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from './hooks/useTheme';
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
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// 下拉菜单中的音阶分组
const SCALE_GROUPS: { category: NonNullable<ScaleDefinition['category']>; label: string }[] = [
  { category: 'special', label: '特训与特色音阶' },
  { category: 'major', label: '五度圈 12 个自然大调' },
  { category: 'minor', label: '自然小调' },
  { category: 'harmonic_minor', label: '和声小调' },
];

const scaleShortName = (s: ScaleDefinition) => s.name.split(' (')[0];

const CATEGORY_LABEL: Record<NonNullable<ScaleDefinition['category']>, string> = {
  special: '特色音阶',
  major: '自然大调',
  minor: '自然小调',
  harmonic_minor: '和声小调',
};

// 显示用音名：F#4 → F♯4，Bb4 → B♭4
const prettyNote = (n: string) => n.replace('#', '♯').replace(/^([A-G])b/, '$1♭');

export default function App() {
  const [saxType, setSaxType] = useState<SaxophoneType>('alto');
  const [currentScale, setCurrentScale] = useState(SCALES[0]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [todayDateStr, setTodayDateStr] = useState<string>('');

  const autoPlayTimerRef = useRef<number | null>(null);
  const { playTone, playClick } = useSoundEngine();
  const { theme, toggleTheme } = useTheme();

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

  const transposeLabel = saxType === 'alto' ? '低大六度' : '低大二度';
  const progressPct = ((currentNoteIndex + 1) / currentScale.notes.length) * 100;

  const demoLabel = isAutoPlaying ? '停止演示' : '慢速指法演示';
  const DemoIcon = isAutoPlaying ? Square : Play;

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground touch-manipulation lg:pb-0">
      {/* ===================== App Bar: Logo + Instrument ===================== */}
      <header data-fit-reserve="top" className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex min-h-14 max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Music2 className="size-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight whitespace-nowrap">Saxophone Daily</span>
            <Badge variant="outline" className="hidden text-muted-foreground sm:inline-flex">
              基本功研习
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <ToggleGroup
              type="single"
              variant="pill"
              size="sm"
              value={saxType}
              onValueChange={(v) => v && setSaxType(v as SaxophoneType)}
              aria-label="选择乐器"
            >
              <ToggleGroupItem value="alto" className="px-2.5 text-[13px] font-medium sm:px-3">
                <span className="max-sm:hidden">中音</span> Alto<span className="max-sm:hidden"> · E♭</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="soprano" className="px-2.5 text-[13px] font-medium sm:px-3">
                <span className="max-sm:hidden">高音</span> Soprano<span className="max-sm:hidden"> · B♭</span>
              </ToggleGroupItem>
            </ToggleGroup>
            <Button
              variant="outline"
              size="icon"
              className="max-sm:size-8"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? '切换浅色模式' : '切换深色模式'}
              title={theme === 'dark' ? '切换浅色模式' : '切换深色模式'}
            >
              {theme === 'dark' ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 pt-4 sm:px-8">
        {/* ===================== Today's Scale ===================== */}
        {/* 桌面端压成一行（标题 + 标签 + 日期 | 调性选择），给下方谱面与指法图让出首屏高度 */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-2 lg:space-y-0">
            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground lg:hidden">
              <Calendar className="size-3.5" />
              {todayDateStr} · 今日主修
            </div>
            <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-3">
              <h1 className="text-2xl leading-tight font-semibold tracking-tight">{scaleShortName(currentScale)}</h1>
              <div className="flex flex-wrap items-center gap-1.5">
                {currentScale.category && <Badge variant="secondary">{CATEGORY_LABEL[currentScale.category]}</Badge>}
                <Badge variant="outline" className="text-muted-foreground">
                  {currentScale.keySig}
                </Badge>
                <span className="ml-1 hidden items-center gap-1.5 text-[13px] text-muted-foreground lg:inline-flex">
                  <Calendar className="size-3.5" />
                  {todayDateStr} · 今日主修
                </span>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-72 sm:shrink-0">
            <span className="shrink-0 text-xs font-medium text-muted-foreground">切换调性</span>
            <Select value={currentScale.id} onValueChange={handleScaleChange}>
              <SelectTrigger className="w-full min-w-0 bg-card font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" className="max-h-[380px]">
                {SCALE_GROUPS.map((group, gi) => (
                  <SelectGroup key={group.category}>
                    {gi > 0 && <SelectSeparator />}
                    <SelectLabel className="font-medium">{group.label}</SelectLabel>
                    {SCALES.filter((s) => s.category === group.category).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {scaleShortName(s)} <span className="font-mono text-xs text-muted-foreground">{s.accidentals}</span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* ===================== Sheet Music + Note Strip ===================== */}
        {/* 手机 / 平板端谱面吸顶：往下滚到指法图时谱面仍在视野内，配合底部控制条无需来回滚动 */}
        <Card data-fit-reserve="top" className="sticky top-14 z-20 gap-3 py-3 shadow-sm sm:py-5 lg:static lg:py-4 lg:shadow-xs">
          <CardContent className="space-y-3 px-3 sm:space-y-4 sm:px-6 lg:space-y-3">
            <div className="flex items-center justify-between gap-3 sm:items-start lg:items-center">
              <div className="flex min-w-0 items-baseline gap-2 sm:block lg:flex">
                <h2 className="text-base font-semibold">五线谱视奏</h2>
                <p className="text-xs text-muted-foreground sm:text-[13px]">
                  <span className="sm:hidden">左右滑动查看</span>
                  <span className="max-sm:hidden">
                    按 {saxType === 'alto' ? 'E♭ 中音' : 'B♭ 高音'}萨克斯移调记谱，视谱即吹 · 点击音符跳转
                  </span>
                </p>
              </div>
              <div className="shrink-0 text-xs text-muted-foreground sm:text-sm">
                第 <span className="font-mono font-semibold text-foreground">{currentNoteIndex + 1} / {currentScale.notes.length}</span> 音
              </div>
            </div>

            <SheetMusicView
              scale={currentScale}
              abcNotation={currentScale.abc}
              currentNoteIndex={currentNoteIndex}
              onNoteClick={handleSelectNoteIndex}
            />

            {/* 音名按钮：已练过的灰掉，当前音高亮，点击跳转 */}
            {/* 手机端隐藏以压低吸顶谱面的高度：谱上音符可直接点，上一个 / 下一个在底部控制条 */}
            <div className="-mx-1 hidden gap-1.5 px-1 sm:flex sm:flex-wrap">
              {currentScale.notes.map((n, idx) => (
                <Button
                  key={`${n}-${idx}`}
                  size="sm"
                  variant={idx === currentNoteIndex ? 'brand' : idx < currentNoteIndex ? 'secondary' : 'outline'}
                  aria-label={`跳转到 ${prettyNote(n)}`}
                  aria-current={idx === currentNoteIndex ? 'step' : undefined}
                  className={`min-w-12 shrink-0 font-mono font-medium ${idx === currentNoteIndex ? 'font-semibold' : ''} ${idx < currentNoteIndex ? 'text-muted-foreground' : ''}`}
                  onClick={() => handleSelectNoteIndex(idx)}
                >
                  {prettyNote(n)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/*
          主区：左栏（当前音符卡、节拍器 + 打卡）/ 右栏（指法图示）。
          DOM 顺序为 当前音符 → 指法图示 → 节拍器/打卡，手机单列时即设计稿顺序；
          lg 以上通过显式行列定位排成左右两栏，第二行用 1fr 吸收右栏多出的高度。
        */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
          {/* ===================== Current Note Card ===================== */}
          <Card className="gap-0 py-3 sm:py-6 lg:col-span-5 lg:col-start-1 lg:row-start-1">
            <CardContent className="space-y-3 px-4 sm:space-y-5 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-muted-foreground sm:text-[13px]">
                    当前音符<span className="lg:hidden"> · {currentNoteIndex + 1} / {currentScale.notes.length}</span>
                  </div>
                  <div className="mt-1 text-4xl leading-none font-semibold tracking-tighter sm:text-6xl">
                    {prettyNote(currentNoteName)}
                  </div>
                  <div className="mt-1 truncate text-sm text-muted-foreground sm:text-[15px]">{currentFingering.desc}</div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant="outline" className="h-6 rounded-full px-2.5">
                    <span className="size-1.5 rounded-full bg-success" />
                    实际发音 {soundingNote}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {soundingFreq} Hz · {transposeLabel}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 max-lg:hidden">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>音阶进度</span>
                  <span className="font-mono">
                    {currentNoteIndex + 1} / {currentScale.notes.length}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted lg:hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
              </div>

              <Separator className="max-lg:hidden" />

              {/* Active Keys Combinations */}
              <div className="space-y-2">
                <div className="flex items-center justify-between max-sm:hidden">
                  <span className="text-[13px] font-medium">按键组合</span>
                  <span className="text-xs text-muted-foreground">
                    {currentFingering.keys.length > 0 ? `${currentFingering.keys.length} 个按键闭合` : '全开音孔'}
                  </span>
                </div>
                <div data-keys-summary className="flex flex-wrap gap-1.5">
                  {currentFingering.keys.length === 0 ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      全开音孔（不按任何按键）
                    </Badge>
                  ) : (
                    currentFingering.keys.map((k) => (
                      <Badge key={k} variant="secondary" className="h-[26px] rounded-md px-2.5 text-xs">
                        <span className="size-2 rounded-full bg-brand" />
                        {KEY_NAME_MAP[k] || k}
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              {/* Step Navigation Controls（手机端改为底部固定控制栏） */}
              <div className="flex gap-2 max-lg:hidden">
                <Button variant="outline" size="icon" className="size-11" aria-label="上一个音" onClick={handlePrevNote}>
                  <SkipBack />
                </Button>
                <Button variant={isAutoPlaying ? 'destructive' : 'default'} className="h-11 flex-1" onClick={toggleAutoPlay}>
                  <DemoIcon className="fill-current" /> {demoLabel}
                </Button>
                <Button variant="outline" size="icon" className="size-11" aria-label="下一个音" onClick={handleNextNote}>
                  <SkipForward />
                </Button>
                <Button variant="outline" className="h-11" onClick={playCurrentNote}>
                  <Volume2 /> 试听
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ===================== Fingering Diagram Card ===================== */}
          <Card className="py-4 sm:py-5 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
            <CardContent className="flex flex-col items-center justify-center px-3 sm:px-6">
              <SaxophoneDiagram activeKeys={currentFingering.keys} saxType={saxType} />
            </CardContent>
          </Card>

          {/* ===================== Metronome & Streak ===================== */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:col-span-5 lg:col-start-1 lg:row-start-2">
            <Metronome onTick={playClick} />
            <StreakCard />
          </div>
        </div>

        {/* ===================== Practice Tips ===================== */}
        <PracticeTipsCard scaleName={currentScale.name} scaleTip={currentScale.tip} />

        <footer className="flex flex-wrap justify-between gap-2 border-t py-6 text-xs text-muted-foreground">
          <span>Saxophone Daily · 中音 (E♭) 与高音 (B♭) 萨克斯</span>
          <span>坚持练习，音色自见</span>
        </footer>
      </main>

      {/* ===================== Mobile Bottom Control Bar ===================== */}
      <nav
        data-fit-reserve="bottom"
        aria-label="演奏控制"
        className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t bg-background/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur lg:hidden"
      >
        <Button variant="outline" size="icon" className="size-11" aria-label="上一个音" onClick={handlePrevNote}>
          <SkipBack />
        </Button>
        <Button
          variant={isAutoPlaying ? 'destructive' : 'default'}
          className="h-11 flex-1 font-semibold"
          onClick={toggleAutoPlay}
        >
          <DemoIcon className="fill-current" /> {isAutoPlaying ? '停止演示' : '慢速演示'}
        </Button>
        <Button variant="outline" size="icon" className="size-11" aria-label="试听当前音" onClick={playCurrentNote}>
          <Volume2 />
        </Button>
        <Button variant="outline" size="icon" className="size-11" aria-label="下一个音" onClick={handleNextNote}>
          <SkipForward />
        </Button>
      </nav>
    </div>
  );
}

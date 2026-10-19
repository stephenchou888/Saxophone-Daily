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
  Smartphone,
  Monitor,
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
    <div className="min-h-screen bg-background text-foreground py-6 sm:py-10 px-3 sm:px-6 touch-manipulation pb-safe">
      <div className="max-w-[1560px] mx-auto space-y-6">
        {/* ===================== Header ===================== */}
        <header className="space-y-3 text-center">
          <div className="mb-1 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="soft" className="uppercase tracking-wider">
              <Sparkles /> Saxophone Daily · 专业萨克斯基本功研习
            </Badge>
            <Badge variant="secondary" className="hidden text-muted-foreground sm:inline-flex">
              <Monitor className="text-sky-400" />
              <Smartphone className="text-success" />
              PC · 手机 (Android / iOS) 全端全屏深度兼容
            </Badge>
          </div>

          <h1 className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-3xl font-black tracking-tight text-transparent drop-shadow-sm sm:text-5xl lg:text-6xl">
            🎷 Saxophone Daily
          </h1>
          <p className="mx-auto max-w-2xl text-xs font-medium text-muted-foreground sm:text-base">
            今日五线谱视奏 · 真实萨克斯实物图例指法同步 · 跨设备低延迟节拍辅助
          </p>
        </header>

        {/* ===================== Instrument Selector Card ===================== */}
        <Card className="gap-3 py-5 sm:py-6">
          <CardContent className="space-y-3 px-5 sm:px-6">
            <ToggleGroup
              type="single"
              variant="pill"
              value={saxType}
              onValueChange={(v) => v && setSaxType(v as SaxophoneType)}
              className="grid w-full grid-cols-1 sm:grid-cols-2"
            >
              <ToggleGroupItem value="alto" className="h-auto py-3 text-sm font-semibold sm:py-3.5 sm:text-base">
                中音萨克斯 (Eb Alto) · 弯管经典造型
                {saxType === 'alto' && <CheckCircle />}
              </ToggleGroupItem>
              <ToggleGroupItem value="soprano" className="h-auto py-3 text-sm font-semibold sm:py-3.5 sm:text-base">
                高音萨克斯 (Bb Soprano) · 直管通体造型
                {saxType === 'soprano' && <CheckCircle />}
              </ToggleGroupItem>
            </ToggleGroup>

            <p className="text-center text-xs leading-relaxed font-medium text-muted-foreground sm:text-sm">
              五线谱与指法按管乐通用本位移调记谱（视谱即吹），试听音频已自动匹配{' '}
              <span className="font-bold text-primary">
                {saxType === 'alto' ? 'Eb 中音调性（发音低大六度）' : 'Bb 高音调性（发音低大二度）'}
              </span>{' '}
              真实声学发音；萨克斯图例同步匹配该乐器真实外形！
            </p>
          </CardContent>
        </Card>

        {/* ===================== Sheet Music (Wide Full Width Display) ===================== */}
        <Card className="gap-4 py-4 sm:py-6">
          <CardContent className="space-y-4 px-4 sm:px-6">
            {/* Title Row with Scale Selector */}
            <div className="flex flex-col items-start justify-between gap-3 border-b pb-3 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Music2 className="size-5 text-primary" />
                  <h2 className="text-xl font-bold sm:text-2xl">今日主修：{scaleShortName(currentScale)}</h2>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium sm:text-sm">
                  <span className="inline-flex items-center gap-1 text-primary">
                    <Calendar className="size-3.5" />
                    {todayDateStr}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{currentScale.keySig}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-success">宽屏单行连续视奏已就绪</span>
                </div>
              </div>

              <div className="flex w-full items-center gap-2 sm:w-80">
                <span className="shrink-0 text-xs font-medium text-muted-foreground sm:text-sm">切换调性:</span>
                <Select value={currentScale.id} onValueChange={handleScaleChange}>
                  <SelectTrigger className="w-full min-w-0 font-semibold">
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

            <SheetMusicView
              scale={currentScale}
              abcNotation={currentScale.abc}
              currentNoteIndex={currentNoteIndex}
              onNoteClick={handleSelectNoteIndex}
            />
          </CardContent>
        </Card>

        {/* ===================== Dynamic Fingering & Instrument Section ===================== */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Left Column: Note Details, Controls, Metronome & Streak */}
          <div className="space-y-6 lg:col-span-5">
            {/* Note & Fingering Control Card */}
            <Card className="py-5 sm:py-6">
              <CardContent className="space-y-5 px-5 sm:px-6">
                <div className="flex flex-col items-start justify-between gap-4 rounded-xl border bg-muted/40 p-5 sm:flex-row sm:items-center">
                  <div>
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      当前音符 · Current Note
                    </span>
                    <div className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl">
                      {currentNoteName}
                    </div>
                    <div className="mt-1 text-lg font-bold sm:text-xl">{currentFingering.desc}</div>
                  </div>

                  <div className="space-y-2 text-left sm:text-right">
                    <Badge variant="success" className="px-3 py-1.5 text-xs sm:text-sm">
                      实际发音({saxType === 'alto' ? 'Eb' : 'Bb'}):
                      <span className="font-bold text-foreground">{soundingNote}</span>
                      <span className="opacity-80">({soundingFreq} Hz)</span>
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      第 <strong className="text-primary">{currentNoteIndex + 1}</strong> / {currentScale.notes.length} 音
                    </div>
                  </div>
                </div>

                {/* Active Keys Combinations */}
                <div className="space-y-1.5 rounded-xl border border-primary/30 bg-primary/10 p-4">
                  <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-primary uppercase">
                    <span>闭合按键组合说明</span>
                    <span className="text-[11px] font-normal text-muted-foreground normal-case">点击右侧萨克斯按键也可交互</span>
                  </div>
                  <div className="text-sm leading-relaxed font-bold text-primary sm:text-base">{activeKeysSummary}</div>
                </div>

                {/* Step Navigation Controls */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 sm:gap-3">
                  <Button variant="secondary" size="lg" onClick={handlePrevNote}>
                    <SkipBack /> 上一个音
                  </Button>

                  <Button variant={isAutoPlaying ? 'destructive' : 'success'} size="lg" className="font-bold" onClick={toggleAutoPlay}>
                    {isAutoPlaying ? (
                      <>
                        <Square className="fill-current" /> 停止演示
                      </>
                    ) : (
                      <>
                        <Play className="fill-current" /> 慢速指法演示
                      </>
                    )}
                  </Button>

                  <Button variant="secondary" size="lg" onClick={handleNextNote}>
                    下一个音 <SkipForward />
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="border-primary/40 bg-primary/15 text-primary hover:bg-primary/25 hover:text-primary dark:border-primary/40 dark:bg-primary/15 dark:hover:bg-primary/25"
                    onClick={playCurrentNote}
                  >
                    <Volume2 /> 发音试听
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Metronome & Streak */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Metronome onTick={playClick} />
              <StreakCard />
            </div>
          </div>

          {/* Right Column: Physical Saxophone Diagram Card */}
          <Card className="py-5 sm:py-6 lg:col-span-7">
            <CardContent className="flex flex-col items-center justify-center px-5 sm:px-6">
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
        </div>

        {/* ===================== Practice Tips Card ===================== */}
        <PracticeTipsCard scaleName={currentScale.name} scaleTip={currentScale.tip} />

        {/* Footer */}
        <footer className="border-t py-6 text-center text-xs text-muted-foreground">
          Saxophone Daily · 专为中音 (Eb) 与高音 (Bb) 萨克斯设计 · PC / 移动端全兼容 · 坚持练习，音色自见
        </footer>
      </div>
    </div>
  );
}

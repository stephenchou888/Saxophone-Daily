import { useState, useEffect, useCallback, useRef } from 'react';
import { SaxophoneType } from './types/music';
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
  ChevronDown,
  Check,
} from 'lucide-react';

export default function App() {
  const [saxType, setSaxType] = useState<SaxophoneType>('alto');
  const [currentScale, setCurrentScale] = useState(SCALES[0]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [todayDateStr, setTodayDateStr] = useState<string>('');
  const [isScaleDropdownOpen, setIsScaleDropdownOpen] = useState<boolean>(false);

  const autoPlayTimerRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsScaleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      setIsScaleDropdownOpen(false);
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
        <header className="text-center space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-1">
            <span className="shadcn-badge bg-primary/10 border-primary/25 text-primary uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Saxophone Daily · 专业萨克斯基本功研习
            </span>
            <span className="hidden sm:inline-flex shadcn-badge bg-secondary/80 text-muted-foreground shadow-xs">
              <Monitor className="w-3.5 h-3.5 text-sky-400 mr-1" />
              <Smartphone className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
              PC · 手机 (Android / iOS) 全端全屏深度兼容
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 drop-shadow-sm">
            🎷 Saxophone Daily
          </h1>
          <p className="text-muted-foreground text-xs sm:text-base max-w-2xl mx-auto font-medium">
            今日五线谱视奏 · 真实萨克斯实物图例指法同步 · 跨设备低延迟节拍辅助
          </p>
        </header>

        {/* ===================== Instrument Selector Card ===================== */}
        <div className="shadcn-card p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <button
              onClick={() => setSaxType('alto')}
              className={`py-3.5 sm:py-4 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer ${
                saxType === 'alto'
                  ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/40 font-bold'
                  : 'bg-secondary/70 text-secondary-foreground hover:bg-secondary border border-border/80'
              }`}
            >
              <span>中音萨克斯 (Eb Alto) · 弯管经典造型</span>
              {saxType === 'alto' && <CheckCircle className="w-4 h-4 text-primary-foreground" />}
            </button>

            <button
              onClick={() => setSaxType('soprano')}
              className={`py-3.5 sm:py-4 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer ${
                saxType === 'soprano'
                  ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/40 font-bold'
                  : 'bg-secondary/70 text-secondary-foreground hover:bg-secondary border border-border/80'
              }`}
            >
              <span>高音萨克斯 (Bb Soprano) · 直管通体造型</span>
              {saxType === 'soprano' && <CheckCircle className="w-4 h-4 text-primary-foreground" />}
            </button>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed font-medium">
            五线谱与指法按管乐通用本位移调记谱（视谱即吹），试听音频已自动匹配{' '}
            <span className="text-primary font-bold">
              {saxType === 'alto' ? 'Eb 中音调性（发音低大六度）' : 'Bb 高音调性（发音低大二度）'}
            </span>{' '}
            真实声学发音；萨克斯图例同步匹配该乐器真实外形！
          </p>
        </div>

        {/* ===================== Sheet Music (Wide Full Width Display) ===================== */}
        <div className="shadcn-card p-4 sm:p-6 space-y-4">
          {/* Title Row with Custom Shadcn Scale Selector Dropdown */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Music2 className="w-5 h-5 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  今日主修：{currentScale.name.split(' (')[0]}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-primary font-medium mt-1">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {todayDateStr}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{currentScale.keySig}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-emerald-400 font-medium">宽屏单行连续视奏已就绪</span>
              </div>
            </div>

            {/* Custom Shadcn Scale Selector Dropdown */}
            <div className="relative w-full sm:w-80" ref={dropdownRef}>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground font-medium shrink-0">
                  切换调性:
                </span>
                <button
                  onClick={() => setIsScaleDropdownOpen(!isScaleDropdownOpen)}
                  className="w-full flex items-center justify-between bg-card hover:bg-muted/60 border border-border text-foreground text-xs sm:text-sm font-semibold rounded-xl px-4 py-2.5 transition-all shadow-xs cursor-pointer"
                >
                  <span className="truncate">{currentScale.name.split(' (')[0]} ({currentScale.accidentals})</span>
                  <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-200 shrink-0 ml-2 ${isScaleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Dropdown Menu Panel - Solid opaque background to prevent transparency bleeding */}
              {isScaleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-full sm:w-96 max-h-[380px] overflow-y-auto rounded-xl border border-slate-700 bg-[#090d16] p-2 shadow-2xl z-50 space-y-3">
                  {/* Category 1: Special */}
                  <div>
                    <div className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> 萨克斯核心特训与特色音阶
                    </div>
                    <div className="space-y-0.5">
                      {SCALES.filter((s) => s.category === 'special').map((s) => {
                        const isSelected = s.id === currentScale.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => handleScaleChange(s.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                              isSelected ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            <span>{s.name.split(' (')[0]} <span className="opacity-75">({s.accidentals})</span></span>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category 2: Major */}
                  <div>
                    <div className="px-3 py-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 rounded-lg mb-1 flex items-center gap-1.5">
                      <Music2 className="w-3.5 h-3.5" /> 五度圈全部 12 个自然大调 (全套)
                    </div>
                    <div className="space-y-0.5">
                      {SCALES.filter((s) => s.category === 'major').map((s) => {
                        const isSelected = s.id === currentScale.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => handleScaleChange(s.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                              isSelected ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            <span>{s.name.split(' (')[0]} <span className="opacity-75">({s.accidentals})</span></span>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category 3: Minor */}
                  <div>
                    <div className="px-3 py-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 rounded-lg mb-1 flex items-center gap-1.5">
                      <Music2 className="w-3.5 h-3.5" /> 常用自然小调与关系小调
                    </div>
                    <div className="space-y-0.5">
                      {SCALES.filter((s) => s.category === 'minor').map((s) => {
                        const isSelected = s.id === currentScale.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => handleScaleChange(s.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                              isSelected ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            <span>{s.name.split(' (')[0]} <span className="opacity-75">({s.accidentals})</span></span>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category 4: Harmonic Minor */}
                  <div>
                    <div className="px-3 py-1.5 text-xs font-bold text-purple-400 bg-purple-500/10 rounded-lg mb-1 flex items-center gap-1.5">
                      <Music2 className="w-3.5 h-3.5" /> 萨克斯考级核心和声小调
                    </div>
                    <div className="space-y-0.5">
                      {SCALES.filter((s) => s.category === 'harmonic_minor').map((s) => {
                        const isSelected = s.id === currentScale.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => handleScaleChange(s.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                              isSelected ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            <span>{s.name.split(' (')[0]} <span className="opacity-75">({s.accidentals})</span></span>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <SheetMusicView
            scale={currentScale}
            abcNotation={currentScale.abc}
            currentNoteIndex={currentNoteIndex}
            onNoteClick={handleSelectNoteIndex}
          />
        </div>

        {/* ===================== Dynamic Fingering & Instrument Section ===================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Note Details, Controls, Metronome & Streak */}
          <div className="lg:col-span-5 space-y-6">
            {/* Note & Fingering Control Card */}
            <div className="shadcn-card p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/35 rounded-xl p-5 border border-border/80 shadow-xs">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    当前音符 · Current Note
                  </span>
                  <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 tracking-tight">
                    {currentNoteName}
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground mt-1">
                    {currentFingering.desc}
                  </div>
                </div>

                <div className="space-y-2 text-left sm:text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold">
                    <span>实际发音({saxType === 'alto' ? 'Eb' : 'Bb'}):</span>
                    <span className="text-white font-bold">{soundingNote}</span>
                    <span className="text-emerald-300/80">({soundingFreq} Hz)</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    第 <strong className="text-primary">{currentNoteIndex + 1}</strong> / {currentScale.notes.length} 音
                  </div>
                </div>
              </div>

              {/* Active Keys Combinations */}
              <div className="rounded-xl bg-primary/10 border border-primary/30 p-4 space-y-1.5 shadow-xs">
                <div className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center justify-between">
                  <span>闭合按键组合说明</span>
                  <span className="text-[11px] text-muted-foreground font-normal">点击右侧萨克斯按键也可交互</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-primary leading-relaxed">
                  {activeKeysSummary}
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap pt-1">
                <button
                  onClick={handlePrevNote}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold text-xs sm:text-sm transition-all duration-150 shadow-xs active:scale-95 cursor-pointer touch-manipulation min-h-[44px]"
                >
                  <SkipBack className="w-4 h-4" /> 上一个音
                </button>

                <button
                  onClick={toggleAutoPlay}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 shadow-sm active:scale-95 cursor-pointer touch-manipulation min-h-[44px] ${
                    isAutoPlaying
                      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  {isAutoPlaying ? (
                    <>
                      <Square className="w-4 h-4 fill-current" /> 停止演示
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" /> 慢速指法演示
                    </>
                  )}
                </button>

                <button
                  onClick={handleNextNote}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold text-xs sm:text-sm transition-all duration-150 shadow-xs active:scale-95 cursor-pointer touch-manipulation min-h-[44px]"
                >
                  下一个音 <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={playCurrentNote}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 font-semibold text-xs sm:text-sm transition-all duration-150 shadow-xs active:scale-95 cursor-pointer touch-manipulation min-h-[44px]"
                >
                  <Volume2 className="w-4 h-4" /> 发音试听
                </button>
              </div>
            </div>

            {/* Metronome & Streak */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Metronome onTick={playClick} />
              <StreakCard />
            </div>
          </div>

          {/* Right Column: Physical Saxophone Diagram Card */}
          <div className="lg:col-span-7 shadcn-card p-5 sm:p-6 flex flex-col items-center justify-center">
            <SaxophoneDiagram
              activeKeys={currentFingering.keys}
              saxType={saxType}
            />

            {/* Diagram Legend */}
            <div className="w-full text-xs text-muted-foreground space-y-2 mt-4 pt-3 border-t border-border/80">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-primary shadow-xs shrink-0" />
                <span>橙金高亮：闭合按键（手指需按严密封孔）</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-muted border border-border shrink-0" />
                <span>象牙白贝壳：开放按键（手指自然贴附微悬）</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== Practice Tips Card ===================== */}
        <PracticeTipsCard scaleName={currentScale.name} scaleTip={currentScale.tip} />

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground py-6 border-t border-border/80">
          Saxophone Daily · 专为中音 (Eb) 与高音 (Bb) 萨克斯设计 · PC / 移动端全兼容 · 坚持练习，音色自见
        </footer>
      </div>
    </div>
  );
}

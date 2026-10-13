import { useState, useEffect, useCallback, useRef } from 'react';
import { SaxophoneType } from './types/music';
import { SCALES, FINGERINGS, KEY_NAME_MAP } from './data/scales';
import { useSoundEngine } from './hooks/useSoundEngine';
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
  const semitoneShift = saxType === 'alto' ? -9 : -2;
  const soundingFreq = Math.round(currentFingering.freq * Math.pow(2, semitoneShift / 12));

  // Play current note sound
  const playCurrentNote = useCallback(() => {
    if (currentFingering) {
      playTone(currentFingering.freq, saxType, 0.45);
    }
  }, [currentFingering, playTone, saxType]);

  const handlePrevNote = useCallback(() => {
    setCurrentNoteIndex((prev) => {
      const nextIdx = prev > 0 ? prev - 1 : currentScale.notes.length - 1;
      const note = currentScale.notes[nextIdx];
      const fingering = FINGERINGS[note];
      if (fingering) playTone(fingering.freq, saxType, 0.45);
      return nextIdx;
    });
  }, [currentScale.notes, playTone, saxType]);

  const handleNextNote = useCallback(() => {
    setCurrentNoteIndex((prev) => {
      const nextIdx = prev < currentScale.notes.length - 1 ? prev + 1 : 0;
      const note = currentScale.notes[nextIdx];
      const fingering = FINGERINGS[note];
      if (fingering) playTone(fingering.freq, saxType, 0.45);
      return nextIdx;
    });
  }, [currentScale.notes, playTone, saxType]);

  const handleSelectNoteIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < currentScale.notes.length) {
        setCurrentNoteIndex(index);
        const note = currentScale.notes[index];
        const fingering = FINGERINGS[note];
        if (fingering) playTone(fingering.freq, saxType, 0.45);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-6 sm:py-8 px-3 sm:px-6 touch-manipulation pb-safe">
      {/* Expanded wide container up to 1440px for immersive desktop experience */}
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* ===================== Header ===================== */}
        <header className="text-center space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Saxophone Daily · 专业萨克斯基本功研习
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold">
              <Monitor className="w-3.5 h-3.5 text-sky-400" />
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              PC · 手机 (Android / iOS) 全端全屏深度兼容
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
            🎷 Saxophone Daily
          </h1>
          <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto">
            今日五线谱视奏 · 真实萨克斯实物图例指法同步 · 跨设备低延迟节拍辅助
          </p>
        </header>

        {/* ===================== Instrument Selector Card ===================== */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 backdrop-blur-md shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <button
              onClick={() => setSaxType('alto')}
              className={`py-3.5 sm:py-4 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer ${
                saxType === 'alto'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400 font-extrabold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
              }`}
            >
              <span>中音萨克斯 (Eb Alto) · 弯管经典造型</span>
              {saxType === 'alto' && <CheckCircle className="w-4 h-4 text-slate-950" />}
            </button>

            <button
              onClick={() => setSaxType('soprano')}
              className={`py-3.5 sm:py-4 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer ${
                saxType === 'soprano'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400 font-extrabold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
              }`}
            >
              <span>高音萨克斯 (Bb Soprano) · 直管通体造型</span>
              {saxType === 'soprano' && <CheckCircle className="w-4 h-4 text-slate-950" />}
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 text-center leading-relaxed">
            五线谱与指法按管乐通用本位移调记谱（视谱即吹），试听音频已自动匹配{' '}
            <span className="text-amber-300 font-bold">
              {saxType === 'alto' ? 'Eb 中音调性（发音低大六度）' : 'Bb 高音调性（发音低大二度）'}
            </span>{' '}
            真实声学发音；萨克斯图例同步匹配该乐器真实外形！
          </p>
        </div>

        {/* ===================== Sheet Music (Wide Full Width Display) ===================== */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 backdrop-blur-md shadow-xl space-y-4">
          {/* Title Row with Scale Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Music2 className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-100">
                  今日主修：{currentScale.name.split(' (')[0]}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-amber-400 font-semibold mt-1">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {todayDateStr}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">{currentScale.keySig}</span>
                <span className="text-slate-600">·</span>
                <span className="text-emerald-400 font-medium">宽屏单行连续视奏已就绪</span>
              </div>
            </div>

            {/* Scale Selector Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="scale-select" className="text-xs sm:text-sm text-slate-400 font-semibold shrink-0">
                切换调性:
              </label>
              <select
                id="scale-select"
                value={currentScale.id}
                onChange={(e) => handleScaleChange(e.target.value)}
                className="w-full sm:w-auto bg-slate-950 border border-slate-700 hover:border-amber-500/50 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-3.5 py-2.5 outline-none transition-colors"
              >
                {SCALES.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                    {s.name.split(' (')[0]} ({s.accidentals})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* High-fidelity Vector Sheet Music (Supports Wide Panoramic Mode) */}
          <SheetMusicView
            abcNotation={currentScale.abc}
            currentNoteIndex={currentNoteIndex}
            onNoteClick={handleSelectNoteIndex}
          />
        </div>

        {/* ===================== Dynamic Fingering & Instrument Section ===================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Note Details, Controls, Metronome & Streak (6 cols on Desktop) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Note & Fingering Control Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 backdrop-blur-md shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/80 rounded-2xl p-5 border border-slate-800/80">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    当前音符 · Current Note
                  </span>
                  <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 tracking-tight">
                    {currentNoteName}
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-200 mt-1">
                    {currentFingering.desc}
                  </div>
                </div>

                <div className="space-y-2 text-left sm:text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold">
                    <span>实际发音({saxType === 'alto' ? 'Eb' : 'Bb'}):</span>
                    <span>{soundingFreq} Hz</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    第 <strong className="text-amber-400">{currentNoteIndex + 1}</strong> / {currentScale.notes.length} 音
                  </div>
                </div>
              </div>

              {/* Active Keys Combinations */}
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 space-y-1.5">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center justify-between">
                  <span>闭合按键组合说明</span>
                  <span className="text-[11px] text-slate-400 font-normal">点击右侧萨克斯按键也可交互</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-amber-200 leading-relaxed">
                  {activeKeysSummary}
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap pt-1">
                <button
                  onClick={handlePrevNote}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm sm:text-base transition-all duration-150 shadow-md active:scale-95 cursor-pointer touch-manipulation min-h-[46px]"
                >
                  <SkipBack className="w-4 h-4" /> 上一个音
                </button>

                <button
                  onClick={toggleAutoPlay}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-extrabold text-sm sm:text-base transition-all duration-150 shadow-md active:scale-95 cursor-pointer touch-manipulation min-h-[46px] ${
                    isAutoPlaying
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
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
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm sm:text-base transition-all duration-150 shadow-md active:scale-95 cursor-pointer touch-manipulation min-h-[46px]"
                >
                  下一个音 <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={playCurrentNote}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-sm sm:text-base transition-all duration-150 shadow-md active:scale-95 cursor-pointer touch-manipulation min-h-[46px]"
                >
                  <Volume2 className="w-4 h-4" /> 发音试听
                </button>
              </div>
            </div>

            {/* Metronome & Streak (Stacked or 2-col) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Metronome onTick={playClick} />
              <StreakCard />
            </div>
          </div>

          {/* Right Column: Physical Saxophone Diagram Card (6 cols on Desktop) */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 backdrop-blur-md shadow-xl flex flex-col items-center justify-center">
            <SaxophoneDiagram
              activeKeys={currentFingering.keys}
              saxType={saxType}
            />

            {/* Diagram Legend */}
            <div className="w-full text-xs text-slate-400 space-y-2 mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] shrink-0" />
                <span>橙金高亮：闭合按键（手指需按严密封孔）</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-400 shrink-0" />
                <span>象牙白贝壳：开放按键（手指自然贴附微悬）</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== Practice Tips Card ===================== */}
        <PracticeTipsCard scaleName={currentScale.name} scaleTip={currentScale.tip} />

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 py-6 border-t border-slate-800/60">
          Saxophone Daily · 专为中音 (Eb) 与高音 (Bb) 萨克斯设计 · PC / 移动端全兼容 · 坚持练习，音色自见
        </footer>
      </div>
    </div>
  );
}

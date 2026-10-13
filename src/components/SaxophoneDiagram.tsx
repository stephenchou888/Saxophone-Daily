import React, { useState, useCallback } from 'react';
import { SaxophoneType } from '../types/music';
import {
  Camera,
  Sparkles,
  Layers,
  Sliders,
  Eye,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Music,
  Flame,
  Zap,
  Info,
} from 'lucide-react';
import {
  useSoundEngine,
  KEY_PITCH_MAP,
  SaxRegister,
  getSaxSoundingPitch,
} from '../hooks/useSoundEngine';

interface SaxophoneDiagramProps {
  activeKeys: string[];
  saxType: SaxophoneType;
  onKeyClick?: (keyId: string) => void;
}

export const SaxophoneDiagram: React.FC<SaxophoneDiagramProps> = ({
  activeKeys,
  saxType,
  onKeyClick,
}) => {
  // View mode: 'split' (实物与图例双屏对照), 'diagram' (大号指法图谱), 'photo' (真实实物写真)
  const [viewMode, setViewMode] = useState<'split' | 'diagram' | 'photo'>('split');
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1.35);

  // Sound Engine & Register Selector: 'low' (低音区), 'high' (高八度), 'altissimo' (超吹音区)
  const { playSaxKeyAction } = useSoundEngine();
  const [register, setRegister] = useState<SaxRegister>('low');
  const [soundMode, setSoundMode] = useState<'both' | 'tone' | 'click'>('both');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [lastPlayedKey, setLastPlayedKey] = useState<{
    id: string;
    label: string;
    register: SaxRegister;
    writtenFreq: number;
    writtenNote: string;
    concertNote: string;
    concertFreq: number;
  } | null>(null);

  const isKeyActive = (keyId: string) => activeKeys.includes(keyId);

  // Key Interaction with specific or current register
  const handleKeyInteraction = useCallback(
    (keyId: string, customRegister?: SaxRegister) => {
      // If pressing octave key, automatically preview high register
      let activeReg = customRegister || register;
      if (keyId === 'key_octave') {
        activeReg = register === 'low' ? 'high' : register;
      } else if (keyId === 'key_front_f') {
        activeReg = register === 'low' ? 'altissimo' : register;
      }

      const keyInfo = KEY_PITCH_MAP[keyId];
      let writtenFreq = 440;
      let writtenNote = 'A4';

      if (keyInfo) {
        if (activeReg === 'altissimo') {
          writtenFreq = keyInfo.altissimoFreq;
          writtenNote = keyInfo.writtenNoteAlt;
        } else if (activeReg === 'high') {
          writtenFreq = keyInfo.highFreq;
          writtenNote = keyInfo.writtenNoteHigh;
        } else {
          writtenFreq = keyInfo.lowFreq;
          writtenNote = keyInfo.writtenNoteLow;
        }
      }

      const { concertFreq, noteName: concertNote } = getSaxSoundingPitch(writtenFreq, saxType);

      setLastPlayedKey({
        id: keyId,
        label: keyInfo?.label || keyId,
        register: activeReg,
        writtenFreq: Math.round(writtenFreq),
        writtenNote,
        concertNote,
        concertFreq: Math.round(concertFreq),
      });

      if (!isMuted) {
        playSaxKeyAction(keyId, saxType, {
          soundMode,
          register: activeReg,
          customFreq: writtenFreq,
        });
      }

      onKeyClick?.(keyId);
    },
    [isMuted, onKeyClick, playSaxKeyAction, register, saxType, soundMode]
  );

  // Real instrument photo URLs
  const realPhotoSrc =
    saxType === 'alto'
      ? '/images/alto_saxophone_real.png'
      : '/images/soprano_saxophone_real.jpg';

  const realInstrumentTitle =
    saxType === 'alto'
      ? '经典降E中音萨克斯 (Eb Alto) 法国原厂实物写真'
      : '旗舰降B高音萨克斯 (Bb Soprano) 经典原厂实物写真';

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(1.85, +(prev + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(1.0, +(prev - 0.15).toFixed(2)));
  const handleResetZoom = () => setZoomLevel(1.35);

  // Grouped key definitions for the Interactive Keypad
  const rightHandKeys = [
    'key_rh1',
    'key_rh2',
    'key_rh3',
    'key_side_c',
    'key_side_bb',
    'key_high_fis',
    'key_rh_eb',
    'key_rh_c',
  ];

  const leftHandKeys = [
    'key_lh1',
    'key_lh2',
    'key_lh3',
    'key_lh_gis',
    'key_lh_cis',
    'key_lh_low_b',
    'key_lh_low_bb',
  ];

  const topAuxKeys = [
    'key_octave',
    'key_front_f',
    'key_palm_d',
    'key_palm_eb',
    'key_palm_f',
  ];

  return (
    <div className="flex flex-col items-center justify-center select-none w-full">
      {/* ===================== Top Controls & View Switcher ===================== */}
      <div className="flex flex-wrap items-center justify-between w-full px-1 mb-3.5 gap-2.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-black text-sm sm:text-base text-amber-300">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            {saxType === 'alto' ? '中音萨克斯 (Eb Alto · 降E调)' : '高音萨克斯 (Bb Soprano · 降B调)'}
          </span>
          <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold px-2 py-0.5 rounded-full">
            已放大 {Math.round(zoomLevel * 100)}%
          </span>
        </div>

        {/* View Mode & Zoom Preset Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
              title="缩小图例"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
              title="恢复推荐大小 (135%)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
              title="放大图例"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="实物照片与指法图并排对照"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>真琴与按键对照</span>
            </button>

            <button
              onClick={() => setViewMode('diagram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'diagram'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="超大号交互按键图谱"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>交互按键图</span>
            </button>

            <button
              onClick={() => setViewMode('photo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'photo'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="真实原琴超清写真"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>原琴写真</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================== 八度与超吹音区切换栏 (Dedicated Register Selector) ===================== */}
      <div className="w-full mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/35 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5 mr-1">
            <Music className="w-4 h-4 text-amber-400" />
            试听发音音区:
          </span>

          {/* Register Selector: Low, High Octave, Altissimo */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 font-bold">
            <button
              onClick={() => setRegister('low')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                register === 'low'
                  ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="标准基音音域 (低音 C4 到中音 C5)"
            >
              <span>低/中八度</span>
            </button>

            <button
              onClick={() => setRegister('high')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                register === 'high'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
              title="高八度音域 (八度高音键配合 D5 到 C6)"
            >
              <Zap className="w-3.5 h-3.5 text-amber-950 fill-current" />
              <span>高八度 (+8ve)</span>
            </button>

            <button
              onClick={() => setRegister('altissimo')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                register === 'altissimo'
                  ? 'bg-rose-500 text-white font-black shadow-md animate-pulse'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
              title="超吹音域 (Altissimo 裂帛超高音 D6 到 A6+)"
            >
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-current" />
              <span>超吹 (Altissimo)</span>
            </button>
          </div>
        </div>

        {/* Sound Feedback mode & Mute */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setSoundMode('both')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                soundMode === 'both' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="羊皮垫机械键音 + 萨克斯真声"
            >
              键音+乐音
            </button>
            <button
              onClick={() => setSoundMode('tone')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                soundMode === 'tone' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="仅萨克斯管乐音色"
            >
              仅乐音
            </button>
            <button
              onClick={() => setSoundMode('click')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                soundMode === 'click' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="仅机械按键皮革闭音"
            >
              仅机械声
            </button>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
            title="静音开关"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ===================== Real-time Sound & Pitch Feedback Banner ===================== */}
      <div className="w-full mb-3 px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {lastPlayedKey ? (
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[11px] text-amber-300">
                {lastPlayedKey.register === 'altissimo'
                  ? '🔥 超吹 Altissimo'
                  : lastPlayedKey.register === 'high'
                  ? '⚡ 高八度'
                  : '🎵 标准音区'}
              </span>
              <span className="text-white font-extrabold">{lastPlayedKey.label}</span>
              <span className="text-slate-400 text-[11px]">
                记谱音: <b className="text-amber-200">{lastPlayedKey.writtenNote}</b> ({lastPlayedKey.writtenFreq}Hz)
              </span>
              <span className="text-slate-300 text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                {saxType === 'alto' ? '中音实音 (Eb)' : '高音实音 (Bb)'}:{' '}
                <b className="text-emerald-400">{lastPlayedKey.concertNote}</b> ({lastPlayedKey.concertFreq}Hz)
              </span>
            </div>
          ) : (
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              点击右侧按键矩阵、SVG模型或实物照片任意按钮，即可即时发声并校对中音/高音真实音准与高八度/超吹音效
            </span>
          )}
        </div>
        <div className="text-[11px] text-amber-400/90 font-bold hidden md:block">
          乐器: {saxType === 'alto' ? '降E中音萨克斯 (Eb Alto)' : '降B高音萨克斯 (Bb Soprano)'}
        </div>
      </div>

      {/* ===================== Main Instrument Display Box ===================== */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch justify-center p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/90 shadow-2xl">
        {/* ==================== 1. 真实萨克斯实物写真展示区 ==================== */}
        {(viewMode === 'split' || viewMode === 'photo') && (
          <div
            className={`relative flex flex-col items-center justify-between rounded-2xl p-4 sm:p-6 bg-slate-950/95 border border-amber-500/25 shadow-2xl overflow-hidden ${
              viewMode === 'split' ? 'md:col-span-6' : 'md:col-span-12 w-full max-w-3xl mx-auto'
            }`}
          >
            <div className="w-full flex items-center justify-between mb-3 px-1 border-b border-slate-800/80 pb-2">
              <span className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-400" />
                真实乐器实拍照 ({saxType === 'alto' ? '经典弯管中音 Eb Alto' : '通体直管高音 Bb Soprano'})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAnnotations(!showAnnotations)}
                  className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  {showAnnotations ? '隐藏标记' : '显示标记'}
                </button>
              </div>
            </div>

            {/* Real Instrument Photo Container */}
            <div className="relative group flex items-center justify-center w-full min-h-[540px] sm:min-h-[660px] lg:min-h-[720px] py-4 overflow-hidden">
              <div className="absolute inset-0 bg-radial from-amber-500/20 via-amber-900/10 to-transparent pointer-events-none blur-3xl" />

              <div
                className="relative transition-transform duration-200 flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              >
                <img
                  src={realPhotoSrc}
                  alt={realInstrumentTitle}
                  referrerPolicy="no-referrer"
                  className="relative z-10 max-h-[600px] sm:max-h-[700px] lg:max-h-[740px] w-auto object-contain drop-shadow-[0_20px_45px_rgba(245,158,11,0.4)]"
                />

                {/* Hotspots for ALL Keys across Real Photo with high precision */}
                <div className="absolute inset-0 z-20 pointer-events-auto">
                  {/* Octave Key Hotspot (高八度试听) */}
                  <button
                    onClick={() => handleKeyInteraction('key_octave', 'high')}
                    className="absolute top-[8%] left-[45%] -translate-x-1/2 px-2.5 py-1 rounded-full bg-amber-500/50 hover:bg-amber-400 border border-amber-200 shadow-xl text-[10px] font-black text-slate-950 transition-all hover:scale-125 cursor-pointer flex items-center gap-1"
                    title="点击试听八度高音泛音孔音效"
                  >
                    <Zap className="w-3 h-3 fill-current text-amber-950" />
                    <span>8度泛音</span>
                  </button>

                  {/* Left Hand Palm Keys Hotspots (左手掌键群 D, Eb, F) */}
                  <button
                    onClick={() => handleKeyInteraction('key_palm_d', 'altissimo')}
                    className="absolute top-[16%] left-[34%] -translate-x-1/2 px-2 py-0.5 rounded-full bg-rose-500/60 hover:bg-rose-400 border border-rose-200 shadow-md text-[9px] font-bold text-white transition-all hover:scale-120 cursor-pointer"
                    title="左手掌键 D"
                  >
                    掌D
                  </button>
                  <button
                    onClick={() => handleKeyInteraction('key_palm_eb', 'altissimo')}
                    className="absolute top-[20%] left-[33%] -translate-x-1/2 px-2 py-0.5 rounded-full bg-rose-500/60 hover:bg-rose-400 border border-rose-200 shadow-md text-[9px] font-bold text-white transition-all hover:scale-120 cursor-pointer"
                    title="左手掌键 Eb"
                  >
                    掌Eb
                  </button>
                  <button
                    onClick={() => handleKeyInteraction('key_palm_f', 'altissimo')}
                    className="absolute top-[24%] left-[32%] -translate-x-1/2 px-2 py-0.5 rounded-full bg-rose-500/60 hover:bg-rose-400 border border-rose-200 shadow-md text-[9px] font-bold text-white transition-all hover:scale-120 cursor-pointer"
                    title="左手掌键 F"
                  >
                    掌F
                  </button>

                  {/* Front F / Altissimo Hotspot (超吹前F) */}
                  <button
                    onClick={() => handleKeyInteraction('key_front_f', 'altissimo')}
                    className="absolute top-[21%] left-[48%] -translate-x-1/2 px-2.5 py-1 rounded-full bg-rose-500/60 hover:bg-rose-500 border border-rose-300 shadow-xl text-[10px] font-black text-white transition-all hover:scale-125 cursor-pointer flex items-center gap-1 animate-pulse"
                    title="点击试听超吹前F叉键音效"
                  >
                    <Flame className="w-3 h-3 fill-current text-amber-300" />
                    <span>前F超吹</span>
                  </button>

                  {/* Left Hand Upper Keys Hotspots (1, 2, 3) */}
                  <button
                    onClick={() => handleKeyInteraction('key_lh1')}
                    className={`absolute top-[28%] left-[48%] -translate-x-1/2 px-2 py-0.5 rounded-full border shadow-lg text-[10px] font-bold transition-all hover:scale-115 cursor-pointer ${
                      isKeyActive('key_lh1')
                        ? 'bg-amber-400 text-slate-950 border-white'
                        : 'bg-sky-500/40 hover:bg-sky-400 text-sky-100 border-sky-300'
                    }`}
                  >
                    1(B)
                  </button>
                  <button
                    onClick={() => handleKeyInteraction('key_lh2')}
                    className={`absolute top-[35%] left-[48%] -translate-x-1/2 px-2 py-0.5 rounded-full border shadow-lg text-[10px] font-bold transition-all hover:scale-115 cursor-pointer ${
                      isKeyActive('key_lh2')
                        ? 'bg-amber-400 text-slate-950 border-white'
                        : 'bg-sky-500/40 hover:bg-sky-400 text-sky-100 border-sky-300'
                    }`}
                  >
                    2(A)
                  </button>
                  <button
                    onClick={() => handleKeyInteraction('key_lh3')}
                    className={`absolute top-[42%] left-[48%] -translate-x-1/2 px-2 py-0.5 rounded-full border shadow-lg text-[10px] font-bold transition-all hover:scale-115 cursor-pointer ${
                      isKeyActive('key_lh3')
                        ? 'bg-amber-400 text-slate-950 border-white'
                        : 'bg-sky-500/40 hover:bg-sky-400 text-sky-100 border-sky-300'
                    }`}
                  >
                    3(G)
                  </button>

                  {/* Right Hand Side Keys Hotspots (右手侧键群：侧C、侧Bb、高F#) */}
                  <button
                    onClick={() => handleKeyInteraction('key_side_c')}
                    className="absolute top-[32%] left-[64%] -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500/50 hover:bg-amber-400 border border-amber-300 shadow-md text-[9px] font-bold text-slate-950 transition-all hover:scale-120 cursor-pointer"
                    title="右手侧C键"
                  >
                    侧C
                  </button>
                  <button
                    onClick={() => handleKeyInteraction('key_side_bb')}
                    className="absolute top-[37%] left-[65%] -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500/50 hover:bg-amber-400 border border-amber-300 shadow-md text-[9px] font-bold text-slate-950 transition-all hover:scale-120 cursor-pointer"
                    title="右手侧Bb键"
                  >
                    侧Bb
                  </button>
                  <button
                    onClick={() => handleKeyInteraction('key_high_fis', 'altissimo')}
                    className="absolute top-[42%] left-[66%] -translate-x-1/2 px-2 py-0.5 rounded-full bg-rose-500/60 hover:bg-rose-400 border border-rose-300 shadow-md text-[9px] font-bold text-white transition-all hover:scale-120 cursor-pointer"
                    title="右手高音F#键"
                  >
                    高F#
                  </button>

                  {/* Left Hand Spatula Keys (G#, C#, B, Bb) */}
                  <button
                    onClick={() => handleKeyInteraction('key_lh_gis')}
                    className="absolute top-[40%] left-[34%] -translate-x-1/2 px-2 py-0.5 rounded-full bg-indigo-500/50 hover:bg-indigo-400 border border-indigo-300 shadow-md text-[9px] font-bold text-indigo-100 transition-all hover:scale-120 cursor-pointer"
                  >
                    G#
                  </button>
                  <button
                    onClick={() => handleKeyInteraction('key_lh_low_b')}
                    className="absolute top-[45%] left-[33%] -translate-x-1/2 px-2 py-0.5 rounded-full bg-indigo-500/50 hover:bg-indigo-400 border border-indigo-300 shadow-md text-[9px] font-bold text-indigo-100 transition-all hover:scale-120 cursor-pointer"
                  >
                    低音B
                  </button>

                  {/* Right Hand Lower Keys Hotspots (右手主键：4, 5, 6) */}
                  <button
                    onClick={() => handleKeyInteraction('key_rh1')}
                    className={`absolute top-[52%] left-[48%] -translate-x-1/2 px-2 py-0.5 rounded-full border shadow-lg text-[10px] font-bold transition-all hover:scale-115 cursor-pointer ${
                      isKeyActive('key_rh1')
                        ? 'bg-amber-400 text-slate-950 border-white'
                        : 'bg-emerald-500/40 hover:bg-emerald-400 text-emerald-100 border-emerald-300'
                    }`}
                  >
                    4(F)
                  </button>
                  <button
                    onClick={() => handleKeyInteraction('key_rh2')}
                    className={`absolute top-[59%] left-[48%] -translate-x-1/2 px-2 py-0.5 rounded-full border shadow-lg text-[10px] font-bold transition-all hover:scale-115 cursor-pointer ${
                      isKeyActive('key_rh2')
                        ? 'bg-amber-400 text-slate-950 border-white'
                        : 'bg-emerald-500/40 hover:bg-emerald-400 text-emerald-100 border-emerald-300'
                    }`}
                  >
                    5(E)
                  </button>
                  <button
                    onClick={() => handleKeyInteraction('key_rh3')}
                    className={`absolute top-[66%] left-[48%] -translate-x-1/2 px-2 py-0.5 rounded-full border shadow-lg text-[10px] font-bold transition-all hover:scale-115 cursor-pointer ${
                      isKeyActive('key_rh3')
                        ? 'bg-amber-400 text-slate-950 border-white'
                        : 'bg-emerald-500/40 hover:bg-emerald-400 text-emerald-100 border-emerald-300'
                    }`}
                  >
                    6(D)
                  </button>

                  {/* Low Pinky Table (Eb/C) Hotspot */}
                  <button
                    onClick={() => handleKeyInteraction('key_rh_eb')}
                    className="absolute top-[71%] left-[58%] -translate-x-1/2 px-2 py-0.5 rounded-full bg-rose-500/50 hover:bg-rose-400 border border-rose-300 shadow-md text-[9px] font-bold text-white transition-all hover:scale-120 cursor-pointer"
                    title="右手低音Eb滚轮"
                  >
                    Eb
                  </button>
                  <button
                    onClick={() => handleKeyInteraction('key_rh_c')}
                    className="absolute top-[76%] left-[58%] -translate-x-1/2 px-2.5 py-1 rounded-full bg-rose-500/50 hover:bg-rose-400 border border-rose-300 shadow-lg text-[10px] font-bold text-rose-100 transition-all hover:scale-115 cursor-pointer"
                    title="右手低音C键"
                  >
                    低音C
                  </button>
                </div>
              </div>

              {/* Anatomy Labels */}
              {showAnnotations && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-6 px-2 sm:px-4 z-10">
                  <div className="flex justify-between items-start">
                    <span className="bg-slate-900/90 text-amber-300 border border-amber-500/40 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm">
                      ① 泛音弯颈 / 八度音孔
                    </span>
                    <span className="bg-slate-900/90 text-rose-300 border border-rose-500/40 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm">
                      🔥 超吹前F键 / 掌键区
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="bg-slate-900/90 text-indigo-300 border border-indigo-500/40 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-lg backdrop-blur-sm">
                      左手小指变音台 (G#/C#/B/Bb)
                    </span>
                    <span className="bg-slate-900/90 text-amber-300 border border-amber-500/40 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-lg backdrop-blur-sm">
                      右手高音侧键 (侧C/侧Bb/高F#)
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="bg-slate-900/90 text-emerald-300 border border-emerald-500/40 text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-lg backdrop-blur-sm">
                      ③ 右手下把位 (4·5·6孔)
                    </span>
                    <span className="bg-slate-900/90 text-amber-400 border border-amber-500/50 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm">
                      ④ 法式金光喇叭口 (Bell)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <p className="text-xs text-amber-300 font-semibold mb-0.5">
                真实乐器真琴图例（高光黄铜与天然珍珠贝壳键位 · 仿参考图实物）
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                原琴实物拍摄，可清晰看清琴身弧度、音孔间距、连杆轴组与喇叭口雕花。点击上方热点可体验低音、高八度与超吹发声。
              </p>
            </div>
          </div>
        )}

        {/* ==================== 2. 高精交互指法键位图 (严格对照用户参考照片设计) ==================== */}
        {(viewMode === 'split' || viewMode === 'diagram') && (
          <div
            className={`flex flex-col items-center justify-between rounded-2xl p-4 sm:p-6 bg-slate-950/95 border border-slate-800/90 shadow-2xl ${
              viewMode === 'split' ? 'md:col-span-6' : 'md:col-span-12 w-full max-w-3xl mx-auto'
            }`}
          >
            <div className="w-full flex items-center justify-between mb-3 px-1 border-b border-slate-800/80 pb-2">
              <span className="font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                高精交互指法图（包含掌键、前F超吹键与高八度键）
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded font-bold">
                  含超吹键位
                </span>
                <span className="text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                  含8度键位
                </span>
              </div>
            </div>

            {/* 大号超清 SVG 萨克斯模型 */}
            <div className="w-full flex items-center justify-center p-2 overflow-hidden min-h-[540px] sm:min-h-[660px] lg:min-h-[720px]">
              <div
                className="w-full flex items-center justify-center transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center top' }}
              >
                <svg
                  width="540"
                  height="780"
                  viewBox="0 0 320 460"
                  className="w-full max-w-[500px] sm:max-w-[560px] h-auto drop-shadow-[0_18px_40px_rgba(0,0,0,0.95)] transition-all duration-300 touch-manipulation cursor-pointer"
                >
                  <defs>
                    {/* 参考图 1/2 真实的金色高光漆面材质渐变 */}
                    <linearGradient id="photoSaxBrassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#713f12" />
                      <stop offset="12%" stopColor="#b45309" />
                      <stop offset="30%" stopColor="#f59e0b" />
                      <stop offset="48%" stopColor="#fef08a" />
                      <stop offset="56%" stopColor="#ffffff" />
                      <stop offset="68%" stopColor="#fbbf24" />
                      <stop offset="86%" stopColor="#b45309" />
                      <stop offset="100%" stopColor="#713f12" />
                    </linearGradient>

                    {/* 参考图喇叭口立体金光渐变 */}
                    <linearGradient id="photoBellGrad" x1="0%" y1="100%" x2="90%" y2="0%">
                      <stop offset="0%" stopColor="#713f12" />
                      <stop offset="20%" stopColor="#b45309" />
                      <stop offset="42%" stopColor="#fbbf24" />
                      <stop offset="58%" stopColor="#fef08a" />
                      <stop offset="78%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#78350f" />
                    </linearGradient>

                    {/* 喇叭口内部黑金声学共鸣阴影 */}
                    <radialGradient id="photoBellInner" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#090d16" />
                      <stop offset="50%" stopColor="#2e1065" />
                      <stop offset="75%" stopColor="#451a03" />
                      <stop offset="100%" stopColor="#78350f" />
                    </radialGradient>

                    {/* 白珍珠母贝按键渐变 */}
                    <linearGradient id="photoPearlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="40%" stopColor="#f8fafc" />
                      <stop offset="80%" stopColor="#e2e8f0" />
                      <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>

                    {/* 闭合按下时橙金色辉光渐变 */}
                    <linearGradient id="photoActiveKeyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="35%" stopColor="#fbbf24" />
                      <stop offset="70%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>

                    {/* 超吹专用火焰紫金渐变 */}
                    <linearGradient id="photoAltissimoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fde047" />
                      <stop offset="40%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                  </defs>

                  {/* ===================== 萨克斯管体绘制 ===================== */}
                  {saxType === 'alto' ? (
                    /* 中音萨克斯 (Eb Alto) - 弯管曲颈造型 (如同用户参考图 1) */
                    <g id="alto_mimic_body">
                      {/* 笛头与金色双圈卡子 */}
                      <polygon points="102,10 126,10 124,38 104,38" fill="#0f172a" stroke="#020617" strokeWidth="1.4" />
                      <rect x="103" y="18" width="22" height="6" rx="1.5" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
                      <rect x="103" y="27" width="22" height="6" rx="1.5" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
                      {/* 软木节 */}
                      <rect x="106" y="38" width="16" height="11" fill="#d97706" stroke="#b45309" strokeWidth="0.8" />

                      {/* 弯曲脖管 */}
                      <path d="M 114,49 C 114,68 122,76 132,88" fill="none" stroke="url(#photoSaxBrassGrad)" strokeWidth="15" strokeLinecap="round" />
                      {/* 脖管八度音孔与连杆杠杆 */}
                      <path d="M 107,59 Q 116,54 125,64" fill="none" stroke="#fef08a" strokeWidth="2.8" />
                      <circle cx="109" cy="59" r="3.2" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />

                      {/* 颈节连接环 */}
                      <rect x="116" y="88" width="32" height="7" rx="2" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />

                      {/* 主管身锥形铜管 */}
                      <polygon points="118,92 146,92 157,352 110,352" fill="url(#photoSaxBrassGrad)" />

                      {/* U型底弯管 (Bow) */}
                      <path
                        d="M 110,352 C 107,398 126,436 168,436 C 212,436 236,400 246,342 C 255,296 270,260 290,242 C 276,312 244,442 168,442 C 102,442 95,386 100,352 Z"
                        fill="url(#photoBellGrad)"
                      />

                      {/* 大喇叭口 (Flared Bell) */}
                      <ellipse
                        cx="270"
                        cy="248"
                        rx="28"
                        ry="42"
                        transform="rotate(-26 270 248)"
                        fill="url(#photoBellInner)"
                        stroke="#fef08a"
                        strokeWidth="3.2"
                      />
                      <ellipse
                        cx="270"
                        cy="248"
                        rx="24"
                        ry="37"
                        transform="rotate(-26 270 248)"
                        fill="none"
                        stroke="#eab308"
                        strokeWidth="1.6"
                        strokeDasharray="4 2"
                      />

                      {/* 喇叭口低音金属护架 */}
                      <path d="M 218,362 L 244,380 L 256,354" fill="none" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="238" cy="372" r="9.5" fill="#78350f" stroke="#eab308" strokeWidth="2" />
                    </g>
                  ) : (
                    /* 高音萨克斯 (Bb Soprano) - 直管锥形造型 (如同用户参考图 2) */
                    <g id="soprano_mimic_body">
                      {/* 笛头与金色卡子 */}
                      <polygon points="120,10 142,10 140,38 122,38" fill="#0f172a" stroke="#020617" strokeWidth="1.4" />
                      <rect x="121" y="18" width="20" height="6" rx="1.5" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
                      <rect x="121" y="27" width="20" height="6" rx="1.5" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
                      <rect x="123" y="38" width="16" height="11" fill="#d97706" />

                      {/* 直管颈节 */}
                      <rect x="121" y="49" width="20" height="40" fill="url(#photoSaxBrassGrad)" />
                      <rect x="119" y="87" width="24" height="6.5" rx="2" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />

                      {/* 细长直管身锥体 */}
                      <polygon points="120,92 142,92 154,388 108,388" fill="url(#photoSaxBrassGrad)" />

                      {/* 直管正向喇叭钟口 */}
                      <polygon points="108,388 154,388 168,438 94,438" fill="url(#photoBellGrad)" />
                      <ellipse cx="131" cy="438" rx="37" ry="15" fill="url(#photoBellInner)" stroke="#fef08a" strokeWidth="3.2" />

                      {/* 闪亮高光星芒 */}
                      <path d="M 158,426 L 164,426 M 161,423 L 161,429" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                    </g>
                  )}

                  {/* 镀镍不锈钢连杆轴柱 */}
                  <line x1="113" y1="94" x2="108" y2="348" stroke="#713f12" strokeWidth="2.8" />
                  <line x1="150" y1="94" x2="157" y2="348" stroke="#713f12" strokeWidth="2.8" />

                  {/* ===================== 超高音区掌键群 (Left Hand Palm Keys: D, Eb, F) ===================== */}
                  {/* Palm D Key */}
                  <rect
                    id="key_palm_d"
                    x="86"
                    y="76"
                    width="14"
                    height="17"
                    rx="3"
                    onClick={() => handleKeyInteraction('key_palm_d', 'altissimo')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_palm_d')
                        ? 'fill-[url(#photoAltissimoGrad)] stroke-white stroke-[2.4] drop-shadow-[0_0_10px_#f43f5e]'
                        : 'fill-slate-800 stroke-amber-600 stroke-[1.4] hover:stroke-rose-400'
                    }`}
                  />
                  <text x="93" y="88" fontSize="8" fontWeight="900" textAnchor="middle" pointerEvents="none" fill={isKeyActive('key_palm_d') ? '#ffffff' : '#cbd5e1'}>
                    掌D
                  </text>

                  {/* Palm Eb Key */}
                  <rect
                    id="key_palm_eb"
                    x="86"
                    y="96"
                    width="14"
                    height="17"
                    rx="3"
                    onClick={() => handleKeyInteraction('key_palm_eb', 'altissimo')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_palm_eb')
                        ? 'fill-[url(#photoAltissimoGrad)] stroke-white stroke-[2.4] drop-shadow-[0_0_10px_#f43f5e]'
                        : 'fill-slate-800 stroke-amber-600 stroke-[1.4] hover:stroke-rose-400'
                    }`}
                  />
                  <text x="93" y="108" fontSize="8" fontWeight="900" textAnchor="middle" pointerEvents="none" fill={isKeyActive('key_palm_eb') ? '#ffffff' : '#cbd5e1'}>
                    掌Eb
                  </text>

                  {/* Palm F Key */}
                  <rect
                    id="key_palm_f"
                    x="86"
                    y="116"
                    width="14"
                    height="17"
                    rx="3"
                    onClick={() => handleKeyInteraction('key_palm_f', 'altissimo')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_palm_f')
                        ? 'fill-[url(#photoAltissimoGrad)] stroke-white stroke-[2.4] drop-shadow-[0_0_10px_#f43f5e]'
                        : 'fill-slate-800 stroke-amber-600 stroke-[1.4] hover:stroke-rose-400'
                    }`}
                  />
                  <text x="93" y="128" fontSize="8" fontWeight="900" textAnchor="middle" pointerEvents="none" fill={isKeyActive('key_palm_f') ? '#ffffff' : '#cbd5e1'}>
                    掌F
                  </text>

                  {/* ===================== 超吹关键核心键：前高音F叉键 (Front F Key) ===================== */}
                  <polygon
                    id="key_front_f"
                    points="132,92 138,102 126,102"
                    onClick={() => handleKeyInteraction('key_front_f', 'altissimo')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_front_f')
                        ? 'fill-[url(#photoAltissimoGrad)] stroke-white stroke-[2.4] drop-shadow-[0_0_12px_#f43f5e]'
                        : 'fill-rose-700 stroke-amber-400 stroke-[1.6] hover:fill-rose-500'
                    }`}
                  />
                  <text x="132" y="100" fontSize="7.5" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#ffffff">
                    前F
                  </text>

                  {/* ===================== 八度高音键 (Octave Key) - 拇指按压 ===================== */}
                  <rect x="68" y="98" width="12" height="24" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
                  <rect
                    id="key_octave"
                    x="65"
                    y="68"
                    width="21"
                    height="26"
                    rx="6.5"
                    onClick={() => handleKeyInteraction('key_octave', 'high')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_octave')
                        ? 'fill-[url(#photoActiveKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_14px_#f59e0b]'
                        : 'fill-slate-800 stroke-amber-700 stroke-[1.8] hover:stroke-amber-400 hover:scale-105'
                    }`}
                  />
                  <text
                    x="75.5"
                    y="84"
                    fontSize="9.5"
                    fontWeight="900"
                    textAnchor="middle"
                    pointerEvents="none"
                    fill={isKeyActive('key_octave') ? '#ffffff' : '#f59e0b'}
                  >
                    8(八度)
                  </text>

                  {/* ===================== 左手主音孔 (LH Stack: 1·2·3) ===================== */}
                  {/* 1号键：左手食指 (B) */}
                  <circle
                    id="key_lh1"
                    cx="132"
                    cy="119"
                    r="12.5"
                    onClick={() => handleKeyInteraction('key_lh1')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_lh1')
                        ? 'fill-[url(#photoActiveKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                        : 'fill-[url(#photoPearlGrad)] stroke-amber-600 stroke-[2] hover:stroke-amber-400 hover:scale-105'
                    }`}
                  />
                  <text
                    x="132"
                    y="123"
                    fontSize="11"
                    fontWeight="900"
                    textAnchor="middle"
                    pointerEvents="none"
                    fill={isKeyActive('key_lh1') ? '#ffffff' : '#1e293b'}
                  >
                    1(B)
                  </text>

                  {/* Bis 降B辅助键 (Bis Key) */}
                  <circle cx="132" cy="138" r="5" fill="#e2e8f0" stroke="#ca8a04" strokeWidth="1.2" />

                  {/* 2号键：左手中指 (A) */}
                  <circle
                    id="key_lh2"
                    cx="132"
                    cy="156"
                    r="12.5"
                    onClick={() => handleKeyInteraction('key_lh2')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_lh2')
                        ? 'fill-[url(#photoActiveKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                        : 'fill-[url(#photoPearlGrad)] stroke-amber-600 stroke-[2] hover:stroke-amber-400 hover:scale-105'
                    }`}
                  />
                  <text
                    x="132"
                    y="160"
                    fontSize="11"
                    fontWeight="900"
                    textAnchor="middle"
                    pointerEvents="none"
                    fill={isKeyActive('key_lh2') ? '#ffffff' : '#1e293b'}
                  >
                    2(A)
                  </text>

                  {/* 3号键：左手无名指 (G) */}
                  <circle
                    id="key_lh3"
                    cx="132"
                    cy="187"
                    r="12.5"
                    onClick={() => handleKeyInteraction('key_lh3')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_lh3')
                        ? 'fill-[url(#photoActiveKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                        : 'fill-[url(#photoPearlGrad)] stroke-amber-600 stroke-[2] hover:stroke-amber-400 hover:scale-105'
                    }`}
                  />
                  <text
                    x="132"
                    y="191"
                    fontSize="11"
                    fontWeight="900"
                    textAnchor="middle"
                    pointerEvents="none"
                    fill={isKeyActive('key_lh3') ? '#ffffff' : '#1e293b'}
                  >
                    3(G)
                  </text>

                  {/* ===================== 右手高音侧键群 (Side Keys: C, Bb, High F#) ===================== */}
                  {/* Side C Key */}
                  <rect
                    id="key_side_c"
                    x="154"
                    y="142"
                    width="13"
                    height="18"
                    rx="3"
                    onClick={() => handleKeyInteraction('key_side_c')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_side_c')
                        ? 'fill-[url(#photoActiveKeyGrad)] stroke-white stroke-[2.4] drop-shadow-[0_0_10px_#f59e0b]'
                        : 'fill-slate-800 stroke-amber-600 stroke-[1.4] hover:stroke-amber-400'
                    }`}
                  />
                  <text x="160.5" y="154.5" fontSize="7.5" fontWeight="900" textAnchor="middle" pointerEvents="none" fill={isKeyActive('key_side_c') ? '#ffffff' : '#cbd5e1'}>
                    侧C
                  </text>

                  {/* Side Bb Key */}
                  <rect
                    id="key_side_bb"
                    x="154"
                    y="164"
                    width="13"
                    height="18"
                    rx="3"
                    onClick={() => handleKeyInteraction('key_side_bb')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_side_bb')
                        ? 'fill-[url(#photoActiveKeyGrad)] stroke-white stroke-[2.4] drop-shadow-[0_0_10px_#f59e0b]'
                        : 'fill-slate-800 stroke-amber-600 stroke-[1.4] hover:stroke-amber-400'
                    }`}
                  />
                  <text x="160.5" y="176.5" fontSize="7" fontWeight="900" textAnchor="middle" pointerEvents="none" fill={isKeyActive('key_side_bb') ? '#ffffff' : '#cbd5e1'}>
                    侧Bb
                  </text>

                  {/* High F# Key */}
                  <rect
                    id="key_high_fis"
                    x="154"
                    y="186"
                    width="13"
                    height="18"
                    rx="3"
                    onClick={() => handleKeyInteraction('key_high_fis', 'altissimo')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_high_fis')
                        ? 'fill-[url(#photoAltissimoGrad)] stroke-white stroke-[2.4] drop-shadow-[0_0_10px_#f43f5e]'
                        : 'fill-slate-800 stroke-amber-600 stroke-[1.4] hover:stroke-rose-400'
                    }`}
                  />
                  <text x="160.5" y="198" fontSize="7" fontWeight="900" textAnchor="middle" pointerEvents="none" fill={isKeyActive('key_high_fis') ? '#ffffff' : '#cbd5e1'}>
                    高F#
                  </text>

                  {/* ===================== 左手小指变音键群 (Spatula Table) ===================== */}
                  {/* G# 侧翘板键 */}
                  <rect
                    id="key_lh_gis"
                    x="84"
                    y="175"
                    width="26"
                    height="16"
                    rx="3.5"
                    onClick={() => handleKeyInteraction('key_lh_gis')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_lh_gis')
                        ? 'fill-[url(#photoActiveKeyGrad)] stroke-white stroke-[2.6] drop-shadow-[0_0_11px_#f59e0b]'
                        : 'fill-slate-800 stroke-amber-700 stroke-[1.6] hover:stroke-amber-400 hover:scale-105'
                    }`}
                  />
                  <text x="97" y="187.5" fontSize="10" fontWeight="900" textAnchor="middle" pointerEvents="none" fill={isKeyActive('key_lh_gis') ? '#ffffff' : '#cbd5e1'}>
                    G#
                  </text>

                  {/* 低音 C# 键 */}
                  <rect
                    id="key_lh_cis"
                    x="84"
                    y="195"
                    width="12"
                    height="15"
                    rx="2"
                    onClick={() => handleKeyInteraction('key_lh_cis')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_lh_cis')
                        ? 'fill-[url(#photoActiveKeyGrad)] stroke-white stroke-[2.4] drop-shadow-[0_0_9px_#f59e0b]'
                        : 'fill-slate-800 stroke-amber-700 stroke-[1.4] hover:stroke-amber-400 hover:scale-105'
                    }`}
                  />
                  <text x="90" y="206" fontSize="8.5" fontWeight="900" textAnchor="middle" pointerEvents="none" fill={isKeyActive('key_lh_cis') ? '#ffffff' : '#94a3b8'}>
                    C#
                  </text>

                  {/* 低音 B 键 */}
                  <rect
                    id="key_lh_low_b"
                    x="98"
                    y="195"
                    width="12"
                    height="15"
                    rx="2"
                    onClick={() => handleKeyInteraction('key_lh_low_b')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_lh_low_b')
                        ? 'fill-[url(#photoActiveKeyGrad)] stroke-white stroke-[2.4] drop-shadow-[0_0_9px_#f59e0b]'
                        : 'fill-slate-800 stroke-amber-700 stroke-[1.4] hover:stroke-amber-400 hover:scale-105'
                    }`}
                  />
                  <text x="104" y="206" fontSize="8.5" fontWeight="900" textAnchor="middle" pointerEvents="none" fill={isKeyActive('key_lh_low_b') ? '#ffffff' : '#94a3b8'}>
                    B
                  </text>

                  {/* 最低音 Bb 键 */}
                  <rect
                    id="key_lh_low_bb"
                    x="84"
                    y="213"
                    width="26"
                    height="12"
                    rx="2"
                    onClick={() => handleKeyInteraction('key_lh_low_bb')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_lh_low_bb')
                        ? 'fill-[url(#photoActiveKeyGrad)] stroke-white stroke-[2.4] drop-shadow-[0_0_9px_#f59e0b]'
                        : 'fill-slate-800 stroke-amber-700 stroke-[1.4] hover:stroke-amber-400 hover:scale-105'
                    }`}
                  />
                  <text x="97" y="222" fontSize="8" fontWeight="900" textAnchor="middle" pointerEvents="none" fill={isKeyActive('key_lh_low_bb') ? '#ffffff' : '#94a3b8'}>
                    低Bb
                  </text>

                  {/* 右手拇指托钩 */}
                  <path d="M 154,222 Q 170,227 162,240" fill="none" stroke="#eab308" strokeWidth="3.5" strokeLinecap="round" />

                  {/* ===================== 右手主音孔 (RH Stack: 4·5·6) ===================== */}
                  {/* 4号键：右手食指 (F) */}
                  <circle
                    id="key_rh1"
                    cx="133"
                    cy="232"
                    r="12.5"
                    onClick={() => handleKeyInteraction('key_rh1')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_rh1')
                        ? 'fill-[url(#photoActiveKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                        : 'fill-[url(#photoPearlGrad)] stroke-amber-600 stroke-[2] hover:stroke-amber-400 hover:scale-105'
                    }`}
                  />
                  <text
                    x="133"
                    y="236"
                    fontSize="11"
                    fontWeight="900"
                    textAnchor="middle"
                    pointerEvents="none"
                    fill={isKeyActive('key_rh1') ? '#ffffff' : '#1e293b'}
                  >
                    4(F)
                  </text>

                  {/* 5号键：右手中指 (E) */}
                  <circle
                    id="key_rh2"
                    cx="133"
                    cy="263"
                    r="12.5"
                    onClick={() => handleKeyInteraction('key_rh2')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_rh2')
                        ? 'fill-[url(#photoActiveKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                        : 'fill-[url(#photoPearlGrad)] stroke-amber-600 stroke-[2] hover:stroke-amber-400 hover:scale-105'
                    }`}
                  />
                  <text
                    x="133"
                    y="267"
                    fontSize="11"
                    fontWeight="900"
                    textAnchor="middle"
                    pointerEvents="none"
                    fill={isKeyActive('key_rh2') ? '#ffffff' : '#1e293b'}
                  >
                    5(E)
                  </text>

                  {/* 6号键：右手无名指 (D) */}
                  <circle
                    id="key_rh3"
                    cx="133"
                    cy="294"
                    r="12.5"
                    onClick={() => handleKeyInteraction('key_rh3')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_rh3')
                        ? 'fill-[url(#photoActiveKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                        : 'fill-[url(#photoPearlGrad)] stroke-amber-600 stroke-[2] hover:stroke-amber-400 hover:scale-105'
                    }`}
                  />
                  <text
                    x="133"
                    y="298"
                    fontSize="11"
                    fontWeight="900"
                    textAnchor="middle"
                    pointerEvents="none"
                    fill={isKeyActive('key_rh3') ? '#ffffff' : '#1e293b'}
                  >
                    6(D)
                  </text>

                  {/* ===================== 右手小指双滚轮键台 (Pinky Rollers: Eb & C) ===================== */}
                  {/* 低音 Eb 键 */}
                  <rect
                    id="key_rh_eb"
                    x="155"
                    y="290"
                    width="26"
                    height="16"
                    rx="4.5"
                    onClick={() => handleKeyInteraction('key_rh_eb')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_rh_eb')
                        ? 'fill-[url(#photoActiveKeyGrad)] stroke-white stroke-[2.6] drop-shadow-[0_0_11px_#f59e0b]'
                        : 'fill-slate-800 stroke-amber-700 stroke-[1.6] hover:stroke-amber-400 hover:scale-105'
                    }`}
                  />
                  <text x="168" y="302" fontSize="10" fontWeight="900" textAnchor="middle" pointerEvents="none" fill={isKeyActive('key_rh_eb') ? '#ffffff' : '#cbd5e1'}>
                    Eb
                  </text>

                  {/* 低音 C 键 */}
                  <rect
                    id="key_rh_c"
                    x="155"
                    y="310"
                    width="26"
                    height="16"
                    rx="4.5"
                    onClick={() => handleKeyInteraction('key_rh_c')}
                    className={`cursor-pointer transition-all duration-150 ${
                      isKeyActive('key_rh_c')
                        ? 'fill-[url(#photoActiveKeyGrad)] stroke-white stroke-[2.6] drop-shadow-[0_0_11px_#f59e0b]'
                        : 'fill-slate-800 stroke-amber-700 stroke-[1.6] hover:stroke-amber-400 hover:scale-105'
                    }`}
                  />
                  <text x="168" y="322" fontSize="9" fontWeight="900" textAnchor="middle" pointerEvents="none" fill={isKeyActive('key_rh_c') ? '#ffffff' : '#cbd5e1'}>
                    低音C
                  </text>
                </svg>
              </div>
            </div>

            <div className="w-full mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <p className="text-xs text-amber-300 font-semibold mb-0.5">
                高精交互指法图谱（支持高八度 & 超吹Altissimo键位）
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                包含标准1-6键、八度键、左手高音掌键（D/Eb/F）、超吹前F叉键与右侧键。点击上方音区切换或直接点击按键，即可体验逼真声学反馈。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ===================== NEW: 萨克斯按键音效即时试听与对照矩阵 (Key Sound Board) ===================== */}
      <div className="w-full mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800/90 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-black text-amber-300">
              萨克斯按键音效即时试听面板 (严格对应中音/高音萨克斯音高与按键位置)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            按键高亮为当前曲目/音符所需按法，点击任意按键即可即时试听该键机械声与对应乐音
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 1. 右侧按键群 (Right-hand Keys · 用户特别强调的右手与右侧按钮) */}
          <div className="lg:col-span-5 p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  右手按键群 (右侧核心按钮 · 主音孔/侧键/小指台)
                </span>
                <span className="text-[10px] text-emerald-400/80">右手食/中/无名/小指</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {rightHandKeys.map((keyId) => {
                  const keyDef = KEY_PITCH_MAP[keyId];
                  if (!keyDef) return null;
                  const active = isKeyActive(keyId);
                  const written =
                    register === 'altissimo'
                      ? keyDef.writtenNoteAlt
                      : register === 'high'
                      ? keyDef.writtenNoteHigh
                      : keyDef.writtenNoteLow;
                  const freq =
                    register === 'altissimo'
                      ? keyDef.altissimoFreq
                      : register === 'high'
                      ? keyDef.highFreq
                      : keyDef.lowFreq;
                  const sounding = getSaxSoundingPitch(freq, saxType);

                  return (
                    <button
                      key={keyId}
                      onClick={() => handleKeyInteraction(keyId)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 min-h-[58px] ${
                        active
                          ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-500/30'
                          : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:border-emerald-400/70 hover:bg-slate-800'
                      }`}
                      title={`${keyDef.label} - 点击试听`}
                    >
                      <span className="text-xs font-bold leading-tight">{keyDef.shortName}</span>
                      <span
                        className={`text-[10px] leading-tight mt-0.5 ${
                          active ? 'text-slate-900 font-extrabold' : 'text-amber-300'
                        }`}
                      >
                        {written}
                      </span>
                      <span
                        className={`text-[9px] leading-tight ${
                          active ? 'text-slate-950/80 font-bold' : 'text-slate-400'
                        }`}
                      >
                        实音:{sounding.noteName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              包含4/5/6下把位主音孔、侧C/侧Bb/高F#侧键连杆及低音Eb/C小指滚轮。
            </p>
          </div>

          {/* 2. 左手按键群 (Left-hand Keys · 左手上把位主音孔与小指台) */}
          <div className="lg:col-span-4 p-3 rounded-xl bg-slate-950/80 border border-sky-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  左手按键群 (左手上把位 1·2·3 与小指台)
                </span>
                <span className="text-[10px] text-sky-400/80">左手食/中/无名/小指</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {leftHandKeys.map((keyId) => {
                  const keyDef = KEY_PITCH_MAP[keyId];
                  if (!keyDef) return null;
                  const active = isKeyActive(keyId);
                  const written =
                    register === 'altissimo'
                      ? keyDef.writtenNoteAlt
                      : register === 'high'
                      ? keyDef.writtenNoteHigh
                      : keyDef.writtenNoteLow;
                  const freq =
                    register === 'altissimo'
                      ? keyDef.altissimoFreq
                      : register === 'high'
                      ? keyDef.highFreq
                      : keyDef.lowFreq;
                  const sounding = getSaxSoundingPitch(freq, saxType);

                  return (
                    <button
                      key={keyId}
                      onClick={() => handleKeyInteraction(keyId)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer active:scale-95 min-h-[58px] ${
                        active
                          ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-500/30'
                          : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:border-sky-400/70 hover:bg-slate-800'
                      }`}
                      title={`${keyDef.label} - 点击试听`}
                    >
                      <span className="text-xs font-bold leading-tight">{keyDef.shortName}</span>
                      <span
                        className={`text-[10px] leading-tight mt-0.5 ${
                          active ? 'text-slate-900 font-extrabold' : 'text-amber-300'
                        }`}
                      >
                        {written}
                      </span>
                      <span
                        className={`text-[9px] leading-tight ${
                          active ? 'text-slate-950/80 font-bold' : 'text-slate-400'
                        }`}
                      >
                        实音:{sounding.noteName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              包含1/2/3主音孔及G#/C#/B/Bb变音小指台。
            </p>
          </div>

          {/* 3. 八度泛音、超吹前F与高音掌键 (Octave & Palm Keys) */}
          <div className="lg:col-span-3 p-3 rounded-xl bg-slate-950/80 border border-rose-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  八度/超吹/高音掌键
                </span>
                <span className="text-[10px] text-rose-400/80">高音域与泛音</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {topAuxKeys.map((keyId) => {
                  const keyDef = KEY_PITCH_MAP[keyId];
                  if (!keyDef) return null;
                  const active = isKeyActive(keyId);
                  const written =
                    register === 'altissimo'
                      ? keyDef.writtenNoteAlt
                      : register === 'high'
                      ? keyDef.writtenNoteHigh
                      : keyDef.writtenNoteLow;
                  const freq =
                    register === 'altissimo'
                      ? keyDef.altissimoFreq
                      : register === 'high'
                      ? keyDef.highFreq
                      : keyDef.lowFreq;
                  const sounding = getSaxSoundingPitch(freq, saxType);

                  return (
                    <button
                      key={keyId}
                      onClick={() => handleKeyInteraction(keyId)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer active:scale-95 min-h-[58px] ${
                        active
                          ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-500/30'
                          : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:border-rose-400/70 hover:bg-slate-800'
                      }`}
                      title={`${keyDef.label} - 点击试听`}
                    >
                      <span className="text-xs font-bold leading-tight">{keyDef.shortName}</span>
                      <span
                        className={`text-[10px] leading-tight mt-0.5 ${
                          active ? 'text-slate-900 font-extrabold' : 'text-amber-300'
                        }`}
                      >
                        {written}
                      </span>
                      <span
                        className={`text-[9px] leading-tight ${
                          active ? 'text-slate-950/80 font-bold' : 'text-slate-400'
                        }`}
                      >
                        实音:{sounding.noteName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              8度键开启高八度泛音，前F与掌键支持D6-A6超吹裂帛音域。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

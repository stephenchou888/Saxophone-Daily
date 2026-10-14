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
  // View mode: 'split' (实物与图例双屏对照), 'diagram' (高精交互指法图谱), 'photo' (真实实物写真)
  const [viewMode, setViewMode] = useState<'split' | 'diagram' | 'photo'>('split');
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Sound Engine & Register Selector: 'low' (低/中八度), 'high' (高八度), 'altissimo' (超吹音区)
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

  // Real instrument photo URLs (supports GitHub Pages and custom base URL)
  const realPhotoSrc =
    saxType === 'alto'
      ? `${import.meta.env.BASE_URL}images/alto_saxophone_real.png`
      : `${import.meta.env.BASE_URL}images/soprano_saxophone_real.jpg`;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(1.5, +(prev + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.85, +(prev - 0.15).toFixed(2)));
  const handleResetZoom = () => setZoomLevel(1.0);

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
      <div className="flex flex-wrap items-center justify-between w-full px-1 mb-3 gap-2.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-black text-sm sm:text-base text-amber-300">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            {saxType === 'alto' ? '中音萨克斯 (Eb Alto · 降E调)' : '高音萨克斯 (Bb Soprano · 降B调)'}
          </span>
          <span className="text-[11px] text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
            {saxType === 'alto' ? '实音低大六度 (移调 -9 半音)' : '实音低大二度 (移调 -2 半音)'}
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>双屏对照</span>
          </button>
          <button
            onClick={() => setViewMode('photo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'photo'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>真实写真</span>
          </button>
          <button
            onClick={() => setViewMode('diagram')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'diagram'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>高精指法图</span>
          </button>
        </div>
      </div>

      {/* Sub-bar: Zoom Controls + Register Switcher + Sound Engine Modes */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2.5 px-1 mb-3">
        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs">
          <span className="text-[11px] text-slate-400 mr-1">缩放:</span>
          <button
            onClick={handleZoomOut}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="缩小"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-amber-300 min-w-[36px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="放大"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 ml-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
            title="还原原始比例"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* 音区快捷切换 (低音 / 高八度 / 超吹 Altissimo) */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 hidden sm:inline-block">试听音区:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setRegister('low')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                register === 'low'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              低/中八度
            </button>
            <button
              onClick={() => setRegister('high')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                register === 'high'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>高八度 (+8ve)</span>
            </button>
            <button
              onClick={() => setRegister('altissimo')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                register === 'altissimo'
                  ? 'bg-rose-500 text-white font-black shadow-md animate-pulse'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
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
            >
              键音+乐音
            </button>
            <button
              onClick={() => setSoundMode('tone')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                soundMode === 'tone' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              仅乐音
            </button>
            <button
              onClick={() => setSoundMode('click')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                soundMode === 'click' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
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
      <div className="w-full mb-3 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-xs">
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
              已精准校对引线起点位置，引线与按钮完美无缝相接，点击任意按钮或音孔即可即时试听
            </span>
          )}
        </div>
        <div className="text-[11px] text-amber-400/90 font-bold hidden md:block">
          当前乐器: {saxType === 'alto' ? '经典弯管中音 (Eb Alto)' : '通体直管高音 (Bb Soprano)'}
        </div>
      </div>

      {/* ===================== Main Instrument Display Box ===================== */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch justify-center p-3 sm:p-5 rounded-2xl bg-[#070b14] border border-slate-800/80 shadow-2xl">
        {/* ==================== 1. 真实乐器实拍照 (引线起点与按键无缝对接) ==================== */}
        {(viewMode === 'split' || viewMode === 'photo') && (
          <div
            className={`relative flex flex-col justify-between rounded-2xl p-4 sm:p-5 bg-[#0a0f1d] border border-amber-500/20 shadow-2xl overflow-hidden ${
              viewMode === 'split' ? 'md:col-span-6' : 'md:col-span-12 w-full max-w-3xl mx-auto'
            }`}
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-3 px-1 border-b border-slate-800/80 pb-2">
              <span className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-400" />
                真实乐器实拍照 ({saxType === 'alto' ? '经典弯管中音 Eb Alto' : '通体直管高音 Bb Soprano'})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAnnotations(!showAnnotations)}
                  className="text-[11px] text-slate-300 hover:text-amber-300 flex items-center gap-1 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700/80 cursor-pointer shadow-sm"
                >
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span>{showAnnotations ? '隐藏标记' : '显示标记'}</span>
                </button>
              </div>
            </div>

            {/* Top anatomical pill tags */}
            {showAnnotations && (
              <div className="w-full flex items-center justify-between px-1 mb-2">
                <span className="bg-slate-950/85 text-amber-300 border border-amber-500/40 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
                  ① 泛音弯颈 / 八度音孔
                </span>
                <span className="bg-slate-950/85 text-rose-300 border border-rose-500/40 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
                  🔥 超吹前F键 / 掌键区
                </span>
              </div>
            )}

            {/* Real Instrument Photo Container */}
            <div className="relative group flex items-center justify-center w-full min-h-[540px] sm:min-h-[640px] py-2 overflow-hidden">
              <div className="absolute inset-0 bg-radial from-amber-500/15 via-amber-950/10 to-transparent pointer-events-none blur-3xl" />

              <div
                className="relative transition-transform duration-200 inline-block mx-auto select-none"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              >
                {/* Saxophone Real Photo (Strictly bounded) */}
                <img
                  src={realPhotoSrc}
                  alt={saxType === 'alto' ? '中音萨克斯实拍照' : '高音萨克斯实拍照'}
                  referrerPolicy="no-referrer"
                  className="block max-h-[520px] sm:max-h-[600px] w-auto mx-auto object-contain drop-shadow-[0_20px_40px_rgba(245,158,11,0.35)]"
                />

                {/* 
                  100% 同步坐标系的精密引线与按键图层
                  viewBox="0 0 526 554" 与 alto_saxophone_real.png 的 526x554 原生像素完全 1:1 映射！
                  引线起点坐标与每个按钮的外边缘数学保证完全贴合，绝不脱节！
                */}
                {showAnnotations && saxType === 'alto' && (
                  <svg
                    viewBox="0 0 526 554"
                    className="absolute inset-0 w-full h-full pointer-events-auto z-20"
                  >
                    <defs>
                      <filter id="photoKeyShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.8" />
                      </filter>
                    </defs>

                    {/* ===================== 1. 八度泛音键 (Neck Octave Key) ===================== */}
                    {/* 引线: 从按钮右边缘 (100, 78) 出发 -> 拐点 (135, 78) -> 八度音孔 (165, 130) */}
                    <path
                      d="M 100,78 L 135,78 L 165,130"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1.6"
                      strokeDasharray="3.5 2.5"
                    />
                    <circle cx="165" cy="130" r="3.5" fill="#fbbf24" stroke="#0f172a" strokeWidth="1" />
                    {/* 按钮: 位于 (18, 65)，宽 82，右侧正好是 x=100，与引线起点无缝连接 */}
                    <g
                      onClick={() => handleKeyInteraction('key_octave', 'high')}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="18"
                        y="65"
                        width="82"
                        height="26"
                        rx="13"
                        fill={isKeyActive('key_octave') ? '#f59e0b' : '#d97706'}
                        stroke="#fef08a"
                        strokeWidth="1.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[2px]"
                      />
                      <text
                        x="59"
                        y="78"
                        fontSize="10.5"
                        fontWeight="900"
                        fill="#0f172a"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        ⚡ 8度泛音
                      </text>
                    </g>

                    {/* ===================== 2. 左手掌键群: 掌D, 掌Eb, 掌F ===================== */}
                    {/* 掌D: 按钮 (18, 105, 54, 25), 右侧 x=72, y=117.5 */}
                    <path
                      d="M 72,117.5 L 118,117.5 L 154,145"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="1.6"
                      strokeDasharray="3.5 2.5"
                    />
                    <circle cx="154" cy="145" r="3.5" fill="#f43f5e" stroke="#0f172a" strokeWidth="1" />
                    <g
                      onClick={() => handleKeyInteraction('key_palm_d', 'altissimo')}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="18"
                        y="105"
                        width="54"
                        height="25"
                        rx="12.5"
                        fill={isKeyActive('key_palm_d') ? '#f43f5e' : '#be185d'}
                        stroke="#fbcfe8"
                        strokeWidth="1.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[2px]"
                      />
                      <text
                        x="45"
                        y="117.5"
                        fontSize="11"
                        fontWeight="900"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        掌D
                      </text>
                    </g>

                    {/* 掌Eb: 按钮 (18, 142, 54, 25), 右侧 x=72, y=154.5 */}
                    <path
                      d="M 72,154.5 L 118,154.5 L 154,168"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="1.6"
                      strokeDasharray="3.5 2.5"
                    />
                    <circle cx="154" cy="168" r="3.5" fill="#f43f5e" stroke="#0f172a" strokeWidth="1" />
                    <g
                      onClick={() => handleKeyInteraction('key_palm_eb', 'altissimo')}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="18"
                        y="142"
                        width="54"
                        height="25"
                        rx="12.5"
                        fill={isKeyActive('key_palm_eb') ? '#f43f5e' : '#be185d'}
                        stroke="#fbcfe8"
                        strokeWidth="1.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[2px]"
                      />
                      <text
                        x="45"
                        y="154.5"
                        fontSize="11"
                        fontWeight="900"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        掌Eb
                      </text>
                    </g>

                    {/* 掌F: 按钮 (18, 179, 54, 25), 右侧 x=72, y=191.5 */}
                    <path
                      d="M 72,191.5 L 118,191.5 L 156,188"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="1.6"
                      strokeDasharray="3.5 2.5"
                    />
                    <circle cx="156" cy="188" r="3.5" fill="#f43f5e" stroke="#0f172a" strokeWidth="1" />
                    <g
                      onClick={() => handleKeyInteraction('key_palm_f', 'altissimo')}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="18"
                        y="179"
                        width="54"
                        height="25"
                        rx="12.5"
                        fill={isKeyActive('key_palm_f') ? '#f43f5e' : '#be185d'}
                        stroke="#fbcfe8"
                        strokeWidth="1.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[2px]"
                      />
                      <text
                        x="45"
                        y="191.5"
                        fontSize="11"
                        fontWeight="900"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        掌F
                      </text>
                    </g>

                    {/* ===================== 3. 左手小指变音台 G# ===================== */}
                    {/* G#: 按钮 (18, 235, 52, 25), 右侧 x=70, y=247.5 */}
                    <path
                      d="M 70,247.5 L 115,247.5 L 148,262"
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="1.6"
                      strokeDasharray="3.5 2.5"
                    />
                    <circle cx="148" cy="262" r="3.5" fill="#818cf8" stroke="#0f172a" strokeWidth="1" />
                    <g
                      onClick={() => handleKeyInteraction('key_lh_gis')}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="18"
                        y="235"
                        width="52"
                        height="25"
                        rx="12.5"
                        fill={isKeyActive('key_lh_gis') ? '#6366f1' : '#4338ca'}
                        stroke="#c7d2fe"
                        strokeWidth="1.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[2px]"
                      />
                      <text
                        x="44"
                        y="247.5"
                        fontSize="11"
                        fontWeight="900"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        G#
                      </text>
                    </g>

                    {/* 变音台标签: (15, 272, 145, 24), 右侧 x=160 */}
                    <g className="pointer-events-none">
                      <rect
                        x="15"
                        y="272"
                        width="145"
                        height="24"
                        rx="6"
                        fill="#0b0f19"
                        stroke="#6366f1"
                        strokeWidth="1"
                        opacity="0.95"
                      />
                      <text
                        x="87.5"
                        y="284"
                        fontSize="9.5"
                        fontWeight="bold"
                        fill="#c7d2fe"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="select-none"
                      >
                        左手小指变音台 (G#/C#/B/Bb)
                      </text>
                    </g>

                    {/* ===================== 4. 超吹前F叉键 ===================== */}
                    {/* 前F: 按钮 (218, 75, 88, 26), 底部中点 x=262, y=88 */}
                    <path
                      d="M 262,101 L 262,135 L 178,168"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="1.6"
                      strokeDasharray="3.5 2.5"
                    />
                    <circle cx="178" cy="168" r="3.5" fill="#f43f5e" stroke="#0f172a" strokeWidth="1" />
                    <g
                      onClick={() => handleKeyInteraction('key_front_f', 'altissimo')}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="218"
                        y="75"
                        width="88"
                        height="26"
                        rx="13"
                        fill={isKeyActive('key_front_f') ? '#e11d48' : '#be123c'}
                        stroke="#fda4af"
                        strokeWidth="1.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[2px]"
                      />
                      <text
                        x="262"
                        y="88"
                        fontSize="10.5"
                        fontWeight="900"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        🔥 前F超吹
                      </text>
                    </g>

                    {/* ===================== 5. 右手高音侧键群: 侧C, 侧Bb, 高F# ===================== */}
                    {/* 侧C: 按钮 (360, 195, 54, 25), 左侧起点正好是 x=360, y=207.5 */}
                    <path
                      d="M 360,207.5 L 290,207.5 L 215,228"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.6"
                      strokeDasharray="3.5 2.5"
                    />
                    <circle cx="215" cy="228" r="3.5" fill="#f59e0b" stroke="#0f172a" strokeWidth="1" />
                    <g
                      onClick={() => handleKeyInteraction('key_side_c')}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="360"
                        y="195"
                        width="54"
                        height="25"
                        rx="12.5"
                        fill={isKeyActive('key_side_c') ? '#f59e0b' : '#b45309'}
                        stroke="#fef08a"
                        strokeWidth="1.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[2px]"
                      />
                      <text
                        x="387"
                        y="207.5"
                        fontSize="11"
                        fontWeight="900"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        侧C
                      </text>
                    </g>

                    {/* 侧Bb: 按钮 (360, 232, 54, 25), 左侧起点 x=360, y=244.5 */}
                    <path
                      d="M 360,244.5 L 290,244.5 L 216,252"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.6"
                      strokeDasharray="3.5 2.5"
                    />
                    <circle cx="216" cy="252" r="3.5" fill="#f59e0b" stroke="#0f172a" strokeWidth="1" />
                    <g
                      onClick={() => handleKeyInteraction('key_side_bb')}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="360"
                        y="232"
                        width="54"
                        height="25"
                        rx="12.5"
                        fill={isKeyActive('key_side_bb') ? '#f59e0b' : '#b45309'}
                        stroke="#fef08a"
                        strokeWidth="1.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[2px]"
                      />
                      <text
                        x="387"
                        y="244.5"
                        fontSize="11"
                        fontWeight="900"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        侧Bb
                      </text>
                    </g>

                    {/* 高F#: 按钮 (360, 269, 54, 25), 左侧起点 x=360, y=281.5 */}
                    <path
                      d="M 360,281.5 L 290,281.5 L 218,276"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="1.6"
                      strokeDasharray="3.5 2.5"
                    />
                    <circle cx="218" cy="276" r="3.5" fill="#f43f5e" stroke="#0f172a" strokeWidth="1" />
                    <g
                      onClick={() => handleKeyInteraction('key_high_fis', 'altissimo')}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="360"
                        y="269"
                        width="54"
                        height="25"
                        rx="12.5"
                        fill={isKeyActive('key_high_fis') ? '#f43f5e' : '#be185d'}
                        stroke="#fbcfe8"
                        strokeWidth="1.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[2px]"
                      />
                      <text
                        x="387"
                        y="281.5"
                        fontSize="11"
                        fontWeight="900"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        高F#
                      </text>
                    </g>

                    {/* 侧键标签: (330, 308, 155, 24) */}
                    <g className="pointer-events-none">
                      <rect
                        x="330"
                        y="308"
                        width="155"
                        height="24"
                        rx="6"
                        fill="#0b0f19"
                        stroke="#f59e0b"
                        strokeWidth="1"
                        opacity="0.95"
                      />
                      <text
                        x="407.5"
                        y="320"
                        fontSize="9.5"
                        fontWeight="bold"
                        fill="#fed7aa"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="select-none"
                      >
                        右手高音侧键 (侧C/侧Bb/高F#)
                      </text>
                    </g>

                    {/* ===================== 6. 低音 Eb 与 低音 C ===================== */}
                    {/* Eb: 按钮 (360, 390, 52, 25), 左侧起点 x=360, y=402.5 */}
                    <path
                      d="M 360,402.5 L 290,402.5 L 224,416"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="1.6"
                      strokeDasharray="3.5 2.5"
                    />
                    <circle cx="224" cy="416" r="3.5" fill="#f43f5e" stroke="#0f172a" strokeWidth="1" />
                    <g
                      onClick={() => handleKeyInteraction('key_rh_eb')}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="360"
                        y="390"
                        width="52"
                        height="25"
                        rx="12.5"
                        fill={isKeyActive('key_rh_eb') ? '#f43f5e' : '#be123c'}
                        stroke="#fda4af"
                        strokeWidth="1.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[2px]"
                      />
                      <text
                        x="386"
                        y="402.5"
                        fontSize="11"
                        fontWeight="900"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        Eb
                      </text>
                    </g>

                    {/* 低音C: 按钮 (360, 428, 62, 26), 左侧起点 x=360, y=441 */}
                    <path
                      d="M 360,441 L 290,441 L 226,446"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="1.6"
                      strokeDasharray="3.5 2.5"
                    />
                    <circle cx="226" cy="446" r="3.5" fill="#f43f5e" stroke="#0f172a" strokeWidth="1" />
                    <g
                      onClick={() => handleKeyInteraction('key_rh_c')}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="360"
                        y="428"
                        width="62"
                        height="26"
                        rx="13"
                        fill={isKeyActive('key_rh_c') ? '#f43f5e' : '#be123c'}
                        stroke="#fda4af"
                        strokeWidth="1.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[2px]"
                      />
                      <text
                        x="391"
                        y="441"
                        fontSize="10.5"
                        fontWeight="900"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        低音C
                      </text>
                    </g>

                    {/* ===================== 7. 中轴主音孔: 1-2-3 (上把位) 与 4-5-6 (下把位) ===================== */}
                    {/* 1(B) */}
                    <g
                      onClick={() => handleKeyInteraction('key_lh1')}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx="178"
                        cy="202"
                        r="16"
                        fill={isKeyActive('key_lh1') ? '#fbbf24' : '#f59e0b'}
                        stroke="#fef08a"
                        strokeWidth="2.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[3px]"
                      />
                      <circle cx="178" cy="202" r="12" fill="none" stroke="#78350f" strokeWidth="0.8" pointerEvents="none" />
                      <text
                        x="178"
                        y="202"
                        fontSize="11"
                        fontWeight="900"
                        fill="#0f172a"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        1(B)
                      </text>
                    </g>

                    {/* 2(A) */}
                    <g
                      onClick={() => handleKeyInteraction('key_lh2')}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx="180"
                        cy="240"
                        r="16"
                        fill={isKeyActive('key_lh2') ? '#fbbf24' : '#f59e0b'}
                        stroke="#fef08a"
                        strokeWidth="2.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[3px]"
                      />
                      <circle cx="180" cy="240" r="12" fill="none" stroke="#78350f" strokeWidth="0.8" pointerEvents="none" />
                      <text
                        x="180"
                        y="240"
                        fontSize="11"
                        fontWeight="900"
                        fill="#0f172a"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        2(A)
                      </text>
                    </g>

                    {/* 3(G) */}
                    <g
                      onClick={() => handleKeyInteraction('key_lh3')}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx="182"
                        cy="278"
                        r="16"
                        fill={isKeyActive('key_lh3') ? '#38bdf8' : '#0284c7'}
                        stroke="#bae6fd"
                        strokeWidth="2.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[3px]"
                      />
                      <circle cx="182" cy="278" r="12" fill="none" stroke="#0369a1" strokeWidth="0.8" pointerEvents="none" />
                      <text
                        x="182"
                        y="278"
                        fontSize="11"
                        fontWeight="900"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        3(G)
                      </text>
                    </g>

                    {/* 4(F) */}
                    <g
                      onClick={() => handleKeyInteraction('key_rh1')}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx="185"
                        cy="324"
                        r="16"
                        fill={isKeyActive('key_rh1') ? '#34d399' : '#059669'}
                        stroke="#a7f3d0"
                        strokeWidth="2.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[3px]"
                      />
                      <circle cx="185" cy="324" r="12" fill="none" stroke="#047857" strokeWidth="0.8" pointerEvents="none" />
                      <text
                        x="185"
                        y="324"
                        fontSize="11"
                        fontWeight="900"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        4(F)
                      </text>
                    </g>

                    {/* 5(E) */}
                    <g
                      onClick={() => handleKeyInteraction('key_rh2')}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx="187"
                        cy="364"
                        r="16"
                        fill={isKeyActive('key_rh2') ? '#34d399' : '#059669'}
                        stroke="#a7f3d0"
                        strokeWidth="2.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[3px]"
                      />
                      <circle cx="187" cy="364" r="12" fill="none" stroke="#047857" strokeWidth="0.8" pointerEvents="none" />
                      <text
                        x="187"
                        y="364"
                        fontSize="11"
                        fontWeight="900"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        5(E)
                      </text>
                    </g>

                    {/* 6(D) */}
                    <g
                      onClick={() => handleKeyInteraction('key_rh3')}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx="189"
                        cy="404"
                        r="16"
                        fill={isKeyActive('key_rh3') ? '#34d399' : '#059669'}
                        stroke="#a7f3d0"
                        strokeWidth="2.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[3px]"
                      />
                      <circle cx="189" cy="404" r="12" fill="none" stroke="#047857" strokeWidth="0.8" pointerEvents="none" />
                      <text
                        x="189"
                        y="404"
                        fontSize="11"
                        fontWeight="900"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        6(D)
                      </text>
                    </g>
                  </svg>
                )}

                {/* Soprano 写真标注 */}
                {showAnnotations && saxType === 'soprano' && (
                  <svg
                    viewBox="0 0 400 650"
                    className="absolute inset-0 w-full h-full pointer-events-auto z-20"
                  >
                    {/* 八度键 */}
                    <path d="M 85,75 L 140,75 L 180,80" fill="none" stroke="#fbbf24" strokeWidth="1.6" strokeDasharray="3 2" />
                    <circle cx="180" cy="80" r="3.5" fill="#fbbf24" stroke="#000" strokeWidth="1" />
                    <g onClick={() => handleKeyInteraction('key_octave', 'high')} className="cursor-pointer group">
                      <rect x="25" y="62" width="60" height="26" rx="13" fill="#d97706" stroke="#fef08a" strokeWidth="1.5" className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[2px]" />
                      <text x="55" y="75" fontSize="10.5" fontWeight="900" fill="#0f172a" textAnchor="middle" dominantBaseline="central" pointerEvents="none" className="select-none">8(八度)</text>
                    </g>

                    {/* 侧C */}
                    <path d="M 290,165 L 240,165 L 205,165" fill="none" stroke="#f59e0b" strokeWidth="1.6" strokeDasharray="3 2" />
                    <circle cx="205" cy="165" r="3.5" fill="#f59e0b" stroke="#000" strokeWidth="1" />
                    <g onClick={() => handleKeyInteraction('key_side_c')} className="cursor-pointer group">
                      <rect x="290" y="152" width="50" height="26" rx="13" fill="#b45309" stroke="#fef08a" strokeWidth="1.5" className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[2px]" />
                      <text x="315" y="165" fontSize="11" fontWeight="900" fill="#ffffff" textAnchor="middle" dominantBaseline="central" pointerEvents="none" className="select-none">侧C</text>
                    </g>

                    {/* 侧Bb */}
                    <path d="M 290,205 L 240,205 L 205,205" fill="none" stroke="#f59e0b" strokeWidth="1.6" strokeDasharray="3 2" />
                    <circle cx="205" cy="205" r="3.5" fill="#f59e0b" stroke="#000" strokeWidth="1" />
                    <g onClick={() => handleKeyInteraction('key_side_bb')} className="cursor-pointer group">
                      <rect x="290" y="192" width="50" height="26" rx="13" fill="#b45309" stroke="#fef08a" strokeWidth="1.5" className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[2px]" />
                      <text x="315" y="205" fontSize="11" fontWeight="900" fill="#ffffff" textAnchor="middle" dominantBaseline="central" pointerEvents="none" className="select-none">侧Bb</text>
                    </g>

                    {/* 1, 2, 3, 4, 5, 6 主键 */}
                    {[
                      { id: 'key_lh1', label: '1(B)', y: 150 },
                      { id: 'key_lh2', label: '2(A)', y: 195 },
                      { id: 'key_lh3', label: '3(G)', y: 240 },
                      { id: 'key_rh1', label: '4(F)', y: 295 },
                      { id: 'key_rh2', label: '5(E)', y: 340 },
                      { id: 'key_rh3', label: '6(D)', y: 385 },
                    ].map((k) => (
                      <g key={k.id} onClick={() => handleKeyInteraction(k.id)} className="cursor-pointer group">
                        <circle cx="195" cy={k.y} r="15" fill={isKeyActive(k.id) ? '#fbbf24' : '#f59e0b'} stroke="#fef08a" strokeWidth="2" className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white group-hover:stroke-[2.5px]" />
                        <text x="195" y={k.y} fontSize="10.5" fontWeight="900" fill="#0f172a" textAnchor="middle" dominantBaseline="central" pointerEvents="none" className="select-none">{k.label}</text>
                      </g>
                    ))}
                  </svg>
                )}
              </div>
            </div>

            {/* Bottom Anatomy Pills */}
            {showAnnotations && (
              <div className="w-full flex items-center justify-between px-1 mt-2">
                <span className="bg-slate-950/85 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
                  ③ 右手下把位 (4-5-6孔)
                </span>
                <span className="bg-slate-950/85 text-amber-400 border border-amber-500/50 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
                  ④ 法式金光喇叭口 (Bell)
                </span>
              </div>
            )}

            {/* Bottom Info Box */}
            <div className="w-full mt-3 p-3 rounded-xl bg-slate-950/90 border border-amber-500/20 text-center">
              <p className="text-xs text-amber-400 font-bold mb-0.5">
                真实乐器真琴图例（高光黄铜与天然珍珠贝壳键位 · 仿参考图实物）
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                原琴实物拍摄，引线起点与按键边缘 100% 精确贴合。点击上方热点可体验低音、高八度与超吹发声。
              </p>
            </div>
          </div>
        )}

        {/* ==================== 2. 高精交互指法键位图 (引线起点与按键绝对贴合) ==================== */}
        {(viewMode === 'split' || viewMode === 'diagram') && (
          <div
            className={`flex flex-col justify-between rounded-2xl p-4 sm:p-5 bg-[#0a0f1d] border border-slate-800/80 shadow-2xl ${
              viewMode === 'split' ? 'md:col-span-6' : 'md:col-span-12 w-full max-w-3xl mx-auto'
            }`}
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-3 px-1 border-b border-slate-800/80 pb-2">
              <span className="font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                高精交互指法图 (包含掌键、前F超吹键与高八度键)
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded font-bold">
                  含超吹键位
                </span>
                <span className="text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                  含8度键位
                </span>
              </div>
            </div>

            {/* 大号超清 SVG 萨克斯模型 */}
            <div className="w-full flex items-center justify-center p-1 overflow-hidden min-h-[540px] sm:min-h-[640px]">
              <div
                className="w-full flex items-center justify-center transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              >
                <svg
                  width="540"
                  height="740"
                  viewBox="0 0 380 470"
                  className="w-full max-w-[500px] sm:max-w-[540px] h-auto drop-shadow-[0_16px_36px_rgba(0,0,0,0.95)] transition-all duration-300 touch-manipulation"
                >
                  <defs>
                    {/* 金色金属高光质感渐变 */}
                    <linearGradient id="altoBrassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#78350f" />
                      <stop offset="15%" stopColor="#b45309" />
                      <stop offset="35%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#fef08a" />
                      <stop offset="65%" stopColor="#fbbf24" />
                      <stop offset="85%" stopColor="#b45309" />
                      <stop offset="100%" stopColor="#713f12" />
                    </linearGradient>

                    {/* 喇叭口紫红科技声学渐变 */}
                    <linearGradient id="altoBellBodyGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b0764" />
                      <stop offset="40%" stopColor="#581c87" />
                      <stop offset="70%" stopColor="#701a75" />
                      <stop offset="100%" stopColor="#be185d" />
                    </linearGradient>

                    {/* 喇叭口内部黑紫深邃声学腔体 */}
                    <radialGradient id="altoBellMouth" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#030712" />
                      <stop offset="45%" stopColor="#3b0764" />
                      <stop offset="80%" stopColor="#701a75" />
                      <stop offset="100%" stopColor="#d97706" />
                    </radialGradient>

                    {/* 白珍珠母贝按键渐变 */}
                    <linearGradient id="pearlKeyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="50%" stopColor="#f8fafc" />
                      <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>

                    {/* 按键被激活/按下时的炽热金光渐变 */}
                    <linearGradient id="activeKeyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="40%" stopColor="#fbbf24" />
                      <stop offset="80%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>

                    {/* 超吹键粉红烈焰渐变 */}
                    <linearGradient id="altissimoKeyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fde047" />
                      <stop offset="40%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                  </defs>

                  {saxType === 'alto' ? (
                    /* ===================== 中音萨克斯 (Eb Alto) - 引线起点精确贴合 ===================== */
                    <g id="alto_reference_model">
                      {/* 1. 顶部笛头与软木 */}
                      <polygon points="144,10 166,10 164,30 146,30" fill="#0f172a" stroke="#020617" strokeWidth="1.2" />
                      <rect x="145" y="16" width="20" height="4.5" rx="1" fill="#eab308" stroke="#ca8a04" strokeWidth="0.8" />
                      <rect x="145" y="23" width="20" height="4.5" rx="1" fill="#eab308" stroke="#ca8a04" strokeWidth="0.8" />
                      <rect x="147" y="30" width="16" height="9" fill="#d97706" stroke="#b45309" strokeWidth="0.8" />

                      {/* 2. 弯曲脖管 (Neck) */}
                      <path
                        d="M 155,39 C 155,52 148,60 158,74"
                        fill="none"
                        stroke="url(#altoBrassGrad)"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      {/* 颈管八度音孔与连接环 */}
                      <rect x="148" y="74" width="24" height="6" rx="2" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />
                      {/* 颈部八度孔实物圆点 */}
                      <circle cx="152" cy="58" r="3" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />

                      {/* 3. 主管身金色锥形铜管 */}
                      <polygon points="146,78 170,78 178,355 138,355" fill="url(#altoBrassGrad)" />

                      {/* 4. 主管下端底塞 */}
                      <rect x="136" y="355" width="44" height="12" rx="2" fill="#78350f" stroke="#ca8a04" strokeWidth="1" />

                      {/* ===================== 科技指引线组 (起点精确对齐按钮边缘) ===================== */}
                      {/* 八度键引线: 从按钮右边缘 (88, 60) -> 目标音孔 (150, 58) */}
                      <path d="M 88,60 L 125,60 L 149,58" fill="none" stroke="#fbbf24" strokeWidth="1.4" strokeDasharray="3 2" />
                      <circle cx="150" cy="58" r="2.5" fill="#fbbf24" stroke="#000" strokeWidth="0.8" />

                      {/* 掌D引线: 从按钮右边缘 (88, 87) -> 目标音孔 (146, 88) */}
                      <path d="M 88,87 L 125,87 L 146,88" fill="none" stroke="#f43f5e" strokeWidth="1.4" strokeDasharray="3 2" />
                      <circle cx="146" cy="88" r="2.5" fill="#f43f5e" stroke="#000" strokeWidth="0.8" />

                      {/* 掌Eb引线: 从按钮右边缘 (88, 114) -> 目标音孔 (146, 114) */}
                      <path d="M 88,114 L 125,114 L 146,114" fill="none" stroke="#f43f5e" strokeWidth="1.4" strokeDasharray="3 2" />
                      <circle cx="146" cy="114" r="2.5" fill="#f43f5e" stroke="#000" strokeWidth="0.8" />

                      {/* 掌F引线: 从按钮右边缘 (88, 140) -> 目标音孔 (146, 140) */}
                      <path d="M 88,140 L 125,140 L 146,140" fill="none" stroke="#f43f5e" strokeWidth="1.4" strokeDasharray="3 2" />
                      <circle cx="146" cy="140" r="2.5" fill="#f43f5e" stroke="#000" strokeWidth="0.8" />

                      {/* 前F超吹引线: 从按钮底边缘 (158, 66) -> 目标音孔 (158, 88) */}
                      <path d="M 158,66 L 158,86" fill="none" stroke="#f43f5e" strokeWidth="1.4" strokeDasharray="3 2" />
                      <circle cx="158" cy="88" r="2.5" fill="#f43f5e" stroke="#000" strokeWidth="0.8" />

                      {/* 左手变音台 G# 引线: 从按钮右边缘 (88, 191) -> 目标音孔 (146, 192) */}
                      <path d="M 88,191 L 124,191 L 146,192" fill="none" stroke="#818cf8" strokeWidth="1.4" strokeDasharray="3 2" />
                      <circle cx="146" cy="192" r="2.5" fill="#818cf8" stroke="#000" strokeWidth="0.8" />

                      {/* 左手小指台 C#/B/Bb 引线: 从复合台右边缘 (88, 222) -> 目标 (146, 212) */}
                      <path d="M 88,222 L 124,222 L 146,212" fill="none" stroke="#818cf8" strokeWidth="1.4" strokeDasharray="3 2" />
                      <circle cx="146" cy="212" r="2.5" fill="#818cf8" stroke="#000" strokeWidth="0.8" />

                      {/* 右手侧键 侧C 引线: 从按钮左边缘 (214, 147) -> 目标音孔 (170, 148) */}
                      <path d="M 214,147 L 188,147 L 170,148" fill="none" stroke="#f59e0b" strokeWidth="1.4" strokeDasharray="3 2" />
                      <circle cx="170" cy="148" r="2.5" fill="#f59e0b" stroke="#000" strokeWidth="0.8" />

                      {/* 右手侧键 侧Bb 引线: 从按钮左边缘 (214, 178) -> 目标音孔 (170, 178) */}
                      <path d="M 214,178 L 188,178 L 170,178" fill="none" stroke="#f59e0b" strokeWidth="1.4" strokeDasharray="3 2" />
                      <circle cx="170" cy="178" r="2.5" fill="#f59e0b" stroke="#000" strokeWidth="0.8" />

                      {/* 右手侧键 高F# 引线: 从按钮左边缘 (214, 208) -> 目标音孔 (170, 208) */}
                      <path d="M 214,208 L 188,208 L 170,208" fill="none" stroke="#f43f5e" strokeWidth="1.4" strokeDasharray="3 2" />
                      <circle cx="170" cy="208" r="2.5" fill="#f43f5e" stroke="#000" strokeWidth="0.8" />

                      {/* 低音 Eb 引线: 从按钮左边缘 (214, 313) -> 目标音孔 (175, 314) */}
                      <path d="M 214,313 L 190,313 L 175,314" fill="none" stroke="#f43f5e" strokeWidth="1.4" strokeDasharray="3 2" />
                      <circle cx="175" cy="314" r="2.5" fill="#f43f5e" stroke="#000" strokeWidth="0.8" />

                      {/* 低音 C 引线: 从按钮左边缘 (214, 344) -> 目标音孔 (175, 344) */}
                      <path d="M 214,344 L 190,344 L 175,344" fill="none" stroke="#f43f5e" strokeWidth="1.4" strokeDasharray="3 2" />
                      <circle cx="175" cy="344" r="2.5" fill="#f43f5e" stroke="#000" strokeWidth="0.8" />

                      {/* ===================== 5. 左侧展开键位区 ===================== */}
                      {/* 8(八度) 键: (52, 48, 36, 24), 右侧正好是 x=88, y=60 */}
                      <rect
                        id="diag_octave"
                        x="52"
                        y="48"
                        width="36"
                        height="24"
                        rx="6"
                        onClick={() => handleKeyInteraction('key_octave', 'high')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_octave')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.4] drop-shadow-[0_0_12px_#f59e0b]'
                            : 'fill-amber-600 stroke-amber-300 stroke-[1.4] hover:fill-amber-500'
                        }`}
                      />
                      <text
                        x="70"
                        y="64"
                        fontSize="9.5"
                        fontWeight="900"
                        textAnchor="middle"
                        pointerEvents="none"
                        fill="#ffffff"
                      >
                        8(八度)
                      </text>

                      {/* 掌D: (54, 76, 34, 22), 右侧 x=88, y=87 */}
                      <rect
                        id="diag_palm_d"
                        x="54"
                        y="76"
                        width="34"
                        height="22"
                        rx="5"
                        onClick={() => handleKeyInteraction('key_palm_d', 'altissimo')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_palm_d')
                            ? 'fill-[url(#altissimoKeyGrad)] stroke-white stroke-[2] drop-shadow-[0_0_10px_#f43f5e]'
                            : 'fill-fuchsia-800 stroke-fuchsia-400 stroke-[1.4] hover:fill-fuchsia-700'
                        }`}
                      />
                      <text x="71" y="91" fontSize="9" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#ffffff">
                        掌D
                      </text>

                      {/* 掌Eb: (54, 103, 34, 22), 右侧 x=88, y=114 */}
                      <rect
                        id="diag_palm_eb"
                        x="54"
                        y="103"
                        width="34"
                        height="22"
                        rx="5"
                        onClick={() => handleKeyInteraction('key_palm_eb', 'altissimo')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_palm_eb')
                            ? 'fill-[url(#altissimoKeyGrad)] stroke-white stroke-[2] drop-shadow-[0_0_10px_#f43f5e]'
                            : 'fill-fuchsia-800 stroke-fuchsia-400 stroke-[1.4] hover:fill-fuchsia-700'
                        }`}
                      />
                      <text x="71" y="118" fontSize="9" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#ffffff">
                        掌Eb
                      </text>

                      {/* 掌F: (54, 129, 34, 22), 右侧 x=88, y=140 */}
                      <rect
                        id="diag_palm_f"
                        x="54"
                        y="129"
                        width="34"
                        height="22"
                        rx="5"
                        onClick={() => handleKeyInteraction('key_palm_f', 'altissimo')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_palm_f')
                            ? 'fill-[url(#altissimoKeyGrad)] stroke-white stroke-[2] drop-shadow-[0_0_10px_#f43f5e]'
                            : 'fill-fuchsia-800 stroke-fuchsia-400 stroke-[1.4] hover:fill-fuchsia-700'
                        }`}
                      />
                      <text x="71" y="144" fontSize="9" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#ffffff">
                        掌F
                      </text>

                      {/* 左手变音台 G# 键: (52, 180, 36, 22), 右侧 x=88, y=191 */}
                      <rect
                        id="diag_lh_gis"
                        x="52"
                        y="180"
                        width="36"
                        height="22"
                        rx="5"
                        onClick={() => handleKeyInteraction('key_lh_gis')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_lh_gis')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2]'
                            : 'fill-indigo-700 stroke-indigo-300 stroke-[1.4] hover:fill-indigo-600'
                        }`}
                      />
                      <text x="70" y="195" fontSize="9.5" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#ffffff">
                        G#
                      </text>

                      {/* 左手小指变音组 (C# / B / 低Bb 复合台): 右侧 x=88, y=222 */}
                      <g transform="translate(52, 208)">
                        {/* C# */}
                        <rect
                          id="diag_lh_cis"
                          x="0"
                          y="0"
                          width="17"
                          height="16"
                          rx="3"
                          onClick={() => handleKeyInteraction('key_lh_cis')}
                          className={`cursor-pointer transition-all ${
                            isKeyActive('key_lh_cis')
                              ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2]'
                              : 'fill-slate-800 stroke-indigo-400 stroke-[1.2] hover:stroke-indigo-300'
                          }`}
                        />
                        <text x="8.5" y="12" fontSize="8" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#cbd5e1">
                          C#
                        </text>

                        {/* B */}
                        <rect
                          id="diag_lh_low_b"
                          x="19"
                          y="0"
                          width="17"
                          height="16"
                          rx="3"
                          onClick={() => handleKeyInteraction('key_lh_low_b')}
                          className={`cursor-pointer transition-all ${
                            isKeyActive('key_lh_low_b')
                              ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2]'
                              : 'fill-slate-800 stroke-indigo-400 stroke-[1.2] hover:stroke-indigo-300'
                          }`}
                        />
                        <text x="27.5" y="12" fontSize="8" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#cbd5e1">
                          B
                        </text>

                        {/* 低Bb */}
                        <rect
                          id="diag_lh_low_bb"
                          x="0"
                          y="18"
                          width="36"
                          height="15"
                          rx="3"
                          onClick={() => handleKeyInteraction('key_lh_low_bb')}
                          className={`cursor-pointer transition-all ${
                            isKeyActive('key_lh_low_bb')
                              ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2]'
                              : 'fill-slate-800 stroke-indigo-400 stroke-[1.2] hover:stroke-indigo-300'
                          }`}
                        />
                        <text x="18" y="29.5" fontSize="8" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#cbd5e1">
                          低Bb
                        </text>
                      </g>

                      {/* ===================== 6. 顶部前F超吹键 (置顶展开) ===================== */}
                      {/* 前F: (143, 48, 30, 18), 底部中点 x=158, y=66 */}
                      <rect
                        id="diag_front_f"
                        x="143"
                        y="48"
                        width="30"
                        height="18"
                        rx="4"
                        onClick={() => handleKeyInteraction('key_front_f', 'altissimo')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_front_f')
                            ? 'fill-[url(#altissimoKeyGrad)] stroke-white stroke-[2] drop-shadow-[0_0_12px_#f43f5e]'
                            : 'fill-rose-700 stroke-rose-300 stroke-[1.4] hover:fill-rose-600'
                        }`}
                      />
                      <text x="158" y="61" fontSize="8.5" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#ffffff">
                        前F
                      </text>

                      {/* ===================== 7. 右侧展开侧键群 ===================== */}
                      {/* 侧C: (214, 136, 36, 22), 左侧 x=214, y=147 */}
                      <rect
                        id="diag_side_c"
                        x="214"
                        y="136"
                        width="36"
                        height="22"
                        rx="5"
                        onClick={() => handleKeyInteraction('key_side_c')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_side_c')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2]'
                            : 'fill-amber-600 stroke-amber-200 stroke-[1.4] hover:fill-amber-500'
                        }`}
                      />
                      <text x="232" y="151" fontSize="9" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#ffffff">
                        侧C
                      </text>

                      {/* 侧Bb: (214, 167, 36, 22), 左侧 x=214, y=178 */}
                      <rect
                        id="diag_side_bb"
                        x="214"
                        y="167"
                        width="36"
                        height="22"
                        rx="5"
                        onClick={() => handleKeyInteraction('key_side_bb')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_side_bb')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2]'
                            : 'fill-amber-600 stroke-amber-200 stroke-[1.4] hover:fill-amber-500'
                        }`}
                      />
                      <text x="232" y="182" fontSize="9" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#ffffff">
                        侧Bb
                      </text>

                      {/* 高F#: (214, 197, 36, 22), 左侧 x=214, y=208 */}
                      <rect
                        id="diag_high_fis"
                        x="214"
                        y="197"
                        width="36"
                        height="22"
                        rx="5"
                        onClick={() => handleKeyInteraction('key_high_fis', 'altissimo')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_high_fis')
                            ? 'fill-[url(#altissimoKeyGrad)] stroke-white stroke-[2] drop-shadow-[0_0_10px_#f43f5e]'
                            : 'fill-fuchsia-700 stroke-fuchsia-300 stroke-[1.4] hover:fill-fuchsia-600'
                        }`}
                      />
                      <text x="232" y="212" fontSize="9" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#ffffff">
                        高F#
                      </text>

                      {/* 低音 Eb 键: (214, 302, 36, 22), 左侧 x=214, y=313 */}
                      <rect
                        id="diag_rh_eb"
                        x="214"
                        y="302"
                        width="36"
                        height="22"
                        rx="5"
                        onClick={() => handleKeyInteraction('key_rh_eb')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_rh_eb')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2]'
                            : 'fill-rose-700 stroke-rose-300 stroke-[1.4] hover:fill-rose-600'
                        }`}
                      />
                      <text x="232" y="317" fontSize="9" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#ffffff">
                        Eb
                      </text>

                      {/* 低音 C 键: (214, 333, 36, 22), 左侧 x=214, y=344 */}
                      <rect
                        id="diag_rh_c"
                        x="214"
                        y="333"
                        width="36"
                        height="22"
                        rx="5"
                        onClick={() => handleKeyInteraction('key_rh_c')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_rh_c')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2]'
                            : 'fill-rose-700 stroke-rose-300 stroke-[1.4] hover:fill-rose-600'
                        }`}
                      />
                      <text x="232" y="348" fontSize="8.5" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#ffffff">
                        低音C
                      </text>

                      {/* ===================== 8. 中轴珍珠主音孔 ===================== */}
                      {/* 1(B) */}
                      <circle
                        id="diag_lh1"
                        cx="158"
                        cy="114"
                        r="13"
                        onClick={() => handleKeyInteraction('key_lh1')}
                        className={`cursor-pointer transition-all duration-150 ${
                          isKeyActive('key_lh1')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                            : 'fill-[url(#pearlKeyGrad)] stroke-amber-500 stroke-[2] hover:stroke-amber-300'
                        }`}
                      />
                      <circle cx="158" cy="114" r="10" fill="none" stroke="#d97706" strokeWidth="0.8" pointerEvents="none" />
                      <text
                        x="158"
                        y="118.5"
                        fontSize="10.5"
                        fontWeight="900"
                        textAnchor="middle"
                        pointerEvents="none"
                        fill={isKeyActive('key_lh1') ? '#ffffff' : '#1e293b'}
                      >
                        1(B)
                      </text>

                      {/* 2(A) */}
                      <circle
                        id="diag_lh2"
                        cx="158"
                        cy="152"
                        r="13"
                        onClick={() => handleKeyInteraction('key_lh2')}
                        className={`cursor-pointer transition-all duration-150 ${
                          isKeyActive('key_lh2')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                            : 'fill-[url(#pearlKeyGrad)] stroke-amber-500 stroke-[2] hover:stroke-amber-300'
                        }`}
                      />
                      <circle cx="158" cy="152" r="10" fill="none" stroke="#d97706" strokeWidth="0.8" pointerEvents="none" />
                      <text
                        x="158"
                        y="156.5"
                        fontSize="10.5"
                        fontWeight="900"
                        textAnchor="middle"
                        pointerEvents="none"
                        fill={isKeyActive('key_lh2') ? '#ffffff' : '#1e293b'}
                      >
                        2(A)
                      </text>

                      {/* 3(G) */}
                      <circle
                        id="diag_lh3"
                        cx="158"
                        cy="190"
                        r="13"
                        onClick={() => handleKeyInteraction('key_lh3')}
                        className={`cursor-pointer transition-all duration-150 ${
                          isKeyActive('key_lh3')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                            : 'fill-[url(#pearlKeyGrad)] stroke-amber-500 stroke-[2] hover:stroke-amber-300'
                        }`}
                      />
                      <circle cx="158" cy="190" r="10" fill="none" stroke="#d97706" strokeWidth="0.8" pointerEvents="none" />
                      <text
                        x="158"
                        y="194.5"
                        fontSize="10.5"
                        fontWeight="900"
                        textAnchor="middle"
                        pointerEvents="none"
                        fill={isKeyActive('key_lh3') ? '#ffffff' : '#1e293b'}
                      >
                        3(G)
                      </text>

                      {/* 4(F) */}
                      <circle
                        id="diag_rh1"
                        cx="158"
                        cy="234"
                        r="13"
                        onClick={() => handleKeyInteraction('key_rh1')}
                        className={`cursor-pointer transition-all duration-150 ${
                          isKeyActive('key_rh1')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                            : 'fill-[url(#pearlKeyGrad)] stroke-amber-500 stroke-[2] hover:stroke-amber-300'
                        }`}
                      />
                      <circle cx="158" cy="234" r="10" fill="none" stroke="#d97706" strokeWidth="0.8" pointerEvents="none" />
                      <text
                        x="158"
                        y="238.5"
                        fontSize="10.5"
                        fontWeight="900"
                        textAnchor="middle"
                        pointerEvents="none"
                        fill={isKeyActive('key_rh1') ? '#ffffff' : '#1e293b'}
                      >
                        4(F)
                      </text>

                      {/* 5(E) */}
                      <circle
                        id="diag_rh2"
                        cx="158"
                        cy="272"
                        r="13"
                        onClick={() => handleKeyInteraction('key_rh2')}
                        className={`cursor-pointer transition-all duration-150 ${
                          isKeyActive('key_rh2')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                            : 'fill-[url(#pearlKeyGrad)] stroke-amber-500 stroke-[2] hover:stroke-amber-300'
                        }`}
                      />
                      <circle cx="158" cy="272" r="10" fill="none" stroke="#d97706" strokeWidth="0.8" pointerEvents="none" />
                      <text
                        x="158"
                        y="276.5"
                        fontSize="10.5"
                        fontWeight="900"
                        textAnchor="middle"
                        pointerEvents="none"
                        fill={isKeyActive('key_rh2') ? '#ffffff' : '#1e293b'}
                      >
                        5(E)
                      </text>

                      {/* 6(D) */}
                      <circle
                        id="diag_rh3"
                        cx="158"
                        cy="310"
                        r="13"
                        onClick={() => handleKeyInteraction('key_rh3')}
                        className={`cursor-pointer transition-all duration-150 ${
                          isKeyActive('key_rh3')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                            : 'fill-[url(#pearlKeyGrad)] stroke-amber-500 stroke-[2] hover:stroke-amber-300'
                        }`}
                      />
                      <circle cx="158" cy="310" r="10" fill="none" stroke="#d97706" strokeWidth="0.8" pointerEvents="none" />
                      <text
                        x="158"
                        y="314.5"
                        fontSize="10.5"
                        fontWeight="900"
                        textAnchor="middle"
                        pointerEvents="none"
                        fill={isKeyActive('key_rh3') ? '#ffffff' : '#1e293b'}
                      >
                        6(D)
                      </text>

                      {/* ===================== 9. 右侧大喇叭口 (Bell) 保持华丽共鸣光效 ===================== */}
                      <g id="bell_flare_art">
                        <path
                          d="M 178,350 C 196,358 214,375 230,400 C 244,420 260,418 272,390 C 286,346 300,285 316,220 L 274,204 C 260,255 246,310 228,335 Z"
                          fill="url(#altoBellBodyGrad)"
                          stroke="#a855f7"
                          strokeWidth="1.2"
                        />
                        {/* 喇叭声学粒子矩阵 */}
                        <g opacity="0.65" fill="#fbcfe8">
                          <circle cx="236" cy="365" r="1.5" />
                          <circle cx="242" cy="360" r="1.2" />
                          <circle cx="248" cy="355" r="1.0" />
                          <circle cx="244" cy="375" r="1.8" />
                          <circle cx="252" cy="370" r="1.5" />
                          <circle cx="260" cy="365" r="1.2" />
                          <circle cx="255" cy="388" r="2.0" />
                          <circle cx="264" cy="382" r="1.6" />
                          <circle cx="274" cy="376" r="1.2" />
                        </g>

                        {/* 喇叭钟口深邃椭圆 */}
                        <ellipse
                          cx="295"
                          cy="212"
                          rx="24"
                          ry="36"
                          transform="rotate(-26 295 212)"
                          fill="url(#altoBellMouth)"
                          stroke="#fef08a"
                          strokeWidth="3.2"
                        />
                        <ellipse
                          cx="295"
                          cy="212"
                          rx="20"
                          ry="31"
                          transform="rotate(-26 295 212)"
                          fill="none"
                          stroke="#eab308"
                          strokeWidth="1.5"
                          strokeDasharray="3 2"
                        />
                      </g>
                    </g>
                  ) : (
                    /* ===================== 高音萨克斯 (Bb Soprano) 直管矢量模型 ===================== */
                    <g id="soprano_reference_model">
                      {/* 直管笛头与软木 */}
                      <polygon points="172,10 192,10 190,36 174,36" fill="#0f172a" stroke="#020617" strokeWidth="1.2" />
                      <rect x="173" y="18" width="18" height="5" rx="1" fill="#eab308" stroke="#ca8a04" strokeWidth="0.8" />
                      <rect x="173" y="27" width="18" height="5" rx="1" fill="#eab308" stroke="#ca8a04" strokeWidth="0.8" />
                      <rect x="175" y="36" width="14" height="10" fill="#d97706" />

                      {/* 直管颈节 */}
                      <rect x="173" y="46" width="18" height="38" fill="url(#altoBrassGrad)" />
                      <rect x="171" y="82" width="22" height="6" rx="2" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />

                      {/* 细长直管身锥体 */}
                      <polygon points="172,88 192,88 204,365 160,365" fill="url(#altoBrassGrad)" />

                      {/* 直管正向喇叭钟口 */}
                      <polygon points="160,365 204,365 224,415 140,415" fill="url(#altoBrassGrad)" stroke="#fef08a" strokeWidth="1" />
                      <ellipse cx="182" cy="415" rx="42" ry="16" fill="url(#altoBellMouth)" stroke="#fef08a" strokeWidth="3" />

                      {/* 引导引线: 从按钮右边缘 (116, 67) -> 目标 (176, 66) */}
                      <path d="M 116,67 L 155,67 L 176,66" fill="none" stroke="#fbbf24" strokeWidth="1.4" strokeDasharray="3 2" />
                      <circle cx="176" cy="66" r="2.5" fill="#fbbf24" stroke="#000" strokeWidth="0.8" />

                      {/* 侧C引线: 从按钮左边缘 (232, 148) -> 目标 (190, 148) */}
                      <path d="M 232,148 L 208,148 L 190,148" fill="none" stroke="#f59e0b" strokeWidth="1.4" strokeDasharray="3 2" />
                      <circle cx="190" cy="148" r="2.5" fill="#f59e0b" stroke="#000" strokeWidth="0.8" />

                      {/* 侧Bb引线: 从按钮左边缘 (232, 178) -> 目标 (190, 178) */}
                      <path d="M 232,178 L 208,178 L 190,178" fill="none" stroke="#f59e0b" strokeWidth="1.4" strokeDasharray="3 2" />
                      <circle cx="190" cy="178" r="2.5" fill="#f59e0b" stroke="#000" strokeWidth="0.8" />

                      {/* 高F#引线: 从按钮左边缘 (232, 208) -> 目标 (190, 208) */}
                      <path d="M 232,208 L 208,208 L 190,208" fill="none" stroke="#f43f5e" strokeWidth="1.4" strokeDasharray="3 2" />
                      <circle cx="190" cy="208" r="2.5" fill="#f43f5e" stroke="#000" strokeWidth="0.8" />

                      {/* 高音八度键 */}
                      <rect
                        x="80"
                        y="56"
                        width="36"
                        height="22"
                        rx="5"
                        onClick={() => handleKeyInteraction('key_octave', 'high')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_octave')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2]'
                            : 'fill-amber-600 stroke-amber-300 stroke-[1.4]'
                        }`}
                      />
                      <text x="98" y="71" fontSize="9" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#ffffff">
                        8(八度)
                      </text>

                      {/* 前F超吹 */}
                      <rect
                        x="167"
                        y="52"
                        width="30"
                        height="18"
                        rx="4"
                        onClick={() => handleKeyInteraction('key_front_f', 'altissimo')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_front_f')
                            ? 'fill-[url(#altissimoKeyGrad)] stroke-white stroke-[2]'
                            : 'fill-rose-700 stroke-rose-300 stroke-[1.4]'
                        }`}
                      />
                      <text x="182" y="65" fontSize="8" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#ffffff">
                        前F
                      </text>

                      {/* 左手主音孔: 1, 2, 3 */}
                      <circle
                        cx="182"
                        cy="114"
                        r="12.5"
                        onClick={() => handleKeyInteraction('key_lh1')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_lh1')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.4]'
                            : 'fill-[url(#pearlKeyGrad)] stroke-amber-500 stroke-[1.8]'
                        }`}
                      />
                      <text x="182" y="118.5" fontSize="10" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#1e293b">
                        1(B)
                      </text>

                      <circle
                        cx="182"
                        cy="152"
                        r="12.5"
                        onClick={() => handleKeyInteraction('key_lh2')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_lh2')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.4]'
                            : 'fill-[url(#pearlKeyGrad)] stroke-amber-500 stroke-[1.8]'
                        }`}
                      />
                      <text x="182" y="156.5" fontSize="10" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#1e293b">
                        2(A)
                      </text>

                      <circle
                        cx="182"
                        cy="190"
                        r="12.5"
                        onClick={() => handleKeyInteraction('key_lh3')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_lh3')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.4]'
                            : 'fill-[url(#pearlKeyGrad)] stroke-amber-500 stroke-[1.8]'
                        }`}
                      />
                      <text x="182" y="194.5" fontSize="10" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#1e293b">
                        3(G)
                      </text>

                      {/* 右手高音侧键 */}
                      <rect x="232" y="137" width="36" height="22" rx="5" onClick={() => handleKeyInteraction('key_side_c')} fill="#1e293b" stroke="#f59e0b" strokeWidth="1.4" className="cursor-pointer" />
                      <text x="250" y="152" fontSize="9" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#ffffff">侧C</text>

                      <rect x="232" y="167" width="36" height="22" rx="5" onClick={() => handleKeyInteraction('key_side_bb')} fill="#1e293b" stroke="#f59e0b" strokeWidth="1.4" className="cursor-pointer" />
                      <text x="250" y="182" fontSize="9" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#ffffff">侧Bb</text>

                      <rect x="232" y="197" width="36" height="22" rx="5" onClick={() => handleKeyInteraction('key_high_fis', 'altissimo')} fill="#1e293b" stroke="#f43f5e" strokeWidth="1.4" className="cursor-pointer" />
                      <text x="250" y="212" fontSize="9" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#f472b6">高F#</text>

                      {/* 右手主音孔: 4, 5, 6 */}
                      <circle
                        cx="182"
                        cy="234"
                        r="12.5"
                        onClick={() => handleKeyInteraction('key_rh1')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_rh1')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.4]'
                            : 'fill-[url(#pearlKeyGrad)] stroke-amber-500 stroke-[1.8]'
                        }`}
                      />
                      <text x="182" y="238.5" fontSize="10" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#1e293b">
                        4(F)
                      </text>

                      <circle
                        cx="182"
                        cy="272"
                        r="12.5"
                        onClick={() => handleKeyInteraction('key_rh2')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_rh2')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.4]'
                            : 'fill-[url(#pearlKeyGrad)] stroke-amber-500 stroke-[1.8]'
                        }`}
                      />
                      <text x="182" y="276.5" fontSize="10" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#1e293b">
                        5(E)
                      </text>

                      <circle
                        cx="182"
                        cy="310"
                        r="12.5"
                        onClick={() => handleKeyInteraction('key_rh3')}
                        className={`cursor-pointer transition-all ${
                          isKeyActive('key_rh3')
                            ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.4]'
                            : 'fill-[url(#pearlKeyGrad)] stroke-amber-500 stroke-[1.8]'
                        }`}
                      />
                      <text x="182" y="314.5" fontSize="10" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#1e293b">
                        6(D)
                      </text>

                      {/* 低音 Eb & C */}
                      <rect x="232" y="302" width="36" height="22" rx="5" onClick={() => handleKeyInteraction('key_rh_eb')} fill="#1e293b" stroke="#f59e0b" strokeWidth="1.4" className="cursor-pointer" />
                      <text x="250" y="317" fontSize="9" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#ffffff">Eb</text>

                      <rect x="232" y="333" width="36" height="22" rx="5" onClick={() => handleKeyInteraction('key_rh_c')} fill="#1e293b" stroke="#f59e0b" strokeWidth="1.4" className="cursor-pointer" />
                      <text x="250" y="348" fontSize="8.5" fontWeight="900" textAnchor="middle" pointerEvents="none" fill="#ffffff">低音C</text>
                    </g>
                  )}
                </svg>
              </div>
            </div>

            {/* Bottom Info Box */}
            <div className="w-full mt-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-center">
              <p className="text-xs text-amber-300 font-bold mb-0.5">
                高精交互指法图谱（支持高八度 & 超吹Altissimo键位）
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                已拉开按键间距并增设指引线。包含标准1-6键、八度键、左手高音掌键 (D/Eb/F)、超吹前F叉键与右侧键。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ===================== NEW: 萨克斯按键音效即时试听与对照矩阵 (Key Sound Board) ===================== */}
      <div className="w-full mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#070b14] via-[#0a0f1d] to-[#070b14] border border-slate-800/90 shadow-2xl">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 左手主控与掌键 */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-amber-400 flex items-center justify-between">
              <span>左手按键区 (上把位 1·2·3 与 小指台)</span>
              <span className="text-[10px] text-slate-500">记谱高音谱表</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {leftHandKeys.map((keyId) => {
                const info = KEY_PITCH_MAP[keyId];
                const active = isKeyActive(keyId);
                return (
                  <button
                    key={keyId}
                    onClick={() => handleKeyInteraction(keyId)}
                    className={`px-2 py-1.5 rounded-lg text-left text-xs transition-all flex flex-col cursor-pointer active:scale-95 ${
                      active
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md border border-amber-300'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-[11px] truncate">{info?.label || keyId}</span>
                      <span className={`text-[10px] ${active ? 'text-slate-900 font-black' : 'text-amber-400'}`}>
                        {register === 'altissimo'
                          ? info?.writtenNoteAlt
                          : register === 'high'
                          ? info?.writtenNoteHigh
                          : info?.writtenNoteLow}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 右手主控与侧键 */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-emerald-400 flex items-center justify-between">
              <span>右手按键区 (下把位 4·5·6 与 侧键)</span>
              <span className="text-[10px] text-slate-500">记谱音区</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {rightHandKeys.map((keyId) => {
                const info = KEY_PITCH_MAP[keyId];
                const active = isKeyActive(keyId);
                return (
                  <button
                    key={keyId}
                    onClick={() => handleKeyInteraction(keyId)}
                    className={`px-2 py-1.5 rounded-lg text-left text-xs transition-all flex flex-col cursor-pointer active:scale-95 ${
                      active
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md border border-emerald-300'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-[11px] truncate">{info?.label || keyId}</span>
                      <span className={`text-[10px] ${active ? 'text-slate-900 font-black' : 'text-emerald-400'}`}>
                        {register === 'altissimo'
                          ? info?.writtenNoteAlt
                          : register === 'high'
                          ? info?.writtenNoteHigh
                          : info?.writtenNoteLow}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 特殊功能键：八度键、超吹前F、掌键 */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-rose-400 flex items-center justify-between">
              <span>超吹前F键 / 八度键 / 掌键区</span>
              <span className="text-[10px] text-rose-400/80">泛音与超吹</span>
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {topAuxKeys.map((keyId) => {
                const info = KEY_PITCH_MAP[keyId];
                const active = isKeyActive(keyId);
                const isAltissimo = keyId === 'key_front_f' || keyId.startsWith('key_palm');
                return (
                  <button
                    key={keyId}
                    onClick={() =>
                      handleKeyInteraction(
                        keyId,
                        keyId === 'key_octave' ? 'high' : isAltissimo ? 'altissimo' : undefined
                      )
                    }
                    className={`px-2.5 py-1.5 rounded-lg text-left text-xs transition-all flex items-center justify-between cursor-pointer active:scale-95 ${
                      active
                        ? 'bg-rose-500 text-white font-black shadow-md border border-rose-300'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {keyId === 'key_octave' ? (
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Flame className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      <span className="font-bold text-[11px]">{info?.label || keyId}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span>记谱:</span>
                      <b className="text-amber-300">{info?.writtenNoteHigh || info?.writtenNoteAlt}</b>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

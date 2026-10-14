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

  const realPhotoSrc =
    saxType === 'alto'
      ? `${import.meta.env.BASE_URL}images/alto_saxophone_real.png`
      : `${import.meta.env.BASE_URL}images/soprano_saxophone_real.jpg`;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(1.5, +(prev + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.85, +(prev - 0.15).toFixed(2)));
  const handleResetZoom = () => setZoomLevel(1.0);

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
          <span className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-primary">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
            {saxType === 'alto' ? '中音萨克斯 (Eb Alto · 降E调)' : '高音萨克斯 (Bb Soprano · 降B调)'}
          </span>
          <span className="text-[11px] text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md font-medium hidden sm:inline-block">
            {saxType === 'alto' ? '实音低大六度 (移调 -9 半音)' : '实音低大二度 (移调 -2 半音)'}
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg border border-border">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>双屏对照</span>
          </button>
          <button
            onClick={() => setViewMode('photo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'photo'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>真实写真</span>
          </button>
          <button
            onClick={() => setViewMode('diagram')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'diagram'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
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
        <div className="flex items-center gap-1 bg-secondary px-2.5 py-1 rounded-md border border-border text-xs">
          <span className="text-[11px] text-muted-foreground mr-1">缩放:</span>
          <button
            onClick={handleZoomOut}
            className="p-1 rounded hover:bg-secondary/85 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="缩小"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-primary min-w-[36px] text-center font-semibold">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded hover:bg-secondary/85 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="放大"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 ml-1 rounded hover:bg-secondary/85 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            title="还原原始比例"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* 音区快捷切换 */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground hidden sm:inline-block">试听音区:</span>
          <div className="flex items-center gap-1 bg-secondary p-0.5 rounded-md border border-border text-[11px]">
            <button
              onClick={() => setRegister('low')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                register === 'low'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              低/中八度
            </button>
            <button
              onClick={() => setRegister('high')}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                register === 'high'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>高八度 (+8ve)</span>
            </button>
            <button
              onClick={() => setRegister('altissimo')}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                register === 'altissimo'
                  ? 'bg-destructive text-destructive-foreground font-semibold shadow-sm animate-pulse'
                  : 'text-muted-foreground hover:text-destructive'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>超吹 (Altissimo)</span>
            </button>
          </div>
        </div>

        {/* Sound Feedback mode & Mute */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-secondary p-0.5 rounded-md border border-border text-[11px]">
            <button
              onClick={() => setSoundMode('both')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                soundMode === 'both' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              键音+乐音
            </button>
            <button
              onClick={() => setSoundMode('tone')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                soundMode === 'tone' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              仅乐音
            </button>
            <button
              onClick={() => setSoundMode('click')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                soundMode === 'click' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              仅机械声
            </button>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-destructive/20 text-destructive border-destructive/40'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            }`}
            title="静音开关"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ===================== Real-time Sound & Pitch Feedback Banner ===================== */}
      <div className="w-full mb-3 px-3.5 py-2 rounded-lg bg-secondary/50 border border-border flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {lastPlayedKey ? (
            <div className="flex items-center gap-2 text-primary font-semibold">
              <span className="px-2 py-0.5 rounded bg-primary/20 border border-primary/40 text-[11px] text-primary">
                {lastPlayedKey.register === 'altissimo'
                  ? '🔥 超吹 Altissimo'
                  : lastPlayedKey.register === 'high'
                  ? '⚡ 高八度'
                  : '🎵 标准音区'}
              </span>
              <span className="text-foreground font-bold">{lastPlayedKey.label}</span>
              <span className="text-muted-foreground text-[11px]">
                记谱音: <b className="text-primary">{lastPlayedKey.writtenNote}</b> ({lastPlayedKey.writtenFreq}Hz)
              </span>
              <span className="text-foreground text-[11px] bg-card px-2 py-0.5 rounded border border-border">
                {saxType === 'alto' ? '中音实音 (Eb)' : '高音实音 (Bb)'}:{' '}
                <b className="text-emerald-400">{lastPlayedKey.concertNote}</b> ({lastPlayedKey.concertFreq}Hz)
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground text-[11px] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-primary shrink-0" />
              已精准校对引线起点位置，引线与按钮完美无缝相接，点击任意按钮或音孔即可即时试听
            </span>
          )}
        </div>
        <div className="text-[11px] text-primary font-semibold hidden md:block">
          当前乐器: {saxType === 'alto' ? '经典弯管中音 (Eb Alto)' : '通体直管高音 (Bb Soprano)'}
        </div>
      </div>

      {/* ===================== Main Instrument Display Box ===================== */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch justify-center p-3 sm:p-5 rounded-xl bg-card border border-border shadow-sm">
        {/* ==================== 1. 真实乐器实拍照 ==================== */}
        {(viewMode === 'split' || viewMode === 'photo') && (
          <div
            className={`relative flex flex-col justify-between rounded-xl p-4 sm:p-5 bg-card/80 border border-border shadow-sm overflow-hidden ${
              viewMode === 'split' ? 'md:col-span-6' : 'md:col-span-12 w-full max-w-3xl mx-auto'
            }`}
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-3 px-1 border-b border-border pb-2">
              <span className="text-xs sm:text-sm font-semibold text-primary flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-primary" />
                真实乐器实拍照 ({saxType === 'alto' ? '经典弯管中音 Eb Alto' : '通体直管高音 Bb Soprano'})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAnnotations(!showAnnotations)}
                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 bg-secondary px-2.5 py-1 rounded-md border border-border cursor-pointer shadow-xs"
                >
                  <Eye className="w-3 h-3 text-muted-foreground" />
                  <span>{showAnnotations ? '隐藏标记' : '显示标记'}</span>
                </button>
              </div>
            </div>

            {/* Top anatomical pill tags */}
            {showAnnotations && (
              <div className="w-full flex items-center justify-between px-1 mb-2">
                <span className="bg-secondary/90 text-primary border border-primary/30 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs backdrop-blur-sm">
                  ① 泛音弯颈 / 八度音孔
                </span>
                <span className="bg-secondary/90 text-destructive border border-destructive/30 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs backdrop-blur-sm">
                  🔥 超吹前F键 / 掌键区
                </span>
              </div>
            )}

            {/* Real Instrument Photo Container */}
            <div className="relative group flex items-center justify-center w-full min-h-[540px] sm:min-h-[640px] py-2 overflow-hidden">
              <div className="absolute inset-0 bg-radial from-primary/10 via-transparent to-transparent pointer-events-none blur-3xl" />

              <div
                className="relative transition-transform duration-200 inline-block mx-auto select-none"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              >
                <img
                  src={realPhotoSrc}
                  alt={saxType === 'alto' ? '中音萨克斯实拍照' : '高音萨克斯实拍照'}
                  referrerPolicy="no-referrer"
                  className="block max-h-[520px] sm:max-h-[600px] w-auto mx-auto object-contain drop-shadow-xl"
                />

                {showAnnotations && saxType === 'alto' && (
                  <svg
                    viewBox="0 0 526 554"
                    className="absolute inset-0 w-full h-full pointer-events-auto z-20"
                  >
                    <defs>
                      <filter id="photoKeyShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
                      </filter>
                    </defs>

                    {/* Octave Key */}
                    <path
                      d="M 100,78 L 135,78 L 165,130"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.6"
                      strokeDasharray="3.5 2.5"
                    />
                    <circle cx="165" cy="130" r="3.5" fill="#f59e0b" stroke="#0f172a" strokeWidth="1" />
                    <g
                      onClick={() => handleKeyInteraction('key_octave', 'high')}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="18"
                        y="65"
                        width="82"
                        height="26"
                        rx="6"
                        fill={isKeyActive('key_octave') ? '#f59e0b' : '#b45309'}
                        stroke="#fef08a"
                        strokeWidth="1.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125"
                      />
                      <text
                        x="59"
                        y="78"
                        fontSize="10.5"
                        fontWeight="bold"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        ⚡ 8度泛音
                      </text>
                    </g>

                    {/* Palm D */}
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
                        rx="6"
                        fill={isKeyActive('key_palm_d') ? '#f43f5e' : '#be185d'}
                        stroke="#fbcfe8"
                        strokeWidth="1.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125"
                      />
                      <text
                        x="45"
                        y="117.5"
                        fontSize="11"
                        fontWeight="bold"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        掌D
                      </text>
                    </g>

                    {/* Palm Eb */}
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
                        rx="6"
                        fill={isKeyActive('key_palm_eb') ? '#f43f5e' : '#be185d'}
                        stroke="#fbcfe8"
                        strokeWidth="1.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125"
                      />
                      <text
                        x="45"
                        y="154.5"
                        fontSize="11"
                        fontWeight="bold"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        掌Eb
                      </text>
                    </g>

                    {/* Palm F */}
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
                        rx="6"
                        fill={isKeyActive('key_palm_f') ? '#f43f5e' : '#be185d'}
                        stroke="#fbcfe8"
                        strokeWidth="1.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125"
                      />
                      <text
                        x="45"
                        y="191.5"
                        fontSize="11"
                        fontWeight="bold"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        掌F
                      </text>
                    </g>

                    {/* G# */}
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
                        rx="6"
                        fill={isKeyActive('key_lh_gis') ? '#6366f1' : '#4338ca'}
                        stroke="#c7d2fe"
                        strokeWidth="1.5"
                        filter="url(#photoKeyShadow)"
                        className="transition-all duration-150 group-hover:brightness-125"
                      />
                      <text
                        x="44"
                        y="247.5"
                        fontSize="11"
                        fontWeight="bold"
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="select-none"
                      >
                        G#
                      </text>
                    </g>

                    {/* Main Holes 1, 2, 3 */}
                    <g onClick={() => handleKeyInteraction('key_lh1')} className="cursor-pointer group">
                      <circle cx="178" cy="202" r="16" fill={isKeyActive('key_lh1') ? '#f59e0b' : '#d97706'} stroke="#fef08a" strokeWidth="2.5" filter="url(#photoKeyShadow)" />
                      <text x="178" y="202" fontSize="11" fontWeight="bold" fill="#ffffff" textAnchor="middle" dominantBaseline="central" pointerEvents="none">1(B)</text>
                    </g>
                    <g onClick={() => handleKeyInteraction('key_lh2')} className="cursor-pointer group">
                      <circle cx="180" cy="240" r="16" fill={isKeyActive('key_lh2') ? '#f59e0b' : '#d97706'} stroke="#fef08a" strokeWidth="2.5" filter="url(#photoKeyShadow)" />
                      <text x="180" y="240" fontSize="11" fontWeight="bold" fill="#ffffff" textAnchor="middle" dominantBaseline="central" pointerEvents="none">2(A)</text>
                    </g>
                    <g onClick={() => handleKeyInteraction('key_lh3')} className="cursor-pointer group">
                      <circle cx="182" cy="278" r="16" fill={isKeyActive('key_lh3') ? '#38bdf8' : '#0284c7'} stroke="#bae6fd" strokeWidth="2.5" filter="url(#photoKeyShadow)" />
                      <text x="182" y="278" fontSize="11" fontWeight="bold" fill="#ffffff" textAnchor="middle" dominantBaseline="central" pointerEvents="none">3(G)</text>
                    </g>

                    {/* Main Holes 4, 5, 6 */}
                    <g onClick={() => handleKeyInteraction('key_rh1')} className="cursor-pointer group">
                      <circle cx="196" cy="358" r="16" fill={isKeyActive('key_rh1') ? '#f59e0b' : '#d97706'} stroke="#fef08a" strokeWidth="2.5" filter="url(#photoKeyShadow)" />
                      <text x="196" y="358" fontSize="11" fontWeight="bold" fill="#ffffff" textAnchor="middle" dominantBaseline="central" pointerEvents="none">4(F)</text>
                    </g>
                    <g onClick={() => handleKeyInteraction('key_rh2')} className="cursor-pointer group">
                      <circle cx="204" cy="398" r="16" fill={isKeyActive('key_rh2') ? '#f59e0b' : '#d97706'} stroke="#fef08a" strokeWidth="2.5" filter="url(#photoKeyShadow)" />
                      <text x="204" y="398" fontSize="11" fontWeight="bold" fill="#ffffff" textAnchor="middle" dominantBaseline="central" pointerEvents="none">5(E)</text>
                    </g>
                    <g onClick={() => handleKeyInteraction('key_rh3')} className="cursor-pointer group">
                      <circle cx="212" cy="438" r="16" fill={isKeyActive('key_rh3') ? '#f59e0b' : '#d97706'} stroke="#fef08a" strokeWidth="2.5" filter="url(#photoKeyShadow)" />
                      <text x="212" y="438" fontSize="11" fontWeight="bold" fill="#ffffff" textAnchor="middle" dominantBaseline="central" pointerEvents="none">6(D)</text>
                    </g>
                  </svg>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. 高精交互指法图谱面板 ==================== */}
        {(viewMode === 'split' || viewMode === 'diagram') && (
          <div
            className={`flex flex-col justify-between rounded-xl p-4 sm:p-5 bg-card/80 border border-border shadow-sm ${
              viewMode === 'split' ? 'md:col-span-6' : 'md:col-span-12 w-full max-w-3xl mx-auto'
            }`}
          >
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <span className="text-xs sm:text-sm font-semibold text-primary flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-primary" />
                高精交互指法图谱（点击任意按键即时试听与切换）
              </span>
              <span className="text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md border border-border">
                {activeKeys.length > 0 ? `当前激活 ${activeKeys.length} 个按键` : '全开音孔'}
              </span>
            </div>

            <div className="space-y-4">
              {/* Top Aux Keys */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">顶级/侧面辅助键群 (Auxiliary Keys)</div>
                <div className="flex flex-wrap gap-2">
                  {topAuxKeys.map((keyId) => {
                    const active = isKeyActive(keyId);
                    const info = KEY_PITCH_MAP[keyId];
                    return (
                      <button
                        key={keyId}
                        onClick={() => handleKeyInteraction(keyId)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                          active
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105'
                            : 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80'
                        }`}
                      >
                        {info?.label || keyId}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Left Hand Keys */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">左手主键群 (Left Hand - Upper Stack)</div>
                <div className="flex flex-wrap gap-2">
                  {leftHandKeys.map((keyId) => {
                    const active = isKeyActive(keyId);
                    const info = KEY_PITCH_MAP[keyId];
                    return (
                      <button
                        key={keyId}
                        onClick={() => handleKeyInteraction(keyId)}
                        className={`px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                          active
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105'
                            : 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80'
                        }`}
                      >
                        {info?.label || keyId}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Hand Keys */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">右手主键与侧键群 (Right Hand & Side Keys)</div>
                <div className="flex flex-wrap gap-2">
                  {rightHandKeys.map((keyId) => {
                    const active = isKeyActive(keyId);
                    const info = KEY_PITCH_MAP[keyId];
                    return (
                      <button
                        key={keyId}
                        onClick={() => handleKeyInteraction(keyId)}
                        className={`px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                          active
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105'
                            : 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80'
                        }`}
                      >
                        {info?.label || keyId}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

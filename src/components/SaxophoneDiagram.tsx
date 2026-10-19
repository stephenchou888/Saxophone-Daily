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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

const KEY_GROUPS: { title: string; keys: string[] }[] = [
  {
    title: '顶级/侧面辅助键群 (Auxiliary Keys)',
    keys: ['key_octave', 'key_front_f', 'key_palm_d', 'key_palm_eb', 'key_palm_f'],
  },
  {
    title: '左手主键群 (Left Hand - Upper Stack)',
    keys: ['key_lh1', 'key_lh2', 'key_lh3', 'key_lh_gis', 'key_lh_cis', 'key_lh_low_b', 'key_lh_low_bb'],
  },
  {
    title: '右手主键与侧键群 (Right Hand & Side Keys)',
    keys: ['key_rh1', 'key_rh2', 'key_rh3', 'key_side_c', 'key_side_bb', 'key_high_fis', 'key_rh_eb', 'key_rh_c'],
  },
];

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
  const [viewMode, setViewMode] = useState<'split' | 'diagram' | 'photo'>('diagram');
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

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 select-none">
      {/* ===================== Header: Title + View Switcher (示意图 / 实物图 / 双屏) ===================== */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2.5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">指法图示</h2>
          <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 shrink-0 text-primary" />
            {saxType === 'alto' ? '中音萨克斯 (Eb Alto · 降E调)' : '高音萨克斯 (Bb Soprano · 降B调)'}
            <Badge variant="soft" className="hidden sm:inline-flex">
              {saxType === 'alto' ? '实音低大六度 (移调 -9 半音)' : '实音低大二度 (移调 -2 半音)'}
            </Badge>
          </p>
        </div>

        <ToggleGroup
          type="single"
          variant="pill"
          size="sm"
          value={viewMode}
          onValueChange={(v) => v && setViewMode(v as typeof viewMode)}
        >
          <ToggleGroupItem value="diagram" className="px-3 text-xs font-semibold">
            <Sliders className="size-3.5" /> 示意图
          </ToggleGroupItem>
          <ToggleGroupItem value="photo" className="px-3 text-xs font-semibold">
            <Camera className="size-3.5" /> 实物图
          </ToggleGroupItem>
          <ToggleGroupItem value="split" className="px-3 text-xs font-semibold">
            <Layers className="size-3.5" /> 双屏对照
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* ===================== Main Instrument Display Box ===================== */}
      <div className="grid w-full grid-cols-1 items-stretch justify-center gap-5 md:grid-cols-12">
        {/* ==================== 1. 真实乐器实拍照 ==================== */}
        {(viewMode === 'split' || viewMode === 'photo') && (
          <div
            className={`relative flex flex-col justify-between overflow-hidden rounded-xl border bg-muted/20 p-4 sm:p-5 ${
              viewMode === 'split' ? 'md:col-span-6' : 'md:col-span-12 w-full max-w-3xl mx-auto'
            }`}
          >
            {/* Header */}
            <div className="mb-3 flex w-full items-center justify-between border-b pb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-primary sm:text-sm">
                <Camera className="size-4" />
                真实乐器实拍照 ({saxType === 'alto' ? '经典弯管中音 Eb Alto' : '通体直管高音 Bb Soprano'})
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-[11px]"
                onClick={() => setShowAnnotations(!showAnnotations)}
              >
                <Eye className="size-3" />
                {showAnnotations ? '隐藏标记' : '显示标记'}
              </Button>
            </div>

            {/* Top anatomical pill tags */}
            {showAnnotations && (
              <div className="mb-2 flex w-full items-center justify-between">
                <Badge variant="soft" className="rounded-full">① 泛音弯颈 / 八度音孔</Badge>
                <Badge variant="outline" className="rounded-full border-destructive/30 text-destructive">
                  🔥 超吹前F键 / 掌键区
                </Badge>
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
            className={`flex flex-col rounded-xl border bg-muted/20 p-4 sm:p-5 ${
              viewMode === 'split' ? 'md:col-span-6' : 'md:col-span-12 w-full max-w-3xl mx-auto'
            }`}
          >
            <div className="mb-4 flex items-center justify-between gap-2 border-b pb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-primary sm:text-sm">
                <Sliders className="size-4" />
                高精交互指法图谱（点击任意按键即时试听）
              </span>
              <Badge variant="secondary">
                {activeKeys.length > 0 ? `当前激活 ${activeKeys.length} 个按键` : '全开音孔'}
              </Badge>
            </div>

            <div className="space-y-4">
              {KEY_GROUPS.map((group) => (
                <div key={group.title}>
                  <div className="mb-2 text-xs font-semibold text-muted-foreground">{group.title}</div>
                  <div className="flex flex-wrap gap-2">
                    {group.keys.map((keyId) => {
                      const active = isKeyActive(keyId);
                      return (
                        <Button
                          key={keyId}
                          variant={active ? 'default' : 'outline'}
                          size="sm"
                          aria-pressed={active}
                          onClick={() => handleKeyInteraction(keyId)}
                          className={cn('h-auto min-h-8 py-2 text-xs font-semibold', active && 'scale-105')}
                        >
                          {KEY_PITCH_MAP[keyId]?.label || keyId}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toolbar: Zoom + Register Switcher + Sound Engine Modes（放在图示下方，保证首屏先看到按键高亮） */}
      <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 border-t pt-3">
        <div className="flex items-center gap-0.5 rounded-lg bg-muted p-[3px]">
          <span className="px-1.5 text-[11px] text-muted-foreground">缩放</span>
          <Button variant="ghost" size="icon-sm" className="size-7" onClick={handleZoomOut} title="缩小">
            <ZoomOut className="size-3.5" />
          </Button>
          <span className="min-w-[40px] text-center font-mono text-[11px] font-semibold text-primary">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button variant="ghost" size="icon-sm" className="size-7" onClick={handleZoomIn} title="放大">
            <ZoomIn className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="size-7" onClick={handleResetZoom} title="还原原始比例">
            <RotateCcw className="size-3" />
          </Button>
        </div>

        {/* 音区快捷切换 */}
        <div className="flex items-center gap-1.5">
          <span className="hidden text-[11px] text-muted-foreground sm:inline-block">试听音区</span>
          <ToggleGroup
            type="single"
            variant="pill"
            size="sm"
            value={register}
            onValueChange={(v) => v && setRegister(v as SaxRegister)}
          >
            <ToggleGroupItem value="low" className="h-7 px-2.5 text-[11px]">
              低/中八度
            </ToggleGroupItem>
            <ToggleGroupItem value="high" className="h-7 px-2.5 text-[11px]">
              <Zap className="size-3 fill-current" /> 高八度 (+8ve)
            </ToggleGroupItem>
            <ToggleGroupItem
              value="altissimo"
              className="h-7 px-2.5 text-[11px] data-[state=on]:bg-destructive data-[state=on]:text-white"
            >
              <Flame className="size-3.5 fill-current text-amber-400" /> 超吹 (Altissimo)
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Sound Feedback mode & Mute */}
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            variant="pill"
            size="sm"
            value={soundMode}
            onValueChange={(v) => v && setSoundMode(v as typeof soundMode)}
          >
            <ToggleGroupItem value="both" className="h-7 px-2 text-[11px]">
              键音+乐音
            </ToggleGroupItem>
            <ToggleGroupItem value="tone" className="h-7 px-2 text-[11px]">
              仅乐音
            </ToggleGroupItem>
            <ToggleGroupItem value="click" className="h-7 px-2 text-[11px]">
              仅机械声
            </ToggleGroupItem>
          </ToggleGroup>

          <Toggle
            variant="outline"
            size="sm"
            pressed={isMuted}
            onPressedChange={setIsMuted}
            title="静音开关"
            aria-label="静音开关"
            className="text-success data-[state=on]:border-destructive/40 data-[state=on]:bg-destructive/15 data-[state=on]:text-destructive"
          >
            {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
          </Toggle>
        </div>
      </div>



      {/* ===================== Real-time Sound & Pitch Feedback Banner ===================== */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3.5 py-2 text-xs">
        {lastPlayedKey ? (
          <div className="flex flex-wrap items-center gap-2 font-semibold">
            <Badge variant={lastPlayedKey.register === 'altissimo' ? 'destructive' : 'soft'}>
              {lastPlayedKey.register === 'altissimo'
                ? '🔥 超吹 Altissimo'
                : lastPlayedKey.register === 'high'
                ? '⚡ 高八度'
                : '🎵 标准音区'}
            </Badge>
            <span className="font-bold">{lastPlayedKey.label}</span>
            <span className="text-[11px] text-muted-foreground">
              记谱音: <b className="text-primary">{lastPlayedKey.writtenNote}</b> ({lastPlayedKey.writtenFreq}Hz)
            </span>
            <Badge variant="outline" className="bg-card">
              {saxType === 'alto' ? '中音实音 (Eb)' : '高音实音 (Bb)'}:
              <b className="text-success">{lastPlayedKey.concertNote}</b> ({lastPlayedKey.concertFreq}Hz)
            </Badge>
          </div>
        ) : (
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Info className="size-3.5 shrink-0 text-primary" />
            点击任意按钮或音孔即可即时试听
          </span>
        )}
        <span className="hidden text-[11px] font-semibold text-primary md:block">
          当前乐器: {saxType === 'alto' ? '经典弯管中音 (Eb Alto)' : '通体直管高音 (Bb Soprano)'}
        </span>
      </div>
    </div>
  );
};

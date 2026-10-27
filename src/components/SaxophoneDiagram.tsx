import React, { useState, useCallback } from 'react';
import { SaxophoneType } from '../types/music';
import {
  Camera,
  Eye,
  Volume2,
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { findNotesByKeys } from '@/lib/fingeringLookup';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// 示意图按键布局（坐标取自设计稿，画布 300×548）。shape: hole = 主音孔圆键，pill = 叉键，key = 侧键/掌键/小指键
type SchematicKey = { id: string; label: string; x: number; y: number; w: number; h: number; shape: 'hole' | 'pill' | 'key' };

const SCHEMATIC_KEYS: SchematicKey[] = [
  { id: 'key_octave', label: '8va', x: 30, y: 34, w: 26, h: 26, shape: 'pill' },
  { id: 'key_front_f', label: '前 F', x: 116, y: 40, w: 68, h: 18, shape: 'pill' },
  { id: 'key_palm_d', label: '掌 D', x: 222, y: 14, w: 52, h: 20, shape: 'key' },
  { id: 'key_palm_eb', label: '掌 E♭', x: 222, y: 40, w: 52, h: 20, shape: 'key' },
  { id: 'key_palm_f', label: '掌 F', x: 222, y: 66, w: 52, h: 20, shape: 'key' },
  { id: 'key_lh1', label: '1', x: 124, y: 104, w: 52, h: 52, shape: 'hole' },
  { id: 'key_lh2', label: '2', x: 124, y: 166, w: 52, h: 52, shape: 'hole' },
  { id: 'key_lh3', label: '3', x: 124, y: 228, w: 52, h: 52, shape: 'hole' },
  { id: 'key_lh_gis', label: 'G♯', x: 192, y: 244, w: 48, h: 20, shape: 'key' },
  { id: 'key_lh_cis', label: '低 C♯', x: 52, y: 206, w: 52, h: 20, shape: 'key' },
  { id: 'key_lh_low_b', label: '低 B', x: 52, y: 232, w: 52, h: 20, shape: 'key' },
  { id: 'key_lh_low_bb', label: '低 B♭', x: 52, y: 258, w: 52, h: 20, shape: 'key' },
  { id: 'key_rh1', label: '4', x: 124, y: 314, w: 52, h: 52, shape: 'hole' },
  { id: 'key_rh2', label: '5', x: 124, y: 376, w: 52, h: 52, shape: 'hole' },
  { id: 'key_rh3', label: '6', x: 124, y: 438, w: 52, h: 52, shape: 'hole' },
  { id: 'key_side_c', label: '侧 C', x: 196, y: 318, w: 52, h: 20, shape: 'key' },
  { id: 'key_side_bb', label: '侧 B♭', x: 196, y: 344, w: 52, h: 20, shape: 'key' },
  { id: 'key_high_fis', label: '高 F♯', x: 196, y: 370, w: 52, h: 20, shape: 'key' },
  { id: 'key_rh_eb', label: '低 E♭', x: 96, y: 510, w: 50, h: 24, shape: 'key' },
  { id: 'key_rh_c', label: '低 C', x: 154, y: 510, w: 50, h: 24, shape: 'key' },
];

const SCHEMATIC_SECTIONS: { label: string; y: number }[] = [
  { label: '拇指 / 掌键', y: 0 },
  { label: '左手', y: 108 },
  { label: '右手', y: 318 },
];

// 「左手1号键 (B音孔 · 左手食指)」→ 名称「左手1号键」，说明取括号内最后一段「左手食指」
function splitKeyLabel(label: string): { name: string; detail: string } {
  const m = label.match(/^(.*?)\s*\((.*)\)$/);
  if (!m) return { name: label, detail: '' };
  const parts = m[2].split('·').map((t) => t.trim());
  return { name: m[1], detail: parts[parts.length - 1] };
}

// 高音萨克斯实拍照的按键标注（#6）：坐标为原图像素（1388×6530）。
// 照片很窄，标签放在左右两侧的留白里，用虚线引向按键。
const SOPRANO_PHOTO = { width: 1388, height: 6530, gutter: 1500 };

type PhotoKey = { id: string; label: string; x: number; y: number; side: 'left' | 'right'; tone: 'main' | 'palm' | 'pinky' };

const SOPRANO_PHOTO_KEYS: PhotoKey[] = [
  { id: 'key_octave', label: '8度泛音', x: 760, y: 820, side: 'left', tone: 'main' },
  { id: 'key_palm_d', label: '掌 D', x: 1014, y: 2050, side: 'right', tone: 'palm' },
  { id: 'key_palm_eb', label: '掌 E♭', x: 1079, y: 2271, side: 'right', tone: 'palm' },
  { id: 'key_palm_f', label: '掌 F', x: 1021, y: 2457, side: 'right', tone: 'palm' },
  { id: 'key_lh_gis', label: 'G♯', x: 1100, y: 2800, side: 'right', tone: 'pinky' },
  { id: 'key_lh1', label: '1 (B)', x: 779, y: 2143, side: 'left', tone: 'main' },
  { id: 'key_lh2', label: '2 (A)', x: 800, y: 2436, side: 'left', tone: 'main' },
  { id: 'key_lh3', label: '3 (G)', x: 893, y: 2626, side: 'left', tone: 'main' },
  { id: 'key_rh1', label: '4 (F)', x: 717, y: 3425, side: 'left', tone: 'main' },
  { id: 'key_rh2', label: '5 (E)', x: 720, y: 3692, side: 'left', tone: 'main' },
  { id: 'key_rh3', label: '6 (D)', x: 692, y: 3917, side: 'left', tone: 'main' },
];

// 与中音实拍照标注一致的配色：主键琥珀、掌键玫红、小指键靛蓝；激活时更亮
const PHOTO_TONE = {
  main: { on: '#f59e0b', off: '#b45309', stroke: '#fef08a' },
  palm: { on: '#f43f5e', off: '#be185d', stroke: '#fbcfe8' },
  pinky: { on: '#6366f1', off: '#4338ca', stroke: '#c7d2fe' },
};

const SopranoPhotoAnnotated: React.FC<{
  src: string;
  isKeyActive: (id: string) => boolean;
  onKey: (id: string) => void;
}> = ({ src, isKeyActive, onKey }) => {
  const { width, height, gutter } = SOPRANO_PHOTO;
  const labelW = 1150;
  const labelH = 230;
  const labelGap = 50;
  const pad = 90; // 照片是白底 JPG：四周加圆角白色衬底，深色模式下也像一张“相纸”
  // 每侧按纵向位置排开标签，相邻按键太近时把后一个标签往下推，避免重叠
  const labelCenter = new Map<string, number>();
  (['left', 'right'] as const).forEach((side) => {
    let prev = -Infinity;
    SOPRANO_PHOTO_KEYS.filter((k) => k.side === side)
      .sort((a, b) => a.y - b.y)
      .forEach((k) => {
        const cy = Math.max(k.y, prev + labelH + labelGap);
        labelCenter.set(k.id, cy);
        prev = cy;
      });
  });
  return (
    <svg
      viewBox={`${-gutter} ${-pad} ${width + gutter * 2} ${height + pad * 2}`}
      width={421}
      height={600}
      role="img"
      aria-label="高音萨克斯实拍照（含按键标注）"
      className="mx-auto block h-auto w-full max-w-[421px] drop-shadow-xl"
    >
      <rect x={-pad} y={-pad} width={width + pad * 2} height={height + pad * 2} rx={120} fill="#ffffff" />
      <image href={src} x={0} y={0} width={width} height={height} />
      {SOPRANO_PHOTO_KEYS.map((k) => {
        const active = isKeyActive(k.id);
        const tone = PHOTO_TONE[k.tone];
        const labelX = k.side === 'left' ? -gutter + 60 : width + gutter - 60 - labelW;
        const edgeX = k.side === 'left' ? labelX + labelW : labelX;
        const cy = labelCenter.get(k.id) ?? k.y;
        const labelY = cy - labelH / 2;
        return (
          <g
            key={k.id}
            role="button"
            tabIndex={0}
            aria-label={`${KEY_PITCH_MAP[k.id]?.label ?? k.label}，${active ? '按下' : '开放'}`}
            onClick={() => onKey(k.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // 空格默认会滚动页面
                onKey(k.id);
              }
            }}
            className="group cursor-pointer outline-none"
          >
            <path
              d={`M ${edgeX} ${cy} L ${k.x} ${k.y}`}
              stroke={tone.on}
              strokeWidth={18}
              strokeDasharray="60 40"
              fill="none"
            />
            <circle
              cx={k.x}
              cy={k.y}
              r={active ? 95 : 55}
              fill={active ? tone.on : tone.off}
              fillOpacity={active ? 0.55 : 0.9}
              stroke={tone.stroke}
              strokeWidth={14}
            />
            <rect
              x={labelX}
              y={labelY}
              width={labelW}
              height={labelH}
              rx={60}
              fill={active ? tone.on : tone.off}
              stroke={tone.stroke}
              strokeWidth={active ? 26 : 14}
              className="transition-all duration-150 group-hover:brightness-125 group-focus-visible:brightness-125"
            />
            <text
              x={labelX + labelW / 2}
              y={cy}
              fontSize={150}
              fontWeight="bold"
              fill="#ffffff"
              textAnchor="middle"
              dominantBaseline="central"
              pointerEvents="none"
            >
              {k.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

interface SaxophoneDiagramProps {
  activeKeys: string[];
  saxType: SaxophoneType;
  /** 当前音的指法提示（#18），示意图视图中显示 */
  tip?: string;
  /** 当前音阶的音名列表，用于“查指法”时判断能否跳转 */
  scaleNotes?: string[];
  /** 查指法：试听识别出的音 */
  onPlayNote?: (note: string) => void;
  /** 查指法：跳到当前音阶中的该音 */
  onJumpToNote?: (note: string) => void;
  onKeyClick?: (keyId: string) => void;
}

export const SaxophoneDiagram: React.FC<SaxophoneDiagramProps> = ({
  activeKeys,
  saxType,
  tip,
  scaleNotes = [],
  onPlayNote,
  onJumpToNote,
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

  // 查指法模式（#4）：在示意图上自由组合按键，反查对应的音；关闭时图示跟随当前音
  const [exploreMode, setExploreMode] = useState(false);
  const [exploreKeys, setExploreKeys] = useState<string[]>([]);
  const schematicKeys = exploreMode ? exploreKeys : activeKeys;
  const matchedNotes = exploreMode ? findNotesByKeys(exploreKeys) : [];

  const setExplore = (on: boolean) => {
    if (on) setExploreKeys(activeKeys);
    setExploreMode(on);
  };

  const handleSchematicKey = (keyId: string) => {
    if (exploreMode) {
      setExploreKeys((keys) => (keys.includes(keyId) ? keys.filter((k) => k !== keyId) : [...keys, keyId]));
    }
    handleKeyInteraction(keyId);
  };

  // Key Interaction with specific or current register
  const handleKeyInteraction = useCallback(
    (keyId: string, customRegister?: SaxRegister) => {
      let activeReg = customRegister || register;
      if (keyId === 'key_octave') {
        activeReg = register === 'low' ? 'high' : register;
      } else if (keyId === 'key_front_f' || keyId.startsWith('key_palm')) {
        // 前 F 与掌键只用于高音区（掌键 D6/E♭6/F6）：低音区下自动按超吹音区发声，
        // 与实拍照标注、当前音符卡对掌键音的分类保持一致
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

      playSaxKeyAction(keyId, saxType, {
        soundMode,
        register: activeReg,
        customFreq: writtenFreq,
      });

      onKeyClick?.(keyId);
    },
    [onKeyClick, playSaxKeyAction, register, saxType, soundMode]
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
          <h2 className="text-base font-semibold tracking-tight">指法图示</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {saxType === 'alto' ? 'E♭ 中音萨克斯 · 实音低大六度' : 'B♭ 高音萨克斯 · 实音低大二度'} · 点击按键试听
          </p>
        </div>

        <ToggleGroup
          type="single"
          variant="pill"
          size="sm"
          value={viewMode}
          onValueChange={(v) => {
            if (!v) return;
            setViewMode(v as typeof viewMode);
            if (v !== 'diagram') setExploreMode(false);
          }}
        >
          <ToggleGroupItem value="diagram" className="h-7 px-3 text-[13px] font-medium">
            示意图
          </ToggleGroupItem>
          <ToggleGroupItem value="photo" className="h-7 px-3 text-[13px] font-medium">
            实物图
          </ToggleGroupItem>
          <ToggleGroupItem value="split" className="h-7 px-3 text-[13px] font-medium">
            双屏对照
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* ===================== Main Instrument Display Box ===================== */}
      <div className="grid w-full grid-cols-1 items-stretch justify-center gap-5 md:grid-cols-12">
        {/* ==================== 1. 真实乐器实拍照 ==================== */}
        {(viewMode === 'split' || viewMode === 'photo') && (
          <div
            className={`relative flex flex-col overflow-hidden rounded-lg border bg-muted/40 p-4 sm:p-5 ${
              viewMode === 'split' ? 'md:col-span-6' : 'md:col-span-12 w-full max-w-3xl mx-auto'
            }`}
          >
            {/* Header */}
            <div className="mb-3 flex w-full items-center justify-between border-b pb-2">
              <span className="flex items-center gap-1.5 text-[13px] font-medium">
                <Camera className="size-4 text-muted-foreground" />
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
                <Badge variant="outline" className="rounded-full text-muted-foreground">泛音弯颈 / 八度音孔</Badge>
                <Badge variant="outline" className="rounded-full text-muted-foreground">超吹前 F 键 / 掌键区</Badge>
              </div>
            )}

            {/* Real Instrument Photo Container */}
            {/* 容器高度跟随图片（#3）；缩放用 CSS zoom 参与布局，放大后可滚动查看而不是被裁切 */}
            <div className="relative flex w-full flex-1 flex-col justify-center overflow-auto py-2">
              <div className="pointer-events-none absolute inset-0 bg-radial from-brand/10 via-transparent to-transparent blur-3xl" />

              <div className="relative mx-auto w-fit select-none" style={{ zoom: zoomLevel }}>
                {showAnnotations && saxType === 'soprano' ? (
                  <SopranoPhotoAnnotated
                    src={realPhotoSrc}
                    isKeyActive={isKeyActive}
                    onKey={(id) => handleKeyInteraction(id)}
                  />
                ) : (
                  <img
                    src={realPhotoSrc}
                    alt={saxType === 'alto' ? '中音萨克斯实拍照' : '高音萨克斯实拍照'}
                    referrerPolicy="no-referrer"
                    className="block h-auto max-h-[520px] w-auto max-w-full object-contain drop-shadow-xl sm:max-h-[600px]"
                  />
                )}

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

        {/* ==================== 2. 指法示意图（设计稿布局） ==================== */}
        {(viewMode === 'split' || viewMode === 'diagram') && (
          <div
            className={cn(
              'flex flex-wrap gap-6',
              viewMode === 'split' ? 'md:col-span-6' : 'md:col-span-12'
            )}
          >
            <div className="mx-auto shrink-0 rounded-lg border bg-muted/40 px-3 py-4 sm:px-5">
              {/* 示意图画布固定 300px 宽，320px 宽的小屏手机上整体缩小以免横向溢出 */}
              <div className="relative h-[548px] w-[300px] max-[360px]:[zoom:0.8]">
                <div className="absolute top-24 left-[149px] h-96 w-0.5 bg-border" />
                <div className="absolute top-[300px] left-10 w-[220px] border-t border-dashed border-muted-foreground/30" />
                {SCHEMATIC_SECTIONS.map((sec) => (
                  <span
                    key={sec.label}
                    className="absolute left-0 text-[11px] font-medium text-muted-foreground"
                    style={{ top: sec.y }}
                  >
                    {sec.label}
                  </span>
                ))}
                {SCHEMATIC_KEYS.map((k) => {
                  const active = schematicKeys.includes(k.id);
                  return (
                    <button
                      key={k.id}
                      type="button"
                      aria-label={`${KEY_PITCH_MAP[k.id]?.label ?? k.label}，${active ? '按下' : '开放'}`}
                      aria-pressed={exploreMode ? active : undefined}
                      onClick={() => handleSchematicKey(k.id)}
                      className={cn(
                        'absolute flex cursor-pointer items-center justify-center p-0 transition-[background-color,border-color,transform] outline-none hover:scale-105 focus-visible:ring-[3px] focus-visible:ring-ring/50',
                        k.shape === 'hole' ? 'rounded-full text-base' : k.shape === 'pill' ? 'rounded-full text-[10px]' : 'rounded-md text-[10px]',
                        k.id === 'key_octave' && 'font-mono',
                        active
                          ? 'border-2 border-brand-strong bg-brand font-bold text-brand-foreground'
                          : cn('border-[1.5px] border-muted-foreground/30 bg-card text-muted-foreground', k.shape === 'hole' ? 'font-semibold' : 'font-medium')
                      )}
                      style={{ left: k.x, top: k.y, width: k.w, height: k.h }}
                    >
                      {k.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {viewMode === 'diagram' && (
              <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-4">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium">{exploreMode ? '已选按键' : '按下的按键'}</span>
                    <div className="flex items-center gap-2" title="在示意图上自由组合按键，反查对应的音">
                      <Switch id="explore-fingering" checked={exploreMode} onCheckedChange={setExplore} />
                      <Label htmlFor="explore-fingering" className="cursor-pointer text-xs text-muted-foreground">
                        查指法
                      </Label>
                    </div>
                  </div>
                  {exploreMode && (
                    <p className="mb-2 text-xs text-muted-foreground">点击示意图上的按键来按下 / 抬起，自动识别对应的音。</p>
                  )}
                  {schematicKeys.length === 0 ? (
                    <div className="rounded-lg border px-3 py-2.5 text-[13px] text-muted-foreground">
                      全开音孔（不按任何按键）
                    </div>
                  ) : (
                    <ul className="divide-y overflow-hidden rounded-lg border">
                      {SCHEMATIC_KEYS.map((k) => k.id)
                        .filter((id) => schematicKeys.includes(id))
                        .map((keyId) => {
                        const info = KEY_PITCH_MAP[keyId];
                        const { name, detail } = splitKeyLabel(info?.label ?? keyId);
                        return (
                          <li key={keyId} className="flex items-center gap-2.5 px-3 py-2.5">
                            <span className="size-2.5 shrink-0 rounded-full bg-brand" />
                            <div className="min-w-0 flex-1">
                              <div className="text-[13px] font-medium">{name}</div>
                              {detail && <div className="text-xs text-muted-foreground">{detail}</div>}
                            </div>
                            <span className="font-mono text-[11px] text-muted-foreground">{info?.shortName}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {exploreMode && (
                  <div className="space-y-2.5 rounded-lg border p-3" aria-live="polite">
                    <div className="text-xs text-muted-foreground">对应的音</div>
                    {matchedNotes.length > 0 ? (
                      <>
                        <div className="font-mono text-2xl font-semibold tracking-tight">
                          {matchedNotes.map((n) => n.replace('#', '♯').replace(/^([A-G])b/, '$1♭')).join(' / ')}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => onPlayNote?.(matchedNotes[0])}>
                            <Volume2 /> 试听
                          </Button>
                          {matchedNotes.some((n) => scaleNotes.includes(n)) && (
                            <Button
                              size="sm"
                              onClick={() => {
                                onJumpToNote?.(matchedNotes.find((n) => scaleNotes.includes(n))!);
                                setExploreMode(false);
                              }}
                            >
                              跳到该音
                            </Button>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-[13px] text-muted-foreground">这个按键组合不是常用的标准指法。</p>
                    )}
                  </div>
                )}

                {!exploreMode && tip && (
                  <div className="flex gap-2.5 rounded-lg bg-muted p-3">
                    <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <p className="text-[13px] text-foreground/80">{tip}</p>
                  </div>
                )}

                <div className="mt-auto flex flex-col gap-2 border-t pt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="size-3 shrink-0 rounded-full border-[1.5px] border-brand-strong bg-brand" />
                    闭合：手指按严封孔
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 shrink-0 rounded-full border-[1.5px] border-muted-foreground/30 bg-card" />
                    开放：手指自然贴附微悬
                  </div>
                </div>
              </div>
            )}
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
          <span className="min-w-[40px] text-center font-mono text-[11px] font-semibold">
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
              <Zap className="size-3" /> 高八度<span className="max-sm:hidden"> (+8ve)</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="altissimo"
              className="h-7 px-2.5 text-[11px] data-[state=on]:bg-destructive data-[state=on]:text-white"
            >
              <Flame className="size-3.5" /> 超吹<span className="max-sm:hidden"> (Altissimo)</span>
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

        </div>
      </div>



      {/* ===================== Real-time Sound & Pitch Feedback Banner ===================== */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-xs">
        {lastPlayedKey ? (
          <div className="flex flex-wrap items-center gap-2 font-medium">
            <Badge variant={lastPlayedKey.register === 'altissimo' ? 'destructive' : 'outline'} className="bg-card">
              {lastPlayedKey.register === 'altissimo'
                ? '超吹 Altissimo'
                : lastPlayedKey.register === 'high'
                ? '高八度'
                : '标准音区'}
            </Badge>
            <span>{lastPlayedKey.label}</span>
            <span className="text-[11px] text-muted-foreground">
              记谱音 <b className="font-mono text-foreground">{lastPlayedKey.writtenNote}</b> ({lastPlayedKey.writtenFreq}Hz)
            </span>
            <Badge variant="outline" className="bg-card">
              {saxType === 'alto' ? '中音实音 (Eb)' : '高音实音 (Bb)'}:
              <b className="text-success">{lastPlayedKey.concertNote}</b> ({lastPlayedKey.concertFreq}Hz)
            </Badge>
          </div>
        ) : (
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Info className="size-3.5 shrink-0" />
            点击任意按钮或音孔即可即时试听
          </span>
        )}
        <span className="hidden text-[11px] text-muted-foreground md:block">
          当前乐器: {saxType === 'alto' ? '经典弯管中音 (Eb Alto)' : '通体直管高音 (Bb Soprano)'}
        </span>
      </div>
    </div>
  );
};

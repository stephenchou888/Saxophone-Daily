import React, { useState } from 'react';
import { ArrowLeftRight, RotateCcw, Volume2 } from 'lucide-react';
import { SaxophoneType } from '../types/music';
import { SaxRegister, useSoundEngine } from '../hooks/useSoundEngine';
import {
  SpelledNote,
  TRANSPOSITION,
  buildKeyTable,
  formatNote,
  midiToName,
  parseNote,
  toMidi,
  writtenToConcert,
} from '../lib/transposition';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TranspositionChartProps {
  saxType: SaxophoneType;
  /** 当前练习的记谱音（如 "F#4"），图示默认跟随它 */
  currentNote: string;
}

// ===================== 键盘几何（钢琴实音 C3 ~ B5，三个八度） =====================
const LOW = 48; // C3
const HIGH = 83; // B5
const M = 10; // 左右留白
const WW = 30; // 白键宽
const BW = 18; // 黑键宽
const WHITE_COUNT = 21;
const VIEW_W = M * 2 + WW * WHITE_COUNT;

const ALTO_BASE = 64; // 中音弧线端点
const ALTO_BLACK_Y = 80; // 中音记谱条：黑键位置标签
const ALTO_WHITE_Y = 98; // 中音记谱条：白键位置标签
const PIANO_TOP = 108;
const WHITE_H = 116;
const BLACK_H = 72;
const SOP_WHITE_Y = PIANO_TOP + WHITE_H + 18;
const SOP_BLACK_Y = SOP_WHITE_Y + 16;
const SOP_BASE = SOP_BLACK_Y + 10;
const ARC_H = 38;
const VIEW_H = SOP_BASE + ARC_H + 24;

const WHITE_IDX: Record<number, number> = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 };

interface KeyGeom {
  midi: number;
  black: boolean;
  x: number;
  w: number;
  cx: number;
}

const KEYS: KeyGeom[] = Array.from({ length: HIGH - LOW + 1 }, (_, i) => {
  const midi = LOW + i;
  const pc = midi % 12;
  const oct = Math.floor((midi - LOW) / 12);
  if (pc in WHITE_IDX) {
    const x = M + (oct * 7 + WHITE_IDX[pc]) * WW;
    return { midi, black: false, x, w: WW, cx: x + WW / 2 };
  }
  const cx = M + (oct * 7 + WHITE_IDX[pc - 1] + 1) * WW;
  return { midi, black: true, x: cx - BW / 2, w: BW, cx };
});
const keyAt = (midi: number) => KEYS[midi - LOW];

const freqOf = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);
const registerOf = (writtenMidi: number): SaxRegister => (writtenMidi >= 86 ? 'altissimo' : writtenMidi >= 74 ? 'high' : 'low');

const SAX_LABEL: Record<SaxophoneType, string> = { alto: '中音萨克斯 E♭', soprano: '高音萨克斯 B♭' };
const SAX_TIP: Record<SaxophoneType, string> = {
  alto: '钢琴音往上数大六度（或往下数小三度），就是中音谱上的音',
  soprano: '钢琴音往上升一个全音（大二度），就是高音谱上的音',
};
// 中音用琥珀 brand 色，高音用天蓝色，与图中弧线、键位一一对应
const SAX_STYLE: Record<SaxophoneType, { fill: string; text: string; dot: string; ring: string }> = {
  alto: { fill: 'fill-brand', text: 'text-brand-strong', dot: 'bg-brand', ring: 'border-brand/50 bg-brand/5' },
  soprano: { fill: 'fill-sky-500', text: 'text-sky-600 dark:text-sky-400', dot: 'bg-sky-500', ring: 'border-sky-500/50 bg-sky-500/5' },
};

const WRITTEN_CHOICES = ['C4', 'C#4', 'D4', 'Eb4', 'E4', 'F4', 'F#4', 'G4', 'Ab4', 'A4', 'Bb4', 'B4'];
const KEY_TABLE = buildKeyTable();

/** 记谱音显示时折叠到键盘能同时画出记谱位置与两种实音的范围内（返回折叠的八度数） */
function foldIntoView(written: SpelledNote): { note: SpelledNote; folded: number } {
  let folded = 0;
  let midi = toMidi(written);
  while (midi > HIGH) {
    midi -= 12;
    folded -= 1;
  }
  while (midi + TRANSPOSITION.alto.semitones < LOW) {
    midi += 12;
    folded += 1;
  }
  return { note: { ...written, octave: written.octave + folded }, folded };
}

export const TranspositionChart: React.FC<TranspositionChartProps> = ({ saxType, currentNote }) => {
  const { playTone } = useSoundEngine();
  // 手动选的记谱音只在当前练习音不变时有效；练习音一变，图示自动回到跟随状态
  const [picked, setPicked] = useState<{ note: string; at: string } | null>(null);
  const writtenName = picked && picked.at === currentNote ? picked.note : currentNote;
  const following = writtenName === currentNote;

  const written = parseNote(writtenName) ?? parseNote('C4')!;
  const { note: shown, folded } = foldIntoView(written);
  const shownMidi = toMidi(shown);
  const sounding = { alto: writtenToConcert(shown, 'alto'), soprano: writtenToConcert(shown, 'soprano') };

  const pick = (name: string) => setPicked({ note: name, at: currentNote });

  const playWritten = (writtenMidi: number, sax: SaxophoneType) =>
    playTone(freqOf(writtenMidi), sax, 0.6, registerOf(writtenMidi));
  // 钢琴键直接按实音发声（用当前乐器音色）：记谱 = 实音 − 移调半音数
  const playConcert = (concertMidi: number) => playWritten(concertMidi - TRANSPOSITION[saxType].semitones, saxType);

  // 记谱条：键位上方 / 下方标出“这个钢琴音在萨克斯谱上写作什么”。点击即选中该记谱音并以该乐器试听
  const onStripClick = (concertMidi: number, sax: SaxophoneType) => {
    const writtenMidi = concertMidi - TRANSPOSITION[sax].semitones;
    pick(midiToName(writtenMidi));
    playWritten(writtenMidi, sax);
  };

  const arcPath = (fromX: number, toX: number, base: number, dir: 1 | -1) => {
    const mid = (fromX + toX) / 2;
    return `M ${fromX} ${base} Q ${mid} ${base - dir * ARC_H * 2} ${toX} ${base}`;
  };

  const writtenKey = keyAt(shownMidi);
  const altoKey = keyAt(toMidi(sounding.alto));
  const sopKey = keyAt(toMidi(sounding.soprano));

  const keyFill = (k: KeyGeom) => {
    if (k === altoKey) return 'fill-brand';
    if (k === sopKey) return 'fill-sky-500';
    return k.black ? 'fill-zinc-900 hover:fill-zinc-700 dark:fill-zinc-950' : 'fill-white hover:fill-zinc-100 dark:fill-zinc-200';
  };

  const renderKey = (k: KeyGeom) => {
    const h = k.black ? BLACK_H : WHITE_H;
    const name = midiToName(k.midi);
    return (
      <g
        key={k.midi}
        role="button"
        tabIndex={0}
        aria-label={`钢琴 ${name}，点击试听实音`}
        className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-ring [&:focus-visible>rect]:stroke-2"
        onClick={() => playConcert(k.midi)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            playConcert(k.midi);
          }
        }}
      >
        <rect
          x={k.x}
          y={PIANO_TOP}
          width={k.w}
          height={h}
          rx={k.black ? 2 : 3}
          className={cn(keyFill(k), 'stroke-zinc-400 transition-colors dark:stroke-zinc-600')}
        />
        {!k.black && k.midi % 12 === 0 && (
          <text
            x={k.cx}
            y={PIANO_TOP + WHITE_H - 8}
            textAnchor="middle"
            className={cn('pointer-events-none text-[9px] font-medium', k === altoKey || k === sopKey ? 'fill-zinc-900' : 'fill-zinc-500')}
          >
            {k.midi === 60 ? '中央C' : name}
          </text>
        )}
      </g>
    );
  };

  const renderStrip = (sax: SaxophoneType) => {
    const shift = TRANSPOSITION[sax].semitones;
    const activeKey = sax === 'alto' ? altoKey : sopKey;
    const rows = sax === 'alto' ? { black: ALTO_BLACK_Y, white: ALTO_WHITE_Y } : { black: SOP_BLACK_Y, white: SOP_WHITE_Y };
    return KEYS.map((k) => {
      const y = k.black ? rows.black : rows.white;
      const active = k === activeKey;
      const label = active ? formatNote(shown) : midiToName(k.midi - shift);
      return (
        <g
          key={`${sax}-${k.midi}`}
          role="button"
          tabIndex={0}
          aria-label={`${SAX_LABEL[sax]}记谱 ${midiToName(k.midi - shift)}（钢琴 ${midiToName(k.midi)}），点击选中并试听`}
          className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-ring [&:focus-visible>rect]:stroke-2"
          onClick={() => onStripClick(k.midi, sax)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onStripClick(k.midi, sax);
            }
          }}
        >
          <title>{`钢琴 ${midiToName(k.midi)} = ${SAX_LABEL[sax]}谱上的 ${midiToName(k.midi - shift)}`}</title>
          <rect
            x={k.cx - 14}
            y={y - 11}
            width={28}
            height={15}
            rx={4}
            className={active ? SAX_STYLE[sax].fill : 'fill-transparent hover:fill-muted'}
          />
          <text
            x={k.cx}
            y={y}
            textAnchor="middle"
            className={cn(
              'pointer-events-none font-mono text-[9px]',
              active
                ? sax === 'alto'
                  ? 'fill-brand-foreground font-semibold'
                  : 'fill-white font-semibold'
                : 'fill-muted-foreground'
            )}
          >
            {label}
          </text>
        </g>
      );
    });
  };

  const renderArc = (sax: SaxophoneType) => {
    const to = sax === 'alto' ? altoKey : sopKey;
    const base = sax === 'alto' ? ALTO_BASE : SOP_BASE;
    const dir = sax === 'alto' ? 1 : -1;
    const peakY = base - dir * ARC_H;
    const t = TRANSPOSITION[sax];
    return (
      <g className={sax === 'alto' ? 'text-brand' : 'text-sky-500'}>
        {/* 记谱位置与实音位置的竖向引线 */}
        {[writtenKey.cx, to.cx].map((x, i) => (
          <line
            key={i}
            x1={x}
            x2={x}
            y1={base}
            y2={sax === 'alto' ? PIANO_TOP : PIANO_TOP + WHITE_H}
            stroke="currentColor"
            strokeWidth={1}
            strokeDasharray="2 3"
            opacity={0.6}
          />
        ))}
        <path
          d={arcPath(writtenKey.cx, to.cx, base, dir)}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          markerEnd={`url(#arrow-${sax})`}
        />
        <text
          x={(writtenKey.cx + to.cx) / 2}
          y={peakY + (sax === 'alto' ? -6 : 14)}
          textAnchor="middle"
          className="fill-foreground text-[11px] font-semibold"
        >
          {sax === 'alto' ? '中音' : '高音'} ↓ {t.interval}（{-t.semitones} 个半音）
        </text>
      </g>
    );
  };

  return (
    <Card className="py-5 sm:py-6">
      <CardContent className="space-y-4 px-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <ArrowLeftRight className="size-[18px]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold tracking-tight">萨克斯 ↔ 钢琴 移调原理图</h2>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                萨克斯是移调乐器：谱上写的 C，中音吹出来是钢琴的 E♭，高音吹出来是钢琴的 B♭。
                键盘上方标出每个钢琴键在<span className={SAX_STYLE.alto.text}>中音谱</span>上的写法，下方是
                <span className={SAX_STYLE.soprano.text}>高音谱</span>的写法；弧线从记谱位置指向实际发音。
              </p>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 text-muted-foreground">
            {following ? '跟随当前音' : '手动选择'}
          </Badge>
        </div>

        {/* 选择记谱音 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-muted-foreground">记谱音</span>
          {WRITTEN_CHOICES.map((n) => {
            const isOn = toMidi(parseNote(n)!) % 12 === toMidi(written) % 12;
            return (
              <Button
                key={n}
                size="sm"
                variant={isOn ? 'brand' : 'outline'}
                className="h-7 min-w-10 px-2 font-mono text-xs"
                onClick={() => pick(n)}
              >
                {n.slice(0, -1).replace('#', '♯').replace('b', '♭')}
              </Button>
            );
          })}
          {!following && (
            <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => setPicked(null)}>
              <RotateCcw /> 回到当前音
            </Button>
          )}
        </div>

        {/* 原理图：钢琴键盘 + 上下两条记谱条 + 移调弧线 */}
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="mx-auto block w-full min-w-[600px] max-w-[900px] select-none"
            role="img"
            aria-label={`记谱 ${formatNote(shown)}：中音萨克斯实际发音 ${formatNote(sounding.alto)}，高音萨克斯实际发音 ${formatNote(sounding.soprano)}`}
          >
            <defs>
              {(['alto', 'soprano'] as const).map((sax) => (
                <marker
                  key={sax}
                  id={`arrow-${sax}`}
                  viewBox="0 0 10 10"
                  refX={8}
                  refY={5}
                  markerWidth={7}
                  markerHeight={7}
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" className={SAX_STYLE[sax].fill} />
                </marker>
              ))}
            </defs>

            {/* 记谱条底色 */}
            <rect x={M - 4} y={ALTO_BLACK_Y - 14} width={VIEW_W - 2 * M + 8} height={ALTO_WHITE_Y - ALTO_BLACK_Y + 20} rx={6} className="fill-brand/10" />
            <rect x={M - 4} y={SOP_WHITE_Y - 14} width={VIEW_W - 2 * M + 8} height={SOP_BLACK_Y - SOP_WHITE_Y + 20} rx={6} className="fill-sky-500/10" />

            {renderStrip('alto')}
            {renderStrip('soprano')}
            {renderArc('alto')}
            {renderArc('soprano')}

            {KEYS.filter((k) => !k.black).map(renderKey)}
            {KEYS.filter((k) => k.black).map(renderKey)}

            {/* 记谱位置：虚线框 + “谱” 标记 */}
            <rect
              x={writtenKey.x + 1.5}
              y={PIANO_TOP + 1.5}
              width={writtenKey.w - 3}
              height={(writtenKey.black ? BLACK_H : WHITE_H) - 3}
              rx={2}
              className={cn('pointer-events-none fill-none', writtenKey.black ? 'stroke-white' : 'stroke-foreground dark:stroke-zinc-900')}
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <text
              x={writtenKey.cx}
              y={PIANO_TOP + (writtenKey.black ? BLACK_H - 10 : WHITE_H - 24)}
              textAnchor="middle"
              className={cn('pointer-events-none text-[10px] font-semibold', writtenKey.black ? 'fill-white' : 'fill-zinc-900')}
            >
              谱
            </text>
          </svg>
        </div>
        {folded !== 0 && (
          <p className="text-xs text-muted-foreground">
            当前音 {formatNote(written)} 超出图示键盘范围，已按{folded < 0 ? '低' : '高'} {Math.abs(folded)} 个八度示意，移调关系不变。
          </p>
        )}

        {/* 两种乐器的对应结论 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(['alto', 'soprano'] as const).map((sax) => {
            const t = TRANSPOSITION[sax];
            const concert = sounding[sax];
            return (
              <div
                key={sax}
                className={cn('rounded-lg border p-4', SAX_STYLE[sax].ring, sax === saxType && 'ring-1 ring-foreground/10')}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className={cn('size-2.5 rounded-full', SAX_STYLE[sax].dot)} />
                    {SAX_LABEL[sax]}
                    {sax === saxType && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[11px]">
                        当前乐器
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => playWritten(shownMidi, sax)}
                    aria-label={`试听${SAX_LABEL[sax]}吹 ${formatNote(shown)}`}
                  >
                    <Volume2 /> 试听
                  </Button>
                </div>
                <div className="mt-3 flex items-baseline gap-2 font-mono">
                  <span className="text-xs text-muted-foreground">记谱</span>
                  <span className="text-2xl font-semibold">{formatNote(shown)}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-xs text-muted-foreground">钢琴</span>
                  <span className={cn('text-2xl font-semibold', SAX_STYLE[sax].text)}>{formatNote(concert)}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  实音比记谱低{t.interval}（{-t.semitones} 个半音）；谱上的 C 就是钢琴的 {t.tonic}。
                  <br />
                  口诀：{SAX_TIP[sax]}。
                </p>
              </div>
            );
          })}
        </div>

        {/* 调号对照表 */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">调号对照（与钢琴合奏时）</h3>
          <div className="overflow-x-auto">
            <table className="w-full max-w-3xl min-w-[420px] text-left text-[13px]">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-1.5 pr-3 font-medium">钢琴 / 乐队实音</th>
                  <th className="py-1.5 pr-3 font-medium">
                    <span className={cn('mr-1.5 inline-block size-2 rounded-full', SAX_STYLE.alto.dot)} />
                    中音谱写作
                  </th>
                  <th className="py-1.5 font-medium">
                    <span className={cn('mr-1.5 inline-block size-2 rounded-full', SAX_STYLE.soprano.dot)} />
                    高音谱写作
                  </th>
                </tr>
              </thead>
              <tbody>
                {KEY_TABLE.map((row) => (
                  <tr key={row.concert.name} className="border-b last:border-0">
                    <td className="py-1.5 pr-3">
                      <span className="font-semibold">{row.concert.name} 大调</span>
                      <span className="ml-1.5 text-xs text-muted-foreground">{row.concert.sig}</span>
                    </td>
                    <td className="py-1.5 pr-3">
                      <span className={cn('font-semibold', SAX_STYLE.alto.text)}>{row.alto.name} 大调</span>
                      <span className="ml-1.5 text-xs text-muted-foreground">{row.alto.sig}</span>
                    </td>
                    <td className="py-1.5">
                      <span className={cn('font-semibold', SAX_STYLE.soprano.text)}>{row.soprano.name} 大调</span>
                      <span className="ml-1.5 text-xs text-muted-foreground">{row.soprano.sig}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            规律：中音谱比钢琴多 3 个升号（或少 3 个降号），高音谱多 2 个升号（或少 2 个降号）。
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

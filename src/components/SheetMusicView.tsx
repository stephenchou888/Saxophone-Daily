import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Eye, Sparkles, Hash } from 'lucide-react';
import { ScaleDefinition } from '../types/music';
import { scaleDisplayName } from '@/lib/dailyScale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// abcjs 体积较大（约占原构建包一半），按需加载，不阻塞首屏（#12）
const loadAbcjs = () => import('abcjs').then((m) => m.default);

interface SheetMusicViewProps {
  scale: ScaleDefinition;
  abcNotation?: string;
  currentNoteIndex: number;
  onNoteClick?: (index: number) => void;
  /** 每小节拍数（四分音符），默认 4；模进练习按组形设置，让每组落在整小节里 */
  beatsPerMeasure?: number;
  /** 谱面标题，默认“<调名> 视奏练习” */
  title?: string;
}

// 单行模式下每个音至少占的谱面宽度（abcjs 未缩放单位），音很多的模进练习据此加宽并横向滚动
const MIN_NOTE_WIDTH = 34;

export const SheetMusicView: React.FC<SheetMusicViewProps> = ({
  scale,
  abcNotation,
  currentNoteIndex,
  onNoteClick,
  beatsPerMeasure = 4,
  title,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  // Layout mode: 'single-line' (单行全景视奏) vs 'multi-line' (双行折叠排版)
  const [layoutMode, setLayoutMode] = useState<'single-line' | 'multi-line'>('single-line');
  // Zoom scale multiplier
  // 手机端谱面按原尺寸横向滑动，默认缩放略小以节省纵向空间
  const [scaleFactor, setScaleFactor] = useState<number>(() => (window.innerWidth < 640 ? 1.0 : 1.25));
  // 提示升降号开关 (Default: true，在音符上直接绘制 #/b 升降号标记)
  const [showAccidentals, setShowAccidentals] = useState<boolean>(true);
  // 音名唱名显示开关 (Default: true，在音符下方标注音名如 C#, F#, G#)
  const [showNoteNames, setShowNoteNames] = useState<boolean>(true);

  // 计算本调需要升降的特征音符列表
  const alteredNotes = useMemo(() => {
    const set = new Set<string>();
    scale.notes.forEach((n) => {
      if (n.includes('#') || n.includes('b')) {
        const clean = n.replace(/[0-9]/g, '').replace('#', '♯').replace('b', '♭');
        set.add(clean);
      }
    });
    return Array.from(set);
  }, [scale.notes]);

  // 根据当前调性、升降号提示开关、排版模式动态生成高精度 ABC 记谱
  const activeAbc = useMemo(() => {
    // 优先基于 scale.notes 生成精确带临时升降标记的 ABC
    if (scale && scale.notes && scale.notes.length > 0) {
      // 提取调号 (K:...)
      let keySig = 'C';
      const kMatch = (scale.abc || abcNotation || '').match(/K:([A-G][#b]?[m]?)/);
      if (kMatch) {
        keySig = kMatch[1];
      }

      const noteToAbc = (noteName: string, withAcc: boolean): string => {
        const match = noteName.match(/^([A-G])([#b]?)([3-6])$/);
        if (!match) return 'C';
        const [, letter, acc, octaveStr] = match;
        const octave = parseInt(octaveStr, 10);
        let prefix = '';
        if (withAcc) {
          if (acc === '#') prefix = '^';
          else if (acc === 'b') prefix = '_';
        }
        if (octave === 3) return `${prefix}${letter},`;
        if (octave === 4) return `${prefix}${letter.toUpperCase()}`;
        if (octave === 5) return `${prefix}${letter.toLowerCase()}`;
        if (octave === 6) return `${prefix}${letter.toLowerCase()}'`;
        return `${prefix}${letter}`;
      };

      const measures: string[] = [];
      const words: string[] = [];
      let curM: string[] = [];
      let curW: string[] = [];

      scale.notes.forEach((n, idx) => {
        const abcN = noteToAbc(n, showAccidentals);
        curM.push(abcN);
        const cleanLabel = n.replace(/[0-9]/g, '').replace('#', '♯').replace('b', '♭');
        curW.push(cleanLabel);

        if (curM.length === beatsPerMeasure || idx === scale.notes.length - 1) {
          measures.push(curM.join(' '));
          words.push(curW.join(' '));
          curM = [];
          curW = [];
        }
      });

      const header = `X:1\nT:${title ?? `${scaleDisplayName(scale)} 视奏练习`}\nM:${beatsPerMeasure}/4\nL:1/4\nK:${keySig}`;

      if (layoutMode === 'single-line') {
        const musicLine = measures.join(' | ') + ' |]';
        const lyricLine = showNoteNames ? `\nw: ` + words.join(' | ') + ' |]' : '';
        return `${header}\n${musicLine}${lyricLine}`;
      } else {
        const lines: string[] = [];
        for (let i = 0; i < measures.length; i += 2) {
          const lineM = measures.slice(i, i + 2).join(' | ') + (i + 2 >= measures.length ? ' |]' : ' |');
          lines.push(lineM);
          if (showNoteNames) {
            const lineW = words.slice(i, i + 2).join(' | ') + (i + 2 >= measures.length ? ' |]' : ' |');
            lines.push(`w: ${lineW}`);
          }
        }
        return `${header}\n${lines.join('\n')}`;
      }
    }

    // 回退原始 abcNotation
    const baseAbc = abcNotation || scale.abc || '';
    if (layoutMode === 'single-line') {
      const lines = baseAbc.split('\n');
      const headerLines: string[] = [];
      const musicLines: string[] = [];
      lines.forEach((l) => {
        if (/^[A-Za-z]:/.test(l)) {
          headerLines.push(l);
        } else {
          musicLines.push(l.trim());
        }
      });
      return `${headerLines.join('\n')}\n${musicLines.join(' ')}`;
    }
    return baseAbc;
  }, [scale, abcNotation, layoutMode, showAccidentals, showNoteNames, beatsPerMeasure, title]);

  // 每次渲染完成后递增，驱动下方的当前音高亮（渲染是异步的）
  const [renderTick, setRenderTick] = useState(0);

  // 渲染乐谱（ABCjs 矢量 SVG）
  useEffect(() => {
    let cancelled = false;

    loadAbcjs().then((abcjs) => {
      const el = containerRef.current;
      if (cancelled || !el) return;

      try {
        el.innerHTML = '';
        const containerWidth = scrollWrapperRef.current?.clientWidth || 900;
        const targetStaffWidth = layoutMode === 'single-line'
          ? Math.max(1100, containerWidth - 40, scale.notes.length * MIN_NOTE_WIDTH)
          : Math.max(760, containerWidth - 40);
        // 谱面放得下时铺满容器；窄屏（手机）或音太多时按原尺寸渲染并横向滑动，避免被压缩得看不清
        const fitsContainer = containerWidth >= 640 && targetStaffWidth * scaleFactor <= containerWidth * 1.4;

        abcjs.renderAbc(el, activeAbc, {
          responsive: fitsContainer ? 'resize' : undefined,
          scale: scaleFactor,
          staffwidth: targetStaffWidth,
          // 单行模式下强制拉满整行，避免容器变宽后谱面只占左侧一部分
          format: layoutMode === 'single-line' ? { stretchlast: true } : undefined,
          add_classes: true,
          paddingtop: 16,
          paddingbottom: 16,
          paddingleft: 18,
          paddingright: 18,
        });

        // 为音符添加点击切音交互
        if (onNoteClick) {
          const notes = el.querySelectorAll('.abcjs-note');
          notes.forEach((noteEl, idx) => {
            (noteEl as HTMLElement).style.cursor = 'pointer';
            noteEl.addEventListener('click', () => onNoteClick(idx));
          });
        }
        setRenderTick((t) => t + 1);
      } catch (err) {
        console.error('Error rendering ABC sheet music:', err);
      }
    }).catch((err) => console.error('Error loading abcjs:', err));

    return () => {
      cancelled = true;
    };
  }, [activeAbc, scaleFactor, layoutMode, onNoteClick]);

  // 同步高亮当前正在弹奏/练习的音符
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // 清除旧高亮
    const oldActives = el.querySelectorAll('.active-score-note');
    oldActives.forEach((node) => {
      node.classList.remove('active-score-note');
      node.querySelectorAll('path').forEach((p) => {
        p.style.fill = '';
        p.style.stroke = '';
        p.style.filter = '';
      });
    });

    // 高亮目标音符
    let target = el.querySelector(`.abcjs-n${currentNoteIndex}`) as HTMLElement | null;
    if (!target) {
      const allNotes = el.querySelectorAll('.abcjs-note');
      if (allNotes && allNotes[currentNoteIndex]) {
        target = allNotes[currentNoteIndex] as HTMLElement;
      }
    }

    if (target) {
      target.classList.add('active-score-note');
      const paths = target.querySelectorAll('path');
      if (paths.length > 0) {
        paths.forEach((p) => {
          p.style.fill = '#f59e0b';
          p.style.stroke = '#f59e0b';
          p.style.filter = 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.95))';
        });
      } else {
        target.style.fill = '#f59e0b';
        target.style.stroke = '#f59e0b';
        target.style.filter = 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.95))';
      }

      // 平滑居中滚动当前音符：只横向滚动谱面容器，不带动页面上下跳动
      const wrapper = scrollWrapperRef.current;
      if (wrapper) {
        const t = target.getBoundingClientRect();
        const w = wrapper.getBoundingClientRect();
        wrapper.scrollTo({
          left: wrapper.scrollLeft + (t.left + t.width / 2) - (w.left + w.width / 2),
          behavior: 'smooth',
        });
      }
    }
  }, [currentNoteIndex, renderTick]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border bg-card">
      {/* 顶部控制栏：升降号标记、音名显示、单双行切换、缩放 */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto border-b bg-muted/40 px-3 py-1.5 sm:flex-wrap sm:px-4 sm:py-2">
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <span className="size-2 rounded-full bg-brand" />
          <span className="text-xs font-medium text-muted-foreground">本位移调记谱 · 视谱即吹</span>
        </div>

        <div className="flex shrink-0 items-center gap-x-4 gap-y-2 sm:flex-wrap">
          <div className="flex items-center gap-2" title="开启后在音符上直接标注 #/b，关闭则为规范记谱（仅谱号调号）">
            <Switch id="sheet-accidentals" checked={showAccidentals} onCheckedChange={setShowAccidentals} />
            <Label htmlFor="sheet-accidentals" className="cursor-pointer text-xs">
              <Hash className="size-3.5 text-muted-foreground" /> 升降号提示
            </Label>
          </div>

          <div className="flex items-center gap-2" title="显示/隐藏音符下方的音名">
            <Switch id="sheet-note-names" checked={showNoteNames} onCheckedChange={setShowNoteNames} />
            <Label htmlFor="sheet-note-names" className="cursor-pointer text-xs">
              音名
            </Label>
          </div>

          <ToggleGroup
            type="single"
            variant="pill"
            size="sm"
            value={layoutMode}
            onValueChange={(v) => v && setLayoutMode(v as 'single-line' | 'multi-line')}
          >
            <ToggleGroupItem value="single-line" className="h-7 px-2.5 text-xs" title="单行全景视奏（推荐宽屏连续吹奏）">
              <Maximize2 className="size-3" /> 单行全景
            </ToggleGroupItem>
            <ToggleGroupItem value="multi-line" className="h-7 px-2.5 text-xs" title="双行折叠排版">
              <Minimize2 className="size-3" /> 双行折叠
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="hidden items-center gap-0.5 rounded-lg bg-muted p-[3px] sm:flex">
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-7"
              onClick={() => setScaleFactor((prev) => Math.max(0.9, prev - 0.1))}
              title="缩小乐谱"
            >
              <ZoomOut className="size-3.5" />
            </Button>
            <span className="min-w-[40px] text-center font-mono text-[11px] font-semibold">
              {Math.round(scaleFactor * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-7"
              onClick={() => setScaleFactor((prev) => Math.min(1.8, prev + 0.1))}
              title="放大乐谱"
            >
              <ZoomIn className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 调性升降号特征快速指引条（让初学者一目了然需要升降哪些音） */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto border-b px-3 py-1.5 text-xs sm:px-4">
        <div className="flex shrink-0 items-center gap-2 sm:flex-wrap">
          <span className="flex shrink-0 items-center gap-1 font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-brand" />
            <span className="sm:hidden">本调升降:</span>
            <span className="max-sm:hidden">本调必须升降的音符（已在音符上直接标注）:</span>
          </span>
          {alteredNotes.length > 0 ? (
            alteredNotes.map((note) => (
              <Badge key={note} variant="soft" className="font-mono font-semibold">
                {note}
              </Badge>
            ))
          ) : (
            <Badge variant="success">全本位自然音（无升降号，全部按自然键位吹奏）</Badge>
          )}
        </div>

        <span className="hidden items-center gap-1 text-[11px] font-medium text-muted-foreground md:inline-flex">
          <Eye className="size-3" /> 点击谱上任意音符即可切音视奏与发声
        </span>
      </div>

      {/* 五线谱渲染区域 */}
      <div
        ref={scrollWrapperRef}
        className="w-full overflow-x-auto min-h-[96px] sm:min-h-[120px] p-1 sm:px-3 sm:py-1 text-center select-none bg-white text-slate-900 scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div
          ref={containerRef}
          id="sheetMusicContainer"
          className="inline-block min-w-full"
        >
          <div className="py-10 text-sm text-slate-500">正在生成高精度五线谱...</div>
        </div>
      </div>
    </div>
  );
};

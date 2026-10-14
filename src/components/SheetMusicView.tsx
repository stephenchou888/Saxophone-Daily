import React, { useEffect, useRef, useState, useMemo } from 'react';
import abcjs from 'abcjs';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Eye, Sparkles, Hash } from 'lucide-react';
import { ScaleDefinition } from '../types/music';

interface SheetMusicViewProps {
  scale: ScaleDefinition;
  abcNotation?: string;
  currentNoteIndex: number;
  onNoteClick?: (index: number) => void;
}

export const SheetMusicView: React.FC<SheetMusicViewProps> = ({
  scale,
  abcNotation,
  currentNoteIndex,
  onNoteClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  // Layout mode: 'single-line' (单行全景视奏) vs 'multi-line' (双行折叠排版)
  const [layoutMode, setLayoutMode] = useState<'single-line' | 'multi-line'>('single-line');
  // Zoom scale multiplier
  const [scaleFactor, setScaleFactor] = useState<number>(1.25);
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

        if (curM.length === 4 || idx === scale.notes.length - 1) {
          measures.push(curM.join(' '));
          words.push(curW.join(' '));
          curM = [];
          curW = [];
        }
      });

      const cleanTitle = scale.name.split(' (')[0];
      const header = `X:1\nT:${cleanTitle} 视奏练习\nM:4/4\nL:1/4\nK:${keySig}`;

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
  }, [scale, abcNotation, layoutMode, showAccidentals, showNoteNames]);

  // 渲染乐谱（ABCjs 矢量 SVG）
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    try {
      el.innerHTML = '';
      const containerWidth = scrollWrapperRef.current?.clientWidth || 900;
      const targetStaffWidth = layoutMode === 'single-line' 
        ? Math.max(1100, containerWidth - 40)
        : Math.max(760, containerWidth - 40);

      abcjs.renderAbc(el, activeAbc, {
        responsive: 'resize',
        scale: scaleFactor,
        staffwidth: targetStaffWidth,
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
    } catch (err) {
      console.error('Error rendering ABC sheet music:', err);
    }
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

      // 平滑居中滚动当前音符
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentNoteIndex, activeAbc]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-card border border-border shadow-sm transition-all">
      {/* 顶部控制栏与升降号辅助开关 */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold text-foreground">
            矢量五线谱视奏 (本位移调记谱 · 视谱即吹)
          </span>
        </div>

        {/* 工具栏功能群：升降号显式标记、音名显示、单双行切换、缩放 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 升降号显式标注切换开关（核心功能） */}
          <button
            onClick={() => setShowAccidentals((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
              showAccidentals
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
            }`}
            title={showAccidentals ? '点击切换为规范记谱（仅谱号调号）' : '点击开启音符升降号标记（直观标注哪些音需升/降）'}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>音符升降号提示: {showAccidentals ? '已开启(直观)' : '已关闭'}</span>
          </button>

          {/* 音名唱名标注开关 */}
          <button
            onClick={() => setShowNoteNames((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
              showNoteNames
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
            }`}
            title="显示/隐藏音符下方的唱名音名"
          >
            <span>音名: {showNoteNames ? '开' : '关'}</span>
          </button>

          {/* 单行/双行排版切换 */}
          <div className="flex items-center bg-secondary p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setLayoutMode('single-line')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                layoutMode === 'single-line'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="单行全景视奏（推荐宽屏连续吹奏）"
            >
              <Maximize2 className="w-3 h-3" />
              <span>单行全景</span>
            </button>
            <button
              onClick={() => setLayoutMode('multi-line')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                layoutMode === 'multi-line'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="双行折叠排版"
            >
              <Minimize2 className="w-3 h-3" />
              <span>双行折叠</span>
            </button>
          </div>

          {/* 缩放按钮 */}
          <div className="hidden sm:flex items-center gap-1 bg-secondary p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setScaleFactor((prev) => Math.max(0.9, prev - 0.1))}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded transition-colors"
              title="缩小乐谱"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] font-mono font-semibold text-foreground min-w-[36px] text-center">
              {Math.round(scaleFactor * 100)}%
            </span>
            <button
              onClick={() => setScaleFactor((prev) => Math.min(1.8, prev + 0.1))}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded transition-colors"
              title="放大乐谱"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 调性升降号特征快速指引条（让初学者一目了然需要升降哪些音） */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-primary/10 border-b border-primary/20 text-xs gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-foreground flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            本调必须升降的音符（已在音符上直接标注）:
          </span>
          {alteredNotes.length > 0 ? (
            alteredNotes.map((note) => (
              <span
                key={note}
                className="px-2 py-0.5 rounded font-bold bg-card text-primary border border-primary/30 shadow-xs"
              >
                {note}
              </span>
            ))
          ) : (
            <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              全本位自然音（无升降号，全部按自然键位吹奏）
            </span>
          )}
        </div>

        <span className="text-[11px] text-muted-foreground font-medium hidden md:inline-flex items-center gap-1">
          <Eye className="w-3 h-3 text-muted-foreground" /> 点击谱上任意音符即可切音视奏与发声
        </span>
      </div>

      {/* 五线谱渲染区域 */}
      <div
        ref={scrollWrapperRef}
        className="w-full overflow-x-auto min-h-[160px] p-3 sm:p-5 text-center select-none bg-white text-slate-900 scroll-smooth"
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

import React, { useEffect, useRef, useState, useMemo } from 'react';
import abcjs from 'abcjs';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Eye } from 'lucide-react';

interface SheetMusicViewProps {
  abcNotation: string;
  currentNoteIndex: number;
  onNoteClick?: (index: number) => void;
}

export const SheetMusicView: React.FC<SheetMusicViewProps> = ({
  abcNotation,
  currentNoteIndex,
  onNoteClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  // Layout mode: 'single-line' (单行全景模式) vs 'multi-line' (折行排版)
  const [layoutMode, setLayoutMode] = useState<'single-line' | 'multi-line'>('single-line');
  // Zoom scale multiplier
  const [scaleFactor, setScaleFactor] = useState<number>(1.25);

  // Compute processed ABC notation based on layoutMode
  const activeAbc = useMemo(() => {
    if (layoutMode === 'single-line') {
      // In single-line mode, remove newline characters between bars in the music body
      const lines = abcNotation.split('\n');
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
    return abcNotation;
  }, [abcNotation, layoutMode]);

  // Render score using ABCjs
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    try {
      el.innerHTML = '';
      // Determine staffwidth based on container and layout mode
      const containerWidth = scrollWrapperRef.current?.clientWidth || 900;
      const targetStaffWidth = layoutMode === 'single-line' 
        ? Math.max(1100, containerWidth - 40)
        : Math.max(760, containerWidth - 40);

      abcjs.renderAbc(el, activeAbc, {
        responsive: 'resize',
        scale: scaleFactor,
        staffwidth: targetStaffWidth,
        add_classes: true,
        paddingtop: 14,
        paddingbottom: 14,
        paddingleft: 16,
        paddingright: 16,
      });

      // Add click handlers to notes
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

  // Synchronize active note highlight & auto-scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Remove old highlights
    const oldActives = el.querySelectorAll('.active-score-note');
    oldActives.forEach((node) => {
      node.classList.remove('active-score-note');
      node.querySelectorAll('path').forEach((p) => {
        p.style.fill = '';
        p.style.stroke = '';
        p.style.filter = '';
      });
    });

    // Highlight target note
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
          p.style.fill = '#d97706';
          p.style.stroke = '#d97706';
          p.style.filter = 'drop-shadow(0 0 6px rgba(217, 119, 6, 0.95))';
        });
      } else {
        target.style.fill = '#d97706';
        target.style.stroke = '#d97706';
        target.style.filter = 'drop-shadow(0 0 6px rgba(217, 119, 6, 0.95))';
      }

      // Smoothly scroll active note into view on narrow screens
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentNoteIndex, activeAbc]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-white border border-slate-300 shadow-xl transition-all">
      {/* Top Paper Header Bar & Viewport Controls */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            矢量五线谱视奏 (本位移调记谱 · 视谱即吹)
          </span>
        </div>

        {/* Toolbar: Single Line toggle and Zoom controls */}
        <div className="flex items-center gap-2">
          {/* Layout Mode Switch */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setLayoutMode('single-line')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                layoutMode === 'single-line'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="单行全景视奏（推荐宽屏与连续爬音阶练指）"
            >
              <Maximize2 className="w-3 h-3" />
              <span>单行全景视奏</span>
            </button>
            <button
              onClick={() => setLayoutMode('multi-line')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                layoutMode === 'multi-line'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="双行排版"
            >
              <Minimize2 className="w-3 h-3" />
              <span>双行折叠</span>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setScaleFactor((prev) => Math.max(0.9, prev - 0.1))}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-300 rounded"
              title="缩小乐谱"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] font-mono font-bold text-slate-700 min-w-[36px] text-center">
              {Math.round(scaleFactor * 100)}%
            </span>
            <button
              onClick={() => setScaleFactor((prev) => Math.min(1.8, prev + 0.1))}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-300 rounded"
              title="放大乐谱"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium ml-1">
            <Eye className="w-3 h-3" /> 点击谱上任意音符即可切音
          </span>
        </div>
      </div>

      {/* Sheet Music SVG Render Canvas */}
      <div
        ref={scrollWrapperRef}
        className="w-full overflow-x-auto min-h-[160px] p-3 sm:p-5 text-center select-none text-slate-900 scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div
          ref={containerRef}
          id="sheetMusicContainer"
          className="inline-block min-w-full"
        >
          <div className="py-10 text-sm text-slate-400">正在生成高精度五线谱...</div>
        </div>
      </div>
    </div>
  );
};

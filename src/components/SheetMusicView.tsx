import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Sparkles, Hash, Expand, Shrink } from 'lucide-react';
import { ScaleDefinition } from '../types/music';
import { notesToAbcMeasures } from '@/lib/abcNotes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

// abcjs 体积较大（约占原构建包一半），按需加载，不阻塞首屏（#12）
const loadAbcjs = () => import('abcjs').then((m) => m.default);

interface SheetMusicViewProps {
  scale: ScaleDefinition;
  abcNotation?: string;
  currentNoteIndex: number;
  onNoteClick?: (index: number) => void;
  /** 每小节拍数（四分音符），默认 4；模进练习按组形设置，让每组落在整小节里 */
  beatsPerMeasure?: number;
}

// 单行模式下每个音至少占的谱面宽度（abcjs 未缩放单位），音很多的模进练习据此加宽并横向滚动
const MIN_NOTE_WIDTH = 34;
// 全屏专注看谱时在当前缩放基础上再放大的倍数
const FOCUS_ZOOM = 1.6;

export const SheetMusicView: React.FC<SheetMusicViewProps> = ({
  scale,
  abcNotation,
  currentNoteIndex,
  onNoteClick,
  beatsPerMeasure = 4,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  // 专注看谱：谱面以浮层铺满视口（挂到 body 上，避免被吸顶卡片的层级困住、被顶栏和底部控制条盖住），
  // 同时请求整页原生全屏隐藏浏览器界面；不支持原生全屏时（如 iPhone Safari）只用浮层
  const [focusMode, setFocusMode] = useState(false);
  const nativeFullscreenRef = useRef(false);

  const enterFocus = () => {
    setFocusMode(true);
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen()
        .then(() => (nativeFullscreenRef.current = true))
        .catch(() => (nativeFullscreenRef.current = false));
    }
  };

  const exitFocus = () => {
    setFocusMode(false);
    if (nativeFullscreenRef.current && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    nativeFullscreenRef.current = false;
  };

  useEffect(() => {
    if (!focusMode) return;
    // 用户按 Esc / 系统手势退出原生全屏时，同步退出专注模式
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && nativeFullscreenRef.current) {
        nativeFullscreenRef.current = false;
        setFocusMode(false);
      }
    };
    // Esc 退出（原生全屏下浏览器自己处理 Esc，会走上面的 fullscreenchange）；← / → 逐音切换，不用离开谱面
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        exitFocus();
        return;
      }
      if (!onNoteClick) return;
      if (e.key === 'ArrowRight' && currentNoteIndex < scale.notes.length - 1) {
        e.preventDefault();
        onNoteClick(currentNoteIndex + 1);
      }
      if (e.key === 'ArrowLeft' && currentNoteIndex > 0) {
        e.preventDefault();
        onNoteClick(currentNoteIndex - 1);
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [focusMode, onNoteClick, currentNoteIndex, scale.notes.length]);

  // Layout mode: 'single-line' (单行全景视奏) vs 'multi-line' (双行折叠排版)
  const [layoutMode, setLayoutMode] = useState<'single-line' | 'multi-line'>('single-line');
  // Zoom scale multiplier
  // 手机端谱面按原尺寸横向滑动，默认缩放略小以节省纵向空间
  const [scaleFactor, setScaleFactor] = useState<number>(() => (window.innerWidth < 640 ? 1.0 : 1.25));
  // 提示升降号开关 (Default: true，在音符上直接绘制 #/b 升降号标记)
  const [showAccidentals, setShowAccidentals] = useState<boolean>(true);
  // 音名唱名显示开关：在音符下方标注音名如 C#, F#, G#。
  // 桌面端谱面下方已有音名按钮行，默认不重复标注以压低谱面高度；手机端隐藏了音名按钮行，默认开启
  const [showNoteNames, setShowNoteNames] = useState<boolean>(() => window.innerWidth < 1024);

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

      // 按调号与小节内临时记号规则写出升降号 / 还原号（见 lib/abcNotes）
      const { measures, words } = notesToAbcMeasures(scale.notes, keySig, beatsPerMeasure, showAccidentals);

      // 不写 T: 标题行：卡片标题已显示调名与练习模式，省下的高度留给首屏的指法图
      const header = `X:1\nM:${beatsPerMeasure}/4\nL:1/4\nK:${keySig}`;

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
  }, [scale, abcNotation, layoutMode, showAccidentals, showNoteNames, beatsPerMeasure]);

  // 每次渲染完成后递增，驱动下方的当前音高亮（渲染是异步的）
  const [renderTick, setRenderTick] = useState(0);

  // 谱面容器宽度：窗口缩放时重新排版（防抖，拖动窗口时不会连续重绘）
  const [wrapperWidth, setWrapperWidth] = useState(0);
  useEffect(() => {
    const wrapper = scrollWrapperRef.current;
    if (!wrapper || typeof ResizeObserver === 'undefined') return;
    let timer: number | undefined;
    const observer = new ResizeObserver(([entry]) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setWrapperWidth(Math.round(entry.contentRect.width)), 120);
    });
    observer.observe(wrapper);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [focusMode]); // 进出全屏时谱面容器会重新挂载，需重新监听

  // 渲染乐谱（ABCjs 矢量 SVG）
  useEffect(() => {
    let cancelled = false;

    loadAbcjs().then((abcjs) => {
      const el = containerRef.current;
      if (cancelled || !el) return;

      try {
        el.innerHTML = '';
        // abcjs 会在容器上写入内联样式（固定高度、responsive 模式的 padding-bottom 等），
        // 不清掉会在多次重绘间累积，导致谱面下方出现大片空白
        el.removeAttribute('style');
        const containerWidth = scrollWrapperRef.current?.clientWidth || 900;
        // 全屏专注：放大谱面，按实际尺寸渲染。单行至少铺满一屏、音多时横向滚动并自动跟随当前音；双行按屏宽折行
        const renderScale = focusMode ? scaleFactor * FOCUS_ZOOM : scaleFactor;
        // （abcjs 的 staffwidth 是缩放后的像素宽度，音符本身随 scale 放大）
        const targetStaffWidth = focusMode
          ? layoutMode === 'single-line'
            ? Math.max(containerWidth - 40, scale.notes.length * MIN_NOTE_WIDTH * renderScale)
            : Math.max(containerWidth - 40, 360)
          : layoutMode === 'single-line'
            ? Math.max(1100, containerWidth - 40, scale.notes.length * MIN_NOTE_WIDTH)
            : Math.max(760, containerWidth - 40);
        // 谱面放得下时铺满容器；窄屏（手机）或音太多时按原尺寸渲染并横向滑动，避免被压缩得看不清
        const fitsContainer =
          !focusMode && containerWidth >= 640 && targetStaffWidth * scaleFactor <= containerWidth * 1.4;

        abcjs.renderAbc(el, activeAbc, {
          responsive: fitsContainer ? 'resize' : undefined,
          scale: renderScale,
          staffwidth: targetStaffWidth,
          // 单行模式下强制拉满整行，避免容器变宽后谱面只占左侧一部分
          format: layoutMode === 'single-line' ? { stretchlast: true } : undefined,
          add_classes: true,
          paddingtop: 8,
          paddingbottom: 8,
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
  }, [activeAbc, scaleFactor, layoutMode, onNoteClick, wrapperWidth, focusMode]);

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

    // 高亮目标音符：按谱面上第 N 个音符取，与点击切音的序号一致。
    // （abcjs 的 abcjs-n{N} 类是小节内序号且歌词也带该类，不能直接用来按全局序号查找）
    const target = (el.querySelectorAll('.abcjs-note')[currentNoteIndex] as HTMLElement | undefined) ?? null;

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

  const view = (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-lg border bg-card',
        focusMode && 'fixed inset-0 z-50 flex flex-col rounded-none border-0'
      )}
    >
      {/* 顶部控制栏：升降号标记、音名显示、单双行切换、缩放；全屏按钮固定在最右，不随工具栏横向滚动 */}
      <div className="flex items-center border-b bg-muted/40">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 overflow-x-auto px-3 py-1.5 sm:flex-wrap sm:px-4 sm:py-2">
          {/* 升降号指引并入工具栏，省掉单独一行；手机端工具栏放不下，靠谱面上的升降号标注 */}
          <div className="hidden shrink-0 items-center gap-1.5 sm:flex" title="本调必须升降的音符（已在音符上直接标注）">
            <Sparkles className="size-3.5 text-brand" />
            <span className="text-xs font-medium text-muted-foreground">本调升降:</span>
            {alteredNotes.length > 0 ? (
              alteredNotes.map((note) => (
                <Badge key={note} variant="soft" className="font-mono font-semibold">
                  {note}
                </Badge>
              ))
            ) : (
              <Badge variant="success">全本位自然音</Badge>
            )}
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

            <div className={cn('items-center gap-0.5 rounded-lg bg-muted p-[3px]', focusMode ? 'flex' : 'hidden sm:flex')}>
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
                {Math.round(scaleFactor * (focusMode ? FOCUS_ZOOM : 1) * 100)}%
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

        <div className="shrink-0 border-l px-2 sm:px-3">
          <Button
            variant={focusMode ? 'default' : 'outline'}
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={focusMode ? exitFocus : enterFocus}
            title={focusMode ? '退出全屏（Esc）' : '全屏专注看谱（← / → 切换音符，Esc 退出）'}
            aria-label={focusMode ? '退出全屏' : '全屏专注看谱'}
          >
            {focusMode ? <Shrink className="size-3.5" /> : <Expand className="size-3.5" />}
            <span className="max-sm:hidden">{focusMode ? '退出全屏' : '全屏'}</span>
          </Button>
        </div>
      </div>

      {/* 五线谱渲染区域 */}
      <div
        ref={scrollWrapperRef}
        className={cn(
          'w-full overflow-x-auto min-h-[96px] sm:min-h-[120px] lg:min-h-[80px] p-1 sm:px-3 sm:py-1 text-center select-none bg-white text-slate-900 scroll-smooth',
          focusMode && 'flex min-h-0 flex-1 flex-col justify-center overflow-y-auto'
        )}
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

      {focusMode && (
        <div className="flex h-9 shrink-0 items-center justify-center gap-1.5 border-t bg-muted/40 text-xs text-muted-foreground max-sm:hidden">
          <kbd className="rounded border bg-background px-1 font-mono text-[11px]">←</kbd>
          <kbd className="rounded border bg-background px-1 font-mono text-[11px]">→</kbd>切换音符
          <kbd className="ml-2 rounded border bg-background px-1 font-mono text-[11px]">Esc</kbd>退出全屏
        </div>
      )}
    </div>
  );

  return focusMode ? createPortal(view, document.body) : view;
};

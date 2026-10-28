import React, { useEffect, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { ScaleDefinition, ScaleTrack } from '@/types/music';
import { scaleDisplayName, TRACK_SCALES } from '@/lib/dailyScale';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

type ScaleGroup = { category: NonNullable<ScaleDefinition['category']>; label: string };

const SCALE_GROUPS: Record<ScaleTrack, ScaleGroup[]> = {
  basic: [
    { category: 'special', label: '特训与特色音阶' },
    { category: 'major', label: '五度圈 12 个自然大调' },
    { category: 'minor', label: '自然小调' },
    { category: 'harmonic_minor', label: '和声小调' },
  ],
  jazz: [
    { category: 'jazz_mode', label: '七种教会调式（C 大调同一组音）' },
    { category: 'jazz_scale', label: '爵士常用音阶' },
    { category: 'jazz_arpeggio', label: '七和弦琶音与 ii–V–I' },
  ],
};

// 搜索关键词：完整名称（含英文）、调号说明、升降号（去空格并提供 ♯/♭ 写法，“3#”“3♯”都能命中）、分类
function scaleKeywords(scale: ScaleDefinition, groupLabel: string): string[] {
  const compact = scale.accidentals.replace(/\s+/g, '');
  return [
    scale.name,
    scale.chord ?? '',
    scale.keySig,
    scale.accidentals,
    compact,
    compact.replace(/#/g, '♯').replace(/b/g, '♭'),
    groupLabel,
  ];
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

interface ScalePickerProps {
  track: ScaleTrack;
  value: ScaleDefinition;
  onChange: (scaleId: string) => void;
}

// 调性选择：按钮 + ⌘K / Ctrl+K 打开的搜索菜单（#14）
export const ScalePicker: React.FC<ScalePickerProps> = ({ track, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const scales = TRACK_SCALES[track];
  const trackName = track === 'jazz' ? '爵士调式' : '调性';

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const select = (scaleId: string) => {
    onChange(scaleId);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        aria-haspopup="dialog"
        aria-label={`切换${trackName}，当前：${scaleDisplayName(value)}`}
        onClick={() => setOpen(true)}
        className="w-full min-w-0 shrink justify-between bg-card font-medium sm:w-[280px]"
      >
        <span className="truncate">{scaleDisplayName(value)}</span>
        <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
          <kbd className="rounded border bg-muted px-1.5 font-mono text-[11px] leading-5 max-sm:hidden">
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>
          <ChevronsUpDown className="size-3.5" />
        </span>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={track === 'jazz' ? '切换爵士调式' : '切换调性'}
        description={track === 'jazz' ? '搜索调式、音阶或和弦' : '搜索调性、音阶或升降号'}
        showCloseButton={false}
        className="sm:max-w-[480px]"
      >
        <CommandInput placeholder={track === 'jazz' ? '搜索调式、音阶或和弦（如 Dm7）…' : '搜索调性、音阶或升降号…'} />
        <CommandList className="max-h-[min(440px,60vh)]">
          <CommandEmpty>没有匹配的{trackName}</CommandEmpty>
          {SCALE_GROUPS[track].map((group, gi) => (
            <React.Fragment key={group.category}>
              {gi > 0 && <CommandSeparator />}
              <CommandGroup heading={group.label}>
                {scales.filter((s) => s.category === group.category).map((s) => (
                  <CommandItem
                    key={s.id}
                    value={s.id}
                    keywords={scaleKeywords(s, group.label)}
                    onSelect={select}
                    className="min-h-9 gap-2.5"
                  >
                    <span className="flex-1 truncate">{scaleDisplayName(s)}</span>
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{s.chord ?? s.accidentals}</span>
                    <Check className={s.id === value.id ? 'size-3.5 opacity-100' : 'size-3.5 opacity-0'} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
        <div className="flex h-10 items-center justify-between border-t bg-muted/40 px-3.5 text-xs text-muted-foreground">
          <span>{scales.length} 个{trackName} · 每日自动轮换</span>
          <span className="flex items-center gap-1.5 max-sm:hidden">
            <kbd className="rounded border bg-background px-1 font-mono text-[11px]">↑↓</kbd>选择
            <kbd className="rounded border bg-background px-1 font-mono text-[11px]">↵</kbd>确认
            <kbd className="rounded border bg-background px-1 font-mono text-[11px]">Esc</kbd>关闭
          </span>
        </div>
      </CommandDialog>
    </>
  );
};

import { FINGERINGS } from '@/data/scales';

// 指法反查（#4）：按键集合完全一致（与顺序无关）的所有音名，含等音写法（如 F#4 / Gb4），按音高排序
export function findNotesByKeys(keys: string[]): string[] {
  const target = [...keys].sort().join('|');
  return Object.entries(FINGERINGS)
    .filter(([, f]) => [...f.keys].sort().join('|') === target)
    .sort(([, a], [, b]) => a.freq - b.freq)
    .map(([note]) => note);
}

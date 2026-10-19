import { SCALES } from '@/data/scales';
import { ScaleDefinition } from '@/types/music';

// 每日主修音阶：按“一年中的第几天”在全部音阶中轮换（规则见 README）
export function getTodayScale(date: Date = new Date()): ScaleDefinition {
  const startOfYear = new Date(date.getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((date.getTime() - startOfYear) / (1000 * 60 * 60 * 24));
  return SCALES[dayOfYear % SCALES.length];
}

// 显示用名称：去掉括号内英文注释与开头的表情符号，如「🎷 C 蓝调布鲁斯音阶 (Blues…)」→「C 蓝调布鲁斯音阶」
export function scaleDisplayName(scale: ScaleDefinition): string {
  return scale.name.split(' (')[0].replace(/^[^\p{L}\p{N}]+/u, '');
}

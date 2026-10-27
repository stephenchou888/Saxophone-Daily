import { SCALES } from '@/data/scales';
import { ScaleDefinition } from '@/types/music';

// 每日主修音阶：按“一年中的第几天”在全部音阶中轮换（规则见 README）
export function getTodayScale(date: Date = new Date()): ScaleDefinition {
  return SCALES[dayOfYear(date) % SCALES.length];
}

// 本地日期是一年中的第几天（1 月 1 日为 1）。用 UTC 日期相减，避免夏令时切换当天少一小时导致算成前一天
export function dayOfYear(date: Date): number {
  const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const startOfYear = Date.UTC(date.getFullYear(), 0, 0);
  return Math.round((today - startOfYear) / (1000 * 60 * 60 * 24));
}

// 显示用名称：去掉括号内英文注释与开头的表情符号，如「🎷 C 蓝调布鲁斯音阶 (Blues…)」→「C 蓝调布鲁斯音阶」
export function scaleDisplayName(scale: ScaleDefinition): string {
  return scale.name.split(' (')[0].replace(/^[^\p{L}\p{N}]+/u, '');
}

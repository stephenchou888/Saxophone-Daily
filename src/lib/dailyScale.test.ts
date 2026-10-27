import { describe, expect, it } from 'vitest';
import { SCALES } from '@/data/scales';
import { dayOfYear, getTodayScale, scaleDisplayName } from './dailyScale';

describe('dayOfYear', () => {
  it('counts from January 1st = 1, including leap years', () => {
    expect(dayOfYear(new Date(2026, 0, 1))).toBe(1);
    expect(dayOfYear(new Date(2026, 11, 31))).toBe(365);
    expect(dayOfYear(new Date(2024, 11, 31))).toBe(366);
  });

  it('is the same at any time of day, including just after midnight', () => {
    expect(dayOfYear(new Date(2026, 2, 9, 0, 30))).toBe(dayOfYear(new Date(2026, 2, 9, 23, 30)));
    expect(dayOfYear(new Date(2026, 2, 9, 0, 30))).toBe(dayOfYear(new Date(2026, 2, 8, 12, 0)) + 1);
  });
});

describe('getTodayScale', () => {
  it('rotates through every scale, one per day', () => {
    const seen = new Set<string>();
    for (let d = 0; d < SCALES.length; d++) seen.add(getTodayScale(new Date(2026, 0, 1 + d)).id);
    expect(seen.size).toBe(SCALES.length);
  });
});

describe('scaleDisplayName', () => {
  it('drops the English note and leading emoji', () => {
    expect(scaleDisplayName(SCALES.find((s) => s.id === 'c_blues')!)).toBe('C 蓝调布鲁斯音阶');
    expect(scaleDisplayName(SCALES.find((s) => s.id === 'g_major')!)).toBe('G 大调音阶');
  });
});

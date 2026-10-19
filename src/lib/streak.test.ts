import { describe, expect, it } from 'vitest';
import {
  addCheckin,
  addDays,
  computeStreak,
  dateKey,
  lastSevenDays,
  loadCheckins,
  migrateLegacy,
  STORAGE_KEY,
} from './streak';

const d = (s: string) => {
  const [y, m, day] = s.split('-').map(Number);
  return new Date(y, m - 1, day);
};

function memoryStorage(init: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(init));
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => void map.delete(k),
    setItem: (k, v) => void map.set(k, String(v)),
  };
}

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(dateKey(addDays(d('2026-03-01'), -1))).toBe('2026-02-28');
    expect(dateKey(addDays(d('2024-03-01'), -1))).toBe('2024-02-29');
    expect(dateKey(addDays(d('2026-01-01'), -1))).toBe('2025-12-31');
  });
});

describe('computeStreak', () => {
  const today = d('2026-10-19');
  it('counts back from today when checked in today', () => {
    expect(computeStreak(['2026-10-17', '2026-10-18', '2026-10-19'], today)).toBe(3);
  });
  it('keeps yesterday’s streak alive when today is not done yet', () => {
    expect(computeStreak(['2026-10-17', '2026-10-18'], today)).toBe(2);
  });
  it('is 0 after a missed day', () => {
    expect(computeStreak(['2026-10-15', '2026-10-16', '2026-10-17'], today)).toBe(0);
  });
  it('restarts at 1 when checking in again after a gap', () => {
    expect(computeStreak(['2026-10-10', '2026-10-11', '2026-10-19'], today)).toBe(1);
  });
  it('crosses month boundaries', () => {
    expect(computeStreak(['2026-09-30', '2026-10-01'], d('2026-10-01'))).toBe(2);
  });
});

describe('migrateLegacy', () => {
  it('expands { lastDate, streak } into consecutive days ending at lastDate', () => {
    expect(migrateLegacy({ lastDate: '2026-10-18', streak: 3 }).days).toEqual([
      '2026-10-16',
      '2026-10-17',
      '2026-10-18',
    ]);
  });
  it('handles empty or invalid legacy data', () => {
    expect(migrateLegacy({ lastDate: '', streak: 0 }).days).toEqual([]);
    expect(migrateLegacy({ lastDate: 'nonsense', streak: 5 }).days).toEqual([]);
  });
  it('keeps the streak for a user upgrading the day after their last check-in', () => {
    const migrated = migrateLegacy({ lastDate: '2026-10-18', streak: 12 });
    expect(computeStreak(migrated.days, d('2026-10-19'))).toBe(12);
    expect(computeStreak(addCheckin(migrated, d('2026-10-19')).days, d('2026-10-19'))).toBe(13);
  });
});

describe('loadCheckins', () => {
  it('migrates v1 storage and writes v2', () => {
    const storage = memoryStorage({ sax_daily_streak_v1: JSON.stringify({ lastDate: '2026-10-19', streak: 2 }) });
    expect(loadCheckins(storage).days).toEqual(['2026-10-18', '2026-10-19']);
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!).days).toEqual(['2026-10-18', '2026-10-19']);
  });
  it('prefers v2 and drops duplicates / invalid entries', () => {
    const storage = memoryStorage({
      [STORAGE_KEY]: JSON.stringify({ days: ['2026-10-19', 'bad', '2026-10-18', '2026-10-19'] }),
      sax_daily_streak_v1: JSON.stringify({ lastDate: '2020-01-01', streak: 99 }),
    });
    expect(loadCheckins(storage).days).toEqual(['2026-10-18', '2026-10-19']);
  });
  it('starts empty with no data', () => {
    expect(loadCheckins(memoryStorage()).days).toEqual([]);
  });
});

describe('lastSevenDays', () => {
  it('returns 7 days ending today with weekday labels and done flags', () => {
    const week = lastSevenDays(['2026-10-13', '2026-10-19'], d('2026-10-19')); // 2026-10-19 is a Monday
    expect(week.map((w) => w.key)).toEqual([
      '2026-10-13',
      '2026-10-14',
      '2026-10-15',
      '2026-10-16',
      '2026-10-17',
      '2026-10-18',
      '2026-10-19',
    ]);
    expect(week.map((w) => w.label)).toEqual(['二', '三', '四', '五', '六', '日', '一']);
    expect(week.map((w) => w.done)).toEqual([true, false, false, false, false, false, true]);
    expect(week[6].isToday).toBe(true);
  });
});

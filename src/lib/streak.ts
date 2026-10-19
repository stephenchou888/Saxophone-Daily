// 打卡记录：存储打卡日期列表（本地日期 YYYY-MM-DD），连续天数由列表计算（#17）

export const STORAGE_KEY = 'sax_daily_checkins_v2';
const LEGACY_STORAGE_KEY = 'sax_daily_streak_v1';
// 只保留最近这么多天，足够计算连续天数与展示 7 天网格
const MAX_DAYS = 400;

export interface CheckinData {
  days: string[];
}

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 按本地日历加减天数（用 setDate，跨夏令时也不会错位）
export function addDays(date: Date, delta: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + delta);
  return d;
}

function parseKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

function normalize(days: string[]): string[] {
  return Array.from(new Set(days.filter((d) => parseKey(d) !== null)))
    .sort()
    .slice(-MAX_DAYS);
}

// 旧格式 { lastDate, streak } → 从 lastDate 往前连续 streak 天
export function migrateLegacy(legacy: { lastDate?: string; streak?: number }): CheckinData {
  const last = legacy.lastDate ? parseKey(legacy.lastDate) : null;
  const streak = Math.min(Math.max(0, Math.floor(legacy.streak ?? 0)), MAX_DAYS);
  if (!last || streak === 0) return { days: [] };
  return { days: Array.from({ length: streak }, (_, i) => dateKey(addDays(last, -(streak - 1 - i)))) };
}

/**
 * 当前连续天数：今天已打卡则从今天往前数；今天未打卡但昨天打过，则从昨天往前数
 * （今天还有机会续上）；否则为 0。
 */
export function computeStreak(days: string[], today: Date): number {
  const set = new Set(days);
  let cursor = set.has(dateKey(today)) ? today : addDays(today, -1);
  let count = 0;
  while (set.has(dateKey(cursor))) {
    count++;
    cursor = addDays(cursor, -1);
  }
  return count;
}

const WEEKDAY = ['日', '一', '二', '三', '四', '五', '六'];

// 最近 7 天（含今天），从早到晚
export function lastSevenDays(days: string[], today: Date) {
  const set = new Set(days);
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i - 6);
    return { key: dateKey(d), label: WEEKDAY[d.getDay()], done: set.has(dateKey(d)), isToday: i === 6 };
  });
}

export function addCheckin(data: CheckinData, today: Date): CheckinData {
  return { days: normalize([...data.days, dateKey(today)]) };
}

// 读取：优先新格式；只有旧格式时迁移并写回新格式（旧键保留，不做破坏性删除）
export function loadCheckins(storage: Storage): CheckinData {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw) as Partial<CheckinData>;
    return { days: normalize(Array.isArray(parsed.days) ? parsed.days : []) };
  }
  const legacyRaw = storage.getItem(LEGACY_STORAGE_KEY);
  if (legacyRaw) {
    const migrated = migrateLegacy(JSON.parse(legacyRaw));
    saveCheckins(storage, migrated);
    return migrated;
  }
  return { days: [] };
}

export function saveCheckins(storage: Storage, data: CheckinData) {
  storage.setItem(STORAGE_KEY, JSON.stringify({ days: normalize(data.days) }));
}

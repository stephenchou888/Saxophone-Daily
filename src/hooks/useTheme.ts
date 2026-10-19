import { useCallback, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'sax_daily_theme';

// 初始主题由 index.html 中的内联脚本在首帧前写入 <html class>，这里只读取并负责切换。
// 只有用户主动切换时才写入 localStorage，未切换过的用户继续跟随系统设置。
function readTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  const toggleTheme = useCallback(() => {
    const next: Theme = readTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 隐私模式等场景下无法持久化，忽略即可
    }
    setTheme(next);
  }, []);

  return { theme, toggleTheme };
}

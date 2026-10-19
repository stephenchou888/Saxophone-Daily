import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // abcjs 是单个约 510KB 的库，已按需懒加载（见 SheetMusicView），无法再拆分；
    // 阈值调到 600KB，让真正意外变大的 chunk 仍会触发警告
    chunkSizeWarningLimit: 600,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});

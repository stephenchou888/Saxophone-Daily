import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');

const app = express();
const PORT = process.env.PORT || 3000;

// 托管 `npm run build` 生成的 dist/（项目根目录的 index.html 引用的是未编译源码，不能直接托管）
app.use(express.static(distDir));

// Fallback to index.html for SPA / static routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Saxophone Daily server running on http://0.0.0.0:${PORT}`);
});

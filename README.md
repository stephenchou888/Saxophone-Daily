# 🎷 Saxophone Daily (萨克斯每日练习与指法追踪)

> 一个专为中音（Eb）与高音（Bb）萨克斯初学者及进阶练习者设计的轻量级网页练琴助手。每天自动轮换主修音阶，配备交互式五线谱、萨克斯按键高亮图示、基准音试听、内置节拍器与打卡追踪。

在线体验：<https://stephenchou888.github.io/Saxophone-Daily/>

---

## ✨ 核心功能

- **双调性乐器适配**：一键切换中音萨克斯（Eb）与高音萨克斯（Bb），遵循标准管乐本位移调记谱，试听按真实移调发声。
- **每日主修音阶**：按“一年中的第几天”在全部音阶中轮换（约 28 条，见 `src/data/scales.ts`），包括：
  - 五度圈 12 个自然大调；
  - 常用自然小调与和声小调；
  - 特训与特色音阶：高八度、超吹、蓝调、半音阶、五声音阶、琶音。
  也可以随时手动切换调性。
- **大小调模进练习**：所有大调、自然小调与和声小调都可以切换为三度、三音组、四音组、琶音四种模进，由音阶自动生成（上行逐级模进、下行镜像返回）；五线谱按组形自动分小节（4/4 或 3/4），演示、试听、指法图示随之联动。
- **交互式五线谱（abcjs）**：矢量渲染，支持升降号提示、音名标注、单行/双行排版与缩放；点击谱上音符或下方音名即可跳转并发声。
- **萨克斯指法图示**：示意图按真实键位排布，当前音的闭合按键高亮，并列出按下的按键与对应手指；另有实物照片对照视图。点击按键可试听。
- **慢速演示与试听**：逐音步进或自动循环演示，Web Audio API 实时合成萨克斯音色，支持低/中八度、高八度、超吹三个音区。
- **节拍器**：50 ~ 150 BPM，纯代码合成节拍声，无外部音频素材。
- **本地连续打卡**：数据仅存储在浏览器本地（`localStorage`），无需注册登录。
- **浅色 / 深色模式**：默认跟随系统，可手动切换并记住选择。

---

## 🛠️ 技术栈

- **框架**：React 19 + TypeScript + Vite
- **样式与组件**：Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com/)（Radix UI），主题变量在 `src/index.css`
- **乐谱排版**：[abcjs](https://paulrosen.github.io/abcjs/)
- **音频**：Web Audio API（`src/hooks/useSoundEngine.ts`）

---

## 🚀 本地开发

需要 Node.js 22（与 CI 一致）。

```bash
git clone https://github.com/stephenchou888/Saxophone-Daily.git
cd Saxophone-Daily
npm install
npm run dev        # 开发服务器 http://localhost:3000
```

常用命令：

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器（热更新） |
| `npm run lint` | TypeScript 类型检查 |
| `npm run build` | 生产构建，输出到 `dist/` |
| `npm run preview` | 本地预览 `dist/` 构建结果 |
| `npm start` | 构建并用 Node（`server.js`）托管 `dist/`，适合自建服务器部署 |

> 注意：项目需要先构建，直接双击打开根目录的 `index.html` 无法运行。

---

## 🌐 部署

### GitHub Pages（已配置）

推送到 `main` 分支后，GitHub Actions（`.github/workflows/deploy.yml`）会自动构建并部署到 GitHub Pages。Pull Request 与其他分支会由 `.github/workflows/ci.yml` 自动做类型检查和构建。

首次在新仓库启用时，需在 **Settings → Pages → Build and deployment** 中把 Source 设为 **GitHub Actions**。

### 其他静态托管（Vercel / Netlify 等）

- 构建命令：`npm run build`
- 输出目录：`dist`

`vite.config.ts` 使用相对路径 `base: './'`，部署在任意子路径下都能正常加载资源。

---

## 📂 项目结构

```text
├── index.html                  # 页面入口（含首帧主题脚本）
├── server.js                   # 可选：Node/Express 托管 dist/
├── public/images/              # 萨克斯实物照片
├── src/
│   ├── App.tsx                 # 页面布局与练习状态（当前音阶、当前音、演示）
│   ├── main.tsx                # React 入口
│   ├── index.css               # Tailwind 与 shadcn 主题变量（浅色/深色）
│   ├── components/
│   │   ├── SheetMusicView.tsx  # 五线谱（abcjs）
│   │   ├── SaxophoneDiagram.tsx# 指法示意图 / 实物图 / 试听控制
│   │   ├── Metronome.tsx       # 节拍器
│   │   ├── StreakCard.tsx      # 连续打卡
│   │   ├── PracticeTipsCard.tsx# 今日练琴重点
│   │   └── ui/                 # shadcn/ui 基础组件
│   ├── data/scales.ts          # 音阶定义与音符指法表
│   ├── hooks/
│   │   ├── useSoundEngine.ts   # 音色合成、移调计算、按键音高表
│   │   └── useTheme.ts         # 浅色/深色切换
│   └── types/music.ts          # 类型定义
└── .github/workflows/          # CI 与 GitHub Pages 部署
```

---

## 📝 练习建议

1. **泛音与长音**：正式吹奏音阶前，建议先完成 10~15 分钟长音练习，确保音色饱满。
2. **慢练先行**：遇到不熟悉的调性（如 3 个升号以上），先开启“慢速指法演示”在乐器上默按指法，再开节拍器以 60 BPM 吹奏。
3. **坚持打卡**：每天哪怕只练 15 分钟，用打卡天数建立练习节奏。

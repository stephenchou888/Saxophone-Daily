import React, { useState } from 'react';
import { SaxophoneType } from '../types/music';
import { Camera, Sparkles, Layers, Sliders, Eye } from 'lucide-react';

interface SaxophoneDiagramProps {
  activeKeys: string[];
  saxType: SaxophoneType;
  onKeyClick?: (keyId: string) => void;
}

export const SaxophoneDiagram: React.FC<SaxophoneDiagramProps> = ({
  activeKeys,
  saxType,
  onKeyClick,
}) => {
  // View mode: 'photo' (真实实物写真指位对照), 'split' (实物与图例双屏对照), 'diagram' (大号指法图谱)
  const [viewMode, setViewMode] = useState<'photo' | 'split' | 'diagram'>('photo');
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1.2); // 放大 20%

  const isKeyActive = (keyId: string) => activeKeys.includes(keyId);

  // Real instrument photo URLs
  const realPhotoSrc =
    saxType === 'alto'
      ? '/images/alto_saxophone_real.png'
      : '/images/soprano_saxophone_real.jpg';

  const realInstrumentTitle =
    saxType === 'alto'
      ? '经典降E中音萨克斯 (Eb Alto) 法国原厂实物写真'
      : '旗舰降B高音萨克斯 (Bb Soprano) 经典原厂实物写真';

  return (
    <div className="flex flex-col items-center justify-center select-none w-full">
      {/* Top Diagram Controls & View Switcher */}
      <div className="flex flex-wrap items-center justify-between w-full px-2 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-black text-sm text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {saxType === 'alto' ? '中音萨克斯 (Eb Alto)' : '高音萨克斯 (Bb Soprano)'} 真实实物图例 (已放大 20%)
          </span>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setViewMode('photo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'photo'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="真实真实原琴高清相片"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>真实原琴图例</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'split'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="实物照片与指法图并排对照"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">真琴与按键对照</span>
            <span className="sm:hidden">双屏对照</span>
          </button>

          <button
            onClick={() => setViewMode('diagram')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'diagram'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="指法交互按键图谱"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>交互按键图</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-5 items-center justify-center p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/90 shadow-2xl">
        {/* ==================== 1. 真实萨克斯实物写真展示区 (放大 20%+) ==================== */}
        {(viewMode === 'split' || viewMode === 'photo') && (
          <div
            className={`relative flex flex-col items-center justify-center rounded-2xl p-4 sm:p-6 bg-slate-950/95 border border-amber-500/25 shadow-2xl overflow-hidden ${
              viewMode === 'split' ? 'md:col-span-6' : 'md:col-span-12 w-full max-w-2xl mx-auto'
            }`}
          >
            <div className="w-full flex items-center justify-between mb-3 px-1 border-b border-slate-800/80 pb-2">
              <span className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-400" />
                真实乐器实拍照 ({saxType === 'alto' ? '经典弯管中音 Eb Alto' : '通体直管高音 Bb Soprano'})
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold px-2 py-0.5 rounded-md">
                  尺寸放大 +20%
                </span>
                <button
                  onClick={() => setShowAnnotations(!showAnnotations)}
                  className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  {showAnnotations ? '隐藏标记' : '显示标记'}
                </button>
              </div>
            </div>

            {/* Real Instrument Photo (Enlarged by 20%+, min height 520px) */}
            <div className="relative group flex items-center justify-center w-full min-h-[460px] sm:min-h-[560px] py-3">
              {/* Golden Ambient Glow behind real saxophone */}
              <div className="absolute inset-0 bg-radial from-amber-500/20 via-amber-900/10 to-transparent pointer-events-none blur-3xl" />

              <img
                src={realPhotoSrc}
                alt={realInstrumentTitle}
                referrerPolicy="no-referrer"
                className="relative z-10 max-h-[520px] sm:max-h-[620px] w-auto object-contain drop-shadow-[0_16px_36px_rgba(245,158,11,0.35)] transition-transform duration-300 hover:scale-105"
              />

              {/* Photo Anatomy Badge Tooltips with real acoustic parts */}
              {showAnnotations && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-6 px-2 sm:px-4 z-20">
                  <div className="flex justify-between items-start">
                    <span className="bg-slate-900/90 text-amber-300 border border-amber-500/40 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm">
                      ① 泛音弯颈 / 胶木笛头
                    </span>
                    <span className="bg-slate-900/90 text-amber-200 border border-amber-500/30 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full shadow-lg backdrop-blur-sm">
                      {saxType === 'alto' ? '经典 Eb 弯颈' : '直列一体管口'}
                    </span>
                  </div>
                  <div className="flex justify-end pr-2">
                    <span className="bg-slate-900/90 text-sky-300 border border-sky-500/40 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm">
                      ② 左手上把位 (1·2·3主音孔)
                    </span>
                  </div>
                  <div className="flex justify-start pl-2">
                    <span className="bg-slate-900/90 text-emerald-300 border border-emerald-500/40 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm">
                      ③ 右手下把位 (4·5·6主音孔)
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="bg-slate-900/90 text-rose-300 border border-rose-500/40 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-lg backdrop-blur-sm">
                      低音小指联动台 (Eb/C)
                    </span>
                    <span className="bg-slate-900/90 text-amber-400 border border-amber-500/50 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm">
                      ④ 法式复古雕花喇叭口 (Bell)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <p className="text-xs text-amber-300 font-semibold mb-0.5">
                真实乐器真琴图例（高光黄铜与天然珍珠贝壳键位）
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                原琴实物拍摄，可清晰看清琴身弧度、音孔间距、连杆轴组与喇叭口雕花，直观指导持琴手型与真琴指法对位。
              </p>
            </div>
          </div>
        )}

        {/* ==================== 2. 大号超清交互指法键位图 (放大20%+) ==================== */}
        {(viewMode === 'split' || viewMode === 'diagram') && (
          <div
            className={`flex flex-col items-center justify-center ${
              viewMode === 'split' ? 'md:col-span-6' : 'md:col-span-12 w-full max-w-2xl mx-auto'
            }`}
          >
            <div className="w-full flex items-center justify-between mb-2 px-2 text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                超清指法按键互动图（已放大 20%）
              </span>
              <span className="text-[11px] text-amber-400 font-semibold">
                按键支持点击触发
              </span>
            </div>

            {/* 大号超清 SVG 萨克斯模型 (放大 20%) */}
            <div className="w-full flex items-center justify-center p-2">
              <svg
                width="480"
                height="720"
                viewBox="0 0 300 450"
                className="w-full max-w-[440px] sm:max-w-[490px] h-auto drop-shadow-[0_16px_36px_rgba(0,0,0,0.9)] transition-all duration-300 touch-manipulation"
              >
                <defs>
                  {/* 真实黄铜镜面高光金属渐变 */}
                  <linearGradient id="saxBrassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#78350f" />
                    <stop offset="16%" stopColor="#b45309" />
                    <stop offset="40%" stopColor="#fef08a" />
                    <stop offset="55%" stopColor="#ffffff" />
                    <stop offset="70%" stopColor="#f59e0b" />
                    <stop offset="88%" stopColor="#b45309" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>

                  {/* 钟口喇叭立体反射渐变 */}
                  <linearGradient id="bellGrad" x1="0%" y1="100%" x2="90%" y2="0%">
                    <stop offset="0%" stopColor="#78350f" />
                    <stop offset="25%" stopColor="#b45309" />
                    <stop offset="50%" stopColor="#fef08a" />
                    <stop offset="75%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#92400e" />
                  </linearGradient>

                  {/* 喇叭口内部黑金声学共鸣阴影 */}
                  <radialGradient id="bellInnerGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="65%" stopColor="#451a03" />
                    <stop offset="100%" stopColor="#78350f" />
                  </radialGradient>

                  {/* 白珍珠母贝按键渐变 */}
                  <linearGradient id="pearlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="45%" stopColor="#f8fafc" />
                    <stop offset="75%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                  </linearGradient>

                  {/* 闭合按下时橙金色辉光渐变 */}
                  <linearGradient id="activeKeyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="30%" stopColor="#fbbf24" />
                    <stop offset="70%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>

                {/* ===================== 萨克斯管体绘制 ===================== */}
                {saxType === 'alto' ? (
                  /* 中音萨克斯 (Eb Alto) - 弯管曲颈造型 */
                  <g id="alto_body">
                    {/* 笛头与金色卡子 */}
                    <polygon points="104,10 124,10 122,36 106,36" fill="#0f172a" stroke="#020617" strokeWidth="1.2" />
                    <rect x="105" y="19" width="18" height="9" rx="2" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
                    {/* 软木节 (Cork) */}
                    <rect x="107" y="36" width="14" height="11" fill="#d97706" stroke="#b45309" strokeWidth="0.8" />

                    {/* 弯曲脖管 (Curved Neck) */}
                    <path d="M 114,47 C 114,65 120,73 130,85" fill="none" stroke="url(#saxBrassGrad)" strokeWidth="14" strokeLinecap="round" />
                    {/* 八度连杆与气孔 (Octave Lever) */}
                    <path d="M 108,57 Q 116,53 124,62" fill="none" stroke="#fef08a" strokeWidth="2.5" />
                    <circle cx="110" cy="57" r="2.8" fill="#ca8a04" />

                    {/* 颈节连接环 (Neck Tenon Receiver Ring) */}
                    <rect x="115" y="85" width="30" height="6.5" rx="2" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />

                    {/* 主管身锥形铜管 (Conical Brass Tube) */}
                    <polygon points="117,89 143,89 153,348 109,348" fill="url(#saxBrassGrad)" />

                    {/* U型底弯管 (Bow) */}
                    <path
                      d="M 109,348 C 107,392 126,428 165,428 C 206,428 228,394 238,338 C 246,295 260,260 278,244 C 266,310 236,434 165,434 C 104,434 97,382 101,348 Z"
                      fill="url(#bellGrad)"
                    />

                    {/* 大喇叭口 (Flared Bell) */}
                    <ellipse
                      cx="258"
                      cy="250"
                      rx="25"
                      ry="38"
                      transform="rotate(-28 258 250)"
                      fill="url(#bellInnerGrad)"
                      stroke="#fef08a"
                      strokeWidth="3"
                    />
                    <ellipse
                      cx="258"
                      cy="250"
                      rx="22"
                      ry="34"
                      transform="rotate(-28 258 250)"
                      fill="none"
                      stroke="#eab308"
                      strokeWidth="1.4"
                      strokeDasharray="4 2"
                    />

                    {/* 喇叭口低音金属护架 */}
                    <path d="M 207,358 L 232,374 L 244,350" fill="none" stroke="#eab308" strokeWidth="2.8" strokeLinecap="round" />
                    <circle cx="226" cy="367" r="9" fill="#78350f" stroke="#eab308" strokeWidth="2" />
                  </g>
                ) : (
                  /* 高音萨克斯 (Bb Soprano) - 直管造型 */
                  <g id="soprano_body">
                    {/* 笛头与卡子 */}
                    <polygon points="120,10 140,10 138,36 122,36" fill="#0f172a" stroke="#020617" strokeWidth="1.2" />
                    <rect x="121" y="19" width="18" height="9" rx="2" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
                    <rect x="123" y="36" width="14" height="11" fill="#d97706" />

                    {/* 直管颈节 */}
                    <rect x="121" y="47" width="18" height="38" fill="url(#saxBrassGrad)" />
                    <rect x="119" y="82" width="22" height="6" rx="2" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />

                    {/* 细长直管身锥体 */}
                    <polygon points="120,87 140,87 152,382 108,382" fill="url(#saxBrassGrad)" />

                    {/* 直管正向喇叭钟口 */}
                    <polygon points="108,382 152,382 165,430 95,430" fill="url(#bellGrad)" />
                    <ellipse cx="130" cy="430" rx="35" ry="14" fill="url(#bellInnerGrad)" stroke="#fef08a" strokeWidth="3" />
                  </g>
                )}

                {/* 连杆轴柱 */}
                <line x1="112" y1="92" x2="107" y2="345" stroke="#78350f" strokeWidth="2.8" />
                <line x1="147" y1="92" x2="154" y2="345" stroke="#78350f" strokeWidth="2.8" />

                {/* 部位文字标注 */}
                {showAnnotations && (
                  <g id="anatomical_labels" className="transition-opacity duration-200">
                    <text x="30" y="112" fill="#94a3b8" fontSize="11" fontWeight="800">【左手上把位】</text>
                    <path d="M 64,115 L 72,115 L 72,204 L 64,204" fill="none" stroke="#475569" strokeWidth="1.4" />

                    <text x="30" y="248" fill="#94a3b8" fontSize="11" fontWeight="800">【右手下把位】</text>
                    <path d="M 64,250 L 72,250 L 72,325 L 64,325" fill="none" stroke="#475569" strokeWidth="1.4" />

                    {saxType === 'alto' && (
                      <text x="216" y="222" fill="#fde68a" fontSize="11" fontWeight="800">【共鸣喇叭口】</text>
                    )}
                  </g>
                )}

                {/* ===================== 超大号清晰按键 (放大 25%+) ===================== */}

                {/* 左手拇指八度高音键 (Octave Key) - 尺寸大幅加大 */}
                <rect x="71" y="98" width="12" height="24" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
                <rect
                  id="key_octave"
                  x="68"
                  y="70"
                  width="20"
                  height="25"
                  rx="6.5"
                  onClick={() => onKeyClick?.('key_octave')}
                  className={`cursor-pointer transition-all duration-150 ${
                    isKeyActive('key_octave')
                      ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                      : 'fill-slate-800 stroke-amber-700 stroke-[1.6] hover:stroke-amber-400'
                  }`}
                />
                <text
                  x="78"
                  y="86.5"
                  fontSize="10"
                  fontWeight="900"
                  textAnchor="middle"
                  pointerEvents="none"
                  fill={isKeyActive('key_octave') ? '#ffffff' : '#94a3b8'}
                >
                  8(高音)
                </text>

                {/* 前高音 F 叉键 */}
                <circle cx="130" cy="95" r="5.5" fill="#ca8a04" stroke="#78350f" strokeWidth="1.2" />

                {/* 1号键：左手食指 (B) - 珍珠贝壳加大至 r=12.5 */}
                <circle
                  id="key_lh1"
                  cx="130"
                  cy="118"
                  r="12.5"
                  onClick={() => onKeyClick?.('key_lh1')}
                  className={`cursor-pointer transition-all duration-150 ${
                    isKeyActive('key_lh1')
                      ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                      : 'fill-[url(#pearlGrad)] stroke-amber-600 stroke-[2] hover:stroke-amber-400'
                  }`}
                />
                <text
                  x="130"
                  y="122"
                  fontSize="11"
                  fontWeight="900"
                  textAnchor="middle"
                  pointerEvents="none"
                  fill={isKeyActive('key_lh1') ? '#ffffff' : '#1e293b'}
                >
                  1(B)
                </text>

                {/* Bis 降B辅助键 (Bis Key) */}
                <circle cx="130" cy="136.5" r="5" fill="#e2e8f0" stroke="#ca8a04" strokeWidth="1.2" />

                {/* 2号键：左手中指 (A) - 加大至 r=12.5 */}
                <circle
                  id="key_lh2"
                  cx="130"
                  cy="155"
                  r="12.5"
                  onClick={() => onKeyClick?.('key_lh2')}
                  className={`cursor-pointer transition-all duration-150 ${
                    isKeyActive('key_lh2')
                      ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                      : 'fill-[url(#pearlGrad)] stroke-amber-600 stroke-[2] hover:stroke-amber-400'
                  }`}
                />
                <text
                  x="130"
                  y="159"
                  fontSize="11"
                  fontWeight="900"
                  textAnchor="middle"
                  pointerEvents="none"
                  fill={isKeyActive('key_lh2') ? '#ffffff' : '#1e293b'}
                >
                  2(A)
                </text>

                {/* 3号键：左手无名指 (G) - 加大至 r=12.5 */}
                <circle
                  id="key_lh3"
                  cx="130"
                  cy="186"
                  r="12.5"
                  onClick={() => onKeyClick?.('key_lh3')}
                  className={`cursor-pointer transition-all duration-150 ${
                    isKeyActive('key_lh3')
                      ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                      : 'fill-[url(#pearlGrad)] stroke-amber-600 stroke-[2] hover:stroke-amber-400'
                  }`}
                />
                <text
                  x="130"
                  y="190"
                  fontSize="11"
                  fontWeight="900"
                  textAnchor="middle"
                  pointerEvents="none"
                  fill={isKeyActive('key_lh3') ? '#ffffff' : '#1e293b'}
                >
                  3(G)
                </text>

                {/* 左手小指变音键群 (Spatula Table) */}
                {/* G# 侧翘板键 - 加宽加大 */}
                <rect
                  id="key_lh_gis"
                  x="82"
                  y="174"
                  width="26"
                  height="16"
                  rx="3.5"
                  onClick={() => onKeyClick?.('key_lh_gis')}
                  className={`cursor-pointer transition-all duration-150 ${
                    isKeyActive('key_lh_gis')
                      ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.6] drop-shadow-[0_0_11px_#f59e0b]'
                      : 'fill-slate-800 stroke-amber-700 stroke-[1.6] hover:stroke-amber-400'
                  }`}
                />
                <text
                  x="95"
                  y="186.5"
                  fontSize="10"
                  fontWeight="900"
                  textAnchor="middle"
                  pointerEvents="none"
                  fill={isKeyActive('key_lh_gis') ? '#ffffff' : '#cbd5e1'}
                >
                  G#
                </text>

                {/* 低音 C# 键 */}
                <rect
                  id="key_lh_cis"
                  x="82"
                  y="194"
                  width="12"
                  height="15"
                  rx="2"
                  onClick={() => onKeyClick?.('key_lh_cis')}
                  className={`cursor-pointer transition-all duration-150 ${
                    isKeyActive('key_lh_cis')
                      ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.4] drop-shadow-[0_0_9px_#f59e0b]'
                      : 'fill-slate-800 stroke-amber-700 stroke-[1.4] hover:stroke-amber-400'
                  }`}
                />
                <text
                  x="88"
                  y="205"
                  fontSize="8.5"
                  fontWeight="900"
                  textAnchor="middle"
                  pointerEvents="none"
                  fill={isKeyActive('key_lh_cis') ? '#ffffff' : '#94a3b8'}
                >
                  C#
                </text>

                {/* 低音 B 键 */}
                <rect
                  id="key_lh_low_b"
                  x="96"
                  y="194"
                  width="12"
                  height="15"
                  rx="2"
                  onClick={() => onKeyClick?.('key_lh_low_b')}
                  className={`cursor-pointer transition-all duration-150 ${
                    isKeyActive('key_lh_low_b')
                      ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.4] drop-shadow-[0_0_9px_#f59e0b]'
                      : 'fill-slate-800 stroke-amber-700 stroke-[1.4] hover:stroke-amber-400'
                  }`}
                />
                <text
                  x="102"
                  y="205"
                  fontSize="8.5"
                  fontWeight="900"
                  textAnchor="middle"
                  pointerEvents="none"
                  fill={isKeyActive('key_lh_low_b') ? '#ffffff' : '#94a3b8'}
                >
                  B
                </text>

                {/* 右手拇指托钩 */}
                <path d="M 152,220 Q 168,225 160,238" fill="none" stroke="#eab308" strokeWidth="3.5" strokeLinecap="round" />

                {/* 右手下把位 (RH Stack) */}
                {/* 4号键：右手食指 (F) - 加大至 r=12.5 */}
                <circle
                  id="key_rh1"
                  cx="131"
                  cy="230"
                  r="12.5"
                  onClick={() => onKeyClick?.('key_rh1')}
                  className={`cursor-pointer transition-all duration-150 ${
                    isKeyActive('key_rh1')
                      ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                      : 'fill-[url(#pearlGrad)] stroke-amber-600 stroke-[2] hover:stroke-amber-400'
                  }`}
                />
                <text
                  x="131"
                  y="234"
                  fontSize="11"
                  fontWeight="900"
                  textAnchor="middle"
                  pointerEvents="none"
                  fill={isKeyActive('key_rh1') ? '#ffffff' : '#1e293b'}
                >
                  4(F)
                </text>

                {/* 5号键：右手中指 (E) - 加大至 r=12.5 */}
                <circle
                  id="key_rh2"
                  cx="131"
                  cy="261"
                  r="12.5"
                  onClick={() => onKeyClick?.('key_rh2')}
                  className={`cursor-pointer transition-all duration-150 ${
                    isKeyActive('key_rh2')
                      ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                      : 'fill-[url(#pearlGrad)] stroke-amber-600 stroke-[2] hover:stroke-amber-400'
                  }`}
                />
                <text
                  x="131"
                  y="265"
                  fontSize="11"
                  fontWeight="900"
                  textAnchor="middle"
                  pointerEvents="none"
                  fill={isKeyActive('key_rh2') ? '#ffffff' : '#1e293b'}
                >
                  5(E)
                </text>

                {/* 6号键：右手无名指 (D) - 加大至 r=12.5 */}
                <circle
                  id="key_rh3"
                  cx="131"
                  cy="292"
                  r="12.5"
                  onClick={() => onKeyClick?.('key_rh3')}
                  className={`cursor-pointer transition-all duration-150 ${
                    isKeyActive('key_rh3')
                      ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.8] drop-shadow-[0_0_12px_#f59e0b]'
                      : 'fill-[url(#pearlGrad)] stroke-amber-600 stroke-[2] hover:stroke-amber-400'
                  }`}
                />
                <text
                  x="131"
                  y="296"
                  fontSize="11"
                  fontWeight="900"
                  textAnchor="middle"
                  pointerEvents="none"
                  fill={isKeyActive('key_rh3') ? '#ffffff' : '#1e293b'}
                >
                  6(D)
                </text>

                {/* 右手小指双滚轮键台 (Pinky Rollers) */}
                {/* 低音 Eb 键 */}
                <rect
                  id="key_rh_eb"
                  x="153"
                  y="288"
                  width="25"
                  height="16"
                  rx="4.5"
                  onClick={() => onKeyClick?.('key_rh_eb')}
                  className={`cursor-pointer transition-all duration-150 ${
                    isKeyActive('key_rh_eb')
                      ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.6] drop-shadow-[0_0_11px_#f59e0b]'
                      : 'fill-slate-800 stroke-amber-700 stroke-[1.6] hover:stroke-amber-400'
                  }`}
                />
                <text
                  x="165.5"
                  y="300"
                  fontSize="10"
                  fontWeight="900"
                  textAnchor="middle"
                  pointerEvents="none"
                  fill={isKeyActive('key_rh_eb') ? '#ffffff' : '#cbd5e1'}
                >
                  Eb
                </text>

                {/* 低音 C 键 */}
                <rect
                  id="key_rh_c"
                  x="153"
                  y="308"
                  width="25"
                  height="16"
                  rx="4.5"
                  onClick={() => onKeyClick?.('key_rh_c')}
                  className={`cursor-pointer transition-all duration-150 ${
                    isKeyActive('key_rh_c')
                      ? 'fill-[url(#activeKeyGrad)] stroke-white stroke-[2.6] drop-shadow-[0_0_11px_#f59e0b]'
                      : 'fill-slate-800 stroke-amber-700 stroke-[1.6] hover:stroke-amber-400'
                  }`}
                />
                <text
                  x="165.5"
                  y="320"
                  fontSize="9"
                  fontWeight="900"
                  textAnchor="middle"
                  pointerEvents="none"
                  fill={isKeyActive('key_rh_c') ? '#ffffff' : '#cbd5e1'}
                >
                  低音C
                </text>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

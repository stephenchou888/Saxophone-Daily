import React, { useState } from 'react';
import { Lightbulb, Wind, Music, Sparkles } from 'lucide-react';

interface PracticeTipsCardProps {
  scaleName: string;
  scaleTip: string;
}

export const PracticeTipsCard: React.FC<PracticeTipsCardProps> = ({
  scaleName,
  scaleTip,
}) => {
  const [activeTab, setActiveTab] = useState<'scale' | 'tones' | 'fingers' | 'embouchure'>('scale');

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">今日练琴重点指导</h3>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('scale')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'scale'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            本调要领
          </button>
          <button
            onClick={() => setActiveTab('tones')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'tones'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            长音与气息
          </button>
          <button
            onClick={() => setActiveTab('fingers')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'fingers'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            指法独立
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4 text-sm text-slate-300">
        {activeTab === 'scale' && (
          <div className="space-y-2">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 mt-1 shrink-0" />
              <p>
                <strong className="text-amber-300 font-bold">{scaleName} 关键技巧：</strong>
                {scaleTip}
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <Music className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
              <p>
                建议先使用 <span className="text-slate-200 font-medium">60 BPM</span> 慢速吹奏四分音符，每个音颗粒饱满、无按键机械杂音后，再逐渐提速至 90~110 BPM。
              </p>
            </div>
          </div>
        )}

        {activeTab === 'tones' && (
          <div className="space-y-2">
            <div className="flex items-start gap-2.5">
              <Wind className="w-4 h-4 text-sky-400 mt-1 shrink-0" />
              <p>
                <strong className="text-sky-300 font-bold">长音热身法（Long Tones）：</strong>
                正式爬音阶前，从低音 C4 / G4 开始，每个主音吹满 6~8 拍。喉头自然放松，腹部横膈膜匀速推气。
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-400 mt-1 shrink-0" />
              <p>
                发音起始处不用舌头过重击打哨片，感受气息从弱到强（渐强 Crescendo）再收缩平稳（渐弱 Decrescendo）的音色控制。
              </p>
            </div>
          </div>
        )}

        {activeTab === 'fingers' && (
          <div className="space-y-2">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400 mt-1 shrink-0" />
              <p>
                <strong className="text-purple-300 font-bold">按键贴附原则：</strong>
                手指指肚时刻轻触贝壳珍珠，不要抬离按键超过 1 厘米，减少多余的手指位移才能保证高速跑动时均匀。
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <Music className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
              <p>
                左手大拇指按八度键时采用“滚动（Roll）”而非“跳跃（Jump）”动作；右手大拇指只起托稳乐器作用，切勿僵硬用力。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

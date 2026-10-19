import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PracticeTipsCardProps {
  scaleName: string;
  scaleTip: string;
}

// 通用练习要点（与调性无关），按设计稿以编号卡片展示
const GENERAL_TIPS: { title: string; body: string }[] = [
  {
    title: '速度循序渐进',
    body: '先用 60 BPM 慢速吹奏四分音符，每个音颗粒饱满、无按键机械杂音后，再逐渐提速至 90~110 BPM。',
  },
  {
    title: '长音热身',
    body: '正式爬音阶前，从低音 C4 / G4 开始，每个主音吹满 6~8 拍。喉头自然放松，腹部横膈膜匀速推气；起音不要用舌头过重击打哨片。',
  },
  {
    title: '按键贴附原则',
    body: '手指指肚时刻轻触按键，抬离不超过 1 厘米。左手大拇指按八度键用“滚动”而非“跳跃”，右手大拇指只起托稳作用。',
  },
];

export const PracticeTipsCard: React.FC<PracticeTipsCardProps> = ({ scaleName, scaleTip }) => {
  return (
    <Card className="py-5 sm:py-6">
      <CardContent className="space-y-5 px-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Lightbulb className="size-[18px]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">今日练琴重点</h2>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{scaleName.split(' (')[0]}：</span>
              {scaleTip}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
          {GENERAL_TIPS.map((tip, i) => (
            <div key={tip.title} className="rounded-lg border p-4">
              <div className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</div>
              <div className="mt-1.5 text-sm font-semibold">{tip.title}</div>
              <p className="mt-1 text-[13px] text-muted-foreground">{tip.body}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

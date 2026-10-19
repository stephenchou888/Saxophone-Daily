import React from 'react';
import { Lightbulb, Wind, Music, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PracticeTipsCardProps {
  scaleName: string;
  scaleTip: string;
}

const TipRow: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div className="flex items-start gap-2.5">
    <span className="mt-1 shrink-0">{icon}</span>
    <p className="text-foreground">{children}</p>
  </div>
);

export const PracticeTipsCard: React.FC<PracticeTipsCardProps> = ({ scaleName, scaleTip }) => {
  return (
    <Card className="gap-4">
      <Tabs defaultValue="scale" className="gap-4">
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="size-4 text-primary" />
            今日练琴重点指导
          </CardTitle>
          <TabsList>
            <TabsTrigger value="scale">本调要领</TabsTrigger>
            <TabsTrigger value="tones">长音与气息</TabsTrigger>
            <TabsTrigger value="fingers">指法独立</TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border bg-muted/40 p-4 text-sm">
            <TabsContent value="scale" className="space-y-2">
              <TipRow icon={<Sparkles className="size-4 text-primary" />}>
                <strong className="font-semibold text-primary">{scaleName} 关键技巧：</strong>
                {scaleTip}
              </TipRow>
              <TipRow icon={<Music className="size-4 text-success" />}>
                建议先使用 <span className="font-medium">60 BPM</span>{' '}
                慢速吹奏四分音符，每个音颗粒饱满、无按键机械杂音后，再逐渐提速至 90~110 BPM。
              </TipRow>
            </TabsContent>

            <TabsContent value="tones" className="space-y-2">
              <TipRow icon={<Wind className="size-4 text-sky-400" />}>
                <strong className="font-semibold text-sky-400">长音热身法（Long Tones）：</strong>
                正式爬音阶前，从低音 C4 / G4 开始，每个主音吹满 6~8 拍。喉头自然放松，腹部横膈膜匀速推气。
              </TipRow>
              <TipRow icon={<Lightbulb className="size-4 text-primary" />}>
                发音起始处不用舌头过重击打哨片，感受气息从弱到强（渐强 Crescendo）再收缩平稳（渐弱
                Decrescendo）的音色控制。
              </TipRow>
            </TabsContent>

            <TabsContent value="fingers" className="space-y-2">
              <TipRow icon={<Sparkles className="size-4 text-purple-400" />}>
                <strong className="font-semibold text-purple-400">按键贴附原则：</strong>
                手指指肚时刻轻触贝壳珍珠，不要抬离按键超过 1 厘米，减少多余的手指位移才能保证高速跑动时均匀。
              </TipRow>
              <TipRow icon={<Music className="size-4 text-success" />}>
                左手大拇指按八度键时采用“滚动（Roll）”而非“跳跃（Jump）”动作；右手大拇指只起托稳乐器作用，切勿僵硬用力。
              </TipRow>
            </TabsContent>
          </div>
        </CardContent>
      </Tabs>
    </Card>
  );
};

import { useEffect, useRef } from 'react';

// 节拍时钟：running 时每拍（60000 / bpm 毫秒）调用一次 onBeat。
// 节拍器与慢速演示共用同一个时钟，两者始终同步；bpm 变化时立即按新速度重排。
// onBeat 通过 ref 读取，总是拿到最新的回调与状态。
// phaseKey 变化时重新起拍：让下一拍从“此刻起一整拍之后”开始，用于与刚刚响起的声音对齐。
export function useBeatClock(bpm: number, running: boolean, onBeat: () => void, phaseKey = 0) {
  const onBeatRef = useRef(onBeat);
  onBeatRef.current = onBeat;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => onBeatRef.current(), 60000 / bpm);
    return () => clearInterval(timer);
  }, [bpm, running, phaseKey]);
}

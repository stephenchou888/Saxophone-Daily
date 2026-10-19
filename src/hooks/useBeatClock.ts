import { useEffect, useRef } from 'react';

// 节拍时钟：running 时每拍（60000 / bpm 毫秒）调用一次 onBeat。
// 节拍器与慢速演示共用同一个时钟，两者始终同步；bpm 变化时立即按新速度重排。
// onBeat 通过 ref 读取，总是拿到最新的回调与状态。
export function useBeatClock(bpm: number, running: boolean, onBeat: () => void) {
  const onBeatRef = useRef(onBeat);
  onBeatRef.current = onBeat;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => onBeatRef.current(), 60000 / bpm);
    return () => clearInterval(timer);
  }, [bpm, running]);
}

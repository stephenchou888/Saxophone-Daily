import { useRef, useCallback, useEffect } from 'react';
import { SaxophoneType } from '../types/music';

export function useSoundEngine() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  // iOS Safari audio unlock on first user gesture
  useEffect(() => {
    const unlock = () => {
      const ctx = getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        // Play silent buffer for iOS
        try {
          const buffer = ctx.createBuffer(1, 1, 22050);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
        } catch (_) {}
      }
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('touchend', unlock);
      window.removeEventListener('click', unlock);
    };

    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('touchend', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });

    return () => {
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('touchend', unlock);
      window.removeEventListener('click', unlock);
    };
  }, [getAudioContext]);

  const playTone = useCallback(
    (writtenFreq: number, saxType: SaxophoneType, duration = 0.5) => {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        // Alto (Eb): sounds a major 6th lower (-9 semitones)
        // Soprano (Bb): sounds a major 2nd lower (-2 semitones)
        const semitoneShift = saxType === 'alto' ? -9 : -2;
        const actualFreq = writtenFreq * Math.pow(2, semitoneShift / 12);

        const osc = ctx.createOscillator();
        const subOsc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(actualFreq, ctx.currentTime);

        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(actualFreq * 2, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1700, ctx.currentTime);
        filter.Q.setValueAtTime(2.2, ctx.currentTime);

        const now = ctx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.22, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.16, now + 0.15);
        gainNode.gain.setValueAtTime(0.16, now + duration - 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        subOsc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        subOsc.start(now);
        osc.stop(now + duration);
        subOsc.stop(now + duration);
      } catch (e) {
        console.error('Audio playback error:', e);
      }
    },
    [getAudioContext]
  );

  const playClick = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      console.error('Metronome click error:', e);
    }
  }, [getAudioContext]);

  return {
    playTone,
    playClick,
    getAudioContext,
  };
}

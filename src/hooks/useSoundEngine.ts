import { useRef, useCallback, useEffect } from 'react';
import { SaxophoneType } from '../types/music';

// Primary natural frequency for individual saxophone keys when pressed
export const KEY_PITCH_MAP: Record<string, { freq: number; label: string }> = {
  key_octave: { freq: 880.00, label: '八度高音气孔 (泛音)' },
  key_lh1:    { freq: 493.88, label: 'B4 (左手1号音孔)' },
  key_lh2:    { freq: 440.00, label: 'A4 (左手2号音孔)' },
  key_lh3:    { freq: 392.00, label: 'G4 (左手3号音孔)' },
  key_lh_gis: { freq: 415.30, label: 'G#4 (小指翘板侧键)' },
  key_lh_cis: { freq: 277.18, label: 'C#4 (低音变音孔)' },
  key_lh_low_b:{ freq: 246.94, label: 'B3 (低音共鸣大键)' },
  key_rh1:    { freq: 349.23, label: 'F4 (右手4号音孔)' },
  key_rh2:    { freq: 329.63, label: 'E4 (右手5号音孔)' },
  key_rh3:    { freq: 293.66, label: 'D4 (右手6号音孔)' },
  key_rh_eb:  { freq: 311.13, label: 'Eb4 (右手小指Eb滚轮)' },
  key_rh_c:   { freq: 261.63, label: 'C4 (右手小指低音C)' },
};

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

  // iOS Safari & Mobile audio unlock on first user gesture
  useEffect(() => {
    const unlock = () => {
      const ctx = getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
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

  /**
   * 细致化真实真琴机械音垫与连杆按键音效 (Saxophone Mechanical Leather Pad & Keywork Sound)
   * 模拟真实萨克斯：
   * 1. 羊皮/牛皮密封垫压合黄铜音孔时的柔和低频冲击沉闷声 (Tone-hole Thud)
   * 2. 皮垫触碰音孔边缘的气流与微声 (Leather Cushion Pop)
   * 3. 镀镍不锈钢连杆轴与蓝钢针簧的清脆金属咬合音 (Keywork Needle Spring Tick)
   */
  const playKeyPadClick = useCallback(
    (keyId?: string) => {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;

        // 根据按键位置调整物理腔体共鸣基础频率（下把位/大音孔按键更沉，上把位更脆）
        let basePitch = 180;
        if (keyId?.includes('rh_c') || keyId?.includes('low_b') || keyId?.includes('rh_eb')) {
          basePitch = 135; // 低音区，大管体低频共鸣沉闷
        } else if (keyId?.includes('octave') || keyId?.includes('lh1')) {
          basePitch = 230; // 高音小音孔，清脆微弹
        }

        // 1. 柔韧皮垫按合音孔的低频气穴沉音 (Leather Pad Air Cavity Thud)
        const thudOsc = ctx.createOscillator();
        const thudGain = ctx.createGain();
        thudOsc.type = 'triangle';
        thudOsc.frequency.setValueAtTime(basePitch, now);
        thudOsc.frequency.exponentialRampToValueAtTime(45, now + 0.035);

        thudGain.gain.setValueAtTime(0.24, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        thudOsc.connect(thudGain);
        thudGain.connect(ctx.destination);
        thudOsc.start(now);
        thudOsc.stop(now + 0.038);

        // 2. 音孔皮革撞击瞬态噪声 (Leather Slap Transient)
        const noiseBufferSize = Math.floor(ctx.sampleRate * 0.02); // 20ms
        const noiseBuffer = ctx.createBuffer(1, noiseBufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseBufferSize * 0.25));
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1400, now);
        noiseFilter.Q.setValueAtTime(2.5, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.18, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseSource.start(now);

        // 3. 蓝钢弹簧与金属按键杠杆轴轻脆卡嗒声 (Needle Spring & Brass Keywork Click)
        const tickOsc = ctx.createOscillator();
        const tickGain = ctx.createGain();
        tickOsc.type = 'sine';
        tickOsc.frequency.setValueAtTime(3200, now);
        tickOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.008);

        tickGain.gain.setValueAtTime(0.08, now);
        tickGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.008);

        tickOsc.connect(tickGain);
        tickGain.connect(ctx.destination);
        tickOsc.start(now);
        tickOsc.stop(now + 0.009);
      } catch (e) {
        console.error('Key pad audio error:', e);
      }
    },
    [getAudioContext]
  );

  /**
   * 真实萨克斯管乐音色合成 (Acoustic Saxophone Synthesis)
   * 采用黄铜锥形管声学模型：锯齿波簧片激励 + 偶次谐波共振 + 喉腔共鸣带通滤波 + 微妙呼吸气流 + 揉弦
   */
  const playTone = useCallback(
    (writtenFreq: number, saxType: SaxophoneType, duration = 0.5) => {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        // Alto (Eb): sounds a major 6th lower (-9 semitones)
        // Soprano (Bb): sounds a major 2nd lower (-2 semitones)
        const semitoneShift = saxType === 'alto' ? -9 : -2;
        const actualFreq = writtenFreq * Math.pow(2, semitoneShift / 12);
        const now = ctx.currentTime;

        // 主振荡器：锯齿波模拟单簧片周期振动
        const reedOsc = ctx.createOscillator();
        reedOsc.type = 'sawtooth';
        reedOsc.frequency.setValueAtTime(actualFreq, now);

        // 次振荡器：三角波提供萨克斯管身下部饱满的圆润基频 (Body fundamental)
        const subOsc = ctx.createOscillator();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(actualFreq, now);

        // 高次泛音器：微弱方波模拟笛头哨片咬合的高频脆响 (Overtones)
        const highOsc = ctx.createOscillator();
        highOsc.type = 'square';
        highOsc.frequency.setValueAtTime(actualFreq * 2, now);

        // 柔和微揉弦 LFO (Vibrato)
        const vibrato = ctx.createOscillator();
        const vibratoGain = ctx.createGain();
        vibrato.frequency.setValueAtTime(5.3, now); // 5.3 Hz natural vibrato
        vibratoGain.gain.setValueAtTime(0, now);
        // 80ms 延时切入自然揉弦
        vibratoGain.gain.linearRampToValueAtTime(actualFreq * 0.008, now + 0.18);
        vibrato.connect(reedOsc.frequency);
        vibrato.start(now);
        vibrato.stop(now + duration);

        // 萨克斯喉腔特征共鸣滤波 (Formant Filter, ~650Hz)
        const formantFilter = ctx.createBiquadFilter();
        formantFilter.type = 'bandpass';
        formantFilter.frequency.setValueAtTime(saxType === 'alto' ? 620 : 750, now);
        formantFilter.Q.setValueAtTime(1.8, now);

        // 管体低通温润滤波 (~1900Hz)
        const bodyFilter = ctx.createBiquadFilter();
        bodyFilter.type = 'lowpass';
        bodyFilter.frequency.setValueAtTime(saxType === 'alto' ? 1800 : 2100, now);
        bodyFilter.Q.setValueAtTime(2.2, now);

        // 呼吸气流粉红噪声 (Breath Air Stream)
        const breathSize = Math.floor(ctx.sampleRate * Math.min(duration, 0.4));
        const breathBuffer = ctx.createBuffer(1, breathSize, ctx.sampleRate);
        const breathData = breathBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < breathSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          breathData[i] = (b0 + b1 + b2 + white * 0.5362) * 0.04;
        }
        const breathSource = ctx.createBufferSource();
        breathSource.buffer = breathBuffer;
        const breathGain = ctx.createGain();
        breathGain.gain.setValueAtTime(0.012, now);
        breathGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        breathSource.connect(breathGain);
        breathGain.connect(ctx.destination);
        breathSource.start(now);

        // 主增益节点与自然包络 (ADSR)
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.0001, now);
        // 软起音 Attack (35ms)
        masterGain.gain.linearRampToValueAtTime(0.24, now + 0.035);
        masterGain.gain.linearRampToValueAtTime(0.18, now + 0.12);
        // 延音与渐弱 Release
        masterGain.gain.setValueAtTime(0.18, now + duration - 0.07);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        const highGain = ctx.createGain();
        highGain.gain.setValueAtTime(0.04, now);

        reedOsc.connect(bodyFilter);
        subOsc.connect(bodyFilter);
        highOsc.connect(highGain);
        highGain.connect(bodyFilter);

        bodyFilter.connect(masterGain);
        masterGain.connect(ctx.destination);

        reedOsc.start(now);
        subOsc.start(now);
        highOsc.start(now);

        reedOsc.stop(now + duration);
        subOsc.stop(now + duration);
        highOsc.stop(now + duration);
      } catch (e) {
        console.error('Audio playback error:', e);
      }
    },
    [getAudioContext]
  );

  /**
   * 萨克斯按键综合发音方法 (Key Press Sound with pad click + acoustic tone)
   */
  const playSaxKeyAction = useCallback(
    (
      keyId: string,
      saxType: SaxophoneType,
      options?: {
        soundMode?: 'both' | 'tone' | 'click';
        customFreq?: number;
      }
    ) => {
      const mode = options?.soundMode || 'both';

      // 1. 发出真实皮革音垫机械声
      if (mode === 'both' || mode === 'click') {
        playKeyPadClick(keyId);
      }

      // 2. 发出萨克斯乐音声学音色
      if (mode === 'both' || mode === 'tone') {
        const targetFreq = options?.customFreq || KEY_PITCH_MAP[keyId]?.freq || 440;
        // 稍作微秒延迟(5ms)，使机械皮革触感与哨片震颤更具真实物理层次感
        setTimeout(() => {
          playTone(targetFreq, saxType, 0.42);
        }, 6);
      }
    },
    [playKeyPadClick, playTone]
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
    playKeyPadClick,
    playSaxKeyAction,
    playClick,
    getAudioContext,
  };
}

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { SaxophoneType } from '../types/music';

export type SaxRegister = 'low' | 'high' | 'altissimo';

export interface KeyPitchDefinition {
  lowFreq: number;       // 低/中八度记谱基频 (Written Pitch Hz)
  highFreq: number;      // 高八度记谱基频 (+8ve Written Pitch Hz)
  altissimoFreq: number; // 超吹记谱频率 (Altissimo Written Pitch Hz)
  label: string;         // 按键全称与位置
  shortName: string;     // 简短标签，如 4(F), 侧C
  hand: 'right' | 'left' | 'thumb'; // 手位
  category: 'stack' | 'side' | 'palm' | 'table' | 'octave' | 'altissimo';
  writtenNoteLow: string;
  writtenNoteHigh: string;
  writtenNoteAlt: string;
}

// 严谨对应真实萨克斯管乐物理按键声学与指法频率映射表 (全按键严密涵盖右手群、左手群、掌键群与侧键群)
export const KEY_PITCH_MAP: Record<string, KeyPitchDefinition> = {
  // ===================== 右手按键群 (右侧核心按键) =====================
  key_rh1: {
    lowFreq: 349.23, // F4
    highFreq: 698.46, // F5
    altissimoFreq: 1396.91, // F6
    label: '右手4号键 (F音孔 · 右手食指)',
    shortName: '4(F)',
    hand: 'right',
    category: 'stack',
    writtenNoteLow: 'F4',
    writtenNoteHigh: 'F5',
    writtenNoteAlt: 'F6',
  },
  key_rh2: {
    lowFreq: 329.63, // E4
    highFreq: 659.25, // E5
    altissimoFreq: 1318.51, // E6
    label: '右手5号键 (E音孔 · 右手中指)',
    shortName: '5(E)',
    hand: 'right',
    category: 'stack',
    writtenNoteLow: 'E4',
    writtenNoteHigh: 'E5',
    writtenNoteAlt: 'E6',
  },
  key_rh3: {
    lowFreq: 293.66, // D4
    highFreq: 587.33, // D5
    altissimoFreq: 1174.66, // D6
    label: '右手6号键 (D音孔 · 右手无名指)',
    shortName: '6(D)',
    hand: 'right',
    category: 'stack',
    writtenNoteLow: 'D4',
    writtenNoteHigh: 'D5',
    writtenNoteAlt: 'D6',
  },
  key_side_c: {
    lowFreq: 523.25, // C5
    highFreq: 1046.50, // C6
    altissimoFreq: 1567.98, // G6泛音辅助
    label: '右手侧C键 (高音泛音辅助 · 右手侧键)',
    shortName: '侧C',
    hand: 'right',
    category: 'side',
    writtenNoteLow: 'C5',
    writtenNoteHigh: 'C6',
    writtenNoteAlt: 'G6(泛音)',
  },
  key_side_bb: {
    lowFreq: 466.16, // Bb4
    highFreq: 932.33, // Bb5
    altissimoFreq: 1864.66, // 超吹Bb6
    label: '右手侧Bb键 (1+1侧辅助 · 右手侧键)',
    shortName: '侧Bb',
    hand: 'right',
    category: 'side',
    writtenNoteLow: 'Bb4',
    writtenNoteHigh: 'Bb5',
    writtenNoteAlt: 'Bb6(泛音)',
  },
  key_high_fis: {
    lowFreq: 739.99, // F#5
    highFreq: 1479.98, // F#6
    altissimoFreq: 1479.98, // F#6
    label: '右手高音F#键 (现代高音F#侧键)',
    shortName: '高F#',
    hand: 'right',
    category: 'side',
    writtenNoteLow: 'F#5',
    writtenNoteHigh: 'F#6',
    writtenNoteAlt: 'F#6',
  },
  key_rh_eb: {
    lowFreq: 311.13, // Eb4
    highFreq: 622.25, // Eb5
    altissimoFreq: 1244.51, // Eb6
    label: '右手低音Eb键 (右手小指上滚轮)',
    shortName: 'Eb',
    hand: 'right',
    category: 'table',
    writtenNoteLow: 'Eb4',
    writtenNoteHigh: 'Eb5',
    writtenNoteAlt: 'Eb6',
  },
  key_rh_c: {
    lowFreq: 261.63, // C4
    highFreq: 523.25, // C5
    altissimoFreq: 1046.50, // C6
    label: '右手低音C键 (右手小指下底板)',
    shortName: '低音C',
    hand: 'right',
    category: 'table',
    writtenNoteLow: 'C4',
    writtenNoteHigh: 'C5',
    writtenNoteAlt: 'C6',
  },

  // ===================== 左手主按键群 =====================
  key_lh1: {
    lowFreq: 493.88, // B4
    highFreq: 987.77, // B5
    altissimoFreq: 1975.53, // B6
    label: '左手1号键 (B音孔 · 左手食指)',
    shortName: '1(B)',
    hand: 'left',
    category: 'stack',
    writtenNoteLow: 'B4',
    writtenNoteHigh: 'B5',
    writtenNoteAlt: 'B6',
  },
  key_lh2: {
    lowFreq: 440.00, // A4
    highFreq: 880.00, // A5
    altissimoFreq: 1760.00, // A6
    label: '左手2号键 (A音孔 · 左手中指)',
    shortName: '2(A)',
    hand: 'left',
    category: 'stack',
    writtenNoteLow: 'A4',
    writtenNoteHigh: 'A5',
    writtenNoteAlt: 'A6',
  },
  key_lh3: {
    lowFreq: 392.00, // G4
    highFreq: 783.99, // G5
    altissimoFreq: 1661.22, // G#6/G6
    label: '左手3号键 (G音孔 · 左手无名指)',
    shortName: '3(G)',
    hand: 'left',
    category: 'stack',
    writtenNoteLow: 'G4',
    writtenNoteHigh: 'G5',
    writtenNoteAlt: 'G#6',
  },

  // ===================== 左手小指变音台 (Spatula Table) =====================
  key_lh_gis: {
    lowFreq: 415.30, // G#4
    highFreq: 830.61, // G#5
    altissimoFreq: 1661.22, // G#6
    label: '左手G#侧翘板 (左手小指上翘板)',
    shortName: 'G#',
    hand: 'left',
    category: 'table',
    writtenNoteLow: 'G#4',
    writtenNoteHigh: 'G#5',
    writtenNoteAlt: 'G#6',
  },
  key_lh_cis: {
    lowFreq: 277.18, // C#4
    highFreq: 554.37, // C#5
    altissimoFreq: 1108.73, // C#6
    label: '左手低音C#键 (左手小指内侧板)',
    shortName: 'C#',
    hand: 'left',
    category: 'table',
    writtenNoteLow: 'C#4',
    writtenNoteHigh: 'C#5',
    writtenNoteAlt: 'C#6',
  },
  key_lh_low_b: {
    lowFreq: 246.94, // B3
    highFreq: 493.88, // B4
    altissimoFreq: 987.77, // B5
    label: '左手低音B键 (钟口共鸣大键)',
    shortName: '低音B',
    hand: 'left',
    category: 'table',
    writtenNoteLow: 'B3',
    writtenNoteHigh: 'B4',
    writtenNoteAlt: 'B5',
  },
  key_lh_low_bb: {
    lowFreq: 233.08, // Bb3
    highFreq: 466.16, // Bb4
    altissimoFreq: 932.33, // Bb5
    label: '左手最低音Bb键 (全管长闭合极限底音)',
    shortName: '低音Bb',
    hand: 'left',
    category: 'table',
    writtenNoteLow: 'Bb3',
    writtenNoteHigh: 'Bb4',
    writtenNoteAlt: 'Bb5',
  },

  // ===================== 左手高音掌键群 (Palm Keys) =====================
  key_palm_d: {
    lowFreq: 587.33, // D5
    highFreq: 1174.66, // D6
    altissimoFreq: 1174.66, // D6
    label: '左手掌键 D (高音掌键D6)',
    shortName: '掌D',
    hand: 'left',
    category: 'palm',
    writtenNoteLow: 'D5',
    writtenNoteHigh: 'D6',
    writtenNoteAlt: 'D6',
  },
  key_palm_eb: {
    lowFreq: 622.25, // Eb5
    highFreq: 1244.51, // Eb6
    altissimoFreq: 1244.51, // Eb6
    label: '左手掌键 Eb (高音掌键Eb6)',
    shortName: '掌Eb',
    hand: 'left',
    category: 'palm',
    writtenNoteLow: 'Eb5',
    writtenNoteHigh: 'Eb6',
    writtenNoteAlt: 'Eb6',
  },
  key_palm_f: {
    lowFreq: 698.46, // F5
    highFreq: 1396.91, // F6
    altissimoFreq: 1396.91, // F6
    label: '左手掌键 F (高音掌键F6)',
    shortName: '掌F',
    hand: 'left',
    category: 'palm',
    writtenNoteLow: 'F5',
    writtenNoteHigh: 'F6',
    writtenNoteAlt: 'F6',
  },

  // ===================== 八度键与超吹核心键 =====================
  key_octave: {
    lowFreq: 440.00,
    highFreq: 880.00,
    altissimoFreq: 1760.00,
    label: '八度高音泛音孔 (左手大拇指按压)',
    shortName: '8度键',
    hand: 'thumb',
    category: 'octave',
    writtenNoteLow: 'A4',
    writtenNoteHigh: 'A5(+8ve)',
    writtenNoteAlt: 'A6(泛音)',
  },
  key_front_f: {
    lowFreq: 698.46,
    highFreq: 1396.91,
    altissimoFreq: 1567.98, // G6 超吹
    label: '前高音F叉键 (超吹核心指法键)',
    shortName: '前F',
    hand: 'left',
    category: 'altissimo',
    writtenNoteLow: 'F5',
    writtenNoteHigh: 'F6',
    writtenNoteAlt: 'Altissimo G6',
  },
};

// 调性转换与实音计算辅助工具
export function getSaxSoundingPitch(writtenFreq: number, saxType: SaxophoneType): {
  concertFreq: number;
  noteName: string;
} {
  // Alto (Eb): sounds a major 6th lower (-9 semitones)
  // Soprano (Bb): sounds a major 2nd lower (-2 semitones)
  const shift = saxType === 'alto' ? -9 : -2;
  const concertFreq = writtenFreq * Math.pow(2, shift / 12);

  // Note names mapping from frequency (A4 = 440Hz base)
  const noteNames = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const midi = Math.round(69 + 12 * Math.log2(concertFreq / 440));
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const noteName = `${noteNames[noteIndex]}${octave}`;

  return { concertFreq: Math.round(concertFreq * 100) / 100, noteName };
}

// ===================== 全局共享音频输出（#9） =====================
// 整个页面只创建一个 AudioContext；所有声音先接入总输出 GainNode 再到扬声器，
// 静音时把总输出增益置 0，对试听、按键、节拍器统一生效。
let sharedCtx: AudioContext | null = null;
let masterOut: GainNode | null = null;
let muted = false;
const muteListeners = new Set<() => void>();

function getSharedAudioContext(): AudioContext | null {
  if (!sharedCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    sharedCtx = new AudioCtx();
    masterOut = sharedCtx.createGain();
    masterOut.gain.value = muted ? 0 : 1;
    masterOut.connect(sharedCtx.destination);
  }
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

function getOutput(ctx: AudioContext): AudioNode {
  return masterOut ?? ctx.destination;
}

export function setAudioMuted(next: boolean) {
  muted = next;
  if (sharedCtx && masterOut) masterOut.gain.setValueAtTime(next ? 0 : 1, sharedCtx.currentTime);
  muteListeners.forEach((listener) => listener());
}

function subscribeMuted(listener: () => void) {
  muteListeners.add(listener);
  return () => muteListeners.delete(listener);
}

export function useAudioMuted(): [boolean, (next: boolean) => void] {
  const value = useSyncExternalStore(subscribeMuted, () => muted);
  return [value, setAudioMuted];
}

// iOS Safari & 移动端：首次用户手势时解锁音频（全局只注册一次）
let unlockInstalled = false;
function installAudioUnlock() {
  if (unlockInstalled) return;
  unlockInstalled = true;
  const unlock = () => {
    const ctx = getSharedAudioContext();
    if (ctx) {
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
}

export function useSoundEngine() {
  const getAudioContext = getSharedAudioContext;

  useEffect(() => {
    installAudioUnlock();
  }, []);

  /**
   * 细致化真琴机械皮垫闭合音效 (Saxophone Mechanical Leather Pad & Keywork Sound)
   */
  const playKeyPadClick = useCallback(
    (keyId?: string) => {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;

        // 根据按键物理位置调整皮垫气腔共鸣频响
        let basePitch = 180;
        if (
          keyId?.includes('rh_c') ||
          keyId?.includes('low_b') ||
          keyId?.includes('rh_eb') ||
          keyId?.includes('low_bb')
        ) {
          basePitch = 120; // 低音区与大喇叭口，沉重厚实的皮革压合声
        } else if (
          keyId?.includes('octave') ||
          keyId?.includes('palm') ||
          keyId?.includes('front_f') ||
          keyId?.includes('side')
        ) {
          basePitch = 280; // 侧键与八度掌键，轻灵利落的连杆金属声
        }

        // 1. 柔韧皮垫按合音孔的低频气穴沉音
        const thudOsc = ctx.createOscillator();
        const thudGain = ctx.createGain();
        thudOsc.type = 'triangle';
        thudOsc.frequency.setValueAtTime(basePitch, now);
        thudOsc.frequency.exponentialRampToValueAtTime(40, now + 0.038);

        thudGain.gain.setValueAtTime(0.24, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

        thudOsc.connect(thudGain);
        thudGain.connect(getOutput(ctx));
        thudOsc.start(now);
        thudOsc.stop(now + 0.04);

        // 2. 音孔皮革撞击瞬态噪声
        const noiseBufferSize = Math.floor(ctx.sampleRate * 0.022);
        const noiseBuffer = ctx.createBuffer(1, noiseBufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseBufferSize * 0.28));
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1450, now);
        noiseFilter.Q.setValueAtTime(2.2, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.16, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(getOutput(ctx));
        noiseSource.start(now);

        // 3. 蓝钢弹簧与连杆机械轴轻脆卡嗒声 (Click)
        const tickOsc = ctx.createOscillator();
        const tickGain = ctx.createGain();
        tickOsc.type = 'sine';
        tickOsc.frequency.setValueAtTime(3400, now);
        tickOsc.frequency.exponentialRampToValueAtTime(1100, now + 0.008);

        tickGain.gain.setValueAtTime(0.07, now);
        tickGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.008);

        tickOsc.connect(tickGain);
        tickGain.connect(getOutput(ctx));
        tickOsc.start(now);
        tickOsc.stop(now + 0.009);
      } catch (e) {
        console.error('Key pad audio error:', e);
      }
    },
    [getAudioContext]
  );

  /**
   * 真实萨克斯管乐音色合成 (严谨区分 中音 Alto Eb 与 高音 Soprano Bb，并支持低八度、高八度与超吹)
   */
  const playTone = useCallback(
    (
      writtenFreq: number,
      saxType: SaxophoneType,
      duration = 0.5,
      register: SaxRegister = 'low'
    ) => {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        // 严谨移调：
        // 中音 (Alto in Eb): 记谱音向下小三度再下一八度 = 大六度 (低 9 个半音)
        // 高音 (Soprano in Bb): 记谱音向下大二度 (低 2 个半音)
        const semitoneShift = saxType === 'alto' ? -9 : -2;
        const actualFreq = writtenFreq * Math.pow(2, semitoneShift / 12);

        const now = ctx.currentTime;

        // 1. 主振荡器：单簧片周期振动 (Sawtooth 单簧片锯齿波波形)
        const reedOsc = ctx.createOscillator();
        reedOsc.type = 'sawtooth';
        reedOsc.frequency.setValueAtTime(actualFreq, now);

        // 2. 次振荡器：管身基频共鸣 (Triangle / Sine)
        const subOsc = ctx.createOscillator();
        subOsc.type = register === 'altissimo' ? 'sine' : 'triangle';
        subOsc.frequency.setValueAtTime(
          register === 'altissimo' ? actualFreq * 1.5 : actualFreq,
          now
        );

        // 3. 高次泛音器 (模拟哨片咬合高频脆响与超吹裂帛穿透力)
        const highOsc = ctx.createOscillator();
        highOsc.type = register === 'altissimo' ? 'sawtooth' : 'square';
        highOsc.frequency.setValueAtTime(actualFreq * 2, now);

        // 柔和微揉弦 LFO (Vibrato)
        const vibrato = ctx.createOscillator();
        const vibratoGain = ctx.createGain();
        // 高音萨克斯颤音略快略灵动，中音稍宽厚
        const vibRate = saxType === 'soprano' ? 5.8 : register === 'altissimo' ? 6.2 : 5.0;
        vibrato.frequency.setValueAtTime(vibRate, now);
        vibratoGain.gain.setValueAtTime(0, now);
        vibratoGain.gain.linearRampToValueAtTime(
          actualFreq * (register === 'altissimo' ? 0.012 : 0.007),
          now + 0.14
        );
        // LFO 经过 vibratoGain 设定深度后再调制频率（直接相连只有 ±1 Hz，渐入包络也不起作用）
        vibrato.connect(vibratoGain);
        vibratoGain.connect(reedOsc.frequency);
        vibrato.start(now);
        vibrato.stop(now + duration);

        // 萨克斯管体共鸣带通滤波 (Formant Filter)
        const formantFilter = ctx.createBiquadFilter();
        formantFilter.type = 'bandpass';
        let formantCenter = saxType === 'alto' ? 620 : 820;
        if (register === 'high') formantCenter = saxType === 'alto' ? 1200 : 1450;
        if (register === 'altissimo') formantCenter = saxType === 'alto' ? 2400 : 2850;
        formantFilter.frequency.setValueAtTime(formantCenter, now);
        formantFilter.Q.setValueAtTime(register === 'altissimo' ? 3.6 : 1.9, now);

        // 管体低通滤波 (Body Lowpass Filter)
        const bodyFilter = ctx.createBiquadFilter();
        bodyFilter.type = 'lowpass';
        const cutoff =
          register === 'altissimo'
            ? saxType === 'soprano' ? 5200 : 4500
            : register === 'high'
            ? saxType === 'soprano' ? 3600 : 3100
            : saxType === 'soprano' ? 2400 : 1950;
        bodyFilter.frequency.setValueAtTime(cutoff, now);
        bodyFilter.Q.setValueAtTime(2.2, now);

        // 超吹特有高频尖锐爆破峰 (Altissimo Bite Filter)
        let altissimoGain: GainNode | null = null;
        if (register === 'altissimo') {
          const biteOsc = ctx.createOscillator();
          biteOsc.type = 'sawtooth';
          biteOsc.frequency.setValueAtTime(actualFreq * 3, now);
          altissimoGain = ctx.createGain();
          altissimoGain.gain.setValueAtTime(0.09, now);
          altissimoGain.gain.exponentialRampToValueAtTime(0.005, now + duration);
          biteOsc.connect(altissimoGain);
          altissimoGain.connect(bodyFilter);
          biteOsc.start(now);
          biteOsc.stop(now + duration);
        }

        // 呼吸气流粉红噪声 (Breath Air Stream)
        const breathSize = Math.floor(ctx.sampleRate * Math.min(duration, 0.45));
        const breathBuffer = ctx.createBuffer(1, breathSize, ctx.sampleRate);
        const breathData = breathBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < breathSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          breathData[i] = (b0 + b1 + b2 + white * 0.5362) * 0.038;
        }
        const breathSource = ctx.createBufferSource();
        breathSource.buffer = breathBuffer;
        const breathGain = ctx.createGain();
        breathGain.gain.setValueAtTime(register === 'altissimo' ? 0.024 : 0.012, now);
        breathGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        breathSource.connect(breathGain);
        breathGain.connect(getOutput(ctx));
        breathSource.start(now);

        // 主增益节点与自然包络 (ADSR)
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.0001, now);
        const attackTime = register === 'altissimo' ? 0.018 : saxType === 'soprano' ? 0.025 : 0.035;
        const peakGain = register === 'altissimo' ? 0.28 : 0.24;
        masterGain.gain.linearRampToValueAtTime(peakGain, now + attackTime);
        masterGain.gain.linearRampToValueAtTime(peakGain * 0.78, now + 0.12);
        masterGain.gain.setValueAtTime(peakGain * 0.78, now + duration - 0.06);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        const highGain = ctx.createGain();
        highGain.gain.setValueAtTime(register === 'altissimo' ? 0.12 : 0.04, now);

        reedOsc.connect(formantFilter);
        subOsc.connect(bodyFilter);
        highOsc.connect(highGain);
        highGain.connect(formantFilter);

        formantFilter.connect(bodyFilter);
        bodyFilter.connect(masterGain);
        masterGain.connect(getOutput(ctx));

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
   * 萨克斯按键综合发音方法 (发皮垫机械声 + 对应音区真实萨克斯乐音)
   */
  const playSaxKeyAction = useCallback(
    (
      keyId: string,
      saxType: SaxophoneType,
      options?: {
        soundMode?: 'both' | 'tone' | 'click';
        register?: SaxRegister;
        customFreq?: number;
      }
    ) => {
      const mode = options?.soundMode || 'both';
      const register = options?.register || 'low';

      // 1. 发出真实皮革音垫机械声
      if (mode === 'both' || mode === 'click') {
        playKeyPadClick(keyId);
      }

      // 2. 发出萨克斯乐音声学音色 (高八度 / 超吹 / 低八度)
      if (mode === 'both' || mode === 'tone') {
        const keyInfo = KEY_PITCH_MAP[keyId];
        let targetFreq = options?.customFreq;
        if (!targetFreq) {
          if (register === 'altissimo') {
            targetFreq = keyInfo?.altissimoFreq || 1400;
          } else if (register === 'high') {
            targetFreq = keyInfo?.highFreq || (keyInfo ? keyInfo.lowFreq * 2 : 880);
          } else {
            targetFreq = keyInfo?.lowFreq || 440;
          }
        }

        setTimeout(() => {
          playTone(targetFreq, saxType, register === 'altissimo' ? 0.55 : 0.44, register);
        }, 4);
      }
    },
    [playKeyPadClick, playTone]
  );

  // 节拍声：accent 为每小节第一拍（强拍），音更高更响
  const playClick = useCallback((accent = false) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(accent ? 1600 : 1000, ctx.currentTime);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(accent ? 0.5 : 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(getOutput(ctx));

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

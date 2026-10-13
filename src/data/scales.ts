import { NoteFingering, ScaleDefinition } from '../types/music';

export const FINGERINGS: Record<string, NoteFingering> = {
  'C4':  { desc: '低音 1 (Do)', keys: ['key_lh1', 'key_lh2', 'key_lh3', 'key_rh1', 'key_rh2', 'key_rh3', 'key_rh_c'], freq: 261.63 },
  'C#4': { desc: '低音 #1 (Do#)', keys: ['key_lh1', 'key_lh2', 'key_lh3', 'key_lh_cis', 'key_rh1', 'key_rh2', 'key_rh3', 'key_rh_c'], freq: 277.18 },
  'Db4': { desc: '低音 b2 (Reb)', keys: ['key_lh1', 'key_lh2', 'key_lh3', 'key_lh_gis', 'key_rh1', 'key_rh2', 'key_rh3', 'key_rh_c'], freq: 277.18 },
  'D4':  { desc: '低音 2 (Re)', keys: ['key_lh1', 'key_lh2', 'key_lh3', 'key_rh1', 'key_rh2', 'key_rh3'], freq: 293.66 },
  'D#4': { desc: '低音 #2 (Re#)', keys: ['key_lh1', 'key_lh2', 'key_lh3', 'key_rh1', 'key_rh2', 'key_rh3', 'key_rh_eb'], freq: 311.13 },
  'Eb4': { desc: '低音 b3 (Mib)', keys: ['key_lh1', 'key_lh2', 'key_lh3', 'key_rh1', 'key_rh2', 'key_rh3', 'key_rh_eb'], freq: 311.13 },
  'E4':  { desc: '低音 3 (Mi)', keys: ['key_lh1', 'key_lh2', 'key_lh3', 'key_rh1', 'key_rh2'], freq: 329.63 },
  'F4':  { desc: '低音 4 (Fa)', keys: ['key_lh1', 'key_lh2', 'key_lh3', 'key_rh1'], freq: 349.23 },
  'F#4': { desc: '低音 #4 (Fa#)', keys: ['key_lh1', 'key_lh2', 'key_lh3', 'key_rh2'], freq: 369.99 },
  'Gb4': { desc: '低音 b5 (Solb)', keys: ['key_lh1', 'key_lh2', 'key_lh3', 'key_rh2'], freq: 369.99 },
  'G4':  { desc: '低音 5 (Sol)', keys: ['key_lh1', 'key_lh2', 'key_lh3'], freq: 392.00 },
  'G#4': { desc: '低音 #5 (Sol#)', keys: ['key_lh1', 'key_lh2', 'key_lh3', 'key_lh_gis'], freq: 415.30 },
  'Ab4': { desc: '低音 b6 (Lab)', keys: ['key_lh1', 'key_lh2', 'key_lh3', 'key_lh_gis'], freq: 415.30 },
  'A4':  { desc: '低音 6 (La)', keys: ['key_lh1', 'key_lh2'], freq: 440.00 },
  'A#4': { desc: '低音 #6 (La#)', keys: ['key_lh1', 'key_rh1'], freq: 466.16 },
  'Bb4': { desc: '低音 b7 (Sib)', keys: ['key_lh1', 'key_rh1'], freq: 466.16 },
  'B4':  { desc: '低音 7 (Si)', keys: ['key_lh1'], freq: 493.88 },
  'C5':  { desc: '中音 1 (Do)', keys: ['key_lh2'], freq: 523.25 },
  'C#5': { desc: '中音 #1 (全开音孔)', keys: [], freq: 554.37 },
  'Db5': { desc: '中音 b2 (全开音孔)', keys: [], freq: 554.37 },
  'D5':  { desc: '高音 2 (Re)', keys: ['key_octave', 'key_lh1', 'key_lh2', 'key_lh3', 'key_rh1', 'key_rh2', 'key_rh3'], freq: 587.33 },
  'D#5': { desc: '高音 #2 (Re#)', keys: ['key_octave', 'key_lh1', 'key_lh2', 'key_lh3', 'key_rh1', 'key_rh2', 'key_rh3', 'key_rh_eb'], freq: 622.25 },
  'Eb5': { desc: '高音 b3 (Mib)', keys: ['key_octave', 'key_lh1', 'key_lh2', 'key_lh3', 'key_rh1', 'key_rh2', 'key_rh3', 'key_rh_eb'], freq: 622.25 },
  'E5':  { desc: '高音 3 (Mi)', keys: ['key_octave', 'key_lh1', 'key_lh2', 'key_lh3', 'key_rh1', 'key_rh2'], freq: 659.25 },
  'F5':  { desc: '高音 4 (Fa)', keys: ['key_octave', 'key_lh1', 'key_lh2', 'key_lh3', 'key_rh1'], freq: 698.46 },
  'F#5': { desc: '高音 #4 (Fa#)', keys: ['key_octave', 'key_lh1', 'key_lh2', 'key_lh3', 'key_rh2'], freq: 739.99 },
  'Gb5': { desc: '高音 b5 (Solb)', keys: ['key_octave', 'key_lh1', 'key_lh2', 'key_lh3', 'key_rh2'], freq: 739.99 },
  'G5':  { desc: '高音 5 (Sol)', keys: ['key_octave', 'key_lh1', 'key_lh2', 'key_lh3'], freq: 783.99 },
  'G#5': { desc: '高音 #5 (Sol#)', keys: ['key_octave', 'key_lh1', 'key_lh2', 'key_lh3', 'key_lh_gis'], freq: 830.61 },
  'Ab5': { desc: '高音 b6 (Lab)', keys: ['key_octave', 'key_lh1', 'key_lh2', 'key_lh3', 'key_lh_gis'], freq: 830.61 },
  'A5':  { desc: '高音 6 (La)', keys: ['key_octave', 'key_lh1', 'key_lh2'], freq: 880.00 },
  'Bb5': { desc: '高音 b7 (Sib)', keys: ['key_octave', 'key_lh1', 'key_rh1'], freq: 932.33 },
  'B5':  { desc: '高音 7 (Si)', keys: ['key_octave', 'key_lh1'], freq: 987.77 },
  'C6':  { desc: '倍高音 1 (Do)', keys: ['key_octave', 'key_lh2'], freq: 1046.50 }
};

export const KEY_NAME_MAP: Record<string, string> = {
  'key_octave': '八度高音键(8)',
  'key_lh1': '左手1(B)',
  'key_lh2': '左手2(A)',
  'key_lh3': '左手3(G)',
  'key_lh_gis': '左手G#侧键',
  'key_lh_cis': '左手低音C#键',
  'key_lh_low_b': '左手低音B键',
  'key_rh1': '右手4(F)',
  'key_rh2': '右手5(E)',
  'key_rh3': '右手6(D)',
  'key_rh_eb': '右手低音Eb键',
  'key_rh_c': '右手低音C键'
};

export const SCALES: ScaleDefinition[] = [
  {
    id: 'c_major',
    name: 'C 大调自然音阶 (C Major)',
    keySig: '无升降号',
    accidentals: '0 #/b',
    tip: '基础中的基础。重点检验低音 C4 到 C5 的气流充盈度与 C5 (中指单按) 的音准。',
    notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'F5', 'E5', 'D5', 'C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'],
    abc: 'X:1\nT:C 大调音阶练习\nM:4/4\nL:1/4\nK:C\nC D E F | G A B c | d e f g |\nf e d c | B A G F | E D C2 |]'
  },
  {
    id: 'g_major',
    name: 'G 大调音阶 (G Major)',
    keySig: '1 升号 (F#)',
    accidentals: '1 #',
    tip: '升Fa(F#)指法训练：左手123+右手中指2，注意与右手指法的衔接灵活性。',
    notes: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5', 'F#5', 'E5', 'D5', 'C5', 'B4', 'A4', 'G4'],
    abc: 'X:1\nT:G 大调音阶练习\nM:4/4\nL:1/4\nK:G\nG A B c | d e f g |\nf e d c | B A G2 |]'
  },
  {
    id: 'f_major',
    name: 'F 大调音阶 (F Major)',
    keySig: '1 降号 (Bb)',
    accidentals: '1 b',
    tip: '降Si(Bb)练习：推荐练习 1+1 指法（左手食指+右手食指），音色饱满且利于平稳过渡。',
    notes: ['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5', 'F5', 'E5', 'D5', 'C5', 'Bb4', 'A4', 'G4', 'F4'],
    abc: 'X:1\nT:F 大调音阶练习\nM:4/4\nL:1/4\nK:F\nF G A B | c d e f |\ne d c B | A G F2 |]'
  },
  {
    id: 'd_major',
    name: 'D 大调音阶 (D Major)',
    keySig: '2 升号 (F#, C#)',
    accidentals: '2 #',
    tip: '包含 F# 与 C#。C#5 为全开音孔，容易偏高，下唇口风要保持适当松弛。',
    notes: ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5', 'E5', 'F#5', 'E5', 'D5', 'C#5', 'B4', 'A4', 'G4', 'F#4', 'E4', 'D4'],
    abc: 'X:1\nT:D 大调音阶练习\nM:4/4\nL:1/4\nK:D\nD E F G | A B c d | e f e d |\nc B A G | F E D2 |]'
  },
  {
    id: 'bb_major',
    name: 'Bb 大调音阶 (Bb Major)',
    keySig: '2 降号 (Bb, Eb)',
    accidentals: '2 b',
    tip: '含 Bb 与 Eb。Eb 指法需小指灵活触碰右下键位，保持小臂自然放松。',
    notes: ['Bb4', 'C5', 'D5', 'Eb5', 'F5', 'G5', 'A5', 'Bb5', 'A5', 'G5', 'F5', 'Eb5', 'D5', 'C5', 'Bb4'],
    abc: 'X:1\nT:Bb 大调音阶练习\nM:4/4\nL:1/4\nK:Bb\nB c d e | f g a b |\na g f e | d c B2 |]'
  },
  {
    id: 'a_major',
    name: 'A 大调音阶 (A Major)',
    keySig: '3 升号 (F#, C#, G#)',
    accidentals: '3 #',
    tip: '包含 F#、C#、G#。G# 键位需左手小指轻快配合，切勿手腕连带耸起。',
    notes: ['A4', 'B4', 'C#5', 'D5', 'E5', 'F#5', 'G#5', 'A5', 'G#5', 'F#5', 'E5', 'D5', 'C#5', 'B4', 'A4'],
    abc: 'X:1\nT:A 大调音阶练习\nM:4/4\nL:1/4\nK:A\nA B c d | e f g a |\ng f e d | c B A2 |]'
  },
  {
    id: 'eb_major',
    name: 'Eb 大调音阶 (Eb Major)',
    keySig: '3 降号 (Bb, Eb, Ab)',
    accidentals: '3 b',
    tip: '含 Bb、Eb、Ab。在管乐中是极常见的主修调性，注意左右小指键的稳定性。',
    notes: ['Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5', 'D5', 'Eb5', 'D5', 'C5', 'Bb4', 'Ab4', 'G4', 'F4', 'Eb4'],
    abc: 'X:1\nT:Eb 大调音阶练习\nM:4/4\nL:1/4\nK:Eb\nE F G A | B c d e |\nd c B A | G F E2 |]'
  },
  {
    id: 'e_major',
    name: 'E 大调音阶 (E Major)',
    keySig: '4 升号 (F#, C#, G#, D#)',
    accidentals: '4 #',
    tip: '4 个升号。手指在各升键间的转换要有预备意识。',
    notes: ['E4', 'F#4', 'G#4', 'A4', 'B4', 'C#5', 'D#5', 'E5', 'D#5', 'C#5', 'B4', 'A4', 'G#4', 'F#4', 'E4'],
    abc: 'X:1\nT:E 大调音阶练习\nM:4/4\nL:1/4\nK:E\nE F G A | B c d e |\nd c B A | G F E2 |]'
  },
  {
    id: 'ab_major',
    name: 'Ab 大调音阶 (Ab Major)',
    keySig: '4 降号 (Bb, Eb, Ab, Db)',
    accidentals: '4 b',
    tip: '含 Bb, Eb, Ab, Db。Db4/Db5 全开键音准与气流的稳定结合是关键点。',
    notes: ['Ab4', 'Bb4', 'C5', 'Db5', 'Eb5', 'F5', 'G5', 'Ab5', 'G5', 'F5', 'Eb5', 'Db5', 'C5', 'Bb4', 'Ab4'],
    abc: 'X:1\nT:Ab 大调音阶练习\nM:4/4\nL:1/4\nK:Ab\nA B c d | e f g a |\ng f e d | c B A2 |]'
  },
  {
    id: 'b_major',
    name: 'B 大调音阶 (B Major)',
    keySig: '5 升号 (F#, C#, G#, D#, A#)',
    accidentals: '5 #',
    tip: '练习高难度升号指法，慢练保证每个音的颗粒感清晰纯净。',
    notes: ['B4', 'C#5', 'D#5', 'E5', 'F#5', 'G#5', 'A#5', 'B5', 'A#5', 'G#5', 'F#5', 'E5', 'D#5', 'C#5', 'B4'],
    abc: 'X:1\nT:B 大调音阶练习\nM:4/4\nL:1/4\nK:B\nB c d e | f g a b |\na g f e | d c B2 |]'
  },
  {
    id: 'db_major',
    name: 'Db 大调音阶 (Db Major)',
    keySig: '5 降号 (Bb, Eb, Ab, Db, Gb)',
    accidentals: '5 b',
    tip: '全域降号调，强化手指对侧键与各个小指键位的机械记忆。',
    notes: ['Db4', 'Eb4', 'F4', 'Gb4', 'Ab4', 'Bb4', 'C5', 'Db5', 'C5', 'Bb4', 'Ab4', 'Gb4', 'F4', 'Eb4', 'Db4'],
    abc: 'X:1\nT:Db 大调音阶练习\nM:4/4\nL:1/4\nK:Db\nD E F G | A B c d |\nc B A G | F E D2 |]'
  },
  {
    id: 'a_minor',
    name: 'A 小调自然音阶 (A Minor)',
    keySig: '关系小调 (无升降号)',
    accidentals: '0 #/b',
    tip: '暗淡抒情色彩，重点体会全音与半音阶程在萨克斯上的运指触感。',
    notes: ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'G5', 'F5', 'E5', 'D5', 'C5', 'B4', 'A4'],
    abc: 'X:1\nT:A 小调音阶练习\nM:4/4\nL:1/4\nK:Am\nA B c d | e f g a |\ng f e d | c B A2 |]'
  }
];

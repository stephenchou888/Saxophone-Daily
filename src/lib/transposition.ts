import { SaxophoneType } from '../types/music';

// 萨克斯是移调乐器：记谱音（谱上写的、按指法吹的）≠ 实际发音（钢琴上的音）。
// 中音 E♭：实音比记谱低大六度（−9 个半音）；高音 B♭：实音比记谱低大二度（−2 个半音）。
export const TRANSPOSITION: Record<
  SaxophoneType,
  { semitones: number; letterSteps: number; interval: string; tonic: string }
> = {
  alto: { semitones: -9, letterSteps: -5, interval: '大六度', tonic: 'E♭' },
  soprano: { semitones: -2, letterSteps: -1, interval: '大二度', tonic: 'B♭' },
};

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
// 不带拼写信息时的默认音名（萨克斯谱常用写法）
const PC_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

export interface SpelledNote {
  letter: number; // 0 = C … 6 = B
  accidental: number; // −1 = ♭，+1 = ♯
  octave: number;
}

/** 解析 "C4" / "F#4" / "Bb3" / "E♭5" 这类音名 */
export function parseNote(name: string): SpelledNote | null {
  const m = /^([A-G])(#|♯|b|♭)?(-?\d+)$/.exec(name);
  if (!m) return null;
  const accidental = m[2] === '#' || m[2] === '♯' ? 1 : m[2] === 'b' || m[2] === '♭' ? -1 : 0;
  return { letter: LETTERS.indexOf(m[1]), accidental, octave: Number(m[3]) };
}

export function toMidi(n: SpelledNote): number {
  return (n.octave + 1) * 12 + LETTER_PC[n.letter] + n.accidental;
}

export function midiToName(midi: number): string {
  return `${PC_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

export function formatNote(n: SpelledNote): string {
  const acc = n.accidental > 0 ? '♯'.repeat(n.accidental) : '♭'.repeat(-n.accidental);
  return `${LETTERS[n.letter]}${acc}${n.octave}`;
}

/** 按音程移调并保留正确拼写（如 C4 下行大六度 = E♭3，而不是 D♯3）；出现重升/重降时改用常用等音 */
export function transposeSpelled(n: SpelledNote, letterSteps: number, semitones: number): SpelledNote {
  const letterAbs = n.octave * 7 + n.letter + letterSteps;
  const letter = ((letterAbs % 7) + 7) % 7;
  const octave = Math.floor(letterAbs / 7);
  const accidental = toMidi(n) + semitones - ((octave + 1) * 12 + LETTER_PC[letter]);
  if (Math.abs(accidental) > 1) return parseNote(midiToName(toMidi(n) + semitones).replace('♯', '#').replace('♭', 'b'))!;
  return { letter, accidental, octave };
}

/** 萨克斯记谱音 → 钢琴实音 */
export function writtenToConcert(written: SpelledNote, sax: SaxophoneType): SpelledNote {
  const t = TRANSPOSITION[sax];
  return transposeSpelled(written, t.letterSteps, t.semitones);
}

// 十二个大调（以钢琴实音调为准），名称取常用写法，附调号
const MAJOR_KEYS: { name: string; sig: string }[] = [
  { name: 'C', sig: '无升降' },
  { name: 'D♭', sig: '5♭' },
  { name: 'D', sig: '2♯' },
  { name: 'E♭', sig: '3♭' },
  { name: 'E', sig: '4♯' },
  { name: 'F', sig: '1♭' },
  { name: 'G♭', sig: '6♭' },
  { name: 'G', sig: '1♯' },
  { name: 'A♭', sig: '4♭' },
  { name: 'A', sig: '3♯' },
  { name: 'B♭', sig: '2♭' },
  { name: 'B', sig: '5♯' },
];

export interface KeyRow {
  concert: { name: string; sig: string };
  alto: { name: string; sig: string };
  soprano: { name: string; sig: string };
}

/** 调号对照：钢琴（实音）大调 → 中音 / 高音萨克斯谱上应写的大调。按五度圈顺序排列 */
export function buildKeyTable(): KeyRow[] {
  const circle = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
  return circle.map((pc) => ({
    concert: MAJOR_KEYS[pc],
    alto: MAJOR_KEYS[(pc - TRANSPOSITION.alto.semitones) % 12],
    soprano: MAJOR_KEYS[(pc - TRANSPOSITION.soprano.semitones) % 12],
  }));
}

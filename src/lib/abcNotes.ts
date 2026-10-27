// 把音名序列（如 F#4、Bb4）转换为按小节划分的 ABC 记谱，并按调号与小节内临时记号的规则写出升降号 / 还原号。
//
// ABC（与五线谱）的规则：临时升降号会一直作用到小节结束。因此同一小节里 F♯ 之后再出现 F，
// 必须写还原号（=F），否则会被读成 F♯；调号以外的升降音即使关闭“升降号提示”也必须写出。

type Acc = '#' | 'b' | '';

const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
const FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];

// 调号（ABC 的 K: 值）中升号 / 降号的个数；小调与其关系大调相同
const KEY_SIGNATURES: Record<string, number> = {
  C: 0, Am: 0,
  G: 1, Em: 1, D: 2, Bm: 2, A: 3, 'F#m': 3, E: 4, 'C#m': 4, B: 5, 'G#m': 5, 'F#': 6, 'D#m': 6, 'C#': 7,
  F: -1, Dm: -1, Bb: -2, Gm: -2, Eb: -3, Cm: -3, Ab: -4, Fm: -4, Db: -5, Bbm: -5, Gb: -6, Ebm: -6, Cb: -7,
};

/** 调号中每个音名默认的升降：如 D 大调 → { F: '#', C: '#' } */
export function keyAccidentals(key: string): Record<string, Acc> {
  const count = KEY_SIGNATURES[key] ?? 0;
  const map: Record<string, Acc> = {};
  if (count > 0) SHARP_ORDER.slice(0, count).forEach((l) => (map[l] = '#'));
  if (count < 0) FLAT_ORDER.slice(0, -count).forEach((l) => (map[l] = 'b'));
  return map;
}

function abcPitch(letter: string, octave: number): string {
  if (octave <= 3) return `${letter},`;
  if (octave === 4) return letter;
  if (octave === 5) return letter.toLowerCase();
  return `${letter.toLowerCase()}'`;
}

/**
 * @param explicit “升降号提示”开启时为 true：所有升降音都显式标出升降号（直观），
 *                 关闭时只在需要时标记（规范记谱）。两种模式都会在需要时写还原号。
 */
export function notesToAbcMeasures(
  notes: string[],
  key: string,
  beatsPerMeasure: number,
  explicit: boolean
): { measures: string[]; words: string[] } {
  const keyAcc = keyAccidentals(key);
  const measures: string[] = [];
  const words: string[] = [];
  let curM: string[] = [];
  let curW: string[] = [];
  // 本小节内已出现的临时记号（按音名记录，保守地跨八度生效，宁可多写一个提醒记号也不读错音）
  let barAcc: Record<string, Acc> = {};

  notes.forEach((n, idx) => {
    const m = n.match(/^([A-G])([#b]?)(\d)$/);
    if (m) {
      const [, letter, acc, octave] = m as unknown as [string, string, Acc, string];
      const current = barAcc[letter] ?? keyAcc[letter] ?? '';
      const show = acc !== current || (explicit && acc !== '');
      const prefix = !show ? '' : acc === '#' ? '^' : acc === 'b' ? '_' : '=';
      barAcc[letter] = acc;
      curM.push(prefix + abcPitch(letter, Number(octave)));
    } else {
      curM.push('C'); // 无法识别的音名：仍画一个音符占位，保证谱面音符与音名按钮一一对应
    }
    curW.push(n.replace(/\d/g, '').replace('#', '♯').replace('b', '♭'));

    if (curM.length === beatsPerMeasure || idx === notes.length - 1) {
      measures.push(curM.join(' '));
      words.push(curW.join(' '));
      curM = [];
      curW = [];
      barAcc = {};
    }
  });

  return { measures, words };
}

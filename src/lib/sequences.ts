import { FINGERINGS } from '@/data/scales';
import { ScaleDefinition } from '@/types/music';

// 大小调模进练习：由音阶的上行音自动生成，上行按级进模进，下行镜像返回
export type PracticePattern = 'scale' | 'thirds' | 'fourths' | 'fifths' | 'groups3' | 'groups4' | 'triads';

export const PRACTICE_PATTERNS: {
  id: PracticePattern;
  label: string;
  title: string;
  /** 每小节拍数：让每组模进正好落在整小节里 */
  beatsPerMeasure: number;
  description: string;
}[] = [
  { id: 'scale', label: '音阶', title: '音阶', beatsPerMeasure: 4, description: '完整音阶上下行。' },
  {
    id: 'thirds',
    label: '三度',
    title: '三度模进',
    beatsPerMeasure: 4,
    description: '1-3、2-4、3-5……逐级上行再下行，练习三度跳进时手指同时起落与气息连贯。',
  },
  {
    id: 'fourths',
    label: '四度',
    title: '四度模进',
    beatsPerMeasure: 4,
    description: '1-4、2-5、3-6……逐级上行再下行，练习四度跳进的换指与音程准确度。',
  },
  {
    id: 'fifths',
    label: '五度',
    title: '五度模进',
    beatsPerMeasure: 4,
    description: '1-5、2-6、3-7……逐级上行再下行，练习五度大跳时的口型稳定与气息支撑。',
  },
  {
    id: 'groups3',
    label: '三音组',
    title: '三音组模进',
    beatsPerMeasure: 3,
    description: '1-2-3、2-3-4……每组三个音、起点逐级移动，训练手指颗粒感与节奏稳定。',
  },
  {
    id: 'groups4',
    label: '四音组',
    title: '四音组模进',
    beatsPerMeasure: 4,
    description: '1-2-3-4、2-3-4-5……每组四个音，最常用的音阶模进，适合配合节拍器逐步提速。',
  },
  {
    id: 'triads',
    label: '琶音',
    title: '琶音模进',
    beatsPerMeasure: 3,
    description: '1-3-5、2-4-6……本调各级三和弦的分解琶音，熟悉调内和声与大跨度换指。',
  },
];

// 支持模进的分类：大小调与七种教会调式（七声音阶）；特色音阶、爵士八音 / 六音音阶与琶音进行不做模进
export function supportsSequences(scale: ScaleDefinition): boolean {
  return (
    scale.category === 'major' ||
    scale.category === 'minor' ||
    scale.category === 'harmonic_minor' ||
    scale.category === 'jazz_mode'
  );
}

// 音阶的上行部分：从第一个音到最高音（数据格式为“上行 + 镜像下行”）
export function ascendingNotes(notes: string[]): string[] {
  let peak = 0;
  notes.forEach((n, i) => {
    if ((FINGERINGS[n]?.freq ?? 0) > (FINGERINGS[notes[peak]]?.freq ?? 0)) peak = i;
  });
  return notes.slice(0, peak + 1);
}

// 按“起点逐级移动、组内按 offsets 取音”的方式生成上行模进，下行用同样的组形镜像
function sequence(asc: string[], offsets: number[]): string[] {
  const span = Math.max(...offsets);
  const out: string[] = [];
  for (let i = 0; i + span < asc.length; i++) offsets.forEach((o) => out.push(asc[i + o]));
  for (let i = asc.length - 1; i - span >= 0; i--) offsets.forEach((o) => out.push(asc[i - o]));
  return out;
}

export function buildPracticeNotes(scale: ScaleDefinition, pattern: PracticePattern): string[] {
  if (pattern === 'scale' || !supportsSequences(scale)) return scale.notes;
  const asc = ascendingNotes(scale.notes);
  switch (pattern) {
    case 'thirds':
      return sequence(asc, [0, 2]);
    case 'fourths':
      return sequence(asc, [0, 3]);
    case 'fifths':
      return sequence(asc, [0, 4]);
    case 'groups3':
      return sequence(asc, [0, 1, 2]);
    case 'groups4':
      return sequence(asc, [0, 1, 2, 3]);
    case 'triads':
      return sequence(asc, [0, 2, 4]);
  }
}

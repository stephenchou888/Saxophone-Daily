import { ScaleDefinition } from '../types/music';
import { notesToAbcMeasures } from '../lib/abcNotes';

// 爵士调式入门：全部按萨克斯记谱音（与基础调式一致），音域控制在 C4 ~ C6 的常用指法范围内。
// 数据格式与 SCALES 相同：notes 为“上行 + 镜像下行”，abc 的 K: 决定谱面调号。

/** 上行音列 → 上行 + 镜像下行（最高音只吹一次） */
const upDown = (asc: string[]) => [...asc, ...asc.slice(0, -1).reverse()];

/** 由音列生成 ABC（谱面实际按 notes 重新生成，这里保证 abc 字段本身也是完整可渲染的乐谱） */
function abcOf(title: string, notes: string[], key = 'C'): string {
  const { measures } = notesToAbcMeasures(notes, key, 4, false);
  return `X:1\nT:${title}\nM:4/4\nL:1/4\nK:${key}\n${measures.join(' | ')} |]`;
}

function jazz(def: Omit<ScaleDefinition, 'abc'> & { key?: string }): ScaleDefinition {
  const { key, ...rest } = def;
  return { ...rest, abc: abcOf(def.name.split(' (')[0], def.notes, key) };
}

export const JAZZ_SCALES: ScaleDefinition[] = [
  // ===================== 1. 七种教会调式（同一组白键音，从不同主音出发） =====================
  jazz({
    id: 'jazz_c_ionian',
    name: 'C 伊奥尼亚调式 (Ionian 大调式)',
    category: 'jazz_mode',
    chord: 'Cmaj7',
    keySig: '1 级调式 · 无升降号',
    accidentals: '0 #/b',
    tip: '七种调式的起点，就是 C 大调本身，对应 Cmaj7 和弦。即兴时第 4 级 F 是“避免音”，长音停留在 1、3、5、7 级（C E G B）听起来最和谐。',
    notes: upDown(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']),
  }),
  jazz({
    id: 'jazz_d_dorian',
    name: 'D 多利亚调式 (Dorian 爵士小调首选)',
    category: 'jazz_mode',
    chord: 'Dm7',
    keySig: '2 级调式 · 小调 + 大六度',
    accidentals: '0 #/b',
    tip: '爵士里最常用的小调色彩（《So What》《Impressions》）。和自然小调只差一个音：第 6 级是大六度 B，带来明亮、不悲伤的小调感。多强调 B 这个“特征音”。',
    notes: upDown(['D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5']),
  }),
  jazz({
    id: 'jazz_e_phrygian',
    name: 'E 弗里几亚调式 (Phrygian 西班牙色彩)',
    category: 'jazz_mode',
    chord: 'Em7 / Esus♭9',
    keySig: '3 级调式 · 小调 + 小二度',
    accidentals: '0 #/b',
    tip: '第 2 级是小二度 F，一开口就有弗拉门戈 / 西班牙味道。练习时在 E→F 半音上停一下，体会这个特征音的张力。',
    notes: upDown(['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5']),
  }),
  jazz({
    id: 'jazz_f_lydian',
    name: 'F 利底亚调式 (Lydian 梦幻大调)',
    category: 'jazz_mode',
    chord: 'Fmaj7♯11',
    keySig: '4 级调式 · 大调 + 增四度',
    accidentals: '0 #/b',
    tip: '大调里把第 4 级升高（B 而不是 B♭），听起来悬浮、梦幻，是现代爵士和电影配乐的常客。大七和弦上用它代替伊奥尼亚，就没有“避免音”的问题。',
    notes: upDown(['F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5']),
  }),
  jazz({
    id: 'jazz_g_mixolydian',
    name: 'G 混合利底亚调式 (Mixolydian 属七和弦)',
    category: 'jazz_mode',
    chord: 'G7',
    keySig: '5 级调式 · 大调 + 小七度',
    accidentals: '0 #/b',
    tip: '属七和弦（G7）的“标准答案”，布鲁斯、放克、摇摆乐处处可见。第 7 级是小七度 F，和第 3 级 B 组成属七和弦的三全音，是 V 级要解决到 I 级的动力来源。',
    notes: upDown(['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5']),
  }),
  jazz({
    id: 'jazz_a_aeolian',
    name: 'A 爱奥利亚调式 (Aeolian 自然小调)',
    category: 'jazz_mode',
    chord: 'Am7',
    keySig: '6 级调式 · 自然小调',
    accidentals: '0 #/b',
    tip: '就是 A 自然小调，与多利亚只差第 6 级（这里是小六度 F）。可以和 D 多利亚对比着吹，耳朵分辨“忧郁”与“明亮”两种小调色彩。',
    notes: upDown(['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5']),
  }),
  jazz({
    id: 'jazz_b_locrian',
    name: 'B 洛克里亚调式 (Locrian 半减七和弦)',
    category: 'jazz_mode',
    chord: 'Bm7♭5',
    keySig: '7 级调式 · 减五度',
    accidentals: '0 #/b',
    tip: '主和弦是半减七（Bm7♭5），小调 ii–V–i 里的 ii 级就用它。第 5 级 F 是减五度，听起来不稳定，正是要往下一个和弦走的感觉。',
    notes: upDown(['B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5']),
  }),

  // ===================== 2. 爵士常用音阶 =====================
  jazz({
    id: 'jazz_c_major_blues',
    name: 'C 大调蓝调音阶 (Major Blues 乡村 / 摇摆)',
    category: 'jazz_scale',
    chord: 'C6 / C7',
    keySig: '六声音阶 · ♭3 经过音',
    accidentals: 'Eb',
    tip: '大调五声音阶加一个 ♭3（E♭），E♭→E 的半音滑上去就是最经典的蓝调味。适合在大和弦、属七和弦上吹出明快的摇摆感，比小调蓝调音阶更“阳光”。',
    notes: upDown(['C4', 'D4', 'Eb4', 'E4', 'G4', 'A4', 'C5']),
  }),
  jazz({
    id: 'jazz_a_minor_pentatonic',
    name: 'A 小调五声音阶 (Minor Pentatonic 即兴入门)',
    category: 'jazz_scale',
    chord: 'Am7',
    keySig: '五声音阶 (1 ♭3 4 5 ♭7)',
    accidentals: '无半音音阶',
    tip: '即兴入门最友好的音阶：只有 5 个音，没有半音，怎么吹都不难听。在 Am7、Dm7 等小和弦上都能用，先把它吹熟，再加 ♭5 就变成蓝调音阶。',
    notes: upDown(['A4', 'C5', 'D5', 'E5', 'G5', 'A5']),
  }),
  jazz({
    id: 'jazz_c_bebop_dominant',
    name: 'C 比波普属音阶 (Bebop Dominant 八音音阶)',
    category: 'jazz_scale',
    chord: 'C7',
    keySig: '混合利底亚 + 大七度经过音',
    accidentals: 'Bb, B',
    tip: '查理·帕克时代的核心语汇：在混合利底亚里加入大七度 B 作为经过音，凑成 8 个音。用八分音符从和弦音起拍，正拍总能落在和弦音（C E G B♭）上，线条自然“摇摆”。',
    notes: upDown(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'B4', 'C5']),
  }),
  jazz({
    id: 'jazz_c_bebop_major',
    name: 'C 比波普大调音阶 (Bebop Major 八音音阶)',
    category: 'jazz_scale',
    chord: 'Cmaj7 / C6',
    keySig: '大调 + ♭6 经过音',
    accidentals: 'Ab',
    tip: '在大调第 5、6 级之间加入 A♭ 作为半音经过音。和比波普属音阶一样，从和弦音起拍吹八分音符，正拍会落在 C6 和弦音（C E G A）上。',
    notes: upDown(['C4', 'D4', 'E4', 'F4', 'G4', 'Ab4', 'A4', 'B4', 'C5']),
  }),
  jazz({
    id: 'jazz_c_melodic_minor',
    name: 'C 旋律小调 (Jazz Melodic Minor 爵士小调)',
    category: 'jazz_scale',
    chord: 'Cm(maj7) / Cm6',
    keySig: '小调 + 大六、大七度',
    accidentals: 'Eb',
    tip: '爵士里的旋律小调上下行都一样（不像古典下行还原）。可以看作“大调把 3 级降半音”，是变化音阶、利底亚属音阶等高级音阶的母体。',
    notes: upDown(['C4', 'D4', 'Eb4', 'F4', 'G4', 'A4', 'B4', 'C5']),
  }),
  jazz({
    id: 'jazz_g_lydian_dominant',
    name: 'G 利底亚属音阶 (Lydian Dominant ♯11)',
    category: 'jazz_scale',
    chord: 'G7♯11',
    keySig: '混合利底亚 + ♯4',
    accidentals: 'C#, F',
    tip: '把 G 混合利底亚的第 4 级升高成 C♯，得到更现代、更“城市”的属七色彩（D 旋律小调的第 4 级调式）。常用于不解决的属七和弦与三全音替代和弦。',
    notes: upDown(['G4', 'A4', 'B4', 'C#5', 'D5', 'E5', 'F5', 'G5']),
  }),
  jazz({
    id: 'jazz_g_altered',
    name: 'G 变化音阶 (Altered / 超洛克里亚)',
    category: 'jazz_scale',
    chord: 'G7alt',
    keySig: '♭9 ♯9 3 ♭5 ♯5 ♭7',
    accidentals: 'Ab, Bb, Db, Eb',
    tip: '属七和弦上“所有能变化的音都变了”，张力最大，解决到 C 时最有爵士味（A♭ 旋律小调的第 7 级调式）。建议先慢速吹熟，再在 ii–V–I 的 V 级上尝试。',
    notes: upDown(['G4', 'Ab4', 'Bb4', 'B4', 'Db5', 'Eb5', 'F5', 'G5']),
  }),
  jazz({
    id: 'jazz_c_whole_tone',
    name: 'C 全音音阶 (Whole Tone 增和弦)',
    category: 'jazz_scale',
    chord: 'C7♯5 / C+',
    keySig: '六声音阶 · 全部全音',
    accidentals: 'F#, G#, Bb',
    tip: '每两个音之间都是全音，没有主音中心，听起来朦胧、像梦境（德彪西、蒙克都爱用）。适合增属七和弦。注意 G♯→B♭ 的小指 G♯ 键与 1+1 指法衔接。',
    notes: upDown(['C4', 'D4', 'E4', 'F#4', 'G#4', 'Bb4', 'C5']),
  }),
  jazz({
    id: 'jazz_c_half_whole',
    name: 'C 半全减音阶 (Half-Whole Diminished 属减)',
    category: 'jazz_scale',
    chord: 'C7♭9',
    keySig: '半音 · 全音交替',
    accidentals: 'Db, Eb, F#, Bb',
    tip: '半音、全音交替排列的八音音阶，适合 C7♭9 和弦，有对称的“机械感”。先慢练 C→D♭、E♭→E 的半音换指，右手小指 E♭ 键与低音 C♯ 键都会用到。',
    notes: upDown(['C4', 'Db4', 'Eb4', 'E4', 'F#4', 'G4', 'A4', 'Bb4', 'C5']),
  }),

  // ===================== 3. 七和弦琶音与 ii–V–I 进行 =====================
  jazz({
    id: 'jazz_c_251',
    name: 'C 大调 ii–V–I 七和弦琶音 (Dm7 – G7 – Cmaj7)',
    category: 'jazz_arpeggio',
    chord: 'Dm7 – G7 – Cmaj7',
    keySig: '爵士最核心的和弦进行',
    accidentals: '0 #/b',
    tip: '爵士标准曲里出现最多的和弦进行，每小节一个七和弦（1-3-5-7）。吹熟后注意“声部连接”：Dm7 的 C 往下半音到 G7 的 B，G7 的 F 往下半音到 Cmaj7 的 E。',
    notes: ['D4', 'F4', 'A4', 'C5', 'G4', 'B4', 'D5', 'F5', 'C5', 'E5', 'G5', 'B5'],
  }),
  jazz({
    id: 'jazz_f_251',
    name: 'F 大调 ii–V–I 七和弦琶音 (Gm7 – C7 – Fmaj7)',
    category: 'jazz_arpeggio',
    chord: 'Gm7 – C7 – Fmaj7',
    keySig: '1 降号 (Bb)',
    accidentals: '1 b',
    tip: '把 ii–V–I 搬到 F 大调（爵士乐队最常用的调之一），Fmaj7 从 E 往下吹回 F，避免大跳。练熟 C、F 两个调后，可以按五度圈继续移调：B♭、E♭……这是入门爵士最有效的日常功课。',
    notes: ['G4', 'Bb4', 'D5', 'F5', 'C5', 'E5', 'G5', 'Bb5', 'E5', 'C5', 'A4', 'F4'],
    key: 'F',
  }),
  jazz({
    id: 'jazz_d_minor_251',
    name: 'D 小调 ii–V–i 七和弦琶音 (Em7♭5 – A7 – Dm7)',
    category: 'jazz_arpeggio',
    chord: 'Em7♭5 – A7 – Dm7',
    keySig: '1 降号 (Bb) · 小调进行',
    accidentals: 'Bb, C#',
    tip: '小调版本的 ii–V–i：ii 级是半减七（Em7♭5），V 级 A7 里的 C♯ 是导音。《Autumn Leaves》《Blue Bossa》都建立在这个进行上。',
    notes: ['E4', 'G4', 'Bb4', 'D5', 'A4', 'C#5', 'E5', 'G5', 'D5', 'F5', 'A5', 'C6'],
    key: 'Dm',
  }),
];

export interface NoteFingering {
  desc: string;
  keys: string[];
  freq: number;
}

export interface ScaleDefinition {
  id: string;
  name: string;
  keySig: string;
  accidentals: string;
  tip: string;
  notes: string[];
  abc: string;
  category?: 'major' | 'minor' | 'harmonic_minor' | 'special' | 'jazz_mode' | 'jazz_scale' | 'jazz_arpeggio';
  /** 爵士调式：适用的和弦（如 Dm7、G7alt），在标题旁显示 */
  chord?: string;
}

/** 训练轨道：基础调式（大小调与特色音阶）或爵士调式 */
export type ScaleTrack = 'basic' | 'jazz';

export type SaxophoneType = 'alto' | 'soprano';

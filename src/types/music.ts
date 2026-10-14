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
  category?: 'major' | 'minor' | 'special';
}

export type SaxophoneType = 'alto' | 'soprano';

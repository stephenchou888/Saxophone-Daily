import { describe, expect, it } from 'vitest';
import { FINGERINGS } from './scales';
import { NOTE_TIPS } from './noteTips';

describe('NOTE_TIPS', () => {
  it('only has tips for notes that exist in FINGERINGS', () => {
    expect(Object.keys(NOTE_TIPS).filter((note) => !(note in FINGERINGS))).toEqual([]);
  });
});

describe('FINGERINGS', () => {
  it('enharmonic spellings share the same keys', () => {
    const pairs = [
      ['C#4', 'Db4'], ['D#4', 'Eb4'], ['F#4', 'Gb4'], ['G#4', 'Ab4'], ['A#4', 'Bb4'],
      ['C#5', 'Db5'], ['D#5', 'Eb5'], ['F#5', 'Gb5'], ['G#5', 'Ab5'], ['A#5', 'Bb5'], ['D#6', 'Eb6'],
    ];
    for (const [a, b] of pairs) expect(FINGERINGS[a].keys, `${a} vs ${b}`).toEqual(FINGERINGS[b].keys);
  });

  it('low C♯ uses the left-pinky C♯ key without the low C key (#27)', () => {
    expect(FINGERINGS['C#4'].keys).toContain('key_lh_cis');
    expect(FINGERINGS['C#4'].keys).not.toContain('key_rh_c');
  });
});

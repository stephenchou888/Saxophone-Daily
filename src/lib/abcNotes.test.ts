import { describe, expect, it } from 'vitest';
import { SCALES } from '@/data/scales';
import { keyAccidentals, notesToAbcMeasures } from './abcNotes';

const byId = (id: string) => SCALES.find((s) => s.id === id)!;
const keyOf = (id: string) => byId(id).abc.match(/K:([A-G][#b]?m?)/)![1];

describe('keyAccidentals', () => {
  it('maps key signatures to sharps / flats', () => {
    expect(keyAccidentals('C')).toEqual({});
    expect(keyAccidentals('D')).toEqual({ F: '#', C: '#' });
    expect(keyAccidentals('Bm')).toEqual({ F: '#', C: '#' });
    expect(keyAccidentals('Eb')).toEqual({ B: 'b', E: 'b', A: 'b' });
    expect(keyAccidentals('F#')).toEqual({ F: '#', C: '#', G: '#', D: '#', A: '#', E: '#' });
  });
});

describe('notesToAbcMeasures', () => {
  it('writes a natural after an accidental in the same bar (blues: G F♯ F E♭)', () => {
    const { measures } = notesToAbcMeasures(byId('c_blues').notes, 'C', 4, false);
    expect(measures[2]).toBe('G ^F =F _E');
    expect(measures[0]).toBe('C _E F ^F'); // 新小节重新按调号计算
  });

  it('chromatic: A after A♭ and B after B♭ get naturals', () => {
    const { measures } = notesToAbcMeasures(byId('chromatic_scale').notes, 'C', 4, false);
    expect(measures[2]).toBe('_A =A _B =B');
    expect(measures[4]).toBe('_A G ^F =F');
  });

  it('keeps out-of-key accidentals when hints are off (harmonic minor raised 7th)', () => {
    const { measures } = notesToAbcMeasures(byId('a_harmonic_minor').notes, keyOf('a_harmonic_minor'), 4, false);
    expect(measures.join(' | ')).toContain('^g');
  });

  it('standard notation omits accidentals already in the key signature; hints mode marks them', () => {
    const d = byId('d_major');
    expect(notesToAbcMeasures(d.notes, 'D', 4, false).measures[0]).toBe('D E F G');
    expect(notesToAbcMeasures(d.notes, 'D', 4, true).measures[0]).toBe('D E ^F G');
  });

  it('a natural against the key signature is written (C natural in D major)', () => {
    expect(notesToAbcMeasures(['C5', 'B4'], 'D', 4, false).measures[0]).toBe('=c B');
  });

  it('octaves and lyric words', () => {
    const { measures, words } = notesToAbcMeasures(['C4', 'C5', 'C6', 'Bb4'], 'C', 4, true);
    expect(measures[0]).toBe("C c c' _B");
    expect(words[0]).toBe('C C C B♭');
  });

  it('one ABC note per input note for every scale (keeps sheet ↔ note buttons in sync)', () => {
    for (const s of SCALES) {
      const { measures } = notesToAbcMeasures(s.notes, keyOf(s.id), 4, false);
      expect(measures.join(' ').split(' ').length, s.id).toBe(s.notes.length);
    }
  });
});

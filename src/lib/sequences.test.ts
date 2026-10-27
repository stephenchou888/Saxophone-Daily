import { describe, expect, it } from 'vitest';
import { FINGERINGS, SCALES } from '@/data/scales';
import { ascendingNotes, buildPracticeNotes, PRACTICE_PATTERNS, supportsSequences } from './sequences';

const byId = (id: string) => SCALES.find((s) => s.id === id)!;

describe('ascendingNotes', () => {
  it('cuts the scale at its highest note', () => {
    expect(ascendingNotes(byId('g_major').notes)).toEqual(['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5']);
  });
});

describe('buildPracticeNotes', () => {
  const g = byId('g_major'); // G4 … G5，一个八度 8 个音

  it('thirds: 1-3, 2-4 … up, then mirrored down', () => {
    const n = buildPracticeNotes(g, 'thirds');
    expect(n.slice(0, 6)).toEqual(['G4', 'B4', 'A4', 'C5', 'B4', 'D5']);
    expect(n.slice(10, 12)).toEqual(['E5', 'G5']); // 上行最后一组 6-8
    expect(n.slice(12, 14)).toEqual(['G5', 'E5']); // 下行第一组 8-6
    expect(n.slice(-2)).toEqual(['B4', 'G4']); // 下行最后一组 3-1
    expect(n).toHaveLength(24);
  });

  it('groups of three and four', () => {
    expect(buildPracticeNotes(g, 'groups3').slice(0, 6)).toEqual(['G4', 'A4', 'B4', 'A4', 'B4', 'C5']);
    const four = buildPracticeNotes(g, 'groups4');
    expect(four.slice(0, 8)).toEqual(['G4', 'A4', 'B4', 'C5', 'A4', 'B4', 'C5', 'D5']);
    expect(four.slice(-4)).toEqual(['C5', 'B4', 'A4', 'G4']);
  });

  it('triads: diatonic arpeggios 1-3-5, 2-4-6 …', () => {
    const t = buildPracticeNotes(g, 'triads');
    expect(t.slice(0, 6)).toEqual(['G4', 'B4', 'D5', 'A4', 'C5', 'E5']);
    expect(t.slice(-3)).toEqual(['D5', 'B4', 'G4']);
  });

  it('keeps the harmonic minor raised 7th', () => {
    expect(buildPracticeNotes(byId('a_harmonic_minor'), 'thirds')).toContain('G#5');
  });

  it('returns the plain scale for special scales and for "scale"', () => {
    const blues = byId('c_blues');
    expect(supportsSequences(blues)).toBe(false);
    expect(buildPracticeNotes(blues, 'groups4')).toBe(blues.notes);
    expect(buildPracticeNotes(g, 'scale')).toBe(g.notes);
  });

  it('every major/minor key: notes have fingerings and groups fill whole measures', () => {
    for (const scale of SCALES.filter(supportsSequences)) {
      for (const p of PRACTICE_PATTERNS.filter((p) => p.id !== 'scale')) {
        const notes = buildPracticeNotes(scale, p.id);
        expect(notes.length, `${scale.id} ${p.id}`).toBeGreaterThan(0);
        expect(notes.filter((n) => !FINGERINGS[n]), `${scale.id} ${p.id}`).toEqual([]);
        expect(notes.length % p.beatsPerMeasure, `${scale.id} ${p.id}`).toBe(0);
      }
    }
  });
});

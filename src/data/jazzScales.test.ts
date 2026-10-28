import { describe, expect, it } from 'vitest';
import { FINGERINGS, SCALES } from '@/data/scales';
import { JAZZ_SCALES } from '@/data/jazzScales';
import { notesToAbcMeasures } from '@/lib/abcNotes';
import { getTodayScale, scaleDisplayName, scaleTrack } from '@/lib/dailyScale';
import { buildPracticeNotes, PRACTICE_PATTERNS, supportsSequences } from '@/lib/sequences';

const byId = (id: string) => JAZZ_SCALES.find((s) => s.id === id)!;
const keyOf = (abc: string) => abc.match(/K:([A-G][#b]?m?)/)![1];

describe('JAZZ_SCALES', () => {
  it('ids are unique and do not clash with basic scales', () => {
    const ids = [...SCALES, ...JAZZ_SCALES].map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every note has a fingering, every scale has a chord, and the sheet has one note per note', () => {
    for (const s of JAZZ_SCALES) {
      expect(s.notes.filter((n) => !FINGERINGS[n]), s.id).toEqual([]);
      expect(s.chord, s.id).toBeTruthy();
      const { measures } = notesToAbcMeasures(s.notes, keyOf(s.abc), 4, false);
      expect(measures.join(' ').split(' ').length, s.id).toBe(s.notes.length);
    }
  });

  it('the seven church modes share the C major notes, starting from each degree', () => {
    const modes = JAZZ_SCALES.filter((s) => s.category === 'jazz_mode');
    expect(modes.map((s) => s.notes[0])).toEqual(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']);
    for (const m of modes) expect(m.notes.every((n) => !/[#b]/.test(n)), m.id).toBe(true);
  });

  it('bebop dominant writes a natural on B after B♭ in the same bar', () => {
    const { measures } = notesToAbcMeasures(byId('jazz_c_bebop_dominant').notes, 'C', 4, false);
    expect(measures[1]).toBe('G A _B =B');
  });

  it('church modes support sequences; other jazz scales play as written', () => {
    const dorian = byId('jazz_d_dorian');
    expect(supportsSequences(dorian)).toBe(true);
    for (const p of PRACTICE_PATTERNS.filter((p) => p.id !== 'scale')) {
      const notes = buildPracticeNotes(dorian, p.id);
      expect(notes.length % p.beatsPerMeasure, p.id).toBe(0);
    }
    const altered = byId('jazz_g_altered');
    expect(supportsSequences(altered)).toBe(false);
    expect(buildPracticeNotes(altered, 'thirds')).toBe(altered.notes);
  });

  it('daily rotation covers every jazz scale and reports the jazz track', () => {
    const seen = new Set<string>();
    for (let d = 0; d < JAZZ_SCALES.length; d++) {
      const s = getTodayScale(new Date(2026, 0, 1 + d), 'jazz');
      expect(scaleTrack(s)).toBe('jazz');
      seen.add(s.id);
    }
    expect(seen.size).toBe(JAZZ_SCALES.length);
    expect(scaleTrack(getTodayScale(new Date(2026, 0, 1)))).toBe('basic');
  });

  it('display names drop the English note', () => {
    expect(scaleDisplayName(byId('jazz_d_dorian'))).toBe('D 多利亚调式');
  });
});

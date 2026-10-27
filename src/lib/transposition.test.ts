import { describe, expect, it } from 'vitest';
import { buildKeyTable, formatNote, parseNote, toMidi, writtenToConcert } from './transposition';

const concert = (written: string, sax: 'alto' | 'soprano') => formatNote(writtenToConcert(parseNote(written)!, sax));

describe('writtenToConcert', () => {
  it('alto sounds a major sixth lower with correct spelling', () => {
    expect(concert('C4', 'alto')).toBe('E♭3');
    expect(concert('A4', 'alto')).toBe('C4');
    expect(concert('F#4', 'alto')).toBe('A3');
    expect(concert('Bb3', 'alto')).toBe('D♭3');
  });
  it('soprano sounds a major second lower', () => {
    expect(concert('C4', 'soprano')).toBe('B♭3');
    expect(concert('D4', 'soprano')).toBe('C4');
    expect(concert('E4', 'soprano')).toBe('D4');
  });
  it('falls back to a common enharmonic instead of double accidentals', () => {
    // G♭ 下行大六度按拼写是 B𝄫，改写为 A
    expect(concert('Gb4', 'alto')).toBe('A3');
    expect(toMidi(writtenToConcert(parseNote('Gb4')!, 'alto'))).toBe(toMidi(parseNote('Gb4')!) - 9);
  });
});

describe('buildKeyTable', () => {
  it('maps concert keys to written keys', () => {
    const table = buildKeyTable();
    expect(table).toHaveLength(12);
    const c = table.find((r) => r.concert.name === 'C')!;
    expect(c.alto.name).toBe('A');
    expect(c.soprano.name).toBe('D');
    const eb = table.find((r) => r.concert.name === 'E♭')!;
    expect(eb.alto.name).toBe('C');
    expect(eb.soprano.name).toBe('F');
  });
});

import { describe, expect, it } from 'vitest';
import { findNotesByKeys } from './fingeringLookup';

describe('findNotesByKeys', () => {
  it('ignores key order and returns enharmonic spellings', () => {
    expect(findNotesByKeys(['key_rh2', 'key_lh3', 'key_lh2', 'key_lh1'])).toEqual(expect.arrayContaining(['F#4', 'Gb4']));
    expect(findNotesByKeys(['key_rh2', 'key_lh3', 'key_lh2', 'key_lh1'])).toHaveLength(2);
  });
  it('distinguishes the octave key', () => {
    expect(findNotesByKeys(['key_lh1', 'key_lh2', 'key_lh3'])).toEqual(['G4']);
    expect(findNotesByKeys(['key_octave', 'key_lh1', 'key_lh2', 'key_lh3'])).toEqual(['G5']);
  });
  it('maps no keys to the open C#5 / Db5', () => {
    expect(findNotesByKeys([])).toEqual(expect.arrayContaining(['C#5', 'Db5']));
  });
  it('returns nothing for a combination that is not a standard fingering', () => {
    expect(findNotesByKeys(['key_lh1', 'key_rh3'])).toEqual([]);
  });
});

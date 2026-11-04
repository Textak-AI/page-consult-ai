import { test, expect } from 'bun:test';
import { inferVisualRegister, registerBecause, listenRowFrom } from '../src/lib/design/visualRegister.ts';
import { applyArtDirectorDirectives } from '../src/lib/artDirectorBrief.ts';
import { buildStrategyTrace } from '../src/lib/strategyTrace.ts';

const music = {
  industryCategory: 'Media / Entertainment', industrySubcategory: 'Music / Audio',
  idealClient: "Someone who still listens to albums front to back. They put on headphones and want to be taken somewhere, not handed a playlist.",
  desiredOutcome: 'Best heard with the lights low and no particular destination.',
};

// Kyle, Nov 4: a record page wore the consulting look. The reader's world should choose the look,
// with the owner's own words as the recorded reason.
test('creative work gets the immersive register, with the owner\'s cue words quoted', () => {
  const d = inferVisualRegister(music);
  expect(d?.register).toBe('immersive');
  expect(d.cues.length).toBeGreaterThan(0);
  expect(d.cues.some(c => /headphones/.test(c))).toBe(true);
  expect(registerBecause(d)).toMatch(/^Set for the audience you described: “/);
  expect(inferVisualRegister({ industryCategory: 'Home & Local Services', idealClient: 'Homeowners who listen to the radio' })).toBeNull();
});

test('the art director applies it: dark page, cover-led hero, prose problem, no trust chips', () => {
  const sections = applyArtDirectorDirectives([
    { type: 'hero', content: { headline: 'H' } },
    { type: 'problem-solution', content: { problem: 'P', solution: 'S' } },
    { type: 'final-cta', content: { headline: 'C' } },
  ], { archetype: 'Emotional Connector' }, music);
  expect(sections[0].content.composition).toBe('cover-immersive');
  expect(sections[0].content.trustSignals).toBe('none');
  expect(sections[0].content.registerCues.length).toBeGreaterThan(0);
  expect(sections[1].content.composition).toBe('prose');
  expect(sections.every(s => s.content.sectionBackground === 'dark' && s.content.pageMode === 'dark')).toBe(true);
  // Without the register the archetype still decides.
  const plain = applyArtDirectorDirectives([{ type: 'hero', content: {} }], { archetype: 'Emotional Connector' }, { industryCategory: 'Professional Services' });
  expect(plain[0].content.composition).toBe('split-photo');
});

test('the record names the look and quotes the owner', () => {
  const trace = buildStrategyTrace({ answers: music, brief: {}, sections: [{ type: 'hero', content: { headline: 'H', visualRegister: 'immersive', registerCues: ['They put on headphones and want to be taken somewhere'] } }] });
  expect(trace.design.label).toBe('Dark, immersive, type-led');
  expect(trace.design.because).toContain('“They put on headphones and want to be taken somewhere”');
});

test('the where answer becomes the names the owner listed, verbatim', () => {
  expect(listenRowFrom('Spotify, Apple Music, Bandcamp, Tidal and YouTube Music.')).toEqual(['Spotify', 'Apple Music', 'Bandcamp', 'Tidal', 'YouTube Music']);
  expect(listenRowFrom('')).toEqual([]);
});

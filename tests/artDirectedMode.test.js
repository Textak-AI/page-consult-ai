import { test, expect } from 'bun:test';
import { artDirectedMode } from '../src/lib/artDirectorBrief';

test('light/tinted-led background plan makes the page light', () => {
  const secs = [
    { content: { sectionBackground: 'light' } },
    { content: { sectionBackground: 'tinted' } },
    { content: {} },
    { content: { sectionBackground: 'dark' } },
  ];
  expect(artDirectedMode(secs)).toBe('light');
});

test('majority-dark plan stays dark', () => {
  const secs = [
    { content: { sectionBackground: 'dark' } },
    { content: { sectionBackground: 'dark' } },
    { content: { sectionBackground: 'light' } },
  ];
  expect(artDirectedMode(secs)).toBe('dark');
});

test('no declared backgrounds yields null so SDI decides (legacy pages unchanged)', () => {
  expect(artDirectedMode([{ content: {} }, { content: { mode: 'dark' } }])).toBe(null);
  expect(artDirectedMode([])).toBe(null);
});

test('applyArtDirectorDirectives emits a complete plan: every section has a background and matching ink mode', async () => {
  const { applyArtDirectorDirectives } = await import('../src/lib/artDirectorBrief');
  const sections = ['hero', 'problem-solution', 'how-it-works', 'features', 'social-proof', 'credentials-bar', 'faq', 'final-cta']
    .map((type, order) => ({ type, order, content: { mode: 'dark' } }));
  const out = applyArtDirectorDirectives(sections, { archetype: 'Emotional Connector' });
  const pageModes = new Set(out.map(s => s.content.pageMode));
  expect(pageModes.size).toBe(1);
  for (const s of out) {
    expect(typeof s.content.sectionBackground).toBe('string');
    expect(s.content.sectionBackground.length).toBeGreaterThan(0);
    const expectedMode = (s.content.sectionBackground === 'dark' || s.content.sectionBackground === 'brand') ? 'dark' : 'light';
    expect(s.content.mode).toBe(expectedMode);
  }
  // Sections the brief never named (social-proof, credentials-bar) inherit the page flavor
  const social = out.find(s => s.type === 'social-proof');
  expect(social.content.sectionBackground).toBe(social.content.pageMode === 'dark' ? 'dark' : 'light');
});

test('a dark-led archetype palette yields a dark page with its declared light islands intact', async () => {
  const { applyArtDirectorDirectives, artDirectedMode } = await import('../src/lib/artDirectorBrief');
  const sections = ['hero', 'features', 'stats-bar', 'how-it-works', 'faq', 'final-cta']
    .map((type, order) => ({ type, order, content: {} }));
  const out = applyArtDirectorDirectives(sections, { archetype: 'Analytical Validator' });
  expect(artDirectedMode(out)).toBe('dark');
  const faq = out.find(s => s.type === 'faq');
  // The deliberate light island keeps its light surface AND light-surface ink
  expect(faq.content.sectionBackground).toBe('light');
  expect(faq.content.mode).toBe('light');
});

import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { parseStatedDate, releaseTiming, timeAwareDateLine, timeAwareAsk, outNowAsk, timeAwareContent, pageOutNowVerb } from '../src/lib/text/releaseTiming.ts';
import { buildStrategyTrace } from '../src/lib/strategyTrace.ts';

// Kyle, Nov 6: "there needs to be an intelligence layer that understands the release date is
// behind so pre-save doesn't make sense." 4dhb.net still said "Out October 27, 2026 / Pre-save"
// ten days after the date; the page repeated it.
const nov6 = new Date(2026, 10, 6);

test('a stated date is read in the forms owners write it', () => {
  expect(parseStatedDate('Out October 27, 2026').date.getTime()).toBe(new Date(2026, 9, 27).getTime());
  expect(parseStatedDate('Releases 3rd March 2027').date.getTime()).toBe(new Date(2027, 2, 3).getTime());
  expect(parseStatedDate('Opens 11/20/2026').date.getTime()).toBe(new Date(2026, 10, 20).getTime());
  expect(parseStatedDate('Out November 2026').precision).toBe('month');
  expect(parseStatedDate('Out Friday')).toBeNull();
});

test('the phase follows today, and the line keeps the owner\'s fact in the right tense', () => {
  expect(releaseTiming('Out October 27, 2026', nov6).phase).toBe('out');
  expect(releaseTiming('Out November 20, 2026', nov6).phase).toBe('upcoming');
  expect(releaseTiming('Out November 6, 2026', nov6).phase).toBe('today');
  expect(releaseTiming('Out November 2026', nov6).phase).toBe('upcoming');
  expect(releaseTiming('Out October 2026', nov6).phase).toBe('out');
  expect(timeAwareDateLine('Out October 27, 2026', nov6)).toBe('Released October 27, 2026');
  expect(timeAwareDateLine('Out November 20, 2026', nov6)).toBe('Out November 20, 2026');
  expect(timeAwareDateLine('Out November 6, 2026', nov6)).toBe('Out today — November 6, 2026');
  expect(timeAwareDateLine('Released October 27, 2026', nov6)).toBe('Released October 27, 2026');
});

test('a pre-release ask becomes the out-now verb once the date has passed, with the reason recorded', () => {
  const swapped = timeAwareAsk('Pre-save', 'Out October 27, 2026', 'Media / Entertainment', 'Music / Audio', nov6);
  expect(swapped.text).toBe('Listen');
  expect(swapped.note).toBe('The date you gave (October 27, 2026) has passed, so the button says “Listen”, not “Pre-save”.');
  expect(timeAwareAsk('Pre-save', 'Out November 20, 2026', 'Media / Entertainment', 'Music / Audio', nov6)).toEqual({ text: 'Pre-save', note: null });
  expect(timeAwareAsk('Book a walk-through', 'Opens October 1, 2026', 'Home & Local Services', null, nov6).note).toBeNull();
  expect(outNowAsk('Media / Entertainment', 'Film')).toBe('Watch');
  expect(outNowAsk('Publishing', 'Books')).toBe('Read');
  expect(outNowAsk('Media / Entertainment', 'Gaming')).toBe('Play');
  expect(outNowAsk('Consumer Products', null)).toBe('Get it');
});

test('a page published before the date turns over at render time, using the named platforms as the hint', () => {
  const hero = { ctaText: 'Pre-save', dateLine: 'Out October 27, 2026', listenRow: ['Spotify', 'Bandcamp'], ctaLink: 'https://4dhb.net/' };
  const out = timeAwareContent(hero, nov6);
  expect(out.ctaText).toBe('Listen');
  expect(out.dateLine).toBe('Released October 27, 2026');
  expect(out.ctaLink).toBe('https://4dhb.net/');
  expect(out.askNote).toMatch(/has passed/);
  expect(timeAwareContent(hero, new Date(2026, 9, 1))).toBe(hero);
  expect(timeAwareContent({ ctaText: 'Pre-order', dateLine: 'Out October 27, 2026', outNowAsk: 'Read' }, nov6).ctaText).toBe('Read');
  for (const f of ['src/components/public/PublicPageRenderer.tsx', 'src/components/editor/LivePreview.tsx']) {
    expect(readFileSync(new URL('../' + f, import.meta.url), 'utf8')).toMatch(/timeAwareContent\(\{/);
  }
});

test('the record says why the button changed', () => {
  const trace = buildStrategyTrace({
    answers: { ctaText: 'Pre-save', industryCategory: 'Media / Entertainment' },
    brief: {},
    sections: [{ type: 'hero', content: { headline: 'H', ctaText: 'Pre-save', dateLine: 'Out October 27, 2026', listenRow: ['Spotify'] } }],
    now: nov6.toISOString(),
  });
  const hero = trace.sections.find((s) => s.type === 'hero');
  expect(hero.decisions.some((d) => /has passed, so the button says “Listen”/.test(d))).toBe(true);
  expect(hero.decisions).not.toContain('The button uses your words exactly.');
});

test('the goals step warns before the page is built, and build time stores the verb', () => {
  const wizard = readFileSync(new URL('../src/components/consultation/StrategicConsultation.tsx', import.meta.url), 'utf8');
  expect(wizard).toMatch(/data-testid="ask-date-note"/);
  const mapper = readFileSync(new URL('../src/utils/sectionMapper.ts', import.meta.url), 'utf8');
  expect((mapper.match(/outNowAsk: outNowAsk\(/g) || []).length).toBe(2);
  expect((mapper.match(/timeAwareDateLine\(statedDateLine\(/g) || []).length).toBe(2);
  expect(mapper).toMatch(/ctaLink: ctaHref\(\(options\.consultationData as any\)\?\.ctaLink\)/);
});

// Live 4DHB after b3fe782: hero said "Listen", the close said "Get it" — the close names no platforms.
test('the close borrows the verb from the page when it has no hint of its own', () => {
  const sections = [
    { type: 'hero', content: { ctaText: 'Pre-save', dateLine: 'Out October 27, 2026', listenRow: ['Spotify'] } },
    { type: 'final-cta', content: { ctaText: 'Pre-save', dateLine: 'Out October 27, 2026' } },
  ];
  const verb = pageOutNowVerb(sections);
  expect(verb).toBe('Listen');
  expect(timeAwareContent(sections[1].content, nov6, verb).ctaText).toBe('Listen');
  expect(timeAwareContent(sections[1].content, nov6).ctaText).toBe('Get it');
  for (const f of ['src/components/public/PublicPageRenderer.tsx', 'src/components/editor/LivePreview.tsx']) {
    expect(readFileSync(new URL('../' + f, import.meta.url), 'utf8')).toMatch(/pageOutNowVerb\(sections/);
  }
});

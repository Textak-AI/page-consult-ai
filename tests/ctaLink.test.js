import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { ownerCtaLink, ctaHref, isExternalAsk } from '../src/lib/text/ctaLink.ts';
import { applyArtDirectorDirectives } from '../src/lib/artDirectorBrief.ts';

// Kyle, Nov 4 (4DHB publish): the wizard never asked where the button goes, and on the live page
// "Pre-save" opened a "Contact 4DHB" lead form instead of 4dhb.net.
test('the owner\'s link is kept only when it is a real http(s) address', () => {
  expect(ownerCtaLink('https://4dhb.net')).toBe('https://4dhb.net/');
  expect(ownerCtaLink('4dhb.net')).toBe('https://4dhb.net/');
  expect(ownerCtaLink(' 4dhb.bandcamp.com/album/drift-off ')).toBe('https://4dhb.bandcamp.com/album/drift-off');
  expect(ownerCtaLink('')).toBeNull();
  expect(ownerCtaLink('pre-save')).toBeNull();
  expect(ownerCtaLink('mailto:a@b.c')).toBeNull();
  expect(ownerCtaLink('javascript:alert(1)')).toBeNull();
  expect(ownerCtaLink(undefined)).toBeNull();
  expect(ctaHref(undefined)).toBe('#contact');
  expect(ctaHref('4dhb.net')).toBe('https://4dhb.net/');
});

test('an ask pointing off the page navigates; a form-bound ask opens the lead form', () => {
  expect(isExternalAsk('https://4dhb.net/')).toBe(true);
  expect(isExternalAsk('#contact')).toBe(false);
  expect(isExternalAsk(null)).toBe(false);
  const renderer = readFileSync(new URL('../src/components/public/PublicPageRenderer.tsx', import.meta.url), 'utf8');
  expect(renderer).toMatch(/isExternalAsk\(button\.getAttribute\('href'\)\)\) return;/);
});

test('the goals step asks where the button sends people and Generate uses the answer', () => {
  const wizard = readFileSync(new URL('../src/components/consultation/StrategicConsultation.tsx', import.meta.url), 'utf8');
  expect(wizard).toMatch(/Where should that button send people\?/);
  expect(wizard).toMatch(/updateData\(\{ ctaLink: e\.target\.value \}\)/);
  const gen = readFileSync(new URL('../src/pages/Generate.tsx', import.meta.url), 'utf8');
  expect(gen).not.toMatch(/ctaLink: "#contact"/);
  expect(gen).toMatch(/ctaLink: ctaHref\(strategicConsultation\?\.ctaLink\)/);
  expect(gen).toMatch(/section\.type === 'hero' && ownerCtaLink\(consultationData\.ctaLink\)/);
});

// Kyle, Nov 4: "THE PAYOFF" kicker and three SaaS cards survived the immersive register.
test('immersive features render as liner notes, not cards', () => {
  const sections = applyArtDirectorDirectives(
    [{ type: 'hero', content: {} }, { type: 'features', content: { title: 'Drift Off', features: [{ title: 'A', description: 'a' }] } }],
    null,
    { industryCategory: 'Media / Entertainment', idealClient: 'They put on headphones and want to be taken somewhere.' },
  );
  const features = sections.find((s) => s.type === 'features');
  expect(features.content.featureLayout).toBe('prose');
  expect(features.content.visualRegister).toBe('immersive');
  const fs = readFileSync(new URL('../src/components/sections/FeaturesSection.tsx', import.meta.url), 'utf8');
  expect(fs).toMatch(/visualRegister === 'immersive' \|\| featureLayout === 'prose'/);
  const prose = readFileSync(new URL('../src/components/sections/features/FeaturesProse.tsx', import.meta.url), 'utf8');
  expect(prose).not.toMatch(/eyebrow|PremiumCard|GradientIcon/);
});

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

// Kyle, Nov 4: "A landing page really should collect emails though." When the ask leaves the
// page, the close still takes an address, and the hero offers the same in one line.
test('an external ask brings an email line; a form-bound ask does not', async () => {
  const { emailLineFor } = await import('../src/lib/text/ctaLink.ts');
  expect(emailLineFor('#contact', 'creative')).toBeNull();
  const music = emailLineFor('https://4dhb.net/', 'creative', '4DHB');
  expect(music.prompt).toBe('Get a note when something new is out.');
  expect(music.heroLink).toMatch(/leave your email/);
  expect(emailLineFor('https://acme.example/book', 'services', 'Acme Plumbing').prompt).toMatch(/hear from Acme Plumbing/);
  expect(emailLineFor('https://acme.example/book', 'services', null).prompt).toMatch(/hear from us/);
  const gen = readFileSync(new URL('../src/pages/Generate.tsx', import.meta.url), 'utf8');
  expect((gen.match(/emailLine: emailLineFor\(/g) || []).length).toBe(4);
  const close = readFileSync(new URL('../src/components/sections/final-cta/CTACenteredMinimal.tsx', import.meta.url), 'utf8');
  expect(close).toMatch(/id="stay-posted"/);
  const hero = readFileSync(new URL('../src/components/sections/hero/HeroCoverImmersive.tsx', import.meta.url), 'utf8');
  expect(hero).toMatch(/href="#stay-posted"/);
  const line = readFileSync(new URL('../src/components/sections/shared/EmailLine.tsx', import.meta.url), 'utf8');
  expect(line).toMatch(/customFields: \{ intent \}/);
  expect(line).toMatch(/if \(!publishedPageId\)/);
});

// The live 4DHB page still showed "THE PAYOFF" glass cards after FeaturesProse shipped: the
// signature "glass" element wraps the section on published pages, bypassing FeaturesSection.
test('signature overrides stand down in the immersive register', () => {
  const sig = readFileSync(new URL('../src/components/signature/SignatureSection.tsx', import.meta.url), 'utf8');
  expect(sig).toMatch(/content\.visualRegister === 'immersive' && type !== 'hero'\) return <>\{children\}<\/>/);
});

// Republishing the 4DHB page did not add the line: its link was set on the sections, not in the
// wizard answer. The sections derive the line from their own link, so no republish is needed.
test('hero and close derive the email line from their own link', () => {
  const close = readFileSync(new URL('../src/components/sections/final-cta/CTACenteredMinimal.tsx', import.meta.url), 'utf8');
  expect(close).toMatch(/content\.emailLine \|\| emailLineFor\(content\.ctaLink/);
  const hero = readFileSync(new URL('../src/components/sections/hero/HeroCoverImmersive.tsx', import.meta.url), 'utf8');
  expect(hero).toMatch(/content\.emailLine \|\| emailLineFor\(content\.ctaLink, 'creative'/);
});

import { test, expect } from 'bun:test';
import { readFileSync, existsSync } from 'fs';
import { prospectSlug } from '../supabase/functions/_shared/prospectSlug';
import { nextProspectStatus } from '../supabase/functions/_shared/prospectStatus';
const src = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

test('Quick Pivot copy runs the same claim guard as the page builder and keeps the owner\'s button', () => {
  const g = src('supabase/functions/generate-prospect-pivot/index.ts');
  expect(g).toMatch(/guardCopyClaims\(/);
  expect(g).toMatch(/PROVENANCE_RULES/);
  expect(g).toMatch(/generated\.cta_text = currentCta \|\| ""/);
  expect(g).not.toMatch(/"Learn More"/);
  expect(g).toMatch(/\.order\("updated_at", \{ ascending: false \}\)/);
  const page = src('src/pages/ProspectPage.tsx');
  expect(page).not.toMatch(/ctaText: prospect\.personalized_cta_text/);
});

test('owner chooses the page; no test-data button; balance refreshes', () => {
  const m = src('src/components/quick-pivot/QuickPivotModal.tsx');
  expect(m).toMatch(/Page to personalize/);
  expect(m).toMatch(/base_page_id: pageId/);
  expect(m).not.toMatch(/fillTestData|🧪|kyle@/);
  expect(m).toMatch(/announceUsageChanged\(\)/);
  expect(m).not.toMatch(/>\/p\/</);
});

test('prospect links are /for/ everywhere; emails never borrow another person\'s name', () => {
  expect(src('src/pages/ProspectsDashboard.tsx')).not.toMatch(/\/p\/\$\{/);
  const e = src('supabase/functions/send-prospect-email/index.ts');
  expect(e).not.toMatch(/Kyle Moyer/);
  expect(e).toMatch(/\/for\/\$\{prospect\.slug\}/);
});

test('link names are sanitized and match the public lookup', () => {
  expect(prospectSlug('Sarah Chen')).toBe('sarah-chen');
  expect(prospectSlug('  José  O\'Brien!! ')).toBe('jose-o-brien');
  expect(prospectSlug('a.b')).toBe('a-b');
  expect(prospectSlug('x')).toBe('x-page');
  expect(prospectSlug('!!!')).toBe('');
  expect(/^[a-zA-Z0-9_-]{1,200}$/.test(prospectSlug('Ünïcode Name & Co.'))).toBe(true);
});

test('engagement only moves a prospect forward and never off an owner-set status', () => {
  expect(nextProspectStatus('new', 10, true)).toBe('contacted');
  expect(nextProspectStatus('contacted', 60, false)).toBe('engaged');
  expect(nextProspectStatus('engaged', 120, false)).toBe('hot');
  expect(nextProspectStatus('hot', 20, false)).toBe('hot');
  expect(nextProspectStatus('converted', 150, false)).toBe('converted');
  expect(nextProspectStatus('lost', 150, true)).toBe('lost');
  const t = src('supabase/functions/track-prospect-view/index.ts');
  expect(t).toMatch(/user\.id === prospect\.user_id/);
  expect(t).toMatch(/rateLimit\(supabase, req, `track-prospect-view:/);
});

test('the retired prospect-page flow is gone and its endpoints answer 410', () => {
  expect(existsSync(new URL('../src/components/prospect/CreateProspectPageModal.tsx', import.meta.url))).toBe(false);
  expect(src('src/pages/Brief.tsx')).not.toMatch(/CreateProspectPageModal/);
  for (const f of ['generate-prospect-page', 'render-prospect-page', 'track-prospect-page-view']) {
    const s = src(`supabase/functions/${f}/index.ts`);
    expect(s).toMatch(/status: 410/);
    expect(s).not.toMatch(/createClient|demo_sessions|ANTHROPIC/);
  }
});

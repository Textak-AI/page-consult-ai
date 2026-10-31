import { test, expect } from 'bun:test';
import { readFileSync, existsSync } from 'fs';
import { toBriefEditorData, fromBriefEditorData } from '../src/lib/briefEditorData';
import { dashboardTitle, isLive, newestFirst } from '../src/lib/dashboardPages';
const src = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

test('no A/B testing promise anywhere in the app', () => {
  expect(existsSync(new URL('../src/components/editor/VariantGeneratorModal.tsx', import.meta.url))).toBe(false);
  expect(src('src/components/consultation/steps/CampaignContextStep.tsx')).not.toMatch(/A\/B/);
  expect(src('src/components/dashboard/DashboardSidebar.tsx')).not.toMatch(/A\/B/);
  expect(src('src/components/editor/IntelligenceGatedTab.tsx')).not.toMatch(/A\/B/);
  expect(src('src/pages/Generate.tsx')).not.toMatch(/coming soon/i);
});

test('brief editor shows wizard answers under its own field names', () => {
  const d = toBriefEditorData({
    clientFrustration: 'Nightly diffs nobody reads\nDrift piles up', desiredOutcome: 'Git matches AWS',
    concreteProofStory: '600 to 4 drifted resources', achievements: 'SOC 2 Type II', ctaText: 'Book a Drift Walkthrough',
    testimonialText: '"We had 600 drifted resources"',
  });
  expect(d.audiencePainPoints).toEqual(['Nightly diffs nobody reads', 'Drift piles up']);
  expect(d.audienceGoals).toEqual(['Git matches AWS']);
  expect(d.caseStudyHighlight).toBe('600 to 4 drifted resources');
  expect(d.credentials).toBe('SOC 2 Type II');
  expect(d.primaryCTA).toBe('Book a Drift Walkthrough');
  expect(d.testimonials[0].quote).toContain('600 drifted');
  expect(d.guaranteeOffer).toBe(''); // never invented
});

test('editor values win, and edits fold back into the wizard fields', () => {
  expect(toBriefEditorData({ caseStudyHighlight: 'edited', concreteProofStory: 'old' }).caseStudyHighlight).toBe('edited');
  const back = fromBriefEditorData({ clientFrustration: 'old', ctaText: 'Old CTA' }, { audiencePainPoints: ['a', 'b'], primaryCTA: 'New CTA' });
  expect(back.clientFrustration).toBe('a\nb');
  expect(back.ctaText).toBe('New CTA');
});

test('brief edits persist to the page, not only the consultation row', () => {
  expect(src('src/components/builder/StrategyBriefPanel.tsx')).toMatch(/consultation_data: fromBriefEditorData/);
  expect(src('src/pages/Generate.tsx')).toMatch(/landingPageId=\{pageData\?\.id\}/);
  const editor = src('src/components/strategy-brief/StrategyBriefEditor.tsx');
  expect(editor).not.toMatch(/money-back|500\+ customers|Limited time offer|Start Free Trial/);
});

test('style presets are free', () => {
  expect(src('src/hooks/useAIActions.ts')).toMatch(/style_change: 0/);
  expect(src('src/pages/Generate.tsx')).not.toMatch(/executeWithUsageCheck\('style_change'/);
});

test('header publish label follows the dialog', () => {
  expect(src('src/components/editor/PublishModal.tsx')).toMatch(/announcePublishChanged\(true\)/);
  expect(src('src/components/editor/PublishModal.tsx')).toMatch(/announcePublishChanged\(false\)/);
  expect(src('src/components/editor/PublishToolbar.tsx')).toMatch(/Live · Update/);
});

test('dashboard: business names, live means is_published, newest first', () => {
  expect(dashboardTitle({ title: 'Relay Metrics Landing Page' })).toBe('Relay Metrics');
  expect(dashboardTitle({ title: 'x', consultation_data: { businessName: 'Driftwatch Labs' } })).toBe('Driftwatch Labs');
  expect(dashboardTitle({ title: '' })).toBe('Untitled page');
  expect(isLive({ is_published: true })).toBe(true);
  expect(isLive({ is_published: false })).toBe(false);
  expect(newestFirst([{ updated_at: '2026-01-01' }, { updated_at: '2026-10-31' }])[0].updated_at).toBe('2026-10-31');
  expect(src('src/pages/Dashboard.tsx')).not.toMatch(/\/preview\/\$\{page\.slug\}/);
});

test('Page Chat shows elapsed progress while it works', () => {
  expect(src('src/components/consultation/ConsultantChat.tsx')).toMatch(/writing changes · \{elapsed\}s/);
});

test('page-build loader only names work that happens', () => {
  const s = src('src/components/editor/UnifiedGenerationFlow.tsx');
  expect(s).not.toMatch(/Industry intelligence loaded|Applying trust signals|Calibrating voice/);
  expect(existsSync(new URL('../src/components/editor/AIWorkingLoader.tsx', import.meta.url))).toBe(false);
  expect(src('src/pages/Generate.tsx')).toMatch(/pricePoint: parsePricePoint\(/);
});

test('pricing makes no scarcity or discount claims; agency comparison removed', () => {
  for (const f of ['src/pages/PricingPage.tsx', 'src/components/Pricing.tsx', 'src/components/credits/UpgradeDrawer.tsx']) {
    const s = src(f);
    expect(s).not.toMatch(/500 spots|spots left|spots remaining|30% off|originalPrice|Limited Time/);
  }
  expect(existsSync(new URL('../src/components/TimelineComparison.tsx', import.meta.url))).toBe(false);
  expect(src('src/pages/Index.tsx')).not.toMatch(/TimelineComparison/);
});

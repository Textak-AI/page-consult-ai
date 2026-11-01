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
  // Price ranges are parsed in the one shared profile mapping the wizard, review page and editor all use.
  expect(src('src/utils/archetypeOptimizer.ts')).toMatch(/pricePoint: parsePricePoint\(/);
  expect(src('src/pages/Generate.tsx')).toMatch(/profileFromConsultation\(/);
});

test('pricing makes no scarcity or discount claims; agency comparison removed', () => {
  for (const f of ['src/pages/PricingPage.tsx', 'src/components/Pricing.tsx', 'src/components/credits/UpgradeDrawer.tsx']) {
    const s = src(f);
    expect(s).not.toMatch(/500 spots|spots left|spots remaining|30% off|originalPrice|Limited Time/);
  }
  expect(existsSync(new URL('../src/components/TimelineComparison.tsx', import.meta.url))).toBe(false);
  expect(src('src/pages/Index.tsx')).not.toMatch(/TimelineComparison/);
});

test('inline image bytes are uploaded and replaced by URLs before save and publish', async () => {
  const { collectInlineImages, replaceInlineImages, isInlineImage } = await import('../src/lib/editor/externalizeImages');
  const img = 'data:image/webp;base64,UklGRgAAAABXRUJQ';
  const sections = [{ type: 'hero', content: { backgroundImage: img, headline: 'data:image is just text here' } }, { type: 'gallery', content: { images: [img, 'https://x/y.png'] } }];
  expect([...collectInlineImages(sections)]).toEqual([img]);
  expect(isInlineImage('data:image is just text here')).toBe(false);
  const out = replaceInlineImages(sections, new Map([[img, 'https://cdn/a.webp']]));
  expect(out[0].content.backgroundImage).toBe('https://cdn/a.webp');
  expect(out[1].content.images).toEqual(['https://cdn/a.webp', 'https://x/y.png']);
  expect(sections[0].content.backgroundImage).toBe(img); // input untouched
  expect(src('src/hooks/useEditorSession.ts')).toMatch(/sections: await externalizeImages\(snap\.sections\)/);
  expect(src('src/components/editor/PublishModal.tsx').match(/externalizeImages\(sections\)/g).length).toBe(2);
});

test('unbuilt plan features are marked coming soon; no agency trial promised', () => {
  for (const f of ['src/pages/PricingPage.tsx', 'src/components/Pricing.tsx', 'src/components/credits/UpgradeDrawer.tsx', 'src/components/settings/BillingSettings.tsx']) {
    const s = src(f);
    for (const it of ['Advanced analytics', 'Custom domains', 'White-label', 'team seats', 'Client sub-accounts', 'API access', 'Custom integrations', 'Priority AI generation']) {
      for (const m of s.matchAll(new RegExp(it + '[^"\'<]*', 'g'))) expect(m[0]).toMatch(/coming soon/);
    }
    expect(s).not.toMatch(/Agency Trial/);
  }
});

test('open Page Chat docks beside the preview instead of covering it', () => {
  expect(src('src/components/consultation/ConsultantChat.tsx')).toMatch(/onDockWidth\?\.\(isOpen \? \(isExpanded \? 480 : 400\) \+ 24 : 0\)/);
  expect(src('src/pages/Generate.tsx')).toMatch(/onDockWidth=\{setPageChatDock\}/);
  expect(src('src/pages/Generate.tsx')).toMatch(/paddingRight: pageChatDock/);
});

test('sidebar marks sections that render nothing until real proof exists', async () => {
  const { hiddenReason } = await import('../src/lib/editor/emptySections');
  expect(hiddenReason({ type: 'social-proof', content: { testimonials: [] } })).toMatch(/real testimonial/);
  expect(hiddenReason({ type: 'social-proof', content: { testimonial: { quote: '[Test quote] long enough' } } })).toBeNull();
  expect(hiddenReason({ type: 'credentials-bar', content: {} })).toMatch(/credentials/);
  expect(hiddenReason({ type: 'features', content: {} })).toBeNull();
  expect(src('src/components/editor/SectionManager.tsx')).toMatch(/hiddenReason\(section\)/);
});

test('Page Chat never claims "only your facts"', () => {
  expect(src('supabase/functions/_shared/pageChat.ts')).toMatch(/Never claim the copy uses "only"/);
  expect(src('src/pages/Generate.tsx')).not.toMatch(/using only my brief/);
});

test('SEO fields: page-copy fallback can be pulled into the field and is counted', () => {
  const s = src('src/components/editor/SeoPanel.tsx');
  expect(s).toMatch(/Start from this text/);
  expect(s).toMatch(/onUseFallback=\{\(\) => setMetaDescription\(fallbackDescription\)\}/);
  expect(s).toMatch(/Using your page copy/);
});

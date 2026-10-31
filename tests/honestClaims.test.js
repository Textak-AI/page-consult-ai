import { test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { calibrateArchetypeConfidence, archetypeConfidenceLabel, parsePricePoint, optimizeArchitecture } from '../src/utils/archetypeOptimizer';
import { calibratedArchetypeLabel } from '../src/lib/buyerArchetype';
import { getOfferKind, frustrationQuestion, uniqueStrengthExample, getWizardPlaceholders } from '../src/lib/wizard/industryWording';
import { resolveBrandSummary } from '../src/lib/wizard/brandSummary';
import { firstSentence, buildHeadlineOptions, buildSubheadline, lowerFirstSafe } from '../src/lib/strategy/headlineOptions';
import { enhanceMessagingPillars } from '../src/lib/briefExtractor';
import { getSectionHeader } from '../src/lib/industrySectionHeaders';
import { BRIEF_GENERATION_STEPS, CHAT_SUMMARY_STEPS } from '../src/lib/progress/honestSteps';

const root = new URL('..', import.meta.url).pathname;
const src = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

// Strings that claimed work the product never does, or results it cannot show.
const FALSE_CLAIMS = [
  'competitor_landscape: mapped',
  'architectures evaluated',
  'Optimal configuration locked',
  'proven to convert',
  'Generated in 10 minutes',
  'generated in 10 minutes',
  'we do in 10 minutes',
  '10x faster than manual',
  'Unlimited AI edits',
  'Test 10 variations',
  '10x ROI',
  'or your money back',
  'hiring in your space',
  'Researching Your Market',
  'Analyzing competitive landscape',
  'Researching competitor positioning',
  'Finding market statistics',
  'Target audience pain points analyzed',
  'Industry best practices researched',
  'Results That Speak',
  'Results That Matter',
  'Proven Impact',
  'Proven Results',
  'Proven Track Record',
  'Why Families Trust Us',
  'Customer Love',
  'Trusted by operations teams at',
  'converging signals',
  'The only platform',
  'Most Popular',
];

// src/components/editor/* is owned by another workstream. AIWorkingLoader there
// still carries the old fake terminal lines but nothing imports it any more.
// IntelligenceGathering is not imported anywhere (dead component).
const EXCLUDED = ['src/components/editor/AIWorkingLoader.tsx', 'src/components/wizard/IntelligenceGathering.tsx'];

test('false-claim strings do not appear in src/ or index.html', () => {
  const hits = [];
  for (const claim of FALSE_CLAIMS) {
    const out = execSync(`grep -rlF -- ${JSON.stringify(claim)} src index.html || true`, { cwd: root }).toString().trim();
    for (const f of out.split('\n').filter(Boolean)) if (!EXCLUDED.includes(f)) hits.push(`${f}: ${claim}`);
  }
  expect(hits).toEqual([]);
});

test('no live screen renders the old fake-terminal loader', () => {
  const out = execSync("grep -rl 'AIWorkingLoader' src || true", { cwd: root }).toString().trim().split('\n').filter(Boolean);
  expect(out.filter((f) => f !== 'src/components/editor/AIWorkingLoader.tsx')).toEqual([]);
  expect(src('src/components/consultation/StrategicConsultation.tsx')).toMatch(/return <BriefProgressLoader \/>/);
});

test('progress steps name work that runs; no counts, research or scanning', () => {
  for (const s of [...BRIEF_GENERATION_STEPS, ...CHAT_SUMMARY_STEPS]) {
    expect(s).not.toMatch(/\d|research|competitor|scan|analy[sz]|evaluat|statistic|market/i);
  }
  const wizard = src('src/pages/Wizard.tsx');
  expect(wizard).not.toMatch(/Simulate research steps/);
  expect(wizard).not.toMatch(/2500 \+ Math\.random/);
});

test('index.html describes the product plainly', () => {
  const html = src('index.html');
  const line = 'PageConsult AI runs a strategy consultation and builds a landing page from your answers.';
  expect(html).toContain(`name="description" content="${line}"`);
  expect(html).toContain(`property="og:description" content="${line}"`);
  expect(html).toContain(`name="twitter:description" content="${line}"`);
});

test('archetype confidence: three-word answers never read as 95%', () => {
  const thin = calibrateArchetypeConfidence({ margin: 3, total: 3, ownerWordCount: 3, markerCount: 1 });
  expect(thin.evidence).toBe('thin');
  expect(thin.confidence).toBeLessThanOrEqual(0.55);
  expect(archetypeConfidenceLabel(thin.confidence, thin.evidence)).not.toMatch(/%/);

  const some = calibrateArchetypeConfidence({ margin: 10, total: 12, ownerWordCount: 80, markerCount: 5 });
  expect(some.evidence).toBe('some');
  expect(some.confidence).toBeLessThanOrEqual(0.7);
  expect(archetypeConfidenceLabel(some.confidence, some.evidence)).not.toMatch(/%/);

  const strong = calibrateArchetypeConfidence({ margin: 10, total: 12, ownerWordCount: 300, markerCount: 9 });
  expect(strong.evidence).toBe('strong');
  expect(strong.confidence).toBeLessThanOrEqual(0.85);
  expect(archetypeConfidenceLabel(strong.confidence, strong.evidence)).toBe(`${Math.round(strong.confidence * 100)}% confidence`);

  // Legacy result without evidence never shows a precise percent.
  expect(archetypeConfidenceLabel(0.95)).not.toMatch(/%/);
  expect(optimizeArchitecture('Analytical Validator', 0.55, 'thin').reasoning).not.toMatch(/\d+%|evaluated|locked/);
});

test('price range parses to its low end instead of concatenating digits', () => {
  expect(parsePricePoint('$5,000 - $10,000')).toBe(5000);
  expect(parsePricePoint('$25,000+')).toBe(25000);
  expect(parsePricePoint('Custom / Varies')).toBe(0);
  expect(parsePricePoint(undefined)).toBe(0);
});

test('Strategy Document archetype label is capped by how much the owner wrote', () => {
  expect(calibratedArchetypeLabel(6, 5)).toBe('Low');
  expect(calibratedArchetypeLabel(6, 80)).toBe('Moderate');
  expect(calibratedArchetypeLabel(6, 200)).toBe('High');
  expect(calibratedArchetypeLabel(1, 200)).toBe('Low');
});

test('wizard wording follows the selected industry; only services firms are hired', () => {
  expect(getOfferKind('B2B SaaS / Software', 'Analytics / Business Intelligence')).toBe('software');
  expect(getOfferKind('E-commerce / Retail', 'Fashion / Apparel')).toBe('product');
  expect(getOfferKind('Professional Services', 'Legal / LegalTech')).toBe('services');
  expect(getOfferKind('Real Estate / PropTech', 'Residential')).toBe('services');
  expect(getOfferKind('Professional Services', 'Consulting')).toBe('services');
  expect(getOfferKind('')).toBe('general');
  expect(frustrationQuestion('software')).not.toMatch(/hir/i);
  expect(frustrationQuestion('product')).not.toMatch(/hir/i);
  expect(frustrationQuestion('general')).not.toMatch(/hir/i);
  expect(frustrationQuestion('services')).toMatch(/hiring/);
});

test('differentiator examples model checkable facts, never guarantees or ROI multiples', () => {
  const bad = /guarantee|money.?back|\d+x\b|roi|only (agency|tool|one)|best|#1|risk.?free/i;
  for (const k of ['software', 'product', 'services', 'general']) expect(uniqueStrengthExample(k)).not.toMatch(bad);
  expect(uniqueStrengthExample('software', 'Ledgerly')).toMatch(/^e\.g\., Ledgerly /);
  for (const label of ['B2B SaaS / Software', 'Professional Services', 'Healthcare / Medical', 'Real Estate / PropTech', 'Agency / Creative', 'Manufacturing / Industrial', 'Something Else']) {
    expect(getWizardPlaceholders(label).uniqueStrength).not.toMatch(bad);
    expect(getWizardPlaceholders(label).clientFrustration).not.toMatch(/hiring in your space/);
  }
  // Lookup works with the stored "Category → Sub" string, which never matched before.
  expect(getWizardPlaceholders('B2B SaaS / Software → Analytics')).toBe(getWizardPlaceholders('B2B SaaS / Software'));
});

test('brand sidebar reflects colors set in the wizard Brand step', () => {
  const set = resolveBrandSummary(null, { primaryColor: '#123456', secondaryColor: '#abcdef', logoUrl: null });
  expect(set?.source).toBe('wizard');
  expect(set?.colors).toEqual([{ key: 'primary', hex: '#123456' }, { key: 'secondary', hex: '#abcdef' }]);
  const saved = { logo_url: 'https://x.test/logo.png', website_url: 'https://x.test', colors: { primary: { hex: '#000000' } }, voice_tone: { personality: ['plain', 'direct', 'warm'] } };
  expect(resolveBrandSummary(saved, { primaryColor: '#ff0000', secondaryColor: '', logoUrl: null })?.colors).toEqual([{ key: 'primary', hex: '#ff0000' }]);
  expect(resolveBrandSummary(saved, undefined)?.source).toBe('saved');
  expect(resolveBrandSummary(saved, undefined)?.voice).toEqual(['plain', 'direct']);
  expect(resolveBrandSummary(null, undefined)).toBeNull();
  expect(src('src/components/consultation/CollapsibleBriefPanel.tsx')).toMatch(/resolveBrandSummary\(brandBrief, wizardData\.brandSettings\)/);
});

test('section header defaults describe the section instead of claiming results or trust', () => {
  const claim = /proven|trusted|trust us|love|happy|speak|matter|award|leading|success|free trial|free quote/i;
  for (const v of ['local-services', 'saas', 'manufacturing', 'healthcare', 'finance', 'creative', 'consulting', 'legal', 'ecommerce', 'default']) {
    for (const t of ['proof', 'testimonials', 'cta', 'credentials', 'pricing', 'benefits']) {
      expect({ v, t, title: getSectionHeader(v, t).title }).not.toEqual(expect.objectContaining({ title: expect.stringMatching(claim) }));
    }
  }
  expect(getSectionHeader('default', 'proof').title).toBe('Results');
});

test('pillar text keeps whole sentences: decimals and abbreviations do not cut it', () => {
  expect(firstSentence('We cut close time by $2.5M a year. Then more.')).toBe('We cut close time by $2.5M a year');
  expect(firstSentence('Works with ERPs, e.g. NetSuite and SAP. Second.')).toBe('Works with ERPs, e.g. NetSuite and SAP');
  const [p] = enhanceMessagingPillars([{ title: 'Faster close', description: 'Clients save 3.5 days per close. More text.', icon: 'Zap' }], []);
  expect(p.hook).toBe('Clients save 3.5 days per close');
});

test('Voice Resonance headlines are stated sentences, not spliced templates', () => {
  const opts = buildHeadlineOptions({
    valueProp: 'Month-end close in three days instead of ten. Built on your ERP.',
    challenge: 'They rebuild the same reconciliation spreadsheets every month.',
    edge: 'We sign off every reconciliation with a CPA.',
  });
  expect(opts.map((o) => o.headline)).toEqual([
    'Month-end close in three days instead of ten',
    'You rebuild the same reconciliation spreadsheets every month',
    'We sign off every reconciliation with a CPA',
  ]);
  for (const o of opts) expect(o.headline).not.toMatch(/The only platform|Stop compromising|who demand|deserve better/);
  expect(buildSubheadline({ valueProp: 'Month-end close in three days', audience: 'IT directors at mid-size firms' })).toBe('Month-end close in three days. Built for IT directors at mid-size firms.');
  expect(lowerFirstSafe('Finance teams')).toBe('finance teams');
  expect(lowerFirstSafe('CFOs at startups')).toBe('CFOs at startups');
  expect(buildHeadlineOptions({})).toEqual([]);
  const doc = src('src/pages/StrategyDocument.tsx');
  expect(doc).not.toMatch(/painPoints\?\.\[0\]/);
  expect(doc).not.toMatch(/function buildContrastHeadline/);
});

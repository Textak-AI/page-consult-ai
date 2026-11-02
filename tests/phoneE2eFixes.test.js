import { test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { guardCopyClaims, unsupportedCommitment, unInflateCounts } from '../supabase/functions/_shared/copyClaims';

const read = (p) => readFileSync(p, 'utf8');
const greenline = {
  clientCount: '140 weekly lawn accounts',
  clientFrustration: 'Crews that skip weeks after a rainy stretch without telling anyone.',
  uniqueStrength: 'Same two-person crew on your property every week.',
};

// Phone E2E (Nov 1): a new page cost nothing — the brief call never charged and the page is mapped without AI.
test('a new brief charges the page build; re-synthesizing a stored strategy stays free', () => {
  const src = read('supabase/functions/generate-strategy-brief/index.ts');
  expect(src).toMatch(/withCharge\(req, 'page_build'/);
  expect(src).toMatch(/mode !== 'communication-strategy'/);
  const wizard = read('src/components/consultation/StrategicConsultation.tsx');
  expect(wizard).toMatch(/isLimitReached\(err\)/); // out of actions: no free fallback brief
  expect(wizard).toMatch(/<PageBuildCost/);
  expect(read('src/components/consultation/StrategyBriefReview.tsx')).not.toMatch(/PageBuildCost/);
});

test('stated counts are not inflated', () => {
  expect(unInflateCounts('140+ weekly lawn accounts', greenline)).toBe('140 weekly lawn accounts');
  expect(unInflateCounts('Since 2014 · 140+ accounts', { clientCount: '140+ accounts' })).toBe('Since 2014 · 140+ accounts');
  const out = guardCopyClaims({ proof: ['140+ weekly lawn accounts'] }, greenline, 't');
  expect(out.proof[0]).toBe('140 weekly lawn accounts');
});

test('unstated service promises and trade credentials are removed', () => {
  expect(unsupportedCommitment('Same day every week, rain delays included.', greenline)).toBeTruthy();
  expect(unsupportedCommitment('Licensed and insured crews.', greenline)).toBeTruthy();
  expect(unsupportedCommitment('We never miss a week.', greenline)).toBeTruthy();
  expect(unsupportedCommitment('Same crew every week.', greenline)).toBeNull();
  expect(unsupportedCommitment('Fully insured.', { achievements: 'Licensed and insured in Ohio' })).toBeNull();
  const out = guardCopyClaims({ benefit: 'Cut on the same day every week, rain delays included. A photo when it is done.' }, greenline, 't');
  expect(out.benefit).toBe('A photo when it is done.');
});

test('phone editor: section sidebar is a drawer and page actions come first', () => {
  const g = read('src/pages/Generate.tsx');
  expect(g).toMatch(/hidden lg:flex/);
  expect(g).toMatch(/aria-label="Open sections"/);
  expect((g.match(/order-first lg:order-none/g) || []).length).toBeGreaterThanOrEqual(4);
});

test('local trades get their own category, questions and price bands', async () => {
  const { promptsFor } = await import('../supabase/functions/_shared/buyerObjections');
  const { INDUSTRY_TAXONOMY } = await import('../supabase/functions/_shared/siteExtraction');
  expect(INDUSTRY_TAXONOMY['Home & Local Services']).toContain('Lawn Care / Landscaping');
  const topics = promptsFor({ industryCategory: 'Home & Local Services' }).map((p) => p.topic);
  expect(topics).not.toContain('effort');
  expect(topics).toContain('area');
  expect(read('src/components/consultation/StrategicConsultation.tsx')).toMatch(/LOCAL_PRICE_RANGES/);
  expect(read('src/config/designSystem/industryVariants.ts')).toMatch(/home & local/);
});

test('owner-facing wording from the phone run stays fixed', () => {
  const all = ['src/components/editor/PageGenerationLoader.tsx', 'src/components/editor/UnifiedGenerationFlow.tsx', 'src/components/consultation/steps/CampaignContextStep.tsx', 'src/components/strategy-brief/CommunicationStrategyPanel.tsx'].map(read).join('\n');
  for (const s of ['conversion-optimized', 'build comprehensive', 'Arc emphasis', 'Mechanism suggestion', 'Visual intensity']) expect(all).not.toContain(s);
  const brief = read('supabase/functions/generate-strategy-brief/index.ts');
  expect(brief).not.toMatch(/Based on layout intelligence|For each pillar|"X\+ clients"/);
  expect(brief).toMatch(/## 10\. Answered buyer questions/);
});

test('stat chips keep the owner\'s count and words', async () => {
  const { statedStat } = await import('../src/lib/statedStat');
  expect(statedStat('About 900 households served', 'clients')).toEqual({ value: 'About 900 households served', label: '' });
  expect(statedStat('140 weekly lawn accounts', 'clients')).toEqual({ value: '140', label: 'Weekly lawn accounts' });
  expect(statedStat('Since 2011', 'years')).toEqual({ value: 'Since 2011', label: '' });
  expect(statedStat('12 years', 'years')).toEqual({ value: '12', label: 'Years Experience' });
  const { extractAuthoritySignals } = await import('../src/lib/briefExtractor');
  const sig = extractAuthoritySignals({ clientCount: 'About 900 households served' });
  expect(sig[0]).toMatchObject({ value: 'About 900 households served', label: '' });
  for (const f of ['src/utils/sectionMapper.ts', 'src/pages/Generate.tsx']) {
    expect(read(f)).not.toMatch(/\+ '\+'|\}\+`|value: '(?:Leader|Trusted)'/);
  }
});

test('Tallyrun run: stated proof is pinned word for word; audience ranges never become proof; counts keep their quality', async () => {
  const { pinStatedProof, unQualifyCounts, guardCopyClaims } = await import('../supabase/functions/_shared/copyClaims');
  const input = {
    idealClient: 'Controllers at residential property management companies with 200 to 2,000 units.',
    clientCount: '38 property management companies (TEST DATA)',
    achievements: 'SOC 2 Type II report (TEST DATA)',
    yearsInBusiness: 'Launched in 2023',
    objections: [{ question: 'Fit?', answer: 'It reads bank feeds and exports to AppFolio, Buildium and Yardi general ledgers.' }],
  };
  const brief = { proofPoints: { clientCount: '38 property management companies', achievements: 'SOC 2 Type II report', yearsInBusiness: null,
    otherStats: ['Launched in 2023', 'Exports to AppFolio, Buildium and Yardi', 'Serves portfolios from 200 to 2,000 units'] } };
  pinStatedProof(brief, input);
  expect(brief.proofPoints.clientCount).toBe('38 property management companies (TEST DATA)');
  expect(brief.proofPoints.achievements).toBe('SOC 2 Type II report (TEST DATA)');
  expect(brief.proofPoints.yearsInBusiness).toBe('Launched in 2023');
  expect(brief.proofPoints.otherStats).toEqual(['Launched in 2023', 'Exports to AppFolio, Buildium and Yardi']);
  expect(unQualifyCounts('Trusted by 38 live customers.', input)).toBe('Trusted by 38 customers.');
  expect(unQualifyCounts('38 active users', { clientCount: '38 active users' })).toBe('38 active users');
  expect(guardCopyClaims({ s: 'Used by 38 happy teams.' }, input, 't').s).toBe('Used by 38 teams.');
  expect(read('supabase/functions/generate-strategy-brief/index.ts')).toMatch(/pinStatedProof\(structuredBrief, consultationData\)/);
});

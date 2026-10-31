import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'fs';
import {
  INDUSTRY_TAXONOMY,
  sanitizeSiteAnalysis,
  harvestActionLabels,
  pinStatedCopy,
  siteCopyPromptBlock,
} from '../supabase/functions/_shared/siteExtraction';
import { websiteFirstPrefill, resolveSiteIndustry, resolveSiteColors } from '../src/lib/websiteFirst';
import { mapBriefToSections, pinPageEnds } from '../src/utils/sectionMapper';

const src = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

// Shaped like the Oct 30 hyperbrand.ai run: the model renamed the offer and
// invented a CTA; the site's own words are on the page and its buttons.
const SITE_HTML = `<html><body>
  <nav><a href="/">Home</a><a href="/about">About</a></nav>
  <h1>AI systems for brands that ship</h1>
  <p>Brand Systems Sprint - A two-week engagement that maps your brand into an AI workflow.</p>
  <p>Fractional Creative Direction</p>
  <a class="btn" href="/call">Book a Strategy Call</a>
  <button>See the Work</button>
</body></html>`;
const SITE_TEXT = SITE_HTML.replace(/<[^>]+>/g, ' ');

const RAW_MODEL_ANALYSIS = {
  companyName: 'Hyperbrand.AI',
  industry: 'AI-powered brand strategy studio',
  industryClassification: { category: 'Professional Services', subcategory: 'Design / Creative Agency', confidence: 'high' },
  targetAudience: '',
  problemStatement: '',
  solutionStatement: 'AI systems for brands that ship',
  offers: [
    { name: 'Brand Systems Sprint', description: 'A two-week engagement that maps your brand into an AI workflow.' },
    { name: 'AI Readiness Assessment', description: 'A paraphrase the site never says.' },
    { name: 'Fractional Creative Direction', description: '' },
  ],
  ctaLabels: ['Book a strategy call', 'Get Your Free AI Audit'],
  testimonials: [{ quote: 'They doubled our pipeline overnight.', author: 'Jane Doe', title: 'CEO' }],
  proofPoints: ['Trusted by 500+ brands'],
  recommendedCTA: 'Schedule Your AI Consultation',
  recommendedOffer: 'AI Transformation Package',
  gaps: [],
};

const sanitized = () => sanitizeSiteAnalysis(RAW_MODEL_ANALYSIS, SITE_TEXT, harvestActionLabels(SITE_HTML));

describe('site extraction keeps the site words verbatim', () => {
  test('button and link labels are harvested exactly; nav labels are not CTAs', () => {
    expect(harvestActionLabels(SITE_HTML)).toEqual(['Book a Strategy Call', 'See the Work']);
  });

  test('offers survive only when the exact name is on the site', () => {
    const a = sanitized();
    expect(a.offers.map((o) => o.name)).toEqual(['Brand Systems Sprint', 'Fractional Creative Direction']);
    expect(a.offers[0].description).toBe('A two-week engagement that maps your brand into an AI workflow.');
    expect(a.services).toEqual(a.offers);
  });

  test('CTA labels come back in the site casing; invented ones are dropped', () => {
    expect(sanitized().ctaLabels).toEqual(['Book a Strategy Call']);
  });

  test('model suggestions never survive; unsourced testimonials and stats are dropped', () => {
    const a = sanitized();
    expect(a).not.toHaveProperty('recommendedCTA');
    expect(a).not.toHaveProperty('recommendedOffer');
    expect(a.testimonials).toEqual([]);
    expect(a.proofPoints).toEqual([]);
  });

  test('an industry pick outside the selector labels is discarded', () => {
    const a = sanitizeSiteAnalysis({ ...RAW_MODEL_ANALYSIS, industryClassification: { category: 'Agency', subcategory: 'AI', confidence: 'high' } }, SITE_TEXT, []);
    expect(a.industryClassification).toBeNull();
  });

  test('missing CTA and offer become visible gaps, not filler', () => {
    const a = sanitizeSiteAnalysis({ offers: [], ctaLabels: [] }, SITE_TEXT, []);
    expect(a.gaps.map((g) => g.field)).toEqual(expect.arrayContaining(['ctaText', 'mainOffer']));
    expect(a.ctaLabels).toEqual([]);
  });
});

test('INDUSTRY_TAXONOMY mirrors the IndustrySelector labels exactly', () => {
  const s = src('src/components/consultation/IndustrySelector.tsx');
  const data = s.slice(s.indexOf('const INDUSTRY_DATA'), s.indexOf('interface IndustrySelectorProps'));
  const parsed = {};
  for (const block of data.split(/\n  \{\n    id: /).slice(1)) {
    const label = block.match(/label: '([^']+)'/)[1];
    parsed[label] = [...block.matchAll(/\{ id: '[^']+', label: '([^']+)' \}/g)].map((m) => m[1]);
  }
  expect(parsed).toEqual(INDUSTRY_TAXONOMY);
});

describe('industry prefill: scored classification beats stated text', () => {
  test('high-confidence scored pick fills the selector', () => {
    const r = resolveSiteIndustry(sanitized());
    expect(r).toEqual({
      industryCategory: 'Professional Services',
      industrySubcategory: 'Design / Creative Agency',
      industry: 'Professional Services → Design / Creative Agency',
      source: 'scored',
    });
  });

  test('high scored pick wins even when the stated text keyword-matches another industry', () => {
    const r = resolveSiteIndustry({ industry: 'healthcare consulting firm', industryClassification: { category: 'B2B SaaS / Software', subcategory: 'AI / Machine Learning', confidence: 'high' } });
    expect(r.industryCategory).toBe('B2B SaaS / Software');
    expect(r.source).toBe('scored');
  });

  test('without a usable scored pick, the stated text maps to a selector option', () => {
    const r = resolveSiteIndustry({ industry: 'management consulting', industryClassification: null });
    expect(r.industryCategory).toBe('Professional Services');
    expect(r.industrySubcategory).toBe('Consulting');
    expect(r.source).toBe('stated');
  });

  test('nothing to go on leaves the selector empty for the owner', () => {
    expect(resolveSiteIndustry({ industry: '' }).industry).toBe('');
  });
});

describe('website-first prefill', () => {
  const brand = { companyName: 'Hyperbrand.AI', themeColor: '#FF5A1F', secondaryColor: '#0B1020', logoUrl: 'https://hyperbrand.ai/logo.svg', websiteUrl: 'https://hyperbrand.ai' };

  test('offers and CTA are the site words; industry and colours are carried', () => {
    const p = websiteFirstPrefill(sanitized(), brand);
    expect(p.mainOffer).toBe('Brand Systems Sprint');
    expect(p.offerIncludes).toBe('Brand Systems Sprint - A two-week engagement that maps your brand into an AI workflow.\nFractional Creative Direction');
    expect(p.ctaText).toBe('Book a Strategy Call');
    expect(p.industryCategory).toBe('Professional Services');
    expect(p.industrySubcategory).toBe('Design / Creative Agency');
    expect(p.brandSettings.primaryColor).toBe('#FF5A1F');
    expect(p.websiteIntelligence.primaryColor).toBe('#FF5A1F');
    expect(p.websiteIntelligence.siteOffers.map((o) => o.name)).toEqual(['Brand Systems Sprint', 'Fractional Creative Direction']);
    expect(p.websiteIntelligence.siteCtaLabels).toEqual(['Book a Strategy Call']);
    expect(JSON.stringify(p)).not.toMatch(/Schedule Your AI Consultation|AI Transformation Package|AI Readiness Assessment/);
  });

  test('stylesheet colours from extract-website-intelligence fill in when extract-brand found none; never a default hex', () => {
    const logoOnly = { ...brand, themeColor: null, secondaryColor: null };
    expect(resolveSiteColors(logoOnly, { primary: '#123456', brandColors: ['#123456', '#abcdef'] })).toEqual(['#123456', '#abcdef']);
    const p = websiteFirstPrefill({ ...sanitized(), siteIntelligence: null }, logoOnly);
    expect(p.brandSettings.primaryColor).toBe('');
    expect(JSON.stringify(p)).not.toMatch(/#7C3AED|#4F46E5/i);
  });
});

test('brief guard pins the stated CTA verbatim and the prompt lists site copy', () => {
  const brief = { ctaText: 'Schedule Your AI Consultation' };
  pinStatedCopy(brief, { ctaText: 'Book a Strategy Call' });
  expect(brief.ctaText).toBe('Book a Strategy Call');
  const block = siteCopyPromptBlock({ websiteIntelligence: { siteOffers: [{ name: 'Brand Systems Sprint', description: '' }], siteCtaLabels: ['Book a Strategy Call'] } });
  expect(block).toContain('"Brand Systems Sprint"');
  expect(block).toContain('"Book a Strategy Call"');
  expect(siteCopyPromptBlock({})).toBe('');
});

// ---------------------------------------------------------------------------
// Section set: website-first and wizard paths map equivalent data identically.
// ---------------------------------------------------------------------------
const brief = (pageStructure) => ({
  headlines: { optionA: 'AI systems for brands that ship', optionB: '', optionC: '' },
  subheadline: 'Your brand, mapped into an AI workflow.',
  messagingPillars: [
    { title: 'Brand Systems Sprint', description: 'A two-week engagement that maps your brand into an AI workflow.', icon: 'Zap' },
    { title: 'Fractional Creative Direction', description: 'Senior creative direction without a full-time hire.', icon: 'Target' },
    { title: 'Workflow handoff', description: 'Your team runs the system after the sprint.', icon: 'Shield' },
  ],
  proofPoints: { clientCount: null, yearsInBusiness: null, achievements: null, otherStats: [] },
  problemStatement: 'Brand teams cannot keep up with AI-era content volume.',
  solutionStatement: 'We map the brand into a workflow the team can run.',
  tone: 'confident',
  objections: [],
  pageStructure,
  processSteps: null,
  testimonials: [],
  ctaText: 'Schedule Your AI Consultation',
});

const navConsultation = (p) => ({
  businessName: p.businessName,
  industry: p.industry,
  challenge: 'Brand teams cannot keep up with AI-era content volume.',
  unique_value: 'AI systems for brands that ship',
  offer: p.mainOffer,
  ctaText: p.ctaText,
});

const options = (cd) => ({
  businessName: cd.businessName,
  industry: cd.industry,
  industryClassification: { variant: 'creative', source: 'test', reasoning: 'test' },
  arcSource: { challenge: cd.challenge, offer: cd.offer, uniqueValue: cd.unique_value },
  consultationData: cd,
});

describe('website-first page gets the wizard section set, with the close', () => {
  const prefill = websiteFirstPrefill(sanitized(), { companyName: 'Hyperbrand.AI', websiteUrl: 'https://hyperbrand.ai' });
  const cd = navConsultation(prefill);

  test('layout-module vocabulary without a close still ends on final-cta carrying the site CTA', () => {
    // professional-services problemAware from _shared/industryLayouts, minus the close the model dropped
    const sections = mapBriefToSections(brief(['hero', 'process', 'testimonials', 'credentials']), options(cd));
    const types = sections.map((s) => s.type);
    expect(types[0]).toBe('hero');
    expect(types[types.length - 1]).toBe('final-cta');
    expect(types).toEqual(expect.arrayContaining(['problem-solution', 'differentiator-callout', 'features']));
    expect(types).not.toContain('how-it-works'); // no process stated
    // proof slot carries no invented testimonial
    expect(sections.find((s) => s.type === 'social-proof')?.content.testimonials ?? []).toEqual([]);
    const hero = sections.find((s) => s.type === 'hero');
    const close = sections.find((s) => s.type === 'final-cta');
    expect(hero.content.ctaText).toBe('Book a Strategy Call');
    expect(close.content.ctaText).toBe('Book a Strategy Call');
    expect(sections.find((s) => s.type === 'features').content.title).toBe('Brand Systems Sprint');
  });

  test('website-first prefill and the same answers typed into the wizard build the same page', () => {
    // What a wizard user types by hand for the same business (IndustrySelector writes "Category → Sub").
    const typed = {
      businessName: 'Hyperbrand.AI',
      industry: 'Professional Services → Design / Creative Agency',
      challenge: 'Brand teams cannot keep up with AI-era content volume.',
      unique_value: 'AI systems for brands that ship',
      offer: 'Brand Systems Sprint',
      ctaText: 'Book a Strategy Call',
    };
    expect(cd).toEqual(typed);
    for (const structure of [['hero', 'process', 'testimonials', 'credentials', 'cta-final'], ['hero', 'stats-bar', 'problem-solution', 'features', 'faq', 'final-cta']]) {
      const a = mapBriefToSections(brief(structure), options(cd)).map((s) => [s.type, s.content.ctaText ?? null]);
      const b = mapBriefToSections(brief(structure), options(typed)).map((s) => [s.type, s.content.ctaText ?? null]);
      expect(a).toEqual(b);
      expect(a[a.length - 1]).toEqual(['final-cta', 'Book a Strategy Call']);
    }
  });

  test('layout aliases reach real sections', () => {
    const types = mapBriefToSections(brief(['hero', 'problem-agitate', 'benefits', 'cta-final']), options(cd)).map((s) => s.type);
    expect(types).toEqual(expect.arrayContaining(['hero', 'problem-solution', 'features', 'final-cta']));
  });

  test('exploratory softening never rewrites the stated CTA', () => {
    const sections = mapBriefToSections(brief(['hero', 'final-cta']), { ...options({ ...cd, ctaText: 'Get Started' }), messagingArchitecture: { commitmentAsk: 'exploratory' } });
    expect(sections.find((s) => s.type === 'hero').content.ctaText).toBe('Get Started');
  });
});

test('pinPageEnds adds the hero and the close once, in place', () => {
  expect(pinPageEnds(['features'])).toEqual(['hero', 'features', 'final-cta']);
  expect(pinPageEnds(['final-cta', 'hero', 'faq'])).toEqual(['hero', 'faq', 'final-cta']);
});

test('website-first wiring: analyzer runs the wizard extractor, nav carries the saved brand', () => {
  expect(src('src/components/consultation/WebsiteAnalyzer.tsx')).toMatch(/invoke\('extract-website-intelligence'/);
  expect(src('src/components/consultation/StrategicConsultation.tsx')).toMatch(/return websiteFirstPrefill\(websiteAnalysis, extractedBrand\)/);
  expect(src('src/components/consultation/StrategicConsultation.tsx')).not.toMatch(/'#7C3AED'/);
  expect(src('src/pages/NewConsultation.tsx')).toMatch(/extracted_intelligence: consultationRecord\.extracted_intelligence/);
  expect(src('supabase/functions/analyze-website/index.ts')).toMatch(/sanitizeSiteAnalysis\(analysis/);
  expect(src('supabase/functions/analyze-website/index.ts')).not.toMatch(/Suggest based on/);
  expect(src('supabase/functions/generate-strategy-brief/index.ts')).toMatch(/pinStatedCopy\(structuredBrief, consultationData\)/);
});

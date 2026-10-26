import { describe, expect, test } from 'bun:test';
import { mapBriefToSections } from '../src/utils/sectionMapper';

// Minimal brief: hero case only reads headlines, subheadline, ctaText, proofPoints.
const briefWith = (overrides = {}) => ({
  headlines: { optionA: 'Grow Without The Guesswork', optionB: '', optionC: '' },
  subheadline: 'Clarity for operators who ship.',
  messagingPillars: [],
  proofPoints: { clientCount: null, yearsInBusiness: null, achievements: null, otherStats: [] },
  problemStatement: '',
  solutionStatement: '',
  tone: 'professional',
  objections: [],
  pageStructure: ['hero'],
  processSteps: null,
  testimonials: [],
  ctaText: '',
  ...overrides,
});

const consulting = (overrides = {}) => ({
  businessName: 'Hyperbrand Creative',
  industry: 'brand consulting',
  industryClassification: { variant: 'consulting', source: 'test', reasoning: 'test' },
  ...overrides,
});

const heroCta = (sections) =>
  sections.find(s => s.type === 'hero' || s.type === 'beta-hero-teaser')?.content.ctaText;

describe('hero ctaText source precedence', () => {
  test('brief.ctaText wins over consultation primaryCTA (consulting)', () => {
    const sections = mapBriefToSections(
      briefWith({ ctaText: 'Book a Working Session' }),
      consulting({ consultationData: { primaryCTA: 'Talk to Kyle' } })
    );
    expect(sections).toHaveLength(1);
    expect(heroCta(sections)).toBe('Book a Working Session');
  });

  test('consultation primaryCTA is used when brief.ctaText is empty (consulting)', () => {
    const sections = mapBriefToSections(
      briefWith({ ctaText: '' }),
      consulting({ consultationData: { primaryCTA: 'Talk to Kyle' } })
    );
    expect(heroCta(sections)).toBe('Talk to Kyle');
  });

  test('industry default only when both user sources are absent (consulting)', () => {
    const sections = mapBriefToSections(briefWith({ ctaText: '' }), consulting());
    expect(heroCta(sections)).toBe('Schedule a Conversation');
    // banned consultative string from getCtaByIndustry must never surface here
    expect(heroCta(sections)).not.toBe('Schedule Strategic Consultation');
  });

  test('non-consulting variants keep their industry default and honour user CTA', () => {
    const saas = {
      businessName: 'Shipboard',
      industry: 'saas platform',
      industryClassification: { variant: 'saas', source: 'test', reasoning: 'test' },
    };
    expect(heroCta(mapBriefToSections(briefWith({ ctaText: '' }), saas))).toBe('Start for Free');
    expect(
      heroCta(
        mapBriefToSections(
          briefWith({ ctaText: '' }),
          { ...saas, consultationData: { primaryCTA: 'Start Your Trial' } }
        )
      )
    ).toBe('Start Your Trial');
    expect(
      heroCta(
        mapBriefToSections(
          briefWith({ ctaText: 'See It Working' }),
          { ...saas, consultationData: { primaryCTA: 'Start Your Trial' } }
        )
      )
    ).toBe('See It Working');
  });
});

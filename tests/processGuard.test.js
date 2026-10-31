import { test, expect } from 'bun:test';
import { mapBriefToSections } from '../src/utils/sectionMapper';

const brief = {
  headlines: { optionA: 'AI Systems That Analyze Your Buyers', optionB: '', optionC: '' },
  subheadline: 'Strategic intelligence for high-stakes markets.',
  messagingPillars: [],
  proofPoints: { clientCount: null, yearsInBusiness: null, achievements: null, otherStats: [] },
  problemStatement: '', solutionStatement: '', tone: 'professional', objections: [],
  pageStructure: ['hero', 'how-it-works'],
  // What the brief invented on the website-first run:
  processSteps: [
    { step: 1, title: 'AI Readiness Assessment', description: 'Analyze your market position.' },
    { step: 2, title: 'Custom System Design', description: 'Build proprietary AI architecture.' },
    { step: 3, title: 'Implementation & Deployment', description: 'Deploy positioning and assets.' },
  ],
  testimonials: [], ctaText: 'Schedule a Consultation',
};
const opts = (consultationData) => ({
  businessName: 'Hyperbrand.AI', industry: 'marketing agency',
  industryClassification: { variant: 'consulting', source: 'test', reasoning: 'test' },
  consultationData,
});

test('no stated process: the brief\'s invented steps never render, and no generic fallback appears', () => {
  const sections = mapBriefToSections(brief, opts({}));
  expect(sections.find((s) => s.type === 'how-it-works')).toBeUndefined();
  expect(JSON.stringify(sections)).not.toContain('AI Readiness Assessment');
});

test('stated process (Week steps or description): the brief\'s phrasing of it renders', () => {
  const withWeeks = mapBriefToSections(brief, opts({ methodologySteps: ['Audit', 'Design', 'Launch'] }));
  expect(withWeeks.find((s) => s.type === 'how-it-works')?.content.steps).toHaveLength(3);
  const withDescription = mapBriefToSections(brief, opts({ processDescription: 'We audit, design, then launch.' }));
  expect(withDescription.find((s) => s.type === 'how-it-works')).toBeDefined();
});

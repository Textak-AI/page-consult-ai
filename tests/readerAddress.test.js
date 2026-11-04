import { expect, test } from 'bun:test';
import { mapBriefToSections } from '../src/utils/sectionMapper';

const brief = {
  headlines: { optionA: 'Fifty-Four Minutes, One Walk', optionB: 'Everything Is Built to Be Skipped. This Isn\'t', optionC: 'Come Out the Other Side' },
  subheadline: '', messagingPillars: [], proofPoints: { clientCount: null, yearsInBusiness: null, achievements: null, otherStats: [] },
  problemStatement: "They're tired of records that are collections of songs rather than a single place, and tired of being left to wander with no one guiding the walk. They want to be held inside something.",
  solutionStatement: 'Drift Off is fourteen tracks, fifty-four minutes, meant to be played straight through.',
  tone: 'warm', objections: [], pageStructure: ['hero', 'problem-solution', 'final-cta'], processSteps: null, testimonials: [], ctaText: 'Pre-save',
};
const consultationData = {
  businessName: '4DHB', industry: 'Music / Audio', industryCategory: 'Media / Entertainment', industrySubcategory: 'Music / Audio', ctaText: 'Pre-save',
  clientFrustration: brief.problemStatement,
  websiteIntelligence: { description: 'The new album from 4DHB. Out October 27, 2026.' },
};

// 4DHB run (Nov 4): the owner's audience answer landed on the page in the third person.
test('the stated challenge speaks to the reader; the stated date leads the hero and closes the page', () => {
  const sections = mapBriefToSections(brief, { businessName: '4DHB', industry: 'Music / Audio', consultationData });
  const problem = sections.find(s => s.type === 'problem-solution')?.content.problem;
  expect(problem).toMatch(/^You're tired of records/);
  expect(problem).toContain('You want to be held inside something.');
  expect(problem).not.toMatch(/\bthey\b/i);
  expect(sections[0].content.dateLine).toBe('Out October 27, 2026');
  // Creative work gets plain section labels, not consulting ones.
  const ps = sections.find(s => s.type === 'problem-solution')?.content;
  expect(ps.problemTitle).toBe('The problem');
  expect(ps.solutionTitle).toBe('What this is');
  expect(sections[sections.length - 1].content.dateLine).toBe('Out October 27, 2026');
});

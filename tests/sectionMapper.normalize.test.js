import { describe, expect, test } from 'bun:test';
import { normalizeSectionType, CANONICAL_SECTION_TYPES } from '../src/utils/sectionMapper';

describe('pageStructure section-type normalization', () => {
  test('the live consulting brief array resolves to canonical case labels', () => {
    const live = ['hero', 'process', 'testimonials', 'credentials', 'cta-final'];
    expect(live.map(normalizeSectionType)).toEqual([
      'hero',
      'how-it-works',
      'social-proof',
      'credentials-bar',
      'final-cta',
    ]);
  });

  test('every alias maps to a canonical label', () => {
    const aliases = {
      'cta-final': 'final-cta',
      cta: 'final-cta',
      process: 'how-it-works',
      testimonials: 'social-proof',
      proof: 'social-proof',
      credentials: 'credentials-bar',
      'problem/solution': 'problem-solution',
      'case-studies': 'client-results',
    };
    for (const [raw, canonical] of Object.entries(aliases)) {
      expect(normalizeSectionType(raw)).toBe(canonical);
      expect(CANONICAL_SECTION_TYPES).toContain(canonical);
    }
  });

  test('whitespace and casing are trimmed and lowercased', () => {
    expect(normalizeSectionType('  CTA-Final ')).toBe('final-cta');
    expect(normalizeSectionType('Process')).toBe('how-it-works');
  });

  test('unmatched types pass through unchanged so they drop (zero-fabrication)', () => {
    expect(normalizeSectionType('testimonialss')).toBe('testimonialss');
    expect(normalizeSectionType('video-hero')).toBe('video-hero');
    expect(normalizeSectionType('pricing')).toBe('pricing');
    expect(normalizeSectionType('case study')).toBe('case study');
  });

  test('canonical labels are returned untouched', () => {
    for (const canonical of CANONICAL_SECTION_TYPES) {
      expect(normalizeSectionType(canonical)).toBe(canonical);
    }
  });
});

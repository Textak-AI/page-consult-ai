/**
 * Premium Page Effects — ambient orbs, section tiers, dividers
 * Shared between LivePreview (editor) and PublicPageRenderer (public)
 */

export type SectionTier = 'deep' | 'elevated' | 'accent';

export function getSectionTier(sectionType: string, index: number): SectionTier {
  if (sectionType === 'hero') return 'deep';
  if (sectionType === 'final-cta') return 'deep';
  if (sectionType === 'beta-final-cta') return 'deep';
  if (sectionType === 'problem-solution') return 'accent';
  if (sectionType === 'the-real-challenge') return 'accent';
  if (sectionType === 'stakes-amplify') return 'accent';
  return index % 2 === 0 ? 'elevated' : 'deep';
}

export function getSectionSpacing(sectionType: string): 'generous' | 'compact' {
  const generous = ['hero', 'problem-solution', 'features', 'final-cta', 'beta-hero-teaser', 'beta-final-cta', 'the-real-challenge', 'our-approach', 'expertise-areas'];
  return generous.includes(sectionType) ? 'generous' : 'compact';
}

export function getSectionDivider(sectionType: string, index: number): string {
  if (index === 0) return ''; // No divider on hero
  const brandDivider = ['problem-solution', 'final-cta', 'beta-final-cta', 'the-real-challenge', 'stakes-amplify'];
  return brandDivider.includes(sectionType) ? 'section-divider-brand' : 'section-divider';
}

export interface AmbientOrbColors {
  primary: string;
  secondary: string;
  tertiary: string;
}

export function getAmbientOrbColors(industryVariant: string): AmbientOrbColors {
  switch (industryVariant) {
    case 'saas':
    case 'tech':
      return {
        primary: 'hsla(239, 84%, 67%, 0.6)',
        secondary: 'hsla(191, 91%, 43%, 0.5)',
        tertiary: 'hsla(270, 95%, 60%, 0.4)',
      };
    case 'manufacturing':
    case 'industrial':
      return {
        primary: 'hsla(213, 52%, 25%, 0.5)',
        secondary: 'hsla(38, 92%, 50%, 0.3)',
        tertiary: 'hsla(220, 9%, 34%, 0.3)',
      };
    case 'healthcare':
    case 'medical':
      return {
        primary: 'hsla(158, 64%, 40%, 0.4)',
        secondary: 'hsla(217, 91%, 60%, 0.3)',
        tertiary: 'hsla(168, 76%, 42%, 0.3)',
      };
    case 'finance':
    case 'financial':
      return {
        primary: 'hsla(213, 52%, 25%, 0.5)',
        secondary: 'hsla(158, 64%, 40%, 0.3)',
        tertiary: 'hsla(239, 84%, 67%, 0.2)',
      };
    case 'consulting':
    case 'professional':
      return {
        primary: 'hsla(25, 95%, 53%, 0.3)',
        secondary: 'hsla(220, 14%, 45%, 0.25)',
        tertiary: 'hsla(263, 70%, 65%, 0.2)',
      };
    default:
      return {
        primary: 'hsla(239, 84%, 67%, 0.5)',
        secondary: 'hsla(191, 91%, 43%, 0.4)',
        tertiary: 'hsla(270, 95%, 60%, 0.3)',
      };
  }
}

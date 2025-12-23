export interface CompletenessState {
  score: number;  // 0-100
  unlockedSections: string[];
  lockedSections: Array<{
    section: string;
    requirement: string;
    progress: string;  // "2/3 proof points"
  }>;
  nextUnlock: {
    section: string;
    hint: string;
  } | null;
  milestones: Array<{
    name: string;
    achieved: boolean;
    description: string;
  }>;
}

interface CompletenessCheck {
  field: string;
  weight: number;
  minItems?: number;
  minLength?: number;
  unlocks: string[];
  label: string;
  milestone?: string;
}

const COMPLETENESS_CHECKS: CompletenessCheck[] = [
  { field: 'companyName', weight: 8, minLength: 2, unlocks: ['hero-text'], label: 'Company name' },
  { field: 'logoUrl', weight: 12, unlocks: ['hero-brand', 'header-logo'], label: 'Logo', milestone: 'Brand Identity' },
  { field: 'industryCategory', weight: 8, unlocks: ['design-system'], label: 'Industry' },
  { field: 'primaryColor', weight: 4, unlocks: ['color-theme'], label: 'Brand color' },
  { field: 'valueProposition', weight: 12, minLength: 20, unlocks: ['hero-headline'], label: 'Value proposition', milestone: 'Core Message' },
  { field: 'proofPoints', weight: 12, minItems: 3, unlocks: ['stats-bar'], label: 'Proof points', milestone: 'Authority Signals' },
  { field: 'problemStatement', weight: 8, minLength: 20, unlocks: ['problem-solution'], label: 'Problem statement' },
  { field: 'differentiator', weight: 10, minLength: 15, unlocks: ['hero-differentiator'], label: 'Differentiator', milestone: 'Unique Angle' },
  { field: 'testimonials', weight: 10, minItems: 1, unlocks: ['social-proof'], label: 'Testimonial', milestone: 'Social Proof' },
  { field: 'services', weight: 6, minItems: 2, unlocks: ['features'], label: 'Services' },
  { field: 'faqs', weight: 6, minItems: 2, unlocks: ['faq'], label: 'FAQs' },
  { field: 'ctaText', weight: 4, minLength: 3, unlocks: ['cta-buttons'], label: 'CTA text' },
];

export function calculateCompleteness(data: any): CompletenessState {
  if (!data || typeof data !== 'object') {
    return {
      score: 0,
      unlockedSections: [],
      lockedSections: [],
      nextUnlock: null,
      milestones: []
    };
  }

  let score = 0;
  const unlockedSections: string[] = [];
  const lockedSections: Array<{ section: string; requirement: string; progress: string }> = [];
  const milestones: Array<{ name: string; achieved: boolean; description: string }> = [];
  let nextUnlock: { section: string; hint: string } | null = null;

  for (const check of COMPLETENESS_CHECKS) {
    const value = data[check.field];
    let isComplete = false;
    let progress = '';
    let currentCount = 0;

    if (check.minItems) {
      const items = Array.isArray(value) ? value : [];
      currentCount = items.filter((v: any) => {
        if (!v) return false;
        if (typeof v === 'string') return v.length > 0;
        if (typeof v === 'object') return Object.values(v).some(val => val);
        return true;
      }).length;
      isComplete = currentCount >= check.minItems;
      progress = `${currentCount}/${check.minItems}`;
    } else if (check.minLength) {
      const str = typeof value === 'string' ? value : '';
      isComplete = str.length >= check.minLength;
    } else {
      isComplete = !!value;
    }

    if (isComplete) {
      score += check.weight;
      unlockedSections.push(...check.unlocks);
      
      if (check.milestone) {
        milestones.push({
          name: check.milestone,
          achieved: true,
          description: `${check.label} added`
        });
      }
    } else {
      for (const section of check.unlocks) {
        if (!lockedSections.some(l => l.section === section)) {
          lockedSections.push({
            section,
            requirement: check.label,
            progress
          });
        }
      }

      if (check.milestone) {
        milestones.push({
          name: check.milestone,
          achieved: false,
          description: `Add ${check.label.toLowerCase()}`
        });
      }

      // Set next unlock hint (first incomplete high-weight item)
      if (!nextUnlock && check.weight >= 8) {
        const sectionName = check.unlocks[0].replace(/-/g, ' ');
        nextUnlock = {
          section: check.unlocks[0],
          hint: check.minItems 
            ? `Add ${check.minItems - currentCount} more ${check.label.toLowerCase()} to unlock ${sectionName}`
            : `Add ${check.label.toLowerCase()} to unlock ${sectionName}`
        };
      }
    }
  }

  return { score, unlockedSections, lockedSections, nextUnlock, milestones };
}

export function getSectionStatus(
  sectionType: string, 
  completeness: CompletenessState
): 'unlocked' | 'locked' | 'partial' {
  // Map section types to unlock keys
  const sectionToUnlock: Record<string, string[]> = {
    'hero': ['hero-text', 'hero-headline', 'hero-brand', 'hero-differentiator'],
    'stats-bar': ['stats-bar'],
    'problem-solution': ['problem-solution'],
    'features': ['features'],
    'social-proof': ['social-proof'],
    'faq': ['faq'],
    'final-cta': ['cta-buttons'],
  };

  const unlockKeys = sectionToUnlock[sectionType] || [sectionType];
  const unlockedCount = unlockKeys.filter(k => completeness.unlockedSections.includes(k)).length;
  
  if (unlockedCount === unlockKeys.length) return 'unlocked';
  if (unlockedCount > 0) return 'partial';
  return 'locked';
}

export function getStrengthLabel(score: number): { label: string; color: string; emoji: string } {
  if (score >= 90) return { label: 'Conversion-Ready', color: 'text-green-600', emoji: '🚀' };
  if (score >= 75) return { label: 'Strong', color: 'text-emerald-600', emoji: '💪' };
  if (score >= 50) return { label: 'Building', color: 'text-blue-600', emoji: '🔨' };
  if (score >= 25) return { label: 'Starting', color: 'text-amber-600', emoji: '🌱' };
  return { label: 'Just Beginning', color: 'text-gray-500', emoji: '✨' };
}

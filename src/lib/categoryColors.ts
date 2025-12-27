// Category color system for score panels and section editors

export interface ScoreCategory {
  id: string;
  name: string;
  color: string;
  colorLight: string;
  colorDark: string;
  tailwind: string;
  icon: string;
  sections: readonly string[];
}

export const SCORE_CATEGORIES = {
  brand: {
    id: 'brand',
    name: 'Brand Identity',
    color: '#8B5CF6',        // Purple
    colorLight: '#A78BFA',   // Purple-400
    colorDark: '#7C3AED',    // Purple-600
    tailwind: 'purple',
    icon: 'Palette',
    sections: ['hero', 'header', 'footer', 'brand-bar', 'hero-teaser'] as const,
  },
  authority: {
    id: 'authority', 
    name: 'Authority',
    color: '#3B82F6',        // Blue
    colorLight: '#60A5FA',   // Blue-400
    colorDark: '#2563EB',    // Blue-600
    tailwind: 'blue',
    icon: 'Award',
    sections: ['stats-bar', 'features', 'how-it-works', 'credentials', 'stats', 'problem-solution'] as const,
  },
  proof: {
    id: 'proof',
    name: 'Social Proof',
    color: '#10B981',        // Emerald
    colorLight: '#34D399',   // Emerald-400
    colorDark: '#059669',    // Emerald-600
    tailwind: 'emerald',
    icon: 'Users',
    sections: ['social-proof', 'testimonials', 'case-studies', 'logo-bar', 'waitlist-proof'] as const,
  },
  trust: {
    id: 'trust',
    name: 'Trust Signals',
    color: '#F59E0B',        // Amber
    colorLight: '#FBBF24',   // Amber-400
    colorDark: '#D97706',    // Amber-600
    tailwind: 'amber',
    icon: 'Shield',
    sections: ['faq', 'guarantee', 'final-cta', 'contact', 'pricing', 'calculator'] as const,
  },
} as const;

export type ScoreCategoryId = keyof typeof SCORE_CATEGORIES;

// Helper to get category from section type
export function getCategoryForSection(sectionType: string): ScoreCategoryId | null {
  for (const [categoryId, category] of Object.entries(SCORE_CATEGORIES)) {
    if ((category.sections as readonly string[]).includes(sectionType)) {
      return categoryId as ScoreCategoryId;
    }
  }
  return null;
}

// Helper to get color for section
export function getCategoryColor(sectionType: string): string {
  const categoryId = getCategoryForSection(sectionType);
  if (categoryId) {
    return SCORE_CATEGORIES[categoryId].color;
  }
  return '#64748B'; // Slate fallback
}

// Helper to get category details
export function getCategoryDetails(sectionType: string) {
  const categoryId = getCategoryForSection(sectionType);
  if (categoryId) {
    return SCORE_CATEGORIES[categoryId];
  }
  return null;
}

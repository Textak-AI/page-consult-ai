// Types for AI Consultant copy suggestions

export interface CopySuggestion {
  id: string;
  section: string;
  field: string;
  currentValue: string;
  suggestedValue: string;
  reasoning: string;
  impact: 'high' | 'medium' | 'low';
  status: 'pending' | 'accepted' | 'modified' | 'skipped';
}

export interface ConsultantResponse {
  summary: string;
  suggestions: CopySuggestion[];
  triggerType: string;
}

export interface ConsultantContext {
  companyName?: string;
  industry?: string;
  valueProposition?: string;
  targetAudience?: string;
  pageGoal?: string;
}

export interface ConsultantRequest {
  triggerType: string;
  newData: Record<string, unknown>;
  currentSections: Array<{
    type: string;
    content: Record<string, unknown>;
  }>;
  fullContext: ConsultantContext;
}

export const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero Section',
  'hero-teaser': 'Hero Teaser',
  'stats-bar': 'Stats Bar',
  'problem-solution': 'Problem/Solution',
  features: 'Features',
  'social-proof': 'Social Proof',
  'how-it-works': 'How It Works',
  faq: 'FAQ',
  'final-cta': 'Call to Action',
  'credibility-strip': 'Credibility Strip',
  'founder-credibility': 'Founder Story',
};

export const IMPACT_STYLES = {
  high: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  medium: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  low: 'bg-muted text-muted-foreground border-border',
};

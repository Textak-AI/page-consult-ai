/**
 * AI SEO Score Calculator
 * Calculates a 0-100 score based on AI discoverability factors
 */

import type { AISeoData, FAQItem, AuthoritySignal, QueryTarget } from '@/services/intelligence/types';

export interface Recommendation {
  id: string;
  category: 'schema' | 'faq' | 'authority' | 'content' | 'queries';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  autoFixAvailable: boolean;
  currentValue?: string;
  suggestedValue?: string;
}

export interface CategoryScore {
  score: number;
  max: number;
  details: string;
}

export interface AISeoScoreBreakdown {
  schema: CategoryScore;
  faq: CategoryScore;
  authoritySignals: CategoryScore;
  contentStructure: CategoryScore;
  queryAlignment: CategoryScore;
}

export interface AISeoScoreResult {
  overall: number;
  breakdown: AISeoScoreBreakdown;
  recommendations: Recommendation[];
}

interface PageContent {
  headline?: string;
  subheadline?: string;
  hasTestimonials?: boolean;
  testimonialCount?: number;
  sections?: Array<{ type: string; content?: unknown }>;
}

/**
 * Calculate the full AI SEO score
 */
export function calculateAISeoScore(
  aiSeoData: AISeoData | null | undefined,
  pageContent?: PageContent
): AISeoScoreResult {
  const recommendations: Recommendation[] = [];
  
  // Calculate each category
  const schemaScore = calculateSchemaScore(aiSeoData, pageContent, recommendations);
  const faqScore = calculateFAQScore(aiSeoData?.faqItems, recommendations);
  const authorityScore = calculateAuthorityScore(aiSeoData?.authoritySignals, recommendations);
  const contentScore = calculateContentScore(aiSeoData, pageContent, recommendations);
  const queryScore = calculateQueryScore(aiSeoData?.queryTargets, recommendations);
  
  const breakdown: AISeoScoreBreakdown = {
    schema: schemaScore,
    faq: faqScore,
    authoritySignals: authorityScore,
    contentStructure: contentScore,
    queryAlignment: queryScore,
  };
  
  const overall = schemaScore.score + faqScore.score + authorityScore.score + 
                  contentScore.score + queryScore.score;
  
  // Sort recommendations by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return { overall, breakdown, recommendations };
}

/**
 * Schema scoring (25 points max)
 */
function calculateSchemaScore(
  aiSeoData: AISeoData | null | undefined,
  pageContent: PageContent | undefined,
  recommendations: Recommendation[]
): CategoryScore {
  let score = 0;
  const details: string[] = [];
  
  if (!aiSeoData?.entity) {
    recommendations.push({
      id: 'no-entity',
      category: 'schema',
      priority: 'high',
      title: 'Generate AI SEO data',
      description: 'Your page lacks structured entity data. AI assistants cannot properly identify your business.',
      autoFixAvailable: false,
    });
    return { score: 0, max: 25, details: 'No entity data available' };
  }
  
  // Entity type present: 5 pts
  if (aiSeoData.entity.type) {
    score += 5;
    details.push('Entity type defined');
  } else {
    recommendations.push({
      id: 'missing-entity-type',
      category: 'schema',
      priority: 'high',
      title: 'Define entity type',
      description: 'Specify your business entity type (e.g., ProfessionalService, LocalBusiness) for better AI recognition.',
      autoFixAvailable: false,
    });
  }
  
  // Name + description: 5 pts
  if (aiSeoData.entity.name && aiSeoData.entity.description) {
    score += 5;
    details.push('Name and description complete');
  } else {
    if (!aiSeoData.entity.name) {
      recommendations.push({
        id: 'missing-entity-name',
        category: 'schema',
        priority: 'high',
        title: 'Add entity name',
        description: 'Your business needs a clear name for AI assistants to reference.',
        autoFixAvailable: false,
      });
    }
    if (!aiSeoData.entity.description) {
      recommendations.push({
        id: 'missing-entity-description',
        category: 'schema',
        priority: 'medium',
        title: 'Add entity description',
        description: 'A clear description helps AI assistants understand and cite your business accurately.',
        autoFixAvailable: true,
        suggestedValue: 'Generate description from consultation data',
      });
    }
  }
  
  // Offers/services defined: 5 pts (check from page content sections)
  const hasServices = pageContent?.sections?.some(s => 
    s.type === 'features' || s.type === 'services'
  );
  if (hasServices) {
    score += 5;
    details.push('Services/offers defined');
  } else {
    recommendations.push({
      id: 'missing-offers',
      category: 'schema',
      priority: 'medium',
      title: 'Add service/offer details',
      description: 'Define your services with clear offers to help AI assistants recommend you.',
      autoFixAvailable: false,
    });
  }
  
  // Reviews/testimonials: 5 pts
  if (pageContent?.hasTestimonials && (pageContent.testimonialCount || 0) > 0) {
    score += 5;
    details.push('Testimonials included');
  } else {
    recommendations.push({
      id: 'missing-testimonials',
      category: 'schema',
      priority: 'high',
      title: 'Add customer testimonials',
      description: 'Pages with testimonials get 2.5x more AI citations. Add at least 2 testimonials with names and roles.',
      autoFixAvailable: false,
    });
  }
  
  // Area served: 5 pts
  if (aiSeoData.entity.areaServed) {
    score += 5;
    details.push('Service area defined');
  } else {
    recommendations.push({
      id: 'missing-area-served',
      category: 'schema',
      priority: 'low',
      title: 'Specify service area',
      description: 'Define your geographic service area for location-based AI queries.',
      autoFixAvailable: true,
      suggestedValue: 'Extract from consultation location data',
    });
  }
  
  return { 
    score, 
    max: 25, 
    details: details.length > 0 ? details.join(', ') : 'Missing entity data' 
  };
}

/**
 * FAQ scoring (20 points max)
 */
function calculateFAQScore(
  faqItems: FAQItem[] | undefined,
  recommendations: Recommendation[]
): CategoryScore {
  let score = 0;
  const details: string[] = [];
  const faqCount = faqItems?.length || 0;
  
  // FAQ count scoring
  if (faqCount >= 5) {
    score += 15;
    details.push(`${faqCount} FAQ items`);
  } else if (faqCount >= 3) {
    score += 10;
    details.push(`${faqCount} FAQ items`);
    recommendations.push({
      id: 'few-faqs',
      category: 'faq',
      priority: 'medium',
      title: 'Add more FAQ items',
      description: `You have ${faqCount} FAQs. AI assistants favor pages with 5+ FAQs. Consider adding common objections as questions.`,
      autoFixAvailable: true,
      suggestedValue: `Generate ${5 - faqCount} more FAQs from consultation data`,
    });
  } else if (faqCount >= 1) {
    score += 5;
    details.push(`${faqCount} FAQ items`);
    recommendations.push({
      id: 'insufficient-faqs',
      category: 'faq',
      priority: 'high',
      title: 'Expand FAQ section',
      description: 'Your FAQ section is too small. Add at least 5 FAQs covering common questions, objections, and process details.',
      autoFixAvailable: true,
      suggestedValue: `Generate ${5 - faqCount} more FAQs from consultation data`,
    });
  } else {
    recommendations.push({
      id: 'no-faqs',
      category: 'faq',
      priority: 'high',
      title: 'Create FAQ section',
      description: 'FAQ pages are 3x more likely to be cited by AI assistants. Add a structured FAQ section.',
      autoFixAvailable: true,
      suggestedValue: 'Generate 5 FAQs from consultation data',
    });
  }
  
  // FAQ schema markup: 5 pts (assumed if FAQs exist, they have schema)
  if (faqCount > 0) {
    score += 5;
    details.push('FAQ schema included');
  }
  
  return { 
    score, 
    max: 20, 
    details: details.length > 0 ? details.join(', ') : 'No FAQ content' 
  };
}

/**
 * Authority signals scoring (20 points max)
 */
function calculateAuthorityScore(
  signals: AuthoritySignal[] | undefined,
  recommendations: Recommendation[]
): CategoryScore {
  let score = 0;
  const details: string[] = [];
  
  if (!signals || signals.length === 0) {
    recommendations.push({
      id: 'no-authority-signals',
      category: 'authority',
      priority: 'high',
      title: 'Add credibility signals',
      description: 'Your page lacks concrete statistics or credentials. AI assistants prefer pages with verifiable claims.',
      autoFixAvailable: false,
    });
    return { score: 0, max: 20, details: 'No authority signals' };
  }
  
  // At least 1 statistic: 5 pts
  const hasStatistic = signals.some(s => s.type === 'statistic');
  if (hasStatistic) {
    score += 5;
    details.push('Statistics included');
  } else {
    recommendations.push({
      id: 'no-statistics',
      category: 'authority',
      priority: 'medium',
      title: 'Add specific statistics',
      description: 'Include measurable results (e.g., "200+ projects completed", "98% satisfaction rate").',
      autoFixAvailable: false,
    });
  }
  
  // At least 1 achievement/credential: 5 pts
  const hasCredential = signals.some(s => 
    s.type === 'credential' || s.type === 'achievement'
  );
  if (hasCredential) {
    score += 5;
    details.push('Credentials present');
  } else {
    recommendations.push({
      id: 'no-credentials',
      category: 'authority',
      priority: 'medium',
      title: 'Highlight credentials',
      description: 'Add professional certifications, awards, or notable achievements.',
      autoFixAvailable: false,
    });
  }
  
  // Specific numbers present: 5 pts
  const hasNumbers = signals.some(s => s.numbers && s.numbers.length > 0);
  if (hasNumbers) {
    score += 5;
    details.push('Specific numbers');
  } else {
    recommendations.push({
      id: 'vague-claims',
      category: 'authority',
      priority: 'medium',
      title: 'Add specific numbers',
      description: 'Replace vague claims with specific numbers. "Many clients" → "150+ clients since 2019".',
      autoFixAvailable: true,
      suggestedValue: 'Enhance claims with specific numbers',
    });
  }
  
  // Source citations: 5 pts (check if signals have comparison or external validation)
  const hasComparison = signals.some(s => s.type === 'comparison');
  if (hasComparison) {
    score += 5;
    details.push('Comparative claims');
  } else {
    recommendations.push({
      id: 'no-comparisons',
      category: 'authority',
      priority: 'low',
      title: 'Add comparative statements',
      description: 'Comparative claims like "3x faster" or "50% more cost-effective" increase AI citation likelihood.',
      autoFixAvailable: false,
    });
  }
  
  return { 
    score, 
    max: 20, 
    details: details.join(', ') 
  };
}

/**
 * Content structure scoring (20 points max)
 */
function calculateContentScore(
  aiSeoData: AISeoData | null | undefined,
  pageContent: PageContent | undefined,
  recommendations: Recommendation[]
): CategoryScore {
  let score = 0;
  const details: string[] = [];
  
  const headline = pageContent?.headline || '';
  const subheadline = pageContent?.subheadline || '';
  
  // Answer-first headlines: 5 pts
  // Headlines that start with what the user gets are "answer-first"
  const isAnswerFirst = headline && (
    headline.toLowerCase().startsWith('get ') ||
    headline.toLowerCase().startsWith('build ') ||
    headline.toLowerCase().startsWith('create ') ||
    headline.toLowerCase().startsWith('transform ') ||
    headline.toLowerCase().startsWith('complete ') ||
    headline.includes(':') // "Brand Strategy: Complete systems..."
  );
  if (isAnswerFirst) {
    score += 5;
    details.push('Answer-first headline');
  } else if (headline) {
    recommendations.push({
      id: 'weak-headline',
      category: 'content',
      priority: 'high',
      title: 'Make headline more direct',
      description: 'Start your headline with what the customer gets. AI assistants prefer direct, answer-first content.',
      autoFixAvailable: true,
      currentValue: headline.slice(0, 50),
      suggestedValue: 'Rewrite to start with the outcome or benefit',
    });
  }
  
  // Specific claims (not vague): 5 pts
  const hasSpecificClaims = (headline + ' ' + subheadline).match(/\d+[%+]?|\$[\d,]+|[0-9]+ (days?|weeks?|months?|hours?)/i);
  if (hasSpecificClaims) {
    score += 5;
    details.push('Specific claims');
  } else {
    recommendations.push({
      id: 'vague-headline',
      category: 'content',
      priority: 'high',
      title: 'Make headline more specific',
      description: 'Your headline uses vague language. Specific claims with numbers get cited more often.',
      autoFixAvailable: true,
      currentValue: headline.slice(0, 50),
      suggestedValue: 'Add specific numbers, timeframes, or measurable outcomes',
    });
  }
  
  // Comparative statements: 5 pts
  const hasComparative = (headline + ' ' + subheadline).match(/(faster|better|more|less|than|vs\.?|compared)/i);
  if (hasComparative) {
    score += 5;
    details.push('Comparative content');
  }
  
  // Clear entity identification: 5 pts
  if (aiSeoData?.entity?.name && aiSeoData?.entity?.type) {
    score += 5;
    details.push('Clear entity');
  } else {
    recommendations.push({
      id: 'unclear-entity',
      category: 'content',
      priority: 'medium',
      title: 'Clarify your business identity',
      description: 'Make it immediately clear what type of business you are and what you do.',
      autoFixAvailable: false,
    });
  }
  
  if (details.length === 0) {
    details.push('Content needs optimization');
  }
  
  return { 
    score, 
    max: 20, 
    details: details.join(', ') 
  };
}

/**
 * Query alignment scoring (15 points max)
 */
function calculateQueryScore(
  queries: QueryTarget[] | undefined,
  recommendations: Recommendation[]
): CategoryScore {
  let score = 0;
  const details: string[] = [];
  
  if (!queries || queries.length === 0) {
    recommendations.push({
      id: 'no-query-targets',
      category: 'queries',
      priority: 'medium',
      title: 'Identify target queries',
      description: 'Define the questions people ask AI assistants that should lead to your page.',
      autoFixAvailable: true,
      suggestedValue: 'Generate target queries from consultation data',
    });
    return { score: 0, max: 15, details: 'No target queries' };
  }
  
  // High-priority queries targeted: 5 pts
  const highPriority = queries.filter(q => q.priority === 'high');
  if (highPriority.length > 0) {
    score += 5;
    details.push(`${highPriority.length} high-priority queries`);
  } else {
    recommendations.push({
      id: 'no-high-priority-queries',
      category: 'queries',
      priority: 'medium',
      title: 'Add high-priority queries',
      description: 'Identify the most important questions your ideal customers ask.',
      autoFixAvailable: false,
    });
  }
  
  // Medium-priority queries: 5 pts
  const mediumPriority = queries.filter(q => q.priority === 'medium');
  if (mediumPriority.length > 0) {
    score += 5;
    details.push(`${mediumPriority.length} medium-priority queries`);
  }
  
  // Query intent coverage: 5 pts (both informational and transactional)
  const hasInformational = queries.some(q => q.intent === 'informational');
  const hasTransactional = queries.some(q => q.intent === 'transactional');
  if (hasInformational && hasTransactional) {
    score += 5;
    details.push('Full intent coverage');
  } else {
    const missing = !hasInformational ? 'informational' : 'transactional';
    recommendations.push({
      id: `missing-${missing}-queries`,
      category: 'queries',
      priority: 'low',
      title: `Add ${missing} queries`,
      description: `Your page only targets ${!hasInformational ? 'transactional' : 'informational'} queries. Add ${missing} queries for broader coverage.`,
      autoFixAvailable: false,
    });
  }
  
  return { 
    score, 
    max: 15, 
    details: details.join(', ') 
  };
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): {
  text: string;
  bg: string;
  gradient: string;
} {
  if (score >= 80) {
    return {
      text: 'text-cyan-400',
      bg: 'bg-cyan-500',
      gradient: 'from-cyan-400 to-cyan-600',
    };
  } else if (score >= 50) {
    return {
      text: 'text-amber-400',
      bg: 'bg-amber-500',
      gradient: 'from-amber-400 to-amber-600',
    };
  } else {
    return {
      text: 'text-red-400',
      bg: 'bg-red-500',
      gradient: 'from-red-400 to-red-600',
    };
  }
}

/**
 * Get priority badge styling
 */
export function getPriorityStyles(priority: 'high' | 'medium' | 'low'): {
  text: string;
  bg: string;
} {
  switch (priority) {
    case 'high':
      return { text: 'text-red-400', bg: 'bg-red-500/20' };
    case 'medium':
      return { text: 'text-amber-400', bg: 'bg-amber-500/20' };
    case 'low':
      return { text: 'text-slate-400', bg: 'bg-slate-500/20' };
  }
}

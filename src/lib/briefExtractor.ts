/**
 * INTELLIGENT BRIEF EXTRACTION
 * 
 * This module extracts and prioritizes content from the strategy brief
 * to maximize the quality of rendered sections.
 */

// ============================================
// TYPES
// ============================================

export interface AuthoritySignal {
  value: string;
  label: string;
  type: 'stat' | 'credential' | 'result' | 'social-proof';
  strength: number;
}

export interface StatBarItem {
  value: string;
  label: string;
}

export interface HeadlineSelection {
  primary: string;
  secondary: string;
  reasoning: string;
}

export interface RankedTestimonial {
  quote: string;
  author: string;
  title: string;
  score: number;
}

export interface OptimizedFAQ {
  question: string;
  answer: string;
  category: 'trust' | 'process' | 'pricing' | 'results' | 'general';
}

export interface EnhancedPillar {
  title: string;
  description: string;
  icon: string;
  hook?: string;
  proofPoint?: string;
}

// ============================================
// HEADLINE SELECTION
// ============================================

export function selectBestHeadline(
  headlines: { optionA: string; optionB: string; optionC: string },
  pageGoal: string,
  audienceProfile?: string
): HeadlineSelection {
  /**
   * Selection logic:
   * - book-meetings / consultations → Problem-focused (optionB) - creates urgency
   * - generate-leads / signups → Direct benefit (optionA) - clear value
   * - sales / purchases → Outcome-focused (optionC) - envision result
   * - Default: Direct benefit (optionA)
   */
  
  const goalMap: Record<string, 'optionA' | 'optionB' | 'optionC'> = {
    'book-meetings': 'optionB',
    'consultation': 'optionB',
    'generate-leads': 'optionA',
    'capture-emails': 'optionA',
    'sales': 'optionC',
    'purchase': 'optionC',
    'demo': 'optionA',
  };

  const normalizedGoal = pageGoal?.toLowerCase().replace(/[^a-z-]/g, '') || '';
  const primaryKey = goalMap[normalizedGoal] || 'optionA';
  const primary = headlines[primaryKey];
  
  const secondaryKey = primaryKey === 'optionA' ? 'optionB' : 'optionA';
  const secondary = headlines[secondaryKey];

  console.log('🧠 [briefExtractor] Headline selection:', primaryKey, 'for goal:', pageGoal);

  return {
    primary,
    secondary,
    reasoning: `Selected ${primaryKey} for goal: ${pageGoal}`,
  };
}

// ============================================
// AUTHORITY SIGNAL EXTRACTION
// ============================================

export function extractAuthoritySignals(
  proofPoints: {
    clientCount?: string | null;
    yearsInBusiness?: string | null;
    achievements?: string | null;
    otherStats?: string[];
  },
  aiSearchOptimization?: { authoritySignals?: string[] }
): AuthoritySignal[] {
  const signals: AuthoritySignal[] = [];

  // Extract from clientCount
  if (proofPoints?.clientCount) {
    const match = proofPoints.clientCount.match(/(\d+[\d,]*\+?)/);
    if (match) {
      signals.push({
        value: match[1],
        label: extractLabelFromString(proofPoints.clientCount, 'Clients Served'),
        type: 'stat',
        strength: 8,
      });
    }
  }

  // Extract from yearsInBusiness
  if (proofPoints?.yearsInBusiness) {
    const match = proofPoints.yearsInBusiness.match(/(\d+\+?)/);
    if (match) {
      signals.push({
        value: match[1],
        label: 'Years Experience',
        type: 'credential',
        strength: 7,
      });
    }
  }

  // Extract from otherStats
  if (proofPoints?.otherStats && Array.isArray(proofPoints.otherStats)) {
    proofPoints.otherStats.forEach(stat => {
      // Percentage results are strongest
      const percentMatch = stat.match(/(\d+%)\s+(.+)/i);
      if (percentMatch) {
        signals.push({
          value: percentMatch[1],
          label: percentMatch[2],
          type: 'result',
          strength: 9,
        });
        return;
      }

      // Numeric stats
      const numMatch = stat.match(/^([\d,.$%]+[KMB+]?)\s+(.+)$/i);
      if (numMatch) {
        signals.push({
          value: numMatch[1],
          label: numMatch[2],
          type: 'stat',
          strength: 7,
        });
      }
    });
  }

  // Extract from AI Search Optimization if available
  if (aiSearchOptimization?.authoritySignals) {
    aiSearchOptimization.authoritySignals.forEach((signal: string) => {
      const numMatch = signal.match(/(\d+[\d,]*[%+]?)/);
      if (numMatch) {
        const exists = signals.some(s => s.value === numMatch[1]);
        if (!exists) {
          signals.push({
            value: numMatch[1],
            label: signal.replace(numMatch[1], '').trim(),
            type: 'social-proof',
            strength: 6,
          });
        }
      }
    });
  }

  // Sort by strength (highest first)
  const sorted = signals.sort((a, b) => b.strength - a.strength);
  
  console.log('🧠 [briefExtractor] Extracted', sorted.length, 'authority signals');
  
  return sorted;
}

function extractLabelFromString(fullString: string, fallback: string): string {
  const cleaned = fullString.replace(/[\d,+]+\s*/, '').trim();
  return cleaned || fallback;
}

// ============================================
// STATS BAR OPTIMIZATION
// ============================================

export function getOptimalStatsBar(
  signals: AuthoritySignal[],
  maxStats: number = 4
): StatBarItem[] {
  /**
   * Stats bar strategy:
   * 1. Lead with strongest result (usually a percentage)
   * 2. Include experience/credibility stat
   * 3. Include volume/scale stat
   * 4. Vary the types for visual interest
   */

  const stats: StatBarItem[] = [];
  const usedTypes = new Set<string>();

  // First: Get the strongest result-type signal
  const resultSignal = signals.find(s => s.type === 'result');
  if (resultSignal) {
    stats.push({ value: resultSignal.value, label: resultSignal.label });
    usedTypes.add('result');
  }

  // Then: Fill with other high-strength signals, varying types
  for (const signal of signals) {
    if (stats.length >= maxStats) break;
    if (stats.some(s => s.value === signal.value)) continue;
    
    if (!usedTypes.has(signal.type) || stats.length < 2) {
      stats.push({ value: signal.value, label: signal.label });
      usedTypes.add(signal.type);
    }
  }

  // If we still need more, add remaining high-strength signals
  for (const signal of signals) {
    if (stats.length >= maxStats) break;
    if (!stats.some(s => s.value === signal.value)) {
      stats.push({ value: signal.value, label: signal.label });
    }
  }

  console.log('🧠 [briefExtractor] Optimal stats bar:', stats.length, 'items');

  return stats;
}

// ============================================
// TESTIMONIAL RANKING
// ============================================

export function rankTestimonials(
  testimonials: Array<{ quote: string; author: string; title: string }>
): RankedTestimonial[] {
  /**
   * Testimonial ranking criteria:
   * - Contains specific numbers/results (+3)
   * - Has credible title (VP, Director, CEO) (+2)
   * - Mentions transformation/change (+1)
   * - Is concise (<150 chars) (+1)
   * - Has company name (+1)
   */

  if (!testimonials || testimonials.length === 0) {
    return [];
  }

  const ranked = testimonials
    .map(t => {
      let score = 0;
      
      if (/\d+%|\d+x|\$[\d,]+/.test(t.quote)) score += 3;
      if (/VP|Director|CEO|President|Chief|Head of/i.test(t.title)) score += 2;
      if (/transform|changed|improved|increased|reduced|saved/i.test(t.quote)) score += 1;
      if (t.quote.length < 150) score += 1;
      if (t.title.includes(',') || /at\s+\w+/i.test(t.title)) score += 1;

      return { ...t, score };
    })
    .sort((a, b) => b.score - a.score);

  console.log('🧠 [briefExtractor] Ranked', ranked.length, 'testimonials');

  return ranked;
}

// ============================================
// FAQ OPTIMIZATION
// ============================================

export function optimizeFAQs(
  objections: Array<{ question: string; answer: string }>,
  maxFAQs: number = 6
): OptimizedFAQ[] {
  /**
   * FAQ optimization:
   * - Categorize by type
   * - Ensure variety (don't have 3 pricing questions)
   * - Prioritize trust and results questions
   */

  if (!objections || objections.length === 0) {
    return [];
  }

  const categorized = objections.map(obj => {
    let category: OptimizedFAQ['category'] = 'general';
    
    const q = obj.question.toLowerCase();
    if (/price|cost|afford|expensive|pay|investment/i.test(q)) category = 'pricing';
    else if (/how.*work|process|steps|timeline|long/i.test(q)) category = 'process';
    else if (/result|guarantee|outcome|expect|roi|return/i.test(q)) category = 'results';
    else if (/trust|different|why.*you|risk|safe/i.test(q)) category = 'trust';

    return { ...obj, category };
  });

  const priority = ['trust', 'results', 'process', 'pricing', 'general'];
  
  const sorted = categorized.sort((a, b) => {
    return priority.indexOf(a.category) - priority.indexOf(b.category);
  });

  const selected: OptimizedFAQ[] = [];
  const categoryCount: Record<string, number> = {};

  for (const faq of sorted) {
    if (selected.length >= maxFAQs) break;
    
    const count = categoryCount[faq.category] || 0;
    if (count < 2) {
      selected.push(faq);
      categoryCount[faq.category] = count + 1;
    }
  }

  console.log('🧠 [briefExtractor] Optimized', selected.length, 'FAQs');

  return selected;
}

// ============================================
// MESSAGING PILLAR ENHANCEMENT
// ============================================

export function enhanceMessagingPillars(
  pillars: Array<{ title: string; description: string; icon: string }>,
  authoritySignals: AuthoritySignal[]
): EnhancedPillar[] {
  /**
   * Pillar enhancement:
   * - Add a scannable hook (first sentence or key phrase)
   * - Match with relevant proof point if available
   */

  if (!pillars || pillars.length === 0) {
    return [];
  }

  return pillars.map((pillar) => {
    const firstSentence = pillar.description.split(/[.!?]/)[0];
    const hook = firstSentence.length > 60 
      ? firstSentence.substring(0, 57) + '...'
      : firstSentence;

    const relevantSignal = authoritySignals.find(signal => {
      const combined = `${pillar.title} ${pillar.description}`.toLowerCase();
      const signalWords = signal.label.toLowerCase().split(' ');
      return signalWords.some(word => word.length > 3 && combined.includes(word));
    });

    return {
      ...pillar,
      hook,
      proofPoint: relevantSignal 
        ? `${relevantSignal.value} ${relevantSignal.label}`
        : undefined,
    };
  });
}

// ============================================
// SECTION HEADER INTELLIGENCE
// ============================================

export function getIntelligentSectionHeaders(
  industryVariant: string,
  tone?: string,
  companyName?: string
): Record<string, { title: string; subtitle: string }> {
  const baseHeaders: Record<string, Record<string, { title: string; subtitle: string }>> = {
    consulting: {
      features: { title: 'How We Help', subtitle: 'Expertise that drives real results' },
      process: { title: 'How We Work Together', subtitle: 'A collaborative approach to your success' },
      proof: { title: 'Results That Speak', subtitle: 'What our clients have achieved' },
      faq: { title: 'Questions We Often Hear', subtitle: '' },
      cta: { title: "Let's Start a Conversation", subtitle: 'Free consultation • No obligation' },
    },
    manufacturing: {
      features: { title: 'Operational Capabilities', subtitle: 'Proven solutions for complex challenges' },
      process: { title: 'Engagement Framework', subtitle: 'From assessment to implementation' },
      proof: { title: 'Proven Impact', subtitle: 'Measurable results across industries' },
      faq: { title: 'Common Questions', subtitle: '' },
      cta: { title: 'Start Your Assessment', subtitle: 'Free operational analysis' },
    },
    healthcare: {
      features: { title: 'How We Care For You', subtitle: 'Compassionate support at every step' },
      process: { title: 'Your Journey With Us', subtitle: 'What to expect when you visit' },
      proof: { title: 'Why Families Trust Us', subtitle: '' },
      faq: { title: 'Common Questions', subtitle: '' },
      cta: { title: "We're Here For You", subtitle: 'Schedule a consultation' },
    },
    finance: {
      features: { title: 'Our Approach', subtitle: 'Disciplined strategies for lasting wealth' },
      process: { title: 'Investment Process', subtitle: 'Rigorous methodology' },
      proof: { title: 'Performance Track Record', subtitle: 'Results that speak' },
      faq: { title: 'Investment Questions', subtitle: '' },
      cta: { title: 'Discuss Your Portfolio', subtitle: 'Schedule a consultation' },
    },
    tech: {
      features: { title: 'Platform Features', subtitle: 'Everything you need to succeed' },
      process: { title: 'How It Works', subtitle: 'Get started in minutes' },
      proof: { title: 'Trusted By', subtitle: 'Join thousands of happy customers' },
      faq: { title: 'Frequently Asked Questions', subtitle: '' },
      cta: { title: 'Ready to Get Started?', subtitle: 'Start your free trial today' },
    },
    creative: {
      features: { title: 'What We Do', subtitle: '' },
      process: { title: 'Our Process', subtitle: '' },
      proof: { title: 'Selected Work', subtitle: '' },
      faq: { title: 'FAQ', subtitle: '' },
      cta: { title: "Let's Create", subtitle: 'Start a project' },
    },
  };

  const headers = baseHeaders[industryVariant] || baseHeaders.tech;
  
  console.log('🧠 [briefExtractor] Using section headers for:', industryVariant);
  
  return headers;
}

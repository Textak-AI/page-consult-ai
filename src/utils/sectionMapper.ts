/**
 * Brief-First Section Mapper with Intelligent Extraction
 * 
 * CRITICAL RULES:
 * - NO FABRICATION: Never generate content not in the structuredBrief
 * - NO TEMPLATE DEFAULTS: Don't inject placeholder stats, features, or testimonials
 * - STRICT STRUCTURE: Only render sections listed in pageStructure array, in exact order
 * - PROOF POINTS ONLY: Stats bar shows only values from proofPoints
 * - INDUSTRY-AWARE: Apply industry-specific headers and styling
 * - INTELLIGENT EXTRACTION: Use briefExtractor for optimized content selection
 */

import { 
  detectIndustryVariant, 
  getIndustryTokens, 
  type IndustryVariant,
  type IndustryDesignTokens 
} from '@/config/designSystem/industryVariants';
import type { AuthoritySignal } from '@/lib/briefExtractor';
import {
  selectBestHeadline,
  extractAuthoritySignals,
  getOptimalStatsBar,
  rankTestimonials,
  optimizeFAQs,
  enhanceMessagingPillars,
  getIntelligentSectionHeaders,
} from '@/lib/briefExtractor';

// Type definitions
export interface StructuredBrief {
  headlines: {
    optionA: string;
    optionB: string;
    optionC: string;
  };
  subheadline: string;
  messagingPillars: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  proofPoints: {
    clientCount: string | null;
    yearsInBusiness: string | null;
    achievements: string | null;
    otherStats: string[];
  };
  problemStatement: string;
  solutionStatement: string;
  tone: "professional" | "friendly" | "authoritative" | "warm" | "confident";
  objections: Array<{
    question: string;
    answer: string;
  }>;
  pageStructure: string[];
  processSteps: Array<{
    step: number;
    title: string;
    description: string;
  }> | null;
  testimonials: Array<{
    quote: string;
    author: string;
    title: string;
  }>;
  ctaText: string;
}

export interface Section {
  type: string;
  order: number;
  visible: boolean;
  content: any;
}

export interface MapBriefOptions {
  heroImageUrl?: string;
  businessName: string;
  logoUrl?: string | null;
  primaryColor?: string;
  pageType?: string | null;
  pageGoal?: string;
  industry?: string;
  serviceType?: string;
  // Support both string[] (legacy) and AISeoData.authoritySignals structure
  aiSearchOptimization?: {
    authoritySignals?: Array<string | { raw?: string; optimized?: string; type?: string }>;
    entity?: { type?: string; name?: string };
  } | null;
}

/**
 * Check if a testimonial is a placeholder (contains brackets or generic markers)
 */
function isPlaceholderTestimonial(testimonial: { author: string; quote: string }): boolean {
  const text = `${testimonial.author} ${testimonial.quote}`;
  return text.includes('[') || text.includes(']') || 
         text.includes('Client Name') || 
         text.includes('will be added');
}

/**
 * Extract primary credential from achievements string for trust badge
 * Looks for patterns like "Certified Speaking Professional", "CSP", "25+ years", etc.
 */
function extractPrimaryCredential(achievements: string | null | undefined): string | null {
  if (!achievements) return null;
  
  // Priority patterns - look for credentials first
  const patterns = [
    /Certified[^,.]+(?=,|\.|$)/i,           // "Certified Speaking Professional"
    /\bCSP\b/,                               // CSP designation
    /\bCPA\b/,                               // CPA
    /\bMBA\b/,                               // MBA
    /\bPhD\b/i,                              // PhD
    /Author of[^,.]+/i,                      // "Author of..."
    /\d+\+?\s*years?[^,.]+/i,               // "25+ years experience"
    /Fortune\s*\d+[^,.]+/i,                  // "Fortune 500 clients"
  ];
  
  for (const pattern of patterns) {
    const match = achievements.match(pattern);
    if (match) {
      const credential = match[0].trim();
      // Clean up trailing punctuation
      return credential.replace(/[,.]$/, '').trim();
    }
  }
  
  // Fallback: first segment before comma if it's short enough
  const firstSegment = achievements.split(/[,.]/)[0]?.trim();
  if (firstSegment && firstSegment.length < 50 && firstSegment.length > 3) {
    return firstSegment;
  }
  
  return null;
}

/**
 * Maps a structuredBrief to Section[] array using intelligent extraction.
 * SINGLE SOURCE OF TRUTH: Only data from the brief is rendered.
 * INDUSTRY-AWARE: Applies industry-specific headers and styling.
 */
export function mapBriefToSections(
  brief: StructuredBrief,
  options: MapBriefOptions
): Section[] {
  console.log('🧠 [sectionMapper] Starting intelligent extraction');
  console.log('🧠 [sectionMapper] options:', JSON.stringify(options, null, 2));
  
  const { businessName, heroImageUrl, logoUrl, primaryColor, pageType, pageGoal, industry, serviceType, aiSearchOptimization } = options;
  const sections: Section[] = [];
  const pageStructure = brief.pageStructure || [];
  
  const isBetaPage = pageType === 'beta-prelaunch';
  
  // Detect industry variant for styling and headers
  const industryVariant = detectIndustryVariant(industry, serviceType, pageType);
  const industryTokens = getIndustryTokens(industryVariant);
  const isConsulting = industryVariant === 'consulting';
  
  // Extract authority signals once (used by multiple sections)
  const authoritySignals = extractAuthoritySignals(
    brief.proofPoints || {},
    aiSearchOptimization
  );
  
  // Get intelligent section headers based on industry
  const intelligentHeaders = getIntelligentSectionHeaders(
    industryVariant,
    brief.tone,
    businessName
  );
  
  console.log('🧠 [sectionMapper] Industry variant:', industryVariant);
  console.log('🧠 [sectionMapper] Authority signals:', authoritySignals.length);
  console.log('🧠 [sectionMapper] Page structure:', pageStructure);
  console.log('🧠 [sectionMapper] isBetaPage:', isBetaPage);

  // Iterate through pageStructure and build sections in EXACT order
  for (const sectionType of pageStructure) {
    const order = sections.length;
    console.log('🎯 [sectionMapper] Creating section:', sectionType, 'with industryVariant:', industryVariant);

    switch (sectionType) {
      case 'hero': {
        // Use intelligent headline selection based on page goal
        const headlineSelection = selectBestHeadline(
          brief.headlines || { optionA: '', optionB: '', optionC: '' },
          pageGoal || 'generate-leads'
        );
        
        // Build trust badges from top authority signals
        const trustBadges = authoritySignals.slice(0, 2).map(s => `${s.value} ${s.label}`);

        // Extract primary credential for trust badge (consulting only)
        const primaryCredential = extractPrimaryCredential(brief.proofPoints?.achievements);
        if (primaryCredential) {
          console.log('[sectionMapper] Extracted primary credential:', primaryCredential);
        }

        // Use beta-hero-teaser for beta pages, standard hero otherwise
        const heroType = isBetaPage ? 'beta-hero-teaser' : 'hero';
        console.log('[sectionMapper] Hero type:', heroType);

        sections.push({
          type: heroType,
          order,
          visible: true,
          content: {
            headline: headlineSelection.primary,
            subheadline: brief.subheadline,
            ctaText: isConsulting ? industryTokens.sectionHeaders.cta.ctaText : brief.ctaText,
            ctaLink: '#contact',
            backgroundImage: heroImageUrl || null,
            trustBadges: trustBadges.length > 0 ? trustBadges : undefined,
            logoUrl: logoUrl || null,
            primaryColor: primaryColor || null,
            industryVariant: industryVariant,
            // Trust badge for consulting hero
            trustBadge: isConsulting ? primaryCredential : null,
          },
        });
        break;
      }

      case 'stats-bar': {
        // Use optimized stats bar extraction
        const stats = getOptimalStatsBar(authoritySignals, 4);

        // Only render if we have at least 2 real stats
        if (stats.length >= 2) {
          sections.push({
            type: 'stats-bar',
            order,
            visible: true,
            content: {
              statistics: stats,
              industryVariant: industryVariant,
            },
          });
        }
        break;
      }

      case 'problem-solution': {
        if (brief.problemStatement && brief.solutionStatement) {
          sections.push({
            type: 'problem-solution',
            order,
            visible: true,
            content: {
              problemTitle: 'The Challenge',
              problem: brief.problemStatement,
              solutionTitle: 'Our Solution',
              solution: brief.solutionStatement,
              industryVariant: industryVariant,
            },
          });
        }
        break;
      }

      case 'features': {
        // Use enhanced messaging pillars with hooks and proof points
        const enhancedPillars = enhanceMessagingPillars(
          brief.messagingPillars || [],
          authoritySignals
        );

        if (enhancedPillars.length > 0) {
          const featuresType = isBetaPage ? 'beta-perks' : 'features';
          console.log('[sectionMapper] Features type:', featuresType);
          
          sections.push({
            type: featuresType,
            order,
            visible: true,
            content: {
              title: isBetaPage 
                ? 'Early Adopter Perks' 
                : (intelligentHeaders.features?.title || industryTokens.sectionHeaders.features.title),
              subtitle: isBetaPage 
                ? 'What you get by joining early' 
                : (intelligentHeaders.features?.subtitle || industryTokens.sectionHeaders.features.subtitle),
              eyebrow: industryTokens.sectionHeaders.features.eyebrow,
              features: enhancedPillars.map(pillar => ({
                title: pillar.title,
                description: pillar.description,
                icon: pillar.icon,
                hook: pillar.hook,
                proofPoint: pillar.proofPoint,
              })),
              industryVariant: industryVariant,
            },
          });
        }
        break;
      }

      case 'how-it-works': {
        // Only render if we have processSteps
        if (brief.processSteps && brief.processSteps.length > 0) {
          sections.push({
            type: 'how-it-works',
            order,
            visible: true,
            content: {
              title: intelligentHeaders.process?.title || industryTokens.sectionHeaders.process.title,
              subtitle: intelligentHeaders.process?.subtitle || industryTokens.sectionHeaders.process.subtitle,
              steps: brief.processSteps.map(step => ({
                number: step.step,
                title: step.title,
                description: step.description,
              })),
              industryVariant: industryVariant,
            },
          });
        }
        break;
      }

      case 'social-proof': {
        // Use ranked testimonials for better ordering
        const rankedTestimonials = rankTestimonials(brief.testimonials || []);
        const hasRealTestimonials = rankedTestimonials.length > 0 &&
          !isPlaceholderTestimonial(rankedTestimonials[0]);
        
        const socialProofType = isBetaPage ? 'waitlist-proof' : 'social-proof';
        console.log('[sectionMapper] Social proof type:', socialProofType);
        console.log('[sectionMapper] Has real testimonials:', hasRealTestimonials);
        if (hasRealTestimonials) {
          console.log('[sectionMapper] First testimonial:', rankedTestimonials[0]);
        }

        // Extract the primary testimonial for the featured display
        const primaryTestimonial = hasRealTestimonials ? {
          quote: rankedTestimonials[0].quote,
          name: rankedTestimonials[0].author,
          title: rankedTestimonials[0].title || '',
          company: '',
          rating: 5,
        } : undefined;

        sections.push({
          type: socialProofType,
          order,
          visible: true,
          content: {
            title: isBetaPage 
              ? 'Join the Waitlist' 
              : (intelligentHeaders.proof?.title || industryTokens.sectionHeaders.testimonials.title),
            subtitle: intelligentHeaders.proof?.subtitle || industryTokens.sectionHeaders.testimonials.subtitle,
            // Pass single testimonial object for component compatibility
            testimonial: primaryTestimonial,
            // Also keep array for components that need multiple
            testimonials: hasRealTestimonials
              ? rankedTestimonials.slice(0, 3).map(t => ({
                  quote: t.quote,
                  author: t.author,
                  title: t.title,
                  rating: 5,
                  score: t.score,
                }))
              : [],
            achievements: brief.proofPoints?.achievements || null,
            industryVariant: industryVariant,
          },
        });
        break;
      }

      case 'faq': {
        // Use optimized FAQs with categorization and prioritization
        const optimizedFAQs = optimizeFAQs(brief.objections || [], 6);

        if (optimizedFAQs.length > 0) {
          sections.push({
            type: 'faq',
            order,
            visible: true,
            content: {
              headline: intelligentHeaders.faq?.title || industryTokens.sectionHeaders.faq.title,
              eyebrow: industryTokens.sectionHeaders.faq.eyebrow,
              items: optimizedFAQs.map(faq => ({
                question: faq.question,
                answer: faq.answer,
                category: faq.category,
              })),
              industryVariant: industryVariant,
            },
          });
        }
        break;
      }

      case 'final-cta': {
        // Build trust signal from top authority signal
        const trustSignal = authoritySignals[0]
          ? `${authoritySignals[0].value} ${authoritySignals[0].label}`
          : undefined;

        // For beta pages, use a different CTA style
        const ctaType = isBetaPage ? 'beta-final-cta' : 'final-cta';
        console.log('[sectionMapper] CTA type:', ctaType);

        sections.push({
          type: ctaType,
          order,
          visible: true,
          content: {
            headline: isBetaPage 
              ? 'Be the First to Know' 
              : (intelligentHeaders.cta?.title || industryTokens.sectionHeaders.cta.title),
            subtext: isBetaPage 
              ? '' 
              : (intelligentHeaders.cta?.subtitle || industryTokens.sectionHeaders.cta.subtext),
            ctaText: isConsulting 
              ? industryTokens.sectionHeaders.cta.ctaText 
              : brief.ctaText,
            ctaLink: '#contact',
            trustSignal,
            trustIndicators: authoritySignals.slice(0, 3).map(s => ({ text: `${s.value} ${s.label}` })),
            primaryColor: primaryColor || null,
            industryVariant: industryVariant,
          },
        });
        break;
      }

      default:
        console.warn(`🧠 [sectionMapper] Unknown section type: ${sectionType}`);
    }
  }

  console.log(`🧠 [sectionMapper] Generated ${sections.length} sections from pageStructure:`, pageStructure);
  return sections;
}

/**
 * Check if content appears to be from a structured brief
 */
export function isStructuredBriefContent(content: any): content is StructuredBrief {
  return content && 
    typeof content === 'object' &&
    'headlines' in content &&
    'messagingPillars' in content &&
    'proofPoints' in content &&
    'pageStructure' in content;
}

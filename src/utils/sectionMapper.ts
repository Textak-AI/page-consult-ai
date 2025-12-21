/**
 * Brief-First Section Mapper
 * 
 * CRITICAL RULES:
 * - NO FABRICATION: Never generate content not in the structuredBrief
 * - NO TEMPLATE DEFAULTS: Don't inject placeholder stats, features, or testimonials
 * - STRICT STRUCTURE: Only render sections listed in pageStructure array, in exact order
 * - PROOF POINTS ONLY: Stats bar shows only values from proofPoints
 * - INDUSTRY-AWARE: Apply industry-specific headers and styling
 */

import type { LucideIcon } from 'lucide-react';
import { 
  detectIndustryVariant, 
  getIndustryTokens, 
  type IndustryVariant,
  type IndustryDesignTokens 
} from '@/config/designSystem/industryVariants';

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
  pageType?: string | null; // 'beta-prelaunch' | 'customer-acquisition' | etc.
  industry?: string;        // For industry variant detection
  serviceType?: string;     // For industry variant detection
}

/**
 * Extract a numeric value from a string like "47+ aerospace manufacturers"
 * Returns the number/value part only
 */
function extractNumericValue(text: string | null): string | null {
  if (!text) return null;
  const match = text.match(/(\d+[\d,]*[+KMB]?)/i);
  if (!match) return null;
  // Avoid double plus: only add + if not already present
  const value = match[1];
  return value;
}

/**
 * Extract label from a proof point (remove the numeric part)
 */
function extractLabel(text: string): string {
  // Remove the numeric part and clean up
  const cleaned = text.replace(/^\d+[\d,]*[+KMB]?\s*/i, '').trim();
  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
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
 * Maps a structuredBrief to Section[] array.
 * SINGLE SOURCE OF TRUTH: Only data from the brief is rendered.
 * INDUSTRY-AWARE: Applies industry-specific headers and styling.
 */
export function mapBriefToSections(
  brief: StructuredBrief,
  options: MapBriefOptions
): Section[] {
  console.log('🔧 [mapBriefToSections] ENTERED');
  console.log('🔧 [mapBriefToSections] options:', JSON.stringify(options, null, 2));
  console.log('🔧 [mapBriefToSections] options.pageType:', options.pageType);
  console.log('🔧 [mapBriefToSections] typeof options.pageType:', typeof options.pageType);
  
  const { businessName, heroImageUrl, logoUrl, primaryColor, pageType, industry, serviceType } = options;
  const sections: Section[] = [];
  const pageStructure = brief.pageStructure || [];
  
  const isBetaPage = pageType === 'beta-prelaunch';
  
  // Detect industry variant for styling and headers
  const industryVariant = detectIndustryVariant(industry, serviceType, pageType);
  const industryTokens = getIndustryTokens(industryVariant);
  const isConsulting = industryVariant === 'consulting';
  
  console.log('🎨 [sectionMapper] industry input:', industry);
  console.log('🎨 [sectionMapper] serviceType input:', serviceType);
  console.log('🎨 [sectionMapper] pageType input:', pageType);
  console.log('🎨 [sectionMapper] industryVariant:', industryVariant);
  console.log('🎨 [sectionMapper] isConsulting:', isConsulting);
  console.log('🔧 [mapBriefToSections] isBetaPage:', isBetaPage);
  console.log('🔧 [mapBriefToSections] pageStructure:', pageStructure);

  // Iterate through pageStructure and build sections in EXACT order
  for (const sectionType of pageStructure) {
    const order = sections.length;

    switch (sectionType) {
      case 'hero': {
        // Build trust badges from proof points (only if they exist)
        const trustBadges: string[] = [];
        if (brief.proofPoints?.yearsInBusiness) {
          trustBadges.push(brief.proofPoints.yearsInBusiness);
        }
        if (brief.proofPoints?.clientCount) {
          trustBadges.push(brief.proofPoints.clientCount);
        }

        // Use beta-hero-teaser for beta pages, standard hero otherwise
        const heroType = isBetaPage ? 'beta-hero-teaser' : 'hero';
        console.log('[sectionMapper] Hero type:', heroType);

        sections.push({
          type: heroType,
          order,
          visible: true,
          content: {
            headline: brief.headlines.optionA,
            subheadline: brief.subheadline,
            // Use industry-specific CTA text
            ctaText: isConsulting ? industryTokens.sectionHeaders.cta.ctaText : brief.ctaText,
            ctaLink: '#contact',
            backgroundImage: heroImageUrl || null,
            trustBadges: trustBadges.length > 0 ? trustBadges : undefined,
            logoUrl: logoUrl || null,
            primaryColor: primaryColor || null,
            // Pass industry variant for styling
            industryVariant: industryVariant,
          },
        });
        break;
      }

      case 'stats-bar': {
        // CRITICAL: Only use stats that actually exist in proofPoints
        const stats: Array<{ value: string; label: string }> = [];

        if (brief.proofPoints?.clientCount) {
          const value = extractNumericValue(brief.proofPoints.clientCount);
          if (value) {
            stats.push({ 
              value, 
              label: extractLabel(brief.proofPoints.clientCount) || 'Clients Served' 
            });
          }
        }

        if (brief.proofPoints?.yearsInBusiness) {
          const value = extractNumericValue(brief.proofPoints.yearsInBusiness);
          if (value) {
            stats.push({ 
              value, 
              label: extractLabel(brief.proofPoints.yearsInBusiness) || 'Years Experience' 
            });
          }
        }

        // Only add otherStats if they follow "number + label" pattern
        if (brief.proofPoints?.otherStats && Array.isArray(brief.proofPoints.otherStats)) {
          brief.proofPoints.otherStats.forEach(stat => {
            const match = stat.match(/^([\d,.$%]+[KMB+]?)\s+(.+)$/i);
            if (match) {
              stats.push({ value: match[1], label: match[2] });
            }
          });
        }

        // Only render if we have at least 2 real stats
        if (stats.length >= 2) {
          sections.push({
            type: 'stats-bar',
            order,
            visible: true,
            content: {
              statistics: stats.slice(0, 4), // Max 4 stats
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
              problem: brief.problemStatement,
              solution: brief.solutionStatement,
            },
          });
        }
        break;
      }

      case 'features': {
        // CRITICAL: Use ONLY messagingPillars from brief, nothing else
        // For beta pages, use beta-perks section
        if (brief.messagingPillars && brief.messagingPillars.length > 0) {
          const featuresType = isBetaPage ? 'beta-perks' : 'features';
          console.log('[sectionMapper] Features type:', featuresType);
          
          sections.push({
            type: featuresType,
            order,
            visible: true,
            content: {
              // Use industry-specific headers
              title: isBetaPage 
                ? 'Early Adopter Perks' 
                : industryTokens.sectionHeaders.features.title,
              subtitle: isBetaPage 
                ? `What you get by joining early` 
                : industryTokens.sectionHeaders.features.subtitle,
              eyebrow: industryTokens.sectionHeaders.features.eyebrow,
              features: brief.messagingPillars.map(pillar => ({
                title: pillar.title,
                description: pillar.description,
                icon: pillar.icon,
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
              // Use industry-specific headers
              title: industryTokens.sectionHeaders.process.title,
              subtitle: industryTokens.sectionHeaders.process.subtitle,
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
        // For beta pages, use waitlist-proof section
        const hasRealTestimonials = brief.testimonials?.length > 0 &&
          !isPlaceholderTestimonial(brief.testimonials[0]);
        
        const socialProofType = isBetaPage ? 'waitlist-proof' : 'social-proof';
        console.log('[sectionMapper] Social proof type:', socialProofType);

        sections.push({
          type: socialProofType,
          order,
          visible: true,
          content: {
            // Use industry-specific headers
            title: isBetaPage 
              ? 'Join the Waitlist' 
              : industryTokens.sectionHeaders.testimonials.title,
            subtitle: industryTokens.sectionHeaders.testimonials.subtitle,
            testimonials: hasRealTestimonials
              ? brief.testimonials.map(t => ({
                  quote: t.quote,
                  author: t.author,
                  title: t.title,
                  rating: 5,
                }))
              : [], // Empty array if no real testimonials
            achievements: brief.proofPoints?.achievements || null,
            industryVariant: industryVariant,
          },
        });
        break;
      }

      case 'faq': {
        // Only render if we have objections
        if (brief.objections && brief.objections.length > 0) {
          sections.push({
            type: 'faq',
            order,
            visible: true,
            content: {
              // Use industry-specific headers
              headline: industryTokens.sectionHeaders.faq.title,
              eyebrow: industryTokens.sectionHeaders.faq.eyebrow,
              items: brief.objections.map(obj => ({
                question: obj.question,
                answer: obj.answer,
              })),
              industryVariant: industryVariant,
            },
          });
        }
        break;
      }

      case 'final-cta': {
        // STRICT: Only include trust indicators from proofPoints, NO FABRICATION
        const trustIndicators: Array<{ text: string }> = [];
        
        if (brief.proofPoints?.yearsInBusiness) {
          trustIndicators.push({ text: brief.proofPoints.yearsInBusiness });
        }
        if (brief.proofPoints?.clientCount) {
          trustIndicators.push({ text: brief.proofPoints.clientCount });
        }
        if (brief.proofPoints?.achievements) {
          trustIndicators.push({ text: brief.proofPoints.achievements });
        }

        // For beta pages, use a different CTA style
        const ctaType = isBetaPage ? 'beta-final-cta' : 'final-cta';
        console.log('[sectionMapper] CTA type:', ctaType);

        sections.push({
          type: ctaType,
          order,
          visible: true,
          content: {
            // Use industry-specific headers and CTA text
            headline: isBetaPage 
              ? 'Be the First to Know' 
              : industryTokens.sectionHeaders.cta.title,
            subtext: isBetaPage 
              ? '' 
              : industryTokens.sectionHeaders.cta.subtext,
            ctaText: isConsulting 
              ? industryTokens.sectionHeaders.cta.ctaText 
              : brief.ctaText,
            ctaLink: '#contact',
            trustIndicators: trustIndicators.length > 0 ? trustIndicators : undefined,
            primaryColor: primaryColor || null,
            industryVariant: industryVariant,
          },
        });
        break;
      }

      default:
        console.warn(`[sectionMapper] Unknown section type: ${sectionType}`);
    }
  }

  console.log(`[sectionMapper] Built ${sections.length} sections from pageStructure:`, pageStructure);
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

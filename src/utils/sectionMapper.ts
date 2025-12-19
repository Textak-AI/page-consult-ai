/**
 * Brief-First Section Mapper
 * 
 * CRITICAL RULES:
 * - NO FABRICATION: Never generate content not in the structuredBrief
 * - NO TEMPLATE DEFAULTS: Don't inject placeholder stats, features, or testimonials
 * - STRICT STRUCTURE: Only render sections listed in pageStructure array, in exact order
 * - PROOF POINTS ONLY: Stats bar shows only values from proofPoints
 */

import type { LucideIcon } from 'lucide-react';

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
}

/**
 * Extract a numeric value from a string like "47+ aerospace manufacturers"
 * Returns the number/value part only
 */
function extractNumericValue(text: string | null): string | null {
  if (!text) return null;
  const match = text.match(/(\d+[\d,]*[+KMB]?)/i);
  return match ? match[1] : null;
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
 */
export function mapBriefToSections(
  brief: StructuredBrief,
  options: MapBriefOptions
): Section[] {
  const { businessName, heroImageUrl } = options;
  const sections: Section[] = [];
  const pageStructure = brief.pageStructure || [];

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

        sections.push({
          type: 'hero',
          order,
          visible: true,
          content: {
            headline: brief.headlines.optionA,
            subheadline: brief.subheadline,
            ctaText: brief.ctaText,
            ctaLink: '#contact',
            backgroundImage: heroImageUrl || null,
            trustBadges: trustBadges.length > 0 ? trustBadges : undefined,
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
        if (brief.messagingPillars && brief.messagingPillars.length > 0) {
          sections.push({
            type: 'features',
            order,
            visible: true,
            content: {
              title: 'Why Choose Us',
              subtitle: `What sets ${businessName} apart`,
              features: brief.messagingPillars.map(pillar => ({
                title: pillar.title,
                description: pillar.description,
                icon: pillar.icon, // Must be valid Lucide icon name
              })),
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
              title: 'How It Works',
              subtitle: 'Your path to results',
              steps: brief.processSteps.map(step => ({
                number: step.step,
                title: step.title,
                description: step.description,
              })),
            },
          });
        }
        break;
      }

      case 'social-proof': {
        // CRITICAL: Only use testimonials from brief, never fabricate
        const hasRealTestimonials = brief.testimonials?.length > 0 &&
          !isPlaceholderTestimonial(brief.testimonials[0]);

        sections.push({
          type: 'social-proof',
          order,
          visible: true,
          content: {
            title: 'What Our Clients Say',
            testimonials: hasRealTestimonials
              ? brief.testimonials.map(t => ({
                  quote: t.quote,
                  author: t.author,
                  title: t.title,
                  rating: 5,
                }))
              : [], // Empty array if no real testimonials
            achievements: brief.proofPoints?.achievements || null,
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
              title: 'Frequently Asked Questions',
              items: brief.objections.map(obj => ({
                question: obj.question,
                answer: obj.answer,
              })),
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

        sections.push({
          type: 'final-cta',
          order,
          visible: true,
          content: {
            headline: 'Ready to Get Started?',
            subtext: brief.solutionStatement?.split('.')[0] + '.' || '',
            ctaText: brief.ctaText,
            ctaLink: '#contact',
            trustIndicators: trustIndicators.length > 0 ? trustIndicators : undefined,
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

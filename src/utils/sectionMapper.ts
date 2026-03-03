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
 * - SDI INTEGRATION: Use Strategic Design Intelligence when available
 */

import { 
  detectIndustryVariant as detectIndustryVariantLegacy, 
  getIndustryTokens as getIndustryTokensLegacy, 
  type IndustryVariant as IndustryVariantLegacy,
  type IndustryDesignTokens 
} from '@/config/designSystem/industryVariants';
import {
  detectIndustryVariant as detectIndustryVariantNew,
  getIndustryTokens as getIndustryTokensNew,
  generateIndustryCSS,
  getOptimalProofStack,
  type IndustryVariant,
  type IndustryTokens,
} from '@/lib/industryDesignSystem';
import { classifyIndustrySync, type IndustryClassification } from '@/lib/industryClassification';
import { getCtaByIndustry } from '@/lib/ctaByIndustry';
import {
  generateSchemaOrg,
  generateAISEOMetaTags,
} from '@/lib/aiSeoGenerator';
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
import type { DesignIntelligenceOutput } from '@/lib/designIntelligence';

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
  accentColor?: string;
  pageType?: string | null;
  pageGoal?: string;
  industry?: string;
  industryCategory?: string;
  industrySubcategory?: string;
  serviceType?: string;
  // Support both string[] (legacy) and AISeoData.authoritySignals structure
  aiSearchOptimization?: {
    authoritySignals?: Array<string | { raw?: string; optimized?: string; type?: string }>;
    entity?: { type?: string; name?: string };
  } | null;
  // Consultation data for CTA extraction
  consultationData?: {
    primaryCTA?: string;
    secondaryCTA?: string;
    urgencyAngle?: string;
    guaranteeOffer?: string;
    pageGoal?: string;
    uniqueValue?: string;
    clientCount?: string;
    ctaLink?: string;
  };
  // Available proof for optimal proof stack
  availableProof?: {
    hasLogos?: boolean;
    hasMetrics?: boolean;
    hasCaseStudies?: boolean;
    hasTestimonials?: boolean;
    hasVideoTestimonials?: boolean;
    hasCertifications?: boolean;
    hasSecurityBadges?: boolean;
    hasGuarantee?: boolean;
    hasYearsInBusiness?: boolean;
    hasTeamCredentials?: boolean;
    hasMediaMentions?: boolean;
  };
  // Strategic Design Intelligence from Phase 1
  designIntelligence?: DesignIntelligenceOutput;
  // NEW: Stored AI-powered industry classification (from consultation completion)
  // Uses a compatible type that accepts navigation state format
  industryClassification?: {
    variant: string;
    confidence?: 'high' | 'medium' | 'low';
    reasoning?: string;
    source?: 'keyword' | 'ai' | 'fallback' | string;
    classifiedAt?: string;
  } | null;
}

// Enhanced return type for full page mapping
export interface MappedPage {
  sections: Section[];
  industryVariant: IndustryVariant;
  industryTokens: IndustryTokens;
  cssVariables: Record<string, string>;
  schemaOrg: {
    organization: object;
    faqPage?: object;
    service?: object;
    combined: string;
  };
  metaTags: { title: string; description: string; keywords: string };
  proofStack: string[];
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
  // 🗺️ Log input brief
  console.log('🗺️ [SectionMapper] Input brief:', {
    pageStructure: brief.pageStructure,
    headlinesPresent: !!brief.headlines,
    messagingPillars: brief.messagingPillars?.length,
    objections: brief.objections?.length,
    proofPoints: brief.proofPoints,
    processSteps: brief.processSteps?.length,
    testimonials: brief.testimonials?.length,
  });
  
  console.log('🧠 [sectionMapper] Starting intelligent extraction');
  console.log('🧠 [sectionMapper] options:', JSON.stringify(options, null, 2));
  console.log('🖼️ [sectionMapper] heroImageUrl:', options.heroImageUrl);
  
  const { businessName, heroImageUrl, logoUrl, primaryColor, pageType, pageGoal, industry, serviceType, aiSearchOptimization } = options;
  const sections: Section[] = [];
  
  // Get SDI from options if available
  const sdi = options.designIntelligence;
  
  // LAYOUT TEMPLATE INTEGRATION:
  // Priority 1: Use layoutSections from SDI (if available)
  // Priority 2: Use brief.pageStructure (from strategy brief generation)
  // Priority 3: Fallback to DEFAULT_PAGE_STRUCTURE
  let pageStructure: string[];
  let layoutSource: string = 'unknown';
  
  if (sdi?.layoutSections && sdi.layoutSections.length > 0) {
    // Use layout template sections from SDI
    pageStructure = sdi.layoutSections;
    layoutSource = `layout-template:${sdi.layoutId}`;
    console.log(`📐 [sectionMapper] Using layout template "${sdi.layoutId}" with ${pageStructure.length} sections:`, pageStructure);
    console.log(`📐 [sectionMapper] Layout reasoning: ${sdi.layoutReasoning}`);
    console.log(`📐 [sectionMapper] Layout confidence: ${sdi.layoutConfidence}`);
  } else if (brief.pageStructure && brief.pageStructure.length > 0) {
    pageStructure = brief.pageStructure;
    layoutSource = 'strategy-brief';
    console.log('🧠 [sectionMapper] Using page structure from strategy brief:', pageStructure);
  } else {
    pageStructure = DEFAULT_PAGE_STRUCTURE;
    layoutSource = 'default-fallback';
    console.log('🧠 [sectionMapper] Using DEFAULT page structure (no brief/layout):', pageStructure);
  }
  
  console.log('🧠 [sectionMapper] Final page structure source:', layoutSource);
  
  const isBetaPage = pageType === 'beta-prelaunch';
  
  // Detect industry variant - PRIORITY ORDER:
  // 1. Stored AI-powered classification (from consultation completion)
  // 2. SDI-detected industry
  // 3. Sync keyword fallback
  let industryVariant: IndustryVariant;
  let classificationSource: string = 'unknown';
  
  if (options.industryClassification?.variant && options.industryClassification.variant !== 'default') {
    // HIGHEST PRIORITY: Use stored AI-powered classification
    industryVariant = options.industryClassification.variant as IndustryVariant;
    classificationSource = options.industryClassification.source || 'stored';
    console.log('🧠 [sectionMapper] Using stored classification:', industryVariant, '| Source:', classificationSource, '| Reasoning:', options.industryClassification.reasoning);
  } else if (sdi?.industry) {
    // SDI detected industry - use it directly
    industryVariant = sdi.industry as IndustryVariant;
    classificationSource = 'sdi';
    console.log('🎨 [SDI] Using industry variant from SDI:', industryVariant);
  } else {
    // Fall back to sync keyword detection
    const syncClassification = classifyIndustrySync(industry, {
      industryCategory: options.industryCategory,
      industrySubcategory: options.industrySubcategory,
      pageType: pageType || undefined,
    });
    industryVariant = syncClassification.variant;
    classificationSource = 'sync-fallback';
    console.log('🏭 [sectionMapper] Using sync classification:', industryVariant, '| Source:', syncClassification.source);
  }
  
  // Determine mode from SDI colors
  const sdiMode = sdi?.colors?.mode || 'dark';
  console.log('🎨 [SDI] Mode from SDI:', sdiMode);
  
  const industryTokens = getIndustryTokensNew(industryVariant);
  const isConsulting = industryVariant === 'consulting';
  const isHealthcare = industryVariant === 'healthcare';
  
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
  console.log('🎨 [SDI] Proof density:', sdi?.proofDensity);
  console.log('📐 [sectionMapper] Layout ID:', sdi?.layoutId || 'none');

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
            ctaText: isConsulting ? industryTokens.ctaDefaults.primary : (brief.ctaText || getCtaByIndustry(industry).primary),
            ctaLink: '#contact',
            backgroundImage: heroImageUrl || null,
            trustBadges: trustBadges.length > 0 ? trustBadges : undefined,
            logoUrl: logoUrl || null,
            primaryColor: primaryColor || null,
            industryVariant: industryVariant,
            mode: sdiMode,
            // Trust badge for consulting hero
            trustBadge: isConsulting ? primaryCredential : null,
            // SDI for components that need it
            designIntelligence: sdi,
          },
        });
        break;
      }

      case 'stats-bar': {
        // PRIORITY 1: Use SDI extracted proof points if available
        let stats: Array<{value: string, label: string}> = [];
        
        if (sdi?.proofPoints) {
          stats = buildStatsFromSDI(sdi);
          if (stats.length >= 2) {
            console.log('🎨 [SDI] Using extracted proof points for stats:', stats);
          }
        }
        
        // PRIORITY 2: Use optimized stats bar extraction from authority signals
        if (stats.length < 2) {
          stats = getOptimalStatsBar(authoritySignals, 4);
        }
        
        // PRIORITY 3: If proof density is 'sparse', skip stats bar entirely (no fabrication!)
        if (sdi?.proofDensity === 'sparse' && stats.length < 2) {
          console.log('🎨 [SDI] Skipping stats-bar - proof density is sparse (no fabrication)');
          break;
        }

        // Only render if we have at least 2 real stats
        if (stats.length >= 2) {
          sections.push({
            type: 'stats-bar',
            order,
            visible: true,
            content: {
              statistics: stats,
              industryVariant: industryVariant,
              mode: sdiMode,
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
              mode: sdiMode,
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
              eyebrow: undefined,
              features: enhancedPillars.map(pillar => ({
                title: pillar.title,
                description: pillar.description,
                icon: pillar.icon,
                hook: pillar.hook,
                proofPoint: pillar.proofPoint,
              })),
              industryVariant: industryVariant,
              mode: sdiMode,
            },
          });
        }
        break;
      }

      case 'how-it-works': {
        // Use brief processSteps or fallback to builder function
        const steps = (brief.processSteps && brief.processSteps.length > 0)
          ? brief.processSteps.map(step => ({
              number: step.step,
              title: step.title,
              description: step.description,
            }))
          : buildProcessSteps({}, industryVariant);
        
        if (steps.length > 0) {
          sections.push({
            type: 'how-it-works',
            order,
            visible: true,
            content: {
              title: intelligentHeaders.process?.title || industryTokens.sectionHeaders.process.title,
              subtitle: intelligentHeaders.process?.subtitle || industryTokens.sectionHeaders.process.subtitle,
              steps,
              industryVariant: industryVariant,
              mode: sdiMode,
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
            mode: sdiMode,
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
              eyebrow: undefined,
              items: optimizedFAQs.map(faq => ({
                question: faq.question,
                answer: faq.answer,
                category: faq.category,
              })),
              industryVariant: industryVariant,
              mode: sdiMode,
            },
          });
        }
        break;
      }

      case 'final-cta': {
        // Extract consultation data
        const consultation = options.consultationData || {};
        
        // Log all possible data sources for debugging
        console.log('🎯 [Final CTA] Building with sources:', {
          consultationData: {
            primaryCTA: consultation.primaryCTA,
            secondaryCTA: consultation.secondaryCTA,
            urgencyAngle: consultation.urgencyAngle,
            guaranteeOffer: consultation.guaranteeOffer,
            pageGoal: consultation.pageGoal,
          },
          briefCtaText: brief.ctaText,
          pageGoal: pageGoal,
          industryVariant: industryVariant,
          authoritySignalsCount: authoritySignals.length,
        });

        // CTA Text - check multiple sources (industry-aware fallback)
        const industryCta = getCtaByIndustry(industry);
        const ctaButtonText = consultation.primaryCTA || 
                              brief.ctaText || 
                              industryCta.primary || 
                              'Get Started';
        
        // Secondary CTA
        const secondaryCta = consultation.secondaryCTA || null;
        
        // Urgency text
        const urgencyText = consultation.urgencyAngle || null;
        
        // Guarantee text
        const guaranteeText = consultation.guaranteeOffer || null;

        // Build headline based on page goal
        const goalHeadlines: Record<string, string> = {
          'book-meetings': 'Ready to Schedule Your Discovery Call?',
          'generate-leads': 'Get Your Free Assessment',
          'drive-sales': 'Ready to Get Started?',
          'signups': 'Start Your Free Trial Today',
          'demo': 'See It In Action',
        };

        const effectivePageGoal = consultation.pageGoal || pageGoal || 'generate-leads';
        
        // Extract headline - prefer intelligent headers, then goal-based, then industry default
        const ctaHeadline = isBetaPage 
          ? 'Be the First to Know' 
          : (intelligentHeaders.cta?.title || 
             goalHeadlines[effectivePageGoal] || 
             industryTokens.sectionHeaders.cta.title);

        // Extract subtext - prefer uniqueValue from consultation, then intelligent headers
        const ctaSubtext = isBetaPage 
          ? '' 
          : (consultation.uniqueValue?.slice(0, 150) || 
             intelligentHeaders.cta?.subtitle || 
             intelligentHeaders.cta?.subtitle || '');

        // Build trust signal from top authority signal
        const trustSignal = consultation.clientCount 
          ? `${consultation.clientCount}+ clients`
          : authoritySignals[0]
            ? `${authoritySignals[0].value} ${authoritySignals[0].label}`
            : undefined;

        // Build trust indicators from authority signals
        const ctaTrustIndicators = authoritySignals.slice(0, 3).map(s => ({ 
          text: `${s.value} ${s.label}` 
        }));

        // For beta pages, use a different CTA style
        const ctaType = isBetaPage ? 'beta-final-cta' : 'final-cta';
        console.log('[sectionMapper] CTA type:', ctaType);

        const ctaContent = {
          headline: ctaHeadline,
          subtext: ctaSubtext,
          ctaText: ctaButtonText,
          ctaLink: consultation.ctaLink || '#contact',
          secondaryCta,
          urgencyText,
          guaranteeText,
          trustSignal,
          trustIndicators: ctaTrustIndicators.length > 0 ? ctaTrustIndicators : (() => {
            const saasKeywords = ['saas', 'software', 'platform', 'app', 'developer', 'devtools', 'api', 'fintech', 'payment', 'processing', 'automation', 'analytics', 'cloud', 'ai', 'tech'];
            const isSaasIndustry = industry && saasKeywords.some(kw => industry.toLowerCase().includes(kw));
            return isSaasIndustry
              ? [{ text: 'Free to start' }, { text: 'Pay as you go' }, { text: 'No contracts' }]
              : [{ text: 'No credit card required' }, { text: 'Free to start' }, { text: 'Cancel anytime' }];
          })(),
          primaryColor: primaryColor || null,
          industryVariant: industryVariant,
          mode: sdiMode,
          designIntelligence: sdi,
        };

        console.log('🎯 [Final CTA] Built content:', ctaContent);

        sections.push({
          type: ctaType,
          order,
          visible: true,
          content: ctaContent,
        });
        break;
      }

      // NEW: Consulting-specific section types (from layout templates)
      case 'credentials-bar':
      case 'the-real-challenge':
      case 'our-approach':
      case 'expertise-areas':
      case 'engagement-model':
      case 'client-results': {
        // These sections use stub components - pass through minimal content
        // The components will render with sensible defaults if data is missing
        console.log(`📐 [sectionMapper] Creating consulting section: ${sectionType}`);
        sections.push({
          type: sectionType,
          order,
          visible: true,
          content: {
            industryVariant: industryVariant,
            mode: sdiMode,
            businessName,
            // Pass any relevant extracted data
            challenges: brief.objections?.slice(0, 3).map(o => ({
              title: o.question,
              description: o.answer,
            })),
            principles: brief.messagingPillars?.slice(0, 3).map(p => ({
              title: p.title,
              description: p.description,
              icon: p.icon,
            })),
            steps: brief.processSteps?.map(s => ({
              number: s.step,
              title: s.title,
              description: s.description,
            })),
          },
        });
        break;
      }

      default:
        console.warn(`🧠 [sectionMapper] Unknown section type: ${sectionType}`);
    }
  }

  // 🗺️ Log final sections
  console.log('🗺️ [SectionMapper] Final sections:', {
    count: sections.length,
    types: sections.map(s => s.type),
  });
  
  // COLOR CASCADE STEP 3: Inject primaryColor into ALL sections that don't have it
  // This ensures brand color reaches every component, not just hero and final-cta
  const resolvedPrimary = primaryColor || sdi?.palette?.primary || null;
  if (resolvedPrimary) {
    for (const section of sections) {
      if (!section.content.primaryColor) {
        section.content.primaryColor = resolvedPrimary;
      }
    }
    console.log(`🎨 [sectionMapper] Injected primaryColor "${resolvedPrimary}" into ${sections.length} sections`);
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

// ============================================
// SDI PROOF POINT EXTRACTION
// Build stats from Strategic Design Intelligence
// ============================================

/**
 * Validate and clean a stat label for display
 * Returns null if the label is invalid or contains JSON artifacts
 */
function validateStatLabel(label: string): string | null {
  if (!label || label.length < 3) return null;
  
  // Reject labels containing JSON syntax characters
  if (/[{}[\]":]/.test(label)) return null;
  
  // Reject labels that look like JSON field names
  if (/^[a-z]+[A-Z]/.test(label)) return null; // camelCase start
  if (/[a-z][A-Z]/.test(label) && !/\s/.test(label)) return null; // camelCase anywhere, no spaces
  if (/^[a-z_]+$/i.test(label) && !/\s/.test(label)) return null; // single identifier without spaces
  
  // Reject concatenated lowercase patterns (>8 chars, no spaces) — JSON key leakage
  if (/^[a-z]{9,}$/i.test(label.replace(/\s/g, '')) && !/\s/.test(label)) return null;
  
  // Reject known JSON field name prefixes
  if (/^(valueprop|buyerobject|painpoint|proofelem|percent|dollar|clientcount|yearsinbusiness|authority|uniquevalue|messagingpillar|problemstate|solutionstate|headline|subhead|keybenef|targetmark|industr|compet|differ|credent|guaran)/i.test(label)) return null;
  
  // Clean up the label — strip any embedded JSON key fragments (camelCase tokens without spaces)
  let cleaned = label
    .replace(/[{}[\]"':,]/g, ' ')  // Remove JSON syntax
    .replace(/\b[a-z]{2,}[A-Z][a-zA-Z]*\b/g, '') // Remove camelCase tokens
    .replace(/\s+/g, ' ')
    .trim();
  
  // Reject if cleaning removed everything meaningful
  if (cleaned.length < 3) return null;
  
  // Smart truncation at word boundary if too long
  if (cleaned.length > 50) {
    cleaned = truncateAtWord(cleaned, 50);
  }
  
  // Ensure it starts with uppercase
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned.length >= 3 ? cleaned : null;
}

/**
 * Truncate text at the nearest word boundary, adding ellipsis
 */
function truncateAtWord(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLen * 0.5) {
    return truncated.slice(0, lastSpace) + '…';
  }
  return truncated + '…';
}

/**
 * Build statistics from SDI proof points
 * PRIORITY: Use real extracted data, never fabricate
 * Deduplicates by numeric value and validates labels
 */
function buildStatsFromSDI(sdi: DesignIntelligenceOutput): Array<{value: string, label: string}> {
  const proof = sdi.proofPoints;
  if (!proof) return [];
  
  const stats: Array<{value: string, label: string}> = [];
  const seenValues = new Set<string>();
  
  /**
   * Helper to add stat only if value is unique and label is valid
   */
  function addStat(value: string, rawLabel: string, fallbackLabel: string) {
    // Normalize value for deduplication (e.g., "94%" and "94 %" become "94%")
    const normalizedValue = value.replace(/\s+/g, '').toLowerCase();
    
    if (seenValues.has(normalizedValue)) {
      console.log('🔄 [buildStatsFromSDI] Skipping duplicate value:', value);
      return false;
    }
    
    const validLabel = validateStatLabel(rawLabel) || fallbackLabel;
    if (!validLabel) {
      console.log('⚠️ [buildStatsFromSDI] Invalid label for value:', value, 'raw:', rawLabel);
      return false;
    }
    
    seenValues.add(normalizedValue);
    stats.push({ value, label: validLabel });
    return true;
  }
  
  // Add percentage stats (e.g., "94% pass rate")
  if (proof.percentageStats && proof.percentageStats.length > 0) {
    for (const stat of proof.percentageStats) {
      if (stats.length >= 4) break;
      
      const match = stat.match(/(\d+%)/);
      if (match) {
        let label = stat.replace(match[1], '').trim();
        label = label
          .replace(/^of\s+(our\s+)?/i, '')
          .replace(/^we\s+/i, '')
          .replace(/\s+$/g, '');
        // Truncate at word boundary instead of hard slice
        if (label.length > 40) {
          label = truncateAtWord(label, 40);
        }
        
        addStat(match[1], label, 'Success Rate');
      }
    }
  }
  
  // Add dollar stats (e.g., "$1.5M in fines avoided")
  if (proof.dollarStats && proof.dollarStats.length > 0) {
    for (const stat of proof.dollarStats) {
      if (stats.length >= 4) break;
      
      const match = stat.match(/(\$[\d,.]+[kmb]?)/i);
      if (match) {
        let label = stat.replace(match[1], '').trim();
        label = label
          .replace(/^in\s+/i, '')
          .replace(/\s+$/g, '');
        if (label.length > 40) {
          label = truncateAtWord(label, 40);
        }
        
        addStat(match[1], label, 'Value Delivered');
      }
    }
  }
  
  // Add client count if available
  if (proof.clientCount && stats.length < 4) {
    const match = proof.clientCount.match(/(\d+\+?)/);
    if (match) {
      addStat(match[1] + '+', 'Clients Served', 'Clients Served');
    }
  }
  
  // Add years in business if available
  if (proof.yearsInBusiness && stats.length < 4) {
    const match = proof.yearsInBusiness.match(/(\d+\+?)/);
    if (match) {
      addStat(match[1] + '+', 'Years Experience', 'Years Experience');
    }
  }
  
  console.log('📊 [buildStatsFromSDI] Built', stats.length, 'unique stats:', stats);
  return stats;
}

// ============================================
// LEGACY FALLBACK BUILDERS
// For when structured brief data is incomplete
// ============================================

/**
 * Build statistics from consultation data with comprehensive path checking
 */
export function buildStatistics(sources: any, industryVariant: string): Array<{value: string, label: string}> {
  const stats: Array<{value: string, label: string}> = [];
  
  // DETAILED LOGGING - what are we actually receiving?
  console.log('🔍 [buildStatistics] Full sources object:', JSON.stringify(sources, null, 2));
  console.log('🔍 [buildStatistics] consultationData keys:', sources.consultationData ? Object.keys(sources.consultationData) : 'none');
  
  // Check multiple possible locations for proof data
  const possibleProofSources = [
    sources.proofPoints,
    sources.consultationData?.proofPoints,
    sources.consultationData?.proof_points,
    sources.consultationData?.step4_proof,
    sources.consultationData?.credibility,
  ];
  
  console.log('🔍 [buildStatistics] Checking proof sources:', possibleProofSources.map((s, i) => `[${i}]: ${!!s}`));
  
  // Find the first valid proof source
  const proofData = possibleProofSources.find(s => s && (s.keyMetrics || s.clientCount || s.yearsInBusiness));
  
  if (proofData) {
    console.log('✅ [buildStatistics] Found proof data:', proofData);
    
    // Extract from keyMetrics array if present
    if (proofData.keyMetrics && Array.isArray(proofData.keyMetrics)) {
      proofData.keyMetrics.forEach((metric: {value: string, label: string}) => {
        stats.push({ value: metric.value, label: metric.label });
      });
    }
    
    // Extract from individual fields
    if (proofData.clientCount && stats.length < 4) {
      stats.push({ value: proofData.clientCount + '+', label: 'Clients Served' });
    }
    if (proofData.yearsInBusiness && stats.length < 4) {
      stats.push({ value: proofData.yearsInBusiness + '+', label: 'Years Experience' });
    }
    if (proofData.successRate && stats.length < 4) {
      stats.push({ value: proofData.successRate, label: 'Success Rate' });
    }
    if (proofData.satisfaction && stats.length < 4) {
      stats.push({ value: proofData.satisfaction, label: 'Client Satisfaction' });
    }
  }
  
  // Also check flat consultation data fields
  const consultData = sources.consultationData;
  if (consultData && stats.length < 4) {
    if (consultData.client_count || consultData.clientCount) {
      const count = consultData.client_count || consultData.clientCount;
      if (!stats.some(s => s.label.includes('Client'))) {
        stats.push({ value: count + '+', label: 'Clients Served' });
      }
    }
    if (consultData.years_in_business || consultData.yearsInBusiness) {
      const years = consultData.years_in_business || consultData.yearsInBusiness;
      if (!stats.some(s => s.label.includes('Years'))) {
        stats.push({ value: years + '+', label: 'Years Experience' });
      }
    }
  }
  
  // Only use fallback if we found nothing
  if (stats.length < 2) {
    console.log('🚫 [buildStatistics] Only found', stats.length, 'stats - returning empty (zero-fabrication policy)');
    return [];
  }
  
  // Deduplicate by value to prevent showing "94%" twice
  const deduplicatedStats = deduplicateStats(stats);
  
  console.log('✅ [buildStatistics] Extracted', deduplicatedStats.length, 'unique stats from consultation data');
  return deduplicatedStats;
}

/**
 * Deduplicate stats by normalized value to prevent duplicate display
 */
function deduplicateStats(stats: Array<{value: string, label: string}>): Array<{value: string, label: string}> {
  const seenNumeric = new Set<string>();
  const seenLabels = new Set<string>();
  return stats.filter(stat => {
    // Extract just the numeric portion for dedup (e.g., "94%" → "94", "$1.5M" → "15")
    const numericOnly = stat.value.replace(/[^0-9.]/g, '');
    const normalizedValue = stat.value.replace(/[^0-9a-z%$+x]/gi, '').toLowerCase();
    
    // Dedup by exact normalized value
    if (seenNumeric.has(normalizedValue)) {
      console.log('🔄 [deduplicateStats] Removing duplicate value:', stat.value, stat.label);
      return false;
    }
    
    // Also dedup by raw numeric portion (catches "94%" and "94% satisfaction" as same)
    if (numericOnly && seenNumeric.has(numericOnly)) {
      console.log('🔄 [deduplicateStats] Removing duplicate numeric:', stat.value, stat.label);
      return false;
    }
    
    // Dedup by similar label
    const normalizedLabel = stat.label.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seenLabels.has(normalizedLabel)) {
      console.log('🔄 [deduplicateStats] Removing duplicate label:', stat.label);
      return false;
    }
    
    seenNumeric.add(normalizedValue);
    if (numericOnly) seenNumeric.add(numericOnly);
    seenLabels.add(normalizedLabel);
    return true;
  });
}

/**
 * Build FAQs from consultation data with comprehensive path checking
 */
export function buildFAQs(sources: any, industryVariant: string): Array<{question: string, answer: string}> {
  const faqs: Array<{question: string, answer: string}> = [];
  
  console.log('🔍 [buildFAQs] Full sources object:', JSON.stringify(sources, null, 2));
  
  // Check multiple possible locations for objections
  const possibleObjectionSources = [
    sources.objections,
    sources.consultationData?.objections,
    sources.consultationData?.common_objections,
    sources.consultationData?.step5_objections?.commonObjections,
    sources.consultationData?.faqItems,
  ];
  
  console.log('🔍 [buildFAQs] Checking objection sources:', possibleObjectionSources.map((s, i) => `[${i}]: ${!!s && (Array.isArray(s) ? s.length : 'obj')}`));
  
  // Find valid objections
  const objectionsData = possibleObjectionSources.find(s => s && (Array.isArray(s) ? s.length > 0 : Object.keys(s).length > 0));
  
  if (objectionsData && Array.isArray(objectionsData)) {
    console.log('✅ [buildFAQs] Found objections array:', objectionsData.length, 'items');
    
    objectionsData.slice(0, 5).forEach((item: any) => {
      // Handle different formats
      const question = item.question || item.objection || convertToQuestion(item);
      const answer = item.answer || item.response || item;
      
      if (question && answer && typeof answer === 'string') {
        faqs.push({ 
          question: question.endsWith('?') ? question : question + '?',
          answer: answer 
        });
      }
    });
  }
  
  if (faqs.length < 2) {
    console.log('🚫 [buildFAQs] Only found', faqs.length, 'FAQs - returning empty (zero-fabrication policy)');
    return [];
  }
  
  console.log('✅ [buildFAQs] Extracted', faqs.length, 'FAQs from consultation data');
  return faqs;
}

/**
 * Convert objection statement to question format
 */
function convertToQuestion(objection: string): string {
  if (!objection || typeof objection !== 'string') return '';
  
  // Convert statement objections to questions
  const conversions: Record<string, string> = {
    'expensive': 'What kind of ROI can we expect?',
    'cost': 'How does pricing work?',
    'time': 'How long does this take?',
    'trust': 'How do we know this will work?',
    'consultants': 'How are you different from other consultants?',
    'busy': 'What time commitment is required?',
  };
  
  const lower = objection.toLowerCase();
  for (const [keyword, question] of Object.entries(conversions)) {
    if (lower.includes(keyword)) return question;
  }
  
  // If it's already a question-like statement, use it
  if (objection.includes('?') || objection.toLowerCase().startsWith('how') || 
      objection.toLowerCase().startsWith('what') || objection.toLowerCase().startsWith('why')) {
    return objection;
  }
  
  return `What about "${objection}"?`;
}

/**
 * Build process steps from consultation data
 */
export function buildProcessSteps(consultationData: any, industryVariant: string): Array<{number: number, title: string, description: string}> {
  // Check for process steps in consultation data
  const methodologySteps = consultationData?.methodologySteps;
  if (methodologySteps && Array.isArray(methodologySteps) && methodologySteps.length > 0) {
    return methodologySteps.map((step: any, index: number) => ({
      number: index + 1,
      title: step.title || step,
      description: step.description || '',
    }));
  }
  
  // Fallback based on industry
  const fallbacks: Record<string, Array<{number: number, title: string, description: string}>> = {
    consulting: [
      { number: 1, title: 'Discovery Call', description: 'We learn about your challenges and goals' },
      { number: 2, title: 'Strategy Development', description: 'We create a customized roadmap' },
      { number: 3, title: 'Implementation', description: 'We execute together and measure results' },
    ],
    default: [
      { number: 1, title: 'Initial Consultation', description: 'Learn about your needs' },
      { number: 2, title: 'Custom Solution', description: 'Tailored to your requirements' },
      { number: 3, title: 'Delivery & Support', description: 'Ongoing partnership' },
    ],
  };
  
  return fallbacks[industryVariant] || fallbacks.default;
}

/**
 * Build testimonials from consultation data
 */
export function buildTestimonials(consultationData: any, industryVariant: string): Array<{quote: string, author: string, title: string, rating: number}> {
  const testimonials = consultationData?.testimonials;
  if (testimonials && Array.isArray(testimonials) && testimonials.length > 0) {
    return testimonials.filter((t: any) => !isPlaceholderTestimonial(t)).map((t: any) => ({
      quote: t.quote,
      author: t.author || t.name,
      title: t.title || '',
      rating: t.rating || 5,
    }));
  }
  
  // Return empty - don't fabricate testimonials
  return [];
}

/**
 * Default page structure including all recommended sections
 */
export const DEFAULT_PAGE_STRUCTURE = [
  'hero',
  'stats-bar',
  'problem-solution',
  'features',
  'how-it-works',
  'social-proof',
  'faq',
  'final-cta'
];

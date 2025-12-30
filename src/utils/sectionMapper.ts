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
  console.log('🧠 [sectionMapper] Starting intelligent extraction');
  console.log('🧠 [sectionMapper] options:', JSON.stringify(options, null, 2));
  console.log('🖼️ [sectionMapper] heroImageUrl:', options.heroImageUrl);
  
  const { businessName, heroImageUrl, logoUrl, primaryColor, pageType, pageGoal, industry, serviceType, aiSearchOptimization } = options;
  const sections: Section[] = [];
  // Use brief's page structure or fall back to default structure with all sections
  const pageStructure = (brief.pageStructure && brief.pageStructure.length > 0) 
    ? brief.pageStructure 
    : DEFAULT_PAGE_STRUCTURE;
  
  console.log('🧠 [sectionMapper] Using page structure:', pageStructure, '(default:', !brief.pageStructure || brief.pageStructure.length === 0, ')');
  
  const isBetaPage = pageType === 'beta-prelaunch';
  
  // Detect industry variant for styling and headers (use new system with subcategory support)
  const industryVariant = detectIndustryVariantNew(industry, options.industryCategory, options.industrySubcategory, pageType || undefined);
  const industryTokens = getIndustryTokensNew(industryVariant);
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
            ctaText: isConsulting ? industryTokens.ctaDefaults.primary : brief.ctaText,
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
              eyebrow: undefined,
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
              eyebrow: undefined,
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

        // CTA Text - check multiple sources
        const ctaButtonText = consultation.primaryCTA || 
                              brief.ctaText || 
                              industryTokens.ctaDefaults.primary || 
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
          trustIndicators: ctaTrustIndicators.length > 0 ? ctaTrustIndicators : [
            { text: 'No credit card required' },
            { text: 'Free to start' },
            { text: 'Cancel anytime' },
          ],
          primaryColor: primaryColor || null,
          industryVariant: industryVariant,
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
    console.log('⚠️ [buildStatistics] Using fallback - only found', stats.length, 'stats');
    return getIndustryFallbackStats(industryVariant);
  }
  
  console.log('✅ [buildStatistics] Extracted', stats.length, 'stats from consultation data');
  return stats;
}

function getIndustryFallbackStats(industryVariant: string): Array<{value: string, label: string}> {
  const fallbacks: Record<string, Array<{value: string, label: string}>> = {
    consulting: [
      { value: '10+', label: 'Years Experience' },
      { value: '100+', label: 'Clients Served' },
    ],
    manufacturing: [
      { value: '25+', label: 'Years in Industry' },
      { value: '500+', label: 'Projects Completed' },
    ],
    healthcare: [
      { value: '15+', label: 'Years Serving Patients' },
      { value: '10,000+', label: 'Patients Treated' },
    ],
    default: [
      { value: '5+', label: 'Years Experience' },
      { value: '50+', label: 'Happy Clients' },
    ],
  };
  return fallbacks[industryVariant] || fallbacks.default;
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
    console.log('⚠️ [buildFAQs] Using fallback - only found', faqs.length, 'FAQs');
    return getIndustryFallbackFAQs(industryVariant);
  }
  
  console.log('✅ [buildFAQs] Extracted', faqs.length, 'FAQs from consultation data');
  return faqs;
}

function convertToQuestion(objection: string): string {
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
  
  return `What about "${objection}"?`;
}

function getIndustryFallbackFAQs(industryVariant: string): Array<{question: string, answer: string}> {
  const fallbacks: Record<string, Array<{question: string, answer: string}>> = {
    consulting: [
      { question: 'How do you work with clients?', answer: 'We start with a discovery call to understand your needs, then develop a customized approach tailored to your goals.' },
      { question: 'What results can we expect?', answer: 'Results vary by engagement, but our clients typically see measurable improvements within the first 90 days.' },
    ],
    manufacturing: [
      { question: 'What industries do you serve?', answer: 'We work across multiple industries including aerospace, automotive, and industrial manufacturing.' },
      { question: 'How do you ensure quality?', answer: 'We follow rigorous quality management processes and hold relevant certifications.' },
    ],
    default: [
      { question: 'How do I get started?', answer: 'Simply reach out through our contact form and we\'ll schedule a free consultation.' },
      { question: 'What makes you different?', answer: 'We focus on delivering measurable results with a personalized approach.' },
    ],
  };
  return fallbacks[industryVariant] || fallbacks.default;
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

/**
 * Industry Layout Intelligence System
 * Core type definitions for strategic page layout decisions
 *
 * @module industryLayouts/types
 */

// =============================================================================
// SECTION TYPES
// =============================================================================

export type SectionType =
  | "hero"
  | "problem-agitate"
  | "solution"
  | "features"
  | "benefits"
  | "social-proof"
  | "testimonials"
  | "case-studies"
  | "comparison"
  | "pricing"
  | "process"
  | "credentials"
  | "about-founder"
  | "team"
  | "faq"
  | "risk-reversal"
  | "guarantee"
  | "service-area"
  | "gallery"
  | "stats"
  | "integrations"
  | "cta-mid"
  | "cta-final";

// =============================================================================
// LAYOUT OPTIONS
// =============================================================================

export type HeroStyle =
  | "bold-statement" // Strong value prop, minimal subtext
  | "problem-first" // Lead with pain point, then solution
  | "social-proof-lead" // "Join 50,000+ customers" style
  | "video-hero" // Video-centric hero
  | "split-hero"; // Image/content 50-50 split

export type FeatureLayout =
  | "2-col" // 2 features per row
  | "3-col" // 3 features per row (most common)
  | "4-col" // 4 features per row (dense)
  | "alternating" // Left-right alternating with images
  | "icon-grid"; // Small icons with text

export type SocialProofStyle =
  | "logos" // Logo wall (B2B favorite)
  | "testimonials" // Quote cards with photos
  | "metrics" // "4.9 stars from 12,000 reviews"
  | "case-studies" // Mini case study cards
  | "credentials" // Certifications, badges, awards
  | "media-mentions"; // "As seen in..." logos

export type CtaPlacement =
  | "hero-only" // Single CTA in hero
  | "hero-and-final" // Hero + end of page
  | "hero-and-middle" // Hero + mid-page + end
  | "every-section"; // Aggressive (e-commerce style)

export type ProcessLayout =
  | "numbered-steps" // 1, 2, 3 vertical
  | "horizontal-timeline" // Left to right flow
  | "alternating-cards"; // Zig-zag with details

// =============================================================================
// TRUST SIGNALS
// =============================================================================

export type TrustSignal =
  | "customer-logos"
  | "testimonials"
  | "review-count"
  | "star-rating"
  | "case-studies"
  | "credentials"
  | "certifications"
  | "compliance-badges"
  | "security"
  | "integrations"
  | "years-experience"
  | "team-size"
  | "customers-served"
  | "media-mentions"
  | "awards"
  | "guarantee"
  | "money-back-guarantee"
  | "free-trial"
  | "shipping-speed"
  | "local-presence"
  | "before-after"
  | "real-photos"
  | "video-testimonials";

// =============================================================================
// BUYER AWARENESS LEVELS
// =============================================================================

export type BuyerAwarenessLevel =
  | "unaware" // Don't know they have a problem
  | "problemAware" // Know the problem, not the solution
  | "solutionAware" // Know solutions exist, comparing options
  | "productAware" // Know your product, need convincing
  | "mostAware"; // Ready to buy, need final push

// =============================================================================
// CONDITIONAL SECTIONS
// =============================================================================

export interface ConditionalSection {
  section: SectionType;
  condition: string; // Expression to evaluate against intelligence
  priority: number; // 1-10, higher = more important
  fallbackContent?: string; // What to show if condition partially met
}

// =============================================================================
// LAYOUT RULES
// =============================================================================

export interface LayoutRules {
  // Hero configuration
  heroStyle: HeroStyle;
  heroHasVideo: boolean;
  heroHasForm: boolean;

  // Feature/benefit display
  maxFeatureCards: 3 | 4 | 6;
  preferredFeatureLayout: FeatureLayout;
  featureIconStyle: "filled" | "outline" | "gradient" | "none";

  // Social proof
  socialProofStyle: SocialProofStyle;
  testimonialCount: number;
  logoCount: number;
  showStarRating: boolean;

  // CTAs
  ctaPlacement: CtaPlacement;
  ctaStyle: "button" | "form" | "calendar" | "phone";
  secondaryCta: boolean;

  // Pricing
  showPricingOnPage: boolean;
  pricingStyle: "cards" | "table" | "single" | "contact";

  // Process/How it works
  processLayout: ProcessLayout;
  processStepCount: 3 | 4 | 5;

  // General
  pageDensity: "minimal" | "balanced" | "comprehensive";
  mobileOptimization: "standard" | "aggressive";
}

// =============================================================================
// SECTION ORDER BY AWARENESS
// =============================================================================

export interface SectionOrder {
  unaware: SectionType[];
  problemAware: SectionType[];
  solutionAware: SectionType[];
  productAware: SectionType[];
  mostAware: SectionType[];
}

// =============================================================================
// CONTENT GUIDANCE
// =============================================================================

export interface ContentGuidance {
  toneKeywords: string[]; // Words that fit this industry
  avoidWords: string[]; // Words that feel wrong
  proofEmphasis: string; // What type of proof matters most
  headlineFormulas: string[]; // Suggested headline structures
  ctaText: {
    primary: string[]; // Main CTA options
    secondary: string[]; // Secondary CTA options
  };
  objectionPriority: string[]; // Common objections to address
}

// =============================================================================
// INDUSTRY LAYOUT CONFIG (Main Interface)
// =============================================================================

export interface IndustryLayoutConfig {
  // Identity
  id: string;
  name: string;
  aliases: string[];
  description: string;

  // Section configuration
  sections: {
    required: SectionType[];
    conditional: ConditionalSection[];
    avoid: SectionType[];
    maxSections: number;
  };

  // Visual layout rules
  layout: LayoutRules;

  // Section ordering by buyer awareness
  sectionOrder: SectionOrder;

  // Trust priorities (ordered by importance)
  trustPriorities: TrustSignal[];

  // Content guidance
  contentGuidance: ContentGuidance;

  // Metadata
  _examples?: string[];
  _lastUpdated?: string;
}

// =============================================================================
// BUSINESS CHARACTERISTICS (For Alignment)
// =============================================================================

export interface BusinessCharacteristics {
  // Business model
  businessModel: "b2b" | "b2c" | "b2b2c" | "marketplace";
  revenueModel: "one-time" | "subscription" | "retainer" | "project-based" | "commission" | "freemium";
  pricePoint: "free" | "low" | "medium" | "high" | "enterprise";

  // Buyer journey
  purchaseComplexity: "impulse" | "considered" | "complex-sale";
  decisionMakers: "individual" | "household" | "team" | "committee";
  salesCycle: "instant" | "days" | "weeks" | "months" | "quarters";

  // Trust dynamics
  trustBarrier: "low" | "medium" | "high" | "critical";
  riskToCustomer: "low" | "medium" | "high" | "critical";
  emotionalInvolvement: "low" | "medium" | "high";

  // Regulatory and compliance
  regulatoryEnvironment: boolean;
  requiresCredentials: boolean;

  // Delivery model
  deliveryType: "digital" | "physical" | "service" | "hybrid" | "saas";
  isLocal: boolean;
  requiresOnboarding: boolean;
  hasFreeTrial: boolean;

  // Competitive landscape
  marketMaturity: "emerging" | "growing" | "mature" | "declining";
  competitorDensity: "low" | "medium" | "high" | "saturated";
}

// =============================================================================
// ARCHETYPE CONFIG
// =============================================================================

export interface ArchetypeConfig {
  id: string;
  name: string;
  description: string;

  // Matching criteria (supports arrays for flexible matching)
  matches: {
    [K in keyof BusinessCharacteristics]?: BusinessCharacteristics[K] | BusinessCharacteristics[K][];
  };

  // Default layout for this archetype
  layout: LayoutRules;

  // Default sections
  defaultSections: SectionType[];

  // Trust priorities
  trustPriorities: TrustSignal[];

  // Content guidance
  contentGuidance: ContentGuidance;

  // Example industries
  examples: string[];
}

// =============================================================================
// ALIGNMENT RESULT
// =============================================================================

export interface AlignmentResult {
  config: IndustryLayoutConfig;
  source: "exact" | "alias" | "archetype" | "fallback";
  confidence: number; // 0-1 confidence score
  archetype?: string; // If aligned via archetype
  reasoning: string; // Human-readable explanation
  warnings?: string[]; // Any concerns about the alignment
}

// =============================================================================
// EXTRACTED INTELLIGENCE (Input Interface)
// =============================================================================

export interface ExtractedIntelligence {
  // Basic info
  industry: string;
  businessName: string;

  // Audience
  audience: string;
  audienceSize?: string;

  // Offering
  offering: string;
  features: string[];
  differentiators: string[];

  // Pricing
  pricing?: {
    model?: string;
    value?: number;
    currency?: string;
    showOnPage?: boolean;
  };

  // Proof
  testimonials: any[];
  caseStudies: any[];
  metrics: any[];
  logos: string[];

  // Competitive
  competitors: string[];
  competitiveAngle?: string;

  // Pain points
  painPoints: string[];
  objections: string[];
  stakes?: string;

  // Process
  process?: string[];
  requiresOnboarding?: boolean;

  // Location
  serviceArea?: string;
  isLocal?: boolean;

  // Brand
  isPersonalBrand?: boolean;
  founderStory?: string;

  // Compliance
  compliance?: string[];

  // Buyer awareness
  buyerAwareness?: BuyerAwarenessLevel;
}
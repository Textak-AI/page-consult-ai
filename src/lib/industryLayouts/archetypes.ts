/**
 * Industry Archetypes
 * Meta-categories that capture common business patterns across industries
 *
 * When an exact industry match isn't found, we align to the closest archetype
 * based on business characteristics.
 *
 * @module industryLayouts/archetypes
 */

import { ArchetypeConfig, LayoutRules, ContentGuidance } from "./types";

// =============================================================================
// DEFAULT LAYOUTS (Reusable Base Configs)
// =============================================================================

const defaultB2BLayout: LayoutRules = {
  heroStyle: "bold-statement",
  heroHasVideo: false,
  heroHasForm: false,
  maxFeatureCards: 4,
  preferredFeatureLayout: "2-col",
  featureIconStyle: "filled",
  socialProofStyle: "logos",
  testimonialCount: 2,
  logoCount: 6,
  showStarRating: false,
  ctaPlacement: "hero-and-middle",
  ctaStyle: "button",
  secondaryCta: true,
  showPricingOnPage: false,
  pricingStyle: "contact",
  processLayout: "numbered-steps",
  processStepCount: 3,
  pageDensity: "balanced",
  mobileOptimization: "standard",
};

const defaultB2CLayout: LayoutRules = {
  heroStyle: "social-proof-lead",
  heroHasVideo: false,
  heroHasForm: false,
  maxFeatureCards: 6,
  preferredFeatureLayout: "3-col",
  featureIconStyle: "gradient",
  socialProofStyle: "metrics",
  testimonialCount: 4,
  logoCount: 0,
  showStarRating: true,
  ctaPlacement: "every-section",
  ctaStyle: "button",
  secondaryCta: false,
  showPricingOnPage: true,
  pricingStyle: "cards",
  processLayout: "horizontal-timeline",
  processStepCount: 3,
  pageDensity: "balanced",
  mobileOptimization: "aggressive",
};

const defaultServiceLayout: LayoutRules = {
  heroStyle: "problem-first",
  heroHasVideo: false,
  heroHasForm: false,
  maxFeatureCards: 3,
  preferredFeatureLayout: "alternating",
  featureIconStyle: "outline",
  socialProofStyle: "testimonials",
  testimonialCount: 3,
  logoCount: 0,
  showStarRating: false,
  ctaPlacement: "hero-and-middle",
  ctaStyle: "calendar",
  secondaryCta: true,
  showPricingOnPage: false,
  pricingStyle: "contact",
  processLayout: "numbered-steps",
  processStepCount: 4,
  pageDensity: "balanced",
  mobileOptimization: "standard",
};

// =============================================================================
// ARCHETYPES
// =============================================================================

export const archetypes: Record<string, ArchetypeConfig> = {
  // =========================================================================
  // ENTERPRISE SALE
  // High-value B2B with committee decisions and long sales cycles
  // =========================================================================
  "enterprise-sale": {
    id: "enterprise-sale",
    name: "Enterprise Sale",
    description:
      "High-value B2B products/services with complex buying processes, multiple stakeholders, and long sales cycles",

    matches: {
      businessModel: "b2b",
      purchaseComplexity: "complex-sale",
      pricePoint: ["high", "enterprise"],
      decisionMakers: ["team", "committee"],
      salesCycle: ["weeks", "months", "quarters"],
    },

    layout: {
      ...defaultB2BLayout,
      heroStyle: "bold-statement",
      maxFeatureCards: 4,
      socialProofStyle: "logos",
      ctaPlacement: "hero-and-middle",
      ctaStyle: "button",
    },

    defaultSections: [
      "hero",
      "social-proof", // Logo wall early for credibility
      "features",
      "case-studies",
      "comparison",
      "integrations",
      "faq",
      "cta-final",
    ],

    trustPriorities: [
      "customer-logos",
      "case-studies",
      "security",
      "compliance-badges",
      "integrations",
      "certifications",
    ],

    contentGuidance: {
      toneKeywords: ["enterprise-grade", "scalable", "secure", "compliant", "proven", "trusted"],
      avoidWords: ["cheap", "basic", "simple", "easy"], // Undermines enterprise positioning
      proofEmphasis: "Focus on ROI metrics, enterprise customer logos, and security certifications",
      headlineFormulas: [
        "The [industry] platform trusted by [impressive customers]",
        "[Outcome] for enterprise [audience]",
        "How [big company names] achieve [outcome]",
      ],
      ctaText: {
        primary: ["Schedule a Demo", "Request a Demo", "Talk to Sales", "Get Started"],
        secondary: ["See Pricing", "View Case Studies", "Download Report"],
      },
      objectionPriority: ["security", "integration", "implementation time", "total cost", "support"],
    },

    examples: ["SaaS B2B", "Enterprise Software", "Industrial Equipment", "Business Services", "Cybersecurity"],
  },

  // =========================================================================
  // TRUSTED ADVISOR
  // Expertise-driven services where credibility and relationships matter
  // =========================================================================
  "trusted-advisor": {
    id: "trusted-advisor",
    name: "Trusted Advisor",
    description: "Professional services where expertise, trust, and relationships drive the sale",

    matches: {
      deliveryType: "service",
      revenueModel: ["retainer", "project-based"],
      trustBarrier: ["high", "critical"],
      purchaseComplexity: "considered",
      requiresCredentials: true,
    },

    layout: {
      ...defaultServiceLayout,
      heroStyle: "problem-first",
      maxFeatureCards: 3,
      preferredFeatureLayout: "alternating",
      socialProofStyle: "testimonials",
      ctaStyle: "calendar",
    },

    defaultSections: [
      "hero",
      "problem-agitate",
      "credentials",
      "process",
      "case-studies",
      "testimonials",
      "about-founder",
      "faq",
      "cta-final",
    ],

    trustPriorities: ["testimonials", "credentials", "case-studies", "years-experience", "media-mentions", "awards"],

    contentGuidance: {
      toneKeywords: ["strategic", "expert", "proven", "results", "partner", "trusted"],
      avoidWords: ["cheap", "fast", "easy", "discount"], // Undermines premium positioning
      proofEmphasis: "Lead with client transformation stories and measurable results",
      headlineFormulas: [
        "[Outcome] for [specific audience] who [pain point]",
        "Stop [bad outcome]. Start [good outcome].",
        "The [methodology] that helped [impressive result]",
      ],
      ctaText: {
        primary: ["Book a Strategy Call", "Schedule Consultation", "Get Expert Help"],
        secondary: ["Download Guide", "See Case Studies", "Learn More"],
      },
      objectionPriority: ["cost justification", "time commitment", "guaranteed results", "fit for my situation"],
    },

    examples: ["Consulting", "Coaching", "Agencies", "Legal", "Accounting", "Financial Advisory"],
  },

  // =========================================================================
  // CONSUMER PRODUCT
  // B2C products with emotional/impulse purchase dynamics
  // =========================================================================
  "consumer-product": {
    id: "consumer-product",
    name: "Consumer Product",
    description:
      "Direct-to-consumer products where emotional appeal, social proof, and friction-free purchase drive conversion",

    matches: {
      businessModel: "b2c",
      deliveryType: ["physical", "digital"],
      purchaseComplexity: "impulse",
      pricePoint: ["free", "low", "medium"],
      salesCycle: "instant",
      decisionMakers: "individual",
    },

    layout: {
      ...defaultB2CLayout,
      heroStyle: "social-proof-lead",
      maxFeatureCards: 6,
      socialProofStyle: "metrics",
      ctaPlacement: "every-section",
      showPricingOnPage: true,
    },

    defaultSections: [
      "hero",
      "benefits",
      "social-proof",
      "features",
      "testimonials",
      "comparison",
      "guarantee",
      "faq",
      "cta-final",
    ],

    trustPriorities: [
      "review-count",
      "star-rating",
      "money-back-guarantee",
      "shipping-speed",
      "real-photos",
      "video-testimonials",
    ],

    contentGuidance: {
      toneKeywords: ["love", "obsessed", "finally", "discover", "join", "game-changer"],
      avoidWords: ["enterprise", "solution", "leverage", "synergy"], // Too corporate
      proofEmphasis: "Star ratings, review counts, user-generated photos, and social proof numbers",
      headlineFormulas: [
        "Join [number]+ [audience] who [positive outcome]",
        "Finally, [product category] that [key benefit]",
        "The [product] that [impressive claim] in [timeframe]",
      ],
      ctaText: {
        primary: ["Shop Now", "Buy Now", "Get Yours", "Add to Cart", "Try It Free"],
        secondary: ["Learn More", "See Reviews", "Compare Plans"],
      },
      objectionPriority: ["does it actually work", "is it worth the price", "shipping/returns", "quality concerns"],
    },

    examples: ["E-commerce", "DTC Brands", "Consumer Apps", "Subscription Boxes", "Beauty Products"],
  },

  // =========================================================================
  // LOCAL SERVICE
  // Location-based services serving local customers
  // =========================================================================
  "local-service": {
    id: "local-service",
    name: "Local Service",
    description: "Service businesses serving a specific geographic area where trust, reviews, and availability matter",

    matches: {
      isLocal: true,
      deliveryType: "service",
      decisionMakers: ["individual", "household"],
      salesCycle: ["instant", "days"],
      trustBarrier: ["medium", "high"],
    },

    layout: {
      ...defaultServiceLayout,
      heroStyle: "problem-first",
      maxFeatureCards: 3,
      preferredFeatureLayout: "3-col",
      socialProofStyle: "testimonials",
      ctaStyle: "phone",
      ctaPlacement: "hero-and-middle",
    },

    defaultSections: [
      "hero",
      "benefits",
      "testimonials",
      "process",
      "service-area",
      "credentials",
      "gallery",
      "faq",
      "cta-final",
    ],

    trustPriorities: [
      "review-count",
      "star-rating",
      "years-experience",
      "local-presence",
      "testimonials",
      "certifications",
      "real-photos",
    ],

    contentGuidance: {
      toneKeywords: ["local", "trusted", "reliable", "fast", "professional", "family-owned"],
      avoidWords: ["enterprise", "global", "cutting-edge", "disruptive"],
      proofEmphasis: "Google reviews, years in business, local testimonials with full names",
      headlineFormulas: [
        "[City]'s Most Trusted [Service Type]",
        "Professional [Service] in [Area] - [Years]+ Years Experience",
        "[Problem]? [City]'s #1 Rated [Service] Can Help",
      ],
      ctaText: {
        primary: ["Call Now", "Get Free Quote", "Book Online", "Schedule Service"],
        secondary: ["See Our Work", "Read Reviews", "Service Areas"],
      },
      objectionPriority: ["pricing transparency", "availability/speed", "trustworthiness", "quality of work"],
    },

    examples: ["Plumbers", "Dentists", "Restaurants", "Salons", "Contractors", "Home Services", "Auto Repair"],
  },

  // =========================================================================
  // REGULATED TRUST
  // Industries with compliance requirements and high customer risk
  // =========================================================================
  "regulated-trust": {
    id: "regulated-trust",
    name: "Regulated Trust",
    description: "Industries where compliance, credentials, and risk mitigation are primary purchase drivers",

    matches: {
      regulatoryEnvironment: true,
      riskToCustomer: ["high", "critical"],
      trustBarrier: ["high", "critical"],
      requiresCredentials: true,
    },

    layout: {
      ...defaultB2BLayout,
      heroStyle: "bold-statement",
      maxFeatureCards: 4,
      preferredFeatureLayout: "2-col",
      socialProofStyle: "credentials",
      ctaPlacement: "hero-and-middle",
      ctaStyle: "button",
    },

    defaultSections: ["hero", "credentials", "benefits", "process", "social-proof", "testimonials", "faq", "cta-final"],

    trustPriorities: [
      "certifications",
      "compliance-badges",
      "credentials",
      "security",
      "testimonials",
      "years-experience",
      "awards",
    ],

    contentGuidance: {
      toneKeywords: ["compliant", "certified", "secure", "trusted", "experienced", "professional"],
      avoidWords: ["revolutionary", "disruptive", "experimental", "new approach"],
      proofEmphasis: "Certifications, compliance badges, professional credentials, industry affiliations",
      headlineFormulas: [
        "Trusted [Service] from Certified [Professionals]",
        "[Outcome] with Full [Compliance/Regulatory] Peace of Mind",
        "Secure, Compliant [Service] for [Audience]",
      ],
      ctaText: {
        primary: ["Schedule Consultation", "Request Information", "Speak with Specialist"],
        secondary: ["View Credentials", "Download Compliance Info", "Learn More"],
      },
      objectionPriority: ["credentials/qualifications", "compliance concerns", "data security", "liability"],
    },

    examples: ["Healthcare", "Financial Services", "Insurance", "Legal", "Pharmaceuticals", "Medical Devices"],
  },

  // =========================================================================
  // TRANSFORMATION PROMISE
  // Services promising significant life/business transformation
  // =========================================================================
  "transformation-promise": {
    id: "transformation-promise",
    name: "Transformation Promise",
    description:
      "Services that promise significant personal or business transformation with emotional purchase drivers",

    matches: {
      deliveryType: "service",
      purchaseComplexity: "considered",
      riskToCustomer: "medium",
      emotionalInvolvement: "high",
    },

    layout: {
      ...defaultServiceLayout,
      heroStyle: "problem-first",
      maxFeatureCards: 3,
      preferredFeatureLayout: "alternating",
      socialProofStyle: "case-studies",
      ctaPlacement: "hero-and-middle",
    },

    defaultSections: [
      "hero",
      "problem-agitate",
      "solution",
      "process",
      "case-studies",
      "testimonials",
      "about-founder",
      "guarantee",
      "faq",
      "cta-final",
    ],

    trustPriorities: ["before-after", "testimonials", "video-testimonials", "case-studies", "guarantee", "credentials"],

    contentGuidance: {
      toneKeywords: ["transform", "breakthrough", "finally", "discover", "unlock", "achieve"],
      avoidWords: ["maybe", "try", "might", "hope"], // Need certainty
      proofEmphasis: "Before/after results, transformation stories, specific outcome metrics",
      headlineFormulas: [
        "From [Before State] to [After State] in [Timeframe]",
        "The [Method] That [Impressive Transformation Result]",
        "Stop [Pain Point]. Start [Desired Outcome].",
      ],
      ctaText: {
        primary: ["Start Your Transformation", "Begin Your Journey", "Get Started Today"],
        secondary: ["See Success Stories", "Take the Quiz", "Download Free Guide"],
      },
      objectionPriority: ["will this work for me", "time commitment", "cost justification", "what if it doesn't work"],
    },

    examples: ["Fitness", "Weight Loss", "Career Coaching", "Life Coaching", "Education", "Rehab Services"],
  },

  // =========================================================================
  // HIGH-TICKET CONSUMER
  // Premium B2C with considered purchase and research phase
  // =========================================================================
  "high-ticket-consumer": {
    id: "high-ticket-consumer",
    name: "High-Ticket Consumer",
    description: "Premium consumer products/services with longer consideration cycles and research-heavy buyers",

    matches: {
      businessModel: "b2c",
      pricePoint: ["high", "enterprise"],
      purchaseComplexity: "considered",
      salesCycle: ["days", "weeks"],
      decisionMakers: ["individual", "household"],
    },

    layout: {
      ...defaultB2CLayout,
      heroStyle: "social-proof-lead",
      maxFeatureCards: 4,
      preferredFeatureLayout: "2-col",
      socialProofStyle: "testimonials",
      ctaPlacement: "hero-and-middle",
      showPricingOnPage: true,
      pricingStyle: "cards",
    },

    defaultSections: [
      "hero",
      "benefits",
      "social-proof",
      "features",
      "comparison",
      "testimonials",
      "faq",
      "guarantee",
      "pricing",
      "cta-final",
    ],

    trustPriorities: [
      "testimonials",
      "video-testimonials",
      "guarantee",
      "money-back-guarantee",
      "real-photos",
      "media-mentions",
      "comparison",
    ],

    contentGuidance: {
      toneKeywords: ["premium", "exclusive", "proven", "transformative", "invest in yourself"],
      avoidWords: ["cheap", "basic", "limited", "restricted"],
      proofEmphasis: "Detailed testimonials, comparison to alternatives, strong guarantee",
      headlineFormulas: [
        "The [Product/Service] [Audience] Rave About",
        "Why [Number]+ [Audience] Choose [Product] Over [Alternative]",
        "Finally, [Product Category] That Actually [Key Outcome]",
      ],
      ctaText: {
        primary: ["Enroll Now", "Get Started", "Join Now", "Apply Today"],
        secondary: ["See Full Curriculum", "Compare Plans", "Watch Free Training"],
      },
      objectionPriority: [
        "is it worth the investment",
        "will I get results",
        "what makes this different",
        "refund policy",
      ],
    },

    examples: ["Online Courses", "Luxury Goods", "High-End Services", "Travel Packages", "Home Improvement"],
  },

  // =========================================================================
  // SAAS PROSUMER
  // Self-serve software with individual buyers and quick decisions
  // =========================================================================
  "saas-prosumer": {
    id: "saas-prosumer",
    name: "SaaS Prosumer",
    description: "Self-serve software tools for individuals or small teams with product-led growth",

    matches: {
      businessModel: ["b2c", "b2b"],
      deliveryType: ["digital", "saas"],
      revenueModel: ["subscription", "freemium"],
      purchaseComplexity: ["impulse", "considered"],
      decisionMakers: ["individual", "team"],
      hasFreeTrial: true,
    },

    layout: {
      heroStyle: "bold-statement",
      heroHasVideo: true,
      heroHasForm: false,
      maxFeatureCards: 4,
      preferredFeatureLayout: "3-col",
      featureIconStyle: "gradient",
      socialProofStyle: "metrics",
      testimonialCount: 3,
      logoCount: 4,
      showStarRating: true,
      ctaPlacement: "every-section",
      ctaStyle: "button",
      secondaryCta: true,
      showPricingOnPage: true,
      pricingStyle: "cards",
      processLayout: "horizontal-timeline",
      processStepCount: 3,
      pageDensity: "balanced",
      mobileOptimization: "aggressive",
    },

    defaultSections: [
      "hero",
      "social-proof",
      "features",
      "process",
      "testimonials",
      "pricing",
      "integrations",
      "faq",
      "cta-final",
    ],

    trustPriorities: ["review-count", "star-rating", "customer-logos", "free-trial", "integrations", "security"],

    contentGuidance: {
      toneKeywords: ["simple", "powerful", "fast", "free to start", "no credit card", "instant"],
      avoidWords: ["enterprise-only", "contact sales", "custom pricing", "complex"],
      proofEmphasis: "User counts, ratings, quick time-to-value, integrations",
      headlineFormulas: [
        "[Outcome] in Minutes, Not [Longer Time]",
        "The [Product Category] [Audience] Actually Enjoy Using",
        "Free [Product] That [Key Benefit] - No Credit Card Required",
      ],
      ctaText: {
        primary: ["Start Free", "Try It Free", "Get Started Free", "Sign Up Free"],
        secondary: ["See Pricing", "Watch Demo", "View Templates"],
      },
      objectionPriority: ["ease of use", "learning curve", "integrations", "pricing/limits"],
    },

    examples: ["Productivity Apps", "Creator Tools", "Design Software", "Developer Tools", "Small Business SaaS"],
  },

  // =========================================================================
  // NONPROFIT / CAUSE
  // Mission-driven organizations seeking donors, volunteers, or supporters
  // =========================================================================
  "nonprofit-cause": {
    id: "nonprofit-cause",
    name: "Nonprofit / Cause",
    description: "Mission-driven organizations where impact storytelling and trust drive engagement",

    matches: {
      businessModel: "b2c",
      revenueModel: ["one-time", "subscription"], // Donations
      emotionalInvolvement: "high",
      trustBarrier: "high",
    },

    layout: {
      ...defaultServiceLayout,
      heroStyle: "problem-first",
      maxFeatureCards: 3,
      preferredFeatureLayout: "alternating",
      socialProofStyle: "case-studies",
      ctaPlacement: "hero-and-middle",
      ctaStyle: "button",
    },

    defaultSections: [
      "hero",
      "problem-agitate",
      "solution",
      "stats",
      "case-studies",
      "process",
      "testimonials",
      "team",
      "cta-final",
    ],

    trustPriorities: [
      "certifications", // Charity ratings
      "case-studies",
      "testimonials",
      "credentials",
      "media-mentions",
      "real-photos",
    ],

    contentGuidance: {
      toneKeywords: ["impact", "together", "change", "community", "support", "join"],
      avoidWords: ["profit", "ROI", "efficiency", "leverage"],
      proofEmphasis: "Impact metrics, beneficiary stories, charity ratings, transparency",
      headlineFormulas: [
        "Help [Beneficiary] [Achieve Outcome]",
        "Your [Small Action] Creates [Big Impact]",
        "Together, We Can [Mission Goal]",
      ],
      ctaText: {
        primary: ["Donate Now", "Join Us", "Support Our Mission", "Get Involved"],
        secondary: ["Learn More", "See Our Impact", "Volunteer"],
      },
      objectionPriority: ["where does money go", "actual impact", "organizational overhead", "trustworthiness"],
    },

    examples: ["Charities", "Foundations", "Advocacy Groups", "Social Enterprises", "Community Organizations"],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all archetype IDs
 */
export function getArchetypeIds(): string[] {
  return Object.keys(archetypes);
}

/**
 * Get archetype by ID
 */
export function getArchetype(id: string): ArchetypeConfig | undefined {
  return archetypes[id];
}

/**
 * Get default/fallback archetype
 */
export function getDefaultArchetype(): ArchetypeConfig {
  return archetypes["trusted-advisor"]; // Most versatile
}

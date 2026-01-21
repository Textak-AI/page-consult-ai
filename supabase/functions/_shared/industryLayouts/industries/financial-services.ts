/**
 * Financial Services Industry Layout Configuration
 *
 * Characteristics:
 * - High trust barrier - handling people's money
 * - Regulatory compliance is critical
 * - Credentials and certifications mandatory
 * - Conservative, trustworthy design
 */

import { IndustryLayoutConfig } from "../types.ts";

export const financialServices: IndustryLayoutConfig = {
  id: "financial-services",
  name: "Financial Services",
  description: "Financial advisory, banking, insurance, and fintech services",
  aliases: [
    "financial",
    "finance",
    "financial advisor",
    "financial planning",
    "wealth management",
    "investment",
    "insurance",
    "banking",
    "fintech",
    "accounting",
    "tax",
    "bookkeeping",
    "cpa",
    "cfp",
  ],

  sections: {
    required: ["hero", "credentials", "benefits", "cta-final"],
    conditional: [
      { section: "process", condition: "true", priority: 9 }, // Always show process
      { section: "testimonials", condition: "intelligence.testimonials.length > 0", priority: 8 },
      { section: "case-studies", condition: "intelligence.caseStudies.length > 0", priority: 7 },
      { section: "about-founder", condition: "intelligence.isPersonalBrand === true", priority: 6 },
      { section: "faq", condition: "intelligence.objections.length > 1", priority: 7 },
      { section: "social-proof", condition: "intelligence.logos.length > 2", priority: 5 },
    ],
    avoid: ["guarantee", "comparison", "pricing"], // Can't guarantee financial outcomes
    maxSections: 8,
  },

  layout: {
    heroStyle: "bold-statement",
    heroHasVideo: false,
    heroHasForm: false,
    maxFeatureCards: 4,
    preferredFeatureLayout: "2-col",
    featureIconStyle: "filled",
    socialProofStyle: "credentials",
    testimonialCount: 2,
    logoCount: 4, // Certifications: CFP, CPA, FINRA, etc.
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
  },

  sectionOrder: {
    unaware: ["hero", "problem-agitate", "solution", "credentials", "process", "testimonials", "cta-final"],
    problemAware: ["hero", "benefits", "credentials", "process", "case-studies", "testimonials", "cta-final"],
    solutionAware: ["hero", "credentials", "process", "testimonials", "about-founder", "faq", "cta-final"],
    productAware: ["hero", "credentials", "process", "faq", "cta-final"],
    mostAware: ["hero", "credentials", "cta-final"],
  },

  trustPriorities: [
    "credentials",
    "certifications",
    "compliance-badges",
    "years-experience",
    "security",
    "testimonials",
    "awards",
    "media-mentions",
  ],

  contentGuidance: {
    toneKeywords: [
      "trusted",
      "secure",
      "fiduciary",
      "experienced",
      "transparent",
      "compliant",
      "independent",
      "personalized",
    ],
    avoidWords: [
      "guaranteed returns", // Compliance issue
      "risk-free", // Compliance issue
      "get rich",
      "easy money",
      "secret",
      "loophole",
    ],
    proofEmphasis:
      "CFP/CPA/Series credentials, regulatory compliance, years of experience, assets under management (if applicable), fiduciary status.",
    headlineFormulas: [
      "Trusted [Service] from a [Credential] [Professional]",
      "Your Financial Future Deserves [Adjective] Guidance",
      "[Service] That Puts Your Interests First - Always",
      "Independent [Service] in [Location] - Fee-Only, Fiduciary",
    ],
    ctaText: {
      primary: ["Schedule Consultation", "Request Free Review", "Book a Call", "Get Started"],
      secondary: ["View Our Services", "Meet the Team", "Our Approach", "Client Resources"],
    },
    objectionPriority: [
      "credentials / fiduciary status",
      "fee structure / transparency",
      "experience / track record",
      "personalization / fit",
      "data security",
      "communication style",
    ],
  },

  _examples: [
    "Financial advisors",
    "Wealth management",
    "Insurance agencies",
    "Accounting firms",
    "Tax preparation",
    "Fintech platforms",
  ],
  _lastUpdated: "2026-01-21",
};

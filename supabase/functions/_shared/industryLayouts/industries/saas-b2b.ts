/**
 * SaaS B2B Industry Layout Configuration
 *
 * Characteristics:
 * - Complex buying cycles with multiple stakeholders
 * - Heavy emphasis on integrations and security
 * - Logo walls and case studies drive credibility
 * - Free trial or demo-first conversion
 */

import { IndustryLayoutConfig } from "../types.ts";

export const saasB2B: IndustryLayoutConfig = {
  id: "saas-b2b",
  name: "SaaS B2B",
  description: "Business-to-business software-as-a-service products",
  aliases: [
    "software",
    "enterprise software",
    "b2b saas",
    "business software",
    "cloud software",
    "b2b software",
    "saas platform",
    "software platform",
    "enterprise saas",
  ],

  sections: {
    required: ["hero", "features", "social-proof", "cta-final"],
    conditional: [
      { section: "comparison", condition: "intelligence.competitors.length > 0", priority: 8 },
      { section: "pricing", condition: "intelligence.pricing?.showOnPage === true", priority: 7 },
      { section: "case-studies", condition: "intelligence.caseStudies.length > 0", priority: 9 },
      { section: "faq", condition: "intelligence.objections.length > 2", priority: 6 },
      {
        section: "integrations",
        condition: 'intelligence.features.some(f => f.toLowerCase().includes("integrat"))',
        priority: 7,
      },
      { section: "process", condition: "intelligence.requiresOnboarding === true", priority: 5 },
      { section: "testimonials", condition: "intelligence.testimonials.length > 0", priority: 8 },
    ],
    avoid: ["guarantee", "risk-reversal", "about-founder"], // SaaS uses free trials, not guarantees
    maxSections: 9,
  },

  layout: {
    heroStyle: "bold-statement",
    heroHasVideo: true,
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
    pricingStyle: "cards",
    processLayout: "numbered-steps",
    processStepCount: 3,
    pageDensity: "balanced",
    mobileOptimization: "standard",
  },

  sectionOrder: {
    unaware: ["hero", "problem-agitate", "solution", "features", "social-proof", "testimonials", "cta-final"],
    problemAware: ["hero", "features", "social-proof", "case-studies", "comparison", "cta-final"],
    solutionAware: ["hero", "comparison", "features", "case-studies", "integrations", "pricing", "cta-final"],
    productAware: ["hero", "case-studies", "pricing", "integrations", "faq", "cta-final"],
    mostAware: ["hero", "pricing", "faq", "cta-final"],
  },

  trustPriorities: [
    "customer-logos",
    "security",
    "integrations",
    "case-studies",
    "certifications",
    "compliance-badges",
    "testimonials",
  ],

  contentGuidance: {
    toneKeywords: [
      "efficient",
      "scalable",
      "seamless",
      "powerful",
      "intelligent",
      "automated",
      "enterprise-grade",
      "secure",
    ],
    avoidWords: [
      "revolutionary", // Overused
      "disruptive", // Cliché
      "game-changing", // Meaningless
      "synergy", // Corporate speak
      "leverage", // Jargon
    ],
    proofEmphasis: "Focus on ROI metrics, time saved, and enterprise customer logos. Quantify outcomes.",
    headlineFormulas: [
      "[Outcome] for [audience] - without [pain point]",
      "The [category] platform trusted by [impressive customers]",
      "How [company type] achieve [specific metric] with [product]",
      "[Action verb] your [process] in [timeframe]",
    ],
    ctaText: {
      primary: ["Start Free Trial", "Get a Demo", "Start Free", "Try It Free"],
      secondary: ["See Pricing", "Watch Demo", "View Case Studies", "Talk to Sales"],
    },
    objectionPriority: [
      "security concerns",
      "integration complexity",
      "implementation time",
      "total cost of ownership",
      "support quality",
      "data migration",
    ],
  },

  _examples: [
    "CRM platforms",
    "Project management tools",
    "HR software",
    "Marketing automation",
    "Analytics platforms",
    "Communication tools",
  ],
  _lastUpdated: "2026-01-21",
};

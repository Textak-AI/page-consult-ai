/**
 * Real Estate Industry Layout Configuration
 *
 * Characteristics:
 * - High-value, emotional purchase decision
 * - Local expertise and market knowledge matter
 * - Visual/gallery content is critical
 * - Personal trust with agent is key
 */

import { IndustryLayoutConfig } from "../types.ts";

export const realEstate: IndustryLayoutConfig = {
  id: "real-estate",
  name: "Real Estate",
  description: "Real estate agents, brokers, and property services",
  aliases: [
    "real estate",
    "realtor",
    "real estate agent",
    "broker",
    "property",
    "property management",
    "home buying",
    "home selling",
    "mortgage",
    "lending",
  ],

  sections: {
    required: ["hero", "credentials", "testimonials", "cta-final"],
    conditional: [
      { section: "service-area", condition: "intelligence.serviceArea != null", priority: 9 },
      { section: "about-founder", condition: "true", priority: 8 }, // Personal brand always matters
      { section: "process", condition: "true", priority: 7 },
      { section: "case-studies", condition: "intelligence.caseStudies.length > 0", priority: 7 },
      { section: "stats", condition: "intelligence.metrics.length > 0", priority: 6 },
      { section: "faq", condition: "intelligence.objections.length > 1", priority: 5 },
    ],
    avoid: ["comparison", "pricing", "integrations"],
    maxSections: 8,
  },

  layout: {
    heroStyle: "bold-statement",
    heroHasVideo: false,
    heroHasForm: true, // Search or contact
    maxFeatureCards: 3,
    preferredFeatureLayout: "3-col",
    featureIconStyle: "filled",
    socialProofStyle: "testimonials",
    testimonialCount: 3,
    logoCount: 0,
    showStarRating: true,
    ctaPlacement: "hero-and-middle",
    ctaStyle: "phone",
    secondaryCta: true,
    showPricingOnPage: false,
    pricingStyle: "contact",
    processLayout: "numbered-steps",
    processStepCount: 4,
    pageDensity: "balanced",
    mobileOptimization: "aggressive",
  },

  sectionOrder: {
    unaware: [
      "hero",
      "problem-agitate",
      "credentials",
      "process",
      "about-founder",
      "testimonials",
      "service-area",
      "cta-final",
    ],
    problemAware: ["hero", "benefits", "credentials", "stats", "testimonials", "about-founder", "cta-final"],
    solutionAware: ["hero", "about-founder", "stats", "testimonials", "process", "cta-final"],
    productAware: ["hero", "testimonials", "about-founder", "cta-final"],
    mostAware: ["hero", "cta-final"],
  },

  trustPriorities: [
    "testimonials",
    "review-count",
    "star-rating",
    "years-experience",
    "local-presence",
    "customers-served",
    "credentials",
    "awards",
  ],

  contentGuidance: {
    toneKeywords: [
      "local expert",
      "trusted",
      "experienced",
      "dedicated",
      "knowledgeable",
      "committed",
      "personalized",
      "results",
    ],
    avoidWords: ["pushy", "aggressive", "salesperson", "cheap", "discount"],
    proofEmphasis:
      "Homes sold, average days on market, sale-to-list price ratio, client testimonials with specific outcomes. Local market expertise.",
    headlineFormulas: [
      "[City]'s Trusted [Agent Type] - [Number]+ Homes Sold",
      "Buy or Sell Your [Area] Home with a Local Expert",
      "Your [Area] Real Estate Journey Starts Here",
      "[Number] Years Helping [City] Families Find Home",
    ],
    ctaText: {
      primary: ["Get Home Valuation", "Schedule Consultation", "Start Your Search", "Contact Me"],
      secondary: ["View Listings", "See Sold Homes", "Market Report", "About Me"],
    },
    objectionPriority: [
      "why choose this agent",
      "local market knowledge",
      "commission / fees",
      "communication style",
      "experience level",
      "availability",
    ],
  },

  _examples: ["Real estate agents", "Brokerages", "Property managers", "Mortgage brokers", "Home builders"],
  _lastUpdated: "2026-01-21",
};

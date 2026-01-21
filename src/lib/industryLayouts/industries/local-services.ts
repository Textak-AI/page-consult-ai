/**
 * Local Services Industry Layout Configuration
 *
 * Characteristics:
 * - Serving a specific geographic area
 * - Reviews and local reputation matter most
 * - Availability and response time critical
 * - Phone/contact CTAs prominent
 */

import { IndustryLayoutConfig } from "../types";

export const localServices: IndustryLayoutConfig = {
  id: "local-services",
  name: "Local Services",
  description: "Service businesses serving a specific geographic area",
  aliases: [
    "local",
    "plumber",
    "plumbing",
    "electrician",
    "hvac",
    "contractor",
    "home services",
    "lawn care",
    "landscaping",
    "cleaning",
    "maid service",
    "handyman",
    "auto repair",
    "mechanic",
    "salon",
    "barber",
    "spa",
    "restaurant",
    "catering",
    "moving",
    "storage",
    "pest control",
    "roofing",
    "painting",
  ],

  sections: {
    required: ["hero", "benefits", "testimonials", "cta-final"],
    conditional: [
      { section: "service-area", condition: "intelligence.serviceArea != null", priority: 9 },
      { section: "process", condition: "intelligence.process?.length > 0", priority: 7 },
      { section: "gallery", condition: "true", priority: 6 }, // Show work examples
      { section: "credentials", condition: "intelligence.compliance?.length > 0", priority: 5 },
      { section: "faq", condition: "intelligence.objections.length > 1", priority: 5 },
      { section: "pricing", condition: "intelligence.pricing?.showOnPage === true", priority: 4 },
    ],
    avoid: ["case-studies", "comparison", "integrations"], // Too corporate for local
    maxSections: 7,
  },

  layout: {
    heroStyle: "problem-first",
    heroHasVideo: false,
    heroHasForm: true, // Contact form in hero
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
    processStepCount: 3,
    pageDensity: "balanced",
    mobileOptimization: "aggressive", // Many local searches are mobile
  },

  sectionOrder: {
    unaware: ["hero", "problem-agitate", "benefits", "testimonials", "process", "service-area", "cta-final"],
    problemAware: ["hero", "benefits", "testimonials", "gallery", "service-area", "cta-final"],
    solutionAware: ["hero", "testimonials", "gallery", "credentials", "faq", "cta-final"],
    productAware: ["hero", "testimonials", "faq", "cta-final"],
    mostAware: [
      "hero",
      "cta-final", // They just need to contact you
    ],
  },

  trustPriorities: [
    "review-count",
    "star-rating",
    "years-experience",
    "local-presence",
    "testimonials",
    "real-photos",
    "certifications",
  ],

  contentGuidance: {
    toneKeywords: ["local", "trusted", "reliable", "fast", "professional", "family-owned", "licensed", "insured"],
    avoidWords: ["enterprise", "global", "scalable", "disruptive", "cutting-edge"],
    proofEmphasis:
      "Google reviews, years in business, local testimonials with full names and neighborhoods. Show before/after photos.",
    headlineFormulas: [
      "[City]'s Most Trusted [Service Type]",
      "Professional [Service] in [Area] - [Years]+ Years Experience",
      "[Problem]? [City]'s #1 Rated [Service] Can Help",
      "Fast, Reliable [Service] in [Area] - Call Today",
    ],
    ctaText: {
      primary: ["Call Now", "Get Free Quote", "Book Online", "Schedule Service"],
      secondary: ["See Our Work", "Read Reviews", "Service Areas", "About Us"],
    },
    objectionPriority: [
      "pricing transparency",
      "availability / speed",
      "trustworthiness",
      "quality of work",
      "licensed / insured",
      "warranty / guarantee",
    ],
  },

  _examples: [
    "Plumbers",
    "Electricians",
    "HVAC technicians",
    "Landscapers",
    "Cleaning services",
    "Auto repair shops",
    "Salons and spas",
    "Restaurants",
  ],
  _lastUpdated: "2026-01-21",
};

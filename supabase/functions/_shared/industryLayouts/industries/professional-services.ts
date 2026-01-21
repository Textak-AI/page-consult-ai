/**
 * Professional Services Industry Layout Configuration
 *
 * Characteristics:
 * - Trust and expertise are the product
 * - Testimonials and case studies drive decisions
 * - Process transparency builds confidence
 * - Personal brand often matters
 */

import { IndustryLayoutConfig } from "../types.ts";

export const professionalServices: IndustryLayoutConfig = {
  id: "professional-services",
  name: "Professional Services",
  description: "Consulting, coaching, agency, and expertise-based service businesses",
  aliases: [
    "consulting",
    "consultancy",
    "agency",
    "marketing agency",
    "creative agency",
    "advisory",
    "coaching",
    "business coaching",
    "executive coaching",
    "freelance",
    "consultant",
  ],

  sections: {
    required: ["hero", "process", "testimonials", "cta-final"],
    conditional: [
      { section: "case-studies", condition: "intelligence.caseStudies.length > 0", priority: 10 },
      {
        section: "credentials",
        condition: "intelligence.credentials?.length > 0 || intelligence.compliance?.length > 0",
        priority: 8,
      },
      { section: "about-founder", condition: "intelligence.isPersonalBrand === true", priority: 9 },
      { section: "problem-agitate", condition: "intelligence.painPoints.length > 2", priority: 7 },
      { section: "faq", condition: "intelligence.objections.length > 2", priority: 5 },
      { section: "social-proof", condition: "intelligence.logos.length > 3", priority: 6 },
    ],
    avoid: ["pricing", "comparison", "guarantee"], // Services are custom-quoted, not compared
    maxSections: 8,
  },

  layout: {
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
  },

  sectionOrder: {
    unaware: [
      "hero",
      "problem-agitate",
      "solution",
      "credentials",
      "process",
      "case-studies",
      "testimonials",
      "cta-final",
    ],
    problemAware: ["hero", "process", "case-studies", "testimonials", "credentials", "cta-final"],
    solutionAware: ["hero", "credentials", "case-studies", "testimonials", "about-founder", "cta-final"],
    productAware: ["hero", "testimonials", "case-studies", "faq", "cta-final"],
    mostAware: ["hero", "testimonials", "process", "cta-final"],
  },

  trustPriorities: [
    "testimonials",
    "case-studies",
    "credentials",
    "years-experience",
    "media-mentions",
    "awards",
    "customer-logos",
  ],

  contentGuidance: {
    toneKeywords: ["strategic", "partner", "results", "expertise", "proven", "trusted", "experienced", "dedicated"],
    avoidWords: [
      "cheap", // Undermines premium positioning
      "fast", // Implies rushing
      "easy", // Diminishes complexity of work
      "discount", // Devalues expertise
      "basic", // Sounds amateur
    ],
    proofEmphasis:
      "Lead with client transformation stories and measurable results. Name-drop impressive clients when possible.",
    headlineFormulas: [
      "[Outcome] for [specific audience] who [pain point]",
      "Stop [bad outcome]. Start [good outcome].",
      "The [methodology/approach] that helped [client] achieve [impressive result]",
      "We help [audience] [achieve outcome] without [pain point]",
    ],
    ctaText: {
      primary: ["Book a Strategy Call", "Schedule Consultation", "Get Expert Help", "Let's Talk"],
      secondary: ["Download Guide", "See Case Studies", "Learn Our Process", "View Our Work"],
    },
    objectionPriority: [
      "cost justification / ROI",
      "time commitment required",
      "guaranteed results",
      "fit for my specific situation",
      "what makes you different",
      "experience with my industry",
    ],
  },

  _examples: [
    "Management consulting",
    "Marketing agencies",
    "Business coaches",
    "Financial advisors",
    "HR consultants",
    "IT consultants",
  ],
  _lastUpdated: "2026-01-21",
};

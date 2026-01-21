/**
 * Education & Coaching Industry Layout Configuration
 *
 * Characteristics:
 * - Transformation promise is the core value
 * - Results and student outcomes matter most
 * - Often high-ticket with longer sales cycle
 * - Personal brand often important
 */

import { IndustryLayoutConfig } from "../types";

export const educationCoaching: IndustryLayoutConfig = {
  id: "education-coaching",
  name: "Education & Coaching",
  description: "Online courses, coaching programs, and educational services",
  aliases: [
    "course",
    "online course",
    "coaching program",
    "training",
    "education",
    "edtech",
    "bootcamp",
    "certification",
    "workshop",
    "masterclass",
    "membership",
    "academy",
    "school",
    "tutoring",
    "learning",
  ],

  sections: {
    required: ["hero", "benefits", "testimonials", "cta-final"],
    conditional: [
      { section: "case-studies", condition: "intelligence.caseStudies.length > 0", priority: 10 },
      { section: "process", condition: "true", priority: 9 }, // Curriculum/process always relevant
      { section: "about-founder", condition: "intelligence.isPersonalBrand === true", priority: 8 },
      { section: "pricing", condition: "intelligence.pricing?.showOnPage === true", priority: 7 },
      { section: "guarantee", condition: "intelligence.pricing?.value > 200", priority: 8 },
      { section: "faq", condition: "intelligence.objections.length > 1", priority: 6 },
      { section: "comparison", condition: "intelligence.competitors.length > 0", priority: 5 },
    ],
    avoid: ["integrations", "service-area", "team"], // Individual creator focused
    maxSections: 9,
  },

  layout: {
    heroStyle: "problem-first",
    heroHasVideo: true, // Sales video common
    heroHasForm: false,
    maxFeatureCards: 4,
    preferredFeatureLayout: "alternating",
    featureIconStyle: "gradient",
    socialProofStyle: "case-studies",
    testimonialCount: 4,
    logoCount: 0,
    showStarRating: true,
    ctaPlacement: "hero-and-middle",
    ctaStyle: "button",
    secondaryCta: true,
    showPricingOnPage: true,
    pricingStyle: "cards",
    processLayout: "numbered-steps",
    processStepCount: 4,
    pageDensity: "comprehensive", // Long-form sales pages common
    mobileOptimization: "standard",
  },

  sectionOrder: {
    unaware: [
      "hero",
      "problem-agitate",
      "solution",
      "about-founder",
      "benefits",
      "case-studies",
      "process",
      "testimonials",
      "guarantee",
      "pricing",
      "faq",
      "cta-final",
    ],
    problemAware: [
      "hero",
      "benefits",
      "case-studies",
      "about-founder",
      "process",
      "testimonials",
      "pricing",
      "cta-final",
    ],
    solutionAware: [
      "hero",
      "comparison",
      "case-studies",
      "process",
      "testimonials",
      "pricing",
      "guarantee",
      "faq",
      "cta-final",
    ],
    productAware: ["hero", "testimonials", "pricing", "guarantee", "faq", "cta-final"],
    mostAware: ["hero", "pricing", "cta-final"],
  },

  trustPriorities: [
    "before-after",
    "testimonials",
    "video-testimonials",
    "case-studies",
    "guarantee",
    "credentials",
    "media-mentions",
    "customers-served",
  ],

  contentGuidance: {
    toneKeywords: [
      "transform",
      "breakthrough",
      "proven",
      "step-by-step",
      "comprehensive",
      "lifetime access",
      "community",
      "results",
    ],
    avoidWords: ["get rich quick", "easy money", "no effort", "overnight", "secret"],
    proofEmphasis:
      "Student transformations with specific results. Before/after stories. Revenue or outcome numbers. Video testimonials.",
    headlineFormulas: [
      "From [Before State] to [After State] in [Timeframe]",
      "The [Method] That Helped [Number]+ [Audience] [Achieve Outcome]",
      "Finally Learn [Skill] Without [Common Pain Point]",
      "How [Specific Person] [Achieved Impressive Result] (And How You Can Too)",
    ],
    ctaText: {
      primary: ["Enroll Now", "Join the Program", "Get Instant Access", "Start Learning"],
      secondary: ["Watch Free Training", "Download Syllabus", "See Curriculum", "Book a Call"],
    },
    objectionPriority: [
      "will this work for me",
      "time commitment",
      "cost justification",
      "what if it doesn't work (refund)",
      "is the instructor credible",
      "how is this different from free content",
    ],
  },

  _examples: [
    "Online courses",
    "Coaching programs",
    "Bootcamps",
    "Masterminds",
    "Membership sites",
    "Tutoring services",
  ],
  _lastUpdated: "2026-01-21",
};

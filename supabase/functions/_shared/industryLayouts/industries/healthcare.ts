/**
 * Healthcare Industry Layout Configuration
 *
 * Characteristics:
 * - High trust barrier - credentials are essential
 * - Compliance and certifications matter
 * - Conservative, professional design
 * - HIPAA and regulatory awareness
 */

import { IndustryLayoutConfig } from "../types.ts";

export const healthcare: IndustryLayoutConfig = {
  id: "healthcare",
  name: "Healthcare",
  description: "Medical practices, health services, and healthcare technology",
  aliases: [
    "medical",
    "health",
    "healthcare",
    "medical practice",
    "clinic",
    "hospital",
    "doctor",
    "physician",
    "health tech",
    "healthtech",
    "telehealth",
    "telemedicine",
    "wellness",
    "therapy",
    "mental health",
  ],

  sections: {
    required: ["hero", "credentials", "benefits", "cta-final"],
    conditional: [
      { section: "process", condition: "true", priority: 8 }, // Always show process in healthcare
      { section: "testimonials", condition: "intelligence.testimonials.length > 0", priority: 7 },
      { section: "team", condition: "intelligence.team?.length > 0", priority: 6 },
      { section: "faq", condition: "intelligence.objections.length > 1", priority: 7 },
      { section: "service-area", condition: "intelligence.isLocal === true", priority: 5 },
      { section: "social-proof", condition: "intelligence.certifications?.length > 0", priority: 8 },
    ],
    avoid: ["comparison", "guarantee", "pricing"], // Healthcare doesn't compete on price/guarantees
    maxSections: 8,
  },

  layout: {
    heroStyle: "bold-statement",
    heroHasVideo: false,
    heroHasForm: true, // Contact form prominent
    maxFeatureCards: 4,
    preferredFeatureLayout: "2-col",
    featureIconStyle: "filled",
    socialProofStyle: "credentials",
    testimonialCount: 2,
    logoCount: 4, // Certifications, not customer logos
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
    problemAware: ["hero", "benefits", "credentials", "process", "testimonials", "team", "cta-final"],
    solutionAware: ["hero", "credentials", "team", "process", "testimonials", "faq", "cta-final"],
    productAware: ["hero", "team", "process", "faq", "cta-final"],
    mostAware: ["hero", "process", "cta-final"],
  },

  trustPriorities: [
    "credentials",
    "certifications",
    "compliance-badges",
    "years-experience",
    "testimonials",
    "team-size",
    "security", // HIPAA
    "awards",
  ],

  contentGuidance: {
    toneKeywords: ["compassionate", "experienced", "trusted", "professional", "caring", "certified", "safe", "proven"],
    avoidWords: [
      "cheap",
      "discount",
      "experimental",
      "revolutionary", // Be careful with medical claims
      "guaranteed cure",
      "miracle",
    ],
    proofEmphasis:
      "Board certifications, hospital affiliations, years of experience, patient outcomes (compliant). HIPAA badges.",
    headlineFormulas: [
      "Compassionate [Service] from Board-Certified [Specialists]",
      "Expert [Treatment] Care - Accepting New Patients",
      "Your Health Deserves [Adjective] Care from [Credential] Professionals",
      "Trusted [Service] in [Location] - [Years]+ Years Experience",
    ],
    ctaText: {
      primary: ["Request Appointment", "Schedule Consultation", "Contact Our Office", "Book Online"],
      secondary: ["Meet Our Team", "Our Services", "Patient Resources", "Insurance & Payment"],
    },
    objectionPriority: [
      "credentials / qualifications",
      "insurance acceptance",
      "wait times / availability",
      "patient outcomes",
      "safety protocols",
      "privacy / confidentiality",
    ],
  },

  _examples: [
    "Medical practices",
    "Dental offices",
    "Mental health services",
    "Physical therapy",
    "Telehealth platforms",
    "Health tech startups",
  ],
  _lastUpdated: "2026-01-21",
};

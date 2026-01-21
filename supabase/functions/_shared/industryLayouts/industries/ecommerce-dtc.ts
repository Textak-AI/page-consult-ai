/**
 * E-commerce / DTC Industry Layout Configuration
 *
 * Characteristics:
 * - Impulse/emotional purchase decisions
 * - Social proof and reviews are critical
 * - Multiple CTAs throughout page
 * - Shipping, returns, and guarantee matter
 */

import { IndustryLayoutConfig } from "../types.ts";

export const ecommerceDTC: IndustryLayoutConfig = {
  id: "ecommerce-dtc",
  name: "E-commerce / DTC",
  description: "Direct-to-consumer product brands and online retail",
  aliases: [
    "ecommerce",
    "e-commerce",
    "dtc",
    "direct to consumer",
    "d2c",
    "online store",
    "shopify",
    "product brand",
    "consumer brand",
    "retail",
    "online retail",
  ],

  sections: {
    required: ["hero", "benefits", "social-proof", "cta-final"],
    conditional: [
      { section: "guarantee", condition: "intelligence.pricing?.value > 50", priority: 9 },
      { section: "comparison", condition: "intelligence.competitors.length > 0", priority: 7 },
      { section: "features", condition: "intelligence.features.length > 3", priority: 6 },
      { section: "testimonials", condition: "intelligence.testimonials.length > 2", priority: 8 },
      { section: "faq", condition: "intelligence.objections.length > 1", priority: 5 },
      { section: "process", condition: "intelligence.process?.length > 0", priority: 4 }, // "How it works"
    ],
    avoid: ["credentials", "about-founder", "case-studies"], // Product-focused, not service
    maxSections: 8,
  },

  layout: {
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
    pricingStyle: "single",
    processLayout: "horizontal-timeline",
    processStepCount: 3,
    pageDensity: "balanced",
    mobileOptimization: "aggressive",
  },

  sectionOrder: {
    unaware: [
      "hero",
      "problem-agitate",
      "solution",
      "benefits",
      "social-proof",
      "testimonials",
      "guarantee",
      "cta-final",
    ],
    problemAware: ["hero", "benefits", "social-proof", "features", "comparison", "testimonials", "cta-final"],
    solutionAware: ["hero", "comparison", "social-proof", "testimonials", "guarantee", "faq", "cta-final"],
    productAware: ["hero", "social-proof", "testimonials", "guarantee", "cta-final"],
    mostAware: [
      "hero",
      "social-proof",
      "cta-final", // Short, proof-heavy for ready buyers
    ],
  },

  trustPriorities: [
    "review-count",
    "star-rating",
    "money-back-guarantee",
    "shipping-speed",
    "real-photos",
    "testimonials",
    "video-testimonials",
  ],

  contentGuidance: {
    toneKeywords: ["love", "obsessed", "finally", "discover", "join", "amazing", "life-changing", "must-have"],
    avoidWords: [
      "enterprise", // Too corporate
      "solution", // Too B2B
      "leverage", // Jargon
      "synergy", // Corporate speak
      "optimize", // Too technical
    ],
    proofEmphasis: "Star ratings, review counts, user-generated photos, and social proof numbers. Show real customers.",
    headlineFormulas: [
      "Join [number]+ [audience] who [positive outcome]",
      "Finally, [product category] that actually [key benefit]",
      "The [product] that [impressive claim] - [number] 5-star reviews",
      "[Audience]'s favorite [product category]",
    ],
    ctaText: {
      primary: ["Shop Now", "Buy Now", "Get Yours", "Add to Cart", "Order Now"],
      secondary: ["Learn More", "See Reviews", "How It Works"],
    },
    objectionPriority: [
      "does it actually work",
      "is it worth the price",
      "shipping time / cost",
      "returns / refund policy",
      "quality / durability",
      "sizing / fit",
    ],
  },

  _examples: ["Beauty brands", "Fashion", "Supplements", "Home goods", "Food/beverage", "Pet products"],
  _lastUpdated: "2026-01-21",
};

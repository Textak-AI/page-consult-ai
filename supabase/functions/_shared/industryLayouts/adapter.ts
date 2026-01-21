/**
 * Adapter between PageConsult consultation schema and ExtractedIntelligence
 */

import { ExtractedIntelligence, BusinessCharacteristics } from "./types.ts";

interface ConsultationData {
  industry?: string;
  business_name?: string;
  target_audience?: string;
  audience_description?: string;
  value_proposition?: string;
  offering?: string;
  key_features?: string[];
  differentiators?: string[];
  pricing_model?: string;
  pricing_value?: number;
  show_pricing?: boolean;
  testimonials?: any[];
  case_studies?: any[];
  client_count?: string;
  years_experience?: string;
  competitors?: string[];
  competitive_angle?: string;
  pain_points?: string[];
  objections?: string[];
  process_steps?: string[];
  requires_onboarding?: boolean;
  service_area?: string;
  is_local?: boolean;
  founder_story?: string;
  compliance_requirements?: string[];
  buyer_awareness?: "unaware" | "problemAware" | "solutionAware" | "productAware" | "mostAware";
}

export function consultationToIntelligence(consultation: ConsultationData): ExtractedIntelligence {
  return {
    industry: consultation.industry || "general",
    businessName: consultation.business_name || "",
    audience: consultation.target_audience || consultation.audience_description || "",
    audienceSize: consultation.client_count,
    offering: consultation.offering || consultation.value_proposition || "",
    features: consultation.key_features || [],
    differentiators: consultation.differentiators || [],
    pricing: consultation.pricing_value
      ? {
          model: consultation.pricing_model,
          value: consultation.pricing_value,
          showOnPage: consultation.show_pricing,
        }
      : undefined,
    testimonials: consultation.testimonials || [],
    caseStudies: consultation.case_studies || [],
    metrics: [],
    logos: [],
    competitors: consultation.competitors || [],
    competitiveAngle: consultation.competitive_angle,
    painPoints: consultation.pain_points || [],
    objections: consultation.objections || [],
    process: consultation.process_steps,
    requiresOnboarding: consultation.requires_onboarding,
    serviceArea: consultation.service_area,
    isLocal: consultation.is_local,
    isPersonalBrand: !!consultation.founder_story,
    founderStory: consultation.founder_story,
    compliance: consultation.compliance_requirements,
    buyerAwareness: consultation.buyer_awareness || "problemAware",
  };
}

export function extractCharacteristics(intelligence: ExtractedIntelligence): Partial<BusinessCharacteristics> {
  const characteristics: Partial<BusinessCharacteristics> = {};

  const audienceLower = intelligence.audience.toLowerCase();
  if (
    audienceLower.includes("business") ||
    audienceLower.includes("company") ||
    audienceLower.includes("enterprise") ||
    audienceLower.includes("b2b")
  ) {
    characteristics.businessModel = "b2b";
  } else {
    characteristics.businessModel = "b2c";
  }

  if (intelligence.pricing?.model) {
    const modelLower = intelligence.pricing.model.toLowerCase();
    if (modelLower.includes("subscription") || modelLower.includes("monthly")) {
      characteristics.revenueModel = "subscription";
    } else if (modelLower.includes("retainer")) {
      characteristics.revenueModel = "retainer";
    } else if (modelLower.includes("project")) {
      characteristics.revenueModel = "project-based";
    } else {
      characteristics.revenueModel = "one-time";
    }
  }

  if (intelligence.pricing?.value) {
    const price = intelligence.pricing.value;
    if (price === 0) characteristics.pricePoint = "free";
    else if (price < 100) characteristics.pricePoint = "low";
    else if (price < 1000) characteristics.pricePoint = "medium";
    else if (price < 10000) characteristics.pricePoint = "high";
    else characteristics.pricePoint = "enterprise";
  }

  if (characteristics.pricePoint === "enterprise" || characteristics.pricePoint === "high") {
    characteristics.purchaseComplexity = "complex-sale";
  } else if (characteristics.pricePoint === "medium") {
    characteristics.purchaseComplexity = "considered";
  } else {
    characteristics.purchaseComplexity = "impulse";
  }

  if (characteristics.businessModel === "b2b") {
    if (characteristics.pricePoint === "enterprise") {
      characteristics.decisionMakers = "committee";
    } else if (characteristics.pricePoint === "high") {
      characteristics.decisionMakers = "team";
    } else {
      characteristics.decisionMakers = "individual";
    }
  } else {
    characteristics.decisionMakers = audienceLower.includes("family") ? "household" : "individual";
  }

  if (characteristics.purchaseComplexity === "complex-sale") {
    characteristics.salesCycle = intelligence.requiresOnboarding ? "quarters" : "months";
  } else if (characteristics.purchaseComplexity === "considered") {
    characteristics.salesCycle = "weeks";
  } else {
    characteristics.salesCycle = "instant";
  }

  const industryLower = intelligence.industry.toLowerCase();
  const highTrustIndustries = ["healthcare", "medical", "finance", "financial", "legal", "law", "insurance"];
  const mediumTrustIndustries = ["education", "coaching", "consulting", "real estate"];

  if (highTrustIndustries.some((i) => industryLower.includes(i))) {
    characteristics.trustBarrier = "critical";
    characteristics.riskToCustomer = "critical";
  } else if (mediumTrustIndustries.some((i) => industryLower.includes(i))) {
    characteristics.trustBarrier = "high";
    characteristics.riskToCustomer = "high";
  } else if (characteristics.pricePoint === "enterprise" || characteristics.pricePoint === "high") {
    characteristics.trustBarrier = "medium";
    characteristics.riskToCustomer = "high";
  } else {
    characteristics.trustBarrier = "low";
    characteristics.riskToCustomer = "medium";
  }

  const highEmotionIndustries = ["wedding", "healthcare", "funeral", "education", "childcare", "pet"];
  if (highEmotionIndustries.some((i) => industryLower.includes(i))) {
    characteristics.emotionalInvolvement = "high";
  } else if (characteristics.businessModel === "b2c") {
    characteristics.emotionalInvolvement = "medium";
  } else {
    characteristics.emotionalInvolvement = "low";
  }

  characteristics.regulatoryEnvironment =
    !!intelligence.compliance?.length || highTrustIndustries.some((i) => industryLower.includes(i));

  const credentialIndustries = ["healthcare", "legal", "finance", "real estate", "insurance"];
  characteristics.requiresCredentials = credentialIndustries.some((i) => industryLower.includes(i));

  const offeringLower = intelligence.offering.toLowerCase();
  if (offeringLower.includes("saas") || offeringLower.includes("software")) {
    characteristics.deliveryType = "saas";
  } else if (offeringLower.includes("service") || offeringLower.includes("consulting")) {
    characteristics.deliveryType = "service";
  } else if (offeringLower.includes("product") || offeringLower.includes("physical")) {
    characteristics.deliveryType = "physical";
  } else {
    characteristics.deliveryType = "digital";
  }

  characteristics.isLocal = intelligence.isLocal || !!intelligence.serviceArea;
  characteristics.requiresOnboarding = intelligence.requiresOnboarding || false;
  characteristics.hasFreeTrial =
    offeringLower.includes("trial") ||
    offeringLower.includes("demo") ||
    (characteristics.deliveryType === "saas" && characteristics.pricePoint !== "free");

  const emergingKeywords = ["ai", "blockchain", "crypto", "web3"];
  const matureKeywords = ["accounting", "legal", "insurance", "construction", "real estate"];

  if (emergingKeywords.some((k) => industryLower.includes(k))) {
    characteristics.marketMaturity = "emerging";
  } else if (matureKeywords.some((k) => industryLower.includes(k))) {
    characteristics.marketMaturity = "mature";
  } else {
    characteristics.marketMaturity = "growing";
  }

  if (intelligence.competitors?.length >= 5) {
    characteristics.competitorDensity = "saturated";
  } else if (intelligence.competitors?.length >= 3) {
    characteristics.competitorDensity = "high";
  } else if (intelligence.competitors?.length >= 1) {
    characteristics.competitorDensity = "medium";
  } else {
    characteristics.competitorDensity = "low";
  }

  return characteristics;
}
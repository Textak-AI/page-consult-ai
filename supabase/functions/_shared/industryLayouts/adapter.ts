/**
 * Adapter between PageConsult consultation schema and ExtractedIntelligence
 * 
 * Handles both snake_case (DB) and camelCase (frontend) field names
 */

import { ExtractedIntelligence, BusinessCharacteristics } from "./types.ts";

// Accept any consultation shape - we'll normalize it
type ConsultationData = Record<string, any>;

/**
 * Detect if this is a local service business based on industry and audience keywords
 */
function detectLocalBusiness(consultation: ConsultationData): boolean {
  const industryLower = (
    consultation.industry || 
    consultation.industryOther || 
    ''
  ).toLowerCase();
  
  const audienceLower = (
    consultation.targetAudience || 
    consultation.target_audience ||
    consultation.idealClient ||
    consultation.audience_description ||
    ''
  ).toLowerCase();
  
  const offeringLower = (
    consultation.mainOffer ||
    consultation.offering ||
    consultation.value_proposition ||
    ''
  ).toLowerCase();

  // Local service industry keywords
  const localIndustryKeywords = [
    'plumb', 'hvac', 'electric', 'roof', 'landscap', 'clean', 'repair',
    'dentist', 'dental', 'salon', 'spa', 'restaurant', 'cafe', 'bakery',
    'contractor', 'handyman', 'pest', 'moving', 'storage', 'auto', 'mechanic',
    'flooring', 'painting', 'home services', 'local services', 'fence',
    'garage door', 'locksmith', 'towing', 'pressure wash', 'gutter'
  ];
  
  // Audience patterns that suggest local service
  const localAudienceKeywords = [
    'homeowner', 'local', 'resident', 'neighborhood', 'community',
    'metro area', 'county', 'city of', 'greater', 'nearby',
    'in the area', 'in my area', 'property owner'
  ];

  const hasLocalIndustry = localIndustryKeywords.some(k => industryLower.includes(k) || offeringLower.includes(k));
  const hasLocalAudience = localAudienceKeywords.some(k => audienceLower.includes(k));

  return hasLocalIndustry || hasLocalAudience;
}

/**
 * Extract service area from audience or business description
 */
function extractServiceArea(consultation: ConsultationData): string | undefined {
  const audience = consultation.targetAudience || 
                   consultation.target_audience || 
                   consultation.idealClient || 
                   '';
  
  // Look for patterns like "Denver metro area", "Greater Chicago", "homeowners in Austin"
  const areaPatterns = [
    /(?:in|serving|around)\s+(?:the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:area|metro|region|county)?/i,
    /(?:greater|the)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:homeowners|residents|businesses)/i
  ];

  for (const pattern of areaPatterns) {
    const match = audience.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return undefined;
}

/**
 * Convert consultation data to intelligence format
 * Handles both snake_case and camelCase field names
 */
export function consultationToIntelligence(consultation: ConsultationData): ExtractedIntelligence {
  // Normalize industry - check multiple possible field names
  const industry = consultation.industry || 
                   consultation.industryOther || 
                   'general';

  // Normalize audience - check multiple possible field names
  const audience = consultation.targetAudience || 
                   consultation.target_audience || 
                   consultation.idealClient ||
                   consultation.audience_description || 
                   '';

  // Normalize offering
  const offering = consultation.mainOffer ||
                   consultation.offering || 
                   consultation.value_proposition ||
                   consultation.uniqueStrength ||
                   '';

  // Detect local business
  const isLocal = consultation.is_local ?? 
                  consultation.isLocal ?? 
                  detectLocalBusiness(consultation);

  // Extract service area
  const serviceArea = consultation.service_area ?? 
                      consultation.serviceArea ?? 
                      extractServiceArea(consultation);

  // Log for debugging
  console.log('[consultationToIntelligence] Input fields:', {
    industry,
    audience: audience.substring(0, 50) + (audience.length > 50 ? '...' : ''),
    offering: offering.substring(0, 50) + (offering.length > 50 ? '...' : ''),
    isLocal,
    serviceArea
  });

  const result: ExtractedIntelligence = {
    industry,
    businessName: consultation.businessName || consultation.business_name || '',
    audience,
    audienceSize: consultation.clientCount || consultation.client_count,
    offering,
    features: consultation.key_features || consultation.keyFeatures || [],
    differentiators: consultation.differentiators || [],
    pricing: consultation.pricing_value || consultation.pricingValue || consultation.investmentRange
      ? {
          model: consultation.pricing_model || consultation.pricingModel,
          value: consultation.pricing_value || consultation.pricingValue,
          showOnPage: consultation.show_pricing ?? consultation.showPricing,
        }
      : undefined,
    testimonials: consultation.testimonials || [],
    caseStudies: consultation.case_studies || consultation.caseStudies || [],
    metrics: [],
    logos: [],
    competitors: consultation.competitors || [],
    competitiveAngle: consultation.competitive_angle || consultation.competitiveAngle,
    painPoints: consultation.pain_points || consultation.painPoints || consultation.clientFrustration ? [consultation.clientFrustration] : [],
    objections: consultation.objections || 
                (consultation.objectionsToOvercome ? consultation.objectionsToOvercome.split(',').map((s: string) => s.trim()) : []),
    process: consultation.process_steps || consultation.processSteps || 
             (consultation.processDescription ? [consultation.processDescription] : undefined),
    requiresOnboarding: consultation.requires_onboarding ?? consultation.requiresOnboarding,
    serviceArea,
    isLocal,
    isPersonalBrand: !!consultation.founder_story || !!consultation.founderStory,
    founderStory: consultation.founder_story || consultation.founderStory,
    compliance: consultation.compliance_requirements || consultation.complianceRequirements,
    buyerAwareness: consultation.buyer_awareness || consultation.buyerAwareness || 'problemAware',
  };

  console.log('[consultationToIntelligence] Result:', {
    industry: result.industry,
    isLocal: result.isLocal,
    serviceArea: result.serviceArea,
    hasAudience: !!result.audience,
    hasOffering: !!result.offering
  });

  return result;
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
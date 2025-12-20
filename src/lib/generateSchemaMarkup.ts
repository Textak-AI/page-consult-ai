/**
 * Schema Markup Generator for AI SEO
 * Generates JSON-LD structured data for landing pages
 */

import type { AISeoData, ConsultationData } from '@/services/intelligence/types';

interface SchemaOffer {
  '@type': 'Offer';
  name: string;
  description: string;
  price?: string;
  priceCurrency?: string;
}

interface SchemaReview {
  '@type': 'Review';
  author: {
    '@type': 'Person';
    name: string;
    jobTitle?: string;
  };
  reviewBody: string;
}

interface Testimonial {
  name: string;
  role?: string;
  quote: string;
}

interface HowToStep {
  title: string;
  description: string;
}

interface StrategyBrief {
  businessName?: string;
  processOverview?: string;
  howItWorks?: {
    steps?: HowToStep[];
  };
  offerType?: 'product' | 'service';
  offerName?: string;
  valueProposition?: string;
  serviceArea?: string;
}

export interface SchemaMarkupResult {
  entitySchema: string;
  faqSchema?: string;
  howToSchema?: string;
  serviceSchema?: string;
  combined: string;
  schemas: object[];
}

/**
 * Extracts price from investment string (e.g., "$5,000" → "5000")
 */
function extractPrice(investment: string): { price: string; currency: string } | null {
  if (!investment) return null;
  
  // Match currency symbols and numbers
  const match = investment.match(/[$€£]?\s*([\d,]+(?:\.\d{2})?)/);
  if (match) {
    const price = match[1].replace(/,/g, '');
    const currency = investment.includes('€') ? 'EUR' : 
                     investment.includes('£') ? 'GBP' : 'USD';
    return { price, currency };
  }
  return null;
}

/**
 * Generates the main entity schema based on entity type
 */
function generateEntitySchema(
  aiSeoData: AISeoData,
  consultation: ConsultationData,
  testimonials?: Testimonial[]
): object {
  const baseSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': aiSeoData.entity.type,
    name: aiSeoData.entity.name,
    description: aiSeoData.entity.description,
  };

  // Add area served if available
  if (aiSeoData.entity.areaServed) {
    baseSchema.areaServed = {
      '@type': 'Place',
      name: aiSeoData.entity.areaServed,
    };
  }

  // Add industry/category
  if (aiSeoData.entity.industry) {
    baseSchema.category = aiSeoData.entity.industry;
  }

  // Add offer if consultation has offer details
  if (consultation.offer) {
    const offer: SchemaOffer = {
      '@type': 'Offer',
      name: consultation.offer,
      description: consultation.offer,
    };

    // Try to extract price if present in the offer string
    const priceInfo = extractPrice(consultation.offer);
    if (priceInfo) {
      offer.price = priceInfo.price;
      offer.priceCurrency = priceInfo.currency;
    }

    baseSchema.offers = offer;
  }

  // Add reviews/testimonials if available
  if (testimonials && testimonials.length > 0) {
    baseSchema.review = testimonials.map((t): SchemaReview => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: t.name,
        ...(t.role && { jobTitle: t.role }),
      },
      reviewBody: t.quote,
    }));

    // Add aggregate rating if we have testimonials
    baseSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: String(testimonials.length),
      bestRating: '5',
      worstRating: '1',
    };
  }

  // Add knowledge graph hints for authority signals
  if (aiSeoData.authoritySignals.length > 0) {
    const achievements = aiSeoData.authoritySignals
      .filter(s => s.type === 'achievement' || s.type === 'credential')
      .map(s => s.optimized);
    
    if (achievements.length > 0) {
      baseSchema.award = achievements;
    }
  }

  return baseSchema;
}

/**
 * Generates FAQPage schema from FAQ items
 */
export function generateFAQSchema(faqItems: AISeoData['faqItems']): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Generates HowTo schema from process steps
 */
export function generateHowToSchema(brief: StrategyBrief): object | null {
  if (!brief.howItWorks?.steps?.length) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How ${brief.businessName || 'Our Service'} Works`,
    description: brief.processOverview || `Learn how ${brief.businessName || 'we'} help you achieve results.`,
    step: brief.howItWorks.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.title,
      text: step.description,
    })),
  };
}

/**
 * Generates Service or Product schema from offer details
 */
export function generateServiceSchema(brief: StrategyBrief): object {
  return {
    '@context': 'https://schema.org',
    '@type': brief.offerType === 'product' ? 'Product' : 'Service',
    name: brief.offerName || brief.businessName || 'Our Service',
    description: brief.valueProposition || '',
    provider: {
      '@type': 'Organization',
      name: brief.businessName || 'Our Company',
    },
    areaServed: brief.serviceArea || 'Worldwide',
  };
}

/**
 * Main function to generate all schema markup
 */
export function generateSchemaMarkup(
  consultation: ConsultationData,
  aiSeoData: AISeoData,
  testimonials?: Testimonial[],
  strategyBrief?: StrategyBrief
): SchemaMarkupResult {
  const schemas: object[] = [];
  
  // Generate entity schema
  const entitySchemaObj = generateEntitySchema(aiSeoData, consultation, testimonials);
  schemas.push(entitySchemaObj);
  const entitySchema = `<script type="application/ld+json">${JSON.stringify(entitySchemaObj, null, 2)}</script>`;

  // Generate FAQ schema if we have FAQ items
  let faqSchema: string | undefined;
  if (aiSeoData.faqItems && aiSeoData.faqItems.length > 0) {
    const faqSchemaObj = generateFAQSchema(aiSeoData.faqItems);
    schemas.push(faqSchemaObj);
    faqSchema = `<script type="application/ld+json">${JSON.stringify(faqSchemaObj, null, 2)}</script>`;
  }

  // Generate HowTo schema if we have strategy brief with steps
  let howToSchema: string | undefined;
  if (strategyBrief) {
    const howToSchemaObj = generateHowToSchema(strategyBrief);
    if (howToSchemaObj) {
      schemas.push(howToSchemaObj);
      howToSchema = `<script type="application/ld+json">${JSON.stringify(howToSchemaObj, null, 2)}</script>`;
    }
  }

  // Generate Service schema if we have strategy brief
  let serviceSchema: string | undefined;
  if (strategyBrief && (strategyBrief.offerName || strategyBrief.valueProposition)) {
    const serviceSchemaObj = generateServiceSchema(strategyBrief);
    schemas.push(serviceSchemaObj);
    serviceSchema = `<script type="application/ld+json">${JSON.stringify(serviceSchemaObj, null, 2)}</script>`;
  }

  // Combined for easy insertion
  const combined = [entitySchema, faqSchema, howToSchema, serviceSchema]
    .filter(Boolean)
    .join('\n');

  return {
    entitySchema,
    faqSchema,
    howToSchema,
    serviceSchema,
    combined,
    schemas,
  };
}

/**
 * Generates inline JSON for React Helmet or similar
 */
export function getSchemaObjects(
  consultation: ConsultationData,
  aiSeoData: AISeoData,
  testimonials?: Testimonial[],
  strategyBrief?: StrategyBrief
): { entity: object; faq?: object; howTo?: object; service?: object; all: object[] } {
  const entity = generateEntitySchema(aiSeoData, consultation, testimonials);
  const all: object[] = [entity];
  
  const faq = aiSeoData.faqItems?.length > 0 
    ? generateFAQSchema(aiSeoData.faqItems) 
    : undefined;
  if (faq) all.push(faq);

  const howTo = strategyBrief ? generateHowToSchema(strategyBrief) : undefined;
  if (howTo) all.push(howTo);

  const service = strategyBrief && (strategyBrief.offerName || strategyBrief.valueProposition)
    ? generateServiceSchema(strategyBrief)
    : undefined;
  if (service) all.push(service);
  
  return { entity, faq, howTo, service, all };
}

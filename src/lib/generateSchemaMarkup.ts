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

export interface SchemaMarkupResult {
  entitySchema: string;
  faqSchema?: string;
  combined: string;
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
 * Main function to generate all schema markup
 */
export function generateSchemaMarkup(
  consultation: ConsultationData,
  aiSeoData: AISeoData,
  testimonials?: Testimonial[]
): SchemaMarkupResult {
  // Generate entity schema
  const entitySchemaObj = generateEntitySchema(aiSeoData, consultation, testimonials);
  const entitySchema = `<script type="application/ld+json">${JSON.stringify(entitySchemaObj, null, 2)}</script>`;

  // Generate FAQ schema if we have FAQ items
  let faqSchema: string | undefined;
  if (aiSeoData.faqItems && aiSeoData.faqItems.length > 0) {
    const faqSchemaObj = generateFAQSchema(aiSeoData.faqItems);
    faqSchema = `<script type="application/ld+json">${JSON.stringify(faqSchemaObj, null, 2)}</script>`;
  }

  // Combined for easy insertion
  const combined = faqSchema ? `${entitySchema}\n${faqSchema}` : entitySchema;

  return {
    entitySchema,
    faqSchema,
    combined,
  };
}

/**
 * Generates inline JSON for React Helmet or similar
 */
export function getSchemaObjects(
  consultation: ConsultationData,
  aiSeoData: AISeoData,
  testimonials?: Testimonial[]
): { entity: object; faq?: object } {
  const entity = generateEntitySchema(aiSeoData, consultation, testimonials);
  const faq = aiSeoData.faqItems?.length > 0 
    ? generateFAQSchema(aiSeoData.faqItems) 
    : undefined;
  
  return { entity, faq };
}

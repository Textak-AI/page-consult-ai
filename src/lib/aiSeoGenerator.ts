/**
 * AI SEO GENERATOR
 * Generates Schema.org JSON-LD and E-E-A-T optimized meta tags
 */

import type { AuthoritySignal, OptimizedFAQ } from './briefExtractor';

// ============================================
// TYPES
// ============================================

export interface SchemaOrgData {
  businessName: string;
  industry?: string;
  mainOffer?: string;
  yearsInBusiness?: string | null;
  websiteUrl?: string;
  location?: string;
  description?: string;
}

export interface MetaTagsResult {
  title: string;
  description: string;
  keywords: string;
}

export interface SchemaResult {
  organization: object;
  faqPage?: object;
  service?: object;
  combined: string;
}

// ============================================
// SCHEMA.ORG GENERATOR
// ============================================

export function generateSchemaOrg(
  data: SchemaOrgData,
  authoritySignals: AuthoritySignal[],
  faqs?: OptimizedFAQ[]
): SchemaResult {
  
  // Organization/LocalBusiness Schema
  const organizationSchema: any = {
    '@context': 'https://schema.org',
    '@type': data.industry?.toLowerCase().includes('local') ? 'LocalBusiness' : 'Organization',
    name: data.businessName,
    description: data.description || data.mainOffer,
  };
  
  if (data.websiteUrl) {
    organizationSchema.url = data.websiteUrl;
  }
  
  if (data.location) {
    organizationSchema.address = {
      '@type': 'PostalAddress',
      addressLocality: data.location,
    };
  }
  
  // Add founding date if years in business available
  if (data.yearsInBusiness) {
    const yearsMatch = data.yearsInBusiness.match(/(\d+)/);
    if (yearsMatch) {
      const years = parseInt(yearsMatch[1]);
      const foundingYear = new Date().getFullYear() - years;
      organizationSchema.foundingDate = foundingYear.toString();
    }
  }
  
  // Add aggregate rating from authority signals
  const ratingSignal = authoritySignals.find(s => 
    s.label.toLowerCase().includes('rating') || 
    s.label.toLowerCase().includes('star') ||
    s.label.toLowerCase().includes('review')
  );
  
  if (ratingSignal) {
    const ratingMatch = ratingSignal.value.match(/(\d+\.?\d*)/);
    if (ratingMatch) {
      organizationSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: ratingMatch[1],
        bestRating: '5',
        worstRating: '1',
      };
    }
  }
  
  // FAQ Schema
  let faqSchema: object | undefined;
  if (faqs && faqs.length > 0) {
    faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  }
  
  // Service Schema
  const serviceSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: data.mainOffer || `${data.businessName} Services`,
    provider: {
      '@type': 'Organization',
      name: data.businessName,
    },
  };
  
  if (data.description) {
    serviceSchema.description = data.description;
  }
  
  // Combine all schemas
  const allSchemas = [organizationSchema];
  if (faqSchema) allSchemas.push(faqSchema);
  allSchemas.push(serviceSchema);
  
  const combined = allSchemas
    .map(schema => `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`)
    .join('\n');
  
  return {
    organization: organizationSchema,
    faqPage: faqSchema,
    service: serviceSchema,
    combined,
  };
}

// ============================================
// META TAG GENERATOR (E-E-A-T Optimized)
// ============================================

export function generateAISEOMetaTags(
  brief: {
    headlines?: { optionA?: string; optionB?: string; optionC?: string };
    subheadline?: string;
    proofPoints?: {
      clientCount?: string | null;
      yearsInBusiness?: string | null;
      achievements?: string | null;
    };
    messagingPillars?: Array<{ title: string; description: string }>;
  },
  businessName: string
): MetaTagsResult {
  
  // Title: Primary keyword + benefit (under 60 chars)
  const primaryHeadline = brief.headlines?.optionA || brief.headlines?.optionB || '';
  const title = primaryHeadline.length > 55 
    ? `${primaryHeadline.slice(0, 52)}...`
    : `${primaryHeadline} | ${businessName}`.slice(0, 60);
  
  // Description: Value prop + E-E-A-T signal (under 160 chars)
  let description = brief.subheadline || '';
  
  // Add authority signal if available
  const authorityParts: string[] = [];
  if (brief.proofPoints?.yearsInBusiness) {
    authorityParts.push(brief.proofPoints.yearsInBusiness);
  }
  if (brief.proofPoints?.clientCount) {
    authorityParts.push(`${brief.proofPoints.clientCount} clients served`);
  }
  
  if (authorityParts.length > 0 && description.length < 120) {
    description = `${description} ${authorityParts[0]}`;
  }
  
  description = description.slice(0, 160);
  
  // Keywords: Extract from pillars and headline
  const keywordSources = [
    ...(brief.messagingPillars?.map(p => p.title) || []),
    businessName,
  ];
  
  const keywords = keywordSources
    .filter(Boolean)
    .join(', ')
    .slice(0, 200);
  
  return {
    title,
    description,
    keywords,
  };
}

// ============================================
// SCHEMA OBJECTS (for React Helmet)
// ============================================

export function getSchemaObjects(
  data: SchemaOrgData,
  authoritySignals: AuthoritySignal[],
  faqs?: OptimizedFAQ[]
): object[] {
  const result = generateSchemaOrg(data, authoritySignals, faqs);
  const schemas: object[] = [result.organization, result.service];
  
  if (result.faqPage) {
    schemas.push(result.faqPage);
  }
  
  return schemas;
}

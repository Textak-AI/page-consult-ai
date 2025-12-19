/**
 * Meta Tags Generator for AI SEO
 * Creates optimized meta tags for landing pages
 */

import type { AISeoData, ConsultationData } from '@/services/intelligence/types';

export interface MetaTags {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogType: string;
  canonical?: string;
  keywords?: string;
}

export interface MetaTagsHtml {
  tags: MetaTags;
  html: string;
}

/**
 * Truncates text to max length, ending at word boundary
 */
function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace);
  }
  return truncated;
}

/**
 * Generates an SEO-optimized title from entity and consultation data
 */
function generateTitle(
  aiSeoData: AISeoData,
  consultation: ConsultationData
): string {
  const entityName = aiSeoData.entity.name;
  const industry = aiSeoData.entity.industry;
  
  // Get the primary value proposition
  let valueProp = '';
  if (consultation.uniqueValue) {
    // Extract first value prop phrase
    valueProp = consultation.uniqueValue.split(/[,.]/).filter(Boolean)[0]?.trim() || '';
  }
  
  // Build title: [Entity Name] | [Value Prop/Industry]
  let title = entityName;
  
  if (valueProp && valueProp.length < 30) {
    title = `${entityName} | ${valueProp}`;
  } else if (industry) {
    title = `${entityName} | ${industry}`;
  }
  
  // Ensure max 60 characters
  return truncateAtWord(title, 60);
}

/**
 * Generates an SEO-optimized meta description
 */
function generateDescription(
  aiSeoData: AISeoData,
  consultation: ConsultationData
): string {
  // Start with entity description (already optimized)
  let description = aiSeoData.entity.description;
  
  // If too short, enhance with consultation details
  if (description.length < 100 && consultation.offer) {
    description = `${description} ${consultation.offer}`;
  }
  
  // Add call-to-action hint if space allows
  if (description.length < 140) {
    description = `${description} Get started today.`;
  }
  
  // Ensure max 155 characters
  return truncateAtWord(description, 155);
}

/**
 * Extracts keywords from authority signals and query targets
 */
function extractKeywords(aiSeoData: AISeoData): string {
  const keywords = new Set<string>();
  
  // Extract from entity
  keywords.add(aiSeoData.entity.industry.toLowerCase());
  
  // Extract key terms from high-priority queries
  aiSeoData.queryTargets
    .filter(q => q.priority === 'high')
    .forEach(q => {
      // Extract 2-3 word phrases
      const words = q.query.toLowerCase().split(' ');
      if (words.length <= 4) {
        keywords.add(q.query.toLowerCase());
      } else {
        // Take first 3-4 meaningful words
        keywords.add(words.slice(0, 4).join(' '));
      }
    });
  
  // Limit to 10 keywords
  return Array.from(keywords).slice(0, 10).join(', ');
}

/**
 * Determines OpenGraph type based on entity type
 */
function getOgType(entityType: string): string {
  const typeMap: Record<string, string> = {
    ProfessionalService: 'business.business',
    LocalBusiness: 'business.business',
    Organization: 'business.business',
    Product: 'product',
    Service: 'business.business',
    SoftwareApplication: 'product',
    WebApplication: 'product',
    default: 'website',
  };
  
  return typeMap[entityType] || typeMap.default;
}

/**
 * Main function to generate meta tags
 */
export function generateMetaTags(
  aiSeoData: AISeoData,
  consultation: ConsultationData,
  canonicalUrl?: string
): MetaTags {
  const title = generateTitle(aiSeoData, consultation);
  const description = generateDescription(aiSeoData, consultation);
  
  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: getOgType(aiSeoData.entity.type),
    canonical: canonicalUrl,
    keywords: extractKeywords(aiSeoData),
  };
}

/**
 * Generates HTML meta tags for injection into head
 */
export function generateMetaTagsHtml(
  aiSeoData: AISeoData,
  consultation: ConsultationData,
  canonicalUrl?: string
): MetaTagsHtml {
  const tags = generateMetaTags(aiSeoData, consultation, canonicalUrl);
  
  const html = `
    <title>${tags.title}</title>
    <meta name="description" content="${tags.description}" />
    ${tags.keywords ? `<meta name="keywords" content="${tags.keywords}" />` : ''}
    ${tags.canonical ? `<link rel="canonical" href="${tags.canonical}" />` : ''}
    
    <!-- Open Graph -->
    <meta property="og:title" content="${tags.ogTitle}" />
    <meta property="og:description" content="${tags.ogDescription}" />
    <meta property="og:type" content="${tags.ogType}" />
    ${tags.canonical ? `<meta property="og:url" content="${tags.canonical}" />` : ''}
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${tags.title}" />
    <meta name="twitter:description" content="${tags.description}" />
  `.trim();
  
  return { tags, html };
}

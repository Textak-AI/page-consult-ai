/**
 * AI SEO Integration Utility
 * Integrates aiSeoData into page generation for enhanced SEO
 */

import type { AISeoData, ConsultationData, FAQItem } from '@/services/intelligence/types';
import { generateSchemaMarkup, getSchemaObjects, type SchemaMarkupResult } from './generateSchemaMarkup';
import { generateFAQSection, type FAQSectionResult } from './generateFAQSection';
import { generateMetaTags, type MetaTags } from './generateMetaTags';

interface StrategyBrief {
  businessName?: string;
  processOverview?: string;
  howItWorks?: {
    steps?: { title: string; description: string }[];
  };
  offerType?: 'product' | 'service';
  offerName?: string;
  valueProposition?: string;
  serviceArea?: string;
}

export interface SEOEnhancedPage {
  schemaMarkup: SchemaMarkupResult;
  faqSection: FAQSectionResult | null;
  metaTags: MetaTags;
  authoritySignalsForContent: string[];
}

export interface SEOHeadData {
  metaTitle: string;
  metaDescription: string;
  keywords?: string;
  canonical?: string;
  openGraph: {
    type?: string;
    title?: string;
    description?: string;
    image?: string;
    url?: string;
  };
  schemaMarkup: object[];
}

export interface Testimonial {
  name: string;
  role?: string;
  quote: string;
}

/**
 * Generates SEO data formatted for SEOHead component
 */
export function generateSEOHeadData(
  consultation: ConsultationData,
  aiSeoData: AISeoData,
  testimonials?: Testimonial[],
  strategyBrief?: StrategyBrief,
  canonicalUrl?: string,
  ogImage?: string
): SEOHeadData {
  const metaTags = generateMetaTags(aiSeoData, consultation, canonicalUrl);
  const schemaObjects = getSchemaObjects(consultation, aiSeoData, testimonials, strategyBrief);

  return {
    metaTitle: metaTags.title,
    metaDescription: metaTags.description,
    keywords: metaTags.keywords,
    canonical: canonicalUrl,
    openGraph: {
      type: metaTags.ogType,
      title: metaTags.ogTitle,
      description: metaTags.ogDescription,
      image: ogImage,
      url: canonicalUrl,
    },
    schemaMarkup: schemaObjects.all,
  };
}

/**
 * Generates all SEO assets from aiSeoData
 */
export function generateSEOAssets(
  consultation: ConsultationData,
  aiSeoData: AISeoData,
  testimonials?: Testimonial[],
  canonicalUrl?: string,
  strategyBrief?: StrategyBrief
): SEOEnhancedPage {
  // Generate schema markup (now with HowTo and Service schemas)
  const schemaMarkup = generateSchemaMarkup(consultation, aiSeoData, testimonials, strategyBrief);
  
  // Generate FAQ section (if we have FAQ items)
  const faqSection = aiSeoData.faqItems && aiSeoData.faqItems.length > 0
    ? generateFAQSection(aiSeoData.faqItems)
    : null;
  
  // Generate meta tags
  const metaTags = generateMetaTags(aiSeoData, consultation, canonicalUrl);
  
  // Extract optimized authority signals for content injection
  const authoritySignalsForContent = aiSeoData.authoritySignals
    .filter(s => s.type === 'statistic' || s.type === 'achievement')
    .map(s => s.optimized);
  
  return {
    schemaMarkup,
    faqSection,
    metaTags,
    authoritySignalsForContent,
  };
}

/**
 * Creates an FAQ section configuration for the page builder
 */
export function createFAQSectionConfig(faqItems: FAQItem[]): {
  type: string;
  order: number;
  visible: boolean;
  content: {
    headline: string;
    items: FAQItem[];
  };
} {
  return {
    type: 'faq',
    order: 0, // Will be set by caller
    visible: true,
    content: {
      headline: 'Frequently Asked Questions',
      items: faqItems,
    },
  };
}

/**
 * Injects authority signals into content copy
 * Uses signals to enhance headlines and descriptions
 */
export function enhanceContentWithSignals(
  content: {
    headline?: string;
    subheadline?: string;
    problemStatement?: string;
    solutionStatement?: string;
  },
  authoritySignals: AISeoData['authoritySignals']
): typeof content {
  const enhanced = { ...content };
  
  // Find the most impactful statistic signal
  const statisticSignal = authoritySignals.find(s => 
    s.type === 'statistic' && s.numbers.length > 0
  );
  
  // Find achievement signal for credibility
  const achievementSignal = authoritySignals.find(s => 
    s.type === 'achievement' || s.type === 'credential'
  );
  
  // Enhance subheadline with statistic if available
  if (statisticSignal && enhanced.subheadline && !enhanced.subheadline.includes(statisticSignal.numbers[0])) {
    // Only add if subheadline is short enough
    if (enhanced.subheadline.length < 100) {
      enhanced.subheadline = `${enhanced.subheadline} Trusted by ${statisticSignal.optimized}.`;
    }
  }
  
  // Enhance solution statement with achievement if available
  if (achievementSignal && enhanced.solutionStatement && enhanced.solutionStatement.length < 150) {
    enhanced.solutionStatement = `${enhanced.solutionStatement} ${achievementSignal.optimized}.`;
  }
  
  return enhanced;
}

/**
 * Generates HTML export with all SEO elements
 */
export function generateSEOEnhancedHTML(
  pageTitle: string,
  pageContent: string,
  seoAssets: SEOEnhancedPage
): string {
  const { schemaMarkup, faqSection, metaTags } = seoAssets;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${metaTags.title}</title>
  <meta name="description" content="${metaTags.description}">
  ${metaTags.keywords ? `<meta name="keywords" content="${metaTags.keywords}">` : ''}
  ${metaTags.canonical ? `<link rel="canonical" href="${metaTags.canonical}">` : ''}
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${metaTags.ogType}">
  <meta property="og:title" content="${metaTags.ogTitle}">
  <meta property="og:description" content="${metaTags.ogDescription}">
  ${metaTags.canonical ? `<meta property="og:url" content="${metaTags.canonical}">` : ''}
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${metaTags.title}">
  <meta name="twitter:description" content="${metaTags.description}">
  
  <!-- Schema.org Structured Data -->
  ${schemaMarkup.combined}
  ${faqSection?.schema || ''}
  
  <style>
    /* Reset and base styles */
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  ${pageContent}
  
  ${faqSection?.html || ''}
</body>
</html>`;
}

/**
 * Checks if aiSeoData is valid and complete enough for use
 */
export function isAISeoDataValid(aiSeoData: AISeoData | null | undefined): aiSeoData is AISeoData {
  if (!aiSeoData) return false;
  if (!aiSeoData.entity?.type) return false;
  if (!aiSeoData.entity?.name) return false;
  return true;
}

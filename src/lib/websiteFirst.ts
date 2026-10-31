/**
 * Website-first prefill ("Let PageConsult Fill It In").
 *
 * Turns the analyze-website result (+ the extract-brand result and, when it ran,
 * extract-website-intelligence) into the SAME ConsultationData fields the wizard
 * collects by hand, so the brief and the section mapper see equivalent input:
 * - offers / CTA labels verbatim from the site (never the model's suggestions)
 * - real extracted brand colours (never a substituted hex)
 * - industry prefilled as IndustrySelector labels from the scored classification
 */
import { resolveIndustry } from '@/lib/resolveIndustry';
import type { IndustryVariant } from '@/lib/industryDesignSystem';
import {
  INDUSTRY_TAXONOMY,
  validIndustryClassification,
  type SiteOffer,
  type SiteIndustryClassification,
} from '../../supabase/functions/_shared/siteExtraction';

export interface WebsiteFirstAnalysis {
  companyName?: string;
  industry?: string;
  industryClassification?: SiteIndustryClassification | null;
  targetAudience?: string;
  problemStatement?: string;
  solutionStatement?: string;
  uniqueDifferentiator?: string;
  proofPoints?: string[];
  testimonials?: { quote: string; author: string; title?: string }[];
  offers?: SiteOffer[];
  services?: SiteOffer[];
  ctaLabels?: string[];
  gaps?: { field: string; message: string; guidance: string }[];
  /** extract-website-intelligence result, when WebsiteAnalyzer ran it (same extractor as the wizard's website step). */
  siteIntelligence?: Record<string, any> | null;
}

export interface WebsiteFirstBrand {
  companyName?: string | null;
  tagline?: string | null;
  description?: string | null;
  themeColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  logoUrl?: string | null;
  ogImage?: string | null;
  websiteUrl?: string | null;
}

/** Subcategory (or category default) -> design variant. */
const CATEGORY_VARIANT: Record<string, IndustryVariant> = {
  'Healthcare / Medical': 'healthcare',
  'Financial Services': 'fintech',
  'B2B SaaS / Software': 'saas',
  'Technology / Hardware': 'manufacturing',
  'E-commerce / Retail': 'ecommerce',
  'Professional Services': 'consulting',
  'Real Estate / PropTech': 'realestate',
  'Education / EdTech': 'coaching',
  'Media / Entertainment': 'creative',
  'Consumer Apps': 'saas',
  'Non-Profit / Social Impact': 'default',
};
const SUBCATEGORY_VARIANT: Record<string, IndustryVariant> = {
  'Digital Health / Telemedicine': 'healthtech',
  'Healthcare IT / EMR': 'healthtech',
  'Developer Tools': 'devtools',
  'Finance / Accounting Tools': 'fintech',
  'Networking / Infrastructure': 'devtools',
  'Marketing / Advertising Agency': 'creative',
  'Design / Creative Agency': 'creative',
};
/** Variant -> selector labels, used only when the stated text outranks the scored pick. */
const VARIANT_PAIR: Partial<Record<IndustryVariant, [string, string]>> = {
  saas: ['B2B SaaS / Software', 'Other SaaS'],
  'saas-enterprise': ['B2B SaaS / Software', 'Other SaaS'],
  'saas-startup': ['B2B SaaS / Software', 'Other SaaS'],
  devtools: ['B2B SaaS / Software', 'Developer Tools'],
  fintech: ['Financial Services', 'Other Financial'],
  healthtech: ['Healthcare / Medical', 'Digital Health / Telemedicine'],
  healthcare: ['Healthcare / Medical', 'Other Healthcare'],
  consulting: ['Professional Services', 'Consulting'],
  creative: ['Professional Services', 'Design / Creative Agency'],
  coaching: ['Education / EdTech', 'Other Education'],
  manufacturing: ['Technology / Hardware', 'Other Hardware'],
  ecommerce: ['E-commerce / Retail', 'Other Retail'],
  realestate: ['Real Estate / PropTech', 'Other Real Estate'],
};

export function taxonomyVariant(category: string, subcategory: string): IndustryVariant {
  return SUBCATEGORY_VARIANT[subcategory] || CATEGORY_VARIANT[category] || 'default';
}

export interface SiteIndustry {
  industryCategory: string;
  industrySubcategory: string;
  /** Same "Category → Subcategory" string the IndustrySelector writes. */
  industry: string;
  source: 'scored' | 'stated' | 'none';
}

/**
 * Prefill the IndustrySelector from the extraction. The scored classification
 * (model pick constrained to selector labels, with confidence) is ranked against
 * the site's stated industry text through resolveIndustry, so scored beats stated
 * exactly as everywhere else.
 */
export function resolveSiteIndustry(analysis: WebsiteFirstAnalysis | null | undefined): SiteIndustry {
  const none: SiteIndustry = { industryCategory: '', industrySubcategory: '', industry: '', source: 'none' };
  if (!analysis) return none;
  const scored = validIndustryClassification(analysis.industryClassification);
  const stated = (analysis.industry || '').trim();
  const scoredVariant = scored ? taxonomyVariant(scored.category, scored.subcategory) : null;
  const resolution = resolveIndustry(stated || null, scoredVariant, scored?.confidence ?? null);
  const pair = (category: string, subcategory: string, source: SiteIndustry['source']): SiteIndustry =>
    ({ industryCategory: category, industrySubcategory: subcategory, industry: `${category} → ${subcategory}`, source });

  if (scored && (resolution.source === 'scored' || resolution.industry === scoredVariant)) {
    return pair(scored.category, scored.subcategory, 'scored');
  }
  const statedPair = resolution.industry !== 'default' ? VARIANT_PAIR[resolution.industry] : undefined;
  if (statedPair) return pair(statedPair[0], statedPair[1], 'stated');
  // Low-confidence scored pick with nothing better: still a real selector option the owner reviews.
  if (scored) return pair(scored.category, scored.subcategory, 'scored');
  return none;
}

const isHex = (c: unknown): c is string => typeof c === 'string' && /^#?[0-9a-f]{3,8}$/i.test(c.trim());
const uniq = (xs: (string | null | undefined)[]) => {
  const out: string[] = [];
  for (const x of xs) if (isHex(x) && !out.some((o) => o.toLowerCase() === x.toLowerCase())) out.push(x.trim());
  return out;
};

/**
 * Extracted brand colours, in order: extract-brand (what the owner saw on the
 * URL step), then extract-website-intelligence (reads external stylesheets).
 * Never substitutes a default hex.
 */
export function resolveSiteColors(brand: WebsiteFirstBrand | null | undefined, siteIntel?: Record<string, any> | null): string[] {
  const fromBrand = uniq([brand?.themeColor, brand?.secondaryColor, brand?.accentColor]);
  if (fromBrand.length) return fromBrand;
  const si = siteIntel || {};
  return uniq([si.primary, si.secondary, si.accent, ...(Array.isArray(si.brandColors) ? si.brandColors : [])]);
}

/** Owner-visible list of the site's offers, verbatim, one per line. */
const offerList = (offers: SiteOffer[]) => offers.map((o) => (o.description ? `${o.name} - ${o.description}` : o.name)).join('\n');

/** Partial ConsultationData for the wizard's initial state. */
export function websiteFirstPrefill(analysis: WebsiteFirstAnalysis, brand: WebsiteFirstBrand | null | undefined): Record<string, any> {
  const siteIntel = analysis.siteIntelligence && typeof analysis.siteIntelligence === 'object' ? analysis.siteIntelligence : null;
  const offers = (analysis.offers?.length ? analysis.offers : analysis.services || []).filter((o) => o && typeof o.name === 'string' && o.name.trim());
  const ctaLabels = (analysis.ctaLabels || []).filter((c) => typeof c === 'string' && c.trim());
  const colors = resolveSiteColors(brand, siteIntel);
  const logoUrl = brand?.logoUrl || siteIntel?.logoUrl || null;
  const companyName = analysis.companyName || brand?.companyName || siteIntel?.companyName || '';
  const industry = resolveSiteIndustry(analysis);

  const initial: Record<string, any> = {
    businessName: companyName,
    websiteUrl: brand?.websiteUrl || '',
    hasExistingWebsite: !!brand?.websiteUrl,
    industry: industry.industry,
    industryCategory: industry.industryCategory || undefined,
    industrySubcategory: industry.industrySubcategory || undefined,
    idealClient: analysis.targetAudience || '',
    clientFrustration: analysis.problemStatement || '',
    uniqueStrength: analysis.uniqueDifferentiator || analysis.solutionStatement || brand?.tagline || '',
    // Offers and CTA are the site's own words; the model's suggestions never land here.
    mainOffer: offers[0]?.name || '',
    offerIncludes: offers.length > 1 ? offerList(offers) : offers[0]?.description || '',
    ctaText: ctaLabels[0] || '',
    achievements: (analysis.proofPoints || []).join('\n'),
    testimonialText: analysis.testimonials?.[0]?.quote || '',
  };

  if (colors.length || logoUrl) {
    initial.brandSettings = {
      logoUrl,
      primaryColor: colors[0] || '',
      secondaryColor: colors[1] || '',
      headingFont: 'Inter',
      bodyFont: 'Inter',
      modified: true,
    };
  }
  if (brand?.ogImage) initial.heroBackgroundUrl = brand.ogImage;

  initial.websiteIntelligence = {
    // Same shape the wizard's website step stores (extract-website-intelligence), plus the brand fields.
    ...(siteIntel || {}),
    logoUrl,
    brandColors: colors,
    primaryColor: colors[0] || null,
    secondaryColor: colors[1] || null,
    title: companyName || null,
    tagline: brand?.tagline || siteIntel?.tagline || null,
    description: brand?.description || siteIntel?.description || null,
    heroText: siteIntel?.heroText || null,
    testimonials: analysis.testimonials?.map((t) => t.quote) || [],
    companyName: companyName || null,
    siteOffers: offers,
    siteCtaLabels: ctaLabels,
  };
  return initial;
}

/** INDUSTRY_TAXONOMY is re-exported so UI code and tests share one list. */
export { INDUSTRY_TAXONOMY };

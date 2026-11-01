// Website-first extraction contract (analyze-website -> wizard prefill -> brief).
//
// Copy taken from the owner's own site counts as owner input, so it may reach the
// page - but only VERBATIM. Offers, CTA labels and testimonials the model returns
// are kept only when the exact text appears on the site; anything the model
// suggested or paraphrased is dropped, never prefilled. Pure and import-free so
// both Deno edge functions and the client (and bun tests) share it.

/** Mirrors the IndustrySelector labels exactly (category label -> subcategory labels). A test guards drift. */
export const INDUSTRY_TAXONOMY: Record<string, string[]> = {
  'Healthcare / Medical': ['Biotechnology', 'Medical Devices', 'Digital Health / Telemedicine', 'Pharmaceuticals', 'Healthcare IT / EMR', 'Mental Health / Wellness', 'Clinical Research', 'Health Insurance', 'Other Healthcare'],
  'Financial Services': ['Banking / Neobanks', 'Insurance / InsurTech', 'Payments / FinTech', 'Investment / WealthTech', 'Lending / Credit', 'Cryptocurrency / Web3', 'Accounting / Tax', 'Other Financial'],
  'B2B SaaS / Software': ['Marketing / Sales Tools', 'HR / People Operations', 'Developer Tools', 'AI / Machine Learning', 'Analytics / Business Intelligence', 'Security / Compliance', 'Productivity / Collaboration', 'Finance / Accounting Tools', 'Customer Support / Success', 'Other SaaS'],
  'Technology / Hardware': ['Consumer Electronics', 'IoT / Smart Devices', 'Robotics / Automation', 'Semiconductors', 'Clean Tech / Energy', 'Aerospace / Defense', 'Networking / Infrastructure', 'Other Hardware'],
  'E-commerce / Retail': ['Fashion / Apparel', 'Food / Beverage', 'Beauty / Personal Care', 'Home / Furniture', 'Electronics / Gadgets', 'Marketplace / Multi-vendor', 'Subscription / DTC', 'Other Retail'],
  'Professional Services': ['Legal / LegalTech', 'Consulting', 'Marketing / Advertising Agency', 'Design / Creative Agency', 'Recruiting / Staffing', 'Accounting / Bookkeeping', 'Other Services'],
  'Home & Local Services': ['Lawn Care / Landscaping', 'Cleaning / Maid Services', 'HVAC / Plumbing / Electrical', 'Roofing / Siding / Exteriors', 'Remodeling / Handyman', 'Pest Control', 'Moving / Junk Hauling', 'Auto Repair / Detailing', 'Pet Grooming / Care', 'Other Local Services'],
  'Real Estate / PropTech': ['Residential', 'Commercial', 'Property Management', 'Mortgage / Lending', 'Construction / Development', 'Other Real Estate'],
  'Education / EdTech': ['K-12', 'Higher Education', 'Corporate Training', 'Online Courses / MOOCs', 'Tutoring / Test Prep', 'Language Learning', 'Other Education'],
  'Media / Entertainment': ['Streaming / Video', 'Gaming', 'Music / Audio', 'Publishing / News', 'Social Media', 'Sports / Fitness', 'Other Media'],
  'Consumer Apps': ['Dating / Social', 'Travel / Hospitality', 'Food Delivery', 'Transportation / Mobility', 'Personal Finance', 'Health / Fitness', 'Other Consumer'],
  'Non-Profit / Social Impact': ['Environmental / Climate', 'Social Services', 'Arts / Culture', 'International Development', 'Animal Welfare', 'Community / Local', 'Other Non-Profit'],
};

export function taxonomyPromptList(): string {
  return Object.entries(INDUSTRY_TAXONOMY).map(([c, subs]) => `- ${c}: ${subs.join(' | ')}`).join('\n');
}

export interface SiteOffer { name: string; description: string }
export interface SiteIndustryClassification {
  category: string;
  subcategory: string;
  confidence: 'high' | 'medium' | 'low';
}
export interface SanitizedSiteAnalysis {
  companyName: string;
  industry: string;
  industryClassification: SiteIndustryClassification | null;
  targetAudience: string;
  problemStatement: string;
  solutionStatement: string;
  uniqueDifferentiator: string;
  proofPoints: string[];
  testimonials: { quote: string; author: string; title?: string }[];
  offers: SiteOffer[];
  /** Back-compat alias of offers. */
  services: SiteOffer[];
  ctaLabels: string[];
  gaps: { field: string; message: string; guidance: string }[];
}

const decode = (s: string) => s
  .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&#39;|&apos;|&rsquo;|&lsquo;/gi, "'")
  .replace(/&quot;|&ldquo;|&rdquo;/gi, '"').replace(/&ndash;|&mdash;/gi, '-').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');

/** Case/whitespace/typographic-quote-insensitive form used for verbatim checks. */
export function normalizeForMatch(s: string): string {
  return decode(String(s || ''))
    .replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-')
    .replace(/ /g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

/** True when `text` appears on the site exactly (modulo case, whitespace and quote style). */
export function appearsOnSite(text: unknown, siteText: string): boolean {
  if (typeof text !== 'string') return false;
  const needle = normalizeForMatch(text).replace(/[.!?:;,]+$/, '');
  if (needle.length < 2) return false;
  return normalizeForMatch(siteText).includes(needle);
}

/** Visible page text from raw HTML (scripts/styles removed). */
export function htmlToText(html: string): string {
  return decode(String(html || '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ').trim();
}

const NAV_LABELS = new Set(['home', 'about', 'about us', 'blog', 'news', 'careers', 'jobs', 'privacy', 'privacy policy', 'terms', 'terms of service', 'cookie policy', 'login', 'log in', 'sign in', 'menu', 'close', 'skip to content', 'skip to main content', 'back to top', 'read more', 'learn more', 'more', 'next', 'previous', 'linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'x']);

/** Button and link labels exactly as the site renders them (the only source a CTA label may come from). */
export function harvestActionLabels(html: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (raw: string) => {
    const label = htmlToText(raw).replace(/\s+/g, ' ').trim();
    const key = normalizeForMatch(label);
    if (label.length < 2 || label.length > 60 || label.split(' ').length > 8) return;
    if (!/[a-z]/i.test(label) || NAV_LABELS.has(key) || seen.has(key)) return;
    seen.add(key);
    out.push(label);
  };
  const src = String(html || '');
  for (const m of src.matchAll(/<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/gi)) push(m[2]);
  for (const m of src.matchAll(/<input\b[^>]*type=["']?(?:submit|button)["']?[^>]*value=["']([^"']+)["'][^>]*>/gi)) push(m[1]);
  return out.slice(0, 60);
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/** A model-picked industry is kept only when both labels are real IndustrySelector options. */
export function validIndustryClassification(raw: unknown): SiteIndustryClassification | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const category = str(r.category);
  const subcategory = str(r.subcategory);
  const confidence = str(r.confidence).toLowerCase();
  if (!INDUSTRY_TAXONOMY[category]?.includes(subcategory)) return null;
  if (confidence !== 'high' && confidence !== 'medium' && confidence !== 'low') return null;
  return { category, subcategory, confidence };
}

/**
 * Enforces the verbatim contract on a raw model analysis.
 * siteText: the visible text the model read. actionLabels: harvested button/link labels.
 */
export function sanitizeSiteAnalysis(raw: any, siteText: string, actionLabels: string[] = []): SanitizedSiteAnalysis {
  const a = raw && typeof raw === 'object' ? raw : {};
  const dropped: string[] = [];
  const offersIn = Array.isArray(a.offers) ? a.offers : Array.isArray(a.services) ? a.services : [];
  const offers: SiteOffer[] = [];
  const seenOffer = new Set<string>();
  for (const o of offersIn) {
    const name = str(o?.name);
    if (!name || seenOffer.has(normalizeForMatch(name))) continue;
    if (!appearsOnSite(name, siteText)) { dropped.push(`offer "${name}"`); continue; }
    seenOffer.add(normalizeForMatch(name));
    const description = str(o?.description);
    offers.push({ name, description: description && appearsOnSite(description, siteText) ? description : '' });
    if (offers.length >= 8) break;
  }

  const labelText = actionLabels.join(' \n ');
  const ctaLabels: string[] = [];
  for (const c of Array.isArray(a.ctaLabels) ? a.ctaLabels : []) {
    const label = str(c).replace(/^["']|["']$/g, '');
    if (!label || ctaLabels.some((x) => normalizeForMatch(x) === normalizeForMatch(label))) continue;
    // Prefer the exact casing the site's button uses.
    const exact = actionLabels.find((l) => normalizeForMatch(l) === normalizeForMatch(label));
    if (exact) ctaLabels.push(exact);
    else if (appearsOnSite(label, labelText) || appearsOnSite(label, siteText)) ctaLabels.push(label);
    else dropped.push(`cta "${label}"`);
    if (ctaLabels.length >= 6) break;
  }

  const testimonials = (Array.isArray(a.testimonials) ? a.testimonials : [])
    .filter((t: any) => {
      const ok = appearsOnSite(t?.quote, siteText);
      if (!ok && str(t?.quote)) dropped.push('testimonial');
      return ok;
    })
    .map((t: any) => ({ quote: str(t.quote), author: appearsOnSite(t.author, siteText) ? str(t.author) : '', ...(appearsOnSite(t.title, siteText) ? { title: str(t.title) } : {}) }));

  const proofPoints = (Array.isArray(a.proofPoints) ? a.proofPoints : []).filter((p: unknown) => {
    const ok = appearsOnSite(p, siteText);
    if (!ok && str(p)) dropped.push(`proof "${String(p).slice(0, 40)}"`);
    return ok;
  }).map(str);

  if (dropped.length) console.log('🛡️ [site-extraction] Dropped non-verbatim items:', dropped.join('; '));
  if (a.recommendedCTA || a.recommendedOffer) console.log('🛡️ [site-extraction] Ignored model-suggested CTA/offer (suggestions are never prefilled)');

  const gaps = Array.isArray(a.gaps) ? a.gaps.filter((g: any) => g && typeof g.field === 'string') : [];
  if (!ctaLabels.length && !gaps.some((g: any) => g.field === 'ctaText')) {
    gaps.push({ field: 'ctaText', message: 'No call-to-action button found on your site', guidance: 'Enter the exact button text you want visitors to click.' });
  }
  if (!offers.length && !gaps.some((g: any) => g.field === 'mainOffer')) {
    gaps.push({ field: 'mainOffer', message: 'No named offer found on your site', guidance: 'Name the offer exactly as you sell it.' });
  }

  return {
    companyName: str(a.companyName),
    industry: str(a.industry),
    industryClassification: validIndustryClassification(a.industryClassification),
    targetAudience: str(a.targetAudience),
    problemStatement: str(a.problemStatement),
    solutionStatement: str(a.solutionStatement),
    uniqueDifferentiator: str(a.uniqueDifferentiator),
    proofPoints,
    testimonials,
    offers,
    services: offers,
    ctaLabels,
    gaps,
  };
}

/** The CTA the owner stated (typed in the wizard or taken verbatim from their site). */
export function statedCtaText(data: any): string {
  const d = data && typeof data === 'object' ? data : {};
  return str(d.primaryCTA) || str(d.ctaText) || str(d.primary_cta);
}

/** Owner-stated copy outranks the brief's restatement: the brief's ctaText is pinned to the stated CTA. */
export function pinStatedCopy(brief: any, data: any): void {
  if (!brief || typeof brief !== 'object') return;
  const cta = statedCtaText(data);
  if (cta && brief.ctaText !== cta) {
    if (brief.ctaText) console.log(`🛡️ [brief-guard] ctaText "${String(brief.ctaText).slice(0, 40)}" replaced with the stated CTA verbatim`);
    brief.ctaText = cta;
  }
}

/** Prompt block listing site copy the brief must reuse word for word. */
export function siteCopyPromptBlock(data: any): string {
  const wi = data?.websiteIntelligence || {};
  const offers: SiteOffer[] = Array.isArray(wi.siteOffers) ? wi.siteOffers : [];
  const ctas: string[] = Array.isArray(wi.siteCtaLabels) ? wi.siteCtaLabels : [];
  if (!offers.length && !ctas.length) return '';
  return `
## Stated On The Client's Website (verbatim - reuse these exact words, never rename or paraphrase)
${offers.length ? `- Offers: ${offers.map((o) => `"${o.name}"`).join(', ')}` : ''}
${ctas.length ? `- CTA labels: ${ctas.map((c) => `"${c}"`).join(', ')}` : ''}
When a messaging pillar is about one of these offers, its title is the offer name exactly as written. ctaText is the stated CTA text exactly.
`;
}

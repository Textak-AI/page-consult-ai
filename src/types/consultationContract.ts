// Canonical data contract for consultation - both wizards must produce this
// Based on StrategicConsultation.tsx field requirements (the gold standard)

export type FieldTier = 'required' | 'enrichment' | 'proof' | 'advanced' | 'brand';

export interface FieldDefinition {
  key: string;
  tier: FieldTier;
  label: string;
  source: string;
  weight: number;
  extractionHint?: string;
}

// Master field registry - documents what StrategicConsultation collects
export const FIELD_REGISTRY: FieldDefinition[] = [
  // REQUIRED (60 points) - page cannot generate without these
  { key: 'businessName', tier: 'required', label: 'Business Name', source: 'identity', weight: 10 },
  { key: 'industry', tier: 'required', label: 'Industry', source: 'identity', weight: 8 },
  { key: 'industryCategory', tier: 'required', label: 'Industry Category', source: 'identity', weight: 4 },
  { key: 'industrySubcategory', tier: 'required', label: 'Industry Subcategory', source: 'identity', weight: 4 },
  { key: 'idealClient', tier: 'required', label: 'Ideal Client', source: 'audience', weight: 10 },
  { key: 'mainOffer', tier: 'required', label: 'Main Offer', source: 'offer', weight: 10 },
  { key: 'primaryGoal', tier: 'required', label: 'Page Goal', source: 'goals', weight: 8 },
  { key: 'ctaText', tier: 'required', label: 'CTA Text', source: 'goals', weight: 6 },
  
  // ENRICHMENT (20 points) - significantly improves output
  { key: 'productName', tier: 'enrichment', label: 'Product/Service Name', source: 'identity', weight: 3 },
  { key: 'uniqueStrength', tier: 'enrichment', label: 'Unique Strength', source: 'identity', weight: 3 },
  { key: 'identitySentence', tier: 'enrichment', label: 'Identity Sentence', source: 'identity', weight: 4 },
  { key: 'clientFrustration', tier: 'enrichment', label: 'Client Frustrations', source: 'audience', weight: 3 },
  { key: 'desiredOutcome', tier: 'enrichment', label: 'Desired Outcome', source: 'audience', weight: 3 },
  { key: 'offerIncludes', tier: 'enrichment', label: 'Offer Includes', source: 'offer', weight: 2 },
  { key: 'processDescription', tier: 'enrichment', label: 'Process Description', source: 'offer', weight: 2 },
  
  // PROOF (15 points) - enables credibility sections
  { key: 'yearsInBusiness', tier: 'proof', label: 'Years in Business', source: 'identity', weight: 3,
    extractionHint: 'Look for "X years", "since [year]", "founded in"' },
  { key: 'clientCount', tier: 'proof', label: 'Client Count', source: 'credibility', weight: 3,
    extractionHint: 'Look for "X clients", "worked with X", "served X"' },
  { key: 'achievements', tier: 'proof', label: 'Achievements', source: 'credibility', weight: 3,
    extractionHint: 'Look for certifications, awards, credentials' },
  { key: 'testimonialText', tier: 'proof', label: 'Testimonial', source: 'credibility', weight: 2 },
  { key: 'concreteProofStory', tier: 'proof', label: 'Proof Story', source: 'credibility', weight: 2 },
  { key: 'proofStoryContext', tier: 'proof', label: 'Proof Context', source: 'credibility', weight: 2 },
  
  // ADVANCED (5 points) - premium features
  { key: 'investmentRange', tier: 'advanced', label: 'Investment Range', source: 'offer', weight: 1 },
  { key: 'methodologySteps', tier: 'advanced', label: 'Methodology Steps', source: 'offer', weight: 2 },
  { key: 'objectionsToOvercome', tier: 'advanced', label: 'Objections', source: 'goals', weight: 1 },
  { key: 'calculatorTypicalResults', tier: 'advanced', label: 'Calculator Results', source: 'offer', weight: 0.5 },
  { key: 'calculatorDisclaimer', tier: 'advanced', label: 'Calculator Disclaimer', source: 'offer', weight: 0.25 },
  { key: 'calculatorNextStep', tier: 'advanced', label: 'Calculator CTA', source: 'offer', weight: 0.25 },
  
  // BRAND (separate track)
  { key: 'websiteUrl', tier: 'brand', label: 'Website URL', source: 'BrandSetup', weight: 2 },
  { key: 'logoUrl', tier: 'brand', label: 'Logo', source: 'BrandSetup', weight: 2 },
  { key: 'primaryColor', tier: 'brand', label: 'Primary Color', source: 'branding', weight: 1 },
  { key: 'secondaryColor', tier: 'brand', label: 'Secondary Color', source: 'branding', weight: 1 },
  { key: 'fontFamily', tier: 'brand', label: 'Font', source: 'branding', weight: 1 },
];

// Guided options - must match StrategicConsultation exactly
export const GUIDED_OPTIONS = {
  industryCategories: [
    'Healthcare / Medical',
    'Financial Services',
    'B2B SaaS / Software',
    'Technology / Hardware',
    'E-commerce / Retail',
    'Professional Services',
    'Real Estate / PropTech',
    'Education / EdTech',
    'Media / Entertainment',
    'Consumer Apps',
  ],
  
  pageGoals: [
    { id: 'leads', label: 'Generate leads (contact form, download)' },
    { id: 'calls', label: 'Get phone calls' },
    { id: 'meetings', label: 'Book meetings or demos' },
    { id: 'sales', label: 'Drive direct sales' },
  ],
  
  investmentRanges: [
    'Under $500',
    '$500 – $2,000',
    '$2,000 – $10,000',
    '$10,000 – $50,000',
    '$50,000+',
    'Custom / Contact for pricing',
  ],
  
  clientCounts: [
    'Just getting started',
    '1-10 clients',
    '10-50 clients',
    '50-200 clients',
    '200+ clients',
  ],
};

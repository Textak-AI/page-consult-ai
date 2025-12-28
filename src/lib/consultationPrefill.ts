// Utility for serializing and deserializing consultation prefill data

export interface PrefillData {
  // From demo chat
  businessName?: string;
  industry?: string;
  targetAudience?: string;
  valueProposition?: string;
  businessType?: 'B2B' | 'B2C' | 'Both';
  goals?: string[];
  competitivePosition?: string;
  
  // Market research
  marketSize?: string;
  buyerPersona?: string;
  commonObjections?: string[];
  industryInsights?: string[];
  
  // Meta
  source: 'landing_demo' | 'consultation' | 'wizard';
  email?: string;
  sessionId?: string;
  completedAt?: string;
}

export interface GapAnalysis {
  missingFields: string[];
  completedFields: string[];
  percentComplete: number;
  requiredActions: {
    field: string;
    label: string;
    priority: 'required' | 'recommended' | 'optional';
  }[];
}

const STORAGE_KEY = 'pageconsult_prefill';

/**
 * Serialize prefill data to session storage
 */
export function savePrefillData(data: PrefillData): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      completedAt: new Date().toISOString()
    }));
  } catch (err) {
    console.error('Failed to save prefill data:', err);
  }
}

/**
 * Load prefill data from session storage or URL params
 */
export function loadPrefillData(): PrefillData | null {
  try {
    // Check URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const urlPrefill = urlParams.get('prefill');
    
    if (urlPrefill) {
      const parsed = JSON.parse(decodeURIComponent(urlPrefill));
      // Transform from demo format to prefill format
      return transformDemoData(parsed);
    }
    
    // Fall back to session storage
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    return null;
  } catch (err) {
    console.error('Failed to load prefill data:', err);
    return null;
  }
}

/**
 * Transform demo chat data to wizard prefill format
 */
function transformDemoData(demoData: any): PrefillData {
  const extracted = demoData.extracted || {};
  const market = demoData.market || {};
  
  return {
    industry: extracted.industry || undefined,
    targetAudience: extracted.audience || undefined,
    valueProposition: extracted.valueProp || undefined,
    businessType: extracted.businessType || undefined,
    marketSize: market.marketSize || undefined,
    buyerPersona: market.buyerPersona || undefined,
    commonObjections: market.commonObjections || [],
    industryInsights: market.industryInsights || [],
    source: demoData.source || 'landing_demo',
    email: demoData.email || undefined,
    sessionId: demoData.sessionId || undefined,
  };
}

/**
 * Clear prefill data from storage
 */
export function clearPrefillData(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    // Also clean URL params
    const url = new URL(window.location.href);
    url.searchParams.delete('prefill');
    window.history.replaceState({}, '', url.toString());
  } catch (err) {
    console.error('Failed to clear prefill data:', err);
  }
}

/**
 * Analyze what data is missing for a complete consultation
 */
export function analyzeGaps(data: PrefillData | null): GapAnalysis {
  const fields = {
    industry: { label: 'Industry', priority: 'required' as const },
    targetAudience: { label: 'Target Audience', priority: 'required' as const },
    valueProposition: { label: 'Value Proposition', priority: 'required' as const },
    businessName: { label: 'Business Name', priority: 'required' as const },
    // These would typically come from wizard steps
    websiteUrl: { label: 'Website URL', priority: 'recommended' as const },
    logo: { label: 'Logo', priority: 'recommended' as const },
    brandColors: { label: 'Brand Colors', priority: 'optional' as const },
    testimonials: { label: 'Testimonials', priority: 'optional' as const },
  };
  
  const completedFields: string[] = [];
  const missingFields: string[] = [];
  const requiredActions: GapAnalysis['requiredActions'] = [];
  
  for (const [field, config] of Object.entries(fields)) {
    const value = data?.[field as keyof PrefillData];
    const hasValue = value !== undefined && value !== null && value !== '';
    
    if (hasValue) {
      completedFields.push(field);
    } else {
      missingFields.push(field);
      requiredActions.push({
        field,
        label: config.label,
        priority: config.priority,
      });
    }
  }
  
  const percentComplete = Math.round((completedFields.length / Object.keys(fields).length) * 100);
  
  // Sort by priority
  const priorityOrder = { required: 0, recommended: 1, optional: 2 };
  requiredActions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return {
    missingFields,
    completedFields,
    percentComplete,
    requiredActions,
  };
}

/**
 * Generate a URL with prefill data encoded
 */
export function generatePrefillUrl(data: PrefillData, basePath: string = '/wizard'): string {
  const encoded = encodeURIComponent(JSON.stringify(data));
  return `${basePath}?prefill=${encoded}`;
}

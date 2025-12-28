// Utility for serializing and deserializing consultation prefill data

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  extractedFields?: string[];
}

export interface PrefillData {
  // Core business intelligence (from demo chat extraction)
  extracted: {
    businessName?: string;
    industry?: string;
    audience?: string;
    valueProp?: string;
    competitive?: string;
    goals?: string;
    swagger?: string;
    primaryCTA?: string;
    secondaryCTA?: string;
    tone?: string;
    proofPoints?: string[];
    objections?: string[];
    methodology?: string;
    businessType?: 'B2B' | 'B2C' | 'Both';
  };
  
  // Market research results (from Perplexity)
  market: {
    industryInsights: string[];
    competitorPositioning: string[];
    audiencePainPoints: string[];
    marketStatistics: Array<{
      stat: string;
      source?: string;
    }>;
    commonObjections: string[];
    buyerPersona?: string;
    marketSize?: string;
    researchComplete: boolean;
  };
  
  // Full conversation history
  conversation: ConversationMessage[];
  
  // Session metadata
  meta: {
    email?: string;
    sessionId: string;
    readiness: number;
    source: 'landing_demo' | 'consultation' | 'wizard';
    savedAt: string;
    demoCompleted: boolean;
  };
  
  // Legacy fields for backwards compatibility
  industry?: string;
  targetAudience?: string;
  valueProposition?: string;
  businessType?: 'B2B' | 'B2C' | 'Both';
  goals?: string[];
  competitivePosition?: string;
  marketSize?: string;
  buyerPersona?: string;
  commonObjections?: string[];
  industryInsights?: string[];
  source?: 'landing_demo' | 'consultation' | 'wizard';
  email?: string;
  sessionId?: string;
  completedAt?: string;
  businessName?: string;
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

const STORAGE_KEY = 'pageconsult_demo_prefill';
const LEGACY_KEY = 'pageconsult_prefill';

/**
 * Serialize prefill data to localStorage (survives auth redirects)
 */
export function savePrefillData(data: PrefillData): void {
  try {
    const toSave = {
      ...data,
      meta: {
        ...data.meta,
        savedAt: new Date().toISOString(),
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    console.log('💾 [Prefill] Saved complete prefill data:', {
      hasExtracted: !!data.extracted,
      hasMarket: !!data.market,
      conversationLength: data.conversation?.length || 0,
      readiness: data.meta?.readiness || 0,
    });
  } catch (err) {
    console.error('Failed to save prefill data:', err);
  }
}

/**
 * Load prefill data from localStorage or session storage
 */
export function loadPrefillData(): PrefillData | null {
  try {
    // Check localStorage first (new format)
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      
      // Validate data is recent (within 2 hours)
      if (data.meta?.savedAt) {
        const savedAt = new Date(data.meta.savedAt);
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        if (savedAt < twoHoursAgo) {
          console.log('⏰ [Prefill] Data expired, clearing...');
          localStorage.removeItem(STORAGE_KEY);
          return null;
        }
      }
      
      console.log('📂 [Prefill] Loaded prefill data:', {
        hasExtracted: !!data.extracted,
        hasMarket: !!data.market,
        conversationLength: data.conversation?.length || 0,
        readiness: data.meta?.readiness || 0,
      });
      
      return data;
    }
    
    // Fall back to session storage (legacy format)
    const legacyStored = sessionStorage.getItem(LEGACY_KEY);
    if (legacyStored) {
      const legacyData = JSON.parse(legacyStored);
      // Convert to new format
      return transformLegacyData(legacyData);
    }
    
    // Check URL params (legacy)
    const urlParams = new URLSearchParams(window.location.search);
    const urlPrefill = urlParams.get('prefill');
    if (urlPrefill && urlPrefill !== 'true' && urlPrefill !== 'demo') {
      try {
        const parsed = JSON.parse(decodeURIComponent(urlPrefill));
        return transformLegacyData(parsed);
      } catch {
        // Ignore parse errors
      }
    }
    
    return null;
  } catch (err) {
    console.error('Failed to load prefill data:', err);
    return null;
  }
}

/**
 * Transform legacy prefill format to new format
 */
function transformLegacyData(legacy: any): PrefillData {
  return {
    extracted: {
      businessName: legacy.businessName,
      industry: legacy.industry,
      audience: legacy.targetAudience || legacy.audience,
      valueProp: legacy.valueProposition || legacy.valueProp,
      competitive: legacy.competitivePosition || legacy.marketSize,
      goals: legacy.goals?.[0],
      businessType: legacy.businessType,
    },
    market: {
      industryInsights: legacy.industryInsights || [],
      competitorPositioning: [],
      audiencePainPoints: [],
      marketStatistics: [],
      commonObjections: legacy.commonObjections || [],
      buyerPersona: legacy.buyerPersona,
      marketSize: legacy.marketSize,
      researchComplete: (legacy.industryInsights?.length || 0) > 0,
    },
    conversation: [],
    meta: {
      email: legacy.email,
      sessionId: legacy.sessionId || '',
      readiness: 0,
      source: legacy.source || 'landing_demo',
      savedAt: legacy.completedAt || new Date().toISOString(),
      demoCompleted: false,
    },
    // Keep legacy fields for backwards compatibility
    industry: legacy.industry,
    targetAudience: legacy.targetAudience,
    valueProposition: legacy.valueProposition,
    businessType: legacy.businessType,
    goals: legacy.goals,
    competitivePosition: legacy.competitivePosition,
    marketSize: legacy.marketSize,
    buyerPersona: legacy.buyerPersona,
    commonObjections: legacy.commonObjections,
    industryInsights: legacy.industryInsights,
    source: legacy.source,
    email: legacy.email,
    sessionId: legacy.sessionId,
    completedAt: legacy.completedAt,
    businessName: legacy.businessName,
  };
}

/**
 * Clear prefill data from all storage locations
 */
export function clearPrefillData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(LEGACY_KEY);
    // Also clean URL params
    const url = new URL(window.location.href);
    url.searchParams.delete('prefill');
    window.history.replaceState({}, '', url.toString());
    console.log('🧹 [Prefill] Cleared all prefill data');
  } catch (err) {
    console.error('Failed to clear prefill data:', err);
  }
}

/**
 * Analyze what data is missing for a complete consultation
 */
export function analyzeGaps(data: PrefillData | null): GapAnalysis {
  const fields = {
    businessName: { label: 'Business Name', priority: 'required' as const, path: 'extracted.businessName' },
    industry: { label: 'Industry', priority: 'required' as const, path: 'extracted.industry' },
    audience: { label: 'Target Audience', priority: 'required' as const, path: 'extracted.audience' },
    valueProp: { label: 'Value Proposition', priority: 'required' as const, path: 'extracted.valueProp' },
    goals: { label: 'Goals', priority: 'recommended' as const, path: 'extracted.goals' },
    competitive: { label: 'Competitive Position', priority: 'recommended' as const, path: 'extracted.competitive' },
    primaryCTA: { label: 'Call to Action', priority: 'recommended' as const, path: 'extracted.primaryCTA' },
    websiteUrl: { label: 'Website URL', priority: 'optional' as const, path: 'websiteUrl' },
    logo: { label: 'Logo', priority: 'optional' as const, path: 'logo' },
  };
  
  const completedFields: string[] = [];
  const missingFields: string[] = [];
  const requiredActions: GapAnalysis['requiredActions'] = [];
  
  for (const [field, config] of Object.entries(fields)) {
    let value: any;
    
    // Navigate the path
    const pathParts = config.path.split('.');
    if (pathParts.length === 2) {
      value = (data as any)?.[pathParts[0]]?.[pathParts[1]];
    } else {
      value = (data as any)?.[config.path];
    }
    
    // Also check legacy fields
    if (!value && data) {
      value = (data as any)[field];
    }
    
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
 * Generate a URL with prefill indicator
 */
export function generatePrefillUrl(basePath: string = '/wizard'): string {
  return `${basePath}?prefill=demo`;
}

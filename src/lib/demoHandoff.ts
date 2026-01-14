/**
 * Demo Handoff Utility
 * Handles persistence and migration of demo intelligence data across signup flow
 */

import { supabase } from '@/integrations/supabase/client';

// Storage keys for demo data
const DEMO_STORAGE_KEYS = {
  intelligence: 'pageconsult_demo_handoff_intelligence',
  artifacts: 'pageconsult_demo_handoff_artifacts',
  strategyBrief: 'pageconsult_demo_handoff_brief',
  market: 'pageconsult_demo_handoff_market',
  sessionId: 'pageconsult_demo_handoff_session',
  timestamp: 'pageconsult_demo_handoff_timestamp',
  brandData: 'pageconsult_demo_handoff_brand',
} as const;

const HANDOFF_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface DemoHandoffData {
  sessionId: string;
  extracted: Record<string, any>;
  market: Record<string, any>;
  artifacts?: Record<string, any>;
  strategyBrief?: Record<string, any>;
  brandData?: Record<string, any>;
  conversationHistory?: Array<{ role: string; content: string; timestamp?: string }>;
  readinessScore: number;
  savedAt: string;
}

/**
 * Save complete demo intelligence state before signup
 * Called when user clicks "Generate" from demo
 */
export function saveDemoHandoff(data: DemoHandoffData): void {
  console.log('[Demo Handoff] Pre-signup data:', {
    sessionId: data.sessionId,
    extracted: Object.keys(data.extracted).filter(k => data.extracted[k]).join(', '),
    score: data.readinessScore,
    hasMarket: !!data.market?.industryInsights?.length,
    hasArtifacts: !!data.artifacts?.selectedHeadline,
    hasBrief: !!data.strategyBrief,
  });

  try {
    localStorage.setItem(DEMO_STORAGE_KEYS.intelligence, JSON.stringify(data.extracted));
    localStorage.setItem(DEMO_STORAGE_KEYS.market, JSON.stringify(data.market));
    localStorage.setItem(DEMO_STORAGE_KEYS.sessionId, data.sessionId);
    localStorage.setItem(DEMO_STORAGE_KEYS.timestamp, data.savedAt);
    
    if (data.artifacts) {
      localStorage.setItem(DEMO_STORAGE_KEYS.artifacts, JSON.stringify(data.artifacts));
    }
    if (data.strategyBrief) {
      localStorage.setItem(DEMO_STORAGE_KEYS.strategyBrief, JSON.stringify(data.strategyBrief));
    }
    if (data.brandData) {
      localStorage.setItem(DEMO_STORAGE_KEYS.brandData, JSON.stringify(data.brandData));
    }
  } catch (e) {
    console.error('[Demo Handoff] Failed to save:', e);
  }
}

/**
 * Load demo handoff data from localStorage
 * Returns null if data is expired or doesn't exist
 */
export function loadDemoHandoff(): DemoHandoffData | null {
  try {
    const timestamp = localStorage.getItem(DEMO_STORAGE_KEYS.timestamp);
    if (!timestamp) return null;

    // Check TTL
    const savedAt = new Date(timestamp).getTime();
    if (Date.now() - savedAt > HANDOFF_TTL) {
      console.log('[Demo Handoff] Data expired, clearing');
      clearDemoHandoff();
      return null;
    }

    const extracted = localStorage.getItem(DEMO_STORAGE_KEYS.intelligence);
    const market = localStorage.getItem(DEMO_STORAGE_KEYS.market);
    const sessionId = localStorage.getItem(DEMO_STORAGE_KEYS.sessionId);
    
    if (!extracted || !sessionId) return null;

    const parsedExtracted = JSON.parse(extracted);
    const parsedMarket = market ? JSON.parse(market) : {};
    
    // Calculate readiness from extracted data
    const readinessScore = calculateReadinessFromExtracted(parsedExtracted);
    
    const result: DemoHandoffData = {
      sessionId,
      extracted: parsedExtracted,
      market: parsedMarket,
      readinessScore,
      savedAt: timestamp,
    };

    // Load optional data
    const artifacts = localStorage.getItem(DEMO_STORAGE_KEYS.artifacts);
    if (artifacts) result.artifacts = JSON.parse(artifacts);
    
    const brief = localStorage.getItem(DEMO_STORAGE_KEYS.strategyBrief);
    if (brief) result.strategyBrief = JSON.parse(brief);
    
    const brand = localStorage.getItem(DEMO_STORAGE_KEYS.brandData);
    if (brand) result.brandData = JSON.parse(brand);

    console.log('[Demo Handoff] Loaded data:', {
      sessionId: result.sessionId,
      score: result.readinessScore,
      hasArtifacts: !!result.artifacts,
      hasBrief: !!result.strategyBrief,
    });

    return result;
  } catch (e) {
    console.error('[Demo Handoff] Failed to load:', e);
    return null;
  }
}

/**
 * Clear all demo handoff data
 * Called after successful migration or when data is expired
 */
export function clearDemoHandoff(): void {
  Object.values(DEMO_STORAGE_KEYS).forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch {}
  });
  console.log('[Demo Handoff] Cleared all handoff data');
}

/**
 * Check if there's demo handoff data available
 */
export function hasDemoHandoff(): boolean {
  const timestamp = localStorage.getItem(DEMO_STORAGE_KEYS.timestamp);
  if (!timestamp) return false;
  
  const savedAt = new Date(timestamp).getTime();
  return Date.now() - savedAt <= HANDOFF_TTL;
}

/**
 * Migrate demo data to user's consultation after signup
 */
export async function migrateDemoToUser(userId: string): Promise<{
  success: boolean;
  consultationId?: string;
  error?: string;
}> {
  const handoff = loadDemoHandoff();
  if (!handoff) {
    return { success: false, error: 'No demo data to migrate' };
  }

  console.log('[Demo Handoff] Post-signup migration:', {
    userId,
    sessionId: handoff.sessionId,
    score: handoff.readinessScore,
  });

  try {
    // Check if consultation already exists for this session
    const { data: existingConsultation } = await supabase
      .from('consultations')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingConsultation) {
      console.log('[Demo Handoff] User already has consultation:', existingConsultation.id);
      clearDemoHandoff();
      return { success: true, consultationId: existingConsultation.id };
    }

    // Create new consultation from demo data
    const { data: consultation, error } = await supabase
      .from('consultations')
      .insert({
        user_id: userId,
        industry: handoff.extracted.industry,
        target_audience: handoff.extracted.audience,
        unique_value: handoff.extracted.valueProp,
        competitor_differentiator: handoff.extracted.competitorDifferentiator,
        audience_pain_points: handoff.extracted.painPoints ? [handoff.extracted.painPoints] : [],
        authority_markers: handoff.extracted.proofElements ? [handoff.extracted.proofElements] : [],
        extracted_intelligence: {
          ...handoff.extracted,
          marketResearch: handoff.market,
          artifacts: handoff.artifacts,
          source: 'demo',
          migratedAt: new Date().toISOString(),
        },
        strategy_brief: handoff.strategyBrief || null,
        consultation_status: handoff.extracted.industry && handoff.extracted.audience ? 'identified' : 'not_started',
        status: 'in_progress',
        readiness_score: handoff.readinessScore,
        flow_state: 'signed_up',
      })
      .select()
      .single();

    if (error || !consultation) {
      console.error('[Demo Handoff] Failed to create consultation:', error);
      return { success: false, error: error?.message || 'Failed to create consultation' };
    }

    // Claim the demo session
    if (handoff.sessionId) {
      await supabase
        .from('demo_sessions')
        .update({
          claimed_by: userId,
          claimed_at: new Date().toISOString(),
        })
        .eq('session_id', handoff.sessionId)
        .is('claimed_by', null);
    }

    console.log('[Demo Handoff] Migration complete:', {
      consultationId: consultation.id,
      migratedData: Object.keys(handoff.extracted).filter(k => handoff.extracted[k]),
    });

    clearDemoHandoff();
    return { success: true, consultationId: consultation.id };
  } catch (e) {
    console.error('[Demo Handoff] Migration error:', e);
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

/**
 * Determine the correct route after Brand Setup based on user's data
 */
export async function getPostBrandSetupRoute(userId: string): Promise<{
  route: string;
  consultationId?: string;
  hasStrategyBrief: boolean;
  readinessScore: number;
}> {
  // First, check for existing consultation with high readiness
  const { data: consultation } = await supabase
    .from('consultations')
    .select('id, readiness_score, strategy_brief, extracted_intelligence')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (consultation) {
    const score = consultation.readiness_score || 0;
    const hasBrief = !!consultation.strategy_brief;
    const intel = consultation.extracted_intelligence as Record<string, any> || {};

    console.log('[Demo Handoff] Route decision:', {
      hasConsultation: true,
      consultationId: consultation.id,
      hasStrategyBrief: hasBrief,
      score,
      route: score >= 70 ? 'huddle' : 'wizard',
    });

    // High readiness: go to huddle to show "I listened" moment
    if (score >= 70) {
      return {
        route: `/huddle?type=pre_brief&consultationId=${consultation.id}`,
        consultationId: consultation.id,
        hasStrategyBrief: hasBrief,
        readinessScore: score,
      };
    }

    // Lower readiness but has consultation: still go to huddle for continuity
    if (score >= 40) {
      return {
        route: `/huddle?type=pre_brief&consultationId=${consultation.id}`,
        consultationId: consultation.id,
        hasStrategyBrief: hasBrief,
        readinessScore: score,
      };
    }
  }

  // No consultation or very low readiness: go to wizard
  console.log('[Demo Handoff] Route decision:', {
    hasConsultation: false,
    route: 'wizard',
  });

  return {
    route: '/wizard',
    hasStrategyBrief: false,
    readinessScore: 0,
  };
}

// Helper to calculate readiness from extracted data
function calculateReadinessFromExtracted(extracted: Record<string, any>): number {
  const fields = [
    { key: 'industry', weight: 15 },
    { key: 'audience', weight: 15 },
    { key: 'valueProp', weight: 20 },
    { key: 'competitorDifferentiator', weight: 15 },
    { key: 'painPoints', weight: 10 },
    { key: 'proofElements', weight: 10 },
    { key: 'buyerObjections', weight: 5 },
    { key: 'socialProof', weight: 10 },
  ];

  return fields.reduce((score, field) => {
    if (extracted[field.key]) {
      return score + field.weight;
    }
    return score;
  }, 0);
}

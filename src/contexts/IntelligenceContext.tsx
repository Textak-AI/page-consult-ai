import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { resolveIndustry } from '@/lib/resolveIndustry';
import { 
  detectIndustryFromConversation, 
  confirmIndustry, 
  variantToDisplayName,
  displayOptionToVariant,
  INDUSTRY_OPTIONS,
  type IndustryDetection 
} from '@/lib/industryDetection';
import { 
  calculateAestheticMode, 
  type AestheticMode 
} from '@/lib/targetAesthetic';
import { 
  getPrecomputedObjections, 
  type PredictedObjection 
} from '@/data/precomputedObjections';
import { generateAssumptiveFollowUp } from '@/utils/assumptiveFollowUp';
import { handleChatNavigation } from '@/lib/chatNavigationHandler';
import { 
  type ConsultationArtifacts,
  type CreativeArtifact,
  createEmptyArtifacts,
  detectPositiveSelection,
  extractArtifactsFromMessage,
  logArtifactCapture,
} from '@/lib/artifactDetection';

// ============================================
// PERSISTENCE KEYS & CONFIG
// ============================================
const STORAGE_KEYS = {
  sessionId: 'pageconsult_demo_session_id',
  conversation: 'pageconsult_demo_conversation',
  extracted: 'pageconsult_demo_extracted',
  market: 'pageconsult_demo_market',
  industryDetection: 'pageconsult_demo_industry',
  timestamp: 'pageconsult_demo_timestamp',
};
const DEMO_TTL = 24 * 60 * 60 * 1000; // 24 hours
const FRESH_LOAD_KEY = 'pageconsult_fresh_load_cleared';

// Clear demo state on fresh page load (before React hydrates)
// This ensures logged-out/anonymous users always see the default state
// BUT: Don't clear if we're in the middle of an auth flow (coming from signup)
function clearDemoStateOnFreshLoad(): void {
  if (typeof window === 'undefined') return;
  
  // Check if we've already cleared on this page load
  if (sessionStorage.getItem(FRESH_LOAD_KEY)) return;
  
  // DON'T clear if we're in an auth flow (has session data or consultationId in URL)
  const url = new URL(window.location.href);
  const hasConsultationId = url.searchParams.has('consultationId');
  const hasFromDemo = url.searchParams.get('from') === 'demo';
  const hasDemoIntelligence = sessionStorage.getItem('demoIntelligence');
  const hasSessionId = localStorage.getItem('pageconsult_session_id');
  
  if (hasConsultationId || hasFromDemo || hasDemoIntelligence || hasSessionId) {
    console.log('🛡️ [IntelligenceContext] Skipping demo state clear - auth flow detected');
    sessionStorage.setItem(FRESH_LOAD_KEY, 'true');
    return;
  }
  
  // Mark that we've cleared for this page load (done by useDemoState, but backup here)
  sessionStorage.setItem(FRESH_LOAD_KEY, 'true');
  
  // Clear ALL demo-related localStorage
  Object.values(STORAGE_KEYS).forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch {}
  });
  
  console.log('🧹 [IntelligenceContext] Demo state cleared on fresh page load');
}

// Execute immediately when module loads
clearDemoStateOnFreshLoad();
// ============================================
// TYPES
// ============================================

export interface ExtractedIntelligence {
  // Short values (for sidebar display - max 40 chars)
  industry: string | null;
  audience: string | null;
  valueProp: string | null;
  competitorDifferentiator: string | null;
  painPoints: string | null;
  buyerObjections: string | null;
  proofElements: string | null;
  socialProof: string | null; // Client names, testimonials, case studies
  
  // Target Aesthetic System
  targetMarket: string | null;    // Industry of their BUYERS (if different from provider)
  businessType: 'B2B' | 'B2C' | 'Both' | null;
  
  // Website & Brand data (extracted from URL detection)
  websiteUrl: string | null;
  companyName: string | null;
  logoUrl: string | null;
  colors: string[] | null;
  
  // Full values (for Hero/CTA generation - max 150 chars)
  industryFull: string | null;
  audienceFull: string | null;
  valuePropFull: string | null;
  competitorDifferentiatorFull: string | null;
  painPointsFull: string | null;
  buyerObjectionsFull: string | null;
  proofElementsFull: string | null;
  socialProofFull: string | null;
  // Summaries (for hover tooltips - max 300 chars)
  industrySummary: string | null;
  audienceSummary: string | null;
  valuePropSummary: string | null;
  edgeSummary: string | null;
  painSummary: string | null;
  objectionsSummary: string | null;
  proofSummary: string | null;
  socialProofSummary: string | null;
}

export interface MarketResearch {
  marketSize: string | null;
  buyerPersona: string | null;
  commonObjections: string[];
  industryInsights: string[];
  isLoading: boolean;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Track each user message with its corresponding extraction
export interface ConversationTurn {
  userMessage: string;
  extraction: {
    fields: Array<{
      label: string;
      value: string;
      color: 'purple' | 'cyan' | 'emerald' | 'amber';
    }>;
  };
  timestamp: Date;
}

// Business card data (captured from modal)
export interface BusinessCardData {
  companyName: string;
  website: string;
  email: string;
  submittedAt: string;
}

// Company research (from Perplexity)
export interface CompanyResearch {
  companyName: string;
  website: string | null;
  description: string | null;
  services: string[];
  targetMarket: string | null;
  founded: string | null;
  location: string | null;
  differentiators: string[];
  publicProof: string[];
  industryPosition: string | null;
  confidence: 'low' | 'medium' | 'high';
  researchedAt: string;
}

// Extracted brand assets (from website)
export interface ExtractedBrand {
  colors: {
    primary: string | null;
    secondary: string | null;
    accent: string | null;
    all: string[];
  };
  fonts: {
    heading: string | null;
    body: string | null;
  };
  extractedAt: string;
}

// Re-export ConsultationArtifacts for external use
export type { ConsultationArtifacts, CreativeArtifact };

export interface IntelligenceState {
  // Core intelligence
  extracted: ExtractedIntelligence;
  market: MarketResearch;
  readiness: number;
  
  // Consultation artifacts (headlines, CTAs, copy captured during conversation)
  artifacts: ConsultationArtifacts;
  
  // Dynamic industry detection
  industryDetection: IndustryDetection | null;
  
  // Target Aesthetic System
  aestheticMode: AestheticMode;
  
  // Pre-computed objections
  predictedObjections: PredictedObjection[];
  
  // Journey stage tracking
  journeyStage: 'entry' | 'engaged' | 'ready' | 'complete';
  
  // Conversation
  conversation: ConversationMessage[];
  conversationHistory: ConversationTurn[]; // Track user messages with extractions
  isProcessing: boolean;
  messageCount: number;
  
  // Session
  sessionId: string;
  rateLimited: boolean;
  
  // Conversational capture flow
  email: string | null;
  emailCaptured: boolean;
  emailOffered: boolean;      // Track if website ask was injected
  emailDismissed: boolean;    // Track if user dismissed without entering email
  showEmailGate: boolean;     // Legacy - kept for compat but never set to true
  
  // Website capture (conversational)
  websiteCaptured: boolean;
  websiteAskInjected: boolean;   // Track if website ask was injected
  emailAskInjected: boolean;     // Track if email ask was injected
  pendingWebsiteCapture: boolean; // Waiting for user to reply with URL
  pendingEmailCapture: boolean;   // Waiting for user to reply with email
  
  // Business card & company research (new)
  businessCard: BusinessCardData | null;
  companyResearch: CompanyResearch | null;
  extractedLogo: string | null;
  extractedBrand: ExtractedBrand | null;
  foundersPricingUnlocked: boolean;
  isResearchingCompany: boolean;
  
  // Thin input tracking for PROBE → GUIDE flow
  consecutiveThinInputs: number;  // Reset to 0 on adequate/rich input
}

export interface IntelligenceContextValue {
  state: IntelligenceState;
  processUserMessage: (message: string) => Promise<void>;
  resetIntelligence: () => void;
  getPrefillData: () => object;
  submitEmail: (email: string) => Promise<void>;
  submitBusinessCard: (data: { companyName: string; website: string; email: string }, onFollowUp?: (message: string) => void) => Promise<void>;
  dismissEmailGate: () => void;
  reopenEmailGate: () => void;
  confirmIndustrySelection: (variant: string) => void;
  updateExtracted: (updates: Partial<ExtractedIntelligence>) => void;
  
  // Computed visibility helpers
  shouldShowObjectionPanel: boolean;
  shouldShowResearchPanel: boolean;
  shouldShowContinueButton: boolean;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: IntelligenceState = {
  extracted: {
    // Short values (for sidebar display)
    industry: null,
    audience: null,
    valueProp: null,
    competitorDifferentiator: null,
    painPoints: null,
    buyerObjections: null,
    proofElements: null,
    socialProof: null,
    // Target Aesthetic System
    targetMarket: null,
    businessType: null,
    // Website & Brand data
    websiteUrl: null,
    companyName: null,
    logoUrl: null,
    colors: null,
    // Full values (for Hero/CTA generation)
    industryFull: null,
    audienceFull: null,
    valuePropFull: null,
    competitorDifferentiatorFull: null,
    painPointsFull: null,
    buyerObjectionsFull: null,
    proofElementsFull: null,
    socialProofFull: null,
    // Summaries
    industrySummary: null,
    audienceSummary: null,
    valuePropSummary: null,
    edgeSummary: null,
    painSummary: null,
    objectionsSummary: null,
    proofSummary: null,
    socialProofSummary: null,
  },
  market: {
    marketSize: null,
    buyerPersona: null,
    commonObjections: [],
    industryInsights: [],
    isLoading: false,
  },
  readiness: 0,
  artifacts: createEmptyArtifacts(),
  industryDetection: null,
  aestheticMode: {
    primary: 'default',
    secondary: null,
    blend: 'pure',
    rationale: 'Designed for your industry',
  },
  predictedObjections: [],
  journeyStage: 'entry',
  conversation: [],
  conversationHistory: [],
  isProcessing: false,
  messageCount: 0,
  sessionId: '',
  rateLimited: false,
  email: null,
  emailCaptured: false,
  emailOffered: false,
  emailDismissed: false,
  showEmailGate: false,
  websiteCaptured: false,
  websiteAskInjected: false,
  emailAskInjected: false,
  pendingWebsiteCapture: false,
  pendingEmailCapture: false,
  // Business card & company research
  businessCard: null,
  companyResearch: null,
  extractedLogo: null,
  extractedBrand: null,
  foundersPricingUnlocked: false,
  isResearchingCompany: false,
  consecutiveThinInputs: 0,
};

// ============================================
// CONTEXT
// ============================================

const IntelligenceContext = createContext<IntelligenceContextValue | null>(null);

export { IntelligenceContext };

// ============================================
// PROVIDER
// ============================================

// Safe localStorage helpers
function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('Failed to save to localStorage:', key, e);
  }
}

function safeClearDemoState(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch {}
  });
}

// Module-level guard: survives component remounts within the same page session
let _globalInitializedSession: string | null = null;
// Module-level session ID: ensures all mounts (including StrictMode re-mounts) use the same ID
let _globalSessionId: string | null = null;

export function IntelligenceProvider({ children }: { children: React.ReactNode }) {
  
  const navigate = useNavigate();
  
  // Initialize sessionId from URL or localStorage FIRST to prevent ID mismatch
  // Use module-level _globalSessionId so StrictMode re-mounts don't generate new IDs
  const [state, setState] = useState<IntelligenceState>(() => {
    // If we already have a global session ID from a previous mount, reuse it
    if (_globalSessionId) {
      console.log('🔑 [IntelligenceContext] Session ID reused from previous mount:', _globalSessionId);
      return {
        ...initialState,
        sessionId: _globalSessionId,
      };
    }
    
    // Check URL first (highest priority)
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionId = urlParams.get('session');
    
    // Check localStorage second
    const storedSessionId = safeGetItem('pageconsult_session_id') || safeGetItem(STORAGE_KEYS.sessionId);
    
    // Use URL > localStorage > generate new
    const sessionId = urlSessionId || storedSessionId || uuidv4();
    _globalSessionId = sessionId;
    
    console.log('🔑 [IntelligenceContext] Session ID initialized:', {
      source: urlSessionId ? 'URL' : storedSessionId ? 'localStorage' : 'generated',
      sessionId,
    });
    
    return {
      ...initialState,
      sessionId,
    };
  });
  
  const marketResearchFetched = useRef(false);
  const hasRestoredState = useRef(false);
  const sessionCreatedInDb = useRef(false);
  
  // Ref mirrors extracted.industry so submitBusinessCard can read it without stale closures
  const extractedIndustryRef = useRef<string | null>(null);
  const extractedAudienceRef = useRef<string | null>(null);
  
  // Refs to avoid stale closures in async processUserMessage
  const stateRef = useRef(state);
  
  // Debounce timer for session updates to prevent rate limiting (429 errors)
  const sessionUpdateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSessionUpdateRef = useRef<object | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    stateRef.current = state;
    extractedIndustryRef.current = state.extracted.industry;
    extractedAudienceRef.current = state.extracted.audience;
  }, [state]);

  // ----------------------------------------
  // Check for existing session in URL on mount
  // Guard: only fire once per session ID to prevent excessive re-initialization
  // Uses module-level variable so it survives component remounts within the same page session
  // ----------------------------------------
  const initializedSessionRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (hasRestoredState.current) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const existingSessionId = urlParams.get('session');
    const currentSessionId = existingSessionId || state.sessionId;
    
    // Guard: skip if we already initialized this exact session
    // Check both ref (same mount) and module-level guard (across remounts)
    if (initializedSessionRef.current === currentSessionId || _globalInitializedSession === currentSessionId) {
      console.log('[IntelligenceContext] Remount prevented — session already active:', currentSessionId);
      hasRestoredState.current = true;
      return;
    }
    initializedSessionRef.current = currentSessionId;
    _globalInitializedSession = currentSessionId;
    hasRestoredState.current = true;

    if (existingSessionId) {
      console.log('📂 [IntelligenceContext] Found session in URL:', existingSessionId);
      // Load existing session from database
      loadExistingSession(existingSessionId);
    } else {
      // Fresh start - clear old demo state
      safeClearDemoState();
      console.log('[IntelligenceContext] Starting fresh - cleared old demo state');
    }
  }, []);

  // ----------------------------------------
  // Load existing session from database
  // ----------------------------------------
  const loadExistingSession = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('demo_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error) {
        console.error('❌ [IntelligenceContext] Error loading session:', error);
        return;
      }

      if (data) {
        console.log('✅ [IntelligenceContext] Loaded existing session:', data);
        sessionCreatedInDb.current = true;
        
        const intel = data.extracted_intelligence as any;
        const messages = (data.messages as any[]) || [];
        
        setState(prev => ({
          ...prev,
          sessionId,
          extracted: intel ? {
            ...prev.extracted,
            industry: intel.industry || null,
            audience: intel.audience || null,
            valueProp: intel.valueProp || null,
            competitorDifferentiator: intel.competitorDifferentiator || null,
            painPoints: intel.painPoints || null,
            buyerObjections: intel.buyerObjections || null,
            proofElements: intel.proofElements || null,
            industrySummary: intel.industrySummary || null,
            audienceSummary: intel.audienceSummary || null,
            valuePropSummary: intel.valuePropSummary || null,
            edgeSummary: intel.edgeSummary || null,
            painSummary: intel.painSummary || null,
            // Website & Brand data
            websiteUrl: intel.websiteUrl || null,
            companyName: intel.companyName || null,
            logoUrl: intel.logoUrl || null,
            colors: intel.colors || null,
          } : prev.extracted,
          conversation: messages.map((m: any) => ({
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp || Date.now()),
          })),
          messageCount: data.message_count || messages.length,
          readiness: data.readiness || 0,
        }));
      } else {
        // Session ID in URL but not in database - use this ID for new session
        console.log('📝 [IntelligenceContext] Session ID not in DB, will create on first message:', sessionId);
        setState(prev => ({
          ...prev,
          sessionId,
        }));
      }
    } catch (err) {
      console.error('❌ [IntelligenceContext] Failed to load session:', err);
    }
  };

  // ----------------------------------------
  // Persist state to localStorage when it changes
  // ----------------------------------------
  useEffect(() => {
    // Only persist if we have meaningful state
    if (state.conversation.length > 0) {
      const conversationToSave = state.conversation.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      }));

      safeSetItem(STORAGE_KEYS.sessionId, state.sessionId);
      safeSetItem(STORAGE_KEYS.conversation, JSON.stringify(conversationToSave));
      safeSetItem(STORAGE_KEYS.extracted, JSON.stringify(state.extracted));
      safeSetItem(STORAGE_KEYS.timestamp, Date.now().toString());

      if (state.industryDetection) {
        safeSetItem(STORAGE_KEYS.industryDetection, JSON.stringify(state.industryDetection));
      }

      if (state.market.marketSize || state.market.buyerPersona) {
        safeSetItem(STORAGE_KEYS.market, JSON.stringify(state.market));
      }
    }
  }, [state.conversation, state.extracted, state.industryDetection, state.market, state.sessionId]);

  // ----------------------------------------
  // Load pre-computed objections when industry detected
  // ----------------------------------------
  useEffect(() => {
    if (state.extracted.industry) {
      // Use resolveIndustry() to get the canonical industry key, not the raw stated industry
      const resolution = resolveIndustry(state.extracted.industry);
      const resolvedKey = resolution.industry;
      console.log(`🎯 [Objections] Resolving industry: "${state.extracted.industry}" → "${resolvedKey}" (${resolution.source}, ${resolution.confidence})`);
      
      const objections = getPrecomputedObjections(
        resolvedKey,
        state.extracted.targetMarket
      );
      
      // Only update if we got new objections and they're different from current
      if (objections.length > 0 && objections !== state.predictedObjections) {
        setState(prev => ({
          ...prev,
          predictedObjections: objections,
        }));
        console.log('🎯 Loaded', objections.length, 'pre-computed objections for', resolvedKey, '(raw:', state.extracted.industry, ')');
      }
    }
  }, [state.extracted.industry, state.extracted.targetMarket]);

  // ----------------------------------------
  // Calculate journey stage
  // ----------------------------------------
  useEffect(() => {
    const calculateJourneyStage = (): IntelligenceState['journeyStage'] => {
      const hasIndustry = Boolean(state.extracted.industry);
      const hasAudience = Boolean(state.extracted.audience);
      const hasValueProp = Boolean(state.extracted.valueProp);
      const messageCount = state.messageCount;
      
      if (hasIndustry && hasAudience && hasValueProp) return 'ready';
      if (messageCount >= 2 && hasIndustry) return 'engaged';
      if (messageCount >= 1) return 'engaged';
      return 'entry';
    };
    
    const newStage = calculateJourneyStage();
    
    if (newStage !== state.journeyStage) {
      setState(prev => ({
        ...prev,
        journeyStage: newStage,
      }));
      console.log('🎬 Journey stage:', newStage);
    }
  }, [state.messageCount, state.extracted.industry, state.extracted.audience, state.extracted.valueProp, state.journeyStage]);

  // ----------------------------------------
  // Calculate readiness score
  // ----------------------------------------
  const calculateReadiness = useCallback((
    extracted: ExtractedIntelligence, 
    marketLoaded: boolean,
    emailCaptured: boolean
  ): number => {
    let score = 0;
    if (extracted.industry) score += 15;
    if (extracted.audience) score += 15;
    if (extracted.valueProp) score += 15;
    if (extracted.competitorDifferentiator) score += 10;
    if (extracted.painPoints) score += 10;
    if (extracted.buyerObjections) score += 10;
    if (extracted.proofElements) score += 10;
    if (emailCaptured) score += 5;
    if (marketLoaded) score += 10;
    return score;
  }, []);

  // ----------------------------------------
  // Calculate engagement score (for lead quality)
  // ----------------------------------------
  const calculateEngagementScore = useCallback((currentState: IntelligenceState): number => {
    let score = 0;
    
    // Message count (up to 40 points)
    score += Math.min(currentState.messageCount * 10, 40);
    
    // Intelligence extracted (up to 35 points - 5 per field)
    const extracted = currentState.extracted;
    if (extracted.industry) score += 5;
    if (extracted.audience) score += 5;
    if (extracted.valueProp) score += 5;
    if (extracted.competitorDifferentiator) score += 5;
    if (extracted.painPoints) score += 5;
    if (extracted.buyerObjections) score += 5;
    if (extracted.proofElements) score += 5;
    
    // Message quality - average length (up to 25 points)
    const userMessages = currentState.conversation.filter(m => m.role === 'user');
    if (userMessages.length > 0) {
      const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
      score += Math.min(Math.round(avgLength / 8), 25);
    }
    
    return Math.min(Math.round(score), 100);
  }, []);

  // ----------------------------------------
  // Fetch market research (only after email captured)
  // ----------------------------------------
  const fetchMarketResearch = useCallback(async (industry: string, audience: string | null) => {
    if (marketResearchFetched.current) {
      console.log('🔍 [Research] Market research already fetched, skipping');
      return;
    }
    marketResearchFetched.current = true;
    
    console.log('🔍 [Research] Starting market research for:', industry, '/ audience:', audience);

    setState(prev => ({
      ...prev,
      market: { ...prev.market, isLoading: true },
    }));

    try {
      const { data, error } = await supabase.functions.invoke('demo-market-research', {
        body: { industry, audience: audience || 'general audience' },
      });

      if (error) throw error;

      console.log('✅ [Research] Market research complete:', {
        hasMarketSize: !!data?.marketSize,
        insightCount: data?.industryInsights?.length || 0,
        objectionCount: data?.commonObjections?.length || 0,
      });

      setState(prev => ({
        ...prev,
        market: {
          marketSize: data?.marketSize || null,
          buyerPersona: data?.buyerPersona || null,
          commonObjections: data?.commonObjections || [],
          industryInsights: data?.industryInsights || [],
          isLoading: false,
        },
        readiness: calculateReadiness(prev.extracted, true, prev.emailCaptured),
      }));
    } catch (err) {
      console.error('❌ [Research] Market research failed:', err);
      setState(prev => ({
        ...prev,
        market: { ...prev.market, isLoading: false },
      }));
    }
  }, [calculateReadiness]);

  // ----------------------------------------
  // Submit email (triggers market research)
  // ----------------------------------------
  const submitEmail = useCallback(async (email: string) => {
    // Use stateRef to avoid stale closure
    const currentExtracted = stateRef.current.extracted;
    const currentSessionId = stateRef.current.sessionId;
    
    // Update state immediately
    setState(prev => ({
      ...prev,
      email,
      emailCaptured: true,
      showEmailGate: false,
      readiness: calculateReadiness(prev.extracted, false, true),
    }));

    // Save lead to database (fire and forget)
    try {
      const engagementScore = calculateEngagementScore(stateRef.current);
      await (supabase.from('demo_leads') as any).insert([{
        email,
        session_id: currentSessionId,
        extracted_intelligence: currentExtracted,
        engagement_score: engagementScore,
      }]);
      console.log('Lead saved:', email);
    } catch (err) {
      console.error('Failed to save lead:', err);
    }

    // Now fetch market research - use resolved industry key
    if (currentExtracted.industry) {
      const resolution = resolveIndustry(currentExtracted.industry);
      await fetchMarketResearch(resolution.industry, currentExtracted.audience);
    }
  }, [calculateReadiness, calculateEngagementScore, fetchMarketResearch]);

  // ----------------------------------------
  // Dismiss email gate (user clicks outside, X, ESC, or "Skip for now")
  // ----------------------------------------
  const dismissEmailGate = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showEmailGate: false,
      emailDismissed: true, // Mark as dismissed so we don't show again automatically
    }));
  }, []);

  // ----------------------------------------
  // Reopen email gate (user clicks "Unlock Market Research" button)
  // ----------------------------------------
  const reopenEmailGate = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showEmailGate: true,
    }));
  }, []);

  // ----------------------------------------
  // Create database session on first message
  // ----------------------------------------
  const createSessionInDatabase = useCallback(async (sessionId: string): Promise<boolean> => {
    if (sessionCreatedInDb.current) return true;
    
    console.log('📝 [IntelligenceContext] Creating database session:', sessionId);
    
    try {
      const { error } = await supabase
        .from('demo_sessions')
        .insert({
          session_id: sessionId,
          extracted_intelligence: {},
          readiness: 0,
          message_count: 0,
          messages: [],
        });

      // Helper to add session to URL and localStorage
      const addSessionToUrlAndStorage = () => {
        // Store to localStorage for persistence across page loads
        safeSetItem('pageconsult_session_id', sessionId);
        safeSetItem(STORAGE_KEYS.sessionId, sessionId);

        // Add session ID to URL immediately
        const url = new URL(window.location.href);
        if (!url.searchParams.has('session')) {
          url.searchParams.set('session', sessionId);
          window.history.replaceState({}, '', url.toString());
          console.log('🔗 [IntelligenceContext] Added session to URL:', sessionId);
        }
      };

      if (error) {
        // If it already exists (unique constraint), that's fine - STILL add to URL
        if (error.code === '23505') {
          console.log('✅ [IntelligenceContext] Session already exists, still adding to URL');
          sessionCreatedInDb.current = true;
          addSessionToUrlAndStorage();
          return true;
        }
        console.error('❌ [IntelligenceContext] Failed to create session:', error);
        return false;
      }

      console.log('✅ [IntelligenceContext] Database session created:', sessionId);
      sessionCreatedInDb.current = true;
      addSessionToUrlAndStorage();

      return true;
    } catch (err) {
      console.error('❌ [IntelligenceContext] Error creating session:', err);
      return false;
    }
  }, []);

  // ----------------------------------------
  // Helper to detect URLs in message
  // ----------------------------------------
  const extractUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)|([a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;
    const matches = text.match(urlRegex) || [];
    return matches.map(url => url.startsWith('http') ? url : `https://${url}`);
  };

  // ----------------------------------------
  // Process user message through the demo pipeline
  // ----------------------------------------
  const processUserMessage = useCallback(async (message: string) => {
    // Check for navigation intent first
    const navResult = handleChatNavigation(message, navigate);
    if (navResult.navigated && navResult.responseMessage) {
      // Add user message and navigation response to conversation
      const userMessage: ConversationMessage = {
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: navResult.responseMessage,
        timestamp: new Date(),
      };
      setState(prev => ({
        ...prev,
        conversation: [...prev.conversation, userMessage, assistantMessage],
        messageCount: prev.messageCount + 1,
      }));
      return;
    }
    
    // Rate limiting removed - gate at generation, not conversation

    // Conversational capture: detect email in reply if we're waiting for one
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const currentSt = stateRef.current;
    
    if (currentSt.pendingEmailCapture && emailRegex.test(message)) {
      const emailMatch = message.match(emailRegex);
      if (emailMatch) {
        const capturedEmail = emailMatch[0];
        console.log('📧 [Conversational] Email captured from reply:', capturedEmail);
        
        // Save email immediately
        setState(prev => ({
          ...prev,
          email: capturedEmail,
          emailCaptured: true,
          pendingEmailCapture: false,
        }));
        
        // Save lead to database
        const engagementScore = calculateEngagementScore(stateRef.current);
        (supabase.from('demo_leads') as any).insert([{
          email: capturedEmail,
          session_id: currentSt.sessionId,
          extracted_intelligence: currentSt.extracted as any,
          engagement_score: engagementScore,
        }]).then(() => {
          console.log('✅ [Conversational] Lead saved:', capturedEmail);
        });
        
        // Store for signup pre-fill
        sessionStorage.setItem('pageconsult_email', capturedEmail);
      }
    }
    
    // Conversational capture: detect URL in reply if we're waiting for one
    // This sets websiteCaptured=true so the general URL detection below won't duplicate
    if (currentSt.pendingWebsiteCapture && !currentSt.websiteCaptured) {
      const detectedUrlsForCapture = extractUrls(message);
      if (detectedUrlsForCapture.length > 0) {
        const capturedUrl = detectedUrlsForCapture[0];
        console.log('🌐 [Conversational] Website captured from reply:', capturedUrl);
        
        setState(prev => ({
          ...prev,
          websiteCaptured: true,
          pendingWebsiteCapture: false,
          isResearchingCompany: true,
          extracted: { ...prev.extracted, websiteUrl: capturedUrl },
        }));
        
        // Trigger website intelligence extraction silently
        supabase.functions.invoke('extract-website-intelligence', {
          body: { url: capturedUrl }
        }).then(({ data, error }) => {
          if (!error && data?.success !== false) {
            console.log('✅ [Conversational] Website intelligence extracted');
            // Persist designDNA to localStorage for Art Director
            if (data.designDNA) {
              try {
                const existing = JSON.parse(localStorage.getItem('pageconsult_extracted_intelligence') || '{}');
                existing.designDNA = data.designDNA;
                localStorage.setItem('pageconsult_extracted_intelligence', JSON.stringify(existing));
                console.log('🎨 [Conversational] Design DNA persisted to localStorage');
              } catch {}
            }
            setState(prev => ({
              ...prev,
              isResearchingCompany: false,
              extracted: {
                ...prev.extracted,
                companyName: data.companyName || prev.extracted.companyName,
                logoUrl: data.logoUrl || prev.extracted.logoUrl,
                colors: data.brandColors || prev.extracted.colors,
              },
              extractedLogo: data.logoUrl || prev.extractedLogo,
              companyResearch: {
                companyName: data.companyName || capturedUrl,
                website: capturedUrl,
                description: data.description || data.tagline || null,
                services: data.services || [],
                targetMarket: data.targetAudience || null,
                founded: null,
                location: null,
                differentiators: data.differentiators || [],
                publicProof: data.proofPoints || [],
                industryPosition: data.industryPosition || null,
                confidence: data.confidence || 'medium',
                researchedAt: new Date().toISOString(),
              },
            }));
          } else {
            console.warn('⚠️ [Conversational] Website extraction failed:', error);
            setState(prev => ({
              ...prev,
              isResearchingCompany: false,
              companyResearch: {
                companyName: capturedUrl,
                website: capturedUrl,
                description: null,
                services: [],
                targetMarket: null,
                founded: null,
                location: null,
                differentiators: [],
                publicProof: [],
                industryPosition: null,
                confidence: 'low',
                researchedAt: new Date().toISOString(),
                error: "Couldn't reach that URL — try entering your details manually",
              } as any,
            }));
          }
        }).catch(err => {
          console.error('❌ [Conversational] Website extraction error:', err);
          setState(prev => ({
            ...prev,
            isResearchingCompany: false,
            companyResearch: {
              companyName: capturedUrl,
              website: capturedUrl,
              description: null,
              services: [],
              targetMarket: null,
              founded: null,
              location: null,
              differentiators: [],
              publicProof: [],
              industryPosition: null,
              confidence: 'low',
              researchedAt: new Date().toISOString(),
              error: "Couldn't reach that URL — try entering your details manually",
            } as any,
          }));
        });
        
        sessionStorage.setItem('pageconsult_website', capturedUrl);
      }
    }

    // Capture sessionId before any awaits (use ref for freshest value)
    const currentSessionId = stateRef.current.sessionId;

    // Create database session on first message
    await createSessionInDatabase(currentSessionId);

    const userMessage: ConversationMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      conversation: [...prev.conversation, userMessage],
      isProcessing: true,
      messageCount: prev.messageCount + 1,
    }));

    try {
      // Step 0: Detect URLs in the message and extract website intelligence
      const detectedUrls = extractUrls(message);
      let websiteIntelligence: any = null;
      
      if (detectedUrls.length > 0 && !stateRef.current.websiteCaptured) {
        const detectedUrl = detectedUrls[0];
        console.log('🌐 [IntelligenceContext] URL detected, extracting website intelligence:', detectedUrl);
        
        // Set loading state and mark website as captured immediately
        setState(prev => ({
          ...prev,
          websiteCaptured: true,
          pendingWebsiteCapture: false,
          isResearchingCompany: true,
          extracted: { ...prev.extracted, websiteUrl: detectedUrl },
        }));
        sessionStorage.setItem('pageconsult_website', detectedUrl);
        
        try {
          const { data, error } = await supabase.functions.invoke('extract-website-intelligence', {
            body: { url: detectedUrl }
          });
          
          if (!error && data && data.success !== false) {
            websiteIntelligence = data;
            console.log('✅ [IntelligenceContext] Website intelligence extracted:', {
              companyName: data.companyName,
              industry: data.inferredIndustry,
              tagline: data.tagline,
              hasLogo: !!data.logoUrl,
              colorCount: data.brandColors?.length || 0,
            });
            
            // Populate companyResearch so the Research tab renders
            // Persist designDNA to localStorage for Art Director
            if (data.designDNA) {
              try {
                const existing = JSON.parse(localStorage.getItem('pageconsult_extracted_intelligence') || '{}');
                existing.designDNA = data.designDNA;
                localStorage.setItem('pageconsult_extracted_intelligence', JSON.stringify(existing));
                console.log('🎨 [IntelligenceContext] Design DNA persisted to localStorage');
              } catch {}
            }
            setState(prev => ({
              ...prev,
              isResearchingCompany: false,
              extracted: {
                ...prev.extracted,
                companyName: data.companyName || prev.extracted.companyName,
                logoUrl: data.logoUrl || prev.extracted.logoUrl,
                colors: data.brandColors || prev.extracted.colors,
              },
              extractedLogo: data.logoUrl || prev.extractedLogo,
              companyResearch: {
                companyName: data.companyName || detectedUrl,
                website: detectedUrl,
                description: data.description || data.tagline || null,
                services: data.services || [],
                targetMarket: data.targetAudience || null,
                founded: null,
                location: null,
                differentiators: data.differentiators || [],
                publicProof: data.proofPoints || [],
                industryPosition: data.industryPosition || null,
                confidence: data.confidence || 'medium',
                researchedAt: new Date().toISOString(),
              },
            }));
          } else {
            console.warn('⚠️ [IntelligenceContext] Website extraction failed:', error);
            // Set error state so Research tab shows failure message instead of empty
            setState(prev => ({
              ...prev,
              isResearchingCompany: false,
              companyResearch: {
                companyName: detectedUrl,
                website: detectedUrl,
                description: null,
                services: [],
                targetMarket: null,
                founded: null,
                location: null,
                differentiators: [],
                publicProof: [],
                industryPosition: null,
                confidence: 'low',
                researchedAt: new Date().toISOString(),
                error: "Couldn't reach that URL — try entering your details manually",
              } as any,
            }));
          }
        } catch (err) {
          console.error('❌ [IntelligenceContext] Website extraction error:', err);
          setState(prev => ({
            ...prev,
            isResearchingCompany: false,
            companyResearch: {
              companyName: detectedUrl,
              website: detectedUrl,
              description: null,
              services: [],
              targetMarket: null,
              founded: null,
              location: null,
              differentiators: [],
              publicProof: [],
              industryPosition: null,
              confidence: 'low',
              researchedAt: new Date().toISOString(),
              error: "Couldn't reach that URL — try entering your details manually",
            } as any,
          }));
        }
      } else if (detectedUrls.length > 0 && stateRef.current.websiteCaptured) {
        // URL already captured, just extract intelligence for the API call
        console.log('🌐 [IntelligenceContext] URL detected but website already captured, extracting for API only');
        try {
          const { data, error } = await supabase.functions.invoke('extract-website-intelligence', {
            body: { url: detectedUrls[0] }
          });
          if (!error && data) websiteIntelligence = data;
        } catch (err) {
          console.error('❌ [IntelligenceContext] Website extraction error:', err);
        }
      }

      // Step 1: Extract intelligence - use stateRef for fresh values after awaits
      const currentState = stateRef.current;
      const { data: extractedData, error: extractError } = await supabase.functions.invoke('demo-extract-intelligence', {
        body: {
          message,
          conversationHistory: currentState.conversation.map(m => ({ role: m.role, content: m.content })),
          existingIntelligence: currentState.extracted,
          websiteIntelligence, // Pass website data so extraction is accurate
        },
      });

      if (extractError) {
        console.error('Extraction error:', extractError);
      }

      // Debug: log what the extraction returned for Buyer Reality & Proof fields
      if (extractedData) {
        console.log('📊 [Extraction→Score] Buyer Reality fields:', {
          painPoints: extractedData.painPoints || null,
          buyerObjections: extractedData.buyerObjections || null,
        });
        console.log('📊 [Extraction→Score] Proof fields:', {
          proofElements: extractedData.proofElements || null,
          socialProof: extractedData.socialProof || null,
        });
      }

      // Compute merged extracted data for use in API calls
      // Use stateRef for fresh values after await boundaries
      const freshExtracted = stateRef.current.extracted;
      let mergedExtractedForApi = freshExtracted;
      
      if (!extractError && extractedData) {
        // Merge new extractions with fresh state (for API calls)
        mergedExtractedForApi = {
          // Short values (for sidebar display)
          industry: extractedData.industry || freshExtracted.industry,
          audience: extractedData.audience || freshExtracted.audience,
          valueProp: extractedData.valueProp || freshExtracted.valueProp,
          competitorDifferentiator: extractedData.competitorDifferentiator || freshExtracted.competitorDifferentiator,
          painPoints: extractedData.painPoints || freshExtracted.painPoints,
          buyerObjections: extractedData.buyerObjections || freshExtracted.buyerObjections,
          proofElements: extractedData.proofElements || freshExtracted.proofElements,
          socialProof: extractedData.socialProof || freshExtracted.socialProof,
          // Target Aesthetic System
          targetMarket: extractedData.targetMarket || freshExtracted.targetMarket,
          businessType: extractedData.businessType || freshExtracted.businessType,
          // Website & Brand data (from URL detection)
          websiteUrl: websiteIntelligence?.url || detectedUrls[0] || freshExtracted.websiteUrl,
          companyName: websiteIntelligence?.companyName || freshExtracted.companyName,
          logoUrl: websiteIntelligence?.logoUrl || freshExtracted.logoUrl,
          colors: websiteIntelligence?.brandColors || freshExtracted.colors,
          // Full values (for Hero/CTA generation)
          industryFull: extractedData.industryFull || freshExtracted.industryFull,
          audienceFull: extractedData.audienceFull || freshExtracted.audienceFull,
          valuePropFull: extractedData.valuePropFull || freshExtracted.valuePropFull,
          competitorDifferentiatorFull: extractedData.competitorDifferentiatorFull || freshExtracted.competitorDifferentiatorFull,
          painPointsFull: extractedData.painPointsFull || freshExtracted.painPointsFull,
          buyerObjectionsFull: extractedData.buyerObjectionsFull || freshExtracted.buyerObjectionsFull,
          proofElementsFull: extractedData.proofElementsFull || freshExtracted.proofElementsFull,
          socialProofFull: extractedData.socialProofFull || freshExtracted.socialProofFull,
          // Summaries
          industrySummary: extractedData.industrySummary || freshExtracted.industrySummary,
          audienceSummary: extractedData.audienceSummary || freshExtracted.audienceSummary,
          valuePropSummary: extractedData.valuePropSummary || freshExtracted.valuePropSummary,
          edgeSummary: extractedData.edgeSummary || freshExtracted.edgeSummary,
          painSummary: extractedData.painSummary || freshExtracted.painSummary,
          objectionsSummary: extractedData.objectionsSummary || freshExtracted.objectionsSummary,
          proofSummary: extractedData.proofSummary || freshExtracted.proofSummary,
          socialProofSummary: extractedData.socialProofSummary || freshExtracted.socialProofSummary,
        };

        // Re-run industry detection with all conversation messages
        // Use stateRef for fresh conversation after await
        const freshState = stateRef.current;
        const allUserMessages = [...freshState.conversation, userMessage]
          .filter(m => m.role === 'user')
          .map(m => m.content);
        
        // Get the stated industry from the extraction (what user explicitly said they are)
        const statedIndustry = extractedData?.industry || freshState.extracted.industry;
        
        const updatedIndustryDetection = detectIndustryFromConversation(
          allUserMessages,
          freshState.industryDetection,
          statedIndustry
        );

        // Use functional setState to ensure we merge with the LATEST state
        // This handles race conditions where state might have changed since we started
        setState(prev => {
          // Re-merge with prev.extracted to handle any concurrent updates
          const mergedExtracted: ExtractedIntelligence = {
            // Short values (for sidebar display)
            industry: extractedData.industry || prev.extracted.industry,
            audience: extractedData.audience || prev.extracted.audience,
            valueProp: extractedData.valueProp || prev.extracted.valueProp,
            competitorDifferentiator: extractedData.competitorDifferentiator || prev.extracted.competitorDifferentiator,
            painPoints: extractedData.painPoints || prev.extracted.painPoints,
            buyerObjections: extractedData.buyerObjections || prev.extracted.buyerObjections,
            proofElements: extractedData.proofElements || prev.extracted.proofElements,
            socialProof: extractedData.socialProof || prev.extracted.socialProof,
            // Target Aesthetic System
            targetMarket: extractedData.targetMarket || prev.extracted.targetMarket,
            businessType: extractedData.businessType || prev.extracted.businessType,
            // Website & Brand data (from URL detection)
            websiteUrl: websiteIntelligence?.url || detectedUrls[0] || prev.extracted.websiteUrl,
            companyName: websiteIntelligence?.companyName || prev.extracted.companyName,
            logoUrl: websiteIntelligence?.logoUrl || prev.extracted.logoUrl,
            colors: websiteIntelligence?.brandColors || prev.extracted.colors,
            // Full values (for Hero/CTA generation)
            industryFull: extractedData.industryFull || prev.extracted.industryFull,
            audienceFull: extractedData.audienceFull || prev.extracted.audienceFull,
            valuePropFull: extractedData.valuePropFull || prev.extracted.valuePropFull,
            competitorDifferentiatorFull: extractedData.competitorDifferentiatorFull || prev.extracted.competitorDifferentiatorFull,
            painPointsFull: extractedData.painPointsFull || prev.extracted.painPointsFull,
            buyerObjectionsFull: extractedData.buyerObjectionsFull || prev.extracted.buyerObjectionsFull,
            proofElementsFull: extractedData.proofElementsFull || prev.extracted.proofElementsFull,
            socialProofFull: extractedData.socialProofFull || prev.extracted.socialProofFull,
            // Summaries
            industrySummary: extractedData.industrySummary || prev.extracted.industrySummary,
            audienceSummary: extractedData.audienceSummary || prev.extracted.audienceSummary,
            valuePropSummary: extractedData.valuePropSummary || prev.extracted.valuePropSummary,
            edgeSummary: extractedData.edgeSummary || prev.extracted.edgeSummary,
            painSummary: extractedData.painSummary || prev.extracted.painSummary,
            objectionsSummary: extractedData.objectionsSummary || prev.extracted.objectionsSummary,
            proofSummary: extractedData.proofSummary || prev.extracted.proofSummary,
            socialProofSummary: extractedData.socialProofSummary || prev.extracted.socialProofSummary,
          };

          // Build extraction fields for this message (what was newly extracted)
          const colorCycle: Array<'purple' | 'cyan' | 'emerald' | 'amber'> = ['purple', 'cyan', 'emerald', 'amber'];
          let colorIndex = 0;
          const extractionFields: Array<{ label: string; value: string; color: 'purple' | 'cyan' | 'emerald' | 'amber' }> = [];
          
          if (extractedData.industry && extractedData.industry !== prev.extracted.industry) {
            extractionFields.push({ label: 'Industry', value: extractedData.industry, color: colorCycle[colorIndex++ % 4] });
          }
          if (extractedData.audience && extractedData.audience !== prev.extracted.audience) {
            extractionFields.push({ label: 'Audience', value: extractedData.audience, color: colorCycle[colorIndex++ % 4] });
          }
          if (extractedData.valueProp && extractedData.valueProp !== prev.extracted.valueProp) {
            extractionFields.push({ label: 'Value Prop', value: extractedData.valueProp, color: colorCycle[colorIndex++ % 4] });
          }
          if (extractedData.competitorDifferentiator && extractedData.competitorDifferentiator !== prev.extracted.competitorDifferentiator) {
            extractionFields.push({ label: 'Your Edge', value: extractedData.competitorDifferentiator, color: colorCycle[colorIndex++ % 4] });
          }
          if (extractedData.painPoints && extractedData.painPoints !== prev.extracted.painPoints) {
            extractionFields.push({ label: 'Pain Point', value: extractedData.painPoints, color: colorCycle[colorIndex++ % 4] });
          }
          if (extractedData.buyerObjections && extractedData.buyerObjections !== prev.extracted.buyerObjections) {
            extractionFields.push({ label: 'Buyer Objection', value: extractedData.buyerObjections, color: colorCycle[colorIndex++ % 4] });
          }
          if (extractedData.proofElements && extractedData.proofElements !== prev.extracted.proofElements) {
            extractionFields.push({ label: 'Proof Point', value: extractedData.proofElements, color: colorCycle[colorIndex++ % 4] });
          }

          // Build the conversation turn if we extracted meaningful fields
          const newTurn: ConversationTurn | null = extractionFields.length >= 2 ? {
            userMessage: message,
            extraction: { fields: extractionFields },
            timestamp: new Date(),
          } : null;

          // Sync industry from detection to extracted if not already set
          // BUT: don't overwrite if user manually confirmed an industry
          const isManuallyConfirmed = prev.industryDetection?.manuallyConfirmed || false;
          const industryFromDetection = updatedIndustryDetection?.variant && 
            updatedIndustryDetection.variant !== 'default' &&
            !mergedExtracted.industry &&
            !isManuallyConfirmed
              ? updatedIndustryDetection.variant.charAt(0).toUpperCase() + updatedIndustryDetection.variant.slice(1)
              : null;

          // Calculate aesthetic mode based on provider industry and target market
          // Also store the normalized industryCategory and confidence for SDI handoff
          const finalIndustryDetection = isManuallyConfirmed 
            ? prev.industryDetection 
            : updatedIndustryDetection;
          
          const industryCategory = finalIndustryDetection?.variant || null;
          const industryConfidence = finalIndustryDetection?.confidence || null;
          
          const finalExtracted = {
            ...mergedExtracted,
            ...(industryFromDetection ? { industry: industryFromDetection } : {}),
            // Store normalized industry category and confidence for SDI handoff
            industryCategory: industryCategory !== 'default' ? industryCategory : null,
            industryConfidence: industryConfidence,
          };
          
          const updatedAestheticMode = calculateAestheticMode(
            finalExtracted.industry,
            finalExtracted.targetMarket,
            finalExtracted.audience
          );

          // finalIndustryDetection was already calculated above for industryCategory/Confidence

          return {
            ...prev,
            extracted: finalExtracted,
            aestheticMode: updatedAestheticMode,
            readiness: calculateReadiness(finalExtracted, prev.market.marketSize !== null, prev.emailCaptured),
            conversationHistory: newTurn ? [...prev.conversationHistory, newTurn] : prev.conversationHistory,
            industryDetection: finalIndustryDetection,
          };
        });
      }

      // Step 2: Generate AI response - pass inputQuality and thin count for PROBE→GUIDE flow
      const inputQuality = extractedData?.inputQuality || 'adequate';
      console.log('📊 Input quality from extraction:', inputQuality);
      
      // Calculate new thin input count based on current input quality
      // Use stateRef for fresh values after await boundaries
      const latestState = stateRef.current;
      const newThinCount = inputQuality === 'thin' 
        ? latestState.consecutiveThinInputs + 1 
        : 0;
      
      console.log('🔄 Consecutive thin inputs:', latestState.consecutiveThinInputs, '→', newThinCount);
      
      // Determine if we should ask for website or email conversationally
      const shouldAskForWebsite = latestState.messageCount >= 3 && 
        !latestState.websiteCaptured && 
        !latestState.websiteAskInjected;
      const shouldAskForEmail = latestState.websiteCaptured && 
        !latestState.emailCaptured && 
        !latestState.emailAskInjected;

      const { data: responseData, error: responseError } = await supabase.functions.invoke('demo-generate-response', {
        body: {
          userMessage: message,
          extractedIntelligence: mergedExtractedForApi,
          marketResearch: latestState.emailCaptured ? latestState.market : null,
          conversationHistory: latestState.conversation.map(m => ({ role: m.role, content: m.content })),
          messageCount: latestState.messageCount,
          inputQuality,
          consecutiveThinInputs: newThinCount,
          websiteIntelligence,
          shouldAskForWebsite,
          shouldAskForEmail,
        },
      });

      let aiResponseContent = "I'd love to learn more about your business. What's the main outcome you deliver for clients?";
      let isResearchReveal = false;
      
      // Check if user is affirming the research offer (use stateRef for fresh conversation)
      const freshConversation = stateRef.current.conversation;
      const lastAIMessage = freshConversation.length > 0 
        ? freshConversation[freshConversation.length - 1]
        : null;
      const isAffirmativeToResearchOffer = (() => {
        if (!lastAIMessage || lastAIMessage.role !== 'assistant') return false;
        const affirmatives = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'please', 'show me', 'absolutely'];
        const researchOfferPhrases = ['want to see what i found', 'want to see what that looks like', 'deeper research'];
        const isAffirmative = affirmatives.some(a => message.toLowerCase().includes(a));
        const wasResearchOffer = researchOfferPhrases.some(p => lastAIMessage.content.toLowerCase().includes(p));
        return isAffirmative && wasResearchOffer;
      })();
      
      if (!responseError && responseData?.response) {
        aiResponseContent = responseData.response;
      }
      
      // If affirming research offer and email not captured, trigger the gate
      if (isAffirmativeToResearchOffer && !stateRef.current.emailCaptured) {
        isResearchReveal = true;
      }
      
      // Update thin count in state
      setState(prev => ({
        ...prev,
        consecutiveThinInputs: newThinCount,
      }));

      // Step 3: Conversational capture — inject website/email asks as chat messages
      const gateState = stateRef.current;

      const aiMessage: ConversationMessage = {
        role: 'assistant',
        content: aiResponseContent,
        timestamp: new Date(),
      };

      // Step 4: Artifact detection - check if AI generated creative options
      // and if the user is selecting one
      const aiArtifacts = extractArtifactsFromMessage(aiResponseContent);
      const userSelection = detectPositiveSelection(message);
      
      let artifactUpdates: Partial<ConsultationArtifacts> | null = null;
      
      // If AI generated headlines in this response, store them as alternatives
      if (aiArtifacts.headlines.length > 0) {
        logArtifactCapture('headline', 'detected', aiArtifacts.headlines.join(', '), 'AI generated options');
        artifactUpdates = {
          alternativeHeadlines: aiArtifacts.headlines.map(h => ({
            type: 'headline' as const,
            content: h,
            capturedAt: new Date().toISOString(),
          })),
        };
      }
      
      // If user positively selected something, find the previous AI message with options
      if (userSelection.isPositive && state.conversation.length > 0) {
        const lastAIMsg = state.conversation.filter(m => m.role === 'assistant').slice(-1)[0];
        if (lastAIMsg) {
          const prevArtifacts = extractArtifactsFromMessage(lastAIMsg.content);
          
          if (prevArtifacts.headlines.length > 0) {
            let selectedContent: string | null = null;
            if (userSelection.selectedOption !== null && prevArtifacts.headlines[userSelection.selectedOption - 1]) {
              selectedContent = prevArtifacts.headlines[userSelection.selectedOption - 1];
            } else {
              selectedContent = prevArtifacts.headlines[0];
            }
            if (selectedContent) {
              logArtifactCapture('headline', 'selected', selectedContent, userSelection.feedback || undefined);
              artifactUpdates = {
                ...artifactUpdates,
                selectedHeadline: {
                  type: 'headline',
                  content: selectedContent,
                  context: userSelection.feedback || 'User selected this option',
                  capturedAt: new Date().toISOString(),
                },
                alternativeHeadlines: prevArtifacts.headlines
                  .filter(h => h !== selectedContent)
                  .map(h => ({
                    type: 'headline' as const,
                    content: h,
                    capturedAt: new Date().toISOString(),
                  })),
                userFeedback: userSelection.feedback,
              };
            }
          }
          
          if (prevArtifacts.ctas.length > 0) {
            let selectedCTA: string | null = null;
            if (userSelection.selectedOption !== null && prevArtifacts.ctas[userSelection.selectedOption - 1]) {
              selectedCTA = prevArtifacts.ctas[userSelection.selectedOption - 1];
            } else if (prevArtifacts.ctas.length === 1) {
              selectedCTA = prevArtifacts.ctas[0];
            }
            if (selectedCTA) {
              logArtifactCapture('cta', 'selected', selectedCTA, userSelection.feedback || undefined);
              artifactUpdates = {
                ...artifactUpdates,
                selectedCTA: {
                  type: 'cta',
                  content: selectedCTA,
                  context: userSelection.feedback || 'User selected this CTA',
                  capturedAt: new Date().toISOString(),
                },
                alternativeCTAs: prevArtifacts.ctas
                  .filter(c => c !== selectedCTA)
                  .map(c => ({
                    type: 'cta' as const,
                    content: c,
                    capturedAt: new Date().toISOString(),
                  })),
              };
            }
          }
        }
      }

      setState(prev => ({
        ...prev,
        conversation: [...prev.conversation, aiMessage],
        isProcessing: false,
        ...(artifactUpdates ? {
          artifacts: {
            ...prev.artifacts,
            ...artifactUpdates,
          }
        } : {}),
      }));

      // Conversational capture: set state flags when AI was asked to weave in the ask
      if (shouldAskForWebsite) {
        setState(prev => ({
          ...prev,
          websiteAskInjected: true,
          emailOffered: true,
          pendingWebsiteCapture: true,
        }));
        console.log('🌐 [Conversational] Website ask flag sent to AI');
      }

      if (shouldAskForEmail) {
        setState(prev => ({
          ...prev,
          emailAskInjected: true,
          pendingEmailCapture: true,
        }));
        console.log('📧 [Conversational] Email ask flag sent to AI');
      }

      // Update session in database (debounced to prevent 429 rate limit errors)
      // Use stateRef for fresh values
      const dbState = stateRef.current;
      const currentReadiness = calculateReadiness(mergedExtractedForApi, dbState.market.marketSize !== null, dbState.emailCaptured);
      
      const sessionData = {
        sessionId: currentSessionId,
        messages: dbState.conversation.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp.toISOString(),
        })),
        extractedIntelligence: mergedExtractedForApi,
        marketResearch: dbState.market,
        messageCount: dbState.messageCount,
        readiness: currentReadiness,
      };
      
      // Store the pending update
      pendingSessionUpdateRef.current = sessionData;
      
      // Clear any existing timer
      if (sessionUpdateTimerRef.current) {
        clearTimeout(sessionUpdateTimerRef.current);
      }
      
      // Debounce: wait 1.5 seconds before sending to allow for rapid message exchanges
      sessionUpdateTimerRef.current = setTimeout(() => {
        if (pendingSessionUpdateRef.current) {
          supabase.functions.invoke('demo-update-session', {
            body: pendingSessionUpdateRef.current,
          }).catch(err => {
            // Only log non-rate-limit errors
            if (!err?.message?.includes('429')) {
              console.error('Session update error:', err);
            }
          });
          pendingSessionUpdateRef.current = null;
        }
      }, 1500);

    } catch (err) {
      console.error('Error processing message:', err);
      
      // Fallback response
      const fallbackMessage: ConversationMessage = {
        role: 'assistant',
        content: "I'd love to learn more about your business. What's the main outcome you deliver for clients?",
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        conversation: [...prev.conversation, fallbackMessage],
        isProcessing: false,
      }));
    }
  }, [calculateReadiness, navigate, createSessionInDatabase]);

  // ----------------------------------------
  // Reset intelligence state
  // ----------------------------------------
  const resetIntelligence = useCallback(() => {
    marketResearchFetched.current = false;
    sessionCreatedInDb.current = false; // Reset database session flag
    safeClearDemoState(); // Clear localStorage when resetting
    // Also remove session from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('session');
    window.history.replaceState({}, '', url.toString());
    setState({
      ...initialState,
      sessionId: uuidv4(),
    });
  }, []);

  // ----------------------------------------
  // Get prefill data for consultation
  // ----------------------------------------
  const getPrefillData = useCallback(() => {
    return {
      extracted: state.extracted,
      market: state.market,
      email: state.email,
      source: 'landing_demo',
      sessionId: state.sessionId,
      // Include artifacts for Strategy Brief generation
      artifacts: state.artifacts,
    };
  }, [state]);

  // ----------------------------------------
  // Manual industry selection (user correction)
  // ----------------------------------------
  const confirmIndustrySelection = useCallback((variantOrDisplayOption: string) => {
    // Handle both raw variants (e.g., 'consulting'), display options (e.g., 'Creative Agency'),
    // and subcategory labels (e.g., 'Design / Creative Agency')
    
    // First try to map as a display option
    let variant = displayOptionToVariant(variantOrDisplayOption);
    let displayName = variantOrDisplayOption;
    
    if (variant === 'default' && variantOrDisplayOption !== 'Other') {
      // Not a recognized display option - check if it's a raw variant
      const validVariants = ['saas', 'consulting', 'creative', 'healthcare', 'ecommerce', 'manufacturing', 'finance', 'legal', 'default'];
      if (validVariants.includes(variantOrDisplayOption)) {
        // It's a raw variant, convert to display name
        variant = variantOrDisplayOption as any;
        displayName = variantToDisplayName(variant);
      } else {
        // It's a custom label like "Design / Creative Agency" from dropdown subcategory
        // Try to infer variant from keywords
        const lowerInput = variantOrDisplayOption.toLowerCase();
        if (lowerInput.includes('creative') || lowerInput.includes('design') || lowerInput.includes('brand')) {
          variant = 'creative';
        } else if (lowerInput.includes('saas') || lowerInput.includes('software') || lowerInput.includes('tech')) {
          variant = 'saas';
        } else if (lowerInput.includes('consult') || lowerInput.includes('coach') || lowerInput.includes('train')) {
          variant = 'consulting';
        } else if (lowerInput.includes('health') || lowerInput.includes('medical')) {
          variant = 'healthcare';
        } else if (lowerInput.includes('ecommerce') || lowerInput.includes('commerce') || lowerInput.includes('retail')) {
          variant = 'ecommerce';
        } else if (lowerInput.includes('financ') || lowerInput.includes('bank') || lowerInput.includes('insur')) {
          variant = 'finance';
        } else if (lowerInput.includes('legal') || lowerInput.includes('law') || lowerInput.includes('attorney')) {
          variant = 'legal';
        } else if (lowerInput.includes('manufactur') || lowerInput.includes('industrial')) {
          variant = 'manufacturing';
        }
        // Keep the original displayName from the subcategory
      }
    }
    
    // Pass displayName to confirmIndustry so it's stored in the detection object
    const confirmed = confirmIndustry(variant, displayName);
    
    console.log('🎯 [Industry] User confirmed selection:', variantOrDisplayOption, '→ variant:', variant, '→ display:', displayName);
    
    // Always update to the new selected value
    // The confirmed detection has manuallyConfirmed: true, which prevents re-detection
    // displayName is now stored in the industryDetection object itself
    setState(prev => ({
      ...prev,
      industryDetection: confirmed,
      extracted: {
        ...prev.extracted,
        industry: displayName,
      },
    }));
  }, []);

  // ----------------------------------------
  // Context value
  // ----------------------------------------
  // ----------------------------------------
  // Computed visibility helpers
  // ----------------------------------------
  const shouldShowObjectionPanel = state.predictedObjections.length > 0 && 
                                   state.journeyStage !== 'entry';
  
  const shouldShowResearchPanel = state.market.marketSize !== null && 
                                  !state.market.isLoading;
  
  const shouldShowContinueButton = state.readiness >= 60;

  // ----------------------------------------
  // Submit business card (triggers company research)
  // ----------------------------------------
  const submitBusinessCard = useCallback(async (
    data: { companyName: string; website: string; email: string },
    onFollowUp?: (message: string) => void
  ) => {
    const { companyName, website, email } = data;
    
    // Store business card immediately
    setState(prev => ({
      ...prev,
      businessCard: {
        companyName,
        website,
        email,
        submittedAt: new Date().toISOString(),
      },
      email,
      emailCaptured: true,
      showEmailGate: false,
      isResearchingCompany: true,
    }));

    // Store in sessionStorage for signup pre-fill
    sessionStorage.setItem('pageconsult_email', email);
    sessionStorage.setItem('pageconsult_company', companyName);
    sessionStorage.setItem('pageconsult_website', website);
    sessionStorage.setItem('pageconsult_founders', 'true');

    try {
      // Run ALL parallel operations (including brand extraction)
      const [researchResult, logoResult, brandResult, loopsResult] = await Promise.allSettled([
        supabase.functions.invoke('company-research', {
          body: { companyName, website, industryContext: stateRef.current.extracted.industry },
        }),
        supabase.functions.invoke('extract-logo', {
          body: { url: website },
        }),
        // Brand assets extraction (colors, fonts) using existing extract-website-intelligence
        supabase.functions.invoke('extract-website-intelligence', {
          body: { url: website },
        }),
        supabase.functions.invoke('loops-contact', {
          body: {
            email,
            properties: {
              company: companyName,
              website,
              source: 'demo_business_card',
              discountTier: 'founders-50',
              foundersEligible: true,
            },
            tags: ['demo-engaged', 'founders-eligible'],
          },
        }),
      ]);

      // Process research results
      if (researchResult.status === 'fulfilled' && researchResult.value.data?.success) {
        const researchData = researchResult.value.data.data;
        
        setState(prev => {
          // Merge research findings into extracted intelligence for scoring
          const enrichedExtracted = { ...prev.extracted };
          
          // Enrich proof/credibility from research if not already captured
          if (!enrichedExtracted.proofElements && researchData.publicProof?.length > 0) {
            const proofText = researchData.publicProof.slice(0, 3).join('; ');
            enrichedExtracted.proofElements = proofText.slice(0, 200);
            enrichedExtracted.proofElementsFull = proofText.slice(0, 500);
            enrichedExtracted.proofSummary = `Research found: ${proofText}`;
            console.log('📊 [Research→Score] Enriched proofElements from research:', enrichedExtracted.proofElements);
          }
          
          // Enrich competitive edge from research if not already captured
          if (!enrichedExtracted.competitorDifferentiator && researchData.differentiators?.length > 0) {
            const edgeText = researchData.differentiators.slice(0, 2).join('; ');
            enrichedExtracted.competitorDifferentiator = edgeText.slice(0, 200);
            enrichedExtracted.competitorDifferentiatorFull = edgeText.slice(0, 500);
            enrichedExtracted.edgeSummary = `Research found: ${edgeText}`;
            console.log('📊 [Research→Score] Enriched edge from research:', enrichedExtracted.competitorDifferentiator);
          }
          
          // Enrich social proof from research if not already captured
          if (!enrichedExtracted.socialProof && researchData.industryPosition) {
            enrichedExtracted.socialProof = researchData.industryPosition.slice(0, 200);
            enrichedExtracted.socialProofSummary = researchData.industryPosition;
            console.log('📊 [Research→Score] Enriched socialProof from research:', enrichedExtracted.socialProof);
          }
          
          return {
            ...prev,
            extracted: enrichedExtracted,
            companyResearch: {
              ...researchData,
              researchedAt: new Date().toISOString(),
            },
          };
        });
        console.log('🔍 [Research] Company research complete:', researchData);
        
        // Generate and trigger assumptive follow-up message
        if (onFollowUp && researchData) {
          const followUpMessage = generateAssumptiveFollowUp(researchData, stateRef.current.extracted.industry);
          console.log('📝 [Research] Assumptive follow-up queued:', followUpMessage.substring(0, 60) + '...');
          onFollowUp(followUpMessage);
        }
      }

      // Process logo - ONLY if website intelligence didn't already extract one
      // Website intelligence uses smarter logo detection (header-first, partner filtering)
      if (logoResult.status === 'fulfilled' && logoResult.value.data?.success) {
        setState(prev => {
          // Guard: Don't overwrite existing logo from website intelligence
          if (prev.extractedLogo || prev.extracted.logoUrl) {
            console.log('🖼️ [Research] Logo skipped - website intelligence already has:', prev.extractedLogo || prev.extracted.logoUrl);
            return prev;
          }
          console.log('🖼️ [Research] Logo extracted (fallback):', logoResult.value.data.logoUrl);
          return {
            ...prev,
            extractedLogo: logoResult.value.data.logoUrl,
          };
        });
      }

      // Process brand assets (colors, fonts)
      if (brandResult.status === 'fulfilled' && brandResult.value.data?.success) {
        const brandData = brandResult.value.data.data;
        const extractedBrand: ExtractedBrand = {
          colors: {
            primary: brandData.brandColors?.[0] || null,
            secondary: brandData.brandColors?.[1] || null,
            accent: brandData.brandColors?.[2] || null,
            all: brandData.brandColors || [],
          },
          fonts: {
            heading: brandData.fonts?.heading || null,
            body: brandData.fonts?.body || null,
          },
          extractedAt: new Date().toISOString(),
        };
        
        setState(prev => ({
          ...prev,
          extractedBrand,
          // Also update logo if brand extraction found one and we didn't get it from extract-logo
          extractedLogo: prev.extractedLogo || brandData.logoUrl || null,
        }));
        
        console.log('🎨 [Research] Brand assets extracted:', {
          primaryColor: extractedBrand.colors.primary,
          font: extractedBrand.fonts.heading,
          colorCount: extractedBrand.colors.all.length,
        });
      }

      // Flag Founders pricing
      if (loopsResult.status === 'fulfilled') {
        setState(prev => ({
          ...prev,
          foundersPricingUnlocked: true,
        }));
        console.log('💰 [Research] Founders pricing unlocked');
      }

      // Fetch market research using refs (avoids stale closure)
      const industry = extractedIndustryRef.current;
      const audience = extractedAudienceRef.current;
      if (industry) {
        console.log('🔍 [Research] Triggering market research for:', companyName, '/', website, '/ industry:', industry);
        const resolution = resolveIndustry(industry);
        const resolvedKey = resolution.industry === 'default' ? 'creative' : resolution.industry;
        marketResearchFetched.current = false;
        fetchMarketResearch(resolvedKey, audience);
      } else {
        console.warn('⚠️ [Research] No industry extracted yet, using fallback "creative"');
        marketResearchFetched.current = false;
        fetchMarketResearch('creative', null);
      }

    } finally {
      setState(prev => ({ ...prev, isResearchingCompany: false }));
    }
  }, [fetchMarketResearch]);

  // Update extracted intelligence
  const updateExtracted = useCallback((updates: Partial<ExtractedIntelligence>) => {
    setState(prev => ({
      ...prev,
      extracted: { ...prev.extracted, ...updates },
    }));
  }, []);

  const contextValue: IntelligenceContextValue = useMemo(() => ({
    state,
    processUserMessage,
    resetIntelligence,
    getPrefillData,
    submitEmail,
    submitBusinessCard,
    dismissEmailGate,
    reopenEmailGate,
    confirmIndustrySelection,
    updateExtracted,
    // Computed visibility helpers
    shouldShowObjectionPanel,
    shouldShowResearchPanel,
    shouldShowContinueButton,
  }), [
    state,
    processUserMessage,
    resetIntelligence,
    getPrefillData,
    submitEmail,
    submitBusinessCard,
    dismissEmailGate,
    reopenEmailGate,
    confirmIndustrySelection,
    updateExtracted,
    shouldShowObjectionPanel,
    shouldShowResearchPanel,
    shouldShowContinueButton,
  ]);

  return (
    <IntelligenceContext.Provider value={contextValue}>
      {children}
    </IntelligenceContext.Provider>
  );
}

// ============================================
// HOOK - Provides access to intelligence context
// ============================================

export function useIntelligence() {
  const context = useContext(IntelligenceContext);
  if (!context) {
    throw new Error('useIntelligence must be used within an IntelligenceProvider');
  }
  return context;
}

export default IntelligenceContext;
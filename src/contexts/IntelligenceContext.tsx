import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { 
  detectIndustryFromConversation, 
  confirmIndustry, 
  type IndustryDetection 
} from '@/lib/industryDetection';

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
  socialProof: string | null; // NEW: client names, testimonials, case studies
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

export interface IntelligenceState {
  // Core intelligence
  extracted: ExtractedIntelligence;
  market: MarketResearch;
  readiness: number;
  
  // Dynamic industry detection
  industryDetection: IndustryDetection | null;
  
  // Conversation
  conversation: ConversationMessage[];
  conversationHistory: ConversationTurn[]; // Track user messages with extractions
  isProcessing: boolean;
  messageCount: number;
  
  // Session
  sessionId: string;
  rateLimited: boolean;
  
  // Email gate
  email: string | null;
  emailCaptured: boolean;
  emailOffered: boolean;      // Track if modal was shown
  emailDismissed: boolean;    // Track if user dismissed without entering email
  showEmailGate: boolean;
  
  // Thin input tracking for PROBE → GUIDE flow
  consecutiveThinInputs: number;  // Reset to 0 on adequate/rich input
}

export interface IntelligenceContextValue {
  state: IntelligenceState;
  processUserMessage: (message: string) => Promise<void>;
  resetIntelligence: () => void;
  getPrefillData: () => object;
  submitEmail: (email: string) => Promise<void>;
  dismissEmailGate: () => void;
  reopenEmailGate: () => void;
  confirmIndustrySelection: (variant: string) => void;
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
  industryDetection: null,
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

export function IntelligenceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<IntelligenceState>(() => ({
    ...initialState,
    sessionId: uuidv4(),
  }));
  
  const marketResearchFetched = useRef(false);
  const hasRestoredState = useRef(false);

  // ----------------------------------------
  // Restore state from localStorage on mount
  // ----------------------------------------
  useEffect(() => {
    if (hasRestoredState.current) return;
    hasRestoredState.current = true;

    try {
      const timestamp = safeGetItem(STORAGE_KEYS.timestamp);
      
      // Check if expired
      if (timestamp && Date.now() - parseInt(timestamp) > DEMO_TTL) {
        console.log('[IntelligenceContext] Demo state expired, clearing');
        safeClearDemoState();
        return;
      }

      const savedConversation = safeGetItem(STORAGE_KEYS.conversation);
      const savedExtracted = safeGetItem(STORAGE_KEYS.extracted);
      const savedSessionId = safeGetItem(STORAGE_KEYS.sessionId);
      const savedIndustry = safeGetItem(STORAGE_KEYS.industryDetection);
      const savedMarket = safeGetItem(STORAGE_KEYS.market);

      // Only restore if we have conversation AND extracted intelligence (complete state)
      if (savedConversation && savedExtracted && savedSessionId) {
        const conversation = JSON.parse(savedConversation);
        const extracted = JSON.parse(savedExtracted);
        const industryDetection = savedIndustry ? JSON.parse(savedIndustry) : null;
        const market = savedMarket ? JSON.parse(savedMarket) : initialState.market;

        // Convert timestamp strings back to Date objects
        const restoredConversation = conversation.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));

        console.log('[IntelligenceContext] Restored demo state:', {
          messages: restoredConversation.length,
          hasExtracted: !!extracted,
          hasIndustry: !!industryDetection,
        });

        setState(prev => ({
          ...prev,
          sessionId: savedSessionId,
          conversation: restoredConversation,
          extracted,
          industryDetection,
          market: { ...market, isLoading: false },
          messageCount: restoredConversation.filter((m: any) => m.role === 'user').length,
        }));
      } else if (savedConversation || savedExtracted) {
        // Incomplete state - clear everything
        console.log('[IntelligenceContext] Incomplete state found, clearing');
        safeClearDemoState();
      }
    } catch (e) {
      console.warn('[IntelligenceContext] Failed to restore state:', e);
      safeClearDemoState();
    }
  }, []);

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
    if (marketResearchFetched.current) return;
    marketResearchFetched.current = true;

    setState(prev => ({
      ...prev,
      market: { ...prev.market, isLoading: true },
    }));

    try {
      const { data, error } = await supabase.functions.invoke('demo-market-research', {
        body: { industry, audience: audience || 'general audience' },
      });

      if (error) throw error;

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
      console.error('Market research failed:', err);
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
    // Capture current state before updating
    const currentExtracted = state.extracted;
    const currentSessionId = state.sessionId;
    
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
      const engagementScore = calculateEngagementScore(state);
      // Cast to any to avoid type issues with the new table not in generated types yet
      await (supabase.from('demo_leads') as any).insert([{
        email,
        session_id: currentSessionId,
        extracted_intelligence: currentExtracted,
        engagement_score: engagementScore,
      }]);
      console.log('Lead saved:', email);
    } catch (err) {
      console.error('Failed to save lead:', err);
      // Don't block on this - UX is more important
    }

    // Now fetch market research
    if (currentExtracted.industry) {
      await fetchMarketResearch(currentExtracted.industry, currentExtracted.audience);
    }
  }, [state, calculateReadiness, calculateEngagementScore, fetchMarketResearch]);

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
  // Process user message through the demo pipeline
  // ----------------------------------------
  const processUserMessage = useCallback(async (message: string) => {
    // Rate limiting check
    if (state.messageCount >= 5) {
      setState(prev => ({ ...prev, rateLimited: true }));
      return;
    }

    // If email gate is showing, don't process more messages
    if (state.showEmailGate) {
      return;
    }

    const userMessage: ConversationMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    const newMessageCount = state.messageCount + 1;

    setState(prev => ({
      ...prev,
      conversation: [...prev.conversation, userMessage],
      isProcessing: true,
      messageCount: newMessageCount,
    }));

    try {
      // Step 1: Extract intelligence - now extracts ALL 7 fields with summaries
      console.log('=== CALLING EXTRACTION ===');
      console.log('📝 Message:', message);
      console.log('📊 Existing intelligence:', state.extracted);
      
      const { data: extractedData, error: extractError } = await supabase.functions.invoke('demo-extract-intelligence', {
        body: {
          message,
          conversationHistory: state.conversation.map(m => ({ role: m.role, content: m.content })),
          existingIntelligence: state.extracted,
        },
      });

      console.log('=== EXTRACTION RESPONSE ===');
      console.log('Error:', extractError);
      console.log('🎯 Raw extractedData:', extractedData);

      let newExtracted = state.extracted;
      let extractionFields: Array<{ label: string; value: string; color: 'purple' | 'cyan' | 'emerald' | 'amber' }> = [];
      
      if (!extractError && extractedData) {
        // Merge new extractions (don't overwrite with nulls)
        newExtracted = {
          // Short values (for sidebar display)
          industry: extractedData.industry || state.extracted.industry,
          audience: extractedData.audience || state.extracted.audience,
          valueProp: extractedData.valueProp || state.extracted.valueProp,
          competitorDifferentiator: extractedData.competitorDifferentiator || state.extracted.competitorDifferentiator,
          painPoints: extractedData.painPoints || state.extracted.painPoints,
          buyerObjections: extractedData.buyerObjections || state.extracted.buyerObjections,
          proofElements: extractedData.proofElements || state.extracted.proofElements,
          socialProof: extractedData.socialProof || state.extracted.socialProof,
          // Full values (for Hero/CTA generation)
          industryFull: extractedData.industryFull || state.extracted.industryFull,
          audienceFull: extractedData.audienceFull || state.extracted.audienceFull,
          valuePropFull: extractedData.valuePropFull || state.extracted.valuePropFull,
          competitorDifferentiatorFull: extractedData.competitorDifferentiatorFull || state.extracted.competitorDifferentiatorFull,
          painPointsFull: extractedData.painPointsFull || state.extracted.painPointsFull,
          buyerObjectionsFull: extractedData.buyerObjectionsFull || state.extracted.buyerObjectionsFull,
          proofElementsFull: extractedData.proofElementsFull || state.extracted.proofElementsFull,
          socialProofFull: extractedData.socialProofFull || state.extracted.socialProofFull,
          // Summaries
          industrySummary: extractedData.industrySummary || state.extracted.industrySummary,
          audienceSummary: extractedData.audienceSummary || state.extracted.audienceSummary,
          valuePropSummary: extractedData.valuePropSummary || state.extracted.valuePropSummary,
          edgeSummary: extractedData.edgeSummary || state.extracted.edgeSummary,
          painSummary: extractedData.painSummary || state.extracted.painSummary,
          objectionsSummary: extractedData.objectionsSummary || state.extracted.objectionsSummary,
          proofSummary: extractedData.proofSummary || state.extracted.proofSummary,
          socialProofSummary: extractedData.socialProofSummary || state.extracted.socialProofSummary,
        };

        console.log('=== MERGED INTELLIGENCE ===');
        console.log('✅ newExtracted:', newExtracted);

        // Build extraction fields for this message (what was newly extracted)
        const colorCycle: Array<'purple' | 'cyan' | 'emerald' | 'amber'> = ['purple', 'cyan', 'emerald', 'amber'];
        let colorIndex = 0;
        
        if (extractedData.industry && extractedData.industry !== state.extracted.industry) {
          extractionFields.push({ label: 'Industry', value: extractedData.industry, color: colorCycle[colorIndex++ % 4] });
        }
        if (extractedData.audience && extractedData.audience !== state.extracted.audience) {
          extractionFields.push({ label: 'Audience', value: extractedData.audience, color: colorCycle[colorIndex++ % 4] });
        }
        if (extractedData.valueProp && extractedData.valueProp !== state.extracted.valueProp) {
          extractionFields.push({ label: 'Value Prop', value: extractedData.valueProp, color: colorCycle[colorIndex++ % 4] });
        }
        if (extractedData.competitorDifferentiator && extractedData.competitorDifferentiator !== state.extracted.competitorDifferentiator) {
          extractionFields.push({ label: 'Your Edge', value: extractedData.competitorDifferentiator, color: colorCycle[colorIndex++ % 4] });
        }
        if (extractedData.painPoints && extractedData.painPoints !== state.extracted.painPoints) {
          extractionFields.push({ label: 'Pain Point', value: extractedData.painPoints, color: colorCycle[colorIndex++ % 4] });
        }
        if (extractedData.buyerObjections && extractedData.buyerObjections !== state.extracted.buyerObjections) {
          extractionFields.push({ label: 'Buyer Objection', value: extractedData.buyerObjections, color: colorCycle[colorIndex++ % 4] });
        }
        if (extractedData.proofElements && extractedData.proofElements !== state.extracted.proofElements) {
          extractionFields.push({ label: 'Proof Point', value: extractedData.proofElements, color: colorCycle[colorIndex++ % 4] });
        }

        // Build the conversation turn if we extracted meaningful fields
        const newTurn: ConversationTurn | null = extractionFields.length >= 2 ? {
          userMessage: message,
          extraction: { fields: extractionFields },
          timestamp: new Date(),
        } : null;

        // Re-run industry detection with all conversation messages
        const allUserMessages = [...state.conversation, userMessage]
          .filter(m => m.role === 'user')
          .map(m => m.content);
        const updatedIndustryDetection = detectIndustryFromConversation(
          allUserMessages,
          state.industryDetection
        );

        setState(prev => ({
          ...prev,
          extracted: newExtracted,
          readiness: calculateReadiness(newExtracted, prev.market.marketSize !== null, prev.emailCaptured),
          conversationHistory: newTurn ? [...prev.conversationHistory, newTurn] : prev.conversationHistory,
          industryDetection: updatedIndustryDetection,
        }));
      }

      // Step 2: Generate AI response - pass inputQuality and thin count for PROBE→GUIDE flow
      const inputQuality = extractedData?.inputQuality || 'adequate';
      console.log('📊 Input quality from extraction:', inputQuality);
      
      // Calculate new thin input count based on current input quality
      // If thin: increment count. If adequate/rich: reset to 0
      const newThinCount = inputQuality === 'thin' 
        ? state.consecutiveThinInputs + 1 
        : 0;
      
      console.log('🔄 Consecutive thin inputs:', state.consecutiveThinInputs, '→', newThinCount);
      
      const { data: responseData, error: responseError } = await supabase.functions.invoke('demo-generate-response', {
        body: {
          userMessage: message,
          extractedIntelligence: newExtracted,
          marketResearch: state.emailCaptured ? state.market : null, // Only include if email captured
          conversationHistory: [...state.conversation, userMessage].map(m => ({ role: m.role, content: m.content })),
          messageCount: newMessageCount,
          inputQuality, // Pass the input quality for smarter response handling
          consecutiveThinInputs: newThinCount, // Pass the explicit count for PROBE→GUIDE logic
        },
      });

      let aiResponseContent = "I'd love to learn more about your business. What's the main outcome you deliver for clients?";
      if (!responseError && responseData?.response) {
        aiResponseContent = responseData.response;
      }
      
      // Update thin count in state
      setState(prev => ({
        ...prev,
        consecutiveThinInputs: newThinCount,
      }));

      // Step 3: Check if we should show email gate
      // Show gate after message 2 if we have industry detected
      // Only show if: industry detected, not captured yet, and not already dismissed
      const shouldShowGate = newMessageCount >= 2 && 
                             newExtracted.industry && 
                             !state.emailCaptured &&
                             !state.emailDismissed &&
                             !state.emailOffered;

      const aiMessage: ConversationMessage = {
        role: 'assistant',
        content: aiResponseContent,
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        conversation: [...prev.conversation, aiMessage],
        isProcessing: false,
      }));

      // Show email gate with 2-second delay so user can read the response first
      if (shouldShowGate) {
        setTimeout(() => {
          setState(prev => ({ ...prev, showEmailGate: true, emailOffered: true }));
        }, 2000);
      }

      // Update session in database (fire and forget)
      supabase.functions.invoke('demo-update-session', {
        body: {
          sessionId: state.sessionId,
          messages: [...state.conversation, userMessage, aiMessage].map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp.toISOString(),
          })),
          extractedIntelligence: newExtracted,
          marketResearch: state.market,
          messageCount: newMessageCount,
        },
      }).catch(console.error);

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
  }, [state, calculateReadiness]);

  // ----------------------------------------
  // Reset intelligence state
  // ----------------------------------------
  const resetIntelligence = useCallback(() => {
    marketResearchFetched.current = false;
    safeClearDemoState(); // Clear localStorage when resetting
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
    };
  }, [state]);

  // ----------------------------------------
  // Manual industry selection (user correction)
  // ----------------------------------------
  const confirmIndustrySelection = useCallback((variant: string) => {
    const confirmed = confirmIndustry(variant as any);
    setState(prev => ({
      ...prev,
      industryDetection: confirmed,
    }));
  }, []);

  // ----------------------------------------
  // Context value
  // ----------------------------------------
  const contextValue: IntelligenceContextValue = {
    state,
    processUserMessage,
    resetIntelligence,
    getPrefillData,
    submitEmail,
    dismissEmailGate,
    reopenEmailGate,
    confirmIndustrySelection,
  };

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
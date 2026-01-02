import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// TYPES
// ============================================

export interface ExtractedIntelligence {
  // Short values (for display)
  industry: string | null;
  audience: string | null;
  valueProp: string | null;
  competitorDifferentiator: string | null;
  painPoints: string | null;
  buyerObjections: string | null;
  proofElements: string | null;
  // Summaries (for hover tooltips)
  industrySummary: string | null;
  audienceSummary: string | null;
  valuePropSummary: string | null;
  edgeSummary: string | null;
  painSummary: string | null;
  objectionsSummary: string | null;
  proofSummary: string | null;
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

export interface IntelligenceState {
  // Core intelligence
  extracted: ExtractedIntelligence;
  market: MarketResearch;
  readiness: number;
  
  // Conversation
  conversation: ConversationMessage[];
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
}

export interface IntelligenceContextValue {
  state: IntelligenceState;
  processUserMessage: (message: string) => Promise<void>;
  resetIntelligence: () => void;
  getPrefillData: () => object;
  submitEmail: (email: string) => Promise<void>;
  dismissEmailGate: () => void;
  reopenEmailGate: () => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: IntelligenceState = {
  extracted: {
    industry: null,
    audience: null,
    valueProp: null,
    competitorDifferentiator: null,
    painPoints: null,
    buyerObjections: null,
    proofElements: null,
    industrySummary: null,
    audienceSummary: null,
    valuePropSummary: null,
    edgeSummary: null,
    painSummary: null,
    objectionsSummary: null,
    proofSummary: null,
  },
  market: {
    marketSize: null,
    buyerPersona: null,
    commonObjections: [],
    industryInsights: [],
    isLoading: false,
  },
  readiness: 0,
  conversation: [],
  isProcessing: false,
  messageCount: 0,
  sessionId: '',
  rateLimited: false,
  email: null,
  emailCaptured: false,
  emailOffered: false,
  emailDismissed: false,
  showEmailGate: false,
};

// ============================================
// CONTEXT
// ============================================

const IntelligenceContext = createContext<IntelligenceContextValue | null>(null);

export { IntelligenceContext };

// ============================================
// PROVIDER
// ============================================

export function IntelligenceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<IntelligenceState>(() => ({
    ...initialState,
    sessionId: uuidv4(),
  }));
  
  const marketResearchFetched = useRef(false);

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
      if (!extractError && extractedData) {
        // Merge new extractions (don't overwrite with nulls)
        newExtracted = {
          // Short values
          industry: extractedData.industry || state.extracted.industry,
          audience: extractedData.audience || state.extracted.audience,
          valueProp: extractedData.valueProp || state.extracted.valueProp,
          competitorDifferentiator: extractedData.competitorDifferentiator || state.extracted.competitorDifferentiator,
          painPoints: extractedData.painPoints || state.extracted.painPoints,
          buyerObjections: extractedData.buyerObjections || state.extracted.buyerObjections,
          proofElements: extractedData.proofElements || state.extracted.proofElements,
          // Summaries
          industrySummary: extractedData.industrySummary || state.extracted.industrySummary,
          audienceSummary: extractedData.audienceSummary || state.extracted.audienceSummary,
          valuePropSummary: extractedData.valuePropSummary || state.extracted.valuePropSummary,
          edgeSummary: extractedData.edgeSummary || state.extracted.edgeSummary,
          painSummary: extractedData.painSummary || state.extracted.painSummary,
          objectionsSummary: extractedData.objectionsSummary || state.extracted.objectionsSummary,
          proofSummary: extractedData.proofSummary || state.extracted.proofSummary,
        };

        console.log('=== MERGED INTELLIGENCE ===');
        console.log('✅ newExtracted:', newExtracted);

        setState(prev => ({
          ...prev,
          extracted: newExtracted,
          readiness: calculateReadiness(newExtracted, prev.market.marketSize !== null, prev.emailCaptured),
        }));
      }

      // Step 2: Generate AI response
      const { data: responseData, error: responseError } = await supabase.functions.invoke('demo-generate-response', {
        body: {
          userMessage: message,
          extractedIntelligence: newExtracted,
          marketResearch: state.emailCaptured ? state.market : null, // Only include if email captured
          conversationHistory: [...state.conversation, userMessage].map(m => ({ role: m.role, content: m.content })),
          messageCount: newMessageCount,
        },
      });

      let aiResponseContent = "I'd love to learn more about your business. What's the main outcome you deliver for clients?";
      if (!responseError && responseData?.response) {
        aiResponseContent = responseData.response;
      }

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
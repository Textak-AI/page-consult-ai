import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Types
interface ExtractedIntelligence {
  industry: string | null;
  audience: string | null;
  valueProp: string | null;
  businessType: 'B2B' | 'B2C' | 'Both' | null;
}

interface MarketResearch {
  marketSize: string | null;
  buyerPersona: string | null;
  commonObjections: string[];
  industryInsights: string[];
  isLoading: boolean;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface IntelligenceState {
  extracted: ExtractedIntelligence;
  market: MarketResearch;
  readiness: number;
  conversation: ConversationMessage[];
  isProcessing: boolean;
  messageCount: number;
  sessionId: string;
  rateLimited: boolean;
}

interface IntelligenceContextValue {
  state: IntelligenceState;
  processUserMessage: (message: string) => Promise<void>;
  resetIntelligence: () => void;
  getPrefillData: () => object;
}

const initialState: IntelligenceState = {
  extracted: {
    industry: null,
    audience: null,
    valueProp: null,
    businessType: null,
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
};

const IntelligenceContext = createContext<IntelligenceContextValue | null>(null);

export function IntelligenceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<IntelligenceState>(() => ({
    ...initialState,
    sessionId: uuidv4(),
  }));
  
  const marketResearchFetched = useRef(false);

  // Calculate readiness score
  const calculateReadiness = useCallback((extracted: ExtractedIntelligence, marketLoaded: boolean): number => {
    let score = 0;
    if (extracted.industry) score += 30;
    if (extracted.audience) score += 30;
    if (extracted.valueProp) score += 25;
    if (marketLoaded) score += 15;
    return score;
  }, []);

  // Fetch market research (non-blocking)
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
        readiness: calculateReadiness(prev.extracted, true),
      }));
    } catch (err) {
      console.error('Market research failed:', err);
      setState(prev => ({
        ...prev,
        market: { ...prev.market, isLoading: false },
      }));
    }
  }, [calculateReadiness]);

  // Process user message through the demo pipeline
  const processUserMessage = useCallback(async (message: string) => {
    // Rate limiting check
    if (state.messageCount >= 5) {
      setState(prev => ({ ...prev, rateLimited: true }));
      return;
    }

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
      // Step 1: Extract intelligence
      const { data: extractedData, error: extractError } = await supabase.functions.invoke('demo-extract-intelligence', {
        body: {
          message,
          conversationHistory: state.conversation.map(m => ({ role: m.role, content: m.content })),
          existingIntelligence: state.extracted,
        },
      });

      let newExtracted = state.extracted;
      if (!extractError && extractedData) {
        // Merge new extractions (don't overwrite with nulls)
        newExtracted = {
          industry: extractedData.industry || state.extracted.industry,
          audience: extractedData.audience || state.extracted.audience,
          valueProp: extractedData.valueProp || state.extracted.valueProp,
          businessType: extractedData.businessType || state.extracted.businessType,
        };

        setState(prev => ({
          ...prev,
          extracted: newExtracted,
          readiness: calculateReadiness(newExtracted, prev.market.marketSize !== null),
        }));

        // Trigger market research if industry detected (non-blocking)
        if (newExtracted.industry && !marketResearchFetched.current) {
          fetchMarketResearch(newExtracted.industry, newExtracted.audience);
        }
      }

      // Step 2: Generate AI response
      const { data: responseData, error: responseError } = await supabase.functions.invoke('demo-generate-response', {
        body: {
          userMessage: message,
          extractedIntelligence: newExtracted,
          marketResearch: state.market,
          conversationHistory: [...state.conversation, userMessage].map(m => ({ role: m.role, content: m.content })),
        },
      });

      let aiResponseContent = "I'd love to learn more about your business. What's the main outcome you deliver for clients?";
      if (!responseError && responseData?.response) {
        aiResponseContent = responseData.response;
      }

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
          messageCount: state.messageCount + 1,
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
  }, [state, calculateReadiness, fetchMarketResearch]);

  // Reset intelligence state
  const resetIntelligence = useCallback(() => {
    marketResearchFetched.current = false;
    setState({
      ...initialState,
      sessionId: uuidv4(),
    });
  }, []);

  // Get prefill data for consultation
  const getPrefillData = useCallback(() => {
    return {
      extracted: state.extracted,
      market: state.market,
      source: 'landing_demo',
      sessionId: state.sessionId,
    };
  }, [state]);

  return (
    <IntelligenceContext.Provider value={{ state, processUserMessage, resetIntelligence, getPrefillData }}>
      {children}
    </IntelligenceContext.Provider>
  );
}

export function useIntelligence() {
  const context = useContext(IntelligenceContext);
  if (!context) {
    throw new Error('useIntelligence must be used within an IntelligenceProvider');
  }
  return context;
}

export default IntelligenceContext;

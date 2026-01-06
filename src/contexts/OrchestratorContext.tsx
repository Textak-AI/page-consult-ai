import React, { createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { useOrchestrator } from '@/hooks/useOrchestrator';
import type { OrchestratorOutput, OrchestratorInput } from '@/types/orchestrator';

interface OrchestratorContextValue {
  // State
  phase: string;
  output: OrchestratorOutput | null;
  error: string | null;
  isProcessing: boolean;
  
  // Actions
  analyze: (input: Omit<OrchestratorInput, 'phase'>) => Promise<OrchestratorOutput | null>;
  reset: () => void;
  
  // Convenience getters
  predictedObjections: OrchestratorOutput['predictedObjections'];
  competitiveInsights: OrchestratorOutput['competitiveInsights'];
  buyerPsychology: OrchestratorOutput['buyerPsychology'];
  ahaInsights: OrchestratorOutput['ahaInsights'];
  strategicRecommendations: OrchestratorOutput['strategicRecommendations'];
  briefGuidance: OrchestratorOutput['briefGuidance'];
}

const OrchestratorContext = createContext<OrchestratorContextValue | null>(null);

interface OrchestratorProviderProps {
  children: React.ReactNode;
  // Optional: auto-trigger when these values become available
  autoTrigger?: {
    industry: string | null;
    targetMarket: string | null;
    audience: string | null;
    valueProp: string | null;
  };
}

export function OrchestratorProvider({ children, autoTrigger }: OrchestratorProviderProps) {
  const { state, runOrchestrator, reset, isProcessing } = useOrchestrator();
  const hasAutoTriggered = useRef(false);
  
  const analyze = useCallback(async (input: Omit<OrchestratorInput, 'phase'>) => {
    return runOrchestrator(input);
  }, [runOrchestrator]);

  // Auto-trigger when industry + audience detected (if autoTrigger prop is provided)
  useEffect(() => {
    if (!autoTrigger) return;
    
    const hasEnoughData = autoTrigger.industry && autoTrigger.audience;
    const notAlreadyRun = !state.output && !hasAutoTriggered.current;
    const notProcessing = !isProcessing;
    
    if (hasEnoughData && notAlreadyRun && notProcessing) {
      console.log('🧠 [OrchestratorContext] Auto-triggering Strategic Orchestrator');
      hasAutoTriggered.current = true;
      runOrchestrator({
        consultationData: {
          industry: autoTrigger.industry,
          targetMarket: autoTrigger.targetMarket,
          audience: autoTrigger.audience,
          valueProp: autoTrigger.valueProp,
        }
      });
    }
  }, [autoTrigger, state.output, isProcessing, runOrchestrator]);

  const value: OrchestratorContextValue = {
    phase: state.phase,
    output: state.output,
    error: state.error,
    isProcessing,
    analyze,
    reset,
    
    // Convenience getters
    predictedObjections: state.output?.predictedObjections,
    competitiveInsights: state.output?.competitiveInsights,
    buyerPsychology: state.output?.buyerPsychology,
    ahaInsights: state.output?.ahaInsights,
    strategicRecommendations: state.output?.strategicRecommendations,
    briefGuidance: state.output?.briefGuidance,
  };

  return (
    <OrchestratorContext.Provider value={value}>
      {children}
    </OrchestratorContext.Provider>
  );
}

export function useOrchestratorContext() {
  const context = useContext(OrchestratorContext);
  if (!context) {
    throw new Error('useOrchestratorContext must be used within OrchestratorProvider');
  }
  return context;
}

// Safe hook that returns null if not in provider
export function useOrchestratorContextSafe() {
  return useContext(OrchestratorContext);
}

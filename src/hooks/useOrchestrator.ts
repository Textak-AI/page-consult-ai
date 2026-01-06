import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  OrchestratorInput, 
  OrchestratorOutput, 
  ResearchQuery,
  ResearchResult 
} from '@/types/orchestrator';

interface OrchestratorState {
  phase: 'idle' | 'analyzing' | 'researching' | 'synthesizing' | 'complete' | 'error';
  output: OrchestratorOutput | null;
  error: string | null;
}

export function useOrchestrator() {
  const [state, setState] = useState<OrchestratorState>({
    phase: 'idle',
    output: null,
    error: null
  });
  
  const hasRun = useRef(false);

  const runOrchestrator = useCallback(async (input: Omit<OrchestratorInput, 'phase'>) => {
    // Prevent duplicate runs
    if (hasRun.current) {
      console.log('🧠 [Orchestrator] Already run, skipping');
      return state.output;
    }
    hasRun.current = true;
    
    setState({ phase: 'analyzing', output: null, error: null });
    
    try {
      // PHASE 1: Initial analysis - get research queries
      console.log('🧠 [Orchestrator] Phase 1: Initial analysis');
      const { data: initialData, error: initialError } = await supabase.functions.invoke(
        'strategic-orchestrator',
        { body: { ...input, phase: 'initial' } }
      );
      
      if (initialError) throw initialError;
      
      const researchQueries: ResearchQuery[] = initialData.researchQueries || [];
      
      if (researchQueries.length === 0) {
        // No research needed, go straight to synthesis
        console.log('🧠 [Orchestrator] No research queries, completing with initial data');
        setState({ phase: 'complete', output: initialData, error: null });
        return initialData;
      }
      
      // PHASE 2: Execute research queries
      setState(prev => ({ ...prev, phase: 'researching' }));
      console.log('🧠 [Orchestrator] Phase 2: Executing', researchQueries.length, 'research queries');
      
      const { data: researchData, error: researchError } = await supabase.functions.invoke(
        'orchestrator-research',
        { body: { queries: researchQueries } }
      );
      
      if (researchError) throw researchError;
      
      const researchResults: ResearchResult[] = researchData.results || [];
      
      // PHASE 3: Synthesis
      setState(prev => ({ ...prev, phase: 'synthesizing' }));
      console.log('🧠 [Orchestrator] Phase 3: Synthesizing insights');
      
      const { data: synthesisData, error: synthesisError } = await supabase.functions.invoke(
        'strategic-orchestrator',
        { 
          body: { 
            ...input, 
            marketResearch: researchResults,
            phase: 'synthesis' 
          } 
        }
      );
      
      if (synthesisError) throw synthesisError;
      
      console.log('🧠 [Orchestrator] Complete:', synthesisData);
      setState({ phase: 'complete', output: synthesisData, error: null });
      return synthesisData;
      
    } catch (error) {
      console.error('🧠 [Orchestrator] Error:', error);
      hasRun.current = false; // Allow retry on error
      setState({ 
        phase: 'error', 
        output: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
  }, [state.output]);

  const reset = useCallback(() => {
    hasRun.current = false;
    setState({ phase: 'idle', output: null, error: null });
  }, []);

  return {
    state,
    runOrchestrator,
    reset,
    isProcessing: ['analyzing', 'researching', 'synthesizing'].includes(state.phase)
  };
}

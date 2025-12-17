/**
 * Hook to manage the intelligence gathering pipeline
 */

import { useState, useCallback } from 'react';
import { 
  runIntelligencePipeline, 
  getExistingResearch,
  type PersonaIntelligence,
  type GeneratedContent,
  type ConsultationData
} from '@/services/intelligence';

type IntelligenceStage = 'idle' | 'researching' | 'synthesizing' | 'complete' | 'error';

interface UseIntelligenceOptions {
  consultationId: string | null;
  userId: string | null;
  onComplete?: (intelligence: PersonaIntelligence | null, content: GeneratedContent | null) => void;
}

export function useIntelligence({ consultationId, userId, onComplete }: UseIntelligenceOptions) {
  const [stage, setStage] = useState<IntelligenceStage>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [intelligence, setIntelligence] = useState<PersonaIntelligence | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  /**
   * Start the intelligence gathering process
   */
  const gatherIntelligence = useCallback(async (consultationData: ConsultationData) => {
    if (!consultationId || !userId) {
      console.error('Missing consultationId or userId');
      setStage('error');
      setError('Session not found');
      return;
    }

    setStage('researching');
    setProgress(0);
    setError(null);

    // Simulate progress for UX (actual API calls don't provide progress)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 800);

    try {
      // Check for existing research first
      const existing = await getExistingResearch(consultationId);
      
      if (existing?.status === 'complete') {
        console.log('♻️ Using existing intelligence');
        setStage('complete');
        setProgress(100);
        clearInterval(progressInterval);
        
        // Still need to generate content
        const result = await runIntelligencePipeline(consultationId, userId, consultationData);
        
        if (result.success && result.content) {
          setGeneratedContent(result.content);
          if (result.intelligence) setIntelligence(result.intelligence);
          onComplete?.(result.intelligence || null, result.content);
        }
        return;
      }

      // Run full pipeline
      setStage('researching');
      
      // After ~3 seconds, switch to synthesizing stage
      setTimeout(() => {
        setStage('synthesizing');
        setProgress(50);
      }, 3000);

      const result = await runIntelligencePipeline(consultationId, userId, consultationData);

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        setStage('complete');
        if (result.intelligence) setIntelligence(result.intelligence);
        if (result.content) setGeneratedContent(result.content);
        onComplete?.(result.intelligence || null, result.content || null);
      } else {
        console.warn('Intelligence pipeline failed:', result.error);
        setStage('error');
        setError(result.error || 'Intelligence gathering failed');
        // Still call onComplete to proceed without intelligence
        onComplete?.(null, null);
      }

    } catch (err) {
      console.error('Intelligence error:', err);
      clearInterval(progressInterval);
      setStage('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
      onComplete?.(null, null);
    }
  }, [consultationId, userId, onComplete]);

  /**
   * Reset the intelligence state
   */
  const reset = useCallback(() => {
    setStage('idle');
    setProgress(0);
    setError(null);
    setIntelligence(null);
    setGeneratedContent(null);
  }, []);

  return {
    stage,
    progress,
    error,
    intelligence,
    generatedContent,
    gatherIntelligence,
    reset,
    isGathering: stage === 'researching' || stage === 'synthesizing',
    isComplete: stage === 'complete',
    hasError: stage === 'error'
  };
}

export default useIntelligence;

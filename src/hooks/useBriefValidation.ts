import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { BriefValidation, MissedExtraction } from '@/types/brief-validation';

interface ValidationState {
  isValidating: boolean;
  validation: BriefValidation | null;
  error: string | null;
}

export function useBriefValidation() {
  const [state, setState] = useState<ValidationState>({
    isValidating: false,
    validation: null,
    error: null,
  });

  const validateBrief = useCallback(async (
    conversationHistory: Array<{ role: string; content: string }>,
    extractedIntelligence: Record<string, string | null>,
    businessContext: { companyName?: string; website?: string }
  ): Promise<BriefValidation | null> => {
    setState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('validate-brief-intelligence', {
        body: { conversationHistory, extractedIntelligence, businessContext },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setState({
        isValidating: false,
        validation: data.validation,
        error: null,
      });

      return data.validation;
    } catch (error: unknown) {
      console.error('Brief validation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isValidating: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const getSuggestionValue = useCallback((fieldKey: string, suggestionId: string): string | null => {
    const fieldValidation = state.validation?.fieldsValidation[fieldKey];
    const suggestion = fieldValidation?.suggestions.find(s => s.id === suggestionId);
    return suggestion?.suggestedValue || null;
  }, [state.validation]);

  const getMissedExtraction = useCallback((extractionId: string): MissedExtraction | null => {
    return state.validation?.missedExtractions.find(m => m.id === extractionId) || null;
  }, [state.validation]);

  const clearValidation = useCallback(() => {
    setState({ isValidating: false, validation: null, error: null });
  }, []);

  return {
    ...state,
    validateBrief,
    getSuggestionValue,
    getMissedExtraction,
    clearValidation,
  };
}

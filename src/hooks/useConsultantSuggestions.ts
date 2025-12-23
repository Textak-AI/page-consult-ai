import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CopySuggestion, ConsultantContext, ConsultantResponse } from '@/lib/consultantSuggestions';

interface ConsultantState {
  isOpen: boolean;
  isLoading: boolean;
  summary: string;
  suggestions: CopySuggestion[];
  error: string | null;
}

interface UseConsultantSuggestionsOptions {
  onSuggestionAccepted?: (suggestion: CopySuggestion, value: string) => void;
}

export function useConsultantSuggestions(options: UseConsultantSuggestionsOptions = {}) {
  const { onSuggestionAccepted } = options;

  const [state, setState] = useState<ConsultantState>({
    isOpen: false,
    isLoading: false,
    summary: '',
    suggestions: [],
    error: null,
  });

  const fetchSuggestions = useCallback(async (
    triggerType: string,
    newData: Record<string, unknown>,
    currentSections: Array<{ type: string; content: Record<string, unknown> }>,
    fullContext: ConsultantContext
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('consultant-suggestions', {
        body: {
          triggerType,
          newData,
          currentSections,
          fullContext,
        },
      });

      if (error) {
        console.error('[useConsultantSuggestions] Error:', error);
        setState(prev => ({ ...prev, isLoading: false, error: error.message }));
        return;
      }

      if (data?.error) {
        console.error('[useConsultantSuggestions] API error:', data.error);
        setState(prev => ({ ...prev, isLoading: false, error: data.error }));
        return;
      }

      if (data?.suggestions?.length > 0) {
        setState({
          isOpen: true,
          isLoading: false,
          summary: data.summary || 'Based on your recent changes, I have some suggestions.',
          suggestions: data.suggestions.map((s: CopySuggestion) => ({
            ...s,
            status: 'pending' as const,
          })),
          error: null,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (err) {
      console.error('[useConsultantSuggestions] Fetch error:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch suggestions',
      }));
    }
  }, []);

  const acceptSuggestion = useCallback((id: string, value: string) => {
    setState(prev => {
      const suggestion = prev.suggestions.find(s => s.id === id);
      if (suggestion && onSuggestionAccepted) {
        onSuggestionAccepted(suggestion, value);
      }

      return {
        ...prev,
        suggestions: prev.suggestions.map(s =>
          s.id === id ? { ...s, status: 'accepted' as const } : s
        ),
      };
    });
  }, [onSuggestionAccepted]);

  const skipSuggestion = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s =>
        s.id === id ? { ...s, status: 'skipped' as const } : s
      ),
    }));
  }, []);

  const acceptAll = useCallback(() => {
    setState(prev => {
      const pendingSuggestions = prev.suggestions.filter(s => s.status === 'pending');
      
      // Trigger callbacks for all pending suggestions
      if (onSuggestionAccepted) {
        pendingSuggestions.forEach(s => {
          onSuggestionAccepted(s, s.suggestedValue);
        });
      }

      return {
        ...prev,
        suggestions: prev.suggestions.map(s =>
          s.status === 'pending' ? { ...s, status: 'accepted' as const } : s
        ),
      };
    });
  }, [onSuggestionAccepted]);

  const dismiss = useCallback(() => {
    setState({
      isOpen: false,
      isLoading: false,
      summary: '',
      suggestions: [],
      error: null,
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      isOpen: false,
      isLoading: false,
      summary: '',
      suggestions: [],
      error: null,
    });
  }, []);

  return {
    ...state,
    fetchSuggestions,
    acceptSuggestion,
    skipSuggestion,
    acceptAll,
    dismiss,
    reset,
  };
}

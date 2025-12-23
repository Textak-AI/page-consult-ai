import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CopySuggestion, ConsultantContext } from '@/lib/consultantSuggestions';
import { detectRegenerationTriggers, hasSignificantTriggers, getPrimaryTrigger } from '@/lib/consultantTriggers';
import { toast } from 'sonner';

interface ConsultantState {
  isOpen: boolean;
  isLoading: boolean;
  summary: string;
  suggestions: CopySuggestion[];
  error: string | null;
}

interface Section {
  type: string;
  content: Record<string, unknown>;
}

interface UseConsultantOptions {
  debounceMs?: number;
  onSuggestionAccepted?: (sectionType: string, field: string, value: string) => void;
}

export function useConsultant(
  data: Record<string, unknown>,
  sections: Section[],
  options: UseConsultantOptions = {}
) {
  const { debounceMs = 2500, onSuggestionAccepted } = options;

  const [state, setState] = useState<ConsultantState>({
    isOpen: false,
    isLoading: false,
    summary: '',
    suggestions: [],
    error: null,
  });

  const previousDataRef = useRef<Record<string, unknown> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const isFirstRenderRef = useRef(true);

  // Detect changes and fetch suggestions automatically
  useEffect(() => {
    // Skip first render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousDataRef.current = data;
      return;
    }

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      const triggers = detectRegenerationTriggers(previousDataRef.current, data);

      if (!hasSignificantTriggers(triggers)) {
        previousDataRef.current = data;
        return;
      }

      const primaryTrigger = getPrimaryTrigger(triggers);
      if (!primaryTrigger) {
        previousDataRef.current = data;
        return;
      }

      console.log('[Consultant] Significant triggers detected:', triggers.map(t => t.type));

      // Open panel with loading state
      setState(prev => ({ ...prev, isOpen: true, isLoading: true, error: null }));

      try {
        const { data: response, error } = await supabase.functions.invoke('consultant-suggestions', {
          body: {
            triggerType: primaryTrigger.type,
            newData: primaryTrigger.data,
            currentSections: sections.map(s => ({
              type: s.type,
              content: s.content,
            })),
            fullContext: {
              companyName: data.companyName || data.businessName,
              industry: `${data.industryCategory || ''} → ${data.industrySubcategory || ''}`.trim(),
              valueProposition: data.valueProposition,
              targetAudience: data.targetAudience,
              pageGoal: data.pageGoal,
            } as ConsultantContext,
          },
        });

        if (error) {
          console.error('[Consultant] Error:', error);
          setState(prev => ({ ...prev, isOpen: false, isLoading: false, error: error.message }));
          return;
        }

        if (response?.error) {
          console.error('[Consultant] API error:', response.error);
          setState(prev => ({ ...prev, isOpen: false, isLoading: false, error: response.error }));
          return;
        }

        if (response?.suggestions?.length > 0) {
          setState({
            isOpen: true,
            isLoading: false,
            summary: response.summary || 'Based on your recent changes, I have some suggestions.',
            suggestions: response.suggestions.map((s: CopySuggestion) => ({
              ...s,
              status: 'pending' as const,
            })),
            error: null,
          });
        } else {
          setState(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      } catch (err) {
        console.error('[Consultant] Fetch error:', err);
        setState(prev => ({
          ...prev,
          isOpen: false,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch suggestions',
        }));
      }

      previousDataRef.current = data;
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [data, sections, debounceMs]);

  const acceptSuggestion = useCallback((id: string, value: string) => {
    const suggestion = state.suggestions.find(s => s.id === id);
    if (!suggestion) return;

    // Update suggestion status
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s =>
        s.id === id ? { ...s, status: 'accepted' as const } : s
      ),
    }));

    // Apply the change
    if (onSuggestionAccepted) {
      onSuggestionAccepted(suggestion.section, suggestion.field, value);
    }

    toast.success(`Updated ${suggestion.section} ${suggestion.field}`);
  }, [state.suggestions, onSuggestionAccepted]);

  const skipSuggestion = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s =>
        s.id === id ? { ...s, status: 'skipped' as const } : s
      ),
    }));
  }, []);

  const acceptAll = useCallback(() => {
    const pendingSuggestions = state.suggestions.filter(s => s.status === 'pending');
    
    pendingSuggestions.forEach(s => {
      if (onSuggestionAccepted) {
        onSuggestionAccepted(s.section, s.field, s.suggestedValue);
      }
    });

    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s =>
        s.status === 'pending' ? { ...s, status: 'accepted' as const } : s
      ),
    }));

    toast.success(`Applied ${pendingSuggestions.length} changes`);
  }, [state.suggestions, onSuggestionAccepted]);

  const dismiss = useCallback(() => {
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
    onAccept: acceptSuggestion,
    onSkip: skipSuggestion,
    onAcceptAll: acceptAll,
    onDismiss: dismiss,
  };
}

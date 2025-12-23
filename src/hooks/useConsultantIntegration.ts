import { useEffect, useRef, useCallback } from 'react';
import { useConsultantSuggestions } from './useConsultantSuggestions';
import { 
  detectRegenerationTriggers, 
  hasSignificantTriggers,
  getPrimaryTrigger 
} from '@/lib/consultantTriggers';
import { CopySuggestion, ConsultantContext } from '@/lib/consultantSuggestions';

interface Section {
  type: string;
  content: Record<string, unknown>;
}

interface UseConsultantIntegrationOptions {
  consultationData: Record<string, unknown>;
  sections: Section[];
  onApplyChange: (sectionType: string, field: string, value: string) => void;
  debounceMs?: number;
  enabled?: boolean;
}

export function useConsultantIntegration({
  consultationData,
  sections,
  onApplyChange,
  debounceMs = 2500,
  enabled = true
}: UseConsultantIntegrationOptions) {
  const previousDataRef = useRef<Record<string, unknown>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const isFirstRender = useRef(true);
  const isProcessingRef = useRef(false);

  const handleSuggestionAccepted = useCallback((suggestion: CopySuggestion, value: string) => {
    console.log('[ConsultantIntegration] Applying suggestion:', suggestion.section, suggestion.field);
    onApplyChange(suggestion.section, suggestion.field, value);
  }, [onApplyChange]);

  const consultant = useConsultantSuggestions({
    onSuggestionAccepted: handleSuggestionAccepted
  });

  // Watch for significant data changes
  useEffect(() => {
    // Skip first render - just store initial data
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousDataRef.current = { ...consultationData };
      return;
    }

    // Skip if disabled
    if (!enabled) return;

    // Skip if already loading or panel is open
    if (consultant.isLoading || consultant.isOpen || isProcessingRef.current) return;

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the trigger detection
    debounceRef.current = setTimeout(async () => {
      // Double-check we're not already processing
      if (isProcessingRef.current || consultant.isOpen) return;
      
      const triggers = detectRegenerationTriggers(
        previousDataRef.current,
        consultationData
      );

      if (hasSignificantTriggers(triggers)) {
        const primaryTrigger = getPrimaryTrigger(triggers);
        
        if (primaryTrigger) {
          console.log('[ConsultantIntegration] Significant trigger detected:', primaryTrigger.type);
          isProcessingRef.current = true;
          
          try {
            await consultant.fetchSuggestions(
              primaryTrigger.type,
              primaryTrigger.data as Record<string, unknown>,
              sections.map(s => ({ type: s.type, content: s.content })),
              {
                companyName: consultationData.companyName as string || consultationData.businessName as string,
                industry: `${consultationData.industryCategory || ''} → ${consultationData.industrySubcategory || ''}`,
                valueProposition: consultationData.valueProposition as string,
                targetAudience: consultationData.targetAudience as string,
                pageGoal: consultationData.pageGoal as string
              } as ConsultantContext
            );
          } finally {
            isProcessingRef.current = false;
          }
        }
      }

      // Update previous data reference
      previousDataRef.current = { ...consultationData };
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [consultationData, sections, enabled, debounceMs, consultant.isLoading, consultant.isOpen]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    isOpen: consultant.isOpen,
    isLoading: consultant.isLoading,
    summary: consultant.summary,
    suggestions: consultant.suggestions,
    error: consultant.error,
    acceptSuggestion: consultant.acceptSuggestion,
    skipSuggestion: consultant.skipSuggestion,
    acceptAll: consultant.acceptAll,
    dismiss: consultant.dismiss,
    // Manual trigger for testing
    manualTrigger: consultant.fetchSuggestions
  };
}

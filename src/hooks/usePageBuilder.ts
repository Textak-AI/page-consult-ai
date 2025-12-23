import { useMemo, useCallback } from 'react';
import { calculateCompleteness, CompletenessState, getSectionStatus } from '@/lib/pageCompleteness';
import { useConsultant } from '@/hooks/useConsultant';

interface Section {
  id?: string;
  type: string;
  content: any;
  order?: number;
  visible?: boolean;
  _justUpdated?: boolean;
}

interface UsePageBuilderOptions {
  consultationData: Record<string, unknown>;
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  consultantEnabled?: boolean;
}

export function usePageBuilder({
  consultationData,
  sections,
  onSectionsChange,
  consultantEnabled = true
}: UsePageBuilderOptions) {
  
  // Calculate completeness
  const completeness = useMemo(() => 
    calculateCompleteness(consultationData), 
    [consultationData]
  );

  // Handle section updates from consultant
  const handleApplyChange = useCallback((
    sectionType: string,
    field: string,
    value: string
  ) => {
    onSectionsChange(sections.map(section => {
      if (section.type === sectionType) {
        return {
          ...section,
          content: {
            ...section.content,
            [field]: value
          },
          _justUpdated: true
        };
      }
      return section;
    }));

    // Clear highlight after animation
    setTimeout(() => {
      onSectionsChange(sections.map(s => ({ ...s, _justUpdated: false })));
    }, 2500);
  }, [sections, onSectionsChange]);

  // Consultant integration
  const consultant = useConsultant(
    consultationData,
    sections.map(s => ({ type: s.type, content: s.content })),
    {
      onSuggestionAccepted: handleApplyChange,
      debounceMs: 2500
    }
  );

  // Get section status helper
  const getSectionLockStatus = useCallback((sectionType: string) => {
    const status = getSectionStatus(sectionType, completeness);
    const lockedInfo = completeness.lockedSections.find(
      l => l.section === sectionType || l.section.includes(sectionType)
    );
    return {
      status,
      isLocked: status === 'locked',
      isPartial: status === 'partial',
      requirement: lockedInfo?.requirement,
      progress: lockedInfo?.progress
    };
  }, [completeness]);

  return {
    // Completeness
    completeness,
    getSectionLockStatus,
    
    // Consultant
    consultant: consultantEnabled ? consultant : null,
    
    // Helpers
    isConversionReady: completeness.score >= 90,
    isStrong: completeness.score >= 75,
    nextUnlock: completeness.nextUnlock
  };
}

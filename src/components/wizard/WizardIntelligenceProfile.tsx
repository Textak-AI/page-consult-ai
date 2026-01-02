import { useMemo } from 'react';
import { IntelligenceProfile } from '@/components/intelligence/IntelligenceProfile';
import { 
  useIntelligenceProfile, 
  mapDemoToConsultation, 
  ExtractedIntelligence 
} from '@/hooks/useIntelligenceProfile';

interface WizardIntelligenceProfileProps {
  extractedIntelligence: ExtractedIntelligence;
  recentlyFilled?: string[];
  showDemoImportBadge?: boolean;
}

/**
 * Wrapper component that uses the new Intelligence Profile in the Wizard context
 */
export function WizardIntelligenceProfile({
  extractedIntelligence,
  recentlyFilled,
  showDemoImportBadge = false,
}: WizardIntelligenceProfileProps) {
  const {
    categories,
    totalReadiness,
    readinessLevel,
    hasDataFromDemo,
    nextQuestion,
  } = useIntelligenceProfile(extractedIntelligence, recentlyFilled);

  return (
    <div className="h-full overflow-auto p-4 bg-gradient-to-b from-[#0f0a1f] to-[#1a1332]">
      <IntelligenceProfile
        categories={categories}
        totalReadiness={totalReadiness}
        readinessLevel={readinessLevel}
        nextQuestion={nextQuestion}
        showDemoImportBadge={showDemoImportBadge || hasDataFromDemo}
      />
    </div>
  );
}

/**
 * Helper to convert wizard tiles to ExtractedIntelligence format
 */
export function tilesToIntelligence(tiles: any[], collectedInfo: Record<string, any>): ExtractedIntelligence {
  const getValue = (tileId: string) => {
    const tile = tiles.find(t => t.id === tileId);
    return tile?.state === 'confirmed' && tile?.insight !== 'Not yet known' 
      ? tile.insight 
      : undefined;
  };

  return {
    // Industry & Market
    industryVertical: getValue('industry') || collectedInfo?.industry,
    industryVerticalSource: collectedInfo?.fromDemo ? 'demo' : 'consultation',
    
    // Target Audience  
    buyerRole: getValue('audience') || collectedInfo?.targetAudience,
    buyerRoleSource: collectedInfo?.fromDemo ? 'demo' : 'consultation',
    
    // Value Proposition
    coreOffer: getValue('value') || collectedInfo?.valueProposition,
    coreOfferSource: collectedInfo?.fromDemo ? 'demo' : 'consultation',
    
    // Competitive Position
    keyDifferentiator: getValue('competitive') || collectedInfo?.competitivePosition,
    keyDifferentiatorSource: collectedInfo?.fromDemo ? 'demo' : 'consultation',
    
    // Goals
    pageGoal: getValue('goals') || collectedInfo?.goals?.[0],
    
    // Additional from collectedInfo
    primaryPainPoint: collectedInfo?.painPoints,
    primaryPainPointSource: collectedInfo?.fromDemo ? 'demo' : 'consultation',
    commonObjections: collectedInfo?.buyerObjections,
    commonObjectionsSource: collectedInfo?.fromDemo ? 'demo' : 'consultation',
  };
}

export { mapDemoToConsultation };
export type { ExtractedIntelligence };

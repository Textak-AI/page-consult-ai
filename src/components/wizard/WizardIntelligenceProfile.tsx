import { useMemo } from 'react';
import { IntelligenceProfileWizard } from '@/components/consultation/IntelligenceProfileWizard';
import { calculateIntelligenceScore, getNextPrompt, type GenericIntelligence } from '@/lib/intelligenceScoreCalculator';

// Re-export the GenericIntelligence type as ExtractedIntelligence for backwards compatibility
export type ExtractedIntelligence = GenericIntelligence;

interface WizardIntelligenceProfileProps {
  extractedIntelligence: ExtractedIntelligence;
  recentlyFilled?: string[];
  showDemoImportBadge?: boolean;
  isThinking?: boolean;
}

/**
 * Wrapper component that uses the new unified scoring Intelligence Profile in the Wizard context
 */
export function WizardIntelligenceProfile({
  extractedIntelligence,
  recentlyFilled,
  showDemoImportBadge = false,
  isThinking = false,
}: WizardIntelligenceProfileProps) {
  const score = useMemo(
    () => calculateIntelligenceScore(extractedIntelligence),
    [extractedIntelligence]
  );
  
  const nextPrompt = useMemo(
    () => getNextPrompt(score),
    [score]
  );

  return (
    <div className="h-full overflow-auto p-3 bg-gradient-to-b from-[#0f0a1f] to-[#1a1332]">
      <IntelligenceProfileWizard
        score={score}
        nextPrompt={nextPrompt}
        showDemoImportBadge={showDemoImportBadge}
        isThinking={isThinking}
      />
    </div>
  );
}

/**
 * Helper to convert wizard tiles to ExtractedIntelligence format
 * Maps the old tile-based system to the new unified scoring fields
 */
export function tilesToIntelligence(tiles: any[], collectedInfo: Record<string, any>): ExtractedIntelligence {
  const getValue = (tileId: string) => {
    const tile = tiles.find(t => t.id === tileId);
    return tile?.state === 'confirmed' && tile?.insight !== 'Not yet known' 
      ? tile.insight 
      : undefined;
  };

  return {
    // WHO YOU ARE
    industry: getValue('industry') || collectedInfo?.industry || null,
    industrySummary: collectedInfo?.industrySummary || null,
    audience: getValue('audience') || collectedInfo?.targetAudience || null,
    audienceSummary: collectedInfo?.audienceSummary || null,
    geography: collectedInfo?.geography || null,
    
    // WHAT YOU OFFER
    valueProp: getValue('value') || collectedInfo?.valueProposition || null,
    valuePropSummary: collectedInfo?.valuePropSummary || null,
    competitorDifferentiator: getValue('competitive') || collectedInfo?.competitivePosition || null,
    edgeSummary: collectedInfo?.edgeSummary || null,
    method: collectedInfo?.method || null,
    
    // BUYER REALITY
    painPoints: collectedInfo?.painPoints || null,
    painSummary: collectedInfo?.painSummary || null,
    buyerObjections: collectedInfo?.buyerObjections || null,
    objectionsSummary: collectedInfo?.objectionsSummary || null,
    triggers: collectedInfo?.triggers || null,
    
    // PROOF & CREDIBILITY
    proofElements: collectedInfo?.proofElements || null,
    proofSummary: collectedInfo?.proofSummary || null,
    socialProof: collectedInfo?.socialProof || null,
    credentials: collectedInfo?.credentials || null,
  };
}

/**
 * Maps demo session data to the ExtractedIntelligence format
 * Used when loading demo data into the wizard
 */
export function mapDemoToConsultation(demoData: any): ExtractedIntelligence {
  return {
    // WHO YOU ARE
    industry: demoData.industry || null,
    industrySummary: demoData.industrySummary || null,
    audience: demoData.audience || null,
    audienceSummary: demoData.audienceSummary || null,
    geography: demoData.geography || null,
    
    // WHAT YOU OFFER
    valueProp: demoData.valueProp || null,
    valuePropSummary: demoData.valuePropSummary || null,
    competitorDifferentiator: demoData.competitorDifferentiator || demoData.competitive || null,
    edgeSummary: demoData.edgeSummary || null,
    method: demoData.method || null,
    
    // BUYER REALITY
    painPoints: demoData.painPoints || null,
    painSummary: demoData.painSummary || null,
    buyerObjections: demoData.buyerObjections || null,
    objectionsSummary: demoData.objectionsSummary || null,
    triggers: demoData.triggers || null,
    
    // PROOF & CREDIBILITY
    proofElements: demoData.proofElements || null,
    proofSummary: demoData.proofSummary || null,
    socialProof: demoData.socialProof || null,
    credentials: demoData.credentials || null,
  };
}

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, X, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CollapsibleBriefSection } from './CollapsibleBriefSection';
import { CreativeDirectionSection } from './CreativeDirectionSection';
import { MarketIntelligenceSection } from './MarketIntelligenceSection';
import type { ConsultationArtifacts } from '@/lib/artifactDetection';

interface MarketResearchData {
  marketSize?: string | null;
  buyerPersona?: string | null;
  commonObjections?: string[];
  industryInsights?: string[];
}

interface StrategyBriefProps {
  consultation: {
    id: string;
    industry?: string | null;
    target_audience?: string | null;
    unique_value?: string | null;
    competitor_differentiator?: string | null;
    audience_pain_points?: string[] | null;
    authority_markers?: string[] | null;
    extracted_intelligence?: {
      buyerObjections?: string;
      painPoints?: string;
      proofElements?: string;
      socialProof?: string;
      // Full values for richer content
      buyerObjectionsFull?: string;
      painPointsFull?: string;
      proofElementsFull?: string;
      // Summaries for narrative context
      objectionsSummary?: string;
      painSummary?: string;
      proofSummary?: string;
      edgeSummary?: string;
      valuePropSummary?: string;
      audienceSummary?: string;
      marketResearch?: MarketResearchData;
    } | null;
    business_name?: string | null;
    created_at: string;
  };
  // Optional: consultation artifacts from intelligence context
  artifacts?: ConsultationArtifacts | null;
  // Optional: market research data passed separately
  marketResearch?: MarketResearchData | null;
  onClose?: () => void;
}

/**
 * Extract objections from various sources with smart inference
 * Priority: Explicit objections > Inferred from conversation > Industry defaults
 */
function extractObjections(
  intel: StrategyBriefProps['consultation']['extracted_intelligence'],
  industry?: string | null
): { objections: string[]; source: 'stated' | 'inferred' | 'default' } {
  // 1. Check for explicit objections
  if (intel?.buyerObjections || intel?.buyerObjectionsFull) {
    const objText = intel.buyerObjectionsFull || intel.buyerObjections || '';
    const objections = objText.split(/[,;]|\n/).map(o => o.trim()).filter(o => o.length > 5);
    if (objections.length > 0) {
      console.log('[Strategy Brief] Objection extraction:', { stated: objections.length, inferred: 0, usingDefault: false });
      return { objections, source: 'stated' };
    }
  }
  
  // 2. Check market research objections
  if (intel?.marketResearch?.commonObjections && intel.marketResearch.commonObjections.length > 0) {
    console.log('[Strategy Brief] Objection extraction:', { stated: 0, inferred: intel.marketResearch.commonObjections.length, usingDefault: false });
    return { objections: intel.marketResearch.commonObjections, source: 'inferred' };
  }
  
  // 3. Infer from objections summary if available
  if (intel?.objectionsSummary) {
    const inferred = intel.objectionsSummary.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 10);
    if (inferred.length > 0) {
      console.log('[Strategy Brief] Objection extraction:', { stated: 0, inferred: inferred.length, usingDefault: false });
      return { objections: inferred, source: 'inferred' };
    }
  }
  
  // 4. Industry-specific defaults
  const industryDefaults: Record<string, string[]> = {
    saas: ['Will this integrate with our existing tools?', 'How long until we see ROI?', 'What happens to our data if we cancel?'],
    consulting: ['How is this different from other consultants?', 'What guarantee do we have it will work?', 'Why should we pay premium rates?'],
    creative: ['How do we know you understand our brand?', 'What if we don\'t like the designs?', 'How many revisions are included?'],
    healthcare: ['Is this HIPAA compliant?', 'How does this fit with our existing systems?', 'What training is required?'],
    ecommerce: ['How will this affect our conversion rate?', 'What\'s the implementation timeline?', 'How does pricing scale?'],
    finance: ['Is this SEC/regulatory compliant?', 'How secure is the platform?', 'What\'s the audit trail?'],
    legal: ['How do you handle confidentiality?', 'What\'s your malpractice coverage?', 'How do you stay current with regulations?'],
  };
  
  const normalizedIndustry = (industry || '').toLowerCase();
  const defaults = Object.entries(industryDefaults).find(([key]) => 
    normalizedIndustry.includes(key)
  )?.[1] || [
    'How is this different from alternatives?',
    'What results can we expect?',
    'What\'s the implementation process?',
  ];
  
  console.log('[Strategy Brief] Objection extraction:', { stated: 0, inferred: 0, usingDefault: true });
  return { objections: defaults, source: 'default' };
}

export function StrategyBrief({ 
  consultation, 
  artifacts,
  marketResearch: externalMarketResearch,
  onClose 
}: StrategyBriefProps) {
  const briefRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleDownloadPDF = async () => {
    if (!briefRef.current) return;
    
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(briefRef.current, {
        scale: 2,
        backgroundColor: '#0f172a',
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Handle multi-page if content is too long
      if (pdfHeight > pdf.internal.pageSize.getHeight()) {
        const pageHeight = pdf.internal.pageSize.getHeight();
        let heightLeft = pdfHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save(`strategy-brief-${consultation.id.slice(0, 8)}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const intel = consultation.extracted_intelligence || {};
  const market = externalMarketResearch || intel.marketResearch || {};
  
  // Extract objections with smart logic
  const { objections: extractedObjections, source: objectionSource } = extractObjections(
    intel, 
    consultation.industry
  );
  
  // Check if we have creative direction artifacts
  const hasCreativeDirection = artifacts && (
    artifacts.selectedHeadline || 
    artifacts.selectedCTA || 
    artifacts.alternativeHeadlines.length > 0
  );
  
  // Check if we have market research
  const hasMarketResearch = market.marketSize || market.buyerPersona || 
    (market.commonObjections && market.commonObjections.length > 0) ||
    (market.industryInsights && market.industryInsights.length > 0);
    
  // Log data being rendered
  console.log('[Strategy Brief] Generating summaries:', {
    sections: {
      positioning: true,
      buyerPsychology: !!(intel.painPoints || consultation.audience_pain_points?.length),
      differentiation: !!(consultation.competitor_differentiator || intel.proofElements),
      marketIntelligence: hasMarketResearch,
      creativeDirection: hasCreativeDirection,
      objections: extractedObjections.length,
    },
    extractedData: {
      industry: consultation.industry,
      audience: consultation.target_audience,
      valueProp: consultation.unique_value,
      objectionSource,
    },
  });

  // Calculate section numbers dynamically
  let sectionNum = 0;
  const getNextSection = () => ++sectionNum;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-auto bg-slate-900 rounded-2xl border border-slate-700">
        {/* Header with actions */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">AI Strategy Brief</h2>
                <p className="text-xs text-slate-400">
                  Generated {new Date(consultation.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download PDF
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Brief Content */}
        <div ref={briefRef} className="p-8 bg-slate-900">
          {/* Title */}
          <div className="text-center mb-10 pb-8 border-b border-slate-800">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Strategic Landing Page Brief
            </h1>
            {consultation.business_name && (
              <p className="text-xl text-white mb-2">{consultation.business_name}</p>
            )}
            <p className="text-sm text-slate-500">
              Prepared by PageConsult AI • {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Section 1: Positioning Summary */}
          <CollapsibleBriefSection
            number={getNextSection()}
            title="Positioning Summary"
            color="text-cyan-400"
            colorBg="bg-cyan-500/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-800/50 rounded-xl p-5">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Industry</p>
                <p className="text-slate-200">{consultation.industry || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Target Audience</p>
                <p className="text-slate-200">{consultation.target_audience || 'Not specified'}</p>
                {intel.audienceSummary && (
                  <p className="text-xs text-slate-400 mt-1 italic">{intel.audienceSummary}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Value Proposition</p>
                <p className="text-slate-200">{consultation.unique_value || 'Not specified'}</p>
                {intel.valuePropSummary && (
                  <p className="text-xs text-slate-400 mt-1 italic">{intel.valuePropSummary}</p>
                )}
              </div>
            </div>
          </CollapsibleBriefSection>

          {/* Section 2: Buyer Psychology */}
          <CollapsibleBriefSection
            number={getNextSection()}
            title="Buyer Psychology"
            color="text-purple-400"
            colorBg="bg-purple-500/20"
          >
            <div className="bg-slate-800/50 rounded-xl p-5 space-y-4">
              {(intel.painPoints || intel.painPointsFull || consultation.audience_pain_points?.length) && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Pain Points</p>
                  <p className="text-slate-200">
                    {intel.painPointsFull || intel.painPoints || consultation.audience_pain_points?.join(', ')}
                  </p>
                  {intel.painSummary && (
                    <p className="text-xs text-slate-400 mt-2 italic">{intel.painSummary}</p>
                  )}
                </div>
              )}
              
              {/* Objections with source indicator */}
              {extractedObjections.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Common Objections</p>
                    {objectionSource !== 'stated' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                        {objectionSource === 'inferred' ? 'Inferred' : 'Industry Default'}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1 text-slate-200">
                    {extractedObjections.slice(0, 5).map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-1">•</span>
                        {obj}
                      </li>
                    ))}
                  </ul>
                  {intel.objectionsSummary && (
                    <p className="text-xs text-slate-400 mt-2 italic">{intel.objectionsSummary}</p>
                  )}
                </div>
              )}
              
              {market.buyerPersona && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Buyer Persona</p>
                  <p className="text-slate-200">{market.buyerPersona}</p>
                </div>
              )}
              
              {!intel.painPoints && !intel.painPointsFull && !consultation.audience_pain_points?.length && 
               extractedObjections.length === 0 && !market.buyerPersona && (
                <p className="text-slate-500 italic">Continue the consultation to unlock buyer psychology insights.</p>
              )}
            </div>
          </CollapsibleBriefSection>

          {/* Section 3: Competitive Differentiation */}
          <CollapsibleBriefSection
            number={getNextSection()}
            title="Competitive Differentiation"
            color="text-amber-400"
            colorBg="bg-amber-500/20"
          >
            <div className="bg-slate-800/50 rounded-xl p-5 space-y-4">
              {consultation.competitor_differentiator && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Your Edge</p>
                  <p className="text-slate-200">{consultation.competitor_differentiator}</p>
                  {intel.edgeSummary && (
                    <p className="text-xs text-slate-400 mt-2 italic">{intel.edgeSummary}</p>
                  )}
                </div>
              )}
              {(intel.proofElements || intel.proofElementsFull || consultation.authority_markers?.length) && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Proof Elements</p>
                  <p className="text-slate-200">
                    {intel.proofElementsFull || intel.proofElements || consultation.authority_markers?.join(', ')}
                  </p>
                  {intel.proofSummary && (
                    <p className="text-xs text-slate-400 mt-2 italic">{intel.proofSummary}</p>
                  )}
                </div>
              )}
              {intel.socialProof && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Social Proof</p>
                  <p className="text-slate-200">{intel.socialProof}</p>
                </div>
              )}
              {!consultation.competitor_differentiator && !intel.proofElements && !intel.proofElementsFull && 
               !consultation.authority_markers?.length && !intel.socialProof && (
                <p className="text-slate-500 italic">Continue the consultation to unlock competitive differentiation.</p>
              )}
            </div>
          </CollapsibleBriefSection>

          {/* Section 4: Market Intelligence (if available) */}
          {hasMarketResearch && (
            <MarketIntelligenceSection
              marketResearch={market}
              sectionNumber={getNextSection()}
            />
          )}

          {/* Section 5: Creative Direction (if artifacts captured) */}
          {hasCreativeDirection && artifacts && (
            <CreativeDirectionSection
              artifacts={artifacts}
              sectionNumber={getNextSection()}
            />
          )}

          {/* Section N: Recommended Page Structure */}
          <CollapsibleBriefSection
            number={getNextSection()}
            title="Recommended Page Structure"
            color="text-blue-400"
            colorBg="bg-blue-500/20"
          >
            <div className="bg-slate-800/50 rounded-xl p-5">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-cyan-400 font-medium">1</span>
                  <span className="text-slate-200">Hero — Lead with transformation, not features</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-cyan-400 font-medium">2</span>
                  <span className="text-slate-200">Problem — Articulate the pain they're experiencing</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-cyan-400 font-medium">3</span>
                  <span className="text-slate-200">Solution — Your approach and methodology</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-cyan-400 font-medium">4</span>
                  <span className="text-slate-200">Proof — Credentials, results, testimonials</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-cyan-400 font-medium">5</span>
                  <span className="text-slate-200">ROI Calculator — Make the value tangible</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-cyan-400 font-medium">6</span>
                  <span className="text-slate-200">CTA — Clear next step with urgency</span>
                </div>
              </div>
            </div>
          </CollapsibleBriefSection>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-slate-800">
            <p className="text-sm text-slate-500">
              Generated by PageConsult AI • Your Strategic Landing Page Partner
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

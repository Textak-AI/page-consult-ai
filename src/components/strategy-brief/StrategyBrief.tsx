import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, X, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
      marketResearch?: {
        marketSize?: string;
        buyerPersona?: string;
        commonObjections?: string[];
        industryInsights?: string[];
      };
    } | null;
    business_name?: string | null;
    created_at: string;
  };
  onClose?: () => void;
}

export function StrategyBrief({ consultation, onClose }: StrategyBriefProps) {
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
  const market = intel.marketResearch || {};

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
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">1</span>
              <h3 className="text-lg font-semibold text-white">Positioning Summary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-800/50 rounded-xl p-5">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Industry</p>
                <p className="text-slate-200">{consultation.industry || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Target Audience</p>
                <p className="text-slate-200">{consultation.target_audience || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Value Proposition</p>
                <p className="text-slate-200">{consultation.unique_value || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Buyer Psychology */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">2</span>
              <h3 className="text-lg font-semibold text-white">Buyer Psychology</h3>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-5 space-y-4">
              {(intel.painPoints || consultation.audience_pain_points?.length) && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Pain Points</p>
                  <p className="text-slate-200">
                    {intel.painPoints || consultation.audience_pain_points?.join(', ')}
                  </p>
                </div>
              )}
              {intel.buyerObjections && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Common Objections</p>
                  <p className="text-slate-200">{intel.buyerObjections}</p>
                </div>
              )}
              {market.buyerPersona && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Buyer Persona</p>
                  <p className="text-slate-200">{market.buyerPersona}</p>
                </div>
              )}
              {!intel.painPoints && !consultation.audience_pain_points?.length && !intel.buyerObjections && !market.buyerPersona && (
                <p className="text-slate-500 italic">Continue the consultation to unlock buyer psychology insights.</p>
              )}
            </div>
          </div>

          {/* Section 3: Competitive Differentiation */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">3</span>
              <h3 className="text-lg font-semibold text-white">Competitive Differentiation</h3>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-5 space-y-4">
              {consultation.competitor_differentiator && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Your Edge</p>
                  <p className="text-slate-200">{consultation.competitor_differentiator}</p>
                </div>
              )}
              {(intel.proofElements || consultation.authority_markers?.length) && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Proof Elements</p>
                  <p className="text-slate-200">
                    {intel.proofElements || consultation.authority_markers?.join(', ')}
                  </p>
                </div>
              )}
              {!consultation.competitor_differentiator && !intel.proofElements && !consultation.authority_markers?.length && (
                <p className="text-slate-500 italic">Continue the consultation to unlock competitive differentiation.</p>
              )}
            </div>
          </div>

          {/* Section 4: Market Intelligence (if available) */}
          {(market.marketSize || (market.industryInsights && market.industryInsights.length > 0)) && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">4</span>
                <h3 className="text-lg font-semibold text-white">Market Intelligence</h3>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-5 space-y-4">
                {market.marketSize && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Market Size</p>
                    <p className="text-slate-200">{market.marketSize}</p>
                  </div>
                )}
                {market.industryInsights && market.industryInsights.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Industry Insights</p>
                    <ul className="space-y-1">
                      {market.industryInsights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-200">
                          <span className="text-green-400 mt-1">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 5: Recommended Page Structure */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                {market.marketSize || market.industryInsights?.length ? '5' : '4'}
              </span>
              <h3 className="text-lg font-semibold text-white">Recommended Page Structure</h3>
            </div>
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
          </div>

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

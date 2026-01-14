import { motion } from 'framer-motion';
import { TrendingUp, Target, AlertTriangle, Lightbulb, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CollapsibleBriefSection } from './CollapsibleBriefSection';

interface MarketResearchData {
  marketSize?: string | null;
  buyerPersona?: string | null;
  commonObjections?: string[];
  industryInsights?: string[];
  source?: string;
}

interface MarketIntelligenceSectionProps {
  marketResearch: MarketResearchData;
  sectionNumber: number;
  className?: string;
}

export function MarketIntelligenceSection({ 
  marketResearch, 
  sectionNumber,
  className 
}: MarketIntelligenceSectionProps) {
  const hasMarketSize = !!marketResearch.marketSize;
  const hasBuyerPersona = !!marketResearch.buyerPersona;
  const hasObjections = marketResearch.commonObjections && marketResearch.commonObjections.length > 0;
  const hasInsights = marketResearch.industryInsights && marketResearch.industryInsights.length > 0;
  
  const hasContent = hasMarketSize || hasBuyerPersona || hasObjections || hasInsights;
  
  if (!hasContent) {
    return null;
  }
  
  console.log('[Strategy Brief] Market research included:', {
    hasResearch: true,
    insights: {
      marketSize: hasMarketSize,
      buyerPersona: hasBuyerPersona,
      objections: hasObjections ? marketResearch.commonObjections?.length : 0,
      insights: hasInsights ? marketResearch.industryInsights?.length : 0,
    },
  });
  
  return (
    <CollapsibleBriefSection
      number={sectionNumber}
      title="Market Intelligence"
      color="text-green-400"
      colorBg="bg-green-500/20"
      defaultExpanded={true}
      className={className}
    >
      <div className="bg-slate-800/50 rounded-xl p-5 space-y-5">
        {/* Market Size */}
        {hasMarketSize && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <BarChart2 className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Market Size</p>
              <p className="text-slate-200">{marketResearch.marketSize}</p>
            </div>
          </div>
        )}
        
        {/* Buyer Persona */}
        {hasBuyerPersona && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Target className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Buyer Persona</p>
              <p className="text-slate-200">{marketResearch.buyerPersona}</p>
            </div>
          </div>
        )}
        
        {/* Common Objections */}
        {hasObjections && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Common Objections</p>
              <ul className="space-y-2">
                {marketResearch.commonObjections!.map((objection, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-200">
                    <span className="text-amber-400 mt-1 shrink-0">•</span>
                    <span>{objection}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {/* Industry Insights */}
        {hasInsights && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Lightbulb className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Industry Insights</p>
              <ul className="space-y-2">
                {marketResearch.industryInsights!.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-200">
                    <span className="text-purple-400 mt-1 shrink-0">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {/* Source Attribution */}
        {marketResearch.source && (
          <div className="pt-3 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 italic">
              Source: {marketResearch.source}
            </p>
          </div>
        )}
      </div>
    </CollapsibleBriefSection>
  );
}

import { useState } from "react";
import { Brain, User, AlertTriangle, Sparkles, HelpCircle, BarChart3, MessageSquare, ChevronDown, Lightbulb, Zap, XCircle, MousePointerClick } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { PersonaIntelligence } from "@/services/intelligence/types";

interface LandingPageBestPractices {
  headlineFormulas?: Array<{ formula: string; example?: string }>;
  ctaExamples?: string[];
  conversionTips?: string[];
  commonMistakes?: string[];
  calculatorIdeas?: Array<{ idea: string; description?: string }>;
}

interface PersonaInsightsPanelProps {
  intelligence: PersonaIntelligence;
  landingPageBestPractices?: LandingPageBestPractices | null;
}

export function PersonaInsightsPanel({ intelligence, landingPageBestPractices }: PersonaInsightsPanelProps) {
  const persona = intelligence.synthesizedPersona;
  const marketResearch = intelligence.marketResearch;
  const confidenceScore = intelligence.confidenceScore || 0;
  
  // All sections collapsed by default for cleaner sidebar
  const [openSections, setOpenSections] = useState({
    pain: false,
    desire: false,
    objection: false,
    stats: false,
    language: false,
    tips: false,
    ctas: false,
    mistakes: false,
    headlines: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!persona) return null;

  // Extract market statistics
  const statistics = marketResearch?.claims
    ?.filter((c: any) => c.category === 'statistic' || c.claim?.match(/\d/))
    ?.slice(0, 4) || [];
  
  // Get unique sources
  const sources = [...new Set(statistics.map((s: any) => s.source).filter(Boolean))];

  // Check if we have any best practices content
  const hasBestPractices = landingPageBestPractices && (
    landingPageBestPractices.conversionTips?.length ||
    landingPageBestPractices.ctaExamples?.length ||
    landingPageBestPractices.headlineFormulas?.length ||
    landingPageBestPractices.commonMistakes?.length
  );

  return (
    <div className="border-b border-white/10 max-h-[50vh] overflow-y-auto">
      {/* Compact Header */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-white/10 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">
                {persona.name || "Target Customer"}
              </h3>
              <span className={cn(
                "text-[10px] font-medium",
                confidenceScore >= 0.8 ? "text-green-400" :
                confidenceScore >= 0.5 ? "text-yellow-400" : "text-gray-500"
              )}>
                {Math.round(confidenceScore * 100)}% confidence
              </span>
            </div>
          </div>
          <Brain className="w-4 h-4 text-purple-400/60" />
        </div>
      </div>

      {/* Best Practices Section */}
      {hasBestPractices && (
        <>
          {/* Conversion Tips */}
          {landingPageBestPractices?.conversionTips && landingPageBestPractices.conversionTips.length > 0 && (
            <CompactInsightSection
              icon={Zap}
              iconColor="text-yellow-400"
              bgColor="bg-yellow-500/10"
              title="Conversion Tips"
              count={landingPageBestPractices.conversionTips.length}
              isOpen={openSections.tips}
              onToggle={() => toggleSection('tips')}
            >
              <ul className="space-y-1.5">
                {landingPageBestPractices.conversionTips.slice(0, 4).map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-yellow-400 mt-0.5">→</span>
                    <span className="text-gray-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </CompactInsightSection>
          )}

          {/* CTA Suggestions */}
          {landingPageBestPractices?.ctaExamples && landingPageBestPractices.ctaExamples.length > 0 && (
            <CompactInsightSection
              icon={MousePointerClick}
              iconColor="text-green-400"
              bgColor="bg-green-500/10"
              title="CTA Ideas"
              count={landingPageBestPractices.ctaExamples.length}
              isOpen={openSections.ctas}
              onToggle={() => toggleSection('ctas')}
            >
              <div className="flex flex-wrap gap-1.5">
                {landingPageBestPractices.ctaExamples.slice(0, 5).map((cta, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-1 text-[10px] bg-green-500/10 border border-green-500/20 rounded-full text-green-300"
                  >
                    {cta}
                  </span>
                ))}
              </div>
            </CompactInsightSection>
          )}

          {/* Headline Ideas */}
          {landingPageBestPractices?.headlineFormulas && landingPageBestPractices.headlineFormulas.length > 0 && (
            <CompactInsightSection
              icon={Lightbulb}
              iconColor="text-orange-400"
              bgColor="bg-orange-500/10"
              title="Headline Ideas"
              count={landingPageBestPractices.headlineFormulas.length}
              isOpen={openSections.headlines}
              onToggle={() => toggleSection('headlines')}
            >
              <ul className="space-y-2">
                {landingPageBestPractices.headlineFormulas.slice(0, 3).map((item, i) => (
                  <li key={i} className="text-xs">
                    <p className="text-gray-300">{item.formula}</p>
                    {item.example && (
                      <p className="mt-0.5 text-[10px] text-orange-400/70 italic">
                        "{item.example}"
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </CompactInsightSection>
          )}

          {/* Common Mistakes */}
          {landingPageBestPractices?.commonMistakes && landingPageBestPractices.commonMistakes.length > 0 && (
            <CompactInsightSection
              icon={XCircle}
              iconColor="text-red-400"
              bgColor="bg-red-500/10"
              title="Avoid"
              count={landingPageBestPractices.commonMistakes.length}
              isOpen={openSections.mistakes}
              onToggle={() => toggleSection('mistakes')}
            >
              <ul className="space-y-1.5">
                {landingPageBestPractices.commonMistakes.slice(0, 3).map((mistake, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-red-400">✗</span>
                    <span className="text-gray-400">{mistake}</span>
                  </li>
                ))}
              </ul>
            </CompactInsightSection>
          )}
        </>
      )}

      {/* Persona Insights Divider */}
      <div className="px-3 py-1.5 bg-white/[0.02] border-y border-white/5">
        <span className="text-[10px] font-semibold text-gray-600 tracking-wider uppercase">Persona Insights</span>
      </div>

      {/* Primary Pain */}
      {persona.painPoints?.[0] && (
        <CompactInsightSection
          icon={AlertTriangle}
          iconColor="text-red-400"
          bgColor="bg-red-500/10"
          title="Pain Point"
          isOpen={openSections.pain}
          onToggle={() => toggleSection('pain')}
        >
          <p className="text-xs text-gray-300 leading-relaxed">
            {persona.painPoints[0].pain}
          </p>
        </CompactInsightSection>
      )}

      {/* Primary Desire */}
      {persona.desires?.[0] && (
        <CompactInsightSection
          icon={Sparkles}
          iconColor="text-emerald-400"
          bgColor="bg-emerald-500/10"
          title="Desire"
          isOpen={openSections.desire}
          onToggle={() => toggleSection('desire')}
        >
          <p className="text-xs text-gray-300 leading-relaxed">
            {persona.desires[0].desire}
          </p>
        </CompactInsightSection>
      )}

      {/* Key Objection */}
      {persona.objections?.[0] && (
        <CompactInsightSection
          icon={HelpCircle}
          iconColor="text-amber-400"
          bgColor="bg-amber-500/10"
          title="Objection"
          isOpen={openSections.objection}
          onToggle={() => toggleSection('objection')}
        >
          <p className="text-xs text-gray-300 italic mb-2">
            "{persona.objections[0].objection}"
          </p>
          {persona.objections[0].counterArgument && (
            <div className="pl-2 border-l-2 border-cyan-500/50">
              <p className="text-xs text-cyan-300">
                {persona.objections[0].counterArgument}
              </p>
            </div>
          )}
        </CompactInsightSection>
      )}

      {/* Market Stats */}
      {statistics.length > 0 && (
        <CompactInsightSection
          icon={BarChart3}
          iconColor="text-cyan-400"
          bgColor="bg-cyan-500/10"
          title="Market Stats"
          count={statistics.length}
          isOpen={openSections.stats}
          onToggle={() => toggleSection('stats')}
        >
          <ul className="space-y-1.5">
            {statistics.map((stat: any, i: number) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span className="text-cyan-400">•</span>
                <span className="text-gray-300">{stat.claim}</span>
              </li>
            ))}
          </ul>
          {sources.length > 0 && (
            <p className="mt-2 text-[10px] text-gray-600">
              Sources: {sources.join(', ')}
            </p>
          )}
        </CompactInsightSection>
      )}

      {/* Language Patterns */}
      {persona.languagePatterns?.length > 0 && (
        <CompactInsightSection
          icon={MessageSquare}
          iconColor="text-purple-400"
          bgColor="bg-purple-500/10"
          title="Language"
          count={persona.languagePatterns.length}
          isOpen={openSections.language}
          onToggle={() => toggleSection('language')}
        >
          <div className="flex flex-wrap gap-1.5">
            {persona.languagePatterns.slice(0, 5).map((pattern: string, i: number) => (
              <span 
                key={i} 
                className="px-2 py-0.5 text-[10px] bg-white/5 border border-white/10 rounded text-gray-400"
              >
                {pattern}
              </span>
            ))}
          </div>
        </CompactInsightSection>
      )}
    </div>
  );
}

interface CompactInsightSectionProps {
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  title: string;
  count?: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CompactInsightSection({ icon: Icon, iconColor, bgColor, title, count, isOpen, onToggle, children }: CompactInsightSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 hover:bg-white/5 transition-colors border-b border-white/[0.03]">
        <div className="flex items-center gap-2">
          <div className={cn("w-5 h-5 rounded flex items-center justify-center", bgColor)}>
            <Icon className={cn("w-3 h-3", iconColor)} />
          </div>
          <span className="text-xs font-medium text-gray-400">{title}</span>
          {count && (
            <span className="text-[10px] text-gray-600">({count})</span>
          )}
        </div>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 text-gray-600 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 py-2.5 border-b border-white/[0.03] bg-white/[0.02]">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

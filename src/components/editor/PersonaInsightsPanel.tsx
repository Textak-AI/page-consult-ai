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
  
  const [openSections, setOpenSections] = useState({
    pain: true,
    desire: true,
    objection: false,
    stats: false,
    language: false,
    tips: true,
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

  return (
    <div className="border-b border-white/10">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {persona.name || "Target Customer"}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-400">Confidence:</span>
                <span className={cn(
                  "text-xs font-medium",
                  confidenceScore >= 0.8 ? "text-green-400" :
                  confidenceScore >= 0.5 ? "text-yellow-400" : "text-gray-400"
                )}>
                  {Math.round(confidenceScore * 100)}%
                </span>
              </div>
            </div>
          </div>
          <Brain className="w-5 h-5 text-purple-400/60" />
        </div>
      </div>

      {/* Conversion Tips */}
      {landingPageBestPractices?.conversionTips && landingPageBestPractices.conversionTips.length > 0 && (
        <InsightSection
          icon={Zap}
          iconColor="text-yellow-400"
          bgColor="bg-yellow-500/10"
          title="CONVERSION TIPS"
          isOpen={openSections.tips}
          onToggle={() => toggleSection('tips')}
        >
          <ul className="space-y-2">
            {landingPageBestPractices.conversionTips.slice(0, 5).map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-yellow-400 mt-0.5 font-bold">→</span>
                <span className="text-gray-200">{tip}</span>
              </li>
            ))}
          </ul>
        </InsightSection>
      )}

      {/* CTA Suggestions */}
      {landingPageBestPractices?.ctaExamples && landingPageBestPractices.ctaExamples.length > 0 && (
        <InsightSection
          icon={MousePointerClick}
          iconColor="text-green-400"
          bgColor="bg-green-500/10"
          title="CTA SUGGESTIONS"
          isOpen={openSections.ctas}
          onToggle={() => toggleSection('ctas')}
        >
          <div className="flex flex-wrap gap-2">
            {landingPageBestPractices.ctaExamples.slice(0, 6).map((cta, i) => (
              <span 
                key={i} 
                className="px-3 py-1.5 text-xs bg-green-500/10 border border-green-500/20 rounded-full text-green-300 hover:bg-green-500/20 transition-colors cursor-default"
              >
                {cta}
              </span>
            ))}
          </div>
        </InsightSection>
      )}

      {/* Headline Formulas */}
      {landingPageBestPractices?.headlineFormulas && landingPageBestPractices.headlineFormulas.length > 0 && (
        <InsightSection
          icon={Lightbulb}
          iconColor="text-orange-400"
          bgColor="bg-orange-500/10"
          title="HEADLINE IDEAS"
          isOpen={openSections.headlines}
          onToggle={() => toggleSection('headlines')}
        >
          <ul className="space-y-3">
            {landingPageBestPractices.headlineFormulas.slice(0, 3).map((item, i) => (
              <li key={i} className="text-sm">
                <p className="text-gray-200">{item.formula}</p>
                {item.example && (
                  <p className="mt-1 text-xs text-orange-400/80 italic">
                    e.g., "{item.example}"
                  </p>
                )}
              </li>
            ))}
          </ul>
        </InsightSection>
      )}

      {/* Common Mistakes */}
      {landingPageBestPractices?.commonMistakes && landingPageBestPractices.commonMistakes.length > 0 && (
        <InsightSection
          icon={XCircle}
          iconColor="text-red-400"
          bgColor="bg-red-500/10"
          title="AVOID THESE MISTAKES"
          isOpen={openSections.mistakes}
          onToggle={() => toggleSection('mistakes')}
        >
          <ul className="space-y-2">
            {landingPageBestPractices.commonMistakes.slice(0, 4).map((mistake, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-red-400 mt-0.5">✗</span>
                <span className="text-gray-300">{mistake}</span>
              </li>
            ))}
          </ul>
        </InsightSection>
      )}

      {/* Divider for persona section */}
      {landingPageBestPractices && (
        <div className="px-4 py-2 bg-white/5 border-y border-white/10">
          <span className="text-xs font-semibold text-gray-500 tracking-wider">PERSONA INSIGHTS</span>
        </div>
      )}

      {/* Primary Pain */}
      {persona.painPoints?.[0] && (
        <InsightSection
          icon={AlertTriangle}
          iconColor="text-red-400"
          bgColor="bg-red-500/10"
          title="PRIMARY PAIN"
          isOpen={openSections.pain}
          onToggle={() => toggleSection('pain')}
        >
          <p className="text-sm text-gray-200 leading-relaxed">
            {persona.painPoints[0].pain}
          </p>
          {persona.painPoints[0].intensity != null && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-500">Intensity:</span>
              <IntensityBar level={Number(persona.painPoints[0].intensity)} />
            </div>
          )}
        </InsightSection>
      )}

      {/* Primary Desire */}
      {persona.desires?.[0] && (
        <InsightSection
          icon={Sparkles}
          iconColor="text-emerald-400"
          bgColor="bg-emerald-500/10"
          title="PRIMARY DESIRE"
          isOpen={openSections.desire}
          onToggle={() => toggleSection('desire')}
        >
          <p className="text-sm text-gray-200 leading-relaxed">
            {persona.desires[0].desire}
          </p>
        </InsightSection>
      )}

      {/* Key Objection */}
      {persona.objections?.[0] && (
        <InsightSection
          icon={HelpCircle}
          iconColor="text-amber-400"
          bgColor="bg-amber-500/10"
          title="KEY OBJECTION"
          isOpen={openSections.objection}
          onToggle={() => toggleSection('objection')}
        >
          <p className="text-sm text-gray-200 leading-relaxed italic">
            "{persona.objections[0].objection}"
          </p>
          {persona.objections[0].counterArgument && (
            <div className="mt-3 pl-3 border-l-2 border-cyan-500/50">
              <span className="text-xs text-cyan-400 font-medium block mb-1">Counter:</span>
              <p className="text-sm text-cyan-200">
                {persona.objections[0].counterArgument}
              </p>
            </div>
          )}
        </InsightSection>
      )}

      {/* Market Stats */}
      {statistics.length > 0 && (
        <InsightSection
          icon={BarChart3}
          iconColor="text-cyan-400"
          bgColor="bg-cyan-500/10"
          title="MARKET STATS"
          isOpen={openSections.stats}
          onToggle={() => toggleSection('stats')}
        >
          <ul className="space-y-2">
            {statistics.map((stat: any, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-cyan-400 mt-1">•</span>
                <span className="text-gray-200">{stat.claim}</span>
              </li>
            ))}
          </ul>
          {sources.length > 0 && (
            <p className="mt-3 text-xs text-gray-500">
              Sources: {sources.join(', ')}
            </p>
          )}
        </InsightSection>
      )}

      {/* Language Patterns */}
      {persona.languagePatterns?.length > 0 && (
        <InsightSection
          icon={MessageSquare}
          iconColor="text-purple-400"
          bgColor="bg-purple-500/10"
          title="LANGUAGE PATTERNS"
          isOpen={openSections.language}
          onToggle={() => toggleSection('language')}
        >
          <div className="flex flex-wrap gap-2">
            {persona.languagePatterns.slice(0, 6).map((pattern: string, i: number) => (
              <span 
                key={i} 
                className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded-md text-gray-300"
              >
                {pattern}
              </span>
            ))}
          </div>
        </InsightSection>
      )}
    </div>
  );
}

interface InsightSectionProps {
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function InsightSection({ icon: Icon, iconColor, bgColor, title, isOpen, onToggle, children }: InsightSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-white/5 transition-colors border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className={cn("w-6 h-6 rounded flex items-center justify-center", bgColor)}>
            <Icon className={cn("w-3.5 h-3.5", iconColor)} />
          </div>
          <span className="text-xs font-semibold text-gray-400 tracking-wider">{title}</span>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-500 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 py-3 border-b border-white/5">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function IntensityBar({ level }: { level: number }) {
  const normalizedLevel = Math.min(Math.max(level, 1), 10);
  const percentage = (normalizedLevel / 10) * 100;
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all",
            normalizedLevel >= 7 ? "bg-red-400" :
            normalizedLevel >= 4 ? "bg-amber-400" : "bg-green-400"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">{normalizedLevel}/10</span>
    </div>
  );
}

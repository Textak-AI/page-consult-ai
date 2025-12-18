import { useState } from "react";
import { Brain, User, AlertTriangle, Sparkles, HelpCircle, BarChart3, MessageSquare, ChevronDown, Lightbulb, Zap, XCircle, MousePointerClick, Link2 } from "lucide-react";
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

// Helper function to strip citations like [1], [2], etc. and markdown
function cleanText(text: string): string {
  if (!text) return '';
  // Handle JSON objects that were stringified
  if (typeof text === 'object') {
    return '';
  }
  return text
    .replace(/\[\d+\]/g, '') // Remove [1], [2], etc.
    .replace(/\*\*/g, '') // Remove markdown bold
    .replace(/\*/g, '') // Remove markdown italic
    .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
    .trim();
}

// Parse pain point which might be a JSON object or string
function parsePainPoint(pain: any): { main: string; tip?: string } | null {
  if (!pain) return null;
  
  // If it's a string that looks like JSON, try to parse it
  if (typeof pain === 'string') {
    try {
      const parsed = JSON.parse(pain);
      if (parsed.Pain_1 || parsed.pain) {
        return {
          main: cleanText(parsed.Pain_1 || parsed.pain || ''),
          tip: parsed.actionable ? cleanText(parsed.actionable) : undefined,
        };
      }
    } catch {
      // Not JSON, use as-is
      return { main: cleanText(pain) };
    }
    return { main: cleanText(pain) };
  }
  
  // If it's an object with Pain_1, actionable fields
  if (typeof pain === 'object') {
    if (pain.Pain_1 || pain.pain) {
      return {
        main: cleanText(pain.Pain_1 || pain.pain || ''),
        tip: pain.actionable ? cleanText(pain.actionable) : undefined,
      };
    }
    // Standard format with .pain property
    if (pain.pain) {
      return { main: cleanText(pain.pain) };
    }
  }
  
  return null;
}

// Parse market stats from various possible formats
function parseMarketStats(marketResearch: any): Array<{ value: string; label: string }> {
  const stats: Array<{ value: string; label: string }> = [];
  
  if (!marketResearch) return stats;
  
  // Check for _DEMOGRAPHICS format
  const demographics = marketResearch._DEMOGRAPHICS || marketResearch.demographics || marketResearch.DEMOGRAPHICS;
  if (Array.isArray(demographics)) {
    demographics.forEach((d: any) => {
      if (d.Age_range || d.age_range) stats.push({ value: d.Age_range || d.age_range, label: 'Age range' });
      if (d.Average_budget || d.budget) stats.push({ value: d.Average_budget || d.budget, label: 'Avg budget' });
      if (d.Market_size || d.market_size) stats.push({ value: d.Market_size || d.market_size, label: 'Market size' });
    });
  }
  
  // Check for claims with statistics
  if (marketResearch.claims) {
    marketResearch.claims
      .filter((c: any) => c.category === 'statistic' || c.claim?.match(/\d/))
      .slice(0, 6)
      .forEach((claim: any) => {
        const extracted = extractStatValue(typeof claim === 'string' ? claim : claim.claim);
        if (extracted) stats.push(extracted);
      });
  }
  
  // Check for raw statistics object
  if (marketResearch.statistics && typeof marketResearch.statistics === 'object') {
    Object.entries(marketResearch.statistics).forEach(([key, val]: [string, any]) => {
      if (val && typeof val === 'string' || typeof val === 'number') {
        stats.push({ value: String(val), label: key.replace(/_/g, ' ') });
      }
    });
  }
  
  return stats.slice(0, 4);
}

// Extract numeric value from a stat claim
function extractStatValue(claim: string): { value: string; label: string } | null {
  if (!claim || typeof claim !== 'string') return null;
  
  // Match patterns like "$22,500", "36", "21,714", "85%", "$1,850-$2,100", etc.
  const patterns = [
    /(\$[\d,]+(?:-\$[\d,]+)?)/,  // Dollar amounts (including ranges)
    /([\d,]+(?:\.\d+)?%)/,       // Percentages
    /([\d,]+(?:-[\d,]+)?)/,      // Plain numbers (including ranges)
  ];
  
  for (const pattern of patterns) {
    const match = claim.match(pattern);
    if (match) {
      const value = match[1];
      // Extract the label (text after the number)
      const labelMatch = claim.replace(match[0], '').trim();
      const cleanLabel = cleanText(labelMatch)
        .replace(/^[-–—:,.\s]+/, '')
        .replace(/[-–—:,.\s]+$/, '')
        .trim();
      
      if (cleanLabel && cleanLabel.length > 2) {
        return { value, label: cleanLabel.slice(0, 30) };
      }
    }
  }
  return null;
}

// Parse CTA examples - filter out citation-only entries and generate defaults if needed
function parseCtaExamples(examples: string[] | undefined, industry?: string): string[] {
  const defaults = [
    'Get Started',
    'Book a Consultation',
    'Get Free Quote',
    'Learn More',
  ];
  
  if (!examples || examples.length === 0) return defaults;
  
  const parsed = examples
    .map(cta => cleanText(typeof cta === 'string' ? cta : ''))
    .filter(cta => {
      // Filter out empty strings, citations-only, too short, or numeric fragments
      return cta.length > 3 && 
             !/^\[\d+\]$/.test(cta) && 
             !/^\d+/.test(cta) &&
             !cta.includes('%') &&
             cta.split(' ').length <= 6;
    });
  
  return parsed.length > 0 ? parsed : defaults;
}

// Parse headline formulas
function parseHeadlineFormula(item: { formula: string; example?: string }): { formula: string; example?: string } {
  return {
    formula: cleanText(item.formula),
    example: item.example ? cleanText(item.example) : undefined,
  };
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
    sources: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!persona) return null;

  // Extract market statistics and parse them into clean stat cards
  const parsedStats = parseMarketStats(marketResearch);
  
  // Get unique sources for collapsed sources section
  const rawStatistics = marketResearch?.claims?.filter((c: any) => c.category === 'statistic') || [];
  const allSources = [...new Set([
    ...rawStatistics.map((s: any) => s.source).filter(Boolean),
    ...(marketResearch?.sources || []),
  ])];

  // Check if we have any best practices content
  const hasBestPractices = landingPageBestPractices && (
    landingPageBestPractices.conversionTips?.length ||
    landingPageBestPractices.ctaExamples?.length ||
    landingPageBestPractices.headlineFormulas?.length ||
    landingPageBestPractices.commonMistakes?.length
  );

  // Parse CTA examples with fallback defaults
  const cleanCtaExamples = parseCtaExamples(landingPageBestPractices?.ctaExamples, intelligence.industry);

  // Parse headline formulas
  const cleanHeadlines = landingPageBestPractices?.headlineFormulas
    ?.map(parseHeadlineFormula)
    .filter(h => h.formula.length > 5) || [];
  
  // Parse pain points properly
  const primaryPainParsed = persona.painPoints?.[0] ? parsePainPoint(persona.painPoints[0]) : null;

  // Parse conversion tips
  const cleanTips = landingPageBestPractices?.conversionTips
    ?.map(cleanText)
    .filter(t => t.length > 5) || [];

  // Parse common mistakes
  const cleanMistakes = landingPageBestPractices?.commonMistakes
    ?.map(cleanText)
    .filter(m => m.length > 5) || [];

  return (
    <div className="border-b border-white/10 max-h-[50vh] overflow-y-auto">
      {/* Compact Persona Header - FULLY OPAQUE */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-white/10 sticky top-0 z-10 bg-slate-900">
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
          {/* LANDING PAGE STRATEGY Header */}
          <div className="px-3 py-1.5 bg-white/[0.02] border-b border-white/5">
            <span className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase">Landing Page Strategy</span>
          </div>

          {/* Conversion Tips */}
          {cleanTips.length > 0 && (
            <CompactInsightSection
              icon={Zap}
              iconColor="text-yellow-400"
              bgColor="bg-yellow-500/10"
              title="Conversion Tips"
              count={cleanTips.length}
              isOpen={openSections.tips}
              onToggle={() => toggleSection('tips')}
            >
              <ul className="space-y-1.5">
                {cleanTips.slice(0, 4).map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-yellow-400 mt-0.5">→</span>
                    <span className="text-gray-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </CompactInsightSection>
          )}

          {/* CTA Suggestions */}
          {cleanCtaExamples.length > 0 && (
            <CompactInsightSection
              icon={MousePointerClick}
              iconColor="text-green-400"
              bgColor="bg-green-500/10"
              title="CTA Ideas"
              count={cleanCtaExamples.length}
              isOpen={openSections.ctas}
              onToggle={() => toggleSection('ctas')}
            >
              <div className="flex flex-wrap gap-1.5">
                {cleanCtaExamples.slice(0, 5).map((cta, i) => (
                  <button 
                    key={i} 
                    className="px-2.5 py-1.5 text-[11px] bg-green-500/10 border border-green-500/30 rounded-md text-green-300 hover:bg-green-500/20 hover:border-green-500/50 transition-colors cursor-pointer"
                    onClick={() => navigator.clipboard.writeText(cta)}
                    title="Click to copy"
                  >
                    {cta}
                  </button>
                ))}
              </div>
            </CompactInsightSection>
          )}

          {/* Headline Ideas */}
          {cleanHeadlines.length > 0 && (
            <CompactInsightSection
              icon={Lightbulb}
              iconColor="text-orange-400"
              bgColor="bg-orange-500/10"
              title="Headline Ideas"
              count={cleanHeadlines.length}
              isOpen={openSections.headlines}
              onToggle={() => toggleSection('headlines')}
            >
              <div className="space-y-2">
                {cleanHeadlines.slice(0, 3).map((item, i) => (
                  <div 
                    key={i} 
                    className="p-2 bg-white/5 border border-white/10 rounded-md"
                  >
                    <p className="text-xs text-white font-medium">"{item.formula}"</p>
                    {item.example && (
                      <p className="mt-1 text-[10px] text-orange-400/80 italic">
                        Example: {item.example}
                      </p>
                    )}
                    <button 
                      className="mt-1.5 text-[10px] text-cyan-400 hover:text-cyan-300"
                      onClick={() => navigator.clipboard.writeText(item.formula)}
                    >
                      Copy formula
                    </button>
                  </div>
                ))}
              </div>
            </CompactInsightSection>
          )}

          {/* Common Mistakes */}
          {cleanMistakes.length > 0 && (
            <CompactInsightSection
              icon={XCircle}
              iconColor="text-red-400"
              bgColor="bg-red-500/10"
              title="Avoid"
              count={cleanMistakes.length}
              isOpen={openSections.mistakes}
              onToggle={() => toggleSection('mistakes')}
            >
              <ul className="space-y-1.5">
                {cleanMistakes.slice(0, 4).map((mistake, i) => (
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
        <span className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase">Persona Insights</span>
      </div>

      {/* Primary Pain */}
      {primaryPainParsed && (
        <CompactInsightSection
          icon={AlertTriangle}
          iconColor="text-red-400"
          bgColor="bg-red-500/10"
          title="Pain Point"
          isOpen={openSections.pain}
          onToggle={() => toggleSection('pain')}
        >
          <p className="text-xs text-gray-300 leading-relaxed">
            {primaryPainParsed.main}
          </p>
          {primaryPainParsed.tip && (
            <p className="mt-1.5 text-[10px] text-gray-500 italic">
              Tip: {primaryPainParsed.tip}
            </p>
          )}
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
            {cleanText(persona.desires[0].desire)}
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
            "{cleanText(persona.objections[0].objection)}"
          </p>
          {persona.objections[0].counterArgument && (
            <div className="pl-2 border-l-2 border-cyan-500/50">
              <p className="text-xs text-cyan-300">
                {cleanText(persona.objections[0].counterArgument)}
              </p>
            </div>
          )}
        </CompactInsightSection>
      )}

      {/* Market Stats - Clean stat cards */}
      {parsedStats.length > 0 && (
        <CompactInsightSection
          icon={BarChart3}
          iconColor="text-cyan-400"
          bgColor="bg-cyan-500/10"
          title="Market Stats"
          count={parsedStats.length}
          isOpen={openSections.stats}
          onToggle={() => toggleSection('stats')}
        >
          <div className="grid grid-cols-2 gap-2">
            {parsedStats.map((stat: any, i: number) => (
              <div key={i} className="p-2 bg-white/5 border border-white/10 rounded-md text-center">
                <p className="text-sm font-bold text-cyan-400">{stat.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
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
                {cleanText(pattern)}
              </span>
            ))}
          </div>
        </CompactInsightSection>
      )}

      {/* Collapsed Sources Section */}
      {allSources.length > 0 && (
        <CompactInsightSection
          icon={Link2}
          iconColor="text-gray-500"
          bgColor="bg-gray-500/10"
          title="Sources"
          count={allSources.length}
          isOpen={openSections.sources}
          onToggle={() => toggleSection('sources')}
        >
          <ul className="space-y-1">
            {allSources.slice(0, 5).map((source: string, i: number) => (
              <li key={i} className="text-[10px] text-gray-500 truncate">
                {source}
              </li>
            ))}
          </ul>
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

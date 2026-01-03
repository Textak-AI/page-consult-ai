import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import type { IntelligenceScore, StrategicLevel, FieldScore } from '@/types/intelligenceScore';
import { CATEGORY_COLORS, LEVEL_COLORS } from '@/types/intelligenceScore';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Full category configuration for Wizard view (all fields)
const WIZARD_CATEGORIES = [
  {
    key: 'whoYouAre' as const,
    label: 'WHO YOU ARE',
    fields: [
      { key: 'industry' as const, label: 'Industry', maxPoints: 10 },
      { key: 'audience' as const, label: 'Audience', maxPoints: 10 },
      { key: 'geography' as const, label: 'Geography', maxPoints: 5 },
    ],
  },
  {
    key: 'whatYouOffer' as const,
    label: 'WHAT YOU OFFER',
    fields: [
      { key: 'valueProp' as const, label: 'Value Prop', maxPoints: 10 },
      { key: 'edge' as const, label: 'Edge', maxPoints: 10 },
      { key: 'method' as const, label: 'Method', maxPoints: 5 },
    ],
  },
  {
    key: 'buyerReality' as const,
    label: 'BUYER REALITY',
    fields: [
      { key: 'painPoints' as const, label: 'Pain Points', maxPoints: 10 },
      { key: 'objections' as const, label: 'Objections', maxPoints: 10 },
      { key: 'triggers' as const, label: 'Triggers', maxPoints: 5 },
    ],
  },
  {
    key: 'proofCredibility' as const,
    label: 'PROOF & CREDIBILITY',
    fields: [
      { key: 'results' as const, label: 'Results', maxPoints: 10 },
      { key: 'socialProof' as const, label: 'Social Proof', maxPoints: 10 },
      { key: 'credentials' as const, label: 'Credentials', maxPoints: 5 },
    ],
  },
];

const LEVEL_CONFIG: Record<StrategicLevel, { label: string; sublabel?: string }> = {
  unqualified: { label: 'GETTING STARTED' },
  identified: { label: 'IDENTIFIED' },
  positioned: { label: 'POSITIONED', sublabel: 'Trial Ready' },
  armed: { label: 'ARMED', sublabel: 'Generate Ready' },
  proven: { label: 'PROVEN', sublabel: 'Premium Ready' },
};

interface Props {
  score: IntelligenceScore;
  nextPrompt?: string | null;
  isThinking?: boolean;
  className?: string;
  showDemoImportBadge?: boolean;
}

export function IntelligenceProfileWizard({
  score,
  nextPrompt,
  isThinking = false,
  className,
  showDemoImportBadge = false,
}: Props) {
  const levelConfig = LEVEL_CONFIG[score.level];
  const levelColors = LEVEL_COLORS[score.level];
  
  // Track expanded categories (auto-expand ones with content)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    WIZARD_CATEGORIES.forEach(cat => {
      if (score[cat.key].total > 0) {
        initial.add(cat.key);
      }
    });
    return initial;
  });
  
  // Track previous score for animations
  const prevScoreRef = useRef(score.totalScore);
  const [animatingFields, setAnimatingFields] = useState<Set<string>>(new Set());
  
  // Auto-expand categories when they get content
  useEffect(() => {
    WIZARD_CATEGORIES.forEach(cat => {
      if (score[cat.key].total > 0 && !expandedCategories.has(cat.key)) {
        setExpandedCategories(prev => new Set([...prev, cat.key]));
      }
    });
  }, [score]);
  
  // Detect field changes for animations
  useEffect(() => {
    if (prevScoreRef.current !== score.totalScore) {
      const newAnimating = new Set<string>();
      
      WIZARD_CATEGORIES.forEach(cat => {
        const category = score[cat.key];
        cat.fields.forEach(field => {
          const fieldData = category[field.key] as FieldScore;
          if (fieldData.value) {
            newAnimating.add(`${cat.key}-${field.key}`);
          }
        });
      });
      
      setAnimatingFields(newAnimating);
      setTimeout(() => setAnimatingFields(new Set()), 600);
      
      prevScoreRef.current = score.totalScore;
    }
  }, [score]);
  
  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };
  
  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "rounded-xl border overflow-hidden",
          "bg-slate-900/60 backdrop-blur-xl",
          levelColors.border,
          className
        )}
      >
        <div className="flex flex-col p-3 w-full">
          {/* Header */}
          <div className="flex-shrink-0 mb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-light tracking-wide text-white">
                Intelligence Profile
              </h2>
              <motion.span
                key={score.totalScore}
                initial={{ scale: 1.2, color: 'rgb(34, 211, 238)' }}
                animate={{ scale: 1, color: 'rgb(148, 163, 184)' }}
                className="text-sm font-mono"
              >
                {score.totalScore}/100
              </motion.span>
            </div>
            
            {/* Total Progress Bar */}
            <div className="mt-2 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full bg-gradient-to-r", levelColors.gradient)}
                initial={{ width: 0 }}
                animate={{ width: `${score.totalPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            
            {/* Level Badge */}
            <div className="flex items-center gap-2 mt-2">
              <span className={cn("text-[10px] font-medium tracking-wider", levelColors.text)}>
                {levelConfig.label}
              </span>
              {levelConfig.sublabel && (
                <span className="text-[10px] text-slate-500">— {levelConfig.sublabel}</span>
              )}
              {showDemoImportBadge && (
                <span className="text-[9px] text-cyan-400/70 bg-cyan-500/10 px-1.5 py-0.5 rounded-full ml-auto">
                  Demo imported
                </span>
              )}
            </div>
          </div>
          
          {/* Categories */}
          <div className="flex-1 space-y-1">
            {WIZARD_CATEGORIES.map((cat) => {
              const category = score[cat.key];
              const catColors = CATEGORY_COLORS[cat.key];
              const isExpanded = expandedCategories.has(cat.key);
              const hasContent = category.total > 0;
              
              return (
                <div key={cat.key}>
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(cat.key)}
                    className="w-full flex items-center justify-between py-1.5 hover:bg-slate-800/30 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className={cn(
                          "w-3 h-3 -rotate-90",
                          hasContent ? "text-slate-400" : "text-slate-600"
                        )} />
                      </motion.div>
                      <span className={cn(
                        "text-[10px] uppercase tracking-wider",
                        hasContent ? "text-slate-400" : "text-slate-600"
                      )}>
                        {cat.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-mono",
                        hasContent ? catColors.text : "text-slate-600"
                      )}>
                        {category.total}/{category.maxPoints}
                      </span>
                    </div>
                  </button>
                  
                  {/* Progress Bar */}
                  <div className="h-0.5 bg-slate-700/30 rounded-full overflow-hidden mb-1">
                    <motion.div
                      className={cn("h-full rounded-full bg-gradient-to-r", catColors.gradient)}
                      initial={{ width: 0 }}
                      animate={{ width: `${category.percentage}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                  
                  {/* Fields - Expanded */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pl-5 space-y-0.5"
                      >
                        {cat.fields.map(({ key: fieldKey, label, maxPoints }) => {
                          const fieldData = category[fieldKey] as FieldScore;
                          const hasValue = !!fieldData.value;
                          const isAnimating = animatingFields.has(`${cat.key}-${fieldKey}`);
                          
                          const fieldContent = (
                            <div className="flex items-start gap-2 py-0.5 group">
                              {/* Vertical bar indicator */}
                              <motion.div
                                className={cn(
                                  "w-0.5 h-4 rounded-full flex-shrink-0 mt-0.5 transition-all duration-300",
                                  hasValue
                                    ? `bg-gradient-to-b ${catColors.gradient}`
                                    : isThinking ? "bg-slate-600" : "bg-slate-700"
                                )}
                                animate={{
                                  scaleY: isAnimating ? [1, 1.3, 1] : 1,
                                  opacity: isThinking && !hasValue ? [0.5, 0.8, 0.5] : 1,
                                }}
                                transition={{
                                  scaleY: { duration: 0.4 },
                                  opacity: { duration: 1.5, repeat: Infinity },
                                }}
                              />
                              
                              {/* Label */}
                              <span className={cn(
                                "text-[10px] min-w-[60px] flex-shrink-0",
                                hasValue ? "text-slate-400" : "text-slate-600"
                              )}>
                                {label}
                              </span>
                              
                              {/* Value or points */}
                              {hasValue ? (
                                <div className="flex-1 flex items-center gap-1 min-w-0">
                                  <span className={cn(
                                    "text-[10px] truncate",
                                    catColors.text
                                  )}>
                                    {fieldData.value}
                                  </span>
                                  <span className="text-[9px] text-slate-600 flex-shrink-0 ml-auto">
                                    {fieldData.points} pts
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[9px] text-slate-600 ml-auto">
                                  0/{maxPoints} pts
                                </span>
                              )}
                            </div>
                          );
                          
                          // Wrap with tooltip if has summary
                          if (hasValue && fieldData.summary) {
                            return (
                              <Tooltip key={fieldKey}>
                                <TooltipTrigger asChild>
                                  <div className="cursor-help">{fieldContent}</div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="left"
                                  className="max-w-[220px] bg-slate-900 border-slate-700 text-slate-200 p-2"
                                >
                                  <p className="text-[10px] leading-relaxed">{fieldData.summary}</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          }
                          
                          return <div key={fieldKey}>{fieldContent}</div>;
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          
          {/* Next Prompt */}
          {nextPrompt && score.level !== 'proven' && (
            <div className="flex-shrink-0 pt-2 mt-2 border-t border-slate-800/30">
              <div className="flex items-start gap-2 text-[10px]">
                <span className="text-cyan-400 flex-shrink-0">🎯</span>
                <span className="text-slate-500">
                  Next: <span className="text-slate-400">{nextPrompt}</span>
                </span>
              </div>
            </div>
          )}
          
          {/* Ready indicator */}
          {score.level === 'proven' && (
            <div className="flex-shrink-0 pt-2 mt-2 border-t border-slate-800/30">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-amber-400">✨</span>
                <span className="text-amber-400/80">Ready to generate premium page!</span>
              </div>
            </div>
          )}
          
          {score.level === 'armed' && (
            <div className="flex-shrink-0 pt-2 mt-2 border-t border-slate-800/30">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-purple-400">⚡</span>
                <span className="text-purple-400/80">Ready to generate page!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default IntelligenceProfileWizard;

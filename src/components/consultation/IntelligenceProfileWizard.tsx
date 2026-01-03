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
          "h-full flex flex-col max-h-[calc(100vh-120px)] rounded-xl border overflow-hidden",
          "bg-slate-900/60 backdrop-blur-xl",
          levelColors.border,
          className
        )}
      >
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 p-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium tracking-wide text-white">
              Intelligence Profile
            </h2>
            <motion.span
              key={score.totalScore}
              initial={{ scale: 1.2, color: 'rgb(34, 211, 238)' }}
              animate={{ scale: 1, color: 'rgb(148, 163, 184)' }}
              className="text-base font-mono"
            >
              {score.totalScore}/100
            </motion.span>
          </div>
          
          {/* Total Progress Bar */}
          <div className="mt-3 h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full bg-gradient-to-r", levelColors.gradient)}
              initial={{ width: 0 }}
              animate={{ width: `${score.totalPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          
          {/* Level Badge */}
          <div className="flex items-center gap-2 mt-3">
            <span className={cn("text-xs font-medium tracking-wider", levelColors.text)}>
              {levelConfig.label}
            </span>
            {levelConfig.sublabel && (
              <span className="text-xs text-slate-500">— {levelConfig.sublabel}</span>
            )}
            {showDemoImportBadge && (
              <span className="text-[10px] text-cyan-400/70 bg-cyan-500/10 px-2 py-0.5 rounded-full ml-auto">
                Demo imported
              </span>
            )}
          </div>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                  className="w-full flex items-center justify-between py-2 hover:bg-slate-800/30 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className={cn(
                        "w-4 h-4 -rotate-90",
                        hasContent ? "text-slate-400" : "text-slate-600"
                      )} />
                    </motion.div>
                    <span className={cn(
                      "text-sm uppercase tracking-wider font-medium",
                      hasContent ? "text-slate-300" : "text-slate-600"
                    )}>
                      {cat.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-mono",
                      hasContent ? catColors.text : "text-slate-600"
                    )}>
                      {category.total}/{category.maxPoints}
                    </span>
                  </div>
                </button>
                
                {/* Progress Bar */}
                <div className="h-1 bg-slate-700/30 rounded-full overflow-hidden mb-2">
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
                      className="overflow-hidden pl-6 space-y-3"
                    >
                      {cat.fields.map(({ key: fieldKey, label, maxPoints }) => {
                        const fieldData = category[fieldKey] as FieldScore;
                        const hasValue = !!fieldData.value;
                        const isAnimating = animatingFields.has(`${cat.key}-${fieldKey}`);
                        
                        return (
                          <div key={fieldKey} className="py-1">
                            {/* Field header row */}
                            <div className="flex items-center gap-3">
                              {/* Vertical bar indicator */}
                              <motion.div
                                className={cn(
                                  "w-1 h-5 rounded-full flex-shrink-0 transition-all duration-300",
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
                                "text-sm font-medium",
                                hasValue ? "text-slate-300" : "text-slate-500"
                              )}>
                                {label}
                              </span>
                              
                              {/* Points */}
                              <span className="text-xs text-slate-600 ml-auto flex-shrink-0">
                                {hasValue ? `${fieldData.points} pts` : `0/${maxPoints} pts`}
                              </span>
                            </div>
                            
                            {/* Value and Summary - full width, wrapping */}
                            {hasValue && (
                              <div className="mt-1.5 pl-4">
                                <p className={cn(
                                  "text-sm leading-relaxed",
                                  catColors.text
                                )}>
                                  {fieldData.value}
                                </p>
                                {fieldData.summary && (
                                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                                    {fieldData.summary}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        
        {/* Footer - Fixed at bottom */}
        {(nextPrompt || score.level === 'proven' || score.level === 'armed') && (
          <div className="flex-shrink-0 p-4 border-t border-slate-800/50">
            {nextPrompt && score.level !== 'proven' && score.level !== 'armed' && (
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 flex-shrink-0 text-base">🎯</span>
                <span className="text-sm text-slate-500">
                  Next: <span className="text-slate-300">{nextPrompt}</span>
                </span>
              </div>
            )}
            
            {score.level === 'proven' && (
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-base">✨</span>
                <span className="text-sm text-amber-400/80">Ready to generate premium page!</span>
              </div>
            )}
            
            {score.level === 'armed' && (
              <div className="flex items-center gap-2">
                <span className="text-purple-400 text-base">⚡</span>
                <span className="text-sm text-purple-400/80">Ready to generate page!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export default IntelligenceProfileWizard;

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { IntelligenceScore, StrategicLevel, FieldScore } from '@/types/intelligenceScore';
import { CATEGORY_COLORS, LEVEL_COLORS } from '@/types/intelligenceScore';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Category configuration for Demo view (only key fields)
const DEMO_CATEGORIES = [
  {
    key: 'whoYouAre' as const,
    label: 'Who You Are',
    fields: [
      { key: 'industry' as const, label: 'Industry' },
      { key: 'audience' as const, label: 'Audience' },
    ],
  },
  {
    key: 'whatYouOffer' as const,
    label: 'What You Offer',
    fields: [
      { key: 'valueProp' as const, label: 'Value Prop' },
      { key: 'edge' as const, label: 'Edge' },
    ],
  },
  {
    key: 'buyerReality' as const,
    label: 'Buyer Reality',
    fields: [
      { key: 'painPoints' as const, label: 'Pain Points' },
      { key: 'objections' as const, label: 'Objections' },
    ],
  },
  {
    key: 'proofCredibility' as const,
    label: 'Proof & Credibility',
    fields: [
      { key: 'results' as const, label: 'Results' },
      { key: 'socialProof' as const, label: 'Social Proof' },
    ],
  },
];

const LEVEL_CONFIG: Record<StrategicLevel, { label: string; sublabel?: string }> = {
  unqualified: { label: 'GETTING STARTED' },
  identified: { label: 'IDENTIFIED' },
  positioned: { label: 'POSITIONED', sublabel: 'Trial Unlocked' },
  armed: { label: 'ARMED', sublabel: 'Generate Ready' },
  proven: { label: 'PROVEN', sublabel: 'Premium Ready' },
};

interface Props {
  score: IntelligenceScore;
  onContinue?: () => void;
  onKeepChatting?: () => void;
  isThinking?: boolean;
  className?: string;
}

export function IntelligenceProfileDemo({
  score,
  onContinue,
  onKeepChatting,
  isThinking = false,
  className,
}: Props) {
  const levelConfig = LEVEL_CONFIG[score.level];
  const levelColors = LEVEL_COLORS[score.level];
  
  // Mobile collapsed state
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Track previous score for animations
  const prevScoreRef = useRef(score.totalScore);
  const [animatingFields, setAnimatingFields] = useState<Set<string>>(new Set());
  
  // Detect field changes for animations
  useEffect(() => {
    if (prevScoreRef.current !== score.totalScore) {
      // Find newly filled fields
      const newAnimating = new Set<string>();
      
      DEMO_CATEGORIES.forEach(cat => {
        const category = score[cat.key];
        cat.fields.forEach(field => {
          const fieldData = category[field.key] as FieldScore;
          if (fieldData.value) {
            newAnimating.add(`${cat.key}-${field.key}`);
          }
        });
      });
      
      setAnimatingFields(newAnimating);
      
      // Clear animation state after delay
      setTimeout(() => setAnimatingFields(new Set()), 600);
      
      prevScoreRef.current = score.totalScore;
    }
  }, [score]);
  
  const showCTA = score.level !== 'unqualified';
  
  // Get filled fields count for mobile header
  const filledCount = DEMO_CATEGORIES.reduce((acc, cat) => {
    const category = score[cat.key];
    return acc + cat.fields.filter(f => (category[f.key] as FieldScore).value).length;
  }, 0);
  const totalFields = DEMO_CATEGORIES.reduce((acc, cat) => acc + cat.fields.length, 0);
  
  return (
    <TooltipProvider delayDuration={200}>
      {/* Desktop Layout (lg+) */}
      <div
        className={cn(
          "hidden lg:flex flex-col rounded-xl border overflow-hidden",
          "bg-slate-900/40 backdrop-blur-xl",
          "h-full max-h-[calc(100vh-120px)]",
          levelColors.border,
          className
        )}
      >
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 p-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-light tracking-wide text-white">
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
          <motion.p
            key={score.level}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("text-xs mt-2 font-medium tracking-wider", levelColors.text)}
          >
            {levelConfig.label}
            {levelConfig.sublabel && (
              <span className="font-normal opacity-80"> — {levelConfig.sublabel}</span>
            )}
          </motion.p>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {DEMO_CATEGORIES.map((cat) => {
            const category = score[cat.key];
            const catColors = CATEGORY_COLORS[cat.key];
            
            return (
              <div key={cat.key} className="space-y-1">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono">
                    {category.total}/{category.maxPoints}
                  </span>
                </div>
                
                {/* Category Progress */}
                <div className="h-1 bg-slate-700/30 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full bg-gradient-to-r", catColors.gradient)}
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
                
                {/* Fields */}
                <div className="space-y-0.5">
                  {cat.fields.map((field) => {
                    const fieldData = category[field.key] as FieldScore;
                    const hasValue = !!fieldData.value;
                    const isAnimating = animatingFields.has(`${cat.key}-${field.key}`);
                    
                    const fieldContent = (
                      <div className="flex items-center gap-2 py-0.5 group">
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
                            scaleY: { duration: 0.4, ease: 'easeOut' },
                            opacity: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                          }}
                        />
                        
                        {/* Label */}
                        <span className={cn(
                          "text-xs min-w-[70px] flex-shrink-0 transition-colors",
                          hasValue ? "text-slate-300" : "text-slate-600"
                        )}>
                          {field.label}
                        </span>
                        
                        {/* Value */}
                        <AnimatePresence mode="wait">
                          {hasValue && (
                            <motion.span
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -5 }}
                              className={cn(
                                "text-xs truncate max-w-[120px] ml-auto",
                                catColors.text
                              )}
                            >
                              {fieldData.value}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                    
                    // Wrap with tooltip if has summary
                    if (hasValue && fieldData.summary) {
                      return (
                        <Tooltip key={field.key}>
                          <TooltipTrigger asChild>
                            <div className="cursor-help">{fieldContent}</div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="left"
                            className="max-w-[250px] bg-slate-900 border-slate-700 text-slate-200 p-3"
                          >
                            <p className="text-xs leading-relaxed">{fieldData.summary}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }
                    
                    return <div key={field.key}>{fieldContent}</div>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-slate-800/50">
          {/* Gate generation behind score >= 70 (armed level) */}
          {score.totalScore >= 70 && onContinue ? (
            <div className="space-y-2">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onContinue}
                className={cn(
                  "w-full py-2.5 rounded-lg text-xs font-medium transition-all",
                  score.level === 'proven'
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400"
                    : "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                )}
              >
                {score.level === 'proven' ? '⭐ Generate Premium Page' : 'Generate Page →'}
              </motion.button>
              
              {onKeepChatting && (
                <button
                  onClick={onKeepChatting}
                  className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-400 transition-colors"
                >
                  Keep Chatting
                </button>
              )}
            </div>
          ) : showCTA ? (
            <div className="space-y-2">
              {/* Show progress toward generation */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Generation unlocks at 70</span>
                <span className="text-cyan-400 font-mono">{score.totalScore}/70</span>
              </div>
              <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (score.totalScore / 70) * 100)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-slate-500 text-center">
                Share more to unlock page generation
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-600 text-center">
              Share more to unlock
            </p>
          )}
        </div>
      </div>

      {/* Tablet Layout (md to lg) - Horizontal bar */}
      <div
        className={cn(
          "hidden md:flex lg:hidden flex-col rounded-xl border overflow-hidden",
          "bg-slate-900/40 backdrop-blur-xl p-4",
          levelColors.border,
          className
        )}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-light tracking-wide text-white">Intelligence Profile</h2>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-medium tracking-wider", levelColors.text)}>
                {levelConfig.label}
              </span>
              <span className="text-xs text-slate-500">• {score.totalScore}/100</span>
            </div>
          </div>
          {score.totalScore >= 70 && onContinue ? (
            <button
              onClick={onContinue}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-medium transition-all",
                score.level === 'proven'
                  ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400"
                  : "bg-purple-500/10 border border-purple-500/30 text-purple-400"
              )}
            >
              Generate Page →
            </button>
          ) : showCTA && (
            <span className="text-xs text-slate-500">
              {score.totalScore}/70 to unlock
            </span>
          )}
        </div>
        
        {/* Horizontal captured fields */}
        <div className="flex flex-wrap gap-3">
          {DEMO_CATEGORIES.map(cat => {
            const category = score[cat.key];
            const catColors = CATEGORY_COLORS[cat.key];
            
            return cat.fields.map(field => {
              const fieldData = category[field.key] as FieldScore;
              if (!fieldData.value) return null;
              
              return (
                <Tooltip key={`${cat.key}-${field.key}`}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-help">
                      <div className={cn("w-1 h-5 rounded-full bg-gradient-to-b flex-shrink-0", catColors.gradient)} />
                      <span className="text-slate-400 text-xs">{field.label}:</span>
                      <span className={cn("text-xs truncate max-w-[100px]", catColors.text)}>
                        {fieldData.value}
                      </span>
                    </div>
                  </TooltipTrigger>
                  {fieldData.summary && (
                    <TooltipContent className="max-w-[250px] bg-slate-900 border-slate-700 text-slate-200 p-3">
                      <p className="text-xs leading-relaxed">{fieldData.summary}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            });
          })}
          {filledCount === 0 && (
            <p className="text-xs text-slate-600">Share about your business to see insights...</p>
          )}
        </div>
      </div>

      {/* Mobile Layout (<md) - Collapsible card */}
      <div
        className={cn(
          "flex md:hidden flex-col rounded-xl border overflow-hidden",
          "bg-slate-900/40 backdrop-blur-xl",
          levelColors.border,
          className
        )}
      >
        {/* Collapsed header - always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between p-4 w-full text-left"
        >
          <div className="flex items-center gap-3">
            <div className={cn("w-1 h-8 rounded-full bg-gradient-to-b", levelColors.gradient)} />
            <div>
              <h2 className="text-sm font-light tracking-wide text-white">Intelligence Profile</h2>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-medium tracking-wider", levelColors.text)}>
                  {levelConfig.label}
                </span>
                <span className="text-xs text-slate-500">• {filledCount}/{totalFields} captured</span>
              </div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </motion.div>
        </button>
        
        {/* Expandable content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                {DEMO_CATEGORIES.map(cat => {
                  const category = score[cat.key];
                  const catColors = CATEGORY_COLORS[cat.key];
                  
                  return (
                    <div key={cat.key} className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {cat.label}
                      </span>
                      {cat.fields.map(field => {
                        const fieldData = category[field.key] as FieldScore;
                        const hasValue = !!fieldData.value;
                        
                        return (
                          <div key={field.key} className="flex items-center gap-2">
                            <div className={cn(
                              "w-1 h-5 rounded-full flex-shrink-0",
                              hasValue ? `bg-gradient-to-b ${catColors.gradient}` : "bg-slate-700"
                            )} />
                            <span className={cn(
                              "text-xs min-w-[70px]",
                              hasValue ? "text-slate-300" : "text-slate-600"
                            )}>
                              {field.label}
                            </span>
                            {hasValue && (
                              <span className={cn("text-xs truncate ml-auto", catColors.text)}>
                                {fieldData.value}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                
                {/* Mobile CTA */}
                {showCTA && onContinue && (
                  <button
                    onClick={onContinue}
                    className={cn(
                      "w-full py-2.5 rounded-lg text-xs font-medium mt-2",
                      levelColors.bg,
                      levelColors.border,
                      "border",
                      levelColors.text
                    )}
                  >
                    Continue →
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

export default IntelligenceProfileDemo;

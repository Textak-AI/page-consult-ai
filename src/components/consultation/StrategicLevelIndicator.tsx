import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { StrategicLevel } from '@/types/strategicLevels';
import type { LevelCheckResult } from '@/types/strategicLevels';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Category definitions matching the ExtractedIntelligence type fields
const CATEGORIES = [
  { key: 'industry', summaryKey: 'industrySummary', label: 'Industry' },
  { key: 'audience', summaryKey: 'audienceSummary', label: 'Audience' },
  { key: 'valueProp', summaryKey: 'valuePropSummary', label: 'Value Proposition' },
  { key: 'competitorDifferentiation', summaryKey: 'edgeSummary', label: 'Competitive Edge' },
  { key: 'painPoints', summaryKey: 'painSummary', label: 'Pain Points' },
  { key: 'buyerObjections', summaryKey: 'objectionsSummary', label: 'Buyer Objections' },
  { key: 'proofElements', summaryKey: 'proofSummary', label: 'Proof Elements' },
];

// Level-based styling
const LEVEL_STYLES: Record<StrategicLevel, {
  gradient: string;
  text: string;
  border: string;
  label: string;
  sublabel?: string;
}> = {
  unqualified: {
    gradient: 'from-slate-400 to-slate-600',
    text: 'text-slate-400',
    border: 'border-slate-800/50',
    label: 'Getting Started',
  },
  identified: {
    gradient: 'from-blue-400 to-blue-600',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    label: 'IDENTIFIED',
  },
  positioned: {
    gradient: 'from-green-400 to-emerald-600',
    text: 'text-green-400',
    border: 'border-green-500/20',
    label: 'POSITIONED',
    sublabel: 'Trial Unlocked',
  },
  armed: {
    gradient: 'from-purple-400 to-violet-600',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
    label: 'ARMED',
    sublabel: 'Generate Ready',
  },
  proven: {
    gradient: 'from-amber-400 to-orange-500',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    label: '⭐ PROVEN',
    sublabel: 'Maximum Arsenal',
  },
};

const STAGGER_DELAY_MS = 150;
const INITIAL_DELAY_MS = 300;

interface FieldData {
  value: string;
  summary?: string;
}

interface Props {
  result: LevelCheckResult;
  onContinue?: () => void;
  onKeepChatting?: () => void;
  isThinking?: boolean;
  className?: string;
}

export function StrategicLevelIndicator({ 
  result, 
  onContinue, 
  onKeepChatting,
  isThinking = false, 
  className 
}: Props) {
  const { currentLevel, capturedFields } = result;
  
  // Mobile collapsed state
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Track displayed state with staggered updates
  const prevCapturedRef = useRef<Set<string>>(new Set());
  const [displayedFields, setDisplayedFields] = useState<Map<string, FieldData>>(new Map());
  const [animatingFields, setAnimatingFields] = useState<Map<string, number>>(new Map());
  const [displayLevel, setDisplayLevel] = useState<StrategicLevel>(currentLevel);
  
  // Count captured fields
  const capturedCount = displayedFields.size;
  const totalFields = CATEGORIES.length;
  
  // Detect newly captured fields and animate them with stagger
  useEffect(() => {
    const currentCapturedMap = new Map<string, FieldData>();
    capturedFields.forEach(({ field, value, summary }) => {
      currentCapturedMap.set(field, { value, summary });
    });
    
    const newCaptures: Array<{ field: string; value: string; summary?: string }> = [];
    
    currentCapturedMap.forEach((data, field) => {
      if (!prevCapturedRef.current.has(field)) {
        newCaptures.push({ field, value: data.value, summary: data.summary });
      }
    });
    
    if (newCaptures.length > 0) {
      const staggerMap = new Map<string, number>();
      newCaptures.forEach((capture, index) => {
        staggerMap.set(capture.field, index);
      });
      setAnimatingFields(staggerMap);
      
      newCaptures.forEach((capture, index) => {
        setTimeout(() => {
          setDisplayedFields(prev => {
            const updated = new Map(prev);
            updated.set(capture.field, { value: capture.value, summary: capture.summary });
            return updated;
          });
          
          setTimeout(() => {
            setAnimatingFields(prev => {
              const updated = new Map(prev);
              updated.delete(capture.field);
              return updated;
            });
          }, 500);
          
        }, INITIAL_DELAY_MS + (index * STAGGER_DELAY_MS));
      });
      
      const totalAnimationTime = INITIAL_DELAY_MS + (newCaptures.length * STAGGER_DELAY_MS) + 500;
      setTimeout(() => {
        setDisplayLevel(currentLevel);
      }, totalAnimationTime);
      
    } else {
      setDisplayedFields(currentCapturedMap);
      setDisplayLevel(currentLevel);
    }
    
    prevCapturedRef.current = new Set(currentCapturedMap.keys());
  }, [capturedFields, currentLevel]);
  
  const displayStyles = LEVEL_STYLES[displayLevel];
  const currentStyles = LEVEL_STYLES[currentLevel];
  
  const showCTA = result.canUnlock('trial_signup') || 
                  result.canUnlock('page_generation') || 
                  result.canUnlock('premium_generation');

  // Get only captured fields for tablet/mobile display
  const capturedFieldsList = CATEGORIES.filter(cat => displayedFields.has(cat.key));
  
  return (
    <TooltipProvider delayDuration={200}>
      {/* Desktop Layout (lg+) */}
      <div
        className={cn(
          "hidden lg:flex rounded-xl border overflow-hidden",
          "bg-slate-900/40 backdrop-blur-xl",
          displayStyles.border,
          className
        )}
      >
        <div className="h-full flex flex-col p-4 w-full">
          {/* Header */}
          <div className="flex-shrink-0 mb-4">
            <h2 className="text-base font-light tracking-wide text-white">
              Intelligence Profile
            </h2>
            <motion.p 
              key={displayLevel}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn("text-xs mt-0.5 font-medium tracking-wider", displayStyles.text)}
            >
              {displayStyles.label}
              {displayStyles.sublabel && (
                <span className="font-normal opacity-80"> — {displayStyles.sublabel}</span>
              )}
            </motion.p>
          </div>
          
          {/* Category Bars */}
          <div className="flex-1 flex flex-col justify-evenly min-h-0">
            {CATEGORIES.map((category) => {
              const fieldData = displayedFields.get(category.key);
              const isCaptured = !!fieldData?.value;
              const isAnimating = animatingFields.has(category.key);
              
              const rowContent = (
                <div
                  className={cn(
                    "flex items-center gap-2 py-1 rounded-md transition-colors",
                    isCaptured && fieldData?.summary && "cursor-help"
                  )}
                >
                  <motion.div 
                    className={cn(
                      "w-1 h-8 rounded-full flex-shrink-0 transition-all duration-500",
                      isCaptured 
                        ? `bg-gradient-to-b ${currentStyles.gradient}` 
                        : isThinking ? "bg-slate-600" : "bg-slate-700"
                    )}
                    animate={{
                      scaleY: isAnimating ? [1, 1.2, 1] : 1,
                      opacity: isThinking && !isCaptured ? [0.5, 0.8, 0.5] : 1,
                    }}
                    transition={{
                      scaleY: { duration: 0.4, ease: "easeOut" },
                      opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                    }}
                  />
                  
                  <span 
                    className={cn(
                      "text-xs truncate transition-colors duration-500 min-w-[80px]",
                      isCaptured ? "text-slate-300" : "text-slate-600"
                    )}
                  >
                    {category.label}
                  </span>
                  
                  <AnimatePresence mode="wait">
                    {isCaptured && fieldData?.value && fieldData.value !== 'null' && (
                      <motion.span
                        key={`${category.key}-${fieldData.value}`}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          "text-xs ml-auto text-right line-clamp-2 max-w-[140px]",
                          currentStyles.text
                        )}
                      >
                        {fieldData.value}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              );
              
              if (isCaptured && fieldData?.summary) {
                return (
                  <Tooltip key={category.key}>
                    <TooltipTrigger asChild>{rowContent}</TooltipTrigger>
                    <TooltipContent 
                      side="left" 
                      className="max-w-[250px] bg-slate-900 border-slate-700 text-slate-200 p-3"
                    >
                      <p className="text-xs leading-relaxed">{fieldData.summary}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }
              
              return <div key={category.key}>{rowContent}</div>;
            })}
          </div>
          
          {/* CTA Section */}
          <div className="flex-shrink-0 pt-4 mt-4 border-t border-slate-800/30">
            {showCTA && onContinue ? (
              <div className="space-y-2">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={onContinue}
                  className={cn(
                    "w-full py-2.5 rounded-lg text-xs font-medium transition-all",
                    result.canUnlock('premium_generation')
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400"
                      : result.canUnlock('page_generation')
                        ? "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                        : "bg-green-500/10 border border-green-500/30 text-green-400"
                  )}
                >
                  {result.canUnlock('premium_generation') 
                    ? '⭐ Generate Premium Page' 
                    : result.canUnlock('page_generation')
                      ? 'Generate Page →'
                      : 'Continue →'}
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
            ) : (
              <p className="text-xs text-slate-600 text-center">
                Share more to unlock
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tablet Layout (md to lg) - Horizontal bar */}
      <div
        className={cn(
          "hidden md:flex lg:hidden flex-col rounded-xl border overflow-hidden",
          "bg-slate-900/40 backdrop-blur-xl p-4",
          displayStyles.border,
          className
        )}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-light tracking-wide text-white">Intelligence Profile</h2>
            <span className={cn("text-xs font-medium tracking-wider", displayStyles.text)}>
              {displayStyles.label}
            </span>
          </div>
          {showCTA && onContinue && (
            <button
              onClick={onContinue}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-medium transition-all",
                result.canUnlock('premium_generation')
                  ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400"
                  : result.canUnlock('page_generation')
                    ? "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                    : "bg-green-500/10 border border-green-500/30 text-green-400"
              )}
            >
              Continue →
            </button>
          )}
        </div>
        
        {/* Horizontal captured fields */}
        <div className="flex flex-wrap gap-3">
          {capturedFieldsList.length > 0 ? (
            capturedFieldsList.map((category) => {
              const fieldData = displayedFields.get(category.key);
              if (!fieldData?.value || fieldData.value === 'null') return null;
              
              return (
                <Tooltip key={category.key}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-help">
                      <div className={cn("w-1 h-6 rounded-full bg-gradient-to-b", currentStyles.gradient)} />
                      <span className="text-slate-400 text-xs">{category.label}:</span>
                      <span className={cn("text-xs line-clamp-2", currentStyles.text)}>{fieldData.value}</span>
                    </div>
                  </TooltipTrigger>
                  {fieldData.summary && (
                    <TooltipContent className="max-w-[250px] bg-slate-900 border-slate-700 text-slate-200 p-3">
                      <p className="text-xs leading-relaxed">{fieldData.summary}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })
          ) : (
            <p className="text-xs text-slate-600">Share about your business to see insights...</p>
          )}
        </div>
      </div>

      {/* Mobile Layout (<md) - Collapsible card */}
      <div
        className={cn(
          "flex md:hidden flex-col rounded-xl border overflow-hidden",
          "bg-slate-900/40 backdrop-blur-xl",
          displayStyles.border,
          className
        )}
      >
        {/* Collapsed header - always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between p-4 w-full text-left"
        >
          <div className="flex items-center gap-3">
            <div className={cn("w-1 h-8 rounded-full bg-gradient-to-b", currentStyles.gradient)} />
            <div>
              <h2 className="text-sm font-light tracking-wide text-white">Intelligence Profile</h2>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-medium tracking-wider", displayStyles.text)}>
                  {displayStyles.label}
                </span>
                <span className="text-xs text-slate-500">• {capturedCount}/{totalFields} captured</span>
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
              <div className="px-4 pb-4 space-y-2">
                {CATEGORIES.map((category) => {
                  const fieldData = displayedFields.get(category.key);
                  const isCaptured = !!fieldData?.value;
                  
                  return (
                    <div key={category.key} className="flex items-center gap-2">
                      <div 
                        className={cn(
                          "w-1 h-6 rounded-full flex-shrink-0 transition-all duration-500",
                          isCaptured 
                            ? `bg-gradient-to-b ${currentStyles.gradient}` 
                            : "bg-slate-700"
                        )}
                      />
                      <span 
                        className={cn(
                          "text-xs transition-colors duration-500 min-w-[90px]",
                          isCaptured ? "text-slate-300" : "text-slate-600"
                        )}
                      >
                        {category.label}
                      </span>
                      {isCaptured && fieldData?.value && fieldData.value !== 'null' && (
                        <span className={cn("text-xs ml-auto text-right line-clamp-2 max-w-[120px]", currentStyles.text)}>
                          {fieldData.value}
                        </span>
                      )}
                    </div>
                  );
                })}
                
                {/* Mobile CTA */}
                {showCTA && onContinue && (
                  <button
                    onClick={onContinue}
                    className={cn(
                      "w-full mt-3 py-2.5 rounded-lg text-xs font-medium transition-all",
                      result.canUnlock('premium_generation')
                        ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400"
                        : result.canUnlock('page_generation')
                          ? "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                          : "bg-green-500/10 border border-green-500/30 text-green-400"
                    )}
                  >
                    {result.canUnlock('premium_generation') 
                      ? '⭐ Generate Premium Page' 
                      : result.canUnlock('page_generation')
                        ? 'Generate Page →'
                        : 'Continue to Full Session →'}
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
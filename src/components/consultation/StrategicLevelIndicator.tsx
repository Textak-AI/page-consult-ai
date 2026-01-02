import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StrategicLevel } from '@/types/strategicLevels';
import type { LevelCheckResult } from '@/types/strategicLevels';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Category definitions matching the strategic level calculator fields
// Each has a key (for value), summaryKey (for tooltip), and label
const CATEGORIES = [
  { key: 'industry', summaryKey: 'industrySummary', label: 'Industry' },
  { key: 'audience', summaryKey: 'audienceSummary', label: 'Audience' },
  { key: 'valueProp', summaryKey: 'valuePropSummary', label: 'Value Proposition' },
  { key: 'competitorDifferentiator', summaryKey: 'edgeSummary', label: 'Competitive Edge' },
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

// Stagger delay between each bar animation (ms)
const STAGGER_DELAY_MS = 150;
// Initial delay before animations start (ms)
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
  
  // Track displayed state with staggered updates
  const prevCapturedRef = useRef<Set<string>>(new Set());
  const [displayedFields, setDisplayedFields] = useState<Map<string, FieldData>>(new Map());
  const [animatingFields, setAnimatingFields] = useState<Map<string, number>>(new Map()); // field -> stagger index
  const [displayLevel, setDisplayLevel] = useState<StrategicLevel>(currentLevel);
  
  // Detect newly captured fields and animate them with stagger
  useEffect(() => {
    // Build current captured map with values and summaries
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
      // Set up staggered animations
      const staggerMap = new Map<string, number>();
      newCaptures.forEach((capture, index) => {
        staggerMap.set(capture.field, index);
      });
      setAnimatingFields(staggerMap);
      
      // Apply each field with staggered timing
      newCaptures.forEach((capture, index) => {
        setTimeout(() => {
          setDisplayedFields(prev => {
            const updated = new Map(prev);
            updated.set(capture.field, { value: capture.value, summary: capture.summary });
            return updated;
          });
          
          // Remove from animating after transition completes
          setTimeout(() => {
            setAnimatingFields(prev => {
              const updated = new Map(prev);
              updated.delete(capture.field);
              return updated;
            });
          }, 500);
          
        }, INITIAL_DELAY_MS + (index * STAGGER_DELAY_MS));
      });
      
      // Update level AFTER all bars have animated
      const totalAnimationTime = INITIAL_DELAY_MS + (newCaptures.length * STAGGER_DELAY_MS) + 500;
      setTimeout(() => {
        setDisplayLevel(currentLevel);
      }, totalAnimationTime);
      
    } else {
      // No new captures, sync state
      setDisplayedFields(currentCapturedMap);
      setDisplayLevel(currentLevel);
    }
    
    prevCapturedRef.current = new Set(currentCapturedMap.keys());
  }, [capturedFields, currentLevel]);
  
  const displayStyles = LEVEL_STYLES[displayLevel];
  const currentStyles = LEVEL_STYLES[currentLevel];
  
  // Determine if CTA should show
  const showCTA = result.canUnlock('trial_signup') || 
                  result.canUnlock('page_generation') || 
                  result.canUnlock('premium_generation');
  
  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "rounded-xl border overflow-hidden",
          "bg-slate-900/40 backdrop-blur-xl",
          displayStyles.border,
          className
        )}
      >
        {/* Main flex container - fills full height */}
        <div className="h-full flex flex-col p-4">
          
          {/* Header - fixed height */}
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
          
          {/* Stacked Category Bars - fills available space with even distribution */}
          <div className="flex-1 flex flex-col justify-evenly min-h-0">
            {CATEGORIES.map((category) => {
              const fieldData = displayedFields.get(category.key);
              const isCaptured = !!fieldData?.value;
              const staggerIndex = animatingFields.get(category.key);
              const isAnimating = staggerIndex !== undefined;
              
              const rowContent = (
                <div
                  className={cn(
                    "flex items-center gap-3 py-1 rounded-md transition-colors",
                    isCaptured && fieldData?.summary && "cursor-help"
                  )}
                >
                  {/* Color band - transitions from grey to colored */}
                  <motion.div 
                    className={cn(
                      "w-1 h-10 rounded-full flex-shrink-0 transition-all duration-500",
                      isCaptured 
                        ? `bg-gradient-to-b ${currentStyles.gradient}` 
                        : isThinking
                          ? "bg-slate-600"
                          : "bg-slate-700"
                    )}
                    initial={false}
                    animate={{
                      scaleY: isAnimating ? [1, 1.2, 1] : 1,
                      opacity: isThinking && !isCaptured ? [0.5, 0.8, 0.5] : 1,
                    }}
                    transition={{
                      scaleY: { duration: 0.4, ease: "easeOut" },
                      opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                    }}
                  />
                  
                  {/* Label */}
                  <span 
                    className={cn(
                      "text-sm truncate transition-colors duration-500 min-w-[100px]",
                      isCaptured ? "text-slate-300" : "text-slate-600"
                    )}
                  >
                    {category.label}
                  </span>
                  
                  {/* Value - slides in with fade */}
                  <AnimatePresence mode="wait">
                    {isCaptured && fieldData?.value && (
                      <motion.span
                        key={`${category.key}-${fieldData.value}`}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className={cn(
                          "text-sm ml-auto truncate max-w-[120px] text-right",
                          currentStyles.text
                        )}
                      >
                        {truncateValue(fieldData.value, 18)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              );
              
              // Wrap with tooltip if we have a summary
              if (isCaptured && fieldData?.summary) {
                return (
                  <Tooltip key={category.key}>
                    <TooltipTrigger asChild>
                      {rowContent}
                    </TooltipTrigger>
                    <TooltipContent 
                      side="left" 
                      className="max-w-[280px] bg-slate-900 border-slate-700 text-slate-200 p-3"
                    >
                      <p className="text-sm leading-relaxed">{fieldData.summary}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }
              
              return <div key={category.key}>{rowContent}</div>;
            })}
          </div>
          
          {/* CTA Section - fixed at bottom, separate from bars, NEVER overlaps */}
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
                    "w-full py-3 rounded-lg text-sm font-medium transition-all",
                    result.canUnlock('premium_generation')
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 hover:from-amber-500/30 hover:to-orange-500/30"
                      : result.canUnlock('page_generation')
                        ? "bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/15"
                        : "bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/15"
                  )}
                >
                  {result.canUnlock('premium_generation') 
                    ? '⭐ Generate Premium Page' 
                    : result.canUnlock('page_generation')
                      ? 'Generate Page →'
                      : 'Continue to Full Consultation →'}
                </motion.button>
                
                {onKeepChatting && (
                  <button
                    onClick={onKeepChatting}
                    className="w-full py-2 text-xs text-slate-500 hover:text-slate-400 transition-colors"
                  >
                    Keep Chatting
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-600 text-center">
                Share more to unlock your page
              </p>
            )}
          </div>
          
        </div>
      </div>
    </TooltipProvider>
  );
}

// Helper to truncate long values (shouldn't be needed with 15 char extraction limit)
function truncateValue(value: string, maxLength: number = 15): string {
  if (value.length > maxLength) {
    return value.slice(0, maxLength);
  }
  return value;
}
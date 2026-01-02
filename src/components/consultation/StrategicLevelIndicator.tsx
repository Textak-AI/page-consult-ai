import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StrategicLevel } from '@/types/strategicLevels';
import type { LevelCheckResult } from '@/types/strategicLevels';

// Category definitions matching the strategic level calculator fields
// IMPORTANT: These keys must match what calculateStrategicLevel returns in capturedFields
const CATEGORIES = [
  { key: 'industry', label: 'Industry' },
  { key: 'audience', label: 'Audience' },
  { key: 'valueProp', label: 'Value Proposition' },
  { key: 'competitorDifferentiation', label: 'Competitive Edge' },
  { key: 'painPoints', label: 'Pain Points' },
  { key: 'buyerObjections', label: 'Buyer Objections' },
  { key: 'proofElements', label: 'Proof Elements' },
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
  const [displayedFields, setDisplayedFields] = useState<Map<string, string>>(new Map());
  const [animatingFields, setAnimatingFields] = useState<Map<string, number>>(new Map()); // field -> stagger index
  const [displayLevel, setDisplayLevel] = useState<StrategicLevel>(currentLevel);
  
  // Detect newly captured fields and animate them with stagger
  useEffect(() => {
    const currentCapturedMap = new Map(
      capturedFields.map(({ field, value }) => [field, value])
    );
    
    const newCaptures: Array<{ field: string; value: string }> = [];
    
    currentCapturedMap.forEach((value, field) => {
      if (!prevCapturedRef.current.has(field)) {
        newCaptures.push({ field, value });
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
            updated.set(capture.field, capture.value);
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
          
        }, 300 + (index * STAGGER_DELAY_MS)); // 300ms thinking delay + stagger
      });
      
      // Update level AFTER all bars have animated
      const totalAnimationTime = 300 + (newCaptures.length * STAGGER_DELAY_MS) + 500;
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
            const value = displayedFields.get(category.key);
            const isCaptured = !!value;
            const staggerIndex = animatingFields.get(category.key);
            const isAnimating = staggerIndex !== undefined;
            
            return (
              <div
                key={category.key}
                className="flex items-center gap-3"
              >
                {/* Color band - transitions from grey to colored */}
                <motion.div 
                  className={cn(
                    "w-1 h-10 rounded-full flex-shrink-0",
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
                    backgroundColor: { duration: 0.5 },
                  }}
                  style={{
                    transition: 'background 0.5s ease-out',
                  }}
                />
                
                {/* Label */}
                <span 
                  className={cn(
                    "text-sm truncate transition-colors duration-500",
                    isCaptured ? "text-slate-300" : "text-slate-600"
                  )}
                >
                  {category.label}
                </span>
                
                {/* Value - slides in with fade */}
                <AnimatePresence mode="wait">
                  {isCaptured && value && (
                    <motion.span
                      key={`${category.key}-${value}`}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={cn("text-sm ml-auto truncate max-w-[100px]", currentStyles.text)}
                    >
                      {truncateValue(value, 14)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            );
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
  );
}

// Helper to truncate long values
function truncateValue(value: string, maxLength: number = 20): string {
  if (value.length > maxLength) {
    return value.slice(0, maxLength - 2) + '…';
  }
  return value;
}

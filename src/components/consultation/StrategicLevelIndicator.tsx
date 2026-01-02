import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StrategicLevel } from '@/types/strategicLevels';
import type { LevelCheckResult } from '@/types/strategicLevels';

// Category definitions for the stacked display
const CATEGORIES = [
  { key: 'industry', label: 'Industry' },
  { key: 'target_audience', label: 'Audience' },
  { key: 'unique_value', label: 'Value Proposition' },
  { key: 'competitor_differentiator', label: 'Competitive Edge' },
  { key: 'audience_pain_points', label: 'Pain Points' },
  { key: 'buyer_objections', label: 'Buyer Objections' },
  { key: 'proof_elements', label: 'Proof Elements' },
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

interface Props {
  result: LevelCheckResult;
  onContinue?: () => void;
  isThinking?: boolean;
  className?: string;
}

export function StrategicLevelIndicator({ result, onContinue, isThinking = false, className }: Props) {
  const { currentLevel, capturedFields } = result;
  const styles = LEVEL_STYLES[currentLevel];
  
  // Track previous captured fields to detect new captures
  const prevCapturedRef = useRef<Set<string>>(new Set());
  const [newlyCapturewdFields, setNewlyCapturedFields] = useState<Set<string>>(new Set());
  const [displayLevel, setDisplayLevel] = useState<StrategicLevel>(currentLevel);
  
  // Create a map of captured field keys to their values
  const capturedMap = new Map(
    capturedFields.map(({ field, value }) => [field, value])
  );
  
  // Detect newly captured fields and animate them
  useEffect(() => {
    const currentCaptured = new Set(capturedFields.map(f => f.field));
    const newCaptures = new Set<string>();
    
    currentCaptured.forEach(field => {
      if (!prevCapturedRef.current.has(field)) {
        newCaptures.add(field);
      }
    });
    
    if (newCaptures.size > 0) {
      setNewlyCapturedFields(newCaptures);
      
      // Update level AFTER the bar animation completes (400ms delay)
      setTimeout(() => {
        setDisplayLevel(currentLevel);
        setNewlyCapturedFields(new Set());
      }, 400);
    } else {
      setDisplayLevel(currentLevel);
    }
    
    prevCapturedRef.current = currentCaptured;
  }, [capturedFields, currentLevel]);
  
  const displayStyles = LEVEL_STYLES[displayLevel];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-xl border overflow-hidden",
        "bg-slate-900/40 backdrop-blur-xl",
        displayStyles.border,
        className
      )}
    >
      <div className="h-full flex flex-col p-4">
        
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-base font-light tracking-wide text-white">
            Intelligence Profile
          </h2>
          <motion.p 
            key={displayLevel}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("text-xs mt-0.5", displayStyles.text)}
          >
            {displayStyles.label}
            {displayStyles.sublabel && ` — ${displayStyles.sublabel}`}
          </motion.p>
        </div>
        
        {/* Thinking shimmer overlay */}
        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none z-10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Stacked Categories - ALWAYS VISIBLE */}
        <div className="flex-1 flex flex-col justify-center space-y-5">
          {CATEGORIES.map((category, index) => {
            const value = capturedMap.get(category.key);
            const isCaptured = !!value;
            const isNewlyCaputred = newlyCapturewdFields.has(category.key);
            
            return (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-3"
              >
                {/* Color band - animates from grey to colored */}
                <motion.div 
                  className={cn(
                    "w-1 h-10 rounded-full flex-shrink-0",
                    isCaptured 
                      ? `bg-gradient-to-b ${styles.gradient}` 
                      : "bg-slate-700"
                  )}
                  initial={isNewlyCaputred ? { scale: 1, opacity: 0.5 } : false}
                  animate={isNewlyCaputred ? { 
                    scale: [1, 1.5, 1],
                    opacity: 1,
                  } : { opacity: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
                
                {/* Label */}
                <motion.span 
                  className={cn(
                    "text-sm truncate",
                    isCaptured ? "text-slate-300" : "text-slate-600"
                  )}
                  animate={{ 
                    color: isCaptured ? "rgb(203, 213, 225)" : "rgb(71, 85, 105)" 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {category.label}
                </motion.span>
                
                {/* Value (if captured) - slides in */}
                <AnimatePresence mode="wait">
                  {isCaptured && value && (
                    <motion.span
                      key={`${category.key}-${value}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3, delay: isNewlyCaputred ? 0.15 : 0 }}
                      className={cn("text-sm ml-auto truncate max-w-[100px]", styles.text)}
                    >
                      {truncateValue(value, 14)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        
        {/* CTA at bottom - below the bars, never covers them */}
        <div className="mt-4 pt-4 border-t border-slate-800/30">
          {result.canUnlock('trial_signup') && !result.canUnlock('page_generation') && onContinue && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onContinue}
              className="w-full py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/15 transition-all"
            >
              Continue to Full Consultation →
            </motion.button>
          )}
          
          {result.canUnlock('page_generation') && !result.canUnlock('premium_generation') && onContinue && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onContinue}
              className="w-full py-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-medium hover:bg-purple-500/15 transition-all"
            >
              Generate Page →
            </motion.button>
          )}
          
          {result.canUnlock('premium_generation') && onContinue && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onContinue}
              className="w-full py-3.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 font-medium hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
            >
              ⭐ Generate Premium Page
            </motion.button>
          )}
          
          {/* Show subtle hint when no CTA is unlocked yet */}
          {!result.canUnlock('trial_signup') && (
            <p className="text-xs text-slate-600 text-center">
              Share more to unlock your page
            </p>
          )}
        </div>
        
      </div>
    </motion.div>
  );
}

// Helper to truncate long values
function truncateValue(value: string, maxLength: number = 20): string {
  if (value.length > maxLength) {
    return value.slice(0, maxLength - 2) + '…';
  }
  return value;
}

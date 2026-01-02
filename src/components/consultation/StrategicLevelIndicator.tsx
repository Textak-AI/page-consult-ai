import { motion } from 'framer-motion';
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
  className?: string;
}

export function StrategicLevelIndicator({ result, onContinue, className }: Props) {
  const { currentLevel, capturedFields } = result;
  const styles = LEVEL_STYLES[currentLevel];
  
  // Create a map of captured field keys to their values
  const capturedMap = new Map(
    capturedFields.map(({ field, value }) => [field, value])
  );
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-xl border overflow-hidden",
        "bg-slate-900/40 backdrop-blur-xl",
        styles.border,
        className
      )}
    >
      <div className="h-full flex flex-col p-4">
        
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-base font-light tracking-wide text-white">
            Intelligence Profile
          </h2>
          <p className={cn("text-xs mt-0.5", styles.text)}>
            {styles.label}
            {styles.sublabel && ` — ${styles.sublabel}`}
          </p>
        </div>
        
        {/* Stacked Categories - balanced spacing */}
        <div className="flex-1 flex flex-col justify-center space-y-5">
          {CATEGORIES.map((category, index) => {
            const value = capturedMap.get(category.key);
            const isCaptured = !!value;
            
            return (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-3"
              >
                {/* Color band */}
                <div 
                  className={cn(
                    "w-1 h-10 rounded-full transition-all duration-300 flex-shrink-0",
                    isCaptured 
                      ? `bg-gradient-to-b ${styles.gradient}` 
                      : "bg-slate-700"
                  )}
                />
                
                {/* Label */}
                <span className={cn(
                  "text-xs transition-colors duration-300 truncate",
                  isCaptured ? "text-slate-300" : "text-slate-600"
                )}>
                  {category.label}
                </span>
                
                {/* Value (if captured) */}
                {isCaptured && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn("text-xs ml-auto truncate max-w-[80px]", styles.text)}
                  >
                    {truncateValue(value, 12)}
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>
        
        {/* CTAs based on level */}
        {result.canUnlock('trial_signup') && !result.canUnlock('page_generation') && onContinue && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onContinue}
            className="w-full py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/15 transition-all mt-4"
          >
            Start Free Trial →
          </motion.button>
        )}
        
        {result.canUnlock('page_generation') && !result.canUnlock('premium_generation') && onContinue && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onContinue}
            className="w-full py-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-medium hover:bg-purple-500/15 transition-all mt-4"
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
            className="w-full py-3.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 font-medium hover:from-amber-500/30 hover:to-orange-500/30 transition-all mt-4"
          >
            ⭐ Generate Premium Page
          </motion.button>
        )}
        
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

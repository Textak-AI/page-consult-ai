import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StrategicLevel, STRATEGIC_LEVELS } from '@/types/strategicLevels';
import type { LevelCheckResult } from '@/types/strategicLevels';
import { formatFieldName } from '@/lib/strategicLevelCalculator';

const LEVEL_STYLES: Record<StrategicLevel, {
  gradient: string;
  glow: string;
  text: string;
  bg: string;
  border: string;
}> = {
  unqualified: {
    gradient: 'from-slate-500 to-slate-600',
    glow: 'shadow-[-4px_0_20px_rgba(100,116,139,0.2)]',
    text: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-700/50',
  },
  identified: {
    gradient: 'from-blue-400 to-blue-600',
    glow: 'shadow-[-4px_0_20px_rgba(59,130,246,0.3)]',
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  positioned: {
    gradient: 'from-green-400 to-emerald-600',
    glow: 'shadow-[-4px_0_20px_rgba(34,197,94,0.3)]',
    text: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  armed: {
    gradient: 'from-purple-400 to-violet-600',
    glow: 'shadow-[-4px_0_20px_rgba(168,85,247,0.3)]',
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  proven: {
    gradient: 'from-amber-400 to-orange-500',
    glow: 'shadow-[-4px_0_20px_rgba(245,158,11,0.3)]',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
};

// Line art icons as inline SVGs
const LevelIcon = ({ level, className }: { level: StrategicLevel; className?: string }) => {
  const baseClass = cn("w-8 h-8", className);
  const strokeProps = { 
    strokeWidth: 1.5, 
    fill: "none", 
    stroke: "currentColor", 
    strokeLinecap: "round" as const, 
    strokeLinejoin: "round" as const 
  };
  
  switch (level) {
    case 'unqualified':
      return (
        <svg viewBox="0 0 24 24" className={baseClass} {...strokeProps}>
          <path d="M12 2L22 12L12 22L2 12L12 2Z" />
        </svg>
      );
    case 'identified':
      return (
        <svg viewBox="0 0 24 24" className={baseClass} {...strokeProps}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      );
    case 'positioned':
      return (
        <svg viewBox="0 0 24 24" className={baseClass} {...strokeProps}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case 'armed':
      return (
        <svg viewBox="0 0 24 24" className={baseClass} {...strokeProps}>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case 'proven':
      return (
        <svg viewBox="0 0 24 24" className={baseClass} {...strokeProps}>
          <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6L12 2z" />
        </svg>
      );
  }
};

interface Props {
  result: LevelCheckResult;
  onContinue?: () => void;
}

export function StrategicLevelIndicator({ result, onContinue }: Props) {
  const { currentLevel, levelDef, nextLevelDef, missingForNext, capturedFields } = result;
  const styles = LEVEL_STYLES[currentLevel];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-slate-900/80 backdrop-blur-xl",
        "border border-slate-700/50",
        styles.glow
      )}
    >
      {/* Vertical Color Band */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          "bg-gradient-to-b",
          styles.gradient
        )}
      />
      
      {/* Content */}
      <div className="pl-5 pr-5 py-5">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <LevelIcon level={currentLevel} className={styles.text} />
          <div>
            <h3 className={cn(
              "text-sm font-semibold tracking-wide uppercase",
              styles.text
            )}>
              {levelDef.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              "{levelDef.tagline}"
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-700/50 mb-4" />

        {/* Captured Fields */}
        {capturedFields.length > 0 && (
          <div className="space-y-2 mb-4">
            {capturedFields.map(({ field, value }) => (
              <div key={field} className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn("text-xs", styles.text)}>✓</span>
                  <span className="text-xs text-slate-500 truncate">
                    {formatFieldName(field)}
                  </span>
                </div>
                <span className={cn("text-xs font-medium truncate max-w-[50%] text-right", styles.text)}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Missing Fields for Next Level */}
        {nextLevelDef && missingForNext.length > 0 && (
          <div className="space-y-1.5 mb-4">
            {capturedFields.length > 0 && (
              <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">
                Next: {nextLevelDef.name}
              </p>
            )}
            {missingForNext.map((field) => (
              <div key={field} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-xs text-slate-500">
                  {formatFieldName(field)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* CTAs */}
        {result.canUnlock('trial_signup') && !result.canUnlock('page_generation') && onContinue && (
          <button
            onClick={onContinue}
            className={cn(
              "w-full py-2.5 text-sm font-medium rounded-lg",
              "border transition-all duration-200",
              styles.border,
              styles.text,
              "hover:bg-green-500/10 hover:border-green-500/30"
            )}
          >
            Start Free Trial →
          </button>
        )}
        
        {result.canUnlock('page_generation') && !result.canUnlock('premium_generation') && onContinue && (
          <button
            onClick={onContinue}
            className={cn(
              "w-full py-2.5 text-sm font-medium rounded-lg",
              "border transition-all duration-200",
              styles.border,
              styles.text,
              "hover:bg-purple-500/10 hover:border-purple-500/30"
            )}
          >
            Generate Page →
          </button>
        )}
        
        {result.canUnlock('premium_generation') && onContinue && (
          <button
            onClick={onContinue}
            className={cn(
              "w-full py-2.5 text-sm font-medium rounded-lg",
              "bg-gradient-to-r from-amber-500/20 to-orange-500/20",
              "border border-amber-500/30",
              "text-amber-400",
              "hover:from-amber-500/30 hover:to-orange-500/30",
              "transition-all duration-200"
            )}
          >
            ⭐ Generate Premium Page
          </button>
        )}
        
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StrategicLevel, STRATEGIC_LEVELS } from '@/types/strategicLevels';
import type { LevelCheckResult } from '@/types/strategicLevels';
import { formatFieldName } from '@/lib/strategicLevelCalculator';

const LEVEL_STYLES: Record<StrategicLevel, {
  gradient: string;
  glow: string;
  text: string;
  border: string;
  dot: string;
}> = {
  unqualified: {
    gradient: 'from-slate-400 to-slate-600',
    glow: 'shadow-[inset_4px_0_20px_rgba(100,116,139,0.15)]',
    text: 'text-slate-400',
    border: 'border-slate-800/50',
    dot: 'bg-slate-500',
  },
  identified: {
    gradient: 'from-blue-400 to-blue-600',
    glow: 'shadow-[inset_4px_0_24px_rgba(59,130,246,0.2)]',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    dot: 'bg-blue-500',
  },
  positioned: {
    gradient: 'from-green-400 to-emerald-600',
    glow: 'shadow-[inset_4px_0_24px_rgba(34,197,94,0.2)]',
    text: 'text-green-400',
    border: 'border-green-500/20',
    dot: 'bg-green-500',
  },
  armed: {
    gradient: 'from-purple-400 to-violet-600',
    glow: 'shadow-[inset_4px_0_24px_rgba(168,85,247,0.2)]',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
    dot: 'bg-purple-500',
  },
  proven: {
    gradient: 'from-amber-400 to-orange-500',
    glow: 'shadow-[inset_4px_0_24px_rgba(245,158,11,0.2)]',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
  },
};

const NEXT_LEVEL_COLORS: Record<StrategicLevel, string> = {
  unqualified: 'text-blue-400',
  identified: 'text-green-400',
  positioned: 'text-purple-400',
  armed: 'text-amber-400',
  proven: 'text-amber-400',
};

// Line art icons
const LevelIcon = ({ level, className }: { level: StrategicLevel; className?: string }) => {
  const baseClass = cn("w-10 h-10", className);
  const strokeProps = { 
    strokeWidth: 1, 
    fill: "none", 
    stroke: "currentColor", 
    strokeLinecap: "round" as const, 
    strokeLinejoin: "round" as const 
  };
  
  switch (level) {
    case 'unqualified':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" {...strokeProps}>
          <path d="M12 2L22 12L12 22L2 12L12 2Z" />
        </svg>
      );
    case 'identified':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" {...strokeProps}>
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21C5.5 17.5 8.5 15 12 15C15.5 15 18.5 17.5 18.5 21" />
        </svg>
      );
    case 'positioned':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" {...strokeProps}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      );
    case 'armed':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" {...strokeProps}>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case 'proven':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" {...strokeProps}>
          <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
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
  const nextColor = NEXT_LEVEL_COLORS[currentLevel];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-slate-900/40 backdrop-blur-xl",
        "border",
        styles.border,
        styles.glow
      )}
    >
      {/* Vertical Color Band */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1",
        "bg-gradient-to-b",
        styles.gradient
      )} />
      
      {/* Content */}
      <div className="h-full flex flex-col pl-8 pr-6 py-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <LevelIcon level={currentLevel} className={styles.text} />
          <div>
            <h2 className="text-xl font-light tracking-wider text-white">
              {levelDef.name.toUpperCase()}
            </h2>
            <p className="text-slate-400 text-sm font-light mt-0.5">
              {levelDef.tagline}
            </p>
          </div>
        </div>
        
        {/* Captured Fields */}
        {capturedFields.length > 0 && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6 text-sm">
            {capturedFields.map(({ field, value }) => (
              <div key={field} className="contents">
                <div className="flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full", styles.dot)} />
                  <span className="text-slate-500">{formatFieldName(field)}</span>
                </div>
                <span className={cn("truncate", styles.text)}>{value}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Spacer */}
        <div className="flex-1" />
        
        {/* CTAs */}
        {result.canUnlock('trial_signup') && !result.canUnlock('page_generation') && onContinue && (
          <button
            onClick={onContinue}
            className="w-full py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/15 transition-all mb-6"
          >
            🔓 Start Free Trial
          </button>
        )}
        
        {result.canUnlock('page_generation') && !result.canUnlock('premium_generation') && onContinue && (
          <button
            onClick={onContinue}
            className="w-full py-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-medium hover:bg-purple-500/15 transition-all mb-6"
          >
            Generate Page →
          </button>
        )}
        
        {result.canUnlock('premium_generation') && onContinue && (
          <button
            onClick={onContinue}
            className="w-full py-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/15 transition-all mb-6"
          >
            ⭐ Generate Premium Page
          </button>
        )}

        {/* Next Level Requirements */}
        {nextLevelDef && missingForNext.length > 0 && (
          <div className={cn(
            "pt-5 border-t border-slate-800/30",
            capturedFields.length === 0 && "pt-0 border-t-0"
          )}>
            <p className="text-slate-600 text-xs uppercase tracking-widest mb-3">
              To unlock <span className={nextColor}>{nextLevelDef.name}</span>
            </p>
            
            {missingForNext.length <= 3 ? (
              <div className="space-y-3">
                {missingForNext.map((field) => (
                  <div key={field} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full border border-slate-600" />
                    <span className="text-slate-500 text-sm">{formatFieldName(field)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                {missingForNext.map((field) => (
                  <span key={field}>○ {formatFieldName(field)}</span>
                ))}
              </div>
            )}
          </div>
        )}
        
      </div>
    </motion.div>
  );
}

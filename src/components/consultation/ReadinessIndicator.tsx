import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFieldName } from '@/lib/readinessScoring';
import type { ReadinessFieldResult } from '@/types/consultationReadiness';

interface ReadinessIndicatorProps {
  score: number;
  breakdown: ReadinessFieldResult[];
  showDetails?: boolean;
  compact?: boolean;
}

export function ReadinessIndicator({ 
  score, 
  breakdown, 
  showDetails = true,
  compact = false 
}: ReadinessIndicatorProps) {
  const canGenerate = score >= 70;
  
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-2 w-16 bg-slate-700 rounded-full overflow-hidden">
          <motion.div 
            className={cn(
              "h-full transition-all duration-500",
              canGenerate 
                ? "bg-gradient-to-r from-cyan-500 to-green-500" 
                : "bg-gradient-to-r from-amber-500 to-cyan-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className={cn(
          "text-sm font-medium",
          canGenerate ? "text-cyan-400" : "text-amber-400"
        )}>
          {score}%
        </span>
      </div>
    );
  }
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-400">Strategy Readiness</span>
        <span className={cn(
          "text-lg font-bold",
          canGenerate ? "text-cyan-400" : "text-amber-400"
        )}>
          {score}%
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
        <motion.div 
          className={cn(
            "h-full transition-all duration-500",
            canGenerate 
              ? "bg-gradient-to-r from-cyan-500 to-green-500" 
              : "bg-gradient-to-r from-amber-500 to-cyan-500"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      
      {/* Field checklist */}
      {showDetails && (
        <div className="space-y-1.5">
          {breakdown.map(item => (
            <div key={item.field} className="flex items-center gap-2 text-xs">
              {item.captured ? (
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span className={item.captured ? "text-slate-300" : "text-slate-500"}>
                {formatFieldName(item.field)}
              </span>
              {item.captured && (
                <span className="ml-auto text-cyan-400/60">+{item.score}</span>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Generation gate message */}
      {!canGenerate && (
        <div className="mt-4 pt-3 border-t border-slate-700">
          <p className="text-xs text-amber-400">
            Need {70 - score}% more to generate your page
          </p>
        </div>
      )}
      
      {canGenerate && (
        <div className="mt-4 pt-3 border-t border-slate-700">
          <p className="text-xs text-cyan-400 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Ready to generate landing page
          </p>
        </div>
      )}
    </div>
  );
}

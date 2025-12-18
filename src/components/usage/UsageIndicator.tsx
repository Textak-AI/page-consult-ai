import { Zap, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface UsageIndicatorProps {
  available: number;
  limit: number;
  percentRemaining: number;
  daysUntilReset: number;
  isUnlimited: boolean;
  isPro: boolean;
  rollover?: number;
  onClick?: () => void;
}

export function UsageIndicator({
  available,
  limit,
  percentRemaining,
  daysUntilReset,
  isUnlimited,
  isPro,
  rollover = 0,
  onClick,
}: UsageIndicatorProps) {
  const getColorClass = () => {
    if (isUnlimited) return 'text-purple-400';
    if (percentRemaining > 50) return 'text-emerald-400';
    if (percentRemaining > 20) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getProgressColor = () => {
    if (isUnlimited) return 'bg-purple-500';
    if (percentRemaining > 50) return 'bg-emerald-500';
    if (percentRemaining > 20) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  if (isUnlimited) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onClick}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
            >
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Unlimited</span>
              <ChevronDown className="w-3 h-3 text-purple-400/60" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Agency Plan - Unlimited AI Actions</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700/80 transition-colors"
          >
            <Zap className={cn('w-4 h-4', getColorClass())} />
            <span className={cn('text-sm font-medium', getColorClass())}>
              {available}/{limit}
            </span>
            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', getProgressColor())}
                style={{ width: `${Math.max(0, percentRemaining)}%` }}
              />
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">AI Actions</p>
            <p className="text-xs text-muted-foreground">
              {available} remaining • Resets in {daysUntilReset} days
            </p>
            {isPro && rollover > 0 && (
              <p className="text-xs text-cyan-400 mt-1">
                Including {rollover} rolled over
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default UsageIndicator;

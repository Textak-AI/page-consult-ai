import { useState } from 'react';
import { Zap, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

interface CreditDisplayProps {
  available: number;
  total: number;
  resetDate: Date | null;
  isUnlimited?: boolean;
  onUpgrade?: () => void;
  onGetMoreActions?: () => void;
  className?: string;
}

export function CreditDisplay({
  available,
  total,
  resetDate,
  isUnlimited = false,
  onUpgrade,
  onGetMoreActions,
  className,
}: CreditDisplayProps) {
  const percentRemaining = total > 0 ? (available / total) * 100 : 0;
  const isHealthy = percentRemaining > 25;
  const isLow = percentRemaining <= 25 && percentRemaining > 0;
  const isDepleted = available <= 0;

  // Unlimited state
  if (isUnlimited) {
    return (
      <div className={cn(
        'p-4 rounded-lg border border-border/50 bg-card/50 hover:shadow-md transition-shadow',
        className
      )}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-foreground">Unlimited AI Actions</span>
        </div>
        <p className="text-xs text-muted-foreground">Agency Plan</p>
      </div>
    );
  }

  // Depleted state
  if (isDepleted) {
    return (
      <div className={cn(
        'p-4 rounded-lg border border-border/50 bg-card/50 hover:shadow-md transition-shadow',
        className
      )}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">0 AI Actions</span>
        </div>
        
        <Progress value={0} className="h-2 mb-3 bg-muted" />
        
        <p className="text-xs text-muted-foreground mb-3">
          Your AI Associate is ready when you are.
        </p>
        
        <Button 
          size="sm" 
          onClick={onUpgrade}
          className="w-full bg-primary hover:bg-primary/90"
        >
          Upgrade Plan
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  }

  // Low state (≤25%)
  if (isLow) {
    return (
      <div className={cn(
        'p-4 rounded-lg border border-amber-500/30 bg-card/50 hover:shadow-md transition-shadow',
        className
      )}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            {available} AI Action{available !== 1 ? 's' : ''} remaining
          </span>
        </div>
        
        <Progress 
          value={percentRemaining} 
          className="h-2 mb-2 [&>div]:bg-amber-500" 
        />
        
        <button
          onClick={onGetMoreActions}
          className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
        >
          Get More Actions
        </button>
      </div>
    );
  }

  // Healthy state (>25%)
  return (
    <div className={cn(
      'p-4 rounded-lg border border-border/50 bg-card/50 hover:shadow-md transition-shadow',
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-medium text-foreground">
          {available} of {total} AI Actions
        </span>
      </div>
      
      <Progress 
        value={percentRemaining} 
        className="h-2 mb-2 [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-purple-500" 
      />
      
      {resetDate && (
        <p className="text-xs text-muted-foreground">
          Resets {format(resetDate, 'MMM d')}
        </p>
      )}
    </div>
  );
}

export default CreditDisplay;

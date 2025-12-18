import { useState } from 'react';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LowBalanceAlertProps {
  remaining: number;
  onUpgrade?: () => void;
  onDismiss?: () => void;
}

export function LowBalanceAlert({ remaining, onUpgrade, onDismiss }: LowBalanceAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-50 max-w-sm',
      'animate-in slide-in-from-bottom-4 fade-in duration-300'
    )}>
      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-sm shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-white mb-1">
              Running low on AI Actions
            </h4>
            <p className="text-sm text-slate-400 mb-3">
              You have {remaining} action{remaining !== 1 ? 's' : ''} remaining. 
              Upgrade to Pro for 150 actions/month!
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={onUpgrade}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                Upgrade
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white"
              >
                Dismiss
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded hover:bg-slate-700/50 text-slate-500 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default LowBalanceAlert;

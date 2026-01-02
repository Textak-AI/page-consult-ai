import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function TrialBanner() {
  const navigate = useNavigate();
  const [trialInfo, setTrialInfo] = useState<{
    daysRemaining: number;
    isExpired: boolean;
    trialEnd: Date | null;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchTrialStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: usage } = await supabase
        .from('user_usage')
        .select('trial_start, trial_end, subscription_status')
        .eq('user_id', user.id)
        .single();

      if (usage?.trial_end) {
        const trialEnd = new Date(usage.trial_end);
        const now = new Date();
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        setTrialInfo({
          daysRemaining: Math.max(0, daysRemaining),
          isExpired: daysRemaining <= 0,
          trialEnd,
        });
      }
    };

    fetchTrialStatus();
  }, []);

  if (!trialInfo || dismissed) return null;
  
  // Don't show if not in trial or if trial is more than 14 days (not a trial user)
  if (trialInfo.daysRemaining > 14) return null;

  // Expired trial
  if (trialInfo.isExpired) {
    return (
      <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 border-b border-red-500/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-200">
              Your free trial has ended. Upgrade to keep building.
            </span>
          </div>
          <Button
            onClick={() => navigate('/pricing')}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }

  // Active trial - show days remaining
  const isUrgent = trialInfo.daysRemaining <= 3;
  
  return (
    <div 
      className={cn(
        "border-b",
        isUrgent 
          ? "bg-gradient-to-r from-amber-900/50 to-amber-800/50 border-amber-500/30" 
          : "bg-gradient-to-r from-cyan-900/30 to-slate-900/30 border-cyan-500/20"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Clock className={cn("w-4 h-4", isUrgent ? "text-amber-400" : "text-cyan-400")} />
          <span className={cn("text-sm", isUrgent ? "text-amber-200" : "text-cyan-200")}>
            {trialInfo.daysRemaining === 1 
              ? "Last day of your free trial!" 
              : `${trialInfo.daysRemaining} days left in your free trial`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/pricing')}
            size="sm"
            variant="ghost"
            className={cn(
              "text-sm",
              isUrgent 
                ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10" 
                : "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            )}
          >
            View Plans
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-500 hover:text-slate-400 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrialAccess {
  isLoading: boolean;
  isTrialing: boolean;
  isExpired: boolean;
  isPaid: boolean;
  daysRemaining: number;
  trialEnd: Date | null;
  subscriptionStatus: string | null;
  canAccessFeature: (feature: string) => boolean;
}

const TRIAL_FEATURES = [
  'consultation',
  'strategy_brief',
  'one_landing_page',
  'basic_calculator',
  'page_generation',
];

export function useTrialAccess(): TrialAccess {
  const [status, setStatus] = useState<TrialAccess>({
    isLoading: true,
    isTrialing: false,
    isExpired: false,
    isPaid: false,
    daysRemaining: 0,
    trialEnd: null,
    subscriptionStatus: null,
    canAccessFeature: () => false,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const { data: usage } = await supabase
        .from('user_usage')
        .select('trial_start, trial_end, subscription_status, plan_tier')
        .eq('user_id', user.id)
        .single();

      if (!usage) {
        setStatus(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const now = new Date();
      const trialEnd = usage.trial_end ? new Date(usage.trial_end) : null;
      const daysRemaining = trialEnd 
        ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const isTrialing = usage.subscription_status === 'trialing' && daysRemaining > 0;
      const isExpired = usage.subscription_status === 'trialing' && daysRemaining <= 0;
      const isPaid = ['active', 'pro', 'agency'].includes(usage.subscription_status || '') ||
                     ['pro', 'agency'].includes(usage.plan_tier || '');

      setStatus({
        isLoading: false,
        isTrialing,
        isExpired,
        isPaid,
        daysRemaining: Math.max(0, daysRemaining),
        trialEnd,
        subscriptionStatus: usage.subscription_status,
        canAccessFeature: (feature: string) => {
          if (isPaid) return true;
          if (isTrialing) {
            return TRIAL_FEATURES.includes(feature);
          }
          return false;
        },
      });
    };

    fetchStatus();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchStatus();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return status;
}

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: string;
  plan: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Subscription fetch error:', error);
      }
      setSubscription(data);
      setLoading(false);
    };

    fetchSubscription();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('subscription-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscriptions',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        console.log('Subscription updated:', payload);
        setSubscription(payload.new as Subscription);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const plan = subscription?.plan || 'free';
  const isPaid = isActive && plan !== 'free';
  const isPro = isActive && ['pro', 'founding', 'agency'].includes(plan);
  const isAgency = isActive && plan === 'agency';
  const isFounding = isActive && plan === 'founding';

  return {
    subscription,
    loading,
    isActive,
    isPaid,
    isPro,
    isAgency,
    isFounding,
    plan,
  };
};

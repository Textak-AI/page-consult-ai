import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AIActionType = 
  | 'page_generation' 
  | 'section_regeneration' 
  | 'ai_improvement' 
  | 'intelligence_refresh' 
  | 'style_change';

export type PlanTier = 'starter' | 'pro' | 'agency';

export interface UserUsage {
  id: string;
  user_id: string;
  plan_tier: PlanTier;
  ai_actions_limit: number | null;
  ai_actions_used: number;
  ai_actions_rollover: number;
  grace_actions_given: boolean;
  billing_period_start: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export interface UsageLogEntry {
  id: string;
  user_id: string;
  action_type: AIActionType;
  action_cost: number;
  page_id: string | null;
  section_type: string | null;
  created_at: string;
}

export interface ActionResult {
  allowed: boolean;
  remaining: number;
  unlimited: boolean;
}

const ACTION_COSTS: Record<AIActionType, number> = {
  page_generation: 3,
  section_regeneration: 1,
  ai_improvement: 1,
  intelligence_refresh: 2,
  style_change: 1,
};

export function useAIActions(userId: string | null) {
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [usageLog, setUsageLog] = useState<UsageLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dontShowConfirm, setDontShowConfirm] = useState(false);

  // Calculate derived values
  const available = usage 
    ? (usage.ai_actions_limit ?? 30) - usage.ai_actions_used + usage.ai_actions_rollover 
    : 0;
  
  const limit = usage?.ai_actions_limit ?? 30;
  const percentUsed = limit ? ((limit - available + (usage?.ai_actions_rollover ?? 0)) / limit) * 100 : 0;
  const percentRemaining = 100 - percentUsed;
  
  const daysUntilReset = usage?.billing_period_start
    ? Math.max(0, 30 - Math.floor((Date.now() - new Date(usage.billing_period_start).getTime()) / (1000 * 60 * 60 * 24)))
    : 30;

  const isUnlimited = usage?.plan_tier === 'agency';
  const isPro = usage?.plan_tier === 'pro';
  const isLowBalance = available <= 5 && !isUnlimited;
  const isZeroBalance = available <= 0 && !isUnlimited;

  // Fetch user usage data
  const fetchUsage = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUsage(data as unknown as UserUsage);
      } else {
        // Create usage record if it doesn't exist
        const { data: newData, error: insertError } = await supabase
          .from('user_usage')
          .insert({ user_id: userId })
          .select()
          .single();
        
        if (!insertError && newData) {
          setUsage(newData as unknown as UserUsage);
        }
      }
    } catch (err) {
      console.error('Error fetching usage:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch usage log
  const fetchUsageLog = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('usage_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsageLog((data || []) as unknown as UsageLogEntry[]);
    } catch (err) {
      console.error('Error fetching usage log:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchUsage();
    fetchUsageLog();
  }, [fetchUsage, fetchUsageLog]);

  // Check if action is allowed (without tracking)
  const checkAction = useCallback((actionType: AIActionType, isFirstPageGeneration = false): { allowed: boolean; cost: number; remaining: number } => {
    if (isUnlimited) {
      return { allowed: true, cost: 0, remaining: -1 };
    }

    let cost = ACTION_COSTS[actionType];
    
    // First page generation is free
    if (actionType === 'page_generation' && isFirstPageGeneration) {
      cost = 0;
    }

    return {
      allowed: cost <= available,
      cost,
      remaining: available,
    };
  }, [available, isUnlimited]);

  // Track an AI action
  const trackAction = useCallback(async (
    actionType: AIActionType,
    pageId?: string,
    sectionType?: string,
    isFirstPageGeneration = false
  ): Promise<ActionResult> => {
    if (!userId) {
      return { allowed: false, remaining: 0, unlimited: false };
    }

    if (isUnlimited) {
      return { allowed: true, remaining: -1, unlimited: true };
    }

    let cost = ACTION_COSTS[actionType];
    
    // First page generation is free
    if (actionType === 'page_generation' && isFirstPageGeneration) {
      cost = 0;
    }

    if (cost === 0) {
      return { allowed: true, remaining: available, unlimited: false };
    }

    try {
      const { data, error } = await supabase.rpc('track_ai_action', {
        p_user_id: userId,
        p_action_type: actionType,
        p_action_cost: cost,
        p_page_id: pageId || null,
        p_section_type: sectionType || null,
      });

      if (error) throw error;

      const result = data as unknown as ActionResult;
      
      // Refresh usage data
      await fetchUsage();
      await fetchUsageLog();

      return result;
    } catch (err) {
      console.error('Error tracking action:', err);
      return { allowed: false, remaining: available, unlimited: false };
    }
  }, [userId, isUnlimited, available, fetchUsage, fetchUsageLog]);

  // Request grace actions
  const requestGraceActions = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!userId) {
      return { success: false, error: 'Not logged in' };
    }

    if (usage?.grace_actions_given) {
      return { success: false, error: 'Grace actions already used this billing period' };
    }

    try {
      const { data, error } = await supabase.rpc('grant_grace_actions', {
        p_user_id: userId,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      
      if (result.success) {
        await fetchUsage();
      }

      return result;
    } catch (err) {
      console.error('Error requesting grace actions:', err);
      return { success: false, error: 'Failed to grant grace actions' };
    }
  }, [userId, usage?.grace_actions_given, fetchUsage]);

  // Get action cost
  const getActionCost = useCallback((actionType: AIActionType, isFirstPageGeneration = false): number => {
    if (actionType === 'page_generation' && isFirstPageGeneration) {
      return 0;
    }
    return ACTION_COSTS[actionType];
  }, []);

  return {
    usage,
    usageLog,
    loading,
    available,
    limit,
    percentRemaining,
    daysUntilReset,
    isUnlimited,
    isPro,
    isLowBalance,
    isZeroBalance,
    dontShowConfirm,
    setDontShowConfirm,
    checkAction,
    trackAction,
    requestGraceActions,
    getActionCost,
    refreshUsage: fetchUsage,
  };
}

export default useAIActions;

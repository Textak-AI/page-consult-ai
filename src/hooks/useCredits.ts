import { useMemo, useCallback } from 'react';
import { useAIActions, AIActionType } from './useAIActions';

// Extended action costs including fractional costs
export const ACTION_COSTS = {
  research: 1,
  consultation: 2,
  generation: 3,
  revision: 1,
  calculator: 1,
  copy_improve: 0.5,
  // Legacy mappings
  page_generation: 3,
  section_regeneration: 1,
  ai_improvement: 1,
  intelligence_refresh: 2,
  style_change: 1,
} as const;

export type ExtendedActionType = keyof typeof ACTION_COSTS;

export interface CreditInfo {
  available: number;
  used: number;
  total: number;
  purchased: number;
  plan: string;
  resetDate: Date | null;
  isUnlimited: boolean;
  isPro: boolean;
  rollover: number;
}

export function useCredits(userId: string | null) {
  const aiActions = useAIActions(userId);

  const credits: CreditInfo = useMemo(() => ({
    available: aiActions.available,
    used: aiActions.usage?.ai_actions_used ?? 0,
    total: aiActions.limit,
    purchased: (aiActions.usage as any)?.actions_purchased ?? 0,
    plan: aiActions.usage?.plan_tier ?? 'starter',
    resetDate: aiActions.usage?.billing_period_start 
      ? new Date(new Date(aiActions.usage.billing_period_start).getTime() + 30 * 24 * 60 * 60 * 1000)
      : null,
    isUnlimited: aiActions.isUnlimited,
    isPro: aiActions.isPro,
    rollover: aiActions.usage?.ai_actions_rollover ?? 0,
  }), [aiActions.available, aiActions.limit, aiActions.usage, aiActions.isUnlimited, aiActions.isPro]);

  const canAfford = useCallback((amount: number): boolean => {
    if (credits.isUnlimited) return true;
    return credits.available >= amount;
  }, [credits.available, credits.isUnlimited]);

  const getActionCost = useCallback((actionType: ExtendedActionType): number => {
    return ACTION_COSTS[actionType] ?? 1;
  }, []);

  const consumeCredits = useCallback(async (
    actionType: ExtendedActionType,
    projectId?: string,
    description?: string
  ): Promise<boolean> => {
    const cost = getActionCost(actionType);
    
    // Map extended action types to base AIActionType
    let baseActionType: AIActionType = 'ai_improvement';
    if (actionType === 'generation' || actionType === 'page_generation') {
      baseActionType = 'page_generation';
    } else if (actionType === 'revision' || actionType === 'section_regeneration') {
      baseActionType = 'section_regeneration';
    } else if (actionType === 'research' || actionType === 'intelligence_refresh') {
      baseActionType = 'intelligence_refresh';
    } else if (actionType === 'style_change') {
      baseActionType = 'style_change';
    }

    const result = await aiActions.trackAction(baseActionType, projectId);
    return result.allowed;
  }, [aiActions, getActionCost]);

  return {
    credits,
    canAfford,
    getActionCost,
    consumeCredits,
    refetch: aiActions.refreshUsage,
    isLoading: aiActions.loading,
    usageLog: aiActions.usageLog,
    requestGraceActions: aiActions.requestGraceActions,
    dontShowConfirm: aiActions.dontShowConfirm,
    setDontShowConfirm: aiActions.setDontShowConfirm,
  };
}

export default useCredits;

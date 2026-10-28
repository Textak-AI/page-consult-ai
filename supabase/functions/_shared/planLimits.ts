// Single source of truth for per-tier allowances, action costs and Stripe price mapping.
// Read by stripe-webhook, stripe-checkout, create-checkout-session and every credit-enforcing function.
// Values are the ones already defined in the codebase — do not invent new ones here.

export type PlanName = 'starter' | 'founding' | 'pro' | 'agency';
export type PlanTier = 'starter' | 'pro' | 'agency';

// Monthly AI-action allowance per plan, and the plan_tier stored in user_usage.
// 999999 = effectively unlimited (pre-existing value for founding/agency).
export const PLAN_ALLOWANCES: Record<PlanName, { tier: PlanTier; actionsLimit: number }> = {
  starter: { tier: 'starter', actionsLimit: 30 },
  founding: { tier: 'pro', actionsLimit: 999999 },
  pro: { tier: 'pro', actionsLimit: 150 },
  agency: { tier: 'agency', actionsLimit: 999999 },
};

// Signed-up users without a subscription (set by handle_new_user_usage trigger and on cancellation).
export const FREE_ALLOWANCE = PLAN_ALLOWANCES.starter;

// Server-charged action costs (mirror client ACTION_COSTS).
export const ACTION_COSTS = {
  page_generation: 3,
  section_regeneration: 1,
  ai_improvement: 1,
  intelligence_refresh: 2,
  style_change: 1,
} as const;
export type ChargedAction = keyof typeof ACTION_COSTS;

// One-time action packs (price IDs previously hardcoded in stripe-checkout).
export const ACTION_PACKS: Record<string, number> = {
  price_1SfXziFqTTK3LcBFAuEAkGCN: 10,
  price_1SfXziFqTTK3LcBFS8DPaQoe: 25,
  price_1SfXziFqTTK3LcBFw64XlRyF: 50,
};

const LEGACY_SUBSCRIPTION_PRICES: Record<string, PlanName> = {
  price_1SfXwOFqTTK3LcBFMXRpEVcS: 'starter',
  price_1SfXziFqTTK3LcBFhv0PykBc: 'pro',
};

export function subscriptionPriceMap(): Record<string, PlanName> {
  const map: Record<string, PlanName> = { ...LEGACY_SUBSCRIPTION_PRICES };
  const envs: [string, PlanName][] = [
    ['STRIPE_PRICE_STARTER', 'starter'],
    ['STRIPE_PRICE_FOUNDING', 'founding'],
    ['STRIPE_PRICE_PRO', 'pro'],
    ['STRIPE_PRICE_AGENCY', 'agency'],
  ];
  for (const [key, plan] of envs) {
    const id = Deno.env.get(key);
    if (id) map[id] = plan;
  }
  return map;
}

/** Returns null for unknown prices — never grant a paid allowance for an unrecognised price. */
export function planFromPriceId(priceId: string): PlanName | null {
  return subscriptionPriceMap()[priceId] ?? null;
}

export function validSubscriptionPriceIds(): string[] {
  return Object.keys(subscriptionPriceMap());
}

export const LIMIT_REACHED_ERROR = 'limit_reached';

/**
 * Charges the caller's allowance BEFORE work runs, via track_ai_action using the caller's JWT
 * (auth.uid() is validated inside the function). Returns a Response to send back when refused.
 */
// deno-lint-ignore no-explicit-any
export async function chargeOrRefuse(
  userClient: any,
  userId: string,
  action: ChargedAction,
  corsHeaders: Record<string, string>,
  meta: { pageId?: string | null; sectionType?: string | null } = {},
): Promise<Response | null> {
  const { data, error } = await userClient.rpc('track_ai_action', {
    p_user_id: userId,
    p_action_type: action,
    p_action_cost: ACTION_COSTS[action],
    p_page_id: meta.pageId ?? null,
    p_section_type: meta.sectionType ?? null,
  });
  if (error) {
    console.error('💳 [usage] charge failed:', error.message);
    return new Response(JSON.stringify({ success: false, error: 'usage_check_failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (!data?.allowed) {
    console.warn(`💳 [usage] ${LIMIT_REACHED_ERROR} user=${userId} action=${action} remaining=${data?.remaining}`);
    return new Response(JSON.stringify({
      success: false,
      error: LIMIT_REACHED_ERROR,
      message: "You've used all your AI actions this billing period.",
      remaining: data?.remaining ?? 0,
      cost: ACTION_COSTS[action],
    }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  return null;
}

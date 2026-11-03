import { test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { loadEdgeSource } from './helpers/edgeHarness.js';

const read = (p) => readFileSync(p, 'utf8');
// No STRIPE_PRICE_* secrets at all: checkout and the webhook must still know every live price.
const limits = loadEdgeSource('_shared/planLimits.ts', { Deno: { env: { get: () => undefined } } },
  ['planFromPriceId', 'validSubscriptionPriceIds', 'showsBadgeForTier', 'safeReturnUrl', 'PLAN_ALLOWANCES', 'FREE_ALLOWANCE']).exports;

test('every live subscription price in stripe-config is known without STRIPE_PRICE_* secrets', () => {
  const cfg = read('src/lib/stripe-config.ts');
  for (const [, id] of cfg.matchAll(/(?:starter|founding_member|agency): '(price_[A-Za-z0-9]+)'/g)) {
    expect(limits.validSubscriptionPriceIds()).toContain(id);
  }
  expect(limits.planFromPriceId('price_1SjuT7FqTTK3LcBFU2DXqMXN')).toBe('founding');
  expect(limits.planFromPriceId('price_1SjuTnFqTTK3LcBFXdNBr2Oh')).toBe('agency');
});

test('paid Starter is a real step up from free, and any active plan hides the badge', () => {
  expect(limits.PLAN_ALLOWANCES.starter.actionsLimit).toBe(100);
  expect(limits.FREE_ALLOWANCE.actionsLimit).toBe(30);
  expect(limits.showsBadgeForTier('starter', 'active')).toBe(false);
  expect(limits.showsBadgeForTier('starter', 'trialing')).toBe(true);
  expect(limits.showsBadgeForTier('starter', 'past_due')).toBe(true);
  expect(limits.showsBadgeForTier('pro', null)).toBe(false);
  const sql = read('drizzle/migrations/0014_monthly_allowance_renews.sql');
  expect(sql).toMatch(/u\.plan_tier = 'starter' AND COALESCE\(u\.subscription_status, ''\) <> 'active'/);
});

test('checkout return URLs can only point back at the app', () => {
  const allowed = (o) => o === 'https://pageconsult.app';
  expect(limits.safeReturnUrl('https://pageconsult.app/dashboard?checkout=success', 'F', allowed)).toBe('https://pageconsult.app/dashboard?checkout=success');
  expect(limits.safeReturnUrl('https://evil.example/phish', 'F', allowed)).toBe('F');
  expect(limits.safeReturnUrl('javascript:alert(1)', 'F', allowed)).toBe('F');
  expect(limits.safeReturnUrl(undefined, 'F', allowed)).toBe('F');
  for (const f of ['create-checkout-session', 'stripe-checkout']) expect(read(`supabase/functions/${f}/index.ts`)).toMatch(/safeReturnUrl\(/);
});

test('monthly allowances renew: every charge rolls an ended period first, and the balance refreshes before it is shown', () => {
  const sql = read('drizzle/migrations/0014_monthly_allowance_renews.sql');
  const track = sql.slice(sql.indexOf('FUNCTION public.track_ai_action'));
  expect(track.indexOf('PERFORM public.roll_usage_period(p_user_id)')).toBeGreaterThan(0);
  expect(track.indexOf('PERFORM public.roll_usage_period(p_user_id)')).toBeLessThan(track.indexOf('FOR UPDATE'));
  expect(sql).toMatch(/billing_period_end IS NULL OR billing_period_end <= now\(\)/);
  expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.refresh_my_usage\(\) TO authenticated/);
  expect(sql).toMatch(/REVOKE ALL ON FUNCTION public\.roll_usage_period\(uuid\) FROM PUBLIC, anon, authenticated/);
  expect(read('src/hooks/useAIActions.ts')).toMatch(/rpc\('refresh_my_usage'/);
  const journal = JSON.parse(read('drizzle/migrations/meta/_journal.json'));
  expect(journal.entries.map((e) => e.tag)).toContain('0014_monthly_allowance_renews');
});

test('pricing cards describe what Starter actually gets', () => {
  for (const f of ['src/pages/PricingPage.tsx', 'src/components/Pricing.tsx', 'src/components/credits/UpgradeDrawer.tsx']) {
    const s = read(f);
    expect(s).not.toMatch(/3 landing pages per month|Basic templates|Standard generation speed/);
    expect(s).toMatch(/100 AI actions a month/);
  }
});

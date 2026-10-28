import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { ACTION_PACKS, checkoutSessionParams, runChargedWork, refundCharge } from '../supabase/functions/_shared/planLimits.ts';
import { ACTION_PACK_PRICES } from '../src/lib/stripe-config.ts';

const MIGRATION = readFileSync(new URL('../drizzle/migrations/0006_pack_balance_persists_and_refunds.sql', import.meta.url), 'utf8')
  .replace(/--> statement-breakpoint/g, '');
const UID = '11111111-1111-1111-1111-111111111111';

let db;
async function setup() {
  db = new PGlite();
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.uid', true), '')::uuid $$;
    CREATE TYPE public.ai_action_type AS ENUM ('page_generation','section_regeneration');
    CREATE TYPE public.plan_tier AS ENUM ('starter','pro','agency');
    CREATE TABLE public.user_usage (user_id uuid PRIMARY KEY, plan_tier plan_tier NOT NULL DEFAULT 'starter',
      ai_actions_limit int, ai_actions_used int NOT NULL DEFAULT 0, ai_actions_rollover int NOT NULL DEFAULT 0,
      actions_purchased int NOT NULL DEFAULT 0, grace_actions_given boolean NOT NULL DEFAULT false,
      billing_period_start timestamptz DEFAULT now(), billing_period_end timestamptz, updated_at timestamptz);
    CREATE TABLE public.usage_log (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
      action_type ai_action_type NOT NULL, action_cost int NOT NULL, page_id uuid, section_type text, description text,
      created_at timestamptz DEFAULT now());
  `);
  await db.exec(MIGRATION);
  await db.exec(`SET test.uid = '${UID}'`);
}
const usage = async () => (await db.query(`SELECT * FROM user_usage WHERE user_id = $1`, [UID])).rows[0];
const charge = async (cost) => (await db.query(`SELECT track_ai_action($1, 'page_generation', $2) AS r`, [UID, cost])).rows[0].r;
const seed = (used, purchased, end = "now() + interval '10 days'") =>
  db.exec(`INSERT INTO user_usage (user_id, ai_actions_limit, ai_actions_used, actions_purchased, billing_period_end)
           VALUES ('${UID}', 30, ${used}, ${purchased}, ${end})`);

describe('pack balance and spend order (SQL)', () => {
  beforeEach(setup);

  it('pack balance survives the monthly reset while the monthly allowance resets', async () => {
    await seed(30, 25, "now() - interval '1 day'");
    await db.exec(`SELECT reset_monthly_usage()`);
    const u = await usage();
    expect(u.ai_actions_used).toBe(0);
    expect(u.actions_purchased).toBe(25);
  });

  it('spends monthly allowance first and leaves packs untouched while monthly remains', async () => {
    await seed(20, 10);
    const r = await charge(3);
    expect(r).toMatchObject({ allowed: true, from_monthly: 3, from_pack: 0 });
    expect(await usage()).toMatchObject({ ai_actions_used: 23, actions_purchased: 10 });
  });

  it('spills into packs only after the monthly allowance is exhausted', async () => {
    await seed(29, 10);
    const r = await charge(3);
    expect(r).toMatchObject({ allowed: true, from_monthly: 1, from_pack: 2, remaining: 8 });
    expect(await usage()).toMatchObject({ ai_actions_used: 30, actions_purchased: 8 });
  });

  it('refuses when monthly plus pack balance is insufficient', async () => {
    await seed(30, 2);
    expect(await charge(3)).toMatchObject({ allowed: false, remaining: 2 });
  });

  it('refund restores exactly the buckets a charge drew from, once', async () => {
    await seed(29, 10);
    const r = await charge(3);
    const first = (await db.query(`SELECT refund_ai_action($1) AS r`, [r.log_id])).rows[0].r;
    const again = (await db.query(`SELECT refund_ai_action($1) AS r`, [r.log_id])).rows[0].r;
    expect(first).toMatchObject({ refunded: true, actions: 3 });
    expect(again).toMatchObject({ refunded: false });
    expect(await usage()).toMatchObject({ ai_actions_used: 29, actions_purchased: 10 });
  });
});

describe('pack checkout session creation', () => {
  for (const [priceId, actions] of Object.entries(ACTION_PACKS)) {
    it(`${actions}-action pack ${priceId} creates a one-time payment session`, () => {
      const p = checkoutSessionParams({ priceId, customerId: 'cus_1', userId: UID, successUrl: 's', cancelUrl: 'c' });
      expect(p.mode).toBe('payment');
      expect(p.line_items).toEqual([{ price: priceId, quantity: 1 }]);
      expect(p.metadata).toEqual({ user_id: UID, price_id: priceId });
    });
  }
  it('client pack list matches server packs with the real Stripe amounts', () => {
    expect(Object.fromEntries(ACTION_PACK_PRICES.map(p => [p.priceId, p.actions]))).toEqual(ACTION_PACKS);
    expect(ACTION_PACK_PRICES.map(p => [p.actions, p.price])).toEqual([[10, 5], [25, 10], [50, 18]]);
  });
});

describe('refund on AI failure', () => {
  const rpcClient = () => ({ rpc: vi.fn().mockResolvedValue({ data: { refunded: true, actions: 3 }, error: null }) });

  it('refunds the charge when the AI call returns an error status', async () => {
    const admin = rpcClient();
    const res = await runChargedWork(async () => new Response('{}', { status: 500 }), (why) => refundCharge(admin, 'log-1', why));
    expect(res.status).toBe(500);
    expect(admin.rpc).toHaveBeenCalledWith('refund_ai_action', { p_log_id: 'log-1' });
  });

  it('refunds the charge when the AI call throws', async () => {
    const admin = rpcClient();
    await expect(runChargedWork(async () => { throw new Error('anthropic down'); }, (why) => refundCharge(admin, 'log-2', why))).rejects.toThrow();
    expect(admin.rpc).toHaveBeenCalledWith('refund_ai_action', { p_log_id: 'log-2' });
  });

  it('does not refund a successful generation', async () => {
    const admin = rpcClient();
    await runChargedWork(async () => new Response('{}', { status: 200 }), (why) => refundCharge(admin, 'log-3', why));
    expect(admin.rpc).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

globalThis.Deno ??= { env: { get: () => 'test' } };
const { ACTION_COSTS, withCharge } = await import('../supabase/functions/_shared/planLimits.ts');
const { ACTION_COSTS: CLIENT_COSTS } = await import('../src/hooks/useCredits.ts');

const sql = (f) => readFileSync(new URL(`../drizzle/migrations/${f}`, import.meta.url), 'utf8').replace(/--> statement-breakpoint/g, '');
const UID = '22222222-2222-2222-2222-222222222222';
let db;

async function setup() {
  db = new PGlite();
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.uid', true), '')::uuid $$;
    CREATE TYPE public.ai_action_type AS ENUM ('page_generation','section_regeneration','ai_improvement');
    CREATE TYPE public.plan_tier AS ENUM ('starter','pro','agency');
    CREATE TABLE public.user_usage (user_id uuid PRIMARY KEY, plan_tier plan_tier NOT NULL DEFAULT 'starter',
      ai_actions_limit int, ai_actions_used int NOT NULL DEFAULT 0, ai_actions_rollover int NOT NULL DEFAULT 0,
      actions_purchased int NOT NULL DEFAULT 0, grace_actions_given boolean NOT NULL DEFAULT false,
      billing_period_start timestamptz DEFAULT now(), billing_period_end timestamptz, updated_at timestamptz,
      stripe_customer_id text, stripe_subscription_id text, trial_start timestamptz, trial_end timestamptz, subscription_status text);
    CREATE TABLE public.usage_log (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
      action_type ai_action_type NOT NULL, action_cost int NOT NULL, page_id uuid, section_type text, description text,
      created_at timestamptz DEFAULT now());
    CREATE TABLE public.landing_pages (id uuid DEFAULT gen_random_uuid(), user_id uuid, created_at timestamptz DEFAULT now());
  `);
  await db.exec(sql('0006_pack_balance_persists_and_refunds.sql'));
  await db.exec(sql('0007_first_page_free_and_new_action_types.sql'));
  await db.exec(`SET test.uid = '${UID}'`);
  await db.exec(`INSERT INTO user_usage (user_id, ai_actions_limit, ai_actions_used) VALUES ('${UID}', 30, 0)`);
}
const build = async () => (await db.query(`SELECT charge_page_build($1, 3) AS r`, [UID])).rows[0].r;
const usage = async () => (await db.query(`SELECT * FROM user_usage WHERE user_id = $1`, [UID])).rows[0];

describe('first page build free, then 3 actions (SQL)', () => {
  beforeEach(setup);

  it('first build is free and consumed exactly once', async () => {
    const first = await build();
    expect(first).toMatchObject({ allowed: true, free: true });
    const u = await usage();
    expect(u.ai_actions_used).toBe(0);
    expect(u.free_page_build_used_at).not.toBeNull();
  });

  it('second build is charged 3 actions', async () => {
    await build();
    const second = await build();
    expect(second.free).toBeUndefined();
    expect(second).toMatchObject({ allowed: true, from_monthly: 3 });
    expect((await usage()).ai_actions_used).toBe(3);
    const third = await build();
    expect((await usage()).ai_actions_used).toBe(6);
    expect(third.allowed).toBe(true);
  });

  it('a refunded (failed) first build restores the free build', async () => {
    const first = await build();
    await db.query(`SELECT refund_ai_action($1)`, [first.log_id]);
    expect((await usage()).free_page_build_used_at).toBeNull();
    expect(await build()).toMatchObject({ free: true });
  });

  it('accounts that already have a page start with the free build used', async () => {
    const other = '33333333-3333-3333-3333-333333333333';
    const db2 = new PGlite();
    await db2.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT null::uuid $$;
      CREATE TYPE public.ai_action_type AS ENUM ('page_generation'); CREATE TYPE public.plan_tier AS ENUM ('starter','pro','agency');
      CREATE TABLE public.user_usage (user_id uuid PRIMARY KEY, plan_tier plan_tier DEFAULT 'starter', ai_actions_limit int,
        ai_actions_used int DEFAULT 0, ai_actions_rollover int DEFAULT 0, actions_purchased int DEFAULT 0, updated_at timestamptz);
      CREATE TABLE public.usage_log (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid, action_type ai_action_type, action_cost int,
        page_id uuid, section_type text, description text, charged_rollover int DEFAULT 0, charged_monthly int DEFAULT 0, charged_pack int DEFAULT 0, refunded_at timestamptz);
      CREATE TABLE public.landing_pages (id uuid DEFAULT gen_random_uuid(), user_id uuid, created_at timestamptz DEFAULT now());
      INSERT INTO user_usage (user_id) VALUES ('${other}'); INSERT INTO landing_pages (user_id) VALUES ('${other}');`);
    await db2.exec(sql('0007_first_page_free_and_new_action_types.sql'));
    const r = (await db2.query(`SELECT free_page_build_used_at FROM user_usage`)).rows[0];
    expect(r.free_page_build_used_at).not.toBeNull();
  });
});

describe('newly charged operations', () => {
  const NEW = { section_chat: 1, ai_improvement: 1, image_generation: 2, prospect_page: 2, page_build: 3 };

  it('server and client costs match the decided prices', () => {
    for (const [k, v] of Object.entries(NEW)) {
      expect(ACTION_COSTS[k]).toBe(v);
      expect(CLIENT_COSTS[k]).toBe(v);
    }
  });

  function fakeClients(chargeResult) {
    const rpc = vi.fn(async (fn) => fn === 'refund_ai_action'
      ? { data: { refunded: true, actions: 1 }, error: null }
      : { data: chargeResult, error: null });
    const client = { auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) }, rpc };
    return { rpc, createClient: () => client };
  }
  const req = () => new Request('https://x/fn', { method: 'POST', headers: { Authorization: 'Bearer t' }, body: '{}' });

  for (const action of ['section_chat', 'ai_improvement', 'image_generation', 'prospect_page', 'page_build']) {
    it(`${action}: refuses with 402 limit_reached when the allowance is exhausted, without running the work`, async () => {
      const { rpc, createClient } = fakeClients({ allowed: false, remaining: 0 });
      const work = vi.fn();
      const res = await withCharge(req(), action, {}, work, { createClient });
      expect(res.status).toBe(402);
      expect((await res.json()).error).toBe('limit_reached');
      expect(work).not.toHaveBeenCalled();
      expect(rpc.mock.calls[0][0]).toBe(action === 'page_build' ? 'charge_page_build' : 'track_ai_action');
      if (action !== 'page_build') expect(rpc.mock.calls[0][1].p_action_cost).toBe(NEW[action]);
    });

    it(`${action}: refunds the charge when the AI work fails`, async () => {
      const { rpc, createClient } = fakeClients({ allowed: true, log_id: 'log-9' });
      const res = await withCharge(req(), action, {}, async () => new Response('{}', { status: 500 }), { createClient });
      expect(res.status).toBe(500);
      expect(rpc).toHaveBeenCalledWith('refund_ai_action', { p_log_id: 'log-9' });
    });
  }

  it('rejects unauthenticated callers with 401', async () => {
    const client = { auth: { getUser: async () => ({ data: { user: null } }) }, rpc: vi.fn() };
    const res = await withCharge(req(), 'section_chat', {}, vi.fn(), { createClient: () => client });
    expect(res.status).toBe(401);
  });

  it('cached hero-image reads (no forceRegenerate) are not charged', async () => {
    const { rpc, createClient } = fakeClients({ allowed: true });
    const shouldCharge = async (r) => (await r.json())?.forceRegenerate === true;
    const res = await withCharge(req(), 'image_generation', {}, async () => new Response('{}'), { createClient, shouldCharge });
    expect(res.status).toBe(200);
    expect(rpc).not.toHaveBeenCalled();
  });
});

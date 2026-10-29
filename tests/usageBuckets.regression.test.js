import { test, expect } from 'bun:test';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

const uid = '44444444-4444-4444-4444-444444444444';
async function database(used = 0, packs = 10, rollover = 0) {
  const db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth; CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
    CREATE TYPE public.ai_action_type AS ENUM ('page_generation','section_regeneration');
    CREATE TYPE public.plan_tier AS ENUM ('starter','pro','agency');
    CREATE TABLE user_usage(user_id uuid PRIMARY KEY, plan_tier plan_tier DEFAULT 'starter', ai_actions_limit int DEFAULT 30,
      ai_actions_used int DEFAULT 0, ai_actions_rollover int DEFAULT 0, actions_purchased int DEFAULT 0,
      grace_actions_given boolean DEFAULT false, billing_period_start timestamptz, billing_period_end timestamptz, updated_at timestamptz);
    CREATE TABLE usage_log(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid,action_type ai_action_type,action_cost int,
      page_id uuid,section_type text,description text,created_at timestamptz DEFAULT now());
    CREATE TABLE landing_pages(id uuid DEFAULT gen_random_uuid(),user_id uuid,created_at timestamptz DEFAULT now());`);
  for (const file of ['0006_pack_balance_persists_and_refunds.sql','0007_first_page_free_and_new_action_types.sql']) {
    await db.exec(readFileSync(new URL(`../drizzle/migrations/${file}`, import.meta.url), 'utf8').replace(/--> statement-breakpoint/g,''));
  }
  await db.exec(`SET test.uid='${uid}'`);
  await db.query('INSERT INTO user_usage(user_id,ai_actions_used,actions_purchased,ai_actions_rollover) VALUES($1,$2,$3,$4)',[uid,used,packs,rollover]);
  return db;
}
const usage = async db => (await db.query('SELECT ai_actions_used,actions_purchased,ai_actions_rollover,free_page_build_used_at FROM user_usage WHERE user_id=$1',[uid])).rows[0];
test('SQL: overlapping first-build requests consume one free log, then three actions each', async () => {
  const db = await database();
  try {
    const results = await Promise.all(Array.from({ length: 5 }, async () => (await db.query('SELECT charge_page_build($1,3) AS r',[uid])).rows[0].r));
    expect(results.filter(r => r.free === true)).toHaveLength(1); expect(results.every(r => r.allowed)).toBe(true);
    expect((await usage(db)).ai_actions_used).toBe(12);
    const logs = (await db.query('SELECT action_cost,used_free_build FROM usage_log')).rows;
    expect(logs.filter(l => l.used_free_build)).toEqual([{ action_cost: 0, used_free_build: true }]);
    expect(logs.filter(l => !l.used_free_build).map(l => l.action_cost)).toEqual([3,3,3,3]);
  } finally { await db.close(); }
});
for (const fixture of [
  { name: 'monthly only', used: 20, packs: 10, rollover: 0, monthly: 3, pack: 0, rolled: 0 },
  { name: 'pack only', used: 30, packs: 10, rollover: 0, monthly: 0, pack: 3, rolled: 0 },
  { name: 'monthly and pack split', used: 29, packs: 10, rollover: 0, monthly: 1, pack: 2, rolled: 0 },
  { name: 'rollover/monthly/pack split', used: 29, packs: 10, rollover: 1, monthly: 1, pack: 1, rolled: 1 },
]) test(`SQL refund: ${fixture.name} restores only charged buckets, exactly once`, async () => {
  const db = await database(fixture.used, fixture.packs, fixture.rollover);
  try {
    const before = await usage(db);
    const charge = (await db.query("SELECT track_ai_action($1,'page_generation',3) AS r",[uid])).rows[0].r;
    expect(charge).toMatchObject({ allowed: true, from_monthly: fixture.monthly, from_pack: fixture.pack, from_rollover: fixture.rolled });
    expect(await usage(db)).toMatchObject({ ai_actions_used: fixture.used + fixture.monthly, actions_purchased: fixture.packs - fixture.pack, ai_actions_rollover: fixture.rollover - fixture.rolled });
    const refund = (await db.query('SELECT refund_ai_action($1) AS r',[charge.log_id])).rows[0].r;
    expect(refund).toMatchObject({ refunded: true, actions: 3, free_build_restored: false });
    expect(await usage(db)).toEqual(before);
    expect((await db.query('SELECT refund_ai_action($1) AS r',[charge.log_id])).rows[0].r).toEqual({ refunded: false });
    expect(await usage(db)).toEqual(before);
  } finally { await db.close(); }
});
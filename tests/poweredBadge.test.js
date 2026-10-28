import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { showsBadgeForTier, ownerShowsBadge } from '../supabase/functions/_shared/planLimits.ts';

const fakeClient = (tier) => ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: tier ? { plan_tier: tier } : null }) }) }) }) });

describe('badge by plan (prospect + preview functions)', () => {
  it('shows for starter and accounts without a usage row', async () => {
    expect(showsBadgeForTier('starter')).toBe(true);
    expect(await ownerShowsBadge(fakeClient(null), 'u')).toBe(true);
  });
  it('hides for pro (incl. founding, stored as pro) and agency', async () => {
    expect(await ownerShowsBadge(fakeClient('pro'), 'u')).toBe(false);
    expect(await ownerShowsBadge(fakeClient('agency'), 'u')).toBe(false);
  });
});

describe('page_shows_badge (published route, SQL)', () => {
  it('matches the same rule per owner plan', async () => {
    const db = new PGlite();
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
      CREATE TYPE plan_tier AS ENUM ('starter','pro','agency');
      CREATE TABLE user_usage (user_id uuid, plan_tier plan_tier);
      CREATE TABLE published_pages (user_id uuid, slug text, status text);
      CREATE TABLE landing_pages (user_id uuid, slug text, status text, is_published boolean);
      INSERT INTO user_usage VALUES ('00000000-0000-0000-0000-000000000001','starter'),('00000000-0000-0000-0000-000000000002','pro'),('00000000-0000-0000-0000-000000000003','agency');
      INSERT INTO published_pages VALUES ('00000000-0000-0000-0000-000000000001','s','published'),('00000000-0000-0000-0000-000000000002','p','published');
      INSERT INTO landing_pages VALUES ('00000000-0000-0000-0000-000000000003','a','published',true);`);
    await db.exec(readFileSync(new URL('../drizzle/migrations/0008_page_shows_badge.sql', import.meta.url), 'utf8'));
    const q = async (slug) => (await db.query(`SELECT page_shows_badge($1) b`, [slug])).rows[0].b;
    expect(await q('s')).toBe(true);
    expect(await q('p')).toBe(false);
    expect(await q('a')).toBe(false);
    expect(await q('missing')).toBe(true);
  });
});

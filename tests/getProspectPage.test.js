import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../supabase/functions/get-prospect-page/index.ts', import.meta.url), 'utf8');
const executable = new Bun.Transpiler({ loader: 'ts' }).transformSync(source.replace(/^import .*;\r?\n/gm, ''));

test('new CRM prospects are public through display-only projection, without private fields', async () => {
  let handler;
  const privateFields = { email: 'private@example.test', email_body: 'private', email_subject: 'private', context_raw: 'private', context_summary: 'private', meeting_context: 'private' };
  const prospect = { ...privateFields, status: 'new', user_id: 'owner', base_page_id: 'base', first_name: 'Test', company: 'Test Company', job_title: 'Director', personalized_headline: 'Test headline', personalized_subhead: 'Test subhead', personalized_cta_text: 'Talk' };
  const page = { id: 'base', user_id: 'owner', title: 'Base', slug: 'base', sections: [], styles: {}, consultation_data: { businessName: 'Base Company', ...privateFields } };
  const filters = [];
  runInNewContext(executable, {
    serve: cb => { handler = cb; }, Response, ownerShowsBadge: async (_c, owner) => owner !== 'owner', handleCorsPreflightRequest: () => null, getCorsHeaders: () => ({}),
    Deno: { env: { get: () => 'test-only' } },
    createClient: () => ({ from: table => {
      const query = { select: () => query, eq: (key, value) => { filters.push([table, key, value]); return query; }, maybeSingle: async () => ({ data: table === 'prospects' ? prospect : page, error: null }) };
      return query;
    } }),
  });
  const response = await handler(new Request('http://localhost/test', { method: 'POST', body: JSON.stringify({ slug: 'test' }) }));
  expect(response.status).toBe(200);
  const payload = await response.json();
  expect(Object.keys(payload.prospect).sort()).toEqual(['company', 'first_name', 'job_title', 'personalized_cta_text', 'personalized_headline', 'personalized_subhead']);
  expect(payload.page.businessName).toBe('Base Company');
  expect(payload.showBadge).toBe(false);
  for (const key of Object.keys(privateFields)) expect(JSON.stringify(payload)).not.toContain(`"${key}"`);
  expect(filters).toContainEqual(['landing_pages', 'user_id', 'owner']);
  expect(filters.some(([, key]) => key === 'status')).toBe(false);
});
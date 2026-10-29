import { test, expect } from 'bun:test';
import { loadEdgeSource, fakeDb } from './helpers/edgeHarness.js';

function harness(path, { webhook = 'https://webhook.test', outcome = 'ok', format = 'crm', insertError = false, emailFailure = false } = {}) {
  const state = { count: 0, marker: null, claimed: false, calls: [], events: [] };
  const db = fakeDb(op => {
    state.events.push(`${op.table}:${op.kind ?? 'read'}`);
    if (op.kind === 'insert') {
      if (op.table === 'webhook_deliveries') return { data: null, error: null };
      if (insertError) return { data: null, error: new Error('insert failed') };
      state.count++; return { data: { id: `lead-${state.count}`, submitted_at: '2026-10-29T01:07:00Z' }, error: null };
    }
    if (op.kind === 'update') {
      state.marker = op.data.first_lead_email_sent_at; state.claimed = Boolean(state.marker);
      return { data: null, error: null };
    }
    const rows = {
      published_pages: { id: 'published', status: 'published', user_id: 'owner', landing_page_id: 'base', page_title: 'Page title', slug: 'page' },
      landing_pages: { id: 'base', title: 'Page title', first_lead_email_sent_at: state.marker },
      prospects: format === 'crm' ? { id: 'crm-id', user_id: 'owner', base_page_id: 'base', slug: 'prospect' } : null,
      prospect_pages: format === 'legacy' ? { id: 'legacy-id', user_id: 'owner', prospect_company: 'Prospect title', unique_slug: 'prospect', expires_at: '2099-01-01' } : null,
      profiles: { lead_webhook_url: webhook },
    };
    return { data: rows[op.table] ?? null, count: state.count, error: null };
  });
  db.client.auth = { admin: { getUserById: async () => ({ data: { user: { email: 'owner@example.test' } }, error: null }) } };
  const claims = [];
  db.client.rpc = async (fn, args) => {
    claims.push([fn, args]); const granted = !state.claimed;
    if (granted) state.claimed = true;
    return { data: granted, error: null };
  };
  const fetch = async (url, options) => {
    state.calls.push({ url, options, payload: JSON.parse(options.body) }); state.events.push(`fetch:${url}`);
    if (url === 'https://webhook.test') {
      if (outcome === 'network') throw new Error('Network unavailable');
      return new Response('', { status: outcome === 'http' ? 503 : 200 });
    }
    if (url === 'https://api.resend.com/emails') return new Response('{}', { status: emailFailure ? 503 : 200 });
    throw new Error(`Unexpected fetch: ${url}`);
  };
  const Deno = { env: { get: k => ({ RESEND_API_KEY: 'test-only', PUBLIC_SITE_URL: 'https://app.test' })[k] } };
  const webhookFns = loadEdgeSource('_shared/leadWebhook.ts', { fetch }, ['deliverLeadWebhook']).exports;
  const captureFns = loadEdgeSource('_shared/quickpivotCapture.ts', {}, ['captureQuickPivotLead','parseQuickPivotLead']).exports;
  const deliveryFns = loadEdgeSource('_shared/quickpivotDelivery.ts', { ...webhookFns, fetch, Deno }, ['deliverQuickPivotWebhook','sendQuickPivotFirstLead']).exports;
  const edge = loadEdgeSource(`${path}/index.ts`, { ...webhookFns, ...captureFns, ...deliveryFns, fetch,
    createClient: () => db.client, corsHeaders: {}, Deno: { ...Deno, serve: cb => { handler = cb; } } });
  let handler;
  // Deno.serve is captured by the callback above during load; lexical initialization
  // is supplied by the function-scoped declaration below.
  return { ...edge, handler: () => handler, state, queries: db.queries, claims };
}
const request = path => new Request('https://app.test/capture', { method: 'POST', body: JSON.stringify({
  ...(path === 'submit-form' ? { publishedPageId: 'published' } : { prospectSlug: 'prospect' }),
  email: 'lead@example.test', name: 'Provided name', company: 'Provided company', user_id: 'attacker',
}) });
const submit = async (h, path) => { const response = await h.handler()(request(path)); const payload = await response.json(); await h.drain(); return { response, payload }; };

for (const path of ['submit-form','submit-prospect-form']) {
  for (const outcome of ['network','http']) test(`${path}: capture succeeds despite ${outcome} webhook failure, with audit outcome`, async () => {
    const h = harness(path, { outcome }); const { response, payload } = await submit(h, path);
    expect(response.status).toBe(200); expect(payload).toEqual({ success: true, submissionId: 'lead-1' });
    const audit = h.queries.find(q => q.table === 'webhook_deliveries' && q.kind === 'insert');
    expect(audit.data).toMatchObject({ user_id: 'owner', status: 'failed', response_status: outcome === 'http' ? 503 : null, attempt_count: outcome === 'http' ? 1 : 2 });
    expect(h.state.calls.filter(c => c.url === 'https://webhook.test')).toHaveLength(outcome === 'http' ? 1 : 2);
    expect(h.state.events.indexOf(`${path === 'submit-form' ? 'form_submissions' : 'quickpivot_leads'}:insert`)).toBeLessThan(h.state.events.indexOf('fetch:https://webhook.test'));
  });
  test(`${path}: owner without webhook still captures, with no webhook audit or request`, async () => {
    const h = harness(path, { webhook: null }); const { response, payload } = await submit(h, path);
    expect(response.status).toBe(200); expect(payload.success).toBe(true);
    expect(h.state.calls.filter(c => c.url === 'https://webhook.test')).toEqual([]);
    expect(h.queries.filter(q => q.table === 'webhook_deliveries')).toEqual([]);
  });
  test(`${path}: failed insertion schedules neither email nor webhook`, async () => {
    const h = harness(path, { insertError: true }); expect((await submit(h, path)).response.status).toBe(500);
    expect(h.state.calls).toEqual([]); expect(h.claims).toEqual([]);
  });
}
test('submit-form: first email sets null-guarded marker; repeats and non-first count never resend', async () => {
  const h = harness('submit-form', { webhook: null }); await submit(h, 'submit-form');
  expect(h.state.calls.filter(c => c.url.includes('resend'))).toHaveLength(1); expect(h.state.marker).not.toBeNull();
  const marker = h.queries.find(q => q.table === 'landing_pages' && q.kind === 'update');
  expect(marker.filters).toEqual([['id','base'],['first_lead_email_sent_at',null]]);
  await submit(h, 'submit-form'); expect(h.state.calls.filter(c => c.url.includes('resend'))).toHaveLength(1);
  // Force count back to first to independently exercise the saved-marker guard.
  h.state.count = 0; await submit(h, 'submit-form'); expect(h.state.calls.filter(c => c.url.includes('resend'))).toHaveLength(1);
});
test('submit-form: failed first email never marks sent and capture remains successful', async () => {
  const h = harness('submit-form', { emailFailure: true }); expect((await submit(h, 'submit-form')).response.status).toBe(200);
  expect(h.state.marker).toBeNull(); expect(h.queries.filter(q => q.kind === 'update')).toEqual([]);
});
for (const format of ['crm','legacy']) {
  test(`submit-prospect-form ${format}: server ownership, source/slug payload and first-lead idempotency`, async () => {
    const h = harness('submit-prospect-form', { format }); await submit(h, 'submit-prospect-form'); await submit(h, 'submit-prospect-form');
    const insert = h.queries.find(q => q.table === 'quickpivot_leads' && q.kind === 'insert');
    expect(insert.data).toMatchObject({ user_id: 'owner', prospect_slug: 'prospect',
      prospect_id: format === 'crm' ? 'crm-id' : null, prospect_page_id: format === 'legacy' ? 'legacy-id' : null });
    const webhook = h.state.calls.find(c => c.url === 'https://webhook.test');
    expect(Object.keys(webhook.payload).sort()).toEqual(['event','source','prospect_slug','page','lead','submitted_at'].sort());
    expect(webhook.payload).toMatchObject({ source: 'quickpivot', prospect_slug: 'prospect', page: { slug: 'prospect' }, submitted_at: '2026-10-29T01:07:00Z' });
    expect(webhook.payload.lead.user_id).toBeUndefined();
    const emails = h.state.calls.filter(c => c.url.includes('resend')); expect(emails).toHaveLength(1);
    expect(emails[0].options.headers['Idempotency-Key']).toBe(`quickpivot-first-lead-${format === 'crm' ? 'crm-id' : 'legacy-id'}`);
    expect(h.claims).toEqual([['claim_quickpivot_first_lead',{ p_lead_id: 'lead-1' }],['claim_quickpivot_first_lead',{ p_lead_id: 'lead-2' }]]);
  });
  test(`submit-prospect-form ${format}: failed email releases correct first-lead marker without losing capture`, async () => {
    const h = harness('submit-prospect-form', { format, emailFailure: true }); expect((await submit(h, 'submit-prospect-form')).response.status).toBe(200);
    const update = h.queries.find(q => q.kind === 'update'); expect(update.table).toBe(format === 'crm' ? 'prospects' : 'prospect_pages');
    expect(update.data).toEqual({ first_lead_email_sent_at: null }); expect(update.filters).toEqual([['id',format === 'crm' ? 'crm-id' : 'legacy-id']]);
    expect(h.state.claimed).toBe(false);
  });
}
import { test, expect } from 'bun:test';
import { loadEdgeSource, fakeDb } from './helpers/edgeHarness.js';

const privateRow = {
  email: 'private@example.test', email_body: 'private message', email_subject: 'private subject',
  context_raw: 'private raw', context_summary: 'private summary', meeting_context: 'private meeting',
  internal_notes: 'private notes', lead_webhook_url: 'https://private.test', stripe_customer_id: 'cus_private',
  user_id: 'owner', first_lead_email_sent_at: '2026-10-01', future_sensitive_column: 'private future',
};
const base = { ...privateRow, id: 'base', title: 'Display title', slug: 'display', sections: [{ type: 'hero', content: { headline: 'Public headline' } }],
  styles: { theme: {} }, meta_title: 'Public SEO', meta_description: 'Public description', design_intelligence: { mode: 'light' },
  consultation_data: { ...privateRow, businessName: 'Display business' } };
const pageKeys = ['id','title','slug','sections','styles','meta_title','meta_description','businessName'];
const prospectKeys = ['first_name','company','job_title','personalized_headline','personalized_subhead','personalized_cta_text'];
const crm = { ...privateRow, base_page_id: 'base', first_name: 'Provided name', company: 'Provided company', job_title: 'Director',
  personalized_headline: 'Public headline', personalized_subhead: 'Public subhead', personalized_cta_text: 'Contact' };
const legacy = { ...privateRow, id: 'prospect-page', source_landing_page_id: 'base', prospect_company: 'Prospect company',
  unique_slug: 'prospect', expires_at: '2099-01-01', personalized_sections: base.sections };
function keys(value, allowed) { expect(Object.keys(value).sort()).toEqual([...allowed].sort()); }
function noPrivate(payload) {
  function walk(value) {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      expect(Object.hasOwn(privateRow, key)).toBe(false);
      walk(child);
    }
  }
  walk(payload);
}
function harness(path, rows) {
  // Deliberately ignore select: a hostile over-wide row must still be projected.
  const db = fakeDb(op => ({ data: rows[op.table] ?? null, error: null }));
  return { ...loadEdgeSource(path, { createClient: () => db.client,
    ownerShowsBadge: async () => true, handleCorsPreflightRequest: () => null, getCorsHeaders: () => ({}) }), ...db };
}
const post = body => new Request('https://app.test/display', { method: 'POST', body: JSON.stringify(body) });
for (const mode of ['crm', 'prospect-page', 'published-fallback']) {
  test(`get-prospect-page ${mode}: exact documented display fields despite sensitive underlying columns`, async () => {
    const h = harness('get-prospect-page/index.ts', { prospects: mode === 'crm' ? crm : null,
      prospect_pages: mode === 'prospect-page' ? legacy : null, landing_pages: base });
    const response = await h.handler(post({ slug: 'prospect' })); expect(response.status).toBe(200);
    const payload = await response.json();
    keys(payload, mode === 'published-fallback' ? ['prospect','page','showBadge'] : ['prospect','page','canCaptureLead','showBadge']);
    keys(payload.page, pageKeys); noPrivate(payload);
    if (mode === 'crm') { keys(payload.prospect, prospectKeys); expect(payload.prospect).toEqual(Object.fromEntries(prospectKeys.map(k => [k, crm[k]]))); }
    else expect(payload.prospect).toBeNull();
    expect(payload.page.sections).toEqual(base.sections); expect(payload.page.businessName).toBe('Display business');
    const pageQuery = h.queries.find(q => q.table === 'landing_pages');
    keys(Object.fromEntries(pageQuery.select.split(',').map(k => [k, true])), ['id','user_id','title','slug','sections','styles','meta_title','meta_description','consultation_data']);
    if (mode !== 'published-fallback') expect(pageQuery.filters).toContainEqual(['user_id', 'owner']);
  });
}
test('get-preview-link: exact ready projection excludes link, owner and consultation private data', async () => {
  const h = harness('get-preview-link/index.ts', { preview_links: { ...privateRow, landing_page_id: 'base', expires_at: '2099-01-01', token: 'secret-link' }, landing_pages: base });
  const response = await h.handler(post({ token: 'secret-link' })); expect(response.status).toBe(200);
  const payload = await response.json(); keys(payload, ['status','showBadge','page']);
  keys(payload.page, ['sections','styles','design_intelligence','businessName']); noPrivate(payload);
  expect(payload).toEqual({ status: 'ready', showBadge: true, page: { sections: base.sections, styles: base.styles,
    design_intelligence: base.design_intelligence, businessName: 'Display business' } });
  expect(h.queries[0].select).toBe('landing_page_id, expires_at');
  expect(h.queries[0].filters).toEqual([['token','secret-link']]);
  expect(h.queries[1].select).toBe('user_id, sections, styles, design_intelligence, consultation_data');
});
for (const state of ['expired','missing']) {
  test(`get-preview-link ${state}: response is status only, never underlying row`, async () => {
    const h = harness('get-preview-link/index.ts', { preview_links: state === 'missing' ? null : { ...privateRow, expires_at: '2020-01-01' }, landing_pages: base });
    const response = await h.handler(post({ token: 'secret-link' }));
    const payload = await response.json(); expect(payload).toEqual({ status: state === 'missing' ? 'not_found' : 'expired' });
    noPrivate(payload); expect(h.queries).toHaveLength(1);
  });
}
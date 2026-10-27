import { describe, test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../supabase/functions/create-portal-session/index.ts', import.meta.url), 'utf8');
const executable = new Bun.Transpiler({ loader: 'ts' }).transformSync(source.replace(/^import .*;\n/gm, ''));

function harness({ authenticated = true, subscription = null, usage = null } = {}) {
  let handler;
  const lookups = [];
  const requests = [];
  const client = {
    auth: { getUser: async () => ({ data: { user: authenticated ? { id: 'owner-123' } : null }, error: null }) },
    from: (table) => ({ select: () => ({ eq: (field, value) => {
      lookups.push({ table, field, value });
      return { maybeSingle: async () => ({ data: { stripe_customer_id: table === 'subscriptions' ? subscription : usage }, error: null }) };
    } }) }),
  };
  new Function('Deno', 'createClient', 'getCorsHeaders', 'handleCorsPreflightRequest', 'fetch', executable)(
    { serve: (fn) => { handler = fn; }, env: { get: (key) => ({ SUPABASE_URL: 'https://backend.example', SUPABASE_SERVICE_ROLE_KEY: 'test-service', STRIPE_SECRET_KEY: 'test-key', PUBLIC_SITE_URL: 'https://pageconsult.app' })[key] } },
    () => client, () => ({ 'Access-Control-Allow-Origin': 'https://pageconsult.app' }), () => null,
    async (url, options) => { requests.push({ url, options }); return Response.json({ url: 'https://billing.stripe.com/test-session' }); },
  );
  return { call: (authorization) => handler(new Request('https://backend.example/functions/v1/create-portal-session', { method: 'POST', headers: authorization ? { Authorization: authorization } : {} })), lookups, requests };
}

describe('Customer Portal security and account resolution', () => {
  test('missing, malformed, and invalid authentication return 401 without account lookups', async () => {
    for (const authorization of [undefined, 'invalid', 'Bearer invalid']) {
      const h = harness({ authenticated: false });
      const response = await h.call(authorization);
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'unauthorized' });
      expect(h.lookups).toHaveLength(0);
      expect(h.requests).toHaveLength(0);
    }
  });
  test('no customer in either owner-scoped table returns 404 no_billing_account', async () => {
    const h = harness();
    const response = await h.call('Bearer valid');
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'no_billing_account' });
    expect(h.lookups).toEqual(['subscriptions', 'user_usage'].map(table => ({ table, field: 'user_id', value: 'owner-123' })));
    expect(h.requests).toHaveLength(0);
  });
  test('subscriptions wins and the return URL is server-configured /settings', async () => {
    const h = harness({ subscription: 'cus_primary', usage: 'cus_legacy' });
    const response = await h.call('Bearer valid');
    expect(await response.json()).toEqual({ url: 'https://billing.stripe.com/test-session' });
    expect(h.lookups).toHaveLength(1);
    expect(h.requests[0].url).toBe('https://api.stripe.com/v1/billing_portal/sessions');
    expect(h.requests[0].options.method).toBe('POST');
    expect(h.requests[0].options.body.get('customer')).toBe('cus_primary');
    expect(h.requests[0].options.body.get('return_url')).toBe('https://pageconsult.app/settings');
  });
  test('legacy customer is used only when the subscription has no customer', async () => {
    const h = harness({ usage: 'cus_legacy' });
    expect((await h.call('Bearer valid')).status).toBe(200);
    expect(h.requests[0].options.body.get('customer')).toBe('cus_legacy');
    expect(h.lookups.every(lookup => lookup.value === 'owner-123')).toBe(true);
  });
});
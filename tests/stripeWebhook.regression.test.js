import { test, expect } from 'bun:test';
import { loadEdgeSource, fakeDb } from './helpers/edgeHarness.js';
import { customerCases, prices, subscription, event, checkout, invoiceFailed } from './fixtures/stripeEvents.js';

const env = {
  STRIPE_SECRET_KEY: 'test-only', STRIPE_WEBHOOK_SECRET: 'fixture-secret',
  STRIPE_PRICE_STARTER: 'price_fixture_starter', STRIPE_PRICE_FOUNDING: 'price_fixture_founding',
  STRIPE_PRICE_PRO: 'price_fixture_pro', STRIPE_PRICE_AGENCY: 'price_fixture_agency',
};
const limits = loadEdgeSource('_shared/planLimits.ts', { Deno: { env: { get: k => env[k] } } },
  ['PLAN_ALLOWANCES', 'FREE_ALLOWANCE', 'ACTION_PACKS', 'planFromPriceId']).exports;

function harness(fixture, retrieved, existing = null, rejectSignature = false) {
  const { client, queries } = fakeDb(op => ({ data: op.kind ? null : existing, error: null }));
  const grants = [], verifies = [], retrieves = [];
  client.rpc = async (fn, args) => { grants.push([fn, args]); return { data: true, error: null }; };
  class Stripe {
    webhooks = { constructEvent: (body, signature, secret) => {
      verifies.push([body, signature, secret]);
      if (rejectSignature) throw new Error('Invalid signature');
      return fixture;
    } };
    subscriptions = { retrieve: async id => { retrieves.push(id); return retrieved; } };
  }
  const edge = loadEdgeSource('stripe-webhook/index.ts', {
    ...limits, Stripe, createClient: () => client, Deno: { env: { get: k => env[k] } },
  });
  return { ...edge, queries, grants, verifies, retrieves };
}
const request = () => new Request('https://app.test/webhook', {
  method: 'POST', headers: { 'stripe-signature': 'fixture-signature' }, body: 'fixture-raw-body',
});
const writes = h => h.queries.filter(q => q.kind);
const withoutTime = data => { const { updated_at, ...rest } = data; expect(Number.isFinite(Date.parse(updated_at))).toBe(true); return rest; };

for (const customer of customerCases) for (const price of prices) {
  test(`checkout completed: ${customer.label}, ${price.price} maps subscriptions and usage`, async () => {
    const sub = subscription(price.price, customer.user);
    const h = harness(event('checkout.session.completed', checkout(customer.customer)), sub, customer.existing);
    const res = await h.handler(request());
    expect(res.status).toBe(200); expect(await res.json()).toEqual({ received: true });
    expect(h.verifies).toEqual([['fixture-raw-body', 'fixture-signature', 'fixture-secret']]);
    expect(h.retrieves).toEqual(['sub_fixture']);
    expect(limits.planFromPriceId(price.price)).toBe(price.plan);
    const [subWrite, usageWrite] = writes(h);
    expect(writes(h)).toHaveLength(2);
    expect(subWrite.table).toBe('subscriptions'); expect(subWrite.kind).toBe('upsert');
    expect(subWrite.upsertOptions).toEqual({ onConflict: 'user_id' });
    expect(withoutTime(subWrite.data)).toEqual({ user_id: customer.user, stripe_customer_id: customer.customer,
      stripe_subscription_id: sub.id, stripe_price_id: price.price, status: 'active', plan: price.plan ?? 'unknown',
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(), cancel_at_period_end: false });
    expect(usageWrite.table).toBe('user_usage'); expect(usageWrite.filters).toEqual([['user_id', customer.user]]);
    expect(withoutTime(usageWrite.data)).toEqual({ plan_tier: price.tier, ai_actions_limit: price.limit,
      stripe_customer_id: customer.customer, stripe_subscription_id: sub.id });
  });
}
for (const price of prices) for (const status of ['active', 'past_due']) {
  test(`subscription updated: ${price.price}, ${status}`, async () => {
    const sub = { ...subscription(price.price, 'existing-owner', status), cancel_at_period_end: true };
    const h = harness(event('customer.subscription.updated', sub), null, { user_id: 'existing-owner' });
    expect((await h.handler(request())).status).toBe(200);
    const [s, u] = writes(h); expect(writes(h)).toHaveLength(2);
    expect(s.table).toBe('subscriptions'); expect(s.filters).toEqual([['stripe_subscription_id', sub.id]]);
    expect(withoutTime(s.data)).toEqual({ status, stripe_price_id: price.price, plan: price.plan ?? 'unknown',
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(), cancel_at_period_end: true });
    expect(u.table).toBe('user_usage'); expect(u.filters).toEqual([['user_id', 'existing-owner']]);
    expect(withoutTime(u.data)).toEqual({ plan_tier: status === 'active' ? price.tier : 'starter',
      ai_actions_limit: status === 'active' ? price.limit : 30 });
  });
}
test('subscription deleted resets only the matched owner to the free allowance', async () => {
  const h = harness(event('customer.subscription.deleted', subscription(prices[2].price)), null, { user_id: 'existing-owner' });
  expect((await h.handler(request())).status).toBe(200);
  const [s, u] = writes(h); expect(writes(h)).toHaveLength(2);
  expect(s.table).toBe('subscriptions'); expect(s.filters).toEqual([['stripe_subscription_id', 'sub_fixture']]);
  expect(withoutTime(s.data)).toEqual({ status: 'canceled' });
  expect(u.table).toBe('user_usage'); expect(u.filters).toEqual([['user_id', 'existing-owner']]);
  expect(withoutTime(u.data)).toEqual({ plan_tier: limits.FREE_ALLOWANCE.tier, ai_actions_limit: 30, stripe_subscription_id: null });
});
test('invoice payment failure marks subscription past_due without granting or resetting usage', async () => {
  const h = harness(event('invoice.payment_failed', invoiceFailed));
  expect((await h.handler(request())).status).toBe(200);
  expect(writes(h)).toHaveLength(1);
  const [s] = writes(h); expect(s.table).toBe('subscriptions');
  expect(s.filters).toEqual([['stripe_subscription_id', 'sub_fixture']]);
  expect(withoutTime(s.data)).toEqual({ status: 'past_due' });
});
test('unmatched subscription update and invoice without subscription do not write', async () => {
  for (const fixture of [event('customer.subscription.updated', subscription(prices[0].price)), event('invoice.payment_failed', { id: 'in_none' })]) {
    const h = harness(fixture); expect((await h.handler(request())).status).toBe(200); expect(writes(h)).toEqual([]);
  }
});
test('invalid Stripe signature never reaches DB writes', async () => {
  const h = harness(event('invoice.payment_failed', invoiceFailed), null, null, true);
  const res = await h.handler(request()); expect(res.status).toBe(400); await res.text();
  expect(h.queries).toEqual([]); expect(h.grants).toEqual([]);
});
for (const [price, actions] of Object.entries(limits.ACTION_PACKS)) {
  test(`paid pack checkout grants exactly ${actions} through the idempotent RPC`, async () => {
    const h = harness(event('checkout.session.completed', { id: 'cs_pack', mode: 'payment', payment_status: 'paid', metadata: { user_id: 'pack-owner', price_id: price } }));
    expect((await h.handler(request())).status).toBe(200);
    expect(h.grants).toEqual([['grant_action_pack', { p_session_id: 'cs_pack', p_user_id: 'pack-owner', p_price_id: price, p_actions: actions }]]);
    expect(writes(h)).toEqual([]);
  });
}
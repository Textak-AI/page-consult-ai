export const customerCases = [
  { label: 'new customer', user: 'new-owner', customer: 'cus_new', existing: null },
  { label: 'existing customer', user: 'existing-owner', customer: 'cus_existing', existing: { user_id: 'existing-owner' } },
];
export const prices = [
  { price: 'price_fixture_starter', plan: 'starter', tier: 'starter', limit: 30 },
  { price: 'price_fixture_founding', plan: 'founding', tier: 'pro', limit: 999999 },
  { price: 'price_fixture_pro', plan: 'pro', tier: 'pro', limit: 150 },
  { price: 'price_fixture_agency', plan: 'agency', tier: 'agency', limit: 999999 },
  { price: 'price_1SfXwOFqTTK3LcBFMXRpEVcS', plan: 'starter', tier: 'starter', limit: 30 },
  { price: 'price_1SfXziFqTTK3LcBFhv0PykBc', plan: 'pro', tier: 'pro', limit: 150 },
  { price: 'price_unrecognised', plan: null, tier: 'starter', limit: 30 },
];
export const subscription = (price, user = 'existing-owner', status = 'active') => ({
  id: 'sub_fixture', metadata: { supabase_user_id: user }, items: { data: [{ price: { id: price } }] },
  status, current_period_start: 1793232000, current_period_end: 1795910400, cancel_at_period_end: false,
});
export const event = (type, object) => ({ id: 'evt_fixture', type, data: { object } });
export const checkout = customer => ({ id: 'cs_fixture', mode: 'subscription', customer, subscription: 'sub_fixture' });
export const invoiceFailed = { id: 'in_fixture', subscription: 'sub_fixture' };
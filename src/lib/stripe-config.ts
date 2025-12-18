export const STRIPE_PRICES = {
  // Subscriptions
  pro_monthly: 'price_1SfXwOFqTTK3LcBFMXRpEVcS',      // $29/mo - 150 actions
  agency_monthly: 'price_1SfXziFqTTK3LcBFhv0PykBc',  // $99/mo - unlimited
  
  // Action Packs (one-time)
  actions_10: 'price_1SfXziFqTTK3LcBFAuEAkGCN',      // $5 - 10 actions
  actions_25: 'price_1SfXziFqTTK3LcBFS8DPaQoe',      // $10 - 25 actions  
  actions_50: 'price_1SfXziFqTTK3LcBFw64XlRyF',      // $18 - 50 actions
} as const;

export const PLAN_DETAILS = {
  starter: {
    name: 'Starter',
    price: 0,
    actions: 30,
    priceId: null, // Free tier, no Stripe
  },
  pro: {
    name: 'Pro',
    price: 29,
    actions: 150,
    priceId: STRIPE_PRICES.pro_monthly,
  },
  agency: {
    name: 'Agency', 
    price: 99,
    actions: 'unlimited' as const,
    priceId: STRIPE_PRICES.agency_monthly,
  },
} as const;

export const ACTION_PACKS = [
  { amount: 10, price: 5, priceId: STRIPE_PRICES.actions_10 },
  { amount: 25, price: 10, priceId: STRIPE_PRICES.actions_25 },
  { amount: 50, price: 18, priceId: STRIPE_PRICES.actions_50 },
] as const;

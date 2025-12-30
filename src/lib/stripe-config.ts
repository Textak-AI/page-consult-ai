export const STRIPE_PRICES = {
  // Subscriptions
  starter: 'price_1SfXwOFqTTK3LcBFMXRpEVcS',        // $29/mo
  founding_member: 'price_1SjuT7FqTTK3LcBFU2DXqMXN', // $69/mo (was $99)
  agency: 'price_1SjuTnFqTTK3LcBFXdNBr2Oh',         // $397/mo
} as const;

export const PLAN_DETAILS = {
  starter: {
    name: 'Starter',
    price: 29,
    priceId: STRIPE_PRICES.starter,
  },
  founding_member: {
    name: 'Founding Member',
    price: 69,
    originalPrice: 99,
    priceId: STRIPE_PRICES.founding_member,
  },
  agency: {
    name: 'Agency', 
    price: 397,
    priceId: STRIPE_PRICES.agency,
  },
} as const;

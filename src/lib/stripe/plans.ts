export const STRIPE_PLANS = {
  STANDARD: {
    priceId: process.env.STRIPE_STANDARD_PRICE_ID!,
    name: "Standard",
    price: 1280,
  },
  PRO: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    name: "Pro",
    price: 2480,
  },
} as const;

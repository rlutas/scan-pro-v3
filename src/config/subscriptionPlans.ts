export const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: "Basic",
    description: "Up to 2 devices",
    price: 100,
    currency: "RON",
    maxDevices: 2,
    priceId: "price_1OHxXkHVlJhYtXEZPxJZWwDK",
    productId: "prod_R7PBABDZhnhzkD"
  },
  STANDARD: {
    name: "Standard",
    description: "Up to 5 devices",
    price: 200,
    currency: "EUR",
    maxDevices: 5,
    priceId: "price_1OHxXkHVlJhYtXEZQwZN0m2K",
    productId: "prod_R7PBmkHBkTZN0m"
  },
  ENTERPRISE: {
    name: "Enterprise",
    description: "Up to 10 devices",
    price: 400,
    currency: "EUR",
    maxDevices: 10,
    priceId: "price_1OHxXkHVlJhYtXEZR7PCrBD7",
    productId: "prod_R7PCrBD78AUQSV"
  }
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

export function getPlanDetails(planName: string) {
  const plan = SUBSCRIPTION_PLANS[planName as SubscriptionPlan];
  if (!plan) {
    return SUBSCRIPTION_PLANS.BASIC; // Default to basic plan if not found
  }
  return plan;
} 
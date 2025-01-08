import { Price } from "@/types/price";

export const pricingData: Price[] = [
  {
    id: "price_1QFAMmLvacXtHRwkOHCxNUAh",
    unit_amount: 10000,
    nickname: "Basic",
    offers: [
      "Access for 2 devices",
      "Basic ID scanning",
      "CSV checks",
      "Email support",
      "Basic reporting",
      "7-day history",
    ],
  },
  {
    id: "price_1QFANULvacXtHRwkDWqqLTsb",
    unit_amount: 20000,
    nickname: "Standard",
    offers: [
      "Access for 5 devices",
      "Advanced scanning",
      "Validation features",
      "Priority email support",
      "Advanced reporting",
      "30-day history",
    ],
  },
  {
    id: "price_1QFAO7LvacXtHRwkNuQnIyrB",
    unit_amount: 40000,
    nickname: "Enterprise",
    offers: [
      "Access for 10 devices",
      "Full features",
      "Priority support",
      "24/7 phone support",
      "Custom reporting",
      "90-day history",
    ],
  },
];

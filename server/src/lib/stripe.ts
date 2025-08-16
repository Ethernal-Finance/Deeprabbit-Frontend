import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.warn('[stripe] STRIPE_SECRET_KEY not set. Stripe features disabled.');
}

export const stripe = secretKey
  ? new Stripe(secretKey, { apiVersion: '2024-06-20' })
  : null;

export const STRIPE_PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY || '';
export const STRIPE_PRICE_YEARLY = process.env.STRIPE_PRICE_YEARLY || '';
export const SUCCESS_URL = process.env.SUCCESS_URL || 'http://localhost:5174/subscribe?status=success';
export const CANCEL_URL = process.env.CANCEL_URL || 'http://localhost:5174/subscribe?status=cancel';
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';




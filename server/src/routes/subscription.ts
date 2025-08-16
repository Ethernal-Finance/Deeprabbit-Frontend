import express, { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthedRequest } from '../middleware/requireAuth';
import { stripe, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY, SUCCESS_URL, CANCEL_URL, STRIPE_WEBHOOK_SECRET } from '../lib/stripe';

export const subscriptionRouter = Router();

// Debug: Check Stripe configuration visibility from the server
subscriptionRouter.get('/config', (_req, res) => {
  return res.json({
    stripeConfigured: Boolean(stripe),
    hasMonthlyPrice: Boolean(STRIPE_PRICE_MONTHLY),
    hasYearlyPrice: Boolean(STRIPE_PRICE_YEARLY),
    successUrl: SUCCESS_URL,
    cancelUrl: CANCEL_URL
  });
});

// Get current subscription status
subscriptionRouter.get('/me', requireAuth, async (req: AuthedRequest, res) => {
	const sub = await prisma.subscription.findFirst({
		where: { userId: req.user!.userId, status: 'active' },
		orderBy: { createdAt: 'desc' }
	});
	return res.json({
		active: Boolean(sub),
		tier: sub?.tier ?? null,
		currentPeriodEnd: sub?.currentPeriodEnd ?? null
	});
});

// Create a checkout session placeholder (to be replaced by Stripe integration)
subscriptionRouter.post('/checkout', requireAuth, async (req: AuthedRequest, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });
    const { tier } = req.body as { tier?: string };
    if (!tier) return res.status(400).json({ error: 'tier required' });

    const price = tier === 'yearly' ? STRIPE_PRICE_YEARLY : STRIPE_PRICE_MONTHLY;
    if (!price) return res.status(500).json({ error: 'Price ID not configured' });

    // Ensure a Stripe customer exists for this user
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    let customerId = user.stripeCustomerId || undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price, quantity: 1 }],
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { userId: user.id, tier }
      },
      metadata: { userId: user.id, tier }
    });

    return res.json({ checkoutUrl: session.url });
  } catch (e) {
    console.error('Checkout error:', e);
    const msg = (e as any)?.message || 'Unknown checkout error';
    return res.status(500).json({ error: 'checkout_failed', message: msg });
  }
});

// Webhook placeholder
// Webhook: use raw body for signature verification
subscriptionRouter.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(500).send();
  const sig = req.headers['stripe-signature'] as string | undefined;
  if (!sig || !STRIPE_WEBHOOK_SECRET) return res.status(400).send();
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata?.userId as string | undefined;
        const tier = session.metadata?.tier as string | undefined;
        const stripeSubscriptionId = session.subscription as string | undefined;
        const priceId = session.display_items?.[0]?.plan?.id || session?.line_items?.data?.[0]?.price?.id;
        if (userId && stripeSubscriptionId) {
          await prisma.subscription.upsert({
            where: { stripeSubscriptionId },
            create: {
              userId,
              tier: tier || 'monthly',
              status: 'active',
              stripeSubscriptionId,
              priceId,
              currentPeriodEnd: null
            },
            update: {
              status: 'active',
              priceId
            }
          });
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = event.data.object as any;
        const stripeSubscriptionId = sub.id as string;
        const priceId = sub.items?.data?.[0]?.price?.id as string | undefined;
        const currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;
        const status = sub.status as string;
        // Find user via customer id
        const customerId = sub.customer as string;
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (user) {
          await prisma.subscription.upsert({
            where: { stripeSubscriptionId },
            create: {
              userId: user.id,
              tier: sub.items?.data?.[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly',
              status,
              stripeSubscriptionId,
              priceId,
              currentPeriodEnd
            },
            update: { status, priceId, currentPeriodEnd }
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const stripeSubscriptionId = sub.id as string;
        await prisma.subscription.updateMany({ where: { stripeSubscriptionId }, data: { status: 'canceled' } });
        break;
      }
      case 'invoice.payment_failed': {
        const sub = event.data.object?.subscription as string | undefined;
        if (sub) await prisma.subscription.updateMany({ where: { stripeSubscriptionId: sub }, data: { status: 'past_due' } });
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error('Webhook handler error', e);
    return res.status(500).send();
  }
  return res.status(204).send();
});

// Temporary route to activate a subscription without payments (for development)
subscriptionRouter.post('/dev/activate', requireAuth, async (req: AuthedRequest, res) => {
	const { tier } = req.body as { tier?: string };
	const created = await prisma.subscription.create({
		data: {
			userId: req.user!.userId,
			tier: tier || 'monthly',
			status: 'active',
			currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
		}
	});
	return res.json({ ok: true, subscriptionId: created.id });
});



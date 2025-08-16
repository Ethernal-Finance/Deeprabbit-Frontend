"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const requireAuth_1 = require("../middleware/requireAuth");
exports.subscriptionRouter = (0, express_1.Router)();
// Get current subscription status
exports.subscriptionRouter.get('/me', requireAuth_1.requireAuth, async (req, res) => {
    const sub = await prisma_1.prisma.subscription.findFirst({
        where: { userId: req.user.userId, status: 'active' },
        orderBy: { createdAt: 'desc' }
    });
    return res.json({
        active: Boolean(sub),
        tier: sub?.tier ?? null,
        currentPeriodEnd: sub?.currentPeriodEnd ?? null
    });
});
// Create a checkout session placeholder (to be replaced by Stripe integration)
exports.subscriptionRouter.post('/checkout', requireAuth_1.requireAuth, async (req, res) => {
    const { tier } = req.body;
    if (!tier)
        return res.status(400).json({ error: 'tier required' });
    // TODO: integrate Stripe and return checkout URL
    return res.json({ checkoutUrl: 'https://example.com/placeholder-checkout' });
});
// Webhook placeholder
exports.subscriptionRouter.post('/webhook', async (_req, res) => {
    // TODO: Verify signature and upsert subscription records
    return res.status(204).send();
});
// Temporary route to activate a subscription without payments (for development)
exports.subscriptionRouter.post('/dev/activate', requireAuth_1.requireAuth, async (req, res) => {
    const { tier } = req.body;
    const created = await prisma_1.prisma.subscription.create({
        data: {
            userId: req.user.userId,
            tier: tier || 'monthly',
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    });
    return res.json({ ok: true, subscriptionId: created.id });
});

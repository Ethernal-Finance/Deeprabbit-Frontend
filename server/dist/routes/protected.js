"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectedRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const requireAuth_1 = require("../middleware/requireAuth");
exports.protectedRouter = (0, express_1.Router)();
exports.protectedRouter.get('/app', requireAuth_1.requireAuth, async (req, res) => {
    const sub = await prisma_1.prisma.subscription.findFirst({
        where: { userId: req.user.userId, status: 'active' }
    });
    if (!sub) {
        return res.status(402).json({ error: 'Subscription required' });
    }
    return res.json({ message: 'Your Application API Placeholder' });
});

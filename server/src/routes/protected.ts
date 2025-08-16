import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthedRequest } from '../middleware/requireAuth';

export const protectedRouter = Router();

protectedRouter.get('/app', requireAuth, async (req: AuthedRequest, res) => {
	const sub = await prisma.subscription.findFirst({
		where: { userId: req.user!.userId, status: 'active' }
	});
	if (!sub) {
		return res.status(402).json({ error: 'Subscription required' });
	}
	return res.json({ message: 'Your Application API Placeholder' });
});



import { Request, Response, NextFunction } from 'express';
import { getCookieName, verifySession } from '../lib/jwt';

export type AuthedRequest = Request & { user?: { userId: string; email: string } };

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
	const token = req.cookies?.[getCookieName()];
	if (!token) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	const payload = verifySession(token);
	if (!payload) {
		return res.status(401).json({ error: 'Invalid session' });
	}
	req.user = payload;
	return next();
}



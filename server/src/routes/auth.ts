import { Router } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getCookieName, signSession } from '../lib/jwt';

export const authRouter = Router();

const credentialsSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8)
});

authRouter.post('/register', async (req, res) => {
	const parse = credentialsSchema.safeParse(req.body);
	if (!parse.success) {
		return res.status(400).json({ error: 'Invalid input' });
	}
	const { email, password } = parse.data;
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		return res.status(409).json({ error: 'Email already registered' });
	}
	const passwordHash = await bcrypt.hash(password, 10);
	const user = await prisma.user.create({ data: { email, passwordHash } });
	const token = signSession({ userId: user.id, email: user.email });
	res.cookie(getCookieName(), token, {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 7 * 24 * 60 * 60 * 1000
	});
	return res.json({ id: user.id, email: user.email });
});

authRouter.post('/login', async (req, res) => {
	const parse = credentialsSchema.safeParse(req.body);
	if (!parse.success) {
		return res.status(400).json({ error: 'Invalid input' });
	}
	const { email, password } = parse.data;
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) {
		return res.status(401).json({ error: 'Invalid credentials' });
	}
	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) {
		return res.status(401).json({ error: 'Invalid credentials' });
	}
	const token = signSession({ userId: user.id, email: user.email });
	res.cookie(getCookieName(), token, {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 7 * 24 * 60 * 60 * 1000
	});
	return res.json({ id: user.id, email: user.email });
});

authRouter.post('/logout', async (_req, res) => {
	res.clearCookie(getCookieName());
	return res.json({ ok: true });
});

authRouter.get('/me', async (req, res) => {
	const token = req.cookies?.[getCookieName()];
	if (!token) return res.json({ user: null });
	// token integrity checked on protected routes; here just decode for UX
	return res.json({ user: true });
});

// DEV ONLY: direct login without password for local testing
authRouter.post('/dev-login', async (req, res) => {
    const isDev = process.env.NODE_ENV !== 'production';
    const allowInProd = process.env.DEV_AUTH_ALLOW_PROD === 'true';
    if (!isDev && !allowInProd) {
        return res.status(403).json({ error: 'Dev login disabled in production' });
    }

    const emailSchema = z.object({ email: z.string().email(), secret: z.string().optional() });
    const parsed = emailSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

    const { email, secret } = parsed.data;
    if (process.env.DEV_AUTH_SECRET && secret !== process.env.DEV_AUTH_SECRET) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        const random = Math.random().toString(36).slice(2);
        const passwordHash = await bcrypt.hash(random, 10);
        user = await prisma.user.create({ data: { email, passwordHash } });
    }

    const token = signSession({ userId: user.id, email: user.email });
    res.cookie(getCookieName(), token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.json({ id: user.id, email: user.email });
});



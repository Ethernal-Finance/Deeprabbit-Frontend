"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const jwt_1 = require("../lib/jwt");
exports.authRouter = (0, express_1.Router)();
const credentialsSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8)
});
exports.authRouter.post('/register', async (req, res) => {
    const parse = credentialsSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Invalid input' });
    }
    const { email, password } = parse.data;
    const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma_1.prisma.user.create({ data: { email, passwordHash } });
    const token = (0, jwt_1.signSession)({ userId: user.id, email: user.email });
    res.cookie((0, jwt_1.getCookieName)(), token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.json({ id: user.id, email: user.email });
});
exports.authRouter.post('/login', async (req, res) => {
    const parse = credentialsSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Invalid input' });
    }
    const { email, password } = parse.data;
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!ok) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = (0, jwt_1.signSession)({ userId: user.id, email: user.email });
    res.cookie((0, jwt_1.getCookieName)(), token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.json({ id: user.id, email: user.email });
});
exports.authRouter.post('/logout', async (_req, res) => {
    res.clearCookie((0, jwt_1.getCookieName)());
    return res.json({ ok: true });
});
exports.authRouter.get('/me', async (req, res) => {
    const token = req.cookies?.[(0, jwt_1.getCookieName)()];
    if (!token)
        return res.json({ user: null });
    // token integrity checked on protected routes; here just decode for UX
    return res.json({ user: true });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jwt_1 = require("../lib/jwt");
function requireAuth(req, res, next) {
    const token = req.cookies?.[(0, jwt_1.getCookieName)()];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const payload = (0, jwt_1.verifySession)(token);
    if (!payload) {
        return res.status(401).json({ error: 'Invalid session' });
    }
    req.user = payload;
    return next();
}

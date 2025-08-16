"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = require("./routes/auth");
const subscription_1 = require("./routes/subscription");
const protected_1 = require("./routes/protected");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});
app.use('/api/auth', auth_1.authRouter);
app.use('/api/subscriptions', subscription_1.subscriptionRouter);
app.use('/api/protected', protected_1.protectedRouter);
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import expressRaw from 'express';
import { authRouter } from './routes/auth';
import { subscriptionRouter } from './routes/subscription';
import { protectedRouter } from './routes/protected';

const app = express();

// Allow common local dev origins so cookies can be set from Vite even if the port changes
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedEnv = process.env.CLIENT_ORIGIN;
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    const isLocalLan = /^http:\/\/192\.168\./.test(origin);
    if (origin === 'http://localhost:5173' || origin === 'http://localhost:5174' || isLocalhost || isLocalLan || origin === allowedEnv) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
};

app.use(cors(corsOptions));
// Stripe webhook needs raw body BEFORE json body parsing
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
	res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/protected', protectedRouter);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
	console.log(`Server listening on http://localhost:${port}`);
});



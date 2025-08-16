// Quick test: dev-login then request a Stripe checkout session
const BASE = process.env.BASE_URL || 'http://localhost:4000';

let cookie = '';
async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (cookie) headers['Cookie'] = cookie;
  const resp = await fetch(url, { ...options, headers });
  const setCookie = resp.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  let body = null;
  try { body = await resp.json(); } catch (_) {}
  return { status: resp.status, body };
}

(async () => {
  const email = `stripe-dev+${Date.now()}@example.com`;
  const login = await request('/api/auth/dev-login', { method: 'POST', body: JSON.stringify({ email }) });
  if (login.status !== 200) throw new Error('Dev login failed: ' + JSON.stringify(login.body));

  const checkout = await request('/api/subscriptions/checkout', { method: 'POST', body: JSON.stringify({ tier: 'monthly' }) });
  if (checkout.status !== 200 || !checkout.body?.checkoutUrl) {
    throw new Error('Checkout failed: ' + JSON.stringify(checkout.body));
  }
  console.log('Open this checkout URL in your browser:\n' + checkout.body.checkoutUrl);
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});




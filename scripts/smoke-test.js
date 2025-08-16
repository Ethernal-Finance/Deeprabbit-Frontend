// Node 18+ required (global fetch)

const BASE = process.env.BASE_URL || 'http://localhost:4000';

let cookie = '';

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (cookie) headers['Cookie'] = cookie;
  const resp = await fetch(url, { ...options, headers });
  const setCookie = resp.headers.get('set-cookie');
  if (setCookie) {
    // Keep only the cookie pair before semicolon
    const pair = setCookie.split(';')[0];
    cookie = pair;
  }
  let body = null;
  try {
    body = await resp.json();
  } catch (_) {}
  return { status: resp.status, body };
}

function randomEmail() {
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, '');
  return `tester+${ts}@example.com`;
}

(async () => {
  const output = {};

  output.health = await request('/api/health');

  const email = randomEmail();
  const password = 'Password123!';
  output.register = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  output.subBefore = await request('/api/subscriptions/me');

  output.activate = await request('/api/subscriptions/dev/activate', {
    method: 'POST',
    body: JSON.stringify({ tier: 'monthly' })
  });

  output.protected = await request('/api/protected/app');

  console.log(JSON.stringify(output, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});




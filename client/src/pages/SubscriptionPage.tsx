import React from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export function SubscriptionPage() {
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const startDevSubscription = async (tier: string) => {
    setError(null);
    const res = await fetch(`${API_BASE}/api/subscriptions/dev/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tier })
    });
    if (!res.ok) {
      setError('Failed to activate subscription');
      return;
    }
    navigate('/app');
  };

  const startStripeCheckout = async (tier: 'monthly' | 'yearly') => {
    setError(null);
    const res = await fetch(`${API_BASE}/api/subscriptions/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tier })
    });
    if (!res.ok) {
      setError('Failed to create checkout session');
      return;
    }
    const data = await res.json();
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    }
  };

  return (
    <section style={{ maxWidth: 900, margin: '2rem auto', padding: '1rem' }}>
      <h2>Choose your plan</h2>
      <p style={{ color: '#555' }}>This page includes placeholders for payment integration (e.g., Stripe checkout).</p>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ border: '1px solid #eee', borderRadius: 12, padding: '1rem' }}>
          <h3>Monthly</h3>
          <p>$10 / month</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => startDevSubscription('monthly')}>Dev-Activate</button>
            <button onClick={() => startStripeCheckout('monthly')}>Checkout</button>
          </div>
        </div>
        <div style={{ border: '1px solid #eee', borderRadius: 12, padding: '1rem' }}>
          <h3>Yearly</h3>
          <p>$100 / year</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => startDevSubscription('yearly')}>Dev-Activate</button>
            <button onClick={() => startStripeCheckout('yearly')}>Checkout</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fafafa', border: '1px dashed #ddd', borderRadius: 8 }}>
        <strong>Payment Integration Placeholder:</strong>
        <ul>
          <li>Create checkout session → redirect to Stripe</li>
          <li>Handle success/cancel callbacks</li>
          <li>Stripe webhook updates subscription records</li>
        </ul>
      </div>
    </section>
  );
}



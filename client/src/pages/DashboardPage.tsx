import React from 'react';
import { useAuth } from '../state/useAuth';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

type Status = { active: boolean; tier: string | null; currentPeriodEnd: string | null };

export function DashboardPage() {
  const { user } = useAuth();
  const [status, setStatus] = React.useState<Status | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE}/api/subscriptions/me`, { credentials: 'include' });
      if (res.ok) setStatus(await res.json());
    })();
  }, []);

  return (
    <section style={{ maxWidth: 720, margin: '2rem auto', padding: '1rem' }}>
      <h2>Dashboard</h2>
      <div style={{ marginTop: '0.5rem' }}>Signed in as: <strong>{user?.email ?? 'Guest'}</strong></div>
      <div style={{ marginTop: '1rem' }}>
        <h3>Subscription</h3>
        {status ? (
          status.active ? (
            <div>Active plan: <strong>{status.tier}</strong>{status.currentPeriodEnd ? ` (until ${new Date(status.currentPeriodEnd).toLocaleDateString()})` : ''}</div>
          ) : (
            <div>No active subscription. Visit the Subscribe page to activate.</div>
          )
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </section>
  );
}




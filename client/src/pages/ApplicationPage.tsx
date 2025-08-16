import React from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export function ApplicationPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE}/api/protected/app`, { credentials: 'include' });
      if (res.status === 401) {
        navigate('/auth');
        return;
      }
      if (res.status === 402) {
        navigate('/subscribe');
        return;
      }
      if (!res.ok) {
        setError('Failed to load protected resource');
        return;
      }
      setLoaded(true);
    })();
  }, [navigate]);

  return (
    <section style={{ maxWidth: 900, margin: '2rem auto', padding: '1rem' }}>
      <h2>Your Application Here</h2>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      {loaded && (
        <div style={{ marginTop: '1rem', color: '#555' }}>
          This page is protected. Replace this with your app UI.
        </div>
      )}
    </section>
  );
}




import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <section style={{ padding: '4rem 1rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Build faster with a subscription-gated app shell</h1>
      <p style={{ color: '#555', maxWidth: 720, margin: '0 auto 2rem' }}>
        A clean starting point with authentication, subscription gating, and a protected application area.
      </p>
      <Link to="/auth" style={{ background: '#111', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: 8, textDecoration: 'none' }}>
        Sign Up
      </Link>
    </section>
  );
}



